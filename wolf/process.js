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
  
  yield timeout(15000);
  console.log('game_end');
}

module.exports = game_process;
