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
  
  yield this.ymessage('Now allocate roles for players.');
  Roles.setRandomRoles(this, this.players);
  
  // announcement
  for (var u of this.players) {
    u.role.eventAnnouncement();
  }
  
  var day = 0;
  while (true) {
    
    yield this.ymessage('Tonight, a beautiful night. 120s to wait.');
    
    this.enter(day, 'night');
    for (var u of this.players) {
      u.role.eventNight();
    }
    // wait night end
    yield timeout(12000);
    this.runQueue();
    
    // the next day
    day++;
    this.enter(day, 'day');
    yield this.ymessage('Day ' + day + ', we have 120s to talk.');
    for (var u of this.players) {
      u.role.eventDay();
    }
    // wait day end
    yield timeout(12000);
    this.runQueue();
    
    this.enter(day, 'dusk');
    yield this.ymessage('Sun falling, we have 120s to vote.');
    for (var u of this.players) {
      u.role.eventDusk();
    }
    // wait day end
    yield timeout(12000);
    this.runQueue();
    
    if (this.checkEnded()) {
      
      // show player list
      var players = this.getSortedPlayers();
      var playerlist = 'Players:\n';
      for (var u of players) {
        playerlist += this.format_name(u)
          + ' ' + u.role.name
          + ' - ' + (u.dead ? 'Dead' : 'Alive') + '\n';
      }
      
      yield this.ymessage(playerlist);
      break;
    }
  }
  
  console.log('game_end', this.chat_id);
}

module.exports = game_process;
