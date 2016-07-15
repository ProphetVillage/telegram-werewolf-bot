'use strict'

const fs = require('fs');
const request = require('request');
const _ = require('underscore');

const config = require('./config');
const BotApi = require('./lib/botapi');
const Wolf = require('./wolf');
const i18nJ = require('./i18n');

// chat_id => Wolf class
var game_sessions = {};
var def_i18n = new i18nJ('en');

var ba = new BotApi(config.token, {
  proxyUrl: config.proxy,
  botName: config.bot_name,
});

function game_ended() {
  delete game_sessions[this.chat_id];
}

ba.setCheck((cmd, upd) => {
  if (upd.message) {
    let chat = upd.message.chat;
    if (!chat) {
      return true;
    }
    if (chat.type === 'group' || chat.type === 'supergroup') {
      return false;
    } else {
      if (cmd !== 'start') {
        ba.sendMessage({
          chat_id: chat.id,
          text: 'Please let me join your group.'
        });
      }
      return true;
    }
  }
  return false;
});

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
ba.commands.on('startgame', (upd, followString) => {
  let chat_id = upd.message.chat.id;
  let user = upd.message.from;
  var wolf = game_sessions[chat_id];
  if (wolf) {
    if (wolf.status === 'open') {
      ba.commands.emit('join', upd, followString);
    } else {
      ba.sendMessage({
        chat_id: chat_id,
        reply_to_message_id: upd.message.message_id,
        text: wolf.i18n.__('game.already_started'),
      }, (err, result) => {
        if (err) {
          console.log(err);
        }
      });
    }
  } else {
    wolf = new Wolf(ba, chat_id, {
      end: game_ended,
      locale: 'zh-CN'
    });
    game_sessions[chat_id] = wolf;
    wolf.join(user);

    let msg = wolf.i18n.__('game.start_a_game', {
      name: wolf.i18n.player_name(user)
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
    msg = def_i18n.__('game.no_game');
  } else {
    let r = wolf.join(user);
    if (r === 1) {
      msg = wolf.i18n.__n('game.joined', wolf.players.length, {
        name: wolf.i18n.player_name(user),
        current: wolf.players.length,
        max: Wolf.MAX_PLAYERS,
        min: Wolf.MIN_PLAYERS
      });
    } else {
      msg = wolf.i18n.__('game.fail_to_join', {
        name: wolf.i18n.player_name(user)
      });
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
  var wolf = game_sessions[chat_id];
  let msg;
  if (wolf) {
    msg = wolf.flee(user);
  } else {
    msg = def_i18n.__('game.no_game');
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

ba.commands.on('forcestart', (upd, followString) => {
  let chat_id = upd.message.chat.id;
  var wolf = game_sessions[chat_id];
  let msg;
  if (wolf) {
    if (wolf.forcestart()) {
      return;
    } else {
      msg = wolf.i18n.__('game.fail_to_forcestart');
    }
  } else {
    msg = def_i18n.__('game.no_game');
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

ba.commands.on('players', (upd, followString) => {
  let chat_id = upd.message.chat.id;
  var wolf = game_sessions[chat_id];

  let msg;
  if (wolf) {
    msg = wolf.getPlayerList(1);
  } else {
    msg = def_i18n.__('game.no_game');
  }

  ba.sendMessage({
    chat_id: chat_id,
    text: msg,
  }, (err, result) => {
    if (err) {
      console.log(err);
    }
  });
});

ba.commands.on('help', (upd, followString) => {
  let chat_id = upd.message.chat.id;
  var wolf = game_sessions[chat_id];

  let msg;
  if (wolf) {
    msg = wolf.i18n.__('game.help');
  } else {
    msg = def_i18n.__('game.help');
  }

  ba.sendMessage({
    chat_id: chat_id,
    text: msg,
  });
});

ba.start();
