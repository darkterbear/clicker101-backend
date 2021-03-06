'use strict'

const { validateInput, hat } = require('../helpers/index')

const Classes = require('../models/class')
const ProblemSets = require('../models/problemset')
const Students = require('../models/student')
const sockets = require('../sockets')

// classes
exports.createClass = async (req, res) => {
	let teacher = req.user
	let { name } = req.body
	if (!name) return res.status(400).end()

	let code = hat()
	while ((await Classes.findOne({ code })) !== null) code = hat()

	const newClass = new Classes({
		name,
		teacher: teacher._id,
		code
	})

	let classObject = await newClass.save()

	teacher.classes.push(classObject._id)
	await teacher.save()

	res.status(200).end()
}

exports.fetchClass = async (req, res) => {
	let classObj = await Classes.findOne({ _id: req.class._id })
		.populate('students')
		.populate('problemSets')
		.populate('currentProblemSet')
		.exec()

	res.status(200).json(classObj)
}

exports.editClassName = async (req, res) => {
	let { name } = req.body
	if (!name) return res.status(400).end()

	let classObj = req.class
	classObj.name = name
	await classObj.save()

	res.status(200).end()
}

exports.deleteClass = async (req, res) => {
	let classObj = req.class

	// remove class from teacher
	let teacher = req.user
	teacher.classes = teacher.classes.filter(
		c => c._id.toString() !== classObj._id.toString()
	)
	await teacher.save()

	// remove class from students
	classObj.students.forEach(async sId => {
		let student = await Students.findOne({ _id: sId })
		student.classes = student.classes.filter(
			c => c._id.toString() !== classObj._id.toString()
		)
		await student.save()
	})

	// delete associated problemSets
	await ProblemSets.deleteMany({ _id: classObj.problemSets }).exec()

	// delete class object
	await Classes.deleteOne({ _id: classObj._id }).exec()

	res.status(200).end()
}

// problem sets
exports.createProblemSet = async (req, res) => {
	let { name, problems, classId } = req.body
	if (!validateInput(name, problems, classId)) return res.status(400).end()

	const newProblemSet = new ProblemSets({
		name,
		date: new Date(),
		classId,
		problems
	})

	let problemSetObject = await newProblemSet.save()

	let classObj = req.class
	classObj.problemSets.push(problemSetObject._id)
	await classObj.save()

	res.status(200).end()
}

exports.fetchProblemSet = async (req, res) => {
	let { problemSetId } = req.query

	let rawProblemSet = await ProblemSets.findOne({ _id: problemSetId })
		.populate('classId')
		.populate('problems.responses.student')
		.exec()

	let problemSet = JSON.parse(JSON.stringify(rawProblemSet))
	problemSet.class = problemSet.classId
	problemSet.classId = problemSet.class._id

	res.status(200).json(problemSet)
}

exports.editProblemSetName = async (req, res) => {
	let { name } = req.body
	if (!name) return res.status(400).end()

	let problemSet = req.problemSet
	problemSet.name = name

	await problemSet.save()

	res.status(200).end()
}

exports.deleteProblemSet = async (req, res) => {
	let problemSet = req.problemSet

	// remove problemSet from class
	let classObj = await Classes.findOne({ _id: problemSet.classId }).exec()
	classObj.problemSets = classObj.problemSets.filter(
		psId => psId.toString() !== problemSet._id.toString()
	)
	await classObj.save()

	// delete problem set object
	await ProblemSets.deleteOne({ _id: problemSet._id }).exec()

	res.status(200).end()
}

exports.addProblem = async (req, res) => {
	let problemSet = req.problemSet
	let { question, choices, correct } = req.body

	problemSet.problems.push({
		question,
		choices,
		correct,
		responses: []
	})

	await problemSet.save()

	res.status(200).end()
}

exports.editProblem = async (req, res) => {
	let problemSet = req.problemSet
	let { problemNumber, question, choices, correct } = req.body

	if (problemNumber < 0 || problemNumber >= problemSet.problems.length)
		return res.status(400).end()

	problemSet.problems[problemNumber] = {
		question,
		choices,
		correct
	}

	await problemSet.save()

	res.status(200).end()
}

exports.deleteProblem = async (req, res) => {
	let problemSet = req.problemSet
	let { problemNumber } = req.body

	if (problemNumber < 0 || problemNumber >= problemSet.problems.length)
		return res.status(400).end()

	problemSet.problems.splice(problemNumber, 1)

	await problemSet.save()

	res.status(200).end()
}

// execution
exports.executeProblemSet = async (req, res) => {
	// check that the problem set hasn't been executed already
	let problemSet = req.problemSet
	if (problemSet.executionDate) return res.status(409).end()

	// activate the problemset
	problemSet.executionDate = new Date()
	problemSet.currentProblem = 0

	await problemSet.save()

	// set this problemset as active in the class
	await Classes.updateOne(
		{ _id: problemSet.classId },
		{ $set: { currentProblemSet: problemSet._id } }
	).exec()

	sockets.progress(problemSet.classId)

	res.status(200).end()
}

exports.stopThisProblem = async (req, res) => {
	let classObj = req.class

	// check that a problem set is running
	if (!classObj.currentProblemSet) return res.status(409).end()

	let problemSet = await ProblemSets.findOne({
		_id: classObj.currentProblemSet
	}).exec()

	// check again that the problemset is running
	if (problemSet.currentProblem === null) return res.status(409).end()

	// if problem is already stopped, do nothing and respond 200
	if (problemSet.currentProblem % 1 !== 0) return res.status(200).end()

	// update the problem number
	problemSet.currentProblem += 0.5
	await problemSet.save()

	sockets.progress(classObj._id)

	res.status(200).end()
}

exports.startNextProblem = async (req, res) => {
	let classObj = req.class

	// check that a problem set is running
	if (!classObj.currentProblemSet) return res.status(409).end()

	let problemSet = await ProblemSets.findOne({
		_id: classObj.currentProblemSet
	}).exec()

	// check again that the problemset is running
	if (problemSet.currentProblem === null) return res.status(409).end()

	if (problemSet.currentProblem >= problemSet.problems.length - 1) {
		// finished problem set
		problemSet.currentProblem = null
		await problemSet.save()

		classObj.currentProblemSet = null
		await classObj.save()

		sockets.progress(classObj._id)

		res.status(200).end()
	} else {
		// update the problem number
		problemSet.currentProblem = Math.ceil(problemSet.currentProblem)
		await problemSet.save()

		sockets.progress(classObj._id)

		res.status(200).end()
	}
}
