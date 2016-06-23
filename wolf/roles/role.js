'use strict'

function Role(wolf, player) {
  this.wolf = wolf;
  this.ba = wolf.ba;
  this.player = player;

  this.priority = 0; // higher first
  this.name = '';
  this.id = '';
  this.dead = false;
}

Role.prototype.eventDay = function () {

};

Role.prototype.eventDusk = function () {

};

Role.prototype.eventNight = function () {

};
