{
	"common": {
		"timeup": "时间到！",
		"selected": "已选择 - {{name}}",
		"voted": "已投票 - {{name}}",
		"voted_to": "{{name}} 投了 {{target_name}}",
		"voted_choose": "现在将进行投票处决一个人。",
		"voted_flat": "平票",
		"death_lock": "死亡选择中断",
		"players": "玩家 ({{num}})："
	},
	"game": {
		"start": "游戏开始！",
		"no_game": "没有正在进行的游戏，开始一个新游戏 /startgame",
		"joined": {
			"one": "{{name}} 加入了这场游戏，当前 <b>{{current}}</b> 名玩家。最多 <b>{{max}}</b> 名玩家，最少 <b>{{min}}</b> 名玩家。现在加入 /join",
			"other": "{{name}} 加入了这场游戏，当前 <b>{{current}}</b> 名玩家。最多 <b>{{max}}</b> 名玩家，最少 <b>{{min}}</b> 名玩家。现在加入 /join"
		},
		"fail_to_join": "{{name}} 加入游戏失败。",
		"fail_to_forcestart": "您现在不能强制开始这场游戏。",
		"fleed": {
			"one": "您退出了这场游戏，当前 <b>{{current}}</b> 名玩家。最多 <b>{{max}}</b> 名玩家，最少 <b>{{min}}</b> 名玩家。现在加入 /join",
			"other": "您退出了这场游戏，当前 <b>{{current}}</b> 名玩家。最多 <b>{{max}}</b> 名玩家，最少 <b>{{min}}</b> 名玩家。现在加入 /join"
		},
		"fail_to_flee": "您不能退出当前已经开始了的游戏。",
		"not_in_game": "您不在这场游戏之中。",
		"too_many_players": "玩家总数超过限制。",
		"already_started": "这场游戏已经开始。加入下一局游戏 /nextgame",
		"already_in": "您已经在这场游戏之中。",
		"no_enough_person": "没有足够的人数来开始游戏。",
		"allocate_roles": "现在正在为玩家分配角色。",
		"start_a_game": "{{name}} 开始了一场新游戏，加入 /join",
		"last_1_min": "剩余 <b>1</b> 分钟 /join",
		"last_30_sec": "剩余 <b>30</b> 秒 /join",
		"last_10_sec": "剩余 <b>10</b> 秒 /join",
		"help": "请阅读： <a href='https://github.com/ProphetVillage/telegram-werewolf-bot/blob/master/README.zh-CN.md'>游戏规则</a>",
		"next_game": "我们将会在下场游戏开始前私聊您。",
		"open_in_group": "游戏马上将在 {{groupname}} 开始，抓紧时间！",
		"please_follow_me": "请先和我私聊，在 {{bot}} 窗口中点击 start",
		"not_admin": "您不是该群组的管理员。"
	},
	"status": {
		"dead": "死亡",
		"alive": "存活",
		"won": "胜利",
		"lost": "失败",
		"stats": "Player {{name}}:\nGames played total: <b>{{total}}</b>\nGames won: <b>{{won}}</b>\nGames survived: <b>{{survived}}</b>\nMost common role: <b>{{most_role}}</b>\nMost killed: <b>{{most_killed_name}}</b> <b>{{most_killed_times}}</b> times\nMost killed by: <b>{{most_killed_by_name}}</b> <b>{{most_killed_by_times}}</b> times"
	},
	"scene": {
		"night": "微风的夜晚，似乎有什么事情将要发生。请等待 <b>{{time}}</b> 秒。",
		"day": "第 <b>{{day}}</b> 天。\n我们有 <b>{{time}}</b> 秒的时间来进行讨论。",
		"dusk": "太阳下山了，我们需要进行投票。请等待 <b>{{time}}</b> 秒。"
	},
	"winner": {
		"wolf": "狼人胜！",
		"villager": "村民胜！",
		"partymember": "党的胜利！",
		"tanner": "皮匠胜！",
		"none": "无人胜利"
	},
	"death": {
		"vote": "{{name}} 被投票处决。",
		"vote_punishment": "{{name}} 有 <b>2</b> 次没有进行投票，上帝决定要惩罚他。",
		"bite": "{{name}} 被咬死了。",
		"poison": "{{name}} 被毒死了。",
		"isparty": "{{name}} 由于腐败的作风被政委抓走了。",
		"caught_by_commissar": "昨晚 {{name}} 不幸地遇到了政委，被带走了。",
		"silent_night": "平安夜。",
		"showjob": "{{name}} 是 {{job}}。"
	},
	"villager": {
		"name": "村民",
		"announcement": "你是一个村民，以种地维生。"
	},
	"wolf": {
		"name": "狼人",
		"announcement": "你是狼人，每晚都想要大开杀戒。",
		"choose": "又到了吃肉的时间，你想吃谁？",
		"drunk_night": "还是醉醺醺的，不想吃人。",
		"eat_drunk": [
			"你吃了个酒鬼，醉了。",
			"美味的啤酒人让你隔天都不想下床。"
		],
		"bite_you": "你被好大——的一张嘴吃了，好像很美味的样子。",
		"selected": "{{wolf_name}} 选择了 {{target_name}}",
		"notice_detective": "你发现有人鬼鬼祟祟的，{{name}} 是 {{job}}。",
    "food_ran": "你的食物跑了！",
    "been_guarded": "你的食物好像被保护住了！",
		"partner": {
			"one": "{{playerlist}} 也是一只狼人。",
			"other": "{{playerlist}} 也是狼人。"
		}
	},
	"prophet": {
		"name": "先知",
		"announcement": "你是先知，你能知道别人的身份。",
		"choose": "请选择一个你想知道他的身份的人。",
		"see": "你看 {{name}} 是 {{job}}。",
		"refuse_party": "坚定的信仰使你不想成为党的一员。"
	},
	"fool": {
		"name": "傻瓜",
		"see": "你看 {{name}} 是 {{job}}。"
	},
	"witch": {
		"name": "女巫",
		"announcement": "你是女巫，你有两颗💊，一颗能救人，一颗能毒人。",
		"cured": "嘴里好像被塞了什么，感觉整个人活了过来。",
		"selection_cure": "救 {{name}}",
		"selection_poison": "毒 {{name}}",
		"choose_silent_night": "今晚没有人死去，你想要毒人吗？",
		"choose_bloody_night": {
			"one": "今晚 {{playerlist}} 死去了，你想要救他吗？还是准备毒死其他的一个人？",
			"other": "今晚 {{playerlist}} 死去了，你想要救他们之一吗？还是准备毒死其他的一个人？"
		}
	},
	"guardian": {
		"name": "守卫",
		"announcement": "你是守卫，在晚上你可以保护一个人免受伤害。",
		"protected": "好像一股圣光笼罩了你，今夜家里似乎很平静。",
		"choose": "今晚，请选择保护一个人。",
		"guarded": "你成功的保护住了他。"
	},
	"drunk": {
		"name": "酒鬼",
		"announcement": "你是酒鬼，如果狼吃了你，他明晚将醉得无法吃别人。"
	},
	"elder": {
		"name": "长者",
		"announcement": "你是长者，自带 +1 命，当狼人第一次咬你的时候，你不会死亡。同时作为长者，你也不那么容易入党。",
		"wisdom_of_elder": "长年的智慧让你在与狼人的战斗中幸存了下来。",
		"shame_of_vote": "你将长者投死了，你现在是村民了！",
		"refuse_party": "长年的智慧让你觉得这不是一个纯洁的党。"
	},
	"mason": {
		"name": "搬砖工",
		"announcement": "你是搬砖工，",
		"no_partner": "孤独的搬砖工。",
		"absence": "不知什么原因，今天 {{name}} 缺席了平日的工会。",
		"partner": {
			"one": "{{playerlist}} 也是搬砖工。",
			"other": "{{playerlist}} 也是搬砖工。"
		}
	},
	"bystander": {
		"name": "旁观者",
		"announcement": "你是旁观者，你可以看到先知是谁。",
		"no_prophet": "没有先知。",
		"see_prophet": "{{name}} 是先知。"
	},
	"detective": {
		"name": "侦探",
		"announcement": "你是侦探，你能调查别人的职业。但是在尾随的时候，有一定几率会被狼人发现。",
		"choose": "今天你想尾随谁？",
		"see": "调查的结果，{{name}} 是 {{job}}。"
	},
	"partymember": {
		"name": "党员",
		"announcement": "你是一位忠诚的党员，每晚你有机会发展一名新的党员。",
		"choose": "今天晚上，你看谁像新的党员？",
		"selected": "{{member_name}} 选择了 {{target_name}}",
		"new_member": "{{name}} 变成了我党新的一员。现在 {{playerlist}} 是我党的成员。",
		"refused": "{{name}} 并不想加入党的怀抱。",
		"bite_by_wolf": "你发现 {{name}} 是狼，为了党，你失去了你年轻的生命。",
		"caught": "不幸地遇到了政委，被带走了。"
	},
	"commissar": {
		"name": "政委",
		"announcement": "你是政委，总感觉有些党员在腐败。",
		"choose": "今晚，你觉得谁在腐败？",
		"found_partymember": "发现了一个腐败的党员 {{name}}。",
		"notfound": "{{name}} 并不是一个腐败的党员。"
	},
	"tanner": {
		"name": "皮匠",
		"announcement": "你是皮匠，你对生活失去了希望，如果你被投死，那就解放了整个村子。"
	}
}
