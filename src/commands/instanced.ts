/**
 * @module Commands
 */
/**
 * ignore
 */
import {currentStatus} from '../utils';
import * as Discord from 'discord.js';
import * as _ from 'lodash';

export function instanced(message: Discord.Message) {
	if (!currentStatus.session) {
		message.channel.send('No session running!');
		return;
	}
	if (message.mentions.users.array().length >= 1) {
		message.mentions.users.array().forEach(user => {
			if (!currentStatus.currentInstanced.find(elem => elem === user)) {
				currentStatus.currentInstanced.push(user);
				message.channel.send(`Instanced: ${user.toString()}.`);
			}
		});
		return;
	}
	if (currentStatus.currentUsers.find(elem => elem === message.author)) {
		currentStatus.currentInstanced.push(message.author);
		currentStatus.currentInstanced = _.uniq(currentStatus.currentInstanced);
		message.reply('Registered as instanced.');
		message.channel.send(`Currently Registered: ${currentStatus.currentUsers.length}\nCurrently Instanced: ${currentStatus.currentInstanced.length}\nCurrently Ready: ${currentStatus.currentReady.length}`);
	} else {
		message.reply('Not registered, use !register to register');
	}
}
