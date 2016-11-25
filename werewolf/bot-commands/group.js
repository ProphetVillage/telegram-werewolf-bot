'use strict';

const _ = require('underscore');
const S = require('string');

const db = require('../database');
const Wolf = require('../../wolf');

function groupCommands(ba, game_sessions) {

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


ba.commands.on('config', (upd, followString) => {
  let chat = upd.message.chat;
  if (chat.type !== 'private') {
    ba.getChatAdministrators({ chat_id: chat.id }, (err, adms) => {
      if (err) {
        console.log(err);
        return;
      }
      let isadmin = false;
      for (let u of adms) {
        if (upd.message.from.id === u.user.id) {
          isadmin = true;
          break;
        }
      }

      let user = upd.message.from;
      if (isadmin) {
        let chat_id = chat.id;
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
      } else {
        ba.sendMessage({
          chat_id: user.id,
          text: def_i18n.__('game.not_admin')
        });
      }
    });
  }
});

// define command
ba.commands.on('startgame', (upd, followString) => {
  let chat_id = upd.message.chat.id;
  let user = upd.message.from;
  var wolf = game_sessions.get(chat_id);
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
      end: function (chat_id) {
        game_sessions.gameEnd(wolf);
      },
    });
    game_sessions.gameStart(wolf);

    wolf.init(upd.message.chat, (err) => {
      wolf.join(user, (err, followed) => {
        if (!followed) {
          ba.sendMessage({
            chat_id: chat_id,
            reply_to_message_id: message_id,
            text: wolf.i18n.__('game.please_follow_me', {
              name: wolf.i18n.player_name(user),
              bot: wolf.i18n.player_name()
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
  var wolf = game_sessions.get(chat_id);
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
            name: wolf.i18n.player_name(user),
            bot: wolf.i18n.player_name()
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
  var wolf = game_sessions.get(chat_id);
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
  var wolf = game_sessions.get(chat_id);
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
  var wolf = game_sessions.get(chat_id);

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
  var wolf = game_sessions.get(chat_id);

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

ba.commands.on('stats', (upd, followString) => {
  let chat_id = upd.message.chat.id;
  let user_id = upd.message.from.id;

  db.stats.findOne({ user_id: user_id }, (err, stat) => {
    if (err) {
      console.log(err);
      return;
    }

    let msg;
    if (stat) {
      let most_role;
      let most_killed;
      let most_killed_by;
      if (stat.role && Object.keys(stat.role).length > 0) {
        most_role = _.max(Object.keys(stat.role), function (o) { return stat.role[o]; });
      }
      if (stat.killed && Object.keys(stat.killed).length) {
        most_killed = _.max(Object.keys(stat.killed), function (o) { return stat.killed[o].times; });
        if (most_killed) {
          most_killed = stat.killed[most_killed];
        }
      }
      if (stat.killed_by && Object.keys(stat.killed_by).length) {
        most_killed_by = _.max(Object.keys(stat.killed_by), function (o) { return stat.killed_by[o].times; });
        if (most_killed_by) {
          most_killed_by = stat.killed_by[most_killed_by];
        }
      }

      msg = def_i18n.__('status.stats', {
        name: '<b>' + S(stat.name).escapeHTML().s + '</b>',
        total: stat.game.total,
        won: stat.game.won,
        survived: stat.game.survived,
        most_role: most_role ? def_i18n.__(most_role + '.name') : 'Nope',
        most_killed_name: most_killed ? most_killed.name : 'Nope',
        most_killed_times: most_killed ? most_killed.times : 0,
        most_killed_by_name: most_killed_by ? most_killed_by.name : 'Nope',
        most_killed_by_times: most_killed_by ? most_killed_by.times : 0
      });
    } else {
      msg = 'No stats';
    }

    ba.sendMessage({
      chat_id: user_id,
      text: msg
    });
  });
});

ba.commands.on('chatid', (upd, followString) => {
  let chat_id = upd.message.chat.id;

  ba.sendMessage({
    chat_id: chat_id,
    text: 'chat_id: ' + chat_id
  });
});

ba.commands.on('help', (upd, followString) => {
  let chat_id = upd.message.chat.id;
  var wolf = game_sessions.get(chat_id);

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

}

module.exports = groupCommands;
