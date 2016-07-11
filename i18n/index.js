'use strict'

const i18nI = require('i18n-2');
const symbol = require('./symbol');

function i18nJ(locale) {
  this._i18n = new i18nI({
      locales: [ locale ],
  });
}

i18nJ.prototype.__ = function (text) {
  // TODO: add format
  return this._i18n.__(text);
};

i18nJ.prototype.job_name = function (job) {
  return symbol[job] + this._i18n.__(job + '.name');
};

module.exports = i18nJ;
