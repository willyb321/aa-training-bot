import {currentStatus} from "../utils";
import * as Discord from 'discord.js';

export function who(message: Discord.Message) {
	if (!currentStatus.session) {
		message.channel.send('No session currently running!');
		return;
	}
	let usernames = [];
	currentStatus.currentUsers.forEach(elem => {
		usernames.push(elem.username);
	});
	if (currentStatus.currentUsers.length === 0) {
		message.channel.send('Nobody training currently.');
		return
	}
	message.channel.send('Current people training:\n' + usernames.join('\n'));
}
