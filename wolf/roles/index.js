'use strict';

const _ = require('underscore');

var Roles = {
  // list of roles
  Villager: require('./villager'),
  Wolf: require('./wolf'),
  Prophet: require('./prophet'),
  Fool: require('./fool'),
  Guardian: require('./guardian'),
  Witch: require('./witch'),
  Drunk: require('./drunk'),
  Elder: require('./elder'),
  Mason: require('./mason'),
  Bystander: require('./bystander'),
  Detective: require('./detective'),
  PartyMember: require('./partymember'),
  Commissar: require('./commissar')
};

exports.Roles = Roles;

// list of Roles' id
const role_list = {
  'villager': Roles.Villager,
  'wolf': Roles.Wolf,
  'prophet': Roles.Prophet,
  'fool': Roles.Fool,
  'guardian': Roles.Guardian,
  'witch': Roles.Witch,
  'drunk': Roles.Drunk,
  'elder': Roles.Elder,
  'mason': Roles.Mason,
  'bystander': Roles.Bystander,
  'detective': Roles.Detective,
  'partymember': Roles.PartyMember,
  'commissar': Roles.Commissar
 };

 Roles.role_list = role_list;

exports.event_list = [
  'vote',
  'bite',
  'know',
  'protect',
  'cure',
  'poison',
  'detect',
  'partify',
  'isparty'
 ];
exports.role_list = role_list;

var getRandom = function (max = 1, base = 0) {
  return Math.floor(Math.random() * (max + 1 - base) + base);
};

exports.setRandomRolesT = function (wolf, players) {
  players[0].role = new Roles.PartyMember(wolf, players[0]);
  if (players.length > 1) {
    players[1].role = new Roles.Commissar(wolf, players[1]);
  }
};

exports.setRandomRoles = function (wolf, players) {
  // TODO: set player role here
  // for test
  var list = [
    'prophet',
    'fool',
    'witch',
    'guardian',
    'drunk',
    'elder',
    'bystander',
    'detective'
   ];
  var player_count = players.length;
  var roles = [];
  var other_list = {
    wolf: 0,
    villager: 0,
    mason: 0,
    partymember: 0,
    commissar: 0
  };

  if (player_count < 7) {
    if (getRandom(1, 0)) {
      other_list.wolf = 1;
    } else {
      other_list.partymember = 1;
    }
    other_list.villager = getRandom(1, 0);
    other_list.mason = getRandom(2, 0);
  } else if (player_count < 10) {
    other_list.wolf = 1;
    other_list.partymember = 1;
    other_list.villager = getRandom(1, 0);
    other_list.mason = getRandom(2, 1);
  } else {
    other_list.wolf = 2;
    other_list.partymember = 1;
    other_list.villager = getRandom(2, 1);
    other_list.mason = getRandom(3, 1);
  }

  if (other_list.partymember) {
    other_list.commissar = 1;
  }

  for (let r in other_list) {
    for (let count of _.range(other_list[r])) {
      roles.push(r);
      player_count -= 1;
    }
  }

  for (let count of _.range(player_count)) {
    if (list.length > 0) {
      roles.push(list.splice(getRandom(list.length - 1), 1)[0]);
    } else {
      roles.push('villager');
    }
  }

  let i = 0;
  roles = _.shuffle(roles);
  for (let player of players) {
    let role = roles[i]; // getRandom(roles.length - 1)
    player.role = new role_list[role](wolf, player);
    //roles.splice(roles.indexOf(role), 1);
    i++;
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
          data.name = wolf.i18n.player_name(data.target, true);
        }
      } else {
        data.name = 'Skip';
      }
      u.role.eventCallback(wolf.when, wolf.queue, upd, data);
      break;
    }
  }
};
