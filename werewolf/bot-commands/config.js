'use strict';

const db = require('../database');
const Wolf = require('../../wolf');

function configCommands(ba, game_sessions) {

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

}

module.exports = configCommands;
