'use strict';

const BotApi = require('../lib/botapi');
const config = require('../config');
const botCommands = require('./bot-commands');
const session = require('./session');

var ba = new BotApi(config.token, {
  proxyUrl: config.proxy,
  botName: config.bot_name,
});

botCommands(ba, session);

module.exports = ba;
