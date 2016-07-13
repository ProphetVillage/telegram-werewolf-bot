'use strict'

const Role = require('./role');

class Witch extends Role {
  constructor(wolf, player) {
    super(wolf, player);

    this.id = 'witch';
    this.name = this.i18n.job_name('witch');
    this.priority = 1;
    
    this.pill_cure = 1;
    this.pill_poison = 1;

    this.allowEvents = [ 'vote', 'cure', 'poison' ];
  }
  
  eventAnnouncement() {
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: this.i18n.__('witch.announcement'),
    }, (err, r) => {
      if (err) console.log(err);
    });
  }
  
  action(ev, target, queue) {
    if (ev === 'cure' && this.pill_cure) {
      this.pill_cure = 0;
      target.role.dead = false;
      queue.removeDeath('cure', target);
      
      this.ba.sendMessage({
        chat_id: target.id,
        text: 'You have been cured.'
      }, (err, r) => {
        if (err) console.log(err);
      });
      return this.wolf.format_name(target) + ' has been cured.';
    } else if (ev === 'poison' && this.pill_poison) {
      this.pill_poison = 0;
      target.role.endOfLife(ev, this.player, queue);
      return this.wolf.format_name(target) + ' has been poisoned.';
    }
  }
  
  eventDawn(queue) {
    let players = this.wolf.players;
    let deadPlayers = queue.deadPlayers;
    let keyboard = [];
    
    var msg = '';
    if (deadPlayers.length > 0) {
      msg += 'Tonight';
    } else {
      msg += 'No person dead tonight, '
    }

    for (var u of deadPlayers) {
      var pname = this.wolf.format_name(u);
      // \/[evname] [user_id] [chat_id]
      msg += ', ' + pname;
      
      keyboard.push([{
        text: 'Cure ' + pname,
        callback_data: this.makeCommand('cure', u.id, this.chat_id)
      }]);
    }
    
    msg += ' were dead, do you want to cure one of them? or';
    
    for (var u of players) {
      if (!u.role.dead) {
        var pname = this.wolf.format_name(u);
        // \/[evname] [user_id] [chat_id]
        keyboard.push([{
          text: 'Poison ' + pname,
          callback_data: this.makeCommand('poison', u.id, this.chat_id)
        }]);
      }
    }
    
    // skip
    keyboard.push([{
      text: 'Skip',
      callback_data: this.makeCommand('cure', 0, this.chat_id)
    }]);

    var self = this;
    this.w_message_id = null;
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: msg + 'do you want to poison someone?',
      reply_markup: JSON.stringify({
        inline_keyboard: keyboard
      }),
    }, (err, r) => {
      if (err) {
        console.log(err);
      } else {
        self.w_message_id = r.message_id;
      }
    });
  }
  
  dawnTimeUp() {
    if (this.w_message_id) {
      this.ba.editMessageText({
        chat_id: this.user_id,
        message_id: this.w_message_id,
        text: this.i18n.__('common.timeup')
      });
    }
  }
  
  eventDawnCallback(queue, upd, data) {
    super.eventDawnCallback(queue, upd, data);

    // update message
    let cq = upd.callback_query;
    this.ba.editMessageText({
      chat_id: cq.message.chat.id,
      message_id: cq.message.message_id,
      text: this.i18n.__('common.selected', { name: data.name })
    });
  }
};

module.exports = Witch;
