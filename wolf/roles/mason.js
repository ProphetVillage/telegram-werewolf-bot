'use strict';

const Villager = require('./villager');

class Mason extends Role {
  constructor(wolf, player) {
    super(wolf, player);

    this.id = 'mason';
    this.name = this.i18n.job_name('mason');
    this.priority = 0;

    this.allowEvents = [ 'vote' ];
  }

  eventAnnouncement() {
    var msg = this.i18n.__('mason.announcement');
    var masons = this.getPartners();

    if (masons.length > 0) {
      msg += this.i18n.__n('mason.partner', masons.length, {
        playerlist: this.i18n.player_list(masons)
      });
    } else {
      msg += this.i18n.__('mason.no_partner');
    }

    this.ba.sendMessage({
      chat_id: this.user_id,
      text: this.i18n.__('mason.announcement'),
    }, (err, r) => {
      if (err) console.log(err);
    });
  }
};

module.exports = Mason;
