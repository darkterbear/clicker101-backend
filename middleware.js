'use strict'

// dependencies
const schemas = require('./schemas')
const auth = require('./auth')

// mongoose models
const { Teachers, Classes, Students, ProblemSets } = schemas

exports.authenticateTeacher = async (req, res, next) => {
	let email = req.body.email
	let password = req.body.password

	if (!email || !password) return res.status(400).end()

	let teacher = await Teachers.findOne({
		email
	}).exec()

	if (!teacher) return res.status(404).end()

	let valid = await auth.check(password, teacher.passHashed)

	if (valid) {
		res.locals.user = teacher
		req.session.authenticated = true
		next()
	} else res.status(401).end()
}

exports.authenticateStudent = async (req, res, next) => {
	let email = req.body.email
	let password = req.body.password

	if (!email || !password) return res.status(400).end()

	let student = await Students.findOne({
		email
	}).exec()

	if (!student) return res.status(404).end()

	let valid = await auth.check(password, student.passHashed)

	if (valid) {
		res.locals.user = student
		req.session.authenticated = true
		next()
	} else res.status(401).end()
}

exports.verifyTeacher = async (req, res, next) => {
	let id = req.session._id

	if (!id) return res.status(401).end()

	try {
		const teacher = await Teachers.findOne({ _id: id })
			.populate({ path: 'classes' })
			.exec()

		res.locals.user = teacher
		next()
	} catch (err) {
		console.log(err)
		res.status(500).end()
	}
}

exports.verifyStudent = async (req, res, next) => {
	let id = req.session._id

	if (!id) return res.status(401).end()

	try {
		const student = await Students.findOne({ _id: id }).exec()

		res.locals.user = student
		next()
	} catch (err) {
		console.log(err)
		res.status(500).end()
	}
}

exports.verifyOwnsClass = async (req, res, next) => {
	let user = res.locals.user
	let classId = req.body.classId
	if (!classId) classId = req.query.classId

	if (!classId) res.status(400).end()

	if (user.classes.some(c => c._id.toString() === classId)) {
		next()
	} else {
		res.status(403).end()
	}
}

exports.verifyOwnsProblemSet = async (req, res, next) => {
	let teacher = res.locals.user
	let problemSetId = req.body.problemSetId
	if (!problemSetId) problemSetId = req.query.problemSetId

	if (!problemSetId) res.status(400).end()

	if (
		teacher.classes.some(c =>
			c.problemSets.some(psId => psId.toString() === problemSetId)
		)
	) {
		next()
	} else {
		res.status(403).end()
	}
}
