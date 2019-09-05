'use strict'

const { validateInput } = require('../helpers/index')

const Classes = require('../models/class')
const ProblemSets = require('../models/problemset')

exports.joinClass = async (req, res) => {
	let student = req.user
	let { code } = req.body

	if (!validateInput(code)) return res.status(400).end()

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

exports.fetchClass = async (req, res) => {
	let classObj = JSON.parse(JSON.stringify(req.class))

	delete classObj.code
	delete classObj.students
	delete classObj.problemSets
	delete classObj.currentProblemSet

	res.status(200).json(classObj)
}

exports.getProblem = async (req, res) => {
	let classObj = req.class

	let problemSet = await ProblemSets.findOne({
		_id: classObj.currentProblemSet
	}).exec()

	if (!problemSet || problemSet.currentProblem === null)
		return res.status(404).end()

	// create deep copy of the problem to remove other responses and correct answer
	let problem = JSON.parse(
		JSON.stringify(problemSet.problems[Math.floor(problemSet.currentProblem)])
	)

	let response = problem.responses.filter(
		res => res.student.toString() === req.user._id.toString()
	)[0]

	problem.response = response
	delete problem.responses
	if (problemSet.currentProblem % 1 === 0) problem.correct = null

	res.status(200).json(problem)
}

exports.answer = async (req, res) => {
	let student = req.user
	let classObj = req.class
	let { answer } = req.body

	if (answer === null || answer === undefined) return res.status(400)
	if (!classObj.currentProblemSet) return res.status(404).end()

	let problemSet = await ProblemSets.findOne({
		_id: classObj.currentProblemSet
	}).exec()

	if (
		!problemSet ||
		!problemSet.executionDate ||
		problemSet.currentProblem === null ||
		problemSet.currentProblem % 1 !== 0
	)
		return res.status(404).end()

	// add answer to the problemSet's current problem
	let currentProblem = problemSet.problems[problemSet.currentProblem]
	if (answer < 0 || answer >= currentProblem.choices.length)
		return res.status(400).end() // check if answer is valid

	let existingResponse = currentProblem.responses.find(
		res => res.student._id.toString() === student._id.toString()
	)

	if (existingResponse) {
		existingResponse.response = answer
	} else {
		currentProblem.responses.push({
			student: student._id,
			response: answer
		})
	}

	await problemSet.save()
	res.status(200).end()
}
