'use strict';

const _ = require('underscore');
const S = require('string');
const co = require('co');

const EventQueue = require('./queue');
const game_process = require('./process');
const i18nJ = require('./../i18n');
const role_list = require('./roles').role_list;

const timer_durations = [ 60000, 30000, 20000, 10000 ];   // [ 12000, 6000, 4000, 1000 ];
const timer_tips = [ '', 'game.last_1_min', 'game.last_30_sec', 'game.last_10_sec' ];

function Wolf(botapi, db, chat_id, opts) {
  this.ba = botapi;
  this.db = db;
  this.chat_id = chat_id;
  this.opts = opts ? opts : {};

  // params
  this.players = [];
  this.status = 'open'; // 'playing'
  this.day = 0;
  this.when = 'night'; // 'day', 'dusk'

  this.itimer = -1;
  this.winner_message = '';
  if (this.opts['game'] !== false) {
    this.setStartTimer();
  }
}

Wolf.MAX_PLAYERS = 12;
Wolf.MIN_PLAYERS = 5;
Wolf.DEL_LOCALE = 'zh-CN';
Wolf.LOCALES = [ 'en', 'zh-CN' ];

Wolf.Roles = require('./roles');

Wolf.prototype.init = function (chat, cb) {
  var self = this;
  this.db.groups.findOne({ chat_id: this.chat_id }, (err, r) => {
    if (err) {
      self.i18n = new i18nJ(Wolf.DEL_LOCALE);
      return cb(err);
    }
    if (r && r.opts) {
      self.opts = _.extend(self.opts, r.opts);
    }

    // i18n
    let locale = self.opts.locale ? self.opts.locale : Wolf.DEL_LOCALE;
    self.i18n = new i18nJ(locale);

    if (self.opts['game'] !== false && r.next_game_queue) {
      for (let q of r.next_game_queue) {
        self.ba.sendMessage({
          chat_id: q.user_id,
          text: self.i18n.__('game.open_in_group', {
            groupname: S(chat.title).escapeHTML().s
          })
        });
      }

      // clear queue
      self.db.groups.update({
        chat_id: self.chat_id
      }, { $set: { next_game_queue: [] } }, (err, r) => {});
    }

    cb(null, r);
  });
};

Wolf.prototype.nextGame = function (user, cb) {
  var self = this;
  this.db.groups.findOne({ chat_id: this.chat_id }, (err, r) => {
    if (err) {
      self.i18n = new i18nJ(Wolf.DEL_LOCALE);
      return cb(err);
    }

    // user queue
    let u = {
      user_id: user.id,
      username: user.username,
      name: user.first_name + (user.last_name ? ' ' + user.last_name : '')
    };

    if (!r) {
      self.db.groups.save({
        chat_id: self.chat_id,
        next_game_queue: [ u ]
      }, cb);
    } else {
      let found = false;
      if (r.next_game_queue) {
        for (let q of r.next_game_queue) {
          if (q.user_id === u.user_id) {
            found = true;
            break;
          }
        }
      }
      if (!found) {
        self.db.groups.update({
          chat_id: self.chat_id,
        }, { $push: { next_game_queue: u } }, cb);
      }
    }
  });
};

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
    u.role.event_message_id = null;
    u.role.done = false;
    u.role.updateBuff();
  }
  // dusk: vote stage
  this.queue = new EventQueue(this, time === 'dusk');
  if (time === 'day') {
    this.queue.setQuickMode(false);
  }
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
  let alive_party_count = 0;
  let alive_count = 0;
  for (let u of this.players) {
    if (u.role.dead) {
      continue;
    }
    switch (u.role.id) {
      case 'wolf':
        alive_wolf_count++;
        break;
      case 'partymember':
        alive_party_count++;
        break;
      default:
        alive_vill_count++;
    }
    alive_count++;
  }
  if (this.queue.getDeathCount() > 0) {
    let deads = this.queue.death;
    for (let d of deads) {
      if (d.event === 'vote' && d.dead.role.id === 'tanner') {
        this.winner_message = 'winner.tanner';
        return true;
      }
    }
  }
  if (alive_party_count >= alive_count) {
    this.winner_message = 'winner.partymember';
  } else if (alive_wolf_count > 0 && alive_wolf_count >= alive_count / 2) {
    this.winner_message = 'winner.wolf';
  } else if (alive_vill_count > 0 && alive_wolf_count === 0 && alive_party_count === 0) {
    this.winner_message = 'winner.villager';
  } else if (alive_count === 0) {
    this.winner_message = 'winner.none';
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
  return _.sortBy(this.players, (u) => {
    return u.role ? u.role.dead : 0;
  });
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

  if (this.players.length < Wolf.MIN_PLAYERS) {
    this.message(this.i18n.__('game.no_enough_person'));
    this.end();
    return;
  }

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

Wolf.prototype.forcestart = function (u) {
  if (this.status !== 'open') {
    return false;
  }
  if (this.players.length >= Wolf.MIN_PLAYERS) {
    if (u.id !== this.players[0].id) {
      return false;
    } else {
      clearTimeout(this.timer);
      this.start();
      return true;
    }
  }
  // TODO: other check
  return false;
};

Wolf.prototype.flee = function (user) {
  var found = false;
  var i;
  for (i = 0; i < this.players.length; i++) {
    let u = this.players[i];
    if (u.id === user.id) {
      found = true;
      break;
    }
  }
  if (found) {
    if (this.status !== 'open') {
      return this.i18n.__('game.fail_to_flee');
    } else {
      this.players.splice(i, 1);
      return this.i18n.__n('game.fleed', this.players.length, {
        current: this.players.length,
        max: Wolf.MAX_PLAYERS,
        min: Wolf.MIN_PLAYERS
      });
    }
  } else {
    return this.i18n.__('game.not_in_game');
  }
};

Wolf.prototype.join = function (user, cb) {
  if (this.players.length >= Wolf.MAX_PLAYERS) {
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

  this.db.users.findOne({ user_id: user.id }, cb);
  return 1;
};

Wolf.prototype.getPlayerList = function (showrole) {
  // show player list
  var players = this.getSortedPlayers();
  var playerlist = this.i18n.__('common.players', { num: players.length }) + '\n';
  for (var u of players) {
    playerlist += this.i18n.player_name(u);

    if (u.role) {
      if (showrole === 1) {
        // show dead one
        if (u.role.dead && this.opts.showjob !== false) {
          playerlist += ' ' + u.role.name;
        }
      } else if (showrole === 2) {
        // show all
        if (u.role.role_chains.length > 0) {
          // show chains
          for (let roleId of u.role.role_chains) {
            playerlist += ' ' + this.i18n.job_name(roleId)
                              + S(' ->').escapeHTML().s;
          }
        }
        playerlist += ' ' + u.role.name;
      }
    }

    playerlist += ' - ' + ((u.role && u.role.dead)
        ? this.i18n.__('status.dead')
        : this.i18n.__('status.alive'));
    playerlist += '\n';
  }

  return playerlist;
};

Wolf.prototype.transformRole = function (player, roleId) {
  if (roleId in role_list) {
    var rc = player.role.role_chains;
    rc.push(player.role.id);

    player.role = new role_list[roleId](this, player);

    // add chains
    player.role.role_chains = rc;
  }
};

module.exports = Wolf;
