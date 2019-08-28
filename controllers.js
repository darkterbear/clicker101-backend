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

	// TODO: no duplicate teachers
	let passHashed = await auth.hash(password)

	const newTeacher = new Teachers({
		name,
		email,
		school,
		passHashed,
		classes: []
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

	// TODO: no duplicate students

	let passHashed = await auth.hash(password)

	const newStudent = new Students({
		name,
		email,
		passHashed,
		classes: []
	})

	try {
		await newStudent.save()
		res.status(200).end()
	} catch (err) {
		console.log(err)
		res.status(500).end()
	}
}
