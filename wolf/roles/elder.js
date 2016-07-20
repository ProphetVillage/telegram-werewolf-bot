'use strict';

const Role = require('./role');

class Elder extends Role {
  constructor(wolf, player) {
    super(wolf, player);

    this.id = 'elder';
    this.name = this.i18n.job_name('elder');
    this.priority = 0;

    this.is_bitten = false;

    this.allowEvents = [ 'vote' ];
  }

  eventAnnouncement() {
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: this.i18n.__('elder.announcement'),
    }, (err, r) => {
      if (err) console.log(err);
    });
  }

  endOfLife(ev, killer, queue) {
    if (ev === 'bite') {
      if (killer && killer.role.id === 'wolf') {
        if (!this.is_bitten) {
          this.is_bitten = true;
          this.ba.sendMessage({
            chat_id: this.user_id,
            text: this.i18n.__('elder.wisdom_of_elder')
          }, (err, r) => {
            if (err) console.log(err);
          });
          return;
        }
      }
    } else if (ev === 'vote') {
      // set all skillers to villager
      let players = this.wolf.players;
      var skillerIds = [ 'drunk', 'guardian', 'prophet', 'witch',
          'mason', 'detective', 'bystander' ];
      for (let u of players) {
        if (!u.role.dead && skillerIds.indexOf(u.role.id) >= 0) {
          this.wolf.transformRole(u, 'villager');
          this.ba.sendMessage({
            chat_id: u.role.user_id,
            text: this.i18n.__('elder.shame_of_vote')
          }, (err, r) => {
            if (err) console.log(err);
          });
        }
      }
    }

    super.endOfLife(ev, killer, queue);
  }
};

module.exports = Elder;
