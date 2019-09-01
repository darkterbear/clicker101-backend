'use strict'

// dependencies
// const helper = require('sendgrid').mail
const { validateInput } = require('../helpers/index')
const auth = require('../helpers/auth')
const Students = require('../models/student')
const Teachers = require('../models/teacher')

exports.logout = (req, res) => {
	req.session.destroy(_ => {
		res.status(200).end()
	})
}

exports.fetchClasses = async (req, res) => {
	res.status(200).json(req.user.classes)
}

exports.register = async (req, res) => {
	let { name, email, password, type } = req.body
	if (!validateInput(name, email, password, type)) return res.status(400).end()

	let existingStudent = await Students.findOne({ email }).exec()
	let existingTeacher = await Teachers.findOne({ email }).exec()
	if (existingStudent || existingTeacher) return res.status(409)

	let passHashed = await auth.hash(password)
	let Schema = type === 'teacher' ? Teachers : Students

	const newUser = new Schema({
		name,
		email,
		passHashed
	})

	let user = await newUser.save()

	// log user in if valid
	req.session.authenticated = true
	req.session._id = user._id

	res.status(200).end()
}
