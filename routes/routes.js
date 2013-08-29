var Session = require('../models/SessionModel').Session;
var Team = require('../models/TeamModel').Team;
var Issue = require('../models/IssueModel').Issue;

/**
 * Authorize a client
 * @param {Object} req The http request, should have a query.name field
 * @param {Object} res The response that will be sent back to the client
 */
exports.apiAuth = function (req, res) {
	var respData = {};
	Session.getTeamByName(req.query.name, function (result) {
		if (result) {
			var team = Team.serialize(result);
			respData.key = team.key;
			respData.status = 200;
		} else {
			var newTeam = new Team(req.query.name, req.params.session_name);
			newTeam.save();
			respData.key = newTeam.key;
			respData.status = 201;
		}
		res.status(respData.status);
		res.send(respData);
	});
};

/**
 * Update client's data
 * @param {Object} req The http request, should have a query.key field
 * @param {Object} res The response that will be send back to the client
 */
exports.apiUpdate = function (req, res) {
	var respData = {};
	Team.getByKey(req.query.key, function (result) {
		if (result) {
			var team = Team.serialize(result);
			respData.status = 200;
			if (req.query.hasOwnProperty('score')) {
				team.score = req.query.score;
				team.save();
				respData.status = 201;
			}
			if (req.query.hasOwnProperty('issues')) {
				team.setIssues(JSON.parse(req.query.issues));
				respData.status = 201;
			}
		} else {
			respData.status = 404;
		}
		res.status(respData.status);
		res.send(respData);
	});
};