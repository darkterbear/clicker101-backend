'use strict'

let mongoose = require('mongoose')
let Schema = mongoose.Schema

let ClassSchema = new Schema(
	{
		name: String,
		teacher: {
			type: Schema.Types.ObjectId,
			ref: 'Teachers'
		},
		code: String,
		students: {
			type: [
				{
					type: Schema.Types.ObjectId,
					ref: 'Students'
				}
			],
			default: []
		},
		problemSets: {
			type: [
				{
					type: Schema.Types.ObjectId,
					ref: 'ProblemSets'
				}
			],
			default: []
		},
		currentProblemSet: {
			type: Schema.Types.ObjectId,
			ref: 'ProblemSets',
			default: null
		}
	},
	{ collection: 'classes' }
)

module.exports = mongoose.model('Classes', ClassSchema, 'classes')
