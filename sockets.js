// let io
// const schemas = require('./schemas')

// const Member = schemas.Member

// module.exports = {
// 	init: (server, sessionMiddleware) => {
// 		io = require('socket.io')(server)

// 		io.use(function(socket, next) {
// 			var req = socket.handshake
// 			var res = {}
// 			sessionMiddleware(req, res, async function(err) {
// 				if (err) {
// 					console.error(err)
// 					let error = new Error('Internal Error')
// 					error.data = {
// 						type: 'internal_error'
// 					}
// 					return next(error)
// 				}

// 				var id = req.session._id

// 				if (!id || !req.session.authenticated) {
// 					let error = new Error('Authentication error')
// 					error.data = {
// 						type: 'authentication_error'
// 					}
// 					return next(error)
// 				}

// 				// be able to reference this member later on
// 				socket.join(id.toString())

// 				try {
// 					// if admin, join admin room
// 					const user = await Member.findOne({ _id: id }).exec()

// 					if (user && user.admin) {
// 						socket.join('admin')
// 					}
// 				} catch (err) {
// 					console.log(err)
// 					return next(err)
// 				}
// 				return next()
// 			})
// 		})
// 	},
// 	onPiPointChange: (memberId, piPointChange) => {
// 		io.to(memberId.toString()).emit('piPointChange', piPointChange)
// 	},
// 	onMembersChange: (type, payload) => {
// 		/**
// 		 * type: String; 'add', 'remove', or 'edit'
// 		 * payload: Object/String
// 		 *    if 'add': entire member object
// 		 *    if 'remove': member id to remove
// 		 *    if 'edit': {
// 		 *      _id: id,
// 		 *      data: [{
// 		 *        field: String, e.g. name or email
// 		 *        value: new value NOTE: pi point updates are always relative changes in pi points
// 		 *      },  ...]
// 		 *    }
// 		 */
// 		io.to('admin').emit('membersChange', {
// 			type: type,
// 			payload: payload
// 		})
// 	},
// 	onMeetingsChange: (type, payload) => {
// 		/**
// 		 * type: String; 'add', 'remove', or 'edit'
// 		 * payload: Object/String
// 		 *    if 'add': entire meeting object
// 		 *    if 'remove': meeting id to remove
// 		 *    if 'edit': {
// 		 *      _id: id,
// 		 *      data: [{
// 		 *        field: String, e.g. name or email
// 		 *        value: new value NOTE: pi point updates are always relative changes in pi points
// 		 *      },  ...]
// 		 *    }
// 		 */
// 		io.to('admin').emit('meetingsChange', { type: type, payload: payload })
// 	},
// 	// KPMT SOCKETS ARE COMPREHENSIVE; e.g. WHEN A SCHOOL IS REMOVED VIA SOCKET, YOU CAN ALSO EXPECT REMOVETEAM AND REMOVECOMPETITOR SOCKETS
// 	onSchoolsChange: (type, payload) => {
// 		/**
// 		 * type: String; 'add', 'remove', or 'edit'
// 		 * payload: Object/String
// 		 *    if 'add': entire school object
// 		 *    if 'remove': school id to remove
// 		 *    if 'edit': {
// 		 *      _id: id,
// 		 *      data: [{
// 		 *      field: String, e.g. 'members' or 'teams'
// 		 *      value: new object/array
// 		 *      },  ...]
// 		 *    }
// 		 */
// 		io.to('admin').emit('schoolsChange', {
// 			type: type,
// 			payload: payload
// 		})
// 	},
// 	onTeamsChange: (type, payload) => {
// 		/**
// 		 * type: String; 'add', 'remove', or 'edit'
// 		 * payload: Object/String
// 		 *    if 'add': entire team object
// 		 *    if 'remove': team id to remove // dw about also removing the competitors, they'll get their own socket
// 		 *    if 'edit': {
// 		 *      _id: id,
// 		 *      data: [{
// 		 *      field: String, e.g. 'number' or 'scores'
// 		 *      value: new value OR object (in the case of scores)
// 		 *    },  ...]}
// 		 */
// 		io.to('admin').emit('teamsChange', {
// 			type: type,
// 			payload: payload
// 		})
// 	},
// 	onCompetitorsChange: (type, payload) => {
// 		/**
// 		 * type: String; 'add', 'remove', or 'edit'
// 		 * payload: Object/String
// 		 *    if 'add': entire competitor object
// 		 *    if 'remove': competitor id to remove // dw about also removing from teams, they'll get their own socket
// 		 *    if 'edit': {
// 		 *      _id: id,
// 		 *      data: [{
// 		 *      field: String, e.g. 'name' or 'scores'
// 		 *      value: new value OR object (in the case of scores)
// 		 *      },  ...]
// 		 *    }
// 		 */
// 		io.to('admin').emit('competitorsChange', {
// 			type: type,
// 			payload: payload
// 		})
// 	}
// }
