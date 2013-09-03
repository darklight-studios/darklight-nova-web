
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes/routes');
var http = require('http');
var path = require('path');

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if ('development' === app.get('env')) {
	app.use(express.errorHandler());
}

// API routes
app.get('/api/:session_name/auth', routes.apiAuth);
app.get('/api/update', routes.apiUpdate);

// Web frontend routes
app.get('/', routes.index);
app.get('/details/:session', routes.details);
app.get('/details/:session/:team', routes.teamDetails);

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
