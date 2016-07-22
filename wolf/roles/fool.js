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
      let jobname;
      for (var u of this.wolf.players) {
        if (u.role.dead || u.role.id === target.role.id) {
          continue;
        }
        names.push(u.role.name);
      }
      if (Math.random() > 0.3) {
        jobname = names[Math.floor(Math.random() * names.length)];
      } else {
        names.push(target.role.name);
        jobname = names[Math.floor(Math.random() * names.length)];
      }
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
