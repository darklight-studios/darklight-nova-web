var Class = require('prototype').Class;
var dbTools = require('../DBTools');

var Issue = Class.create({
	/**
	 * Set the issue name, description, and team (key) this issue belongs to
	 * @constructor
	 */
	initialize: function (name, description, team) {
		this.name = name;
		this.description = description;
		this.team = team;
	},

	/**
	 * Deletes this issue from the database
	 */
	remove: function () {
		dbTools.remove('issue', {name: this.name, team: this.team});
	},

	/**
	 * Save any 'local' changes to the database (if this issue already exists, it will be updated, if not, it will be created)
	 */
	save: function () {
		var name = this.name;
		var description = this.description;
		var team = this.team;

		var callback = function (result) {
			if (result === null) {
				dbTools.insert('issue',
					{name: name, description: description, team: team});
			} else {
				dbTools.update('issue', {team: team},
					{$set: {name: name, description: description}});
			}
		};

		dbTools.findOne('issue', {team: team}, callback);
	}
});

/**
 * Query the database for an issue with a specific id
 * Note: the callback will NOT be called if no matching issue is found, but an error will be printed to the console
 * @param {String} team The team to query the database for
 * @returns {Cursor} The database cursor
 */
Issue.getByTeam = function (team) {
	return dbTools.find('issue', {team: team});
};

/**
 * Query the database for an issue with a specific name
 * Note: the callback will NOT be called if no matching issue is found, but an error will be printed to the console
 * @param {String} name The name  of the issue to query the database for
 * @returns {Cursor} The database cursor
 */
Issue.getByName = function (name) {
	return dbTools.find('issue', {name: name});
};

/**
 * Get all issues from the database
 * @returns {Cursor} The database cursor
 */
Issue.getAll = function () {
	return dbTools.find('issue');
};

/**
 * Create an issue in the database
 * @param {String} name The name of this issue
 * @param {String} description The description of this issue
 * @param {String} team The team this issue belongs to
 */
Issue.create = function (name, description, team) {
	dbTools.insert('issue',
		{name: name, description: description, team: team});
};

/**
 * Serialize an Issue object from a database query
 * @param {} result The result of a database query
 * @returns {Issue} The serialized Issue object
 */
Issue.serialize = function (result) {
	return new Issue(result.name, result.description, result.team);
};

exports.Issue = Issue;