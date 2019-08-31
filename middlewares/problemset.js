'use strict'

const ProblemSet = require('../models/problemset')

exports.problemSet = async (req, res, next) => {
	let teacher = req.user
	let problemSetId = req.body.problemSetId
		? req.body.problemSetId
		: req.query.problemSetId

	if (!problemSetId) res.status(400).end()

	if (
		teacher.classes.some(c =>
			c.problemSets.some(psId => psId.toString() === problemSetId)
		)
	) {
		req.problemSet = await ProblemSet.findOne({ _id: problemSetId }).exec()
		next()
	} else {
		res.status(404).end()
	}
}
