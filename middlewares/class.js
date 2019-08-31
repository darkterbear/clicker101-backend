'use strict'

const Classes = require('../models/class')

exports.class = async (req, res, next) => {
	let user = req.user
	let classId = req.body.classId ? req.body.classId : req.query.classId

	if (!classId) res.status(400).end()

	if (user.classes.some(c => c._id.toString() === classId)) {
		req.class = await Classes.findOne({ _id: classId }).exec()
		next()
	} else res.status(404).end()
}
