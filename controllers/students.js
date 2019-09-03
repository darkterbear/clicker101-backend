'use strict'

const { validateInput } = require('../helpers/index')

const Classes = require('../models/class')
const ProblemSets = require('../models/problemset')

exports.joinClass = async (req, res) => {
	let student = req.user
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

exports.getProblem = async (req, res) => {
	let classObj = req.class

	let problemSet = await ProblemSets.findOne({
		_id: classObj.currentProblemSet
	}).exec()
	if (!problemSet || problemSet.currentProblem === null)
		return res.status(404).end()

	let problem = JSON.parse(
		JSON.stringify(problemSet.problems[problemSet.currentProblem])
	)
	delete problem.responses
	delete problem.correct

	res.status(200).json(problem)
}

exports.answer = async (req, res) => {
	let { answer } = req.body

	let student = req.user
	let classObj = req.class
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
