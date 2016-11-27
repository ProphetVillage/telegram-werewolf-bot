'use strict';

const db = require('./database');
const i18nJ = require('../i18n');

const def_i18n = new i18nJ('en');

class GameSessionManager {
  constructor() {
    // chat_id => Wolf class
    this.def_i18n = def_i18n;
    this.sessions = {};
  }
  gameStart(wolf) {
    this.sessions[wolf.chat_id] = wolf;
  }
  gameEnd(wolf) {
    delete this.sessions[wolf.chat_id];
  }
  get(chat_id) {
    return this.sessions[chat_id];
  }
}

const mgr = new GameSessionManager();
module.exports = mgr;
