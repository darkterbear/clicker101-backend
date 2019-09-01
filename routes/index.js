'use strict'

let authMiddleware = require('../middlewares/auth')

let indexController = require('../controllers/index')

module.exports = app => {
	// health check route
	app.get('/api/ping/', (req, res) => {
		res.json('pong')
	})

	// register, login, logout
	app
		.route('/api/authenticate/')
		.post(authMiddleware.authenticate)
		.post((req, res) => {
			res.status(req.userType === 'teacher' ? 200 : 201).end()
		})

	app.route('/api/logout/').post(indexController.logout)

	app.route('/api/register/').post(indexController.register)
}
