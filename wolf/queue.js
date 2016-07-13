'use strict'

const _ = require('underscore');

function EventQueue(wolf, isVote) {
  this.wolf = wolf;
  this.queue = [];
  this.deadPlayers = [];
  this.death = [];
  this.ended = false;
  this.isVote = isVote;
}

EventQueue.prototype.add = function (from, ev, user_id, priority) {
  this.queue.push({
    from: from,
    event: ev,
    user_id: user_id,
    priority: priority
  });
  
  //console.log('queue add', ev, user_id);
  
  // TODO: discount no selection role like witch in night
  if (this.queue.length >= this.wolf.players.length) {
    // all selected, run first
    this.finish();
  }
};

EventQueue.prototype.addDeath = function (ev, dead, killer) {
  this.deadPlayers.push(dead);
  this.death.push({
    event: ev,
    dead: dead,
    killer: killer
  });
};

EventQueue.prototype.removeDeath = function (ev, dead) {
  let deadPlayers = this.deadPlayers;
  let i = deadPlayers.indexOf(dead);
  deadPlayers.splice(i, 1);
  this.death.splice(i, 1);
};

EventQueue.prototype.finish = function () {
  if (this.ended) return;
  
  this.ended = true;
  var msg = '';
  
  if (this.isVote) {
    // process vote
    var userlist = {};
    for (var q of this.queue) {
      if (q.user_id) {
        if (!userlist[q.user_id]) {
          userlist[q.user_id] = 1;
        } else {
          userlist[q.user_id]++;
        }
      }
    }
    
    var max = 0, maxdup = false;
    var maxUserId;
    for (var user_id in userlist) {
      if (userlist[user_id] > max) {
        max = userlist[user_id];
        maxdup = false;
        maxUserId = user_id;
      } else if (userlist[user_id] === max) {
        maxdup = true;
      }
    }
    
    if (max && !maxdup) {
      // vote to dead
      var target = this.wolf.findPlayer(parseInt(maxUserId));
      if (target) {
        target.role.endOfLife('vote', null, this);
      } else {
        console.log('vote', 'Something went wrong.');
      }
    }
  }

  // sort by priority
  this.queue = _.sortBy(this.queue, (q) => { return -q.priority });
  
  for (var q of this.queue) {
    if (q.user_id && q.from && !q.from.role.dead) {
      var target = this.wolf.findPlayer(q.user_id);
      if (!target) continue;
      
      q.from.role.action(q.event, target, this);
    }
  }
};

EventQueue.prototype.clearQueue = function () {
  this.ended = false;
  this.queue = [];
};

EventQueue.prototype.isEnded = function () {
  return this.ended;
};

EventQueue.prototype.getDyingMessages = function () {
  if (this.death.length <= 0) {
    return '';
  }
  let msgs = [];
  for (let d of this.death) {
    let __t = this.wolf.i18n.__('death.' + d.event, {
      name: this.wolf.i18n.player_name(d.dead)
    });
    if (__t) msgs.push(__t);
  }
  return msgs.join('\n');
};

EventQueue.prototype.getDeathCount = function () {
  return this.death.length;
};

module.exports = EventQueue;
