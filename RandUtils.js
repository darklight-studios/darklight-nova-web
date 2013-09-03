var crypto = require('crypto');
var Session = require('./models/SessionModel').Session;
var Team = require('./models/TeamModel').Team;

/**
 * Turn a JS Date object into a nice, human-readable string
 * @param {Date} date The date object to use to create the string
 * @returns {String} A human readable string describing the date and time
 */
exports.procDate = function (date) {
	var leadZero = function (num) {
		if (num < 10) return '0' + num;
		else return '' + num;
	};
	var dateString = '';

	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	dateString += months[date.getMonth()] + '. ';
	dateString += date.getDate() + ', ';
	dateString += date.getFullYear() + ', ';

	var hours = date.getHours();
	var pm = false;
	if (hours > 12) {
		hours -= 12;
		pm = true;
	} else if (hours === 12) pm = true;
	dateString += (pm) ? hours + ':' + leadZero(date.getMinutes()) + ' pm' : hours + ':' + leadZero(date.getMinutes()) + ' am';

	return dateString;
};

/**
 * Generate a unique key, used for the Team model
 * This creates a sha512 hash of the team name salted with the current time
 * @param {String} name The name of the team to generate the key based off of (seed)
 */
exports.generateKey = function (name) {
	var sha = crypto.createHash('sha512');
	var stringToHash = '';
	var now = new Date().getTime();
	name.split('').forEach(function (element, index, array) {
		if (element !== ' ') {
			if (index !== name.length) {
				stringToHash += element + '' + now;
			} else {
				stringToHash += element;
			}
		}
	});
	sha.update(stringToHash);
	return sha.digest('hex');
};

/**
 * Utility to easily create a Sesion
 * @param {String} codename The session codename (must be unique)
 * @param {String} description The description of the session
 * @param {Date} date The date the session will take place
 * @param {Array<String>} teams (optional) Array of team names to add to the session
 */
exports.createSession = function (codename, description, date, teams) {
	if (typeof(teams) === 'undefined') {
		Session.create(codename, description, date);
	} else {
		var session = new Session(codename, description, date);
		teams.forEach(function (team, index, array) {
			session.addTeam(team);
		});
		session.save();
	}
};