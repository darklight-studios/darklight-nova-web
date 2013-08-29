var Class = require('prototype').Class;
var dbTools = require('../DBTools');
var generateKey = require('../RandUtils').generateKey;
var Issue = require('./IssueModel').Issue;

var Team = Class.create({
	/**
	 * Set the session this team is participating in, the team name, unique key, and the team's score
	 * @constructor
	 */
	initialize: function (name, session) {
		this.name = name;
		this.session = session;
		this.key = generateKey(name);
		this.score = 0;
	},

	/**
	 * Alter this team's issues given a set of found issues
	 * This compares the issues present in the database to the issues that were
	 * sent to the server as found, and does necessary removal/addition to/from the database
	 * @param {Object} key: issue name value: issue description, this is the object returned from parsing the JSON sent to the update endpoint
	 */
	setIssues: function (issues) {
		this.getIssues(function (dbIssues) {
			dbIssues.each(function (err, dbIssue) {
				if (!err && dbIssue) {
					if (!issues.hasOwnProperty(dbIssue.name)) {
						var oIssue = Issue.serialize(dbIssue);
						oIssue.remove();
					} else {
						delete(issues[dbIssue.name]);
					}
				}
			});
		});
		this.score = 0;
		for (var issue in issues) {
			Issue.create(issue, issues[issue], this.key);
			this.score += 1;
		}
	},

	/**
	 * Add an issue that has been fixed by this team
	 * @param {String} name The name of the issue
	 * @param {String} description The description of the issue
	 */
	addIssue: function (name, description) {
		Issue.create(name, description, this.key);
		this.score += 1;
	},

	/**
	 * Remove an issue
	 * @param {String} name The name of the issue
	 * @param {String} description The description of the issue
	 */
	removeIssue: function (name, description) {
		dbTools.findOne('issue', {name: name, description: description, team: this.key}, function (result) {
			var issue = Issue.serialize(result);
			issue.remove();
		});
		this.score -= 1;
	},

	/**
	 * Get all issues this team has found
	 * @param {Function(cursor)} callback The function to send data from the database to
	 */
	getIssues: function (callback) {
		callback(dbTools.find('issue', {team: this.key}));
	},

	/**
	 * Delete this team from the database
	 */
	remove: function () {
		this.getIssues(function (cursor) {
			cursor.each(function (err, raw) {
				if (!err && raw) {
					var issue = Issue.serialize(raw);
					issue.remove();
				}
			});
		});
		dbTools.remove('team', {key: this.key});
	},

	/**
	 * Save any 'local' changes to the database (if this team already exists, it will be updated, if not, it will be created)
	 */
	save: function () {
		var key = this.key;
		var session = this.session;
		var name = this.name;
		var score = this.score;

		var callback = function (result) {
			if (result === null) {
				dbTools.insert('team',
					{name: name, session: session, key: key, score: score});
			} else {
				dbTools.update('team', {key: key},
					{$set: {name: name, session: session, score: score}});
			}
		};

		dbTools.findOne('team', {key: key}, callback);
	}
});

/**
 * Query the database for a team with a specific key
 * Note: the callback will NOT be called if no matching team is found, but an error will be printed to the console
 * @param {String} key The unique key of the team to query for
 * @param {Function(result)} callback The function to send the data from the database to
 */
Team.getByKey = function (key, callback) {
	dbTools.findOne('team', {key: key}, callback);
};

/**
 * Query the database for a team with a specific name
 * Note: the callback will NOT be called if no matching team is found, but an error will be printed to the console
 * @param {String} name The name of the team to query for
 * @returns {Cursor} The cursor object returned from executing a dbTools.find() call;
 */
Team.getByName = function (name) {
	return dbTools.find('team', {name: name});
};

/**
 * Get all teams from the database
 * @returns {Cursor} The cursor object returned from executing a dbTools.find() call;
 */
Team.getAll = function () {
	return dbTools.find('team');
};

/**
 * Create a new team in the database
 * @param {String} name The name of the team
 * @param {String} session The 'codename' of the session this team is participating in
 * @param {Number} score This team's score
 */
Team.create = function (name, score, session) {
	var key = generateKey(name);
	dbTools.insert('team',
		{name: name, session: session, key: key, score: score});
};

/**
 * Serialize a Team object from the result of a database query
 * @param {} result The result from a database query
 * @returns {Team} The serialized Team object
 */
Team.serialize = function (result) {
	var team = new Team(result.name, result.session);
	team.key = result.key;
	team.score = result.score;
	return team;
};

exports.Team = Team;