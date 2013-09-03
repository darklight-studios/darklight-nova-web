var Session = require('./models/SessionModel').Session;
Session.getByCodename('pru', function (result) {
	Session.serialize(result).remove();
});
