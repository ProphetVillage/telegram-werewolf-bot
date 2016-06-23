'use strict'

function Role(wolf, player) {
  this.wolf = wolf;
  this.chat_id = wolf.chat_id;
  this.ba = wolf.ba;
  this.player = player;

  this.priority = 0; // higher first
  this.name = '';
  this.id = '';
  this.dead = false;

  // event done flag, refresh every event time
  this.done = false;
  this.allowEvents = []; // allowed events' name, such as 'kill'
}

Role.prototype.eventDay = function () {

};

Role.prototype.eventDusk = function () {

};

Role.prototype.eventNight = function () {
  // such as
  /*var self = this;
  // player
  ba.sendMessage({
    chat_id: this.chat_id,
    text: msg,
    reply_markup: JSON.stringify({
      inline_keyboard: [ [ { text: 'Player 1', callback_data: '/kill ' + player1.id },
        { text: 'Player 2', callback_data: '/kill ' + player2.id }] ]
    }),
  }, (err, r) {
    if (err) console.log(err);
  }); */
};

Role.prototype.eventDayCallback = function (queue) {
  // check event done
  if (!this.done && !queue.isEnded()) {
    this.done = true;
    // current waiting time queue.getTime();
  }
};

Role.prototype.eventDuskCallback = function (queue) {
  if (!this.done && !queue.isEnded()) {
    this.done = true;
  }
};

Role.prototype.eventNightCallback = function (queue) {
  if (!this.done && !queue.isEnded()) {
    this.done = true;
    // TODO: add to queue
    // queue.add('kill', whom);
  }
};
