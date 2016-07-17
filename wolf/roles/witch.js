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
        text: this.i18n.__('witch.cured')
      }, (err, r) => {
        if (err) console.log(err);
      });
    } else if (ev === 'poison' && this.pill_poison) {
      this.pill_poison = 0;
      target.role.endOfLife(ev, this.player, queue);
    }
  }
  
  eventDawn(queue) {
    let players = this.wolf.players;
    let deadPlayers = queue.deadPlayers;
    let keyboard = [];
    
    for (let u of deadPlayers) {    
      let pname = this.i18n.player_name(u);
      keyboard.push([{
        text: this.i18n.__('witch.selection_cure', { name: pname }),
        callback_data: this.makeCommand('cure', u.id, this.chat_id)
      }]);
    }
    
    var msg;
    if (deadPlayers.length > 0) {
      msg = this.i18n.__n('witch.choose_bloody_night', deadPlayers.length, {
        playerlist: this.i18n.player_list(deadPlayers)
      });
    } else {
      msg = this.i18n.__('witch.choose_silent_night');
    }
    
    for (let u of players) {
      if (!u.role.dead) {
        let pname = this.wolf.i18n.player_name(u);
        // \/[evname] [user_id] [chat_id]
        keyboard.push([{
          text: this.i18n.__('witch.selection_poison', { name: pname }),
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
    this.event_message_id = null;
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: msg,
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
  
  dawnTimeUp() {
    if (this.event_message_id) {
      this.ba.editMessageText({
        chat_id: this.user_id,
        message_id: this.event_message_id,
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
