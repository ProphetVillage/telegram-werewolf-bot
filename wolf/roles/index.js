'use strict'

const _ = require('underscore');

var Roles = {
  // list of roles
  Villager: require('./villager'),
  Wolf: require('./wolf'),
  Prophet: require('./prophet'),
  Fool: require('./fool')
};

exports.Roles = Roles;

// list of Roles' id
exports.role_list = [ 'villager', 'wolf', 'prophet', 'fool' ];
exports.event_list = [ 'vote', 'bite', 'know' ];

var getRandom = function (max = 1, base = 0) {
  return Math.floor(Math.random() * (max + 1 - base) + base);
};

exports.setRandomRoles = function (wolf, players) {
  // TODO: set player role here
  // for test
  // var list = [ 'prophet', 'fool', 'witch', 'guardian' ];
  var list = [ 'prophet', 'fool' ];
  var player_count = players.length;
  var roles = [];
  var wolfs;

  if (player_count < 7) {
    wolfs = 1;
  } else if (player_count < 10) {
    wolfs = getRandom(2, 1);
  } else {
    wolfs = getRandom(3, 2);
  }

  for (let count of _.range(wolfs)) {
    roles.push('wolf');
    player_count -= 1;
  }

  for (let count of _.range(player_count)) {
    if (getRandom() && list.length > 0) {
      roles.push(list.splice(getRandom(list.length), 1)[0]);
    } else {
      roles.push('villager');
    }
  }

  for (let player of players) {
    let role = roles[getRandom(roles.length)];
    switch (role) {
      case 'wolf':
        player.role = new Roles.Wolf(wolf, player);
        break;
      case 'prophet':
        player.role = new Roles.Prophet(wolf, player);
        break;
      case 'fool':
        player.role = new Roles.Fool(wolf, player);
        break;
      case 'witch':
        player.role = new Roles.Witch(wolf, player);
        break;
      case 'guardian':
        player.role = new Roles.Guardian(wolf, player);
        break;
      default:
        player.role = new Roles.Villager(wolf, player);
    }
    roles.splice(roles.indexOf(role), 1);
  }

};

exports.processCallback = function (wolf, upd, followString) {
  let cq = upd.callback_query;
  for (var u of wolf.players) {
    if (u.id === cq.from.id) {
      let endOfAction = cq.data.indexOf(' ');
      if (endOfAction < 0) {
        break;
      }
      let sdata = cq.data.split(' ');
      if (sdata.length < 3) {
        break;
      }
      let data = {
        action: sdata[0].substr(1),
        user_id: parseInt(sdata[1]),
        chat_id: parseInt(sdata[2]),
      };
      if (data.user_id) {
        data.target = wolf.findPlayer(data.user_id);
        if (data.target) {
          data.name = wolf.format_name(data.target);
        }
      } else {
        data.name = 'Skip';
      }
      u.role.eventCallback(wolf.when, wolf.queue, upd, data);
      break;
    }
  }
};
