'use strict'

const Role = require('./role');

class Wolf extends Role {
  constructor(wolf, player) {
    super(wolf, player);

    this.id = 'wolf';
    this.name = this.i18n.job_name('wolf');
    this.priority = 2;

    this.allowEvents = [ 'vote', 'bite' ];
  }

  action(ev, target, queue) {
    if (ev === 'bite') {
      // killed
      if (target.role.hasBuff('guard')) {
        this.ba.sendMessage({
          chat_id: target.id,
          text: this.i18n.__('guardian.protected')
        }, (err, r) => {
          if (err) console.log(err);
        });
        return;
      } else {
        target.role.endOfLife(ev, this.player, queue);
        // disable message
        /*this.ba.sendMessage({
          chat_id: target.id,
          text: 'You have been bitten.'
        }, (err, r) => {
          if (err) console.log(err);
        });*/
        return;
      }
    }
  };

  eventAnnouncement() {
    var msg = this.i18n.__('wolf.announcement');

    let players = this.wolf.players;
    var hasotherwolf = 0;
    for (var u of players) {
      if (u.id !== this.user_id && u.role.id === 'wolf') {
        var pname = this.wolf.format_name(u);
        if (hasotherwolf > 0) {
          msg += ', ';
        } else {
          msg += ' ';
        }
        msg += pname;
        hasotherwolf++;
      }
    }

    if (hasotherwolf === 1) {
      msg += ' is also wolf.';
    } else if (hasotherwolf > 1) {
      msg += ' are also wolves.';
    }

    this.ba.sendMessage({
      chat_id: this.user_id,
      text: msg
    }, (err, r) => {
      if (err) console.log(err);
    });
  }

  eventNight(queue) {
    if (this.hasBuff('drunk')) {
      this.ba.sendMessage({
        chat_id: this.user_id,
        text: 'You drunk tonight, nothing to do.'
      });
      return;
    }
    
    let players = this.wolf.players;
    let keyboard = [];

    for (var u of players) {
      /*if (u.id === this.user_id || u.role.id === 'wolf') {
        continue;
      }*/
      var pname = this.wolf.format_name(u);
      // \/[evname] [user_id] [chat_id]
      keyboard.push([{
        text: pname,
        callback_data: this.makeCommand('bite', u.id, this.chat_id)
      }]);
    }

    // skip
    keyboard.push([{
      text: 'Skip',
      callback_data: this.makeCommand('bite', 0, this.chat_id)
    }]);

    var self = this;
    this.bite_message_id = null;
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: this.i18n.__('wolf.choose'),
      reply_markup: JSON.stringify({
        inline_keyboard: keyboard
      }),
    }, (err, r) => {
      if (err) {
        console.log(err);
      } else {
        self.bite_message_id = r.message_id;
      }
    });
  }

  nightTimeUp() {
    // TODO: update selections
    if (this.bite_message_id) {
      this.ba.editMessageText({
        chat_id: this.user_id,
        message_id: this.bite_message_id,
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

    // tell other wolves
    let players = this.wolf.players;
    var mname = this.wolf.format_name(this.player);
    var msg = mname + ' selected ' + data.name;
    for (var u of players) {
      if (u.id !== this.user_id && u.role.id === 'wolf') {
        this.ba.sendMessage({
          chat_id: u.id,
          text: msg
        });
      }
    }
  }
};

module.exports = Wolf;
