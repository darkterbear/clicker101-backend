'use strict'

let authMiddleware = require('../middlewares/auth')
let classMiddleware = require('../middlewares/class')

let indexController = require('../controllers/index')
let studentController = require('../controllers/students')

module.exports = app => {
	app
		.route('/api/students/join-class')
		.post(authMiddleware.authenticate)
		.post(authMiddleware.student)
		.post(studentController.joinClass)

	app
		.route('/api/students/fetch-classes')
		.get(authMiddleware.authenticate)
		.get(authMiddleware.student)
		.get(indexController.fetchClasses)

	app
		.route('/api/students/get-problem')
		.get(authMiddleware.authenticate)
		.get(authMiddleware.student)
		.get(classMiddleware.class)
		.get(studentController.getProblem)

	app
		.route('/api/students/answer')
		.post(authMiddleware.authenticate)
		.post(authMiddleware.student)
		.post(classMiddleware.class)
		.post(studentController.answer)
}
