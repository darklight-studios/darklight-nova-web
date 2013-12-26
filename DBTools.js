// Set this to true for debug output on all DB calls
var debug = false;

var db = require('mongoskin').db('mongodb://pub:' + process.env.DB_PASS + '@paulo.mongohq.com:10004/darklight-nova-web', {safe:true});

/**
 * Execute a find call on db.collection()
 * @param {String} collection The name of the collection to search for
 * @param {Object} query A query object (not required)
 * @returns {DB Cursor} The raw return value from db.collection(collection).find()
 */
exports.find = function (collection, query) {
    if (typeof(query) !== 'undefined') return db.collection(collection).find(query);
    else return db.collection(collection).find();
};

/**
 * Execute a fineOne call on db.collection()
 * @param {String} collection The name of the collection to search for
 * @param {Object} query A query object, if you have no query then pass an empty object
 * @param {Function(result)} callback The function that the search result is passed to
 */
exports.findOne = function (collection, query, callback) {
    db.collection(collection).findOne(query, function (err, result) {
        if (err) console.log('Error finding ' + collection + ': ' + err);
        callback(result);
    });
};

/**
 * Execute a insert call on db.collection()
 * @param {String} collection The name of the collection to insert data into
 * @param {Object} data The data to insert into the collection
 */
exports.insert = function (collection, data) {
    db.collection(collection).insert(data, function (err, result) {
        if (err) console.log('Error inserting ' + data + ' into the database: ' + err);
    });
};

/**
 * Execute a remove call on db.collection()
 * If there is an error, it will be printed to the console
 * @param {String} collection The name of the collection to delete data from
 * @param {Object} selector The object that contains the 'selector' or filter used to differentiate items that should be deleted
 */
exports.remove = function (collection, selector) {
    db.collection(collection).remove(selector, function (err, result) {
        if (err) console.log('Error removing ' + selector + ' from collection ' + collection + ': ' + err);
    });
};

/**
 * Update data in the database
 * Execute an update call on db.collection()
 * @param {String} collection The name of the collection in which data will be updated
 * @param {Object} selector The selector object (mongo)
 * @param {Object} data The mongo information to update the data
 */
exports.update = function (collection, selector, data) {
    db.collection(collection).update(selector, data, function (err, result) {
        if (err) console.log('Error updating ' + selector + ' with ' + data + ': ' + err);
    });
};