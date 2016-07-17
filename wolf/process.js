'use strict'

const _ = require('underscore');
const Roles = require('./roles');

function timeout(ms, queue) {
  return new Promise(function (resolve, reject) {
    var d = false;
    var __t = setTimeout(() => {
      d = true;
      resolve();
    }, ms);
    queue.afterFinish(() => {
      if (d) {
        return;
      }
      clearTimeout(__t);
      resolve();
    });
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
      + this.i18n.__('scene.night', { time: 60 }));
    
    this.enter(day, 'night');
    for (var u of this.players) {
      if (!u.role.dead) {
        u.role.eventNight(this.queue);
      }
    }
    // wait night end
    yield timeout(60000, this.queue);
    this.runQueue();  // no msg this time
    
    this.enter(day, 'dawn');
    for (var u of this.players) {
      if (!u.role.dead) {
        u.role.eventDawn(this.queue);
      }
    }
    yield timeout(30000, this.queue);
    msg = this.runQueue();
    
    if (this.checkEnded()) {
      break;
    }
    
    if (this.queue.getDeathCount() <= 0) {
      msg += this.i18n.__('death.silent_night') + '\n\n';
    }
    
    // the next day
    day++;
    this.enter(day, 'day');
    yield this.ymessage(msg
      + this.i18n.__('scene.day', { time: 90, day: day }));
    for (var u of this.players) {
      if (!u.role.dead) {
        u.role.eventDay(this.queue);
      }
    }
    // wait day end
    yield timeout(90000, this.queue);
    msg = this.runQueue();
    
    if (this.checkEnded()) {
      break;
    }
    
    // vote stage
    this.enter(day, 'dusk');
    yield this.ymessage(msg
      + this.i18n.__('scene.dusk', { time: 90 }));
    for (var u of this.players) {
      if (!u.role.dead) {
        u.role.eventDusk(this.queue);
      }
    }
    // wait day end
    yield timeout(90000, this.queue);
    msg = this.runQueue();
    
    if (this.checkEnded()) {
      break;
    }
  }
  
  if (msg) yield this.ymessage(msg);

  let playerlist = this.getPlayerList(2);
  msg = this.i18n.__(this.winner_message);
  yield this.ymessage(msg + '\n\n' + playerlist);
  
  console.log('game_end', this.chat_id);
}

module.exports = game_process;
