
const MongoClient = require('mongodb').MongoClient;

function DB(opts, cb) {
  if (!DB.db) {
    init_db(opts, cb);
  }
}

DB.prototype.collection = function (col) {
  return DB.db.collection(col);
};

DB.prototype.close = function () {
  return DB.db.close();
};

function init_db(opts, cb) {
  if (!opts) {
    cb('db config not found');
    return;
  }
  
  var dburl = 'mongodb://' + opts.host;
  if (opts.port) {
    dburl += ':' + opts.port;
  }
  dburl += '/' + opts.database;

  MongoClient.connect(dburl, function(err, db) {
    if (err) {
      console.log(err);
      if (cb) cb(err);
      return;
    }
    console.log("Connected to database server.");
    //db.close();
    DB.db = db;
    if (cb) cb(null, db);
  });
}

module.exports = DB;
