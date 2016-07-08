'use strict'

function EventQueue() {
  this.queue = [];
  this.ended = false;
}

EventQueue.prototype.add = function (ev, user_id, priority) {
  this.queue.push({
    event: ev,
    user_id: user_id,
    priority: priority
  });
};

EventQueue.prototype.finish = function () {
  this.ended = true;
};

EventQueue.prototype.isEnded = function () {
  return this.ended;
};

module.exports = EventQueue;
