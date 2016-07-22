'use strict';

const role_list = require('./index').role_list;

function Role(wolf, player) {
  this.wolf = wolf;
  this.chat_id = wolf.chat_id;
  this.ba = wolf.ba;
  this.i18n = wolf.i18n;
  this.player = player;
  this.user_id = player.id;

  this.priority = 0; // higher first
  this.name = '';
  this.id = '';
  this.dead = false;
  this.novotetimes = 0;
  this.buff = {};
  this.role_chains = [];
  this.team = Role.teams.VILLAGER;

  // event message
  this.event_message_id = null;

  // event done flag, refresh every event time
  this.done = false;
  this.allowEvents = [ 'vote' ]; // allowed events' name, such as 'kill'
}

Role.teams = {
  VILLAGER: 'VILLAGER',
  WOLF: 'WOLF',
  PARTY: 'PARTY',
  TANNER: 'TANNER'
};

Role.prototype.makeCommand = function (action, user_id, chat_id) {
  return '/' + action + ' ' + user_id + ' ' + chat_id;
};

Role.prototype.addBuff = function (buff, time, _from) {
  return this.buff[buff] = {
    time: time,
    from: _from
  };
};

Role.prototype.hasBuff = function (buff) {
  return (buff in this.buff) ? this.buff[buff] : false;
};

Role.prototype.updateBuff = function () {
  var passedBuff = [];
  for (var b in this.buff) {
    if (this.buff[b].time > 0) {
      this.buff[b].time--;
    }
    if (this.buff[b].time === 0) {
      passedBuff.push(b);
    }
  }
  for (let b of passedBuff) {
    delete this.buff[b];
  }
};

Role.prototype.getBuffFrom = function (buff) {
  var b = this.buff[buff];
  if (b) {
    return b.from;
  } else {
    return null;
  }
};

Role.prototype.isAllowed = function (ev) {
  return this.allowEvents.indexOf(ev) >= 0;
};

Role.prototype.action = function (ev, target, queue) {
  if (!this.dead) {
    // do something
  }
};

Role.prototype.endOfLife = function (ev, killer, queue) {
  this.dead = true;
  queue.addDeath(ev, this.player, killer);

  if (this.done && this.event_message_id) {
    this.ba.editMessageText({
      chat_id: this.user_id,
      message_id: this.event_message_id,
      text: this.i18n.__('common.death_lock')
    });
  }
};

Role.prototype.timeUp = function (time, queue) {
  if (this.done) {
    return;
  }

  switch (time) {
    case 'day':
      this.dayTimeUp(queue);
      break;
    case 'dusk':
      this.duskTimeUp(queue);
      break;
    case 'night':
      this.nightTimeUp(queue);
      break;
    case 'dawn':
      this.dawnTimeUp(queue);
      break;
  }
};

Role.prototype.dayTimeUp = function (queue) {
};

Role.prototype.duskTimeUp = function (queue) {
  // update vote status
  if (this.vote_message_id) {
    this.ba.editMessageText({
      chat_id: this.user_id,
      message_id: this.vote_message_id,
      text: this.i18n.__('common.timeup')
    });
  }
  this.novotetimes++;
  if (this.novotetimes >= 2) {
    this.endOfLife('vote_punishment', null, queue);
  }
};

Role.prototype.nightTimeUp = function (queue) {
};

Role.prototype.dawnTimeUp = function (queue) {
};

Role.prototype.eventAnnouncement = function () {
  this.ba.sendMessage({
    chat_id: this.user_id,
    text: this.i18n.__(this.id + '.announcement'),
  }, (err, r) => {
    if (err) console.log(err);
  });
};

Role.prototype.eventDay = function (queue) {

};

Role.prototype.eventDusk = function (queue) {
  // default vote
  let players = this.wolf.players;
  let keyboard = [];

  for (var u of players) {
    var pname = this.wolf.i18n.player_name(u, true);
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
  queue.addVoter(this.player);
  this.vote_message_id = null;
  this.ba.sendMessage({
    chat_id: this.user_id,
    text: this.i18n.__('common.voted_choose'),
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
    text: this.i18n.__('common.voted', { name: data.name })
  });

  this.ba.sendMessage({
    chat_id: this.chat_id,
    text: this.i18n.__('common.voted_to', {
      name: this.i18n.player_name(this.player),
      target_name: data.name
    })
  });
};

Role.prototype.eventNightCallback = function (queue, upd, data) {
  Role.defaultCallback.call(this, queue, upd, data);
};

Role.prototype.eventDawnCallback = function (queue, upd, data) {
  Role.defaultCallback.call(this, queue, upd, data);
};

Role.prototype.getPartners = function (role = this.id, dead = false, self = false) {
  let players = this.wolf.players;
  var partners = [];
  for (let u of players) {
    if (u.role.id === role) {
      if ((u.role.dead && !dead) || ((u.id === this.user_id) && !self)) {
        continue;
      }
      partners.push(u);
    }
  }
  return partners;
};

module.exports = Role;
