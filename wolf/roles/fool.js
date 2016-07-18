'use strict';

const Prophet = require('./prophet');

class Fool extends Prophet {
  constructor(wolf, player) {
    super(wolf, player);

    this.id = 'fool';
    this.name = this.i18n.job_name('fool');
    this.priority = 1;

    this.allowEvents = [ 'vote', 'know' ];
  }

  action(ev, target, queue) {
    if (ev === 'know') {
      let names = [];
      for (var u of this.wolf.players) {
        if (u.role.dead) {
          continue;
        }
        names.push(u.role.name);
      }
      var jobname = names[Math.floor(Math.random() * names.length)];
      this.ba.sendMessage({
        chat_id: this.user_id,
        text: this.i18n.__('fool.see', {
          name: this.wolf.i18n.player_name(target),
          job: jobname
        })
      }, (err, r) => {
        if (err) console.log(err);
      });
    }
  };

};

module.exports = Fool;
