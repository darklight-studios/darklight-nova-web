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
	Session.getByCodename(req.params.session_name, function (result) {
		if (result) {
			Session.serialize(result).getTeamByName(req.query.name, function (result) {
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
		}
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
				team.save();
				respData.status = 201;
			}
		} else {
			respData.status = 404;
		}
		res.status(respData.status);
		res.send(respData);
	});
};

/**
 * Index page
 */
exports.index = function (req, res) {
	Session.getAll().toArray(function (err, results) {
		var sessionList = [];
		if (!err && results) {
			results.forEach(function (result, index, array) {
				if (result) sessionList.push(Session.serialize(result));
			});
		}
		if (sessionList.length === 0) sessionList = false;
		res.render('index', {title: 'Sessions', sessions: sessionList});
	});
};

/**
 * Session detail page
 */
exports.details = function (req, res) {
	Session.getByCodename(req.params.session, function (result) {
		if (result) {
			var session = Session.serialize(result);
			session.getTeams().toArray(function (err, results) {
				var teamList = [];
				if (!err && results) {
					results.forEach(function (result, index, array) {
						if (result) teamList.push(Team.serialize(result));
					});
				}
				if (teamList.length === 0) teamList = false;
				res.render('details', {session: session, teams: teamList});
			});
		}
	});
};

exports.teamDetails = function (req, res) {
	Session.getByCodename(req.params.session, function (result) {
		if (result) {
			var session = Session.serialize(result);
			session.getTeamByName(req.params.team, function (_result) {
				if (_result) {
					var team = Team.serialize(_result);
					team.getIssues().toArray(function (err, results) {
						var issueList = [];
						if (!err && results) {
							results.forEach(function (result, index, array) {
								if (result) issueList.push(Issue.serialize(result));
							});
						}
						if (issueList.length === 0) issueList = false;
						res.render('specificDetails',
							{sessioncodename: session.codename, teamname: team.name, issues: issueList});
					});
				} else {
					res.render('specificDetails', {});
				}
			});
		}
	});
};





