'use strict'

module.exports = app => {
	let controllers = require('./controllers')
	let middleware = require('./middleware')

	// health check route
	app.get('/api/ping/', (req, res) => {
		res.json('pong')
	})

	// register, login, logout
	app
		.route('/api/teachers/login/')
		.post(middleware.authenticateTeacher)
		.post(controllers.login)

	app
		.route('/api/students/login/')
		.post(middleware.authenticateStudent)
		.post(controllers.login)

	app.route('/api/logout/').post(controllers.logout)

	app.route('/api/teachers/register/').post(controllers.registerTeacher)

	app.route('/api/students/register/').post(controllers.registerStudent)

	// teacher routes
	app
		.route('/api/teachers/create-class')
		.post(middleware.verifyTeacher)
		.post(controllers.createClass)

	app
		.route('/api/teachers/create-problem-set')
		.post(middleware.verifyTeacher)
		.post(middleware.verifyOwnsClass)
		.post(controllers.createProblemSet)

	// app
	// 	.route('/api/teachers/execute-problem-set')
	// 	.post(middleware.verifyTeacher)
	// 	.post(middleware.verifyOwnsProblemSet)
	// 	.post(controllers.executeProblemSet)

	// app
	// 	.route('/api/teachers/start-next-problem')
	// 	.post(middleware.verifyTeacher)
	// 	.post(controllers.startNextProblem)

	// app
	// 	.route('/api/teachers/fetch-classes')
	// 	.get(middleware.verifyTeacher)
	// 	.get(controllers.fetchClasses)

	// app
	// 	.route('/api/teachers/fetch-class')
	// 	.get(middleware.verifyTeacher)
	// 	.get(middleware.verifyOwnsClass)
	// 	.get(controllers.fetchClass)

	// app
	// 	.route('/api/teachers/fetch-problem-sets')
	// 	.get(middleware.verifyTeacher)
	// 	.get(middleware.verifyOwnsClass)
	// 	.get(controllers.fetchProblemSet)

	// app
	// 	.route('/api/teachers/fetch-problem-set')
	// 	.get(middleware.verifyTeacher)
	// 	.get(middleware.verifyOwnsProblemSet)
	// 	.get(controllers.fetchProblemSet)

	// // student routes
	// app
	// 	.route('/api/students/join-class')
	// 	.post(middleware.verifyStudent)
	// 	.post(controllers.joinClass)

	// app
	// 	.route('/api/students/fetch-classes')
	// 	.post(middleware.verifyStudent)
	// 	.post(controllers.fetchClasses)

	// app
	// 	.route('/api/students/fetch-class')
	// 	.post(middleware.verifyStudent)
	// 	.post(middleware.verifyOwnsClass)
	// 	.post(controllers.fetchClass)

	// app
	// 	.route('/api/students/answer')
	// 	.post(middleware.verifyStudent)
	// 	.post(middleware.verifyOwnsClass)
	// 	.post(controllers.answer)
}
