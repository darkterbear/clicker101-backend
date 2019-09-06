'use strict'

let mongoose = require('mongoose')
let Schema = mongoose.Schema

let ProblemSetSchema = new Schema(
	{
		name: String,
		date: Date,
		classId: {
			type: Schema.Types.ObjectId,
			ref: 'Classes'
		},
		problems: [
			{
				question: String,
				choices: [String],
				correct: Number,
				responses: {
					type: [
						{
							student: {
								type: Schema.Types.ObjectId,
								ref: 'Students'
							},
							response: Number
						}
					],
					default: []
				}
			}
		],
		executionDate: {
			type: Date,
			default: null
		},
		currentProblem: {
			type: Number,
			default: null
		}
	},
	{ collection: 'problemSets' }
)

module.exports = mongoose.model('ProblemSets', ProblemSetSchema, 'problemSets')
