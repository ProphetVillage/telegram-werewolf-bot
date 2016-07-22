'use strict';

const Role = require('./role');

class Tanner extends Role {
  constructor(wolf, player) {
    super(wolf, player);

    this.id = 'tanner';
    this.name = this.i18n.job_name('tanner');
    this.priority = 0;

    this.allowEvents = [ 'vote' ];
  }

  eventAnnouncement() {
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: this.i18n.__('tanner.announcement'),
    }, (err, r) => {
      if (err) console.log(err);
    });
  }
};

module.exports = Tanner;
