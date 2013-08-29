var Class = require('prototype').Class;
var dbTools = require('../DBTools');
var procDate = require('../RandUtils').procDate;
var Team = require('./TeamModel').Team;

var Session = Class.create({
	/**
	 * Set session codename, description, date, and id
	 * Note: date a date object
	 * @constructor
	 */
	initialize: function (codename, description, date) {
		this.codename = codename;
		this.description = description;
		this.date = date;
	},

	/**
	 * Add a team to take part in this session
	 * Creates a new Team object and adds it to the teams array
	 * @param {String} name The name of the team to add
	 * @returns {String} key The unique key generated for the team
	 */
	addTeam: function (name) {
		var team = new Team(name, this.codename);
		team.save();
		return team.key;
	},

	/**
	 * Call procDate on this session's date object, and return the result
	 * @returns {String} Result of calling procDate on this session's date object
	 */
	getDate: function () {
		return procDate(this.date);
	},

	/**
	 * Check if this session is current
	 * @returns {Boolean} True if the session is less than an hour away, and has not been elapsed for over an hour
	 */
	current: function () {
		var now = new Date();
		if (this.date.getTime() > now.getTime() - 3600 && this.date.getTime() < now.getTime() + 3600) {
			return true;
		}
		return false;
	},

	/**
	 * Check if this session has passed
	 * @returns {Boolean} True if this session has been elapsed for over 2 hours
	 */
	passed: function () {
		var now = new Date();
		return (this.date.getTime() < now.getTime() - 7200);
	},

	/**
	 * Check if this session yet to come
	 * @returns {Boolean} True if this session is farther than 2 hours away
	 */
	future: function () {
		var now = new Date();
		return (this.date.getTime() > now.getTime() + 7200);
	},

	/**
	 * Retrieve all teams who took part in this session
	 * @param {Function(cursor)} callback The function to call after the query is over, sending the db cursor from the database
	 */
	getTeams: function (callback) {
		callback(dbTools.find('team', {session: this.codename}));
	},

	/**
	 * Query the database for a certain team that took part in this session
	 * @param {Function(result)} callback The function to call after the query is over. The result argument is a database object and contains the raw database entry of the team
	 */
	getTeamByName: function (name, callback) {
		dbTools.findOne('team', {name: name, session: this.codename}, callback);
	},

	/**
	 * Delete this session from the database
	 */
	remove: function () {
		this.getTeams(function (cursor) {
			cursor.each(function (err, raw) {
				if (!err && raw) {
					var team = Team.serialize(raw);
					team.remove();
				}
			});
		});
		dbTools.remove('session', {codename: this.codename});
	},

	/**
	 * Save any 'local' changes to the database (if this session already exists, it will be updated, if not, it will be created)
	 */
	save: function () {
		var codename = this.codename;
		var description = this.description;
		var date = this.date;
		
		var callback = function (result) {
			if (result === null) {
				dbTools.insert('session',
					{codename: codename, description: description, date: date});
			} else {
				dbTools.update('session', {codename: codename},
					{$set: {description: description, date: date}});
			}
		};

		dbTools.findOne('session', {codename: codename}, callback);
	}
});

/**
 * Query the database for a session with a specific codename
 * @param {String} codename The codename of the session to query for
 * @param {Function(result)} callback The function to send the data from the database to
 */
Session.getByCodename = function (codename, callback) {
	dbTools.findOne('session', {codename: codename}, callback);
};

/**
 * Get all sessions from the database
 */
Session.getAll = function () {
	return dbTools.find('session');
};

/**
 * Create a session in the database
 * @param {String} codename The codename of the session
 * @param {String} description The description of the session
 * @param {String} date The date of the session, formatted YYYY-MM-DD HH:MM:SS
 */
Session.create = function (codename, description, date) {
	dbTools.insert('session',
		{codename: codename, description: description, date: date});
};

/**
 * Serialize a Session object from a database query result
 * @param {} result The result of a database query
 * @returns {Session} The serialized Session object
 */
Session.serialize = function (result) {
	return new Session(result.codename, result.description, result.date);
};

exports.Session = Session;