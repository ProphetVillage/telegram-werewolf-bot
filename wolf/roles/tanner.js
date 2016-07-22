'use strict';

const Role = require('./role');

class Tanner extends Role {
  constructor(wolf, player) {
    super(wolf, player);

    this.id = 'tanner';
    this.name = this.i18n.job_name('tanner');
    this.priority = 0;
    this.team = Role.teams.TANNER;

    this.allowEvents = [ 'vote' ];
  }
};

module.exports = Tanner;
