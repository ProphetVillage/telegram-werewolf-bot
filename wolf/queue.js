'use strict'

const _ = require('underscore');

function EventQueue(wolf, isVote) {
  this.wolf = wolf;
  this.queue = [];
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
  
  console.log('queue add', ev, user_id);
  
  if (this.queue.length >= this.wolf.players.length) {
    // all selected, run first
    this.finish();
  }
};

EventQueue.prototype.finish = function () {
  if (this.ended) return this.msg;
  
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
      var target = this.wolf.findPlayer(maxUserId);
      target.role.dead = true;
      msg = this.wolf.format_name(target) + ' was voted to die.';
    } else {
      msg = 'No one has to die.';
    }
    
    msg += '\n';
    this.msg = msg;
    
    return msg;
  }

  // sort by priority
  this.queue = _.sortBy(this.queue, (q) => { return -q.priority });
  
  for (var q of this.queue) {
    if (q.user_id && q.from && !q.from.role.dead) {
      var target = this.wolf.findPlayer(q.user_id);
      if (!target) continue;
      
      var t_msg = q.from.role.action(q.event, target);
      if (t_msg) {
        msg += t_msg + '\n';
      }
    }
  }
  
  this.msg = msg;
  
  return msg;
};

EventQueue.prototype.isEnded = function () {
  return this.ended;
};

module.exports = EventQueue;
