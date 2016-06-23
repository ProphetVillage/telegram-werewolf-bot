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
  yield timeout(2000);
}

module.exports = game_process;
