/**
 * @module Commands
 */
/**
 * ignore
 */
import {config, currentStatus} from '../utils';
import * as Discord from 'discord.js';
import * as _ from 'lodash';
import * as Raven from "raven";

Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();
export function teams(message: Discord.Message) {
	if (!currentStatus.session) {
		message.channel.send('No session running!');
		return;
	}
	if (currentStatus.currentUsers.length <= 1) {
		return message.reply('Get some more people!');
	}
	const split = message.content.split(' ');
	let teamsNumber: number;
	if (split[1]) {
		try {
			teamsNumber = parseInt(split[1]);
		} catch (err) {
			Raven.captureException(err);
		}
		if (isNaN(teamsNumber) || !teamsNumber || teamsNumber < 2) {
			teamsNumber = 2;
		}
		Math.round((currentStatus.currentUsers.length / teamsNumber));
		currentStatus.teamsNumber = currentStatus.currentUsers.length / teamsNumber;
		console.log(currentStatus.teamsNumber);
		// if (currentStatus.teamsNumber <= 1) {
		// 	currentStatus.teamsNumber = Math.round(( currentStatus.currentUsers.length / 2));
		// }
		// if (currentStatus.teamsNumber < 2) {
		// 	currentStatus.teamsNumber = Math.round(( currentStatus.currentUsers.length / ((parseInt(split[1]) / currentStatus.currentUsers.length) + 1) * parseInt(split[1])));
		// }
		console.log(`currentStatus.teamsNumber: ${currentStatus.teamsNumber}`);
		console.log(`teamsNumber: ${teamsNumber}`);
		if (currentStatus.teamsNumber > currentStatus.currentUsers.length || currentStatus.teamsNumber <= 1) {
			currentStatus.teamsNumber = 2;
		}
		currentStatus.currentUsers = _.shuffle(currentStatus.currentUsers);
		currentStatus.teams = _.chunk(currentStatus.currentUsers, Math.ceil(currentStatus.currentUsers.length / teamsNumber));
		currentStatus.teamsNumber = currentStatus.teams.length;
	}
	const embed = new Discord.RichEmbed();
	let teamMessage = `${currentStatus.teamsNumber} Teams:\n\n`;
	if (!currentStatus.teams) {
		message.channel.send('Use !teams [number of teams] first.');
		return;
	}
	embed
		.setTitle('Training Session Teams')
		.setAuthor('Ainsley', 'https://willb.info/i/face45a7d6378b600bda26bf69e531d7')
		.setDescription(`${teamsNumber} teams`)
		.setFooter('By Willyb321', 'https://willb.info/i/22f73495510de53cb95cba9615549bc9')
		.setTimestamp();

	currentStatus.teams.forEach((elem, index) => {
		let inTeam = [];
		teamMessage += `Team ${index + 1}:\n`;
		elem.forEach((user: Discord.User) => {
			inTeam.push(user.toString());
		});
		embed.addField(`Team ${index + 1}`, inTeam.join('\n'));
	});
	currentStatus.teamMessage = embed;
	message.channel.send({embed: currentStatus.teamMessage});
}
