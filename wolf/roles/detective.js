'use strict';

const Role = require('./role');

class Detective extends Role {
  constructor(wolf, player) {
    super(wolf, player);

    this.id = 'detective';
    this.name = this.i18n.job_name('detective');
    this.priority = 0;

    this.allowEvents = [ 'vote', 'detect' ];
  }

  action(ev, target, queue) {
    if (ev === 'detect') {
      this.ba.sendMessage({
        chat_id: this.user_id,
        text: this.i18n.__('detective.see', {
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
      text: this.i18n.__('detective.announcement'),
    }, (err, r) => {
      if (err) console.log(err);
    });
  }

  eventDay() {
    let players = this.wolf.players;
    let keyboard = [];

    for (var u of players) {
      var pname = this.wolf.i18n.player_name(u, true);
      if (u.id === this.user_id || u.role.dead) {
        continue;
      }
      // \/[evname] [user_id] [chat_id]
      keyboard.push([{
        text: pname,
        callback_data: this.makeCommand('detect', u.id, this.chat_id)
      }]);
    }

    var self = this;
    queue.addVoter(this.player);
    this.event_message_id = null;
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: this.i18n.__('detective.choose'),
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

};

module.exports = Detective;
