'use strict';

const Wolf = require('./../../wolf');

function roleEvents(ba, game_sessions) {

// callback commands
for (var ev of Wolf.Roles.event_list) {
  ba.commands.on(ev, (upd, followString) => {
    let cq = upd.callback_query;
    if (cq && cq.message) {
      var s = followString.split(' ');
      if (s.length > 1) {
        // the last one is [chat_id]
        let chat_id = parseInt(s.pop());
        if (!chat_id) {
          return;
        }
        var wolf = game_sessions.get(chat_id);
        if (wolf && wolf.status === 'playing') {
          Wolf.Roles.processCallback(wolf, upd, s.join(' '));
          return;
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

}

module.exports = roleEvents;
