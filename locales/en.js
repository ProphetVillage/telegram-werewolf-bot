{
	"common": {
		"timeup": "Timeup!",
		"selected": "Selected - {{name}}",
		"voted": "Voted - {{name}}",
		"voted_to": "{{name}} voted {{target_name}}",
		"voted_choose": "Now, you can vote to kill someone as suspect.",
		"voted_flat": "Flat votes",
		"death_lock": "Death Lock",
		"players": "Players:"
	},
	"game": {
		"start": "Game start!",
		"no_game": "No game, /startgame",
		"joined": {
			"one": "{{name}} joined the game, current <b>{{current}}</b> player. <b>{{max}}</b> maximum, <b>{{min}}</b> minimum. Now /join",
			"other": "{{name}} joined the game, current <b>{{current}}</b> players. <b>{{max}}</b> maximum, <b>{{min}}</b> minimum. Now /join"
		},
		"fail_to_join": "{{name}} failed to join the game.",
		"fail_to_forcestart": "You can't force start the game.",
		"fleed": {
			"one": "You quit the game, current <b>{{current}}</b> player. <b>{{max}}</b> maximum, <b>{{min}}</b> minimum. Now /join",
			"other": "You quit the game, current <b>{{current}}</b> players. <b>{{max}}</b> maximum, <b>{{min}}</b> minimum. Now /join"
		},
		"fail_to_flee": "You can't quit the current game.",
		"not_in_game": "You are not in the game",
		"too_many_players": "Too many players.",
		"already_started": "A game already started.",
		"already_in": "You are already in the game.",
		"no_enough_person": "No enough person to start the game.",
		"allocate_roles": "Now allocating roles for players.",
		"start_a_game": "{{name}} started a new game, /join",
		"last_1_min": "last <b>1</b> min, /join",
		"last_30_sec": "last <b>30</b> sec, /join",
		"last_10_sec": "last <b>10</b> sec, /join",
		"help": "This is help",
		"next_game": "We will PM you when next game open.",
		"open_in_group": "Game opened in {{groupname}}, come on!",
		"please_follow_me": "Please chat with me at first, and click /start at PM."
	},
	"status": {
		"dead": "Dead",
		"alive": "Alive"
	},
	"scene": {
		"night": "Tonight, a beautiful night. <b>{{time}}s</b> to wait.",
		"day": "Day <b>{{day}}</b>, we have <b>{{time}}s</b> to talk.",
		"dusk": "Sun falling, we have <b>{{time}}s</b> to vote."
	},
	"winner": {
		"wolf": "Wolf win!",
		"villager": "Villager win!",
		"none": "No one win!"
	},
	"death": {
		"vote": "{{name}} was voted to die.",
		"vote_punishment": "{{name}} hasn\\'t voted for <b>2</b> times, the god punished him/her.",
		"bite": "{{name}} has been bitten.",
		"poison": "{{name}} has been poisoned.",
		"silent_night": "A silent night.",
		"showjob": "{{name}} is {{job}}."
	},
	"villager": {
		"name": "Villager",
		"announcement": "You are a villager."
	},
	"wolf": {
		"name": "Wolf",
		"announcement": "You are a wolf, every night you can eat someone.",
		"choose": "This night, you want to eat someone, which one you want?",
		"drunk_night": "You drunk tonight, nothing to do.",
		"eat_drunk": "You ate a drunk, you won't able to eat others in next night.",
		"bite_you": "You have been bitten.",
		"selected": "{{wolf_name}} selected {{target_name}}",
    "notice_detective": "You found someone suspect, {{name}} is {{job}}.",
		"partner": {
			"one": "{{playerlist}} is also a wolf.",
			"other": "{{playerlist}} are also wolves."
		}
	},
	"prophet": {
		"name": "Prophet",
		"announcement": "You are a prophet. You can see somebody's job.",
		"choose": "Pick someone to ask about.",
		"see": "You see {{name}} is {{job}}."
	},
	"fool": {
		"name": "Fool",
		"see": "You see {{name}} is {{job}}."
	},
	"witch": {
		"name": "Witch",
		"announcement": "You are a witch, you have two pills. One for curing and another for posisoning.",
		"cured": "You have been cured.",
		"selection_cure": "Cure {{name}}",
		"selection_poison": "Poison {{name}}",
		"choose_silent_night": "No person dead tonight, do you want to poison someone?",
		"choose_bloody_night": {
			"one": "Tonight {{playerlist}} was dead, do you want to cure him/her or poison someone else?",
			"other": "Tonight {{playerlist}} was dead, do you want to cure one of them or poison someone else?"
		}
	},
	"guardian": {
		"name": "Guardian",
		"announcement": "You are a guardian, you can protect someone from the wolf in night.",
		"protected": "You have been protected.",
		"choose": "This night, do you want to protect someone?",
    "guarded": "You successfully guarded him."
	},
	"drunk": {
		"name": "Drunk",
		"announcement": "You are a drunk, if the wolf eat you, it won't able to eat others in the next night."
	},
	"elder": {
		"name": "Elder",
		"announcement": "You are a elder, you can alive in the first time of biting by wolf.",
		"wisdom_of_elder": "Your wisdom keep you safe in the fight with the wolf.",
		"shame_of_vote": "You vote the elder, you are a villager now."
	},
	"mason": {
		"name": "Mason",
		"announcement": "You are a mason, ",
		"no_partner": "no partner.",
		"partner": {
			"one": "{{playerlist}} is also a mason.",
			"other": "{{playerlist}} are also masons."
		}
	},
	"bystander": {
		"name": "Bystander",
		"announcement": "You are bystander, you can see who is prophet. ",
		"no_prophet": "No prophet.",
		"see_prophet": "{{name}} is prophet."
	},
  "detective": {
    "name": "Detective",
    "announcement": "You are a detective, you can someone's job. But you may be discovered by wolf once you try to follow someone.",
    "choose": "Today, who is your target?",
    "see": "You found {{name}} is {{job}}."
  }
}
