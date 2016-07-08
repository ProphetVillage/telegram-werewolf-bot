'use strict'

const Role = require('./role');

class Wolf extends Role {
  constructor(wolf, player) {
    super(wolf, player);

    this.id = 'wolf';
    this.name = 'Wolf';
    this.priority = 1;

    this.allowEvents = [ 'vote', 'bite' ];
  }
  
  action(ev, target) {
    console.log('action', ev, target.username);
    if (ev === 'bite') {
      // killed
      target.role.dead = true;
      this.ba.sendMessage({
        chat_id: target.id,
        text: 'You have been bitten.'
      }, (err, r) => {
        if (err) console.log(err);
      });
      return this.wolf.format_name(target) + ' has been bitten.';
    }
  };
  
  eventAnnouncement() {
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: 'You are a wolf, every night you can eat someone.',
    }, (err, r) => {
      if (err) console.log(err);
    });
  }

  eventNight() {
    let players = this.wolf.players;
    let keyboard = [];

    for (var u of players) {
      var pname = this.wolf.format_name(u);
      if (u.id === this.user_id) {
        // TODO: check is wolf?
        continue;
      }
      // [chat_id] \/[evname] [user_id] [username]
      keyboard.push([{
        text: pname,
        callback_data: '/bite ' + u.id + ' ' + pname + ' ' + this.chat_id
      }]);
    }
    
    // skip
    keyboard.push([{
      text: 'Skip',
      callback_data: '/bite 0 Skip ' + this.chat_id
    }]);

    this.ba.sendMessage({
      chat_id: this.user_id,
      text: 'This night, you want to eat someone, which one you want?',
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

module.exports = Wolf;
