import {currentStatus} from "../utils";
import * as _ from 'lodash';
import * as Discord from 'discord.js';
import {start} from "./start";

export function register(message: Discord.Message) {
	if (!currentStatus.session) {
		message.channel.send('No session currently running! Starting one.');
		start(message);
		return;
	}
	if (message.mentions.users.array().length >= 1) {
		message.mentions.users.array().forEach(user => {
			if (!currentStatus.currentUsers.find(elem => elem === user)) {
				currentStatus.currentUsers.push(user);
				message.channel.send(`Registered: ${user.toString()}.`);
			}
		});
		return;
	}
	if (message.mentions.users.array().length === 0 && !currentStatus.currentUsers.find(elem => elem === message.author)) {
		currentStatus.currentUsers.push(message.author);
		message.reply(`Added to the session`);
		return;
	} else if (currentStatus.currentUsers.find(elem => elem === message.author)) {
		message.reply('Already in the session.');
		return;
	}
	currentStatus.currentUsers = _.uniq(currentStatus.currentUsers);
	// console.log(currentStatus.currentUsers);
	message.reply('Added to the session')
}
