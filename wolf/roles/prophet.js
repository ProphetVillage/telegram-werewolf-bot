'use strict'

const Role = require('./role');

class Prophet extends Role {
  constructor(wolf, player) {
    super(wolf, player);

    this.id = 'prophet';
    this.name = this.i18n.job_name('prophet');
    this.priority = 1;

    this.allowEvents = [ 'vote', 'know' ];
  }

  action(ev, target) {
    if (ev === 'know') {
      this.ba.sendMessage({
        chat_id: this.user_id,
        text: 'You see ' + this.wolf.format_name(target) + ' is ' + target.role.name + '.'
      }, (err, r) => {
        if (err) console.log(err);
      });
    }
  };

  eventAnnouncement() {
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: this.i18n.__('prophet.announcement')
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
      // \/[evname] [user_id] [chat_id]
      keyboard.push([{
        text: pname,
        callback_data: this.makeCommand('know', u.id, this.chat_id)
      }]);
    }

    var self = this;
    this.know_message_id = null;
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: 'Pick someone to ask about.',
      reply_markup: JSON.stringify({
        inline_keyboard: keyboard
      }),
    }, (err, r) => {
      if (err) {
        console.log(err);
      } else {
        self.know_message_id = r.message_id;
      }
    });
  }

  nightTimeUp() {
    if (this.know_message_id) {
      this.ba.editMessageText({
        chat_id: this.user_id,
        message_id: this.know_message_id,
        text: this.i18n.__('common.timeup')
      });
    }
  }

  eventNightCallback(queue, upd, data) {
    super.eventNightCallback(queue, upd, data);

    // update message
    let cq = upd.callback_query;
    this.ba.editMessageText({
      chat_id: cq.message.chat.id,
      message_id: cq.message.message_id,
      text: 'Selected - ' + data.name
    });
  }
};

module.exports = Prophet;
