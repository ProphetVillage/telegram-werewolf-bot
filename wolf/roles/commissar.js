'use strict';

const Role = require('./role');

class Commissar extends Role {
  constructor(wolf, player) {
    super(wolf, player);

    this.id = 'commissar';
    this.name = this.i18n.job_name('commissar');
    this.priority = 2;

    this.allowEvents = [ 'vote', 'isparty' ];
  }

  action(ev, target, queue) {
    if (ev === 'isparty') {
      // killed
      if (target.role.id === 'partymember') {
        target.role.endOfLife(ev, this.player, queue);

        // message target
        this.ba.sendMessage({
          chat_id: this.user_id,
          text: this.i18n.__('commissar.found_partymember', {
            name: this.i18n.player_name(target)
          })
        }, (err, r) => {
          if (err) console.log(err);
        });
      } else {
        this.ba.sendMessage({
          chat_id: this.user_id,
          text: this.i18n.__('commissar.notfound', {
            name: this.i18n.player_name(target)
          })
        }, (err, r) => {
          if (err) console.log(err);
        });
      }
    }
  }

  eventNight(queue) {
    let players = this.wolf.players;
    let keyboard = [];

    for (let u of players) {
      if (u.role.dead || u.id === this.user_id) {
        continue;
      }
      let pname = this.wolf.i18n.player_name(u, true);
      // \/[evname] [user_id] [chat_id]
      keyboard.push([{
        text: pname,
        callback_data: this.makeCommand('isparty', u.id, this.chat_id)
      }]);
    }

    // skip
    keyboard.push([{
      text: 'Skip',
      callback_data: this.makeCommand('isparty', 0, this.chat_id)
    }]);

    var self = this;
    queue.addVoter(this.player);
    this.event_message_id = null;
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: this.i18n.__('commissar.choose'),
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

module.exports = Commissar;
