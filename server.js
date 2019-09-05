'use strict'

// dependencies
const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')(session)
const bodyParser = require('body-parser')
const app = express()
const indexRoutes = require('./routes/index')
const studentRoutes = require('./routes/student')
const teacherRoutes = require('./routes/teacher')
const port = 3000

require('dotenv').config()

const server = require('http').Server(app)

// mongodb
mongoose.Promise = global.Promise
mongoose.connect(
	`mongodb+srv://clicker101app:${process.env.DATABASE_PASSWORD}@cluster0-pgatj.mongodb.net/clicker101db?retryWrites=true&w=majority`,
	{
		useMongoClient: true
	}
)
let db = mongoose.connection

db.once('open', async () => {
	console.log('Connected to MongoDB')
})

// sessions
const cookieExpire = 1000 * 60 * 60 * 24 * 7 // 1 week
app.set('trust proxy', 1)

const sessionMiddleware = session({
	name: 'session_id',
	secret: process.env.SESSION_SECRET,
	resave: true,
	store: new MongoStore({
		mongooseConnection: mongoose.connection
	}),
	cookie: {
		httpOnly: true,
		maxAge: cookieExpire,
		path: '/',
		secure: false // TODO: production should be true
	},
	rolling: true,
	unset: 'destroy'
})

app.use(sessionMiddleware)
app.use(
	bodyParser.urlencoded({
		extended: true
	})
)
app.use(bodyParser.json())
app.use((req, res, next) => {
	let allowedOrigins = [
		'http://localhost:3001',
		'https://terranceli.com',
		'https://clicker101.terranceli.com'
	]
	let origin = req.headers.origin

	if (allowedOrigins.indexOf(origin) > -1) {
		res.setHeader('Access-Control-Allow-Origin', origin)
	}
	res.header('Access-Control-Allow-Credentials', 'true')
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	)
	next()
})

indexRoutes(app)
studentRoutes(app)
teacherRoutes(app)

server.listen(port, () => {
	console.log('Clicker101 API is live on port ' + port)
})
