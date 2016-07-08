'use strict'

function Role(wolf, player) {
  this.wolf = wolf;
  this.chat_id = wolf.chat_id;
  this.ba = wolf.ba;
  this.player = player;
  this.user_id = player.id;

  this.priority = 0; // higher first
  this.name = '';
  this.id = '';
  this.dead = false;

  // event done flag, refresh every event time
  this.done = false;
  this.allowEvents = [ 'vote' ]; // allowed events' name, such as 'kill'
}

Role.prototype.isAllowed = function (ev) {
  return this.allowEvents.indexOf(ev) >= 0;
};

Role.prototype.action = function (ev, target) {
  if (!this.dead) {
    // do something
  }
  // msg
  return '';
};

Role.prototype.eventAnnouncement = function () {

};

Role.prototype.eventDay = function () {

};

Role.prototype.eventDusk = function () {
  // default vote
  let players = this.wolf.players;
  let keyboard = [];

  for (var u of players) {
    var pname = this.wolf.format_name(u);
    if (u.id === this.user_id) {
      continue;
    }
    // [chat_id] \/[evname] [user_id] [username]
    keyboard.push([{
      text: pname,
      callback_data: '/vote ' + u.id + ' ' + pname + ' ' + this.chat_id
    }]);
  }
  
  // not allow skip
  /*keyboard.push([{
    text: 'Skip',
    callback_data: '/vote 0 * ' + this.chat_id
  }]);*/

  this.ba.sendMessage({
    chat_id: this.user_id,
    text: 'Now, you can vote to kill someone as suspect.',
    reply_markup: JSON.stringify({
      inline_keyboard: keyboard
    }),
  }, (err, r) => {
    if (err) console.log(err);
  });
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

Role.prototype.eventCallback = function (time, queue, upd, data) {
  if (!(upd.callback_query && upd.callback_query.message)) {
    // check valid data
    return;
  }
  if (!this.done && !queue.isEnded()) {
    // check event done
    this.done = true;
    // current waiting time queue.getTime();
    switch (time) {
      case 'day':
        this.eventDayCallback(queue, upd, data);
        break;
      case 'dusk':
        this.eventDuskCallback(queue, upd, data);
        break;
      case 'night':
        this.eventNightCallback(queue, upd, data);
        break;
    }
  }
};

Role.defaultCallback = function (queue, upd, data) {
  let sdata = data.split(' ');
  if (sdata.length >= 2) {
    let ev = sdata[0].substr(1)
    if (this.isAllowed(ev)) {
      // /ev id priority
      queue.add(this.player, ev, parseInt(sdata[1]), this.priority);
    }
  }
};

Role.prototype.eventDayCallback = function (queue, upd, data) {
  Role.defaultCallback.call(this, queue, upd, data);
};

Role.prototype.eventDuskCallback = function (queue, upd, data) {
  Role.defaultCallback.call(this, queue, upd, data);
  
  let sdata = data.split(' ');
  let cq = upd.callback_query;
  this.ba.editMessageText({
    chat_id: cq.message.chat.id,
    message_id: cq.message.message_id,
    text: 'Voted - ' + sdata[2]
  });
};

Role.prototype.eventNightCallback = function (queue, upd, data) {
  // TODO: add to queue
  // queue.add('kill', whom);
  Role.defaultCallback.call(this, queue, upd, data);
};

module.exports = Role;
