'use strict'

const Role = require('./role');

class Villager extends Role {
  constructor(wolf, player) {
    super(wolf, player);

    this.id = 'villager';
    this.name = this.symbol() + 'Villager';
    this.priority = 0;

    this.allowEvents = [ 'vote' ];
  }

  eventAnnouncement() {
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: 'You are a villager.',
    }, (err, r) => {
      if (err) console.log(err);
    });
  }
};

module.exports = Villager;
