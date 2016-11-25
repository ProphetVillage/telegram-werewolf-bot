'use strict';

function check(ba, game_sessions) {

ba.setCheck((cmd, upd) => {
  if (upd.message) {
    let chat = upd.message.chat;
    if (!chat) {
      return true;
    }
    if (chat.type === 'group' || chat.type === 'supergroup') {
      return false;
    } else {
      if (cmd === 'start' || cmd === 'stats') {
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

}

module.exports = check;
