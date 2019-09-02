'use strict'

let authMiddleware = require('../middlewares/auth')
let classMiddleware = require('../middlewares/class')
let problemSetMiddleware = require('../middlewares/problemset')

let indexController = require('../controllers/index')
let teacherController = require('../controllers/teachers')

module.exports = app => {
	app
		.route('/api/teachers/create-class')
		.post(authMiddleware.authenticate)
		.post(authMiddleware.teacher)
		.post(teacherController.createClass)

	app
		.route('/api/teachers/create-problem-set')
		.post(authMiddleware.authenticate)
		.post(authMiddleware.teacher)
		.post(classMiddleware.class)
		.post(teacherController.createProblemSet)

	app
		.route('/api/teachers/add-problem')
		.post(authMiddleware.authenticate)
		.post(authMiddleware.teacher)
		.post(problemSetMiddleware.problemSet)
		.post(teacherController.addProblem)

	app
		.route('/api/teachers/execute-problem-set')
		.post(authMiddleware.authenticate)
		.post(authMiddleware.teacher)
		.post(problemSetMiddleware.problemSet)
		.post(teacherController.executeProblemSet)

	app
		.route('/api/teachers/start-next-problem')
		.post(authMiddleware.authenticate)
		.post(authMiddleware.teacher)
		.post(classMiddleware.class)
		.post(teacherController.startNextProblem)

	app
		.route('/api/teachers/stop-this-problem')
		.post(authMiddleware.authenticate)
		.post(authMiddleware.teacher)
		.post(classMiddleware.class)
		.post(teacherController.stopThisProblem)

	app
		.route('/api/teachers/fetch-classes')
		.get(authMiddleware.authenticate)
		.get(authMiddleware.teacher)
		.get(indexController.fetchClasses)

	app
		.route('/api/teachers/fetch-class')
		.get(authMiddleware.authenticate)
		.get(authMiddleware.teacher)
		.get(classMiddleware.class)
		.get(teacherController.fetchClass)

	app
		.route('/api/teachers/fetch-problem-set')
		.get(authMiddleware.authenticate)
		.get(authMiddleware.teacher)
		.get(problemSetMiddleware.problemSet)
		.get(teacherController.fetchProblemSet)
}
