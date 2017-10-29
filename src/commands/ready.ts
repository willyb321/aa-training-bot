import {currentStatus} from "../utils";
import * as Discord from 'discord.js';
import * as _ from 'lodash';

export function ready(message: Discord.Message) {
	if (!currentStatus.session) {
		message.channel.send('No session running!');
		return;
	}
	if (currentStatus.currentInstanced.find(elem => elem === message.author)) {
		currentStatus.currentReady.push(message.author);
		message.reply('Registered as ready.');
		message.channel.send(`Currently Registered: ${currentStatus.currentUsers.length}\nCurrently Instanced: ${currentStatus.currentInstanced.length}\nCurrently Ready: ${currentStatus.currentReady.length}`)
	} else {
		message.reply('Not instanced, use !i[nstanced] to register');
		message.channel.send(`Currently Registered: ${currentStatus.currentUsers.length}\nCurrently Instanced: ${currentStatus.currentInstanced.length}\nCurrently Ready: ${currentStatus.currentReady.length}`)
	}
	if (currentStatus.currentUsers.length === currentStatus.currentReady.length && currentStatus.currentUsers.length > 1) {
		message.channel.send(`ALERT! All registered users ready`)
	} else if (currentStatus.currentUsers.length === currentStatus.currentReady.length && currentStatus.currentUsers.length === 1) {
		message.channel.send(`ALERT! Need at least 2 registered users to continue.`)
	}
}
