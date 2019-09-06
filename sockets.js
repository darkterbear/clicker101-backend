let io
const Student = require('./models/student')

module.exports = {
	init: (server, sessionMiddleware) => {
		io = require('socket.io')(server)

		io.use(function(socket, next) {
			var req = socket.handshake
			var res = {}
			sessionMiddleware(req, res, async function(err) {
				if (err) {
					console.error(err)
					let error = new Error('Internal Error')
					error.data = {
						type: 'internal_error'
					}
					return next(error)
				}

				var id = req.session._id

				if (!id || !req.session.authenticated) {
					let error = new Error('Authentication error')
					error.data = {
						type: 'authentication_error'
					}
					return next(error)
				}

				// be able to reference this member later on
				// socket.join(id.toString())

				const student = await Student.findOne({ _id: id }).exec()
				if (student) {
					student.classes.forEach(c => {
						socket.join(c._id.toString())
					})
				}

				return next()
			})
		})
	},
	progress: classId => {
		io.to(classId.toString()).emit('progress', classId)
	}
}
