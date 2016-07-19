'use strict';

const Role = require('./role');

class Guardian extends Role {
  constructor(wolf, player) {
    super(wolf, player);

    this.id = 'guardian';
    this.name = this.i18n.job_name('guardian');
    this.priority = 3;

    this.allowEvents = [ 'vote', 'protect' ];
  }

  action(ev, target, queue) {
    if (ev === 'protect') {
      if (target.role.id === 'wolf') {
        if (Math.random() < 0.5) {
          // death
          this.endOfLife('bite', this.player, queue);
          this.ba.sendMessage({
            chat_id: this.user_id,
            text: this.i18n.__('wolf.bite_you')
          }, (err, r) => {
            if (err) console.log(err);
          });
          return;
        }
      }
      target.role.addBuff('guard', 1, this.player);
    }
  }

  eventAnnouncement() {
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: this.i18n.__("guardian.announcement")
    }, (err, r) => {
      if (err) console.log(err);
    });
  }

  eventNight(queue) {
    let players = this.wolf.players;
    let keyboard = [];

    for (var u of players) {
      if (u.role.dead) {
        continue;
      }
      var pname = this.wolf.i18n.player_name(u, true);
      // \/[evname] [user_id] [chat_id]
      keyboard.push([{
        text: pname,
        callback_data: this.makeCommand('protect', u.id, this.chat_id)
      }]);
    }

    // skip
    keyboard.push([{
      text: 'Skip',
      callback_data: this.makeCommand('protect', 0, this.chat_id)
    }]);

    var self = this;
    queue.addVoter(this.player);
    this.event_message_id = null;
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: this.i18n.__("guardian.choose"),
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

module.exports = Guardian;
