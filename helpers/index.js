const validateInput = (...parameters) => {
	for (var i = 0; i < parameters.length; i++) {
		if (!parameters[i]) return false
	}
	return true
}

const hat = (length = 6) => {
	var text = ''
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

	for (var i = 0; i < length; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length))

	return text
}

const isValidEmail = s => {
	let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	return re.test(s.toLowerCase())
}

module.exports = {
	validateInput,
	hat,
	isValidEmail
}
