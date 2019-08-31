'use strict'

let mongoose = require('mongoose')
let Schema = mongoose.Schema

let TeacherSchema = new Schema(
	{
		name: String,
		email: String,
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

module.exports = mongoose.model('Teachers', TeacherSchema, 'teachers')
