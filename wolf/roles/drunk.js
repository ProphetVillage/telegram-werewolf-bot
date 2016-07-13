'use strict'

const Role = require('./role');

class Drunk extends Role {
  constructor(wolf, player) {
    super(wolf, player);

    this.id = 'drunk';
    this.name = this.i18n.job_name('drunk');
    this.priority = 0;

    this.allowEvents = [ 'vote' ];
  }

  eventAnnouncement() {
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: this.i18n.__('drunk.announcement'),
    }, (err, r) => {
      if (err) console.log(err);
    });
  }
  
  endOfLife(ev, killer, queue) {
    super.endOfLife(ev, killer, queue);
    
    if (ev === 'bite' && killer) {
      if (killer.role.id === 'wolf') {
        killer.role.addBuff('drunk', 3);
        this.ba.sendMessage({
          chat_id: killer.role.user_id,
          text: this.i18n.__('wolf.eat_drunk')
        }, (err, r) => {
          if (err) console.log(err);
        });
      }
    }
  }
};

module.exports = Drunk;
