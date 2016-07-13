'use strict'

const _ = require('underscore');
const co = require('co');

const EventQueue = require('./queue');
const game_process = require('./process');
const i18nJ = require('./../i18n');

const timer_durations = [ 12000, 6000, 4000, 2000 ]; //[ 60000, 30000, 20000, 10000 ];
const timer_tips = [ '', 'game.last_1_min', 'game.last_30_sec', 'game.last_10_sec' ];

function Wolf(botapi, chat_id, opts) {
  this.ba = botapi;
  this.chat_id = chat_id;
  this.opts = opts;

  // params
  this.players = [];
  this.status = 'open'; // 'playing'
  this.day = 0;
  this.when = 'night'; // 'day', 'dusk'
  this.i18n = new i18nJ(opts.locale ? opts.locale : 'en');

  this.itimer = -1;
  this.winner_message = '';
  this.setStartTimer();
}

Wolf.Roles = require('./roles');

Wolf.prototype.message = function (text) {
  this.ba.sendMessage({
    chat_id: this.chat_id,
    text: text,
  }, (err, result) => {
    if (err) {
      console.log(err);
    }
  });
};

Wolf.prototype.ymessage = function *(text) {
  var self = this;
  return new Promise(function (resolve, reject) {
    self.ba.sendMessage({
      chat_id: self.chat_id,
      text: text,
    }, (err, result) => {
      resolve();
    });
  });
};

Wolf.prototype.enter = function (day, time) {
  this.day = day;
  this.when = time;

  if (time === 'dawn') {
    // no update after night
    return;
  }
  
  // reset status
  for (var u of this.players) {
    u.role.done = false;
    u.role.updateBuff();
  }
  // dusk: vote stage
  this.queue = new EventQueue(this, time === 'dusk');
};

Wolf.prototype.runQueue = function () {
  var msg = '';
  // run time up first
  for (var u of this.players) {
    if (!u.role.dead) {
      u.role.timeUp(this.when, this.queue);
    }
  }
  this.queue.finish();
  
  // get dying message
  msg = this.queue.getDyingMessages();
  
  this.queue.clearQueue();
  return msg ? msg + '\n\n' : '';
};

Wolf.prototype.checkEnded = function () {
  let alive_vill_count = 0;
  let alive_wolf_count = 0;
  for (let u of this.players) {
    if (u.role.dead) {
      continue;
    }
    if (u.role.id === 'wolf') {
      alive_wolf_count++;
    } else {
      alive_vill_count++;
    }
  }
  if (alive_vill_count === 0 && alive_wolf_count > 0) {
    this.winner_message = 'winner.wolf';
  } else if (alive_vill_count > 0 && alive_wolf_count === 0) {
    this.winner_message = 'winner.villager';
  } else {
    return false;
  }
  return true;
};

Wolf.prototype.findPlayer = function (user_id) {
  for (let u of this.players) {
    if (u.id === user_id) {
      return u;
    }
  }
  return null;
};

Wolf.prototype.getSortedPlayers = function () {
  return this.players;
};

Wolf.prototype.setStartTimer = function (i) {
  var self = this;
  if (!i) i = 0;
  this.itimer = i;
  if (i >= timer_durations.length) {
    // start the game
    this.start();
    return;
  }
  var tips = timer_tips[i];
  if (tips) self.message(this.i18n.__(tips));
  this.timer = setTimeout(() => {
    self.setStartTimer(i + 1);
  }, timer_durations[i]);
};

Wolf.prototype.updateStartTimer = function (i) {
  if (this.status !== 'open') {
    return;
  }
  if (this.itimer > 1) {
    clearTimeout(this.timer);
    this.setStartTimer(2);
  } else if (this.itimer > 0) {
    clearTimeout(this.timer);
    this.setStartTimer(1);
  }
};

Wolf.prototype.start = function () {
  this.timer = null;
  this.status = 'playing';

  var fn = co.wrap(game_process);
  fn.call(this).then(() => {
    this.end();
  }).catch((err) => {
    console.error(err.stack);
  });
};

Wolf.prototype.end = function () {
  if (this.opts.end) {
    this.opts.end.call(this);
  }
};

Wolf.prototype.forcestart = function () {
  if (this.status !== 'open') {
    return false;
  }
  if (this.players.length >= 5) {
    clearTimeout(this.timer);
    this.start();
    return true;
  }
  // TODO: other check
  return false;
};

Wolf.prototype.flee = function (user) {
  // TODO: check

  return false;
};

Wolf.prototype.join = function (user) {
  if (this.players.length >= 12) {
    return this.i18n.__('game.too_many_players');
  }
  if (this.status !== 'open') {
    return this.i18n.__('game.already_started');
  }
  var found = false;
  for (let u of this.players) {
    if (u.id === user.id) {
      found = true;
      break;
    }
  }
  if (found) {
    return this.i18n.__('game.already_in');
  }
  this.players.push(user);
  this.updateStartTimer();
  return 1;
};

module.exports = Wolf;
