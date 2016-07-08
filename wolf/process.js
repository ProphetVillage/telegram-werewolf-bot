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
  console.log('game_start');
  
  yield this.ymessage('Now allocate roles for players.');
  Roles.setRandomRoles(this, this.players);
  
  // announcement
  for (var u of this.players) {
    u.role.eventAnnouncement();
  }
  
  yield this.ymessage('Tonight, a beautiful night. 120s to wait.');
  for (var u of this.players) {
    u.role.eventNight();
  }
  
  // wait night end
  yield timeout(12000);

  console.log('game_end');
}

module.exports = game_process;
