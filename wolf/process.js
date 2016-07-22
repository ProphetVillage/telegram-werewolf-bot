'use strict';

const _ = require('underscore');
const Roles = require('./roles');

function timeout(ms, queue) {
  return new Promise(function (resolve, reject) {
    var d = false;
    var __t = setTimeout(() => {
      d = true;
      resolve();
    }, ms);
    if (queue) {
      queue.afterFinish(() => {
        if (d) {
          return;
        }
        clearTimeout(__t);
        // delay 1s
        setTimeout(resolve, 1000);
      });
    }
  });
}

function *game_process() {
  console.log('game_start', this.chat_id);

  yield this.ymessage(this.i18n.__('game.start')
    + '\n\n'
    + this.i18n.__('game.allocate_roles'));
  Roles.setRandomRoles(this, this.players);

  // announcement
  for (var u of this.players) {
    u.role.eventAnnouncement();
  }

  var day = 0;
  var msg = '';
  while (true) {

    yield this.ymessage(msg
      + this.i18n.__('scene.night', { time: 60 }));

    this.enter(day, 'night');
    for (var u of this.players) {
      if (!u.role.dead) {
        u.role.eventNight(this.queue);
      }
    }
    // wait night end
    yield timeout(60000, this.queue);
    this.runQueue();  // no msg this time

    this.enter(day, 'dawn');
    for (var u of this.players) {
      if (!u.role.dead) {
        u.role.eventDawn(this.queue);
      }
    }
    if (this.queue.hasVoter()) {
      // check need to waiting
      yield timeout(30000, this.queue);
    }
    msg = this.runQueue();

    if (this.checkEnded()) {
      break;
    }

    if (this.queue.getDeathCount() <= 0) {
      msg += this.i18n.__('death.silent_night') + '\n\n';
    }

    // the next day
    day++;
    this.enter(day, 'day');
    yield this.ymessage(msg
      + this.i18n.__('scene.day', { time: 90, day: day }));
    for (var u of this.players) {
      if (!u.role.dead) {
        u.role.eventDay(this.queue);
      }
    }
    // wait day end
    yield timeout(90000); // no queue timeout
    msg = this.runQueue();

    if (this.checkEnded()) {
      break;
    }

    // vote stage
    this.enter(day, 'dusk');
    yield this.ymessage(msg
      + this.i18n.__('scene.dusk', { time: 90 }));
    for (var u of this.players) {
      if (!u.role.dead) {
        u.role.eventDusk(this.queue);
      }
    }
    // wait day end
    yield timeout(90000, this.queue);
    msg = this.runQueue();

    if (this.checkEnded()) {
      break;
    }
  }

  if (msg) yield this.ymessage(msg);

  let playerlist = this.getPlayerList(2);
  msg = this.i18n.__('winner.' + this.winner_team);
  yield this.ymessage(msg + '\n\n' + playerlist);
  yield update_stats(this, this.db, this.players);

  console.log('game_end', this.chat_id);
}

function *update_stats(wolf, db, players) {
  players.forEach(function (p) {
    db.stats.findOne({
      user_id: p.id
    }, (err, stat) => {
      if (err) {
        console.log(err);
        return;
      }

      let notexists = false;

      if (!stat) {
        notexists = true;

        stat = {
          user_id: p.id,
          game: {
            total: 0,
            won: 0,
            survived: 0
          },
          role: {},
          killed: {},
          killed_by: {}
        };
      }

      // stat
      stat.name = wolf.i18n.player_name(p, true);
      stat.game.total++;
      if (wolf.winner_team === p.role.team) {
        stat.game.won++;
      }
      if (!p.role.dead) {
        stat.game.survived++;
      }

      let role_id = p.role.getInitialRoleId();
      if (role_id in stat.role) {
        stat.role[role_id]++;
      } else {
        stat.role[role_id] = 1;
      }

      if (p.id in wolf.stats_killed) {
        for (let deadId of wolf.stats_killed[p.id]) {
          let d = wolf.findPlayer(parseInt(deadId));
          if (d) {
            if (d.id in stat.killed) {
              stat.killed[d.id].times++;
            } else {
              stat.killed[d.id] = {
                times: 1,
                user_id: d.id
              };
            }
            stat.killed[d.id].name = wolf.i18n.player_name(d, true);
          }
        }
      }

      if (p.id in wolf.stats_killed_by) {
        let killerId = wolf.stats_killed_by[p.id];
        let k = wolf.findPlayer(parseInt(killerId));
        if (k) {
          if (k.id in stat.killed_by) {
            stat.killed_by[k.id].times++;
          } else {
            stat.killed_by[k.id] = {
              times: 1,
              user_id: k.id
            };
          }
          stat.killed_by[k.id].name = wolf.i18n.player_name(k, true);
        }
      }

      if (notexists) {
        db.stats.save(stat, (err, r) => {});
      } else {
        // update
        delete stat._id;
        delete stat.user_id;

        db.stats.update({ user_id: p.id }, {
          $set: stat
        }, (err, r) => {});
      }
    });
  });
}

module.exports = game_process;
