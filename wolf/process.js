'use strict'

const _ = require('underscore');

function timeout(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

function *game_process() {
  console.log('game_start');
  yield timeout(2000);
  console.log('game_end');
}

module.exports = game_process;
