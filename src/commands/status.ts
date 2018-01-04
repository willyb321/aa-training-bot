/**
 * @module Commands
 */
/**
 * ignore
 */
import * as Discord from 'discord.js';
import { currentStatus } from '../utils';

export function status(message: Discord.Message) {
	const embed = new Discord.RichEmbed();
	embed
		.setTitle('Ainsley')
		.setAuthor('Ainsley', 'https://willb.info/i/face45a7d6378b600bda26bf69e531d7')
		.setDescription('Ainsley Status')
		.setFooter('By Willyb321', 'https://willb.info/i/22f73495510de53cb95cba9615549bc9')
		.setTimestamp()
		.addField('//TODO', 'Add some stuff here.');
	return message.reply({embed});

}
