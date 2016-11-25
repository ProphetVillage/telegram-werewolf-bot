'use strict';

const roleEvents = require('./role-events');
const checkCommands = require('./check');
const groupCommands = require('./group');
const configCommands = require('./config');

function botCommands(ba, game_sessions) {
  checkCommands(ba, game_sessions);
  roleEvents(ba, game_sessions);
  groupCommands(ba, game_sessions);
  configCommands(ba, game_sessions);
}

module.exports = botCommands;
