'use strict'

const Role = require('./role');

class Prophet extends Role {
  constructor(wolf, player) {
    super(wolf, player);

    this.id = 'prophet';
    this.name = 'Prophet';
    this.priority = 1;

    this.allowEvents = [ 'vote', 'know' ];
  }

  action(ev, target) {
    console.log('action', ev, target.username);
    if (ev === 'know') {
      this.ba.sendMessage({
        chat_id: this.user_id,
        text: 'You see ' + this.wolf.format_name(target) + ' is ' + target.name + '.'
      }, (err, r) => {
        if (err) console.log(err);
      });
    }
  };

  eventAnnouncement() {
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: 'You are a prophet. You can see somebody\'s job.',
    }, (err, r) => {
      if (err) console.log(err);
    });
  }

  eventNight() {
    let players = this.wolf.players;
    let keyboard = [];

    for (var u of players) {
      var pname = this.wolf.format_name(u);
      if (u.id === this.user_id || u.role.dead) {
        continue;
      }
      // [chat_id] \/[evname] [user_id] [username]
      keyboard.push([{
        text: pname,
        callback_data: '/know ' + u.id + ' ' + pname + ' ' + this.chat_id
      }]);
    }

    this.ba.sendMessage({
      chat_id: this.user_id,
      text: 'pick someone to ask about.',
      reply_markup: JSON.stringify({
        inline_keyboard: keyboard
      }),
    }, (err, r) => {
      if (err) console.log(err);
    });
  }

  eventNightCallback(queue, upd, data) {
    super.eventNightCallback(queue, upd, data);

    // update message
    let sdata = data.split(' ');
    let cq = upd.callback_query;
    this.ba.editMessageText({
      chat_id: cq.message.chat.id,
      message_id: cq.message.message_id,
      text: 'Selected - ' + sdata[2]
    });
  }
};

module.exports = Prophet;
