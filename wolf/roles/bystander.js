'use strict';

const Role = require('./role');

class Bystander extends Role {
  constructor(wolf, player) {
    super(wolf, player);

    this.id = 'bystander';
    this.name = this.i18n.job_name('bystander');
    this.priority = 0;

    this.allowEvents = [ 'vote' ];
  }

  eventAnnouncement() {
    var msg = this.i18n.__('bystander.announcement');
    var prophet;

    for (let p of this.wolf.players) {
      if (p.role.id === 'prophet') {
        prophet = p;
        break;
      }
    }

    if (prophet) {
      msg += this.i18n.__('bystander.see_prophet', {
        name: this.i18n.player_name(prophet)
      });
    } else {
      msg += this.i18n.__('bystander.no_prophet');
    }

    this.ba.sendMessage({
      chat_id: this.user_id,
      text: msg,
    }, (err, r) => {
      if (err) console.log(err);
    });
  }
};

module.exports = Bystander;
