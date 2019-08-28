'use strict'
const bcrypt = require('bcryptjs')
const saltRounds = 12

exports.hash = password => {
	return new Promise((res, rej) => {
		bcrypt.hash(password, saltRounds, (err, hash) => {
			if (err) rej(err)
			else res(hash)
		})
	})
}

exports.check = (inputPassword, storedPassword) => {
	return new Promise((res, rej) => {
		bcrypt.compare(inputPassword, storedPassword, (err, result) => {
			if (err) rej(err)
			else res(result)
		})
	})
}
