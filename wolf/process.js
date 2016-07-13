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
  
  yield this.ymessage(this.i18n.__('game.allocate_roles'));
  Roles.setRandomRoles(this, this.players);
  
  // announcement
  for (var u of this.players) {
    u.role.eventAnnouncement();
  }
  
  var day = 0;
  var msg = '';
  while (true) {
    
    yield this.ymessage(msg + 'Tonight, a beautiful night. 120s to wait.');
    
    this.enter(day, 'night');
    for (var u of this.players) {
      if (!u.role.dead) {
        u.role.eventNight(this.queue);
      }
    }
    // wait night end
    yield timeout(12000);
    msg = this.runQueue();
    
    this.enter(day, 'dawn');
    for (var u of this.players) {
      if (!u.role.dead) {
        u.role.eventDawn(this.queue);
      }
    }
    yield timeout(12000);
    msg += this.runQueue();
    
    // the next day
    day++;
    this.enter(day, 'day');
    yield this.ymessage(msg + 'Day ' + day + ', we have 120s to talk.');
    for (var u of this.players) {
      if (!u.role.dead) {
        u.role.eventDay(this.queue);
      }
    }
    // wait day end
    yield timeout(12000);
    msg = this.runQueue();
    
    // vote stage
    this.enter(day, 'dusk');
    yield this.ymessage(msg + 'Sun falling, we have 120s to vote.');
    for (var u of this.players) {
      if (!u.role.dead) {
        u.role.eventDusk(this.queue);
      }
    }
    // wait day end
    yield timeout(12000);
    msg = this.runQueue();
    
    if (this.checkEnded()) {
      
      // show player list
      var players = this.getSortedPlayers();
      var playerlist = 'Players:\n';
      for (var u of players) {
        playerlist += this.i18n.player_name(u)
          + ' ' + u.role.name
          + ' - ' + (u.role.dead
            ? this.i18n.__('status.dead')
            : this.i18n.__('status.alive')) + '\n';
      }
      
      yield this.ymessage(msg + playerlist);
      break;
    }
  }
  
  console.log('game_end', this.chat_id);
}

module.exports = game_process;
