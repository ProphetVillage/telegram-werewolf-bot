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
        text: this.i18n.__('prophet.see', {
          name: this.wolf.i18n.player_name(target),
          job: target.role.name
        })
      }, (err, r) => {
        if (err) console.log(err);
      });
    }
  }

  eventAnnouncement() {
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: this.i18n.__('prophet.announcement')
    }, (err, r) => {
      if (err) console.log(err);
    });
  }

  eventNight(queue) {
    let players = this.wolf.players;
    let keyboard = [];

    for (var u of players) {
      var pname = this.wolf.i18n.player_name(u);
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
    queue.addVoter(this.player);
    this.event_message_id = null;
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: this.i18n.__('prophet.choose'),
      reply_markup: JSON.stringify({
        inline_keyboard: keyboard
      }),
    }, (err, r) => {
      if (err) {
        console.log(err);
      } else {
        self.event_message_id = r.message_id;
      }
    });
  }

  nightTimeUp() {
    if (this.event_message_id) {
      this.ba.editMessageText({
        chat_id: this.user_id,
        message_id: this.event_message_id,
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
      text: this.i18n.__('common.selected', { name: data.name })
    });
  }
};

module.exports = Prophet;
