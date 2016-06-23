'use strict'

const _ = require('underscore');

function Wolf(botapi, chat_id, opts) {
  this.ba = botapi;
  this.chat_id = chat_id;
  this.opts = opts;

  // params
  this.players = [];
}

Wolf.prototype.format_name = function (user) {
  return user.first_name + (user.last_name ? ' ' + user.last_name : '');
};

Wolf.prototype.forcestart = function () {
  if (this.players.length >= 5) {
    return true;
  }
  // TODO: other check
  return false;
};

Wolf.prototype.join = function (user) {
  if (this.players.length >= 35) {
    return false;
  }
  var found = false;
  for (let u of this.players) {
    if (u.id === user.id) {
      found = true;
      break;
    }
  }
  if (found) {
    this.ba.sendMessage({
      chat_id: this.chat_id,
      text: 'You are already in the game.',
    }, (err, result) => {
      if (err) {
        console.log(err);
      }
    });
    return true;
  }
  this.players.push(user);
  return true;
};

module.exports = Wolf;
