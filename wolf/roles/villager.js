'use strict';

const Role = require('./role');

class Villager extends Role {
  constructor(wolf, player) {
    super(wolf, player);

    this.id = 'villager';
    this.name = this.i18n.job_name('villager');
    this.priority = 0;

    this.allowEvents = [ 'vote' ];
  }
};

module.exports = Villager;
