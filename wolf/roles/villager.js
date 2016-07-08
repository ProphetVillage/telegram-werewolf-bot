'use strict'

const Role = require('./role');

class Villager extends Role {
  constructor(villager, player) {
    super(villager, player);

    this.id = 'villager';
    this.name = 'Villager';
    this.priority = 0;

    this.allowEvents = [''];
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
