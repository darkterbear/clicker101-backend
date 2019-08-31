'use strict'

let mongoose = require('mongoose')
let Schema = mongoose.Schema

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

module.exports = mongoose.model('Students', StudentSchema, 'students')
