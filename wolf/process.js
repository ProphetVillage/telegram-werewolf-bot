'use strict'

const _ = require('underscore');
const Roles = require('./roles');

function timeout(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

function *game_process() {
  console.log('game_start', this.chat_id);

  yield this.ymessage(this.i18n.__('game.start')
    + '\n\n'
    + this.i18n.__('game.allocate_roles'));
  Roles.setRandomRoles(this, this.players);
  
  // announcement
  for (var u of this.players) {
    u.role.eventAnnouncement();
  }
  
  var day = 0;
  var msg = '';
  while (true) {
    
    yield this.ymessage(msg
      + this.i18n.__('scene.night', { time: 120 }));
    
    this.enter(day, 'night');
    for (var u of this.players) {
      if (!u.role.dead) {
        u.role.eventNight(this.queue);
      }
    }
    // wait night end
    yield timeout(12000);
    this.runQueue();  // no msg this time
    
    this.enter(day, 'dawn');
    for (var u of this.players) {
      if (!u.role.dead) {
        u.role.eventDawn(this.queue);
      }
    }
    yield timeout(12000);
    msg = this.runQueue();
    
    if (this.checkEnded()) {
      break;
    }
    
    // the next day
    day++;
    this.enter(day, 'day');
    yield this.ymessage(msg
      + this.i18n.__('scene.day', { time: 120, day: day }));
    for (var u of this.players) {
      if (!u.role.dead) {
        u.role.eventDay(this.queue);
      }
    }
    // wait day end
    yield timeout(12000);
    msg = this.runQueue();
    
    if (this.checkEnded()) {
      break;
    }
    
    // vote stage
    this.enter(day, 'dusk');
    yield this.ymessage(msg
      + this.i18n.__('scene.dusk', { time: 120 }));
    for (var u of this.players) {
      if (!u.role.dead) {
        u.role.eventDusk(this.queue);
      }
    }
    // wait day end
    yield timeout(12000);
    msg = this.runQueue();
    
    if (this.checkEnded()) {
      break;
    }
  }
  
  if (msg) yield this.ymessage(msg);
  
  // show player list
  var players = this.getSortedPlayers();
  var playerlist = this.i18n.__('common.players') + '\n';
  for (var u of players) {
    playerlist += this.i18n.player_name(u)
      + ' ' + u.role.name
      + ' - ' + (u.role.dead
        ? this.i18n.__('status.dead')
        : this.i18n.__('status.alive')) + '\n';
  }
  
  msg = this.i18n.__(this.winner_message);
  yield this.ymessage(msg + '\n\n' + playerlist);
  
  console.log('game_end', this.chat_id);
}

module.exports = game_process;
