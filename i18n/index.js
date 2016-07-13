'use strict'

const i18nI = require('i18n-2');
const S = require('string');
const symbol = require('./symbol');

function i18nJ(locale) {
  this._i18n = new i18nI({
      locales: [ locale ],
  });
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

i18nJ.prototype.__ = function (text, values) {
  var t = this._i18n.__(text);
  if (t instanceof Array) {
    // random pick one up
    t = t[getRandomInt(0, t.length)];
  }
  if (values) {
    t = S(t).template(values).s;
  }
  return t;
};

i18nJ.prototype.__n = function (text, count, values) {
  return this.__(text + (count > 1 ? '.other' : '.one'), values);
};

i18nJ.prototype.job_name = function (job) {
  return symbol[job] + this._i18n.__(job + '.name');
};

i18nJ.prototype.player_name = function (player) {
  return player.first_name + (player.last_name ? ' ' + player.last_name : '');
};

i18nJ.prototype.player_list = function (players) {
  var s = '';
  for (let p of players) {
    if (s) s += ', ';
    s += this.player_name(p);
  }
  return s;
};

module.exports = i18nJ;