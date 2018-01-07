/**
 * @module Commands
 */
/**
 * ignore
 */
import * as Discord from 'discord.js';
import {config} from "../utils";

export function help(message: Discord.Message) {
	const embed = new Discord.RichEmbed();
	embed
		.setTitle('Ainsley')
		.setAuthor('Ainsley', 'https://willb.info/i/face45a7d6378b600bda26bf69e531d7')
		.setDescription('Commands help')
		.setFooter('By Willyb321', 'https://willb.info/i/22f73495510de53cb95cba9615549bc9')
		.setTimestamp()
		.addField('!start', 'Start a training session')
		.addField('!reg[ister] [@people]', 'Register yourself or others for a training session.')
		.addField('!i[nstanced] [@people]', 'Mark as instanced.')
		.addField('!r[eady] [@people]', 'Mark as ready to shoot.')
		.addField('!ir [@people]', 'Mark as instanced and ready to shoot.')
		.addField('!go', 'Mark the start of the shooting.')
		.addField('!reset', 'Reset the session.')
		.addField('!rub [@people]', 'Give your meat a good old rub..')
		.addField('!stfu [@people]', 'Yes.')
		.addField('!!restart', 'Restart the bot.');
	if (message.member.roles.get(config.adminRoleID)) {
		embed
			.addField('!schedule', 'Get bots current announcement schedule.')
			.addField('!addschedule [time expression]. [message]. [yes for at everyone].', 'Add an announcement. The `.` is very important.')
			.addField('!delschedule [id1] [id2] [...]', 'Get bots current status.');
	}
	return message.reply({embed});

}
