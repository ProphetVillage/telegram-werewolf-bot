'use strict';

const Role = require('./role');

class PartyMember extends Role {
  constructor(wolf, player) {
    super(wolf, player);

    this.id = 'partymember';
    this.name = this.i18n.job_name('partymember');
    this.priority = 1;

    this.allowEvents = [ 'vote', 'partify' ];
  }

  eventAnnouncement() {
    var msg = this.i18n.__('partymember.announcement');

    this.ba.sendMessage({
      chat_id: this.user_id,
      text: msg,
    }, (err, r) => {
      if (err) console.log(err);
    });
  }

  action(ev, target, queue) {
    if (ev === 'partify') {
      if (target.role.dead) {
        return;
      }

      let target_name = this.i18n.player_name(target);

      if (target.role.id === 'wolf') {
        // dead
        this.ba.sendMessage({
          chat_id: this.user_id,
          text: this.i18n.__('partymember.bite_by_wolf', {
            name: target_name
          })
        }, (err, r) => {
          if (err) console.log(err);
        });
        this.endOfLife('bite', target, queue);
        return;

      } else if (target.role.id === 'commissar') {
        // dead
        this.ba.sendMessage({
          chat_id: this.user_id,
          text: this.i18n.__('partymember.caught', {
            name: target_name
          })
        }, (err, r) => {
          if (err) console.log(err);
        });
        this.endOfLife('isparty', target, queue);
        return;

      } else if (target.role.id === 'mason') {
        // message other mason
        let masons = this.getPartners('mason');
        for (let u of masons) {
          if (u.id === target.id) {
            continue;
          }
          this.ba.sendMessage({
            chat_id: u.id,
            text: this.i18n.__('mason.absence', {
              name: target_name
            })
          }, (err, r) => {
            if (err) console.log(err);
          });
        }

      } else if (target.role.id === 'prophet') {
        // 70% chance failed
        if (Math.random() < 0.7) {
          this.ba.sendMessage({
            chat_id: this.user_id,
            text: this.i18n.__('partymember.refused', {
              name: target_name
            })
          }, (err, r) => {
            if (err) console.log(err);
          });
          this.ba.sendMessage({
            chat_id: target.id,
            text: this.i18n.__('prophet.refuse_party')
          }, (err, r) => {
            if (err) console.log(err);
          });
          return;
        }
      }

      this.wolf.transformRole(target, 'partymember');
      let members = this.getPartners('partymember', false, true);  // get all members

      // notify target
      for (let p of members) {
        this.ba.sendMessage({
          chat_id: p.id,
          text: this.i18n.__('partymember.new_member', {
            name: target_name,
            playerlist: this.i18n.player_list(members)
          })
        }, (err, r) => {
          if (err) console.log(err);
        });
      }

    }
  }

  eventNight(queue) {
    let players = this.wolf.players;
    let keyboard = [];

    for (let u of players) {
      if (u.role.dead) {
        continue;
      }
      if (u.id === this.user_id || u.role.id === 'partymember') {
        continue;
      }
      var pname = this.wolf.i18n.player_name(u, true);
      // \/[evname] [user_id] [chat_id]
      keyboard.push([{
        text: pname,
        callback_data: this.makeCommand('partify', u.id, this.chat_id)
      }]);
    }

    // skip
    keyboard.push([{
      text: 'Skip',
      callback_data: this.makeCommand('partify', 0, this.chat_id)
    }]);

    var self = this;
    queue.addVoter(this.player);
    this.event_message_id = null;
    this.ba.sendMessage({
      chat_id: this.user_id,
      text: this.i18n.__('partymember.choose'),
      reply_markup: JSON.stringify({
        inline_keyboard: keyboard
      }),
    }, (err, r) => {
      if (err) {
        console.log(err);
      } else {
        self.event_message_id = r.message_id;
      }
    });
  }

  nightTimeUp() {
    if (this.event_message_id) {
      this.ba.editMessageText({
        chat_id: this.user_id,
        message_id: this.event_message_id,
        text: this.i18n.__('common.timeup')
      });
    }
  }

  eventNightCallback(queue, upd, data) {
    super.eventNightCallback(queue, upd, data);

    // update message
    let cq = upd.callback_query;
    this.ba.editMessageText({
      chat_id: cq.message.chat.id,
      message_id: cq.message.message_id,
      text: this.i18n.__('common.selected', { name: data.name })
    });

    // tell other partymembers
    let players = this.wolf.players;
    var mname = this.wolf.i18n.player_name(this.player);
    var msg = this.i18n.__('partymember.selected', {
      member_name: mname,
      target_name: data.name
    });

    let members = this.getPartners();
    for (let u of members) {
      this.ba.sendMessage({
        chat_id: u.id,
        text: msg
      });
    }
  }
};

module.exports = PartyMember;
