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
	let name = req.body.name
	if (!name) return res.status(400).end()

	const newClass = new Classes({
		name,
		teacher: res.locals.user._id,
		code: hat(8)
	})

	try {
		let classObject = await newClass.save()

		await Teachers.updateOne(
			{ _id: res.locals.user._id },
			{ $push: { classes: classObject._id } }
		).exec()

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
