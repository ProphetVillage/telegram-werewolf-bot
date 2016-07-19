'use strict';

const fs = require('fs');
const request = require('request');
const _ = require('underscore');

const config = require('./config');
const BotApi = require('./lib/botapi');
const DB = require('./lib/db');
const Wolf = require('./wolf');
const i18nJ = require('./i18n');

// chat_id => Wolf class
var game_sessions = {};
var db = {};
var __db = new DB(config.db, (err, _db) => {
  if (err) {
    console.log('Failed to connect database.', err);
    return;
  }
  db.groups = _db.collection('groups');
  db.users = _db.collection('users');

  db.groups.ensureIndex({ chat_id: 1 }, { unique: true, background: true });
  db.users.ensureIndex({ user_id: 1 }, { unique: true, background: true });
});
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
      if (cmd === 'start') {
        return false;
      } else {
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

// user signin
ba.commands.on('start', (upd, followString) => {
  let chat = upd.message.chat;
  if (chat.type === 'private') {
    db.users.findOne({
      user_id: chat.id
    }, (err, r) => {
      if (err) {
        console.log(err);
        return;
      }
      if (!r) {
        // add one
        db.users.save({
          user_id: chat.id,
          username: chat.username,
          name: chat.first_name + (chat.last_name ? ' ' + chat.last_name : '')
        }, (err, r) => {
          ba.sendMessage({
            chat_id: chat.id,
            text: 'Great~',
          });
        });
      }
    });
  }
});

ba.commands.on('setlang', (upd, followString) => {
  let cq = upd.callback_query;
  if (cq && cq.message) {
    var s = followString.split(' ');
    if (s.length > 1) {
      let done_fn = () => {
        ba.editMessageText({
          chat_id: cq.message.chat.id,
          message_id: cq.message.message_id,
          text: 'Done.',
        });
      };
      // the last one is [chat_id]
      let chat_id = parseInt(s.pop());
      let lang = s[0];
      if (chat_id && Wolf.LOCALES.indexOf(lang) >= 0) {
        db.groups.findOne({
          chat_id: chat_id
        }, (err, r) => {
          if (err) {
            console.log(err);
            return;
          }
          if (!r) {
            db.groups.save({
              chat_id: chat_id,
              opts: {
                locale: lang
              }
            }, (err, r) => {
              if (err) {
                console.log(err);
                return;
              }
              done_fn();
            });
          } else {
            if (r.opts) {
              r.opts.locale = lang;
            } else {
              r.opts = { locale: lang };
            }
            db.groups.update({
              chat_id: chat_id,
            }, { $set: { opts: r.opts } }, (err, r) => {
              if (err) {
                console.log(err);
                return;
              }
              done_fn();
            });
          }
        });
      }
    }
  }
});

ba.commands.on('setshowjob', (upd, followString) => {
  let cq = upd.callback_query;
  if (cq && cq.message) {
    var s = followString.split(' ');
    if (s.length > 1) {
      let done_fn = () => {
        ba.editMessageText({
          chat_id: cq.message.chat.id,
          message_id: cq.message.message_id,
          text: 'Done.',
        });
      };
      // the last one is [chat_id]
      let chat_id = parseInt(s.pop());
      let showjob = (s[0] !== 'false');
      if (chat_id) {
        db.groups.findOne({
          chat_id: chat_id
        }, (err, r) => {
          if (err) {
            console.log(err);
            return;
          }
          if (!r) {
            db.groups.save({
              chat_id: chat_id,
              opts: {
                showjob: showjob
              }
            }, (err, r) => {
              if (err) {
                console.log(err);
                return;
              }
              done_fn();
            });
          } else {
            if (r.opts) {
              r.opts.showjob = showjob;
            } else {
              r.opts = { showjob: showjob };
            }
            db.groups.update({
              chat_id: chat_id,
            }, { $set: { opts: r.opts } }, (err, r) => {
              if (err) {
                console.log(err);
                return;
              }
              done_fn();
            });
          }
        });
      }
    }
  }
});

ba.commands.on('setconfig', (upd, followString) => {
  let cq = upd.callback_query;
  if (cq && cq.message) {
    var s = followString.split(' ');
    if (s.length > 1) {
      let chat_id = parseInt(s.pop());
      let conf_sel = s[0];
      if (chat_id) {
        let keyboard = [];
        let text;
        switch (conf_sel) {
          case 'lang':
            for (let l of Wolf.LOCALES) {
              // \/[evname] [user_id] [chat_id]
              keyboard.push([{
                text: l,
                callback_data: '/setlang ' + l + ' ' + chat_id
              }]);
            }
            text = 'Please select a language.';
            break;
          case 'showjob':
            keyboard.push([{
              text: 'Enable',
              callback_data: '/setshowjob true ' + chat_id
            }]);
            keyboard.push([{
              text: 'Disable',
              callback_data: '/setshowjob false ' + chat_id
            }]);
            text = 'Show player\'s job on dead?';
            break;
        }
        if (text) {
          ba.editMessageText({
            chat_id: cq.message.chat.id,
            message_id: cq.message.message_id,
            text: text,
            reply_markup: JSON.stringify({
              inline_keyboard: keyboard
            })
          });
        }
      }
    }
  }
});

ba.commands.on('config', (upd, followString) => {
  let chat = upd.message.chat;
  if (chat.type !== 'private') {
    let chat_id = chat.id;
    let user = upd.message.from;
    let keyboard = [];
    keyboard.push([{
      text: 'Language',
      callback_data: '/setconfig lang ' + chat_id
    }]);
    keyboard.push([{
      text: 'Show Job',
      callback_data: '/setconfig showjob ' + chat_id
    }]);
    ba.sendMessage({
      chat_id: user.id,
      text: 'Settings',
      reply_markup: JSON.stringify({
        inline_keyboard: keyboard
      })
    });
  }
});

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
    let message_id = upd.message.message_id;
    wolf = new Wolf(ba, db, chat_id, {
      end: game_ended
    });
    game_sessions[chat_id] = wolf;

    wolf.init(upd.message.chat, (err) => {
      wolf.join(user, (err, followed) => {
        if (!followed) {
          ba.sendMessage({
            chat_id: chat_id,
            reply_to_message_id: message_id,
            text: wolf.i18n.__('game.please_follow_me', {
              name: wolf.i18n.player_name(user)
            })
          });
        }
      });

      let msg = wolf.i18n.__('game.start_a_game', {
        name: wolf.i18n.player_name(user)
      });
      ba.sendMessage({
        chat_id: chat_id,
        reply_to_message_id: message_id,
        text: msg,
      }, (err, result) => {
        if (err) {
          console.log(err);
        }
      });
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
    let message_id = upd.message.message_id;
    let r = wolf.join(user, (err, followed) => {
      if (!followed) {
        ba.sendMessage({
          chat_id: chat_id,
          reply_to_message_id: message_id,
          text: wolf.i18n.__('game.please_follow_me', {
            name: wolf.i18n.player_name(user)
          })
        });
      }
    });
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
    if (wolf.forcestart(upd.message.from)) {
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

ba.commands.on('nextgame', (upd, followString) => {
  let chat_id = upd.message.chat.id;
  let user = upd.message.from;
  var wolf = game_sessions[chat_id];

  let msg;
  let nextgame_fn = () => {
    wolf.nextGame(user, (err, r) => {});
    msg = wolf.i18n.__('game.next_game');

    ba.sendMessage({
      chat_id: chat_id,
      reply_to_message_id: upd.message.message_id,
      text: msg,
    }, (err, result) => {
      if (err) {
        console.log(err);
      }
    });
  };
  if (!wolf) {
    wolf = new Wolf(ba, db, chat_id, {
      game: false
    });
    wolf.init(upd.message.chat, (err) => {
      if (err) {
        console.log(err);
        return;
      }
      nextgame_fn();
    });
  } else {
    nextgame_fn();
  }
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
