'use strict'

// dependencies
const schemas = require('./schemas')
const sockets = require('./sockets')
const auth = require('./auth')
const helper = require('sendgrid').mail

// mongoose models
const { Teachers, Classes, Students, ProblemSets } = schemas

// helper function
const validateInput = (...parameters) => {
	for (var i = 0; i < parameters.length; i++) {
		if (!parameters[i]) return false
	}
	return true
}

const hat = (length = 32) => {
	var text = ''
	var possible = 'abcdef0123456789'

	for (var i = 0; i < length; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length))

	return text
}

// route controllers
exports.login = (req, res) => {
	var user = res.locals.user
	req.session._id = user._id

	res.status(200).end()
}

exports.logout = (req, res) => {
	req.session.destroy(_ => {
		res.status(200).end()
	})
}

exports.registerTeacher = async (req, res) => {
	let { name, email, school, password } = req.body
	if (!validateInput(name, email, school, password))
		return res.status(400).end()

	let existingTeacher = await Teachers.findOne({ email }).exec()
	if (existingTeacher) return res.status(409)

	let passHashed = await auth.hash(password)

	const newTeacher = new Teachers({
		name,
		email,
		school,
		passHashed
	})

	try {
		await newTeacher.save()
		res.status(200).end()
	} catch (err) {
		console.log(err)
		res.status(500).end()
	}
}

exports.registerStudent = async (req, res) => {
	let { name, email, password } = req.body
	if (!validateInput(name, email, password)) return res.status(400).end()

	let existingStudent = await Students.findOne({ email }).exec()
	if (existingStudent) return res.status(409)

	let passHashed = await auth.hash(password)

	const newStudent = new Students({
		name,
		email,
		passHashed
	})

	try {
		await newStudent.save()
		res.status(200).end()
	} catch (err) {
		console.log(err)
		res.status(500).end()
	}
}

// teacher routes
exports.createClass = async (req, res) => {
	let teacher = res.locals.user
	let name = req.body.name
	if (!name) return res.status(400).end()

	let code = hat(8)
	while ((await Classes.findOne({ code })) !== null) code = hat(8)

	const newClass = new Classes({
		name,
		teacher: teacher._id,
		code: hat(8)
	})

	try {
		let classObject = await newClass.save()

		teacher.classes.push(classObject._id)
		await teacher.save()

		res.status(200).end()
	} catch (err) {
		console.log(err)
		res.status(500).end()
	}
}

exports.createProblemSet = async (req, res) => {
	let { name, problems, classId } = req.body
	if (!name || !problems || !classId) return res.status(400).end()

	const newProblemSet = new ProblemSets({
		name,
		date: new Date(),
		classId,
		problems
	})

	try {
		let problemSetObject = await newProblemSet.save()

		await Classes.updateOne(
			{ _id: classId },
			{ $push: { problemSets: problemSetObject._id } }
		).exec()

		res.status(200).end()
	} catch (err) {
		console.log(err)
		res.status(500).end()
	}
}

exports.executeProblemSet = async (req, res) => {
	let problemSetId = req.body.problemSetId

	// check that the problem set hasn't been executed already
	let problemSet = await ProblemSets.findOne({ _id: problemSetId }).exec()
	if (problemSet.executionDate) return res.status(409).end()

	// activate the problemset
	problemSet.executionDate = new Date()
	problemSet.currentProblem = 0

	await problemSet.save()

	// set this problemset as active in the class
	await Classes.updateOne(
		{ _id: problemSet.classId },
		{ $set: { currentProblemSet: problemSetId } }
	).exec()

	// TODO: socket push a start command to the student clients

	res.status(200).end()
}

exports.startNextProblem = async (req, res) => {
	let classId = req.body.classId

	let classObj = await Classes.findOne({ _id: classId }).exec()

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

		// TODO: socket push completion to student clients

		res.status(204).end()
	} else {
		// update the problem number
		problemSet.currentProblem++
		await problemSet.save()

		// TODO: socket push next problem to student clients

		res.status(200).end()
	}
}

exports.fetchClasses = async (req, res) => {
	res.status(200).json(res.locals.user.classes)
}

exports.fetchClass = async (req, res) => {
	let classId = req.query.classId

	let classObj = await Classes.findOne({ _id: classId })
		.populate('students')
		.populate('problemSets')
		.populate('currentProblemSet')
		.exec()

	res.status(200).json(classObj)
}

exports.fetchProblemSets = async (req, res) => {
	let classId = req.query.classId

	// TODO: test that this population of student actually works
	let classObj = await Classes.findOne({ _id: classId })
		.populate({
			path: 'problemSets',
			populate: { path: 'problems.responses.student' }
		})
		.exec()

	res.status(200).json({
		problemSets: classObj.problemSets,
		currentProblemSet: classObj.currentProblemSet
	})
}

exports.fetchProblemSet = async (req, res) => {
	let problemSetId = req.query.problemSetId

	let rawProblemSet = await ProblemSets.findOne({ _id: problemSetId })
		.populate('classId')
		.populate('problems.responses.student')
		.exec()

	let problemSet = JSON.parse(JSON.stringify(rawProblemSet))
	problemSet.class = problemSet.classId
	problemSet.classId = problemSet.class._id

	// WARNING: classId is the populated class object!
	res.status(200).json(problemSet)
}

exports.joinClass = async (req, res) => {
	let student = res.locals.user
	let code = req.body.code

	let classObj = await Classes.findOne({ code }).exec()

	if (!classObj) return res.status(404).end()

	// add student to class
	classObj.students.push(student._id)
	await classObj.save()

	// add class to student
	student.classes.push(classObj._id)
	await student.save()

	res.status(200).end()
}

exports.getQuestion = async (req, res) => {
	let classId = req.query.classId
	let classObj = await Classes.findOne({ _id: classId }).exec()

	let problemSet = await ProblemSets.findOne({
		_id: classObj.currentProblemSet
	}).exec()
	if (!problemSet || problemSet.currentProblem === null) return res.status(404)

	let problem = JSON.parse(
		JSON.stringify(problemSet.problems[problemSet.currentProblem])
	)
	delete problem.responses
	delete problem.correct

	res.status(200).json(problem)
}

exports.answer = async (req, res) => {
	let { answer, classId } = req.body

	let classObj = await Classes.findOne({ _id: classId }).exec()
	if (!classObj.currentProblemSet) return res.status(404).end()

	let problemSet = await ProblemSets.findOne({
		_id: classObj.currentProblemSet
	}).exec()
	if (
		!problemSet ||
		!problemSet.executionDate ||
		problemSet.currentProblem === null
	)
		return res.status(404).end()

	// add answer to the problemSet's current problem
	let currentProblem = problemSet.problems[problemSet.currentProblem]
	if (answer < 0 || answer >= currentProblem.choices.length)
		return res.status(400) // check if answer is valid

	currentProblem.responses.push({
		student: res.locals.user._id,
		response: answer
	})

	await problemSet.save()
	res.status(200).end()
}
