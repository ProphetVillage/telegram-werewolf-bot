'use strict'

var Roles = {
  // list of roles
  Villager: require('./villager'),
  Wolf: require('./wolf'),
  Prophet: require('./prophet'),
  Fool: require('./fool')
};

exports.Roles = Roles;

// list of Roles' id
var role_list = [ 'villager', 'wolf', 'prophet', 'fool' ];
exports.role_list = [ 'villager', 'wolf', 'prophet', 'fool' ];
exports.event_list = [ 'vote', 'bite', 'know' ];

exports.setRandomRoles = function (wolf, players) {
  // TODO: set player role here
  // for test
  let list = role_list;
  for (let player of players) {
    let role = list[Math.floor(Math.random() * list.length)];
    switch (role) {
      case 'wolf':
        player.role = new Roles.Wolf(wolf, player);
        break;
      case 'prophet':
        player.role = new Roles.Prophet(wolf, player);
        list.splice(list.indexOf('prophet'));
        break;
      case 'fool':
        player.role = new Roles.Fool(wolf, player);
        list.splice(list.indexOf('fool'));
        break;
      default:
        player.role = new Roles.Villager(wolf, player);
    }
  }
};

exports.processCallback = function (wolf, upd, followString) {
  let cq = upd.callback_query;
  for (var u of wolf.players) {
    if (u.id === cq.from.id) {
      u.role.eventCallback(wolf.when, wolf.queue, upd, cq.data);
      break;
    }
  }
};
