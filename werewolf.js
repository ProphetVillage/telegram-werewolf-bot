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

function game_ended() {
  delete game_sessions[this.chat_id];
}

// callback commands
for (var ev of Wolf.Roles.event_list) {
  ba.commands.on(ev, (upd, followString) => {
    let cq = upd.callback_query;
    if (cq && cq.message) {
      var s = followString.split(' ');
      if (s.length > 1) {
        // the last one is [chat_id]
        let chat_id = parseInt(s.pop());
        if (chat_id && chat_id in game_sessions) {
          var wolf = game_sessions[chat_id];
          if (wolf && wolf.status === 'playing') {
            Wolf.Roles.processCallback(wolf, upd, s.join(' '));
            return;
          }
        }
        // just remove selections
        ba.editMessageReplyMarkup({
          chat_id: cq.message.chat.id,
          message_id: cq.message.message_id,
        }, (err, result) => {
        });
      }
    }
  });
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
      end: game_ended,
      locale: 'en'
    });
    game_sessions[chat_id] = wolf;
    wolf.join(user);

    let msg = wolf.i18n.__('game.start_a_game', {
      name: wolf.format_name(user)
    });
    ba.sendMessage({
      chat_id: chat_id,
      reply_to_message_id: upd.message.message_id,
      text: msg,
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
    msg = wolf.i18n.__('game.no_game');
  } else {
    let r = wolf.join(user);
    if (r === 1) {
      msg = wolf.format_name(user) + ' joined the game, /join';
    } else {
      msg = wolf.format_name(user) + ' failed to join the game.';
      if (r) {
        msg += ' ' + r;
      }
    }
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
  let chat_id = upd.message.chat.id;
  var wolf = game_sessions[chat_id];
  let msg;
  if (wolf) {
    if (wolf.forcestart()) {
      return;
    } else {
      msg = 'You can\'t force start the game.';
    }
  } else {
    msg = wolf.i18n.__('game.no_game');
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
