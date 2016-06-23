'use strict'

const fs = require('fs');
const request = require('request');
const _ = require('underscore');

const config = require('./config');
const BotApi = require('./lib/botapi');
const Wolf = require('./wolf');

// chat_id => Wolf class
var game_sessions = {};

var ba = new BotApi(config.token, {
  proxyUrl: config.proxy,
  botName: config.bot_name,
});

function game_ended(chat_id) {
  game_sessions[chat_id] = null;
}

// define command
ba.commands.on('start', (upd, followString) => {
  let chat_id = upd.message.chat.id;
  var wolf = game_sessions[chat_id];
  if (wolf) {
    ba.sendMessage({
      chat_id: chat_id,
      reply_to_message_id: upd.message.message_id,
      text: 'A game already started.',
    }, (err, result) => {
      if (err) {
        console.log(err);
      }
    });
  } else {
    let user = upd.message.from;
    wolf = new Wolf(ba, chat_id, {
      end: game_ended
    });
    game_sessions[chat_id] = wolf;
    wolf.join(user);

    let msg = wolf.format_name(user) + ' start a new game, /join';
    ba.sendMessage({
      chat_id: chat_id,
      reply_to_message_id: upd.message.message_id,
      text: 'A new game started.',
    }, (err, result) => {
      if (err) {
        console.log(err);
      }
    });
  }
});

ba.commands.on('join', (upd, followString) => {
  let chat_id = upd.message.chat.id;
  let user = upd.message.from;
  let msg;
  var wolf = game_sessions[chat_id];
  if (!wolf) {
    msg = 'No game, /start';
  } else if (wolf.join(user)) {
    msg = wolf.format_name(user) + ' joined the game, /join';
  } else {
    msg = wolf.format_name(user) + ' failed to join the game';
  }
  ba.sendMessage({
    chat_id: chat_id,
    reply_to_message_id: upd.message.message_id,
    text: msg,
  }, (err, result) => {
    if (err) {
      console.log(err);
    }
  });
});

ba.commands.on('flee', (upd, followString) => {
  let chat_id = upd.message.chat.id;
  let user = upd.message.from;
  // TODO
});

ba.commands.on('forcestart', (upd, followString) => {
  var wolf = game_sessions[chat_id];
  let msg;
  if (wolf) {
    if (!wolf.forcestart()) {
      msg = 'You can\'t force start the game.';
    }
  } else {
    msg = 'No game in process.';
  }

  ba.sendMessage({
    chat_id: chat_id,
    reply_to_message_id: upd.message.message_id,
    text: msg,
  }, (err, result) => {
    if (err) {
      console.log(err);
    }
  });
});

ba.start();
