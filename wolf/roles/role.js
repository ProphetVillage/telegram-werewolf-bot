'use strict'

const symbol = require('./../../i18n/symbol');

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
  this.novotetimes = 0;
  this.buff = {};

  // event done flag, refresh every event time
  this.done = false;
  this.allowEvents = [ 'vote' ]; // allowed events' name, such as 'kill'
}

Role.prototype.symbol = function () {
  return symbol[this.id];
};

Role.prototype.makeCommand = function (action, user_id, chat_id) {
  return '/' + action + ' ' + user_id + ' ' + chat_id;
};

Role.prototype.addBuff = function (buff, time) {
  return this.buff[buff] = time;
};

Role.prototype.hasBuff = function (buff) {
  return (buff in this.buff);
};

Role.prototype.updateBuff = function () {
  var passedBuff = [];
  for (var b in this.buff) {
    if (this.buff[b] > 0) {
      this.buff[b]--;
    }
    if (this.buff[b] === 0) {
      passedBuff.push(b);
    }
  }
  for (let b of passedBuff) {
    delete this.buff[b];
  }
};

Role.prototype.isAllowed = function (ev) {
  return this.allowEvents.indexOf(ev) >= 0;
};

Role.prototype.action = function (ev, target, queue) {
  if (!this.dead) {
    // do something
  }
  // msg
  return '';
};

Role.prototype.timeUp = function (time) {
  if (this.done) {
    return;
  }
  
  switch (time) {
    case 'day':
      this.dayTimeUp();
      break;
    case 'dusk':
      this.duskTimeUp();
      break;
    case 'night':
      this.nightTimeUp();
      break;
    case 'dawn':
      this.dawnTimeUp();
      break;
  }
};

Role.prototype.dayTimeUp = function () {
};

Role.prototype.duskTimeUp = function () {
  // TODO: update vote status
  if (this.vote_message_id) {
    this.ba.editMessageText({
      chat_id: this.user_id,
      message_id: this.vote_message_id,
      text: 'Timeup!'
    });
  }
  this.novotetimes++;
  if (this.novotetimes > 2) {
    this.dead = true;
    var mname = this.wolf.format_name(this.player);
    return mname + ' hasn\'t voted for 2 times, the god punished him/her.';
  }
};

Role.prototype.nightTimeUp = function () {
};

Role.prototype.dawnTimeUp = function () {
};

Role.prototype.eventAnnouncement = function () {

};

Role.prototype.eventDay = function (queue) {

};

Role.prototype.eventDusk = function (queue) {
  // default vote
  let players = this.wolf.players;
  let keyboard = [];

  for (var u of players) {
    var pname = this.wolf.format_name(u);
    if (u.id === this.user_id || u.role.dead) {
      continue;
    }
    // \/[evname] [user_id] [chat_id]
    keyboard.push([{
      text: pname,
      callback_data: this.makeCommand('vote', u.id, this.chat_id)
    }]);
  }
  
  // not allow skip
  /*keyboard.push([{
    text: 'Skip',
    callback_data: this.makeCommand('vote', 0, this.chat_id)
  }]);*/

  var self = this;
  this.vote_message_id = null;
  this.ba.sendMessage({
    chat_id: this.user_id,
    text: 'Now, you can vote to kill someone as suspect.',
    reply_markup: JSON.stringify({
      inline_keyboard: keyboard
    }),
  }, (err, r) => {
    if (err) {
      console.log(err);
    } else {
      self.vote_message_id = r.message_id;
    }
  });
};

Role.prototype.eventNight = function (queue) {
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

Role.prototype.eventDawn = function (queue) {
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
      case 'dawn':
        this.eventDawnCallback(queue, upd, data);
        break;
    }
  }
};

Role.defaultCallback = function (queue, upd, data) {
  if (this.isAllowed(data.action)) {
    // /ev id priority
    queue.add(this.player, data.action, data.user_id, this.priority);
  }
};

Role.prototype.eventDayCallback = function (queue, upd, data) {
  Role.defaultCallback.call(this, queue, upd, data);
};

Role.prototype.eventDuskCallback = function (queue, upd, data) {
  Role.defaultCallback.call(this, queue, upd, data);

  let cq = upd.callback_query;
  this.ba.editMessageText({
    chat_id: cq.message.chat.id,
    message_id: cq.message.message_id,
    text: 'Voted - ' + data.name
  });
};

Role.prototype.eventNightCallback = function (queue, upd, data) {
  Role.defaultCallback.call(this, queue, upd, data);
};

Role.prototype.eventDawnCallback = function (queue, upd, data) {
  Role.defaultCallback.call(this, queue, upd, data);
};

module.exports = Role;
