'use strict'

// dependencies
const auth = require('../helpers/auth')
const Teachers = require('../models/teacher')
const Students = require('../models/student')

exports.authenticate = async (req, res, next) => {
	// check for login credentials first
	let email = req.body.email
	let password = req.body.password

	// if no credentials, check if session exists
	if (!email || !password) {
		// check for session ID
		let _id = req.session._id

		// if _id doesnt exists, return 401
		if (!_id) return res.status(401).end()

		const teacher = await Teachers.findOne({ _id })
			.populate('classes')
			.exec()

		const student = await Students.findOne({ _id })
			.populate({
				path: 'classes',
				select: ['_id', 'name'],
				populate: { path: 'teacher', select: ['name', 'email'] }
			})
			.exec()

		if ((teacher && student) || !(teacher || student))
			return res.status(500).end()

		req.user = teacher ? teacher : student
		req.userType = teacher ? 'teacher' : 'student'

		return next()
	}

	// logging in with creds
	let teacher = await Teachers.findOne({ email }).exec()
	let student = await Students.findOne({ email }).exec()

	if ((teacher && student) || !(teacher || student))
		return res.status(500).end()

	// determine if credentails are for teacher or student
	let { user, code } = teacher
		? { user: teacher, code: 200 }
		: { user: student, code: 201 }

	// check credentials
	let valid = await auth.check(password, user.passHashed)
	if (valid) {
		// log user in if valid
		req.session.authenticated = true
		req.session._id = user._id

		res.status(code).end() // status 200 for teacher, 201 for student
	} else {
		res.status(401).end()
	}
}

exports.teacher = (req, res, next) => {
	if (req.userType === 'teacher') next()
	else res.status(403).end()
}

exports.student = (req, res, next) => {
	if (req.userType === 'student') next()
	else res.status(403).end()
}
