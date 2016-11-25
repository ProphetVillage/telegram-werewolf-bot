'use strict';

const config = require('../config');
const DB = require('../lib/db');

var db = {};
var __db = new DB(config.db, (err, _db) => {
  if (err) {
    console.log('Failed to connect database.', err);
    return;
  }
  db.groups = _db.collection('groups');
  db.users = _db.collection('users');
  db.stats = _db.collection('user_stats');

  db.groups.ensureIndex({ chat_id: 1 }, { unique: true, background: true });
  db.users.ensureIndex({ user_id: 1 }, { unique: true, background: true });
  db.stats.ensureIndex({ user_id: 1 }, { unique: true, background: true });
});

module.exports = db;
