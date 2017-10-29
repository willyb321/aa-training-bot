import {currentStatus} from "../utils";
import * as _ from 'lodash';
import * as Discord from 'discord.js';

export function register(message: Discord.Message) {
	if (!currentStatus.session) {
		message.channel.send('No session currently running!');
		return;
	}
	if (message.mentions.users.array().length === 1) {
		currentStatus.currentUsers.push(message.mentions.users.array()[0]);
	} else {
		currentStatus.currentUsers.push(message.author);
	}
	currentStatus.currentUsers = _.uniq(currentStatus.currentUsers);
	// console.log(currentStatus.currentUsers);
	message.reply('Added to the session')
}
