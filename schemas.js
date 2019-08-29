'use strict'

let mongoose = require('mongoose')
let Schema = mongoose.Schema

let TeacherSchema = new Schema(
	{
		name: String,
		email: String,
		school: String,
		passHashed: String,
		classes: {
			type: [
				{
					type: Schema.Types.ObjectId,
					ref: 'Classes'
				}
			],
			default: []
		}
	},
	{ collection: 'teachers' }
)

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

let StudentSchema = new Schema(
	{
		name: String,
		email: String,
		passHashed: String,
		classes: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Classes'
			}
		]
	},
	{ collection: 'students' }
)

let ProblemSetSchema = new Schema(
	{
		name: String,
		date: Date,
		// TODO: different types of problems
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

var Teachers = mongoose.model('Teachers', TeacherSchema, 'teachers')
var Classes = mongoose.model('Classes', ClassSchema, 'classes')
var Students = mongoose.model('Students', StudentSchema, 'students')
var ProblemSets = mongoose.model('ProblemSets', ProblemSetSchema, 'problemSets')

module.exports = {
	Teachers,
	Classes,
	Students,
	ProblemSets
}
