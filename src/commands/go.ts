import {currentStatus} from "../utils";
import * as Discord from 'discord.js';
import * as _ from 'lodash';

export function go(message: Discord.Message) {
	if (!currentStatus.session) {
		message.channel.send('No session running!');
		return;
	}
	if (currentStatus.currentUsers.length < 2) {
		message.channel.send(`Not enough registered users. Need at least 2.`);
		return
	}
	if (currentStatus.currentUsers.length === currentStatus.currentReady.length) {
		message.channel.send(currentStatus.teamMessage);
		message.channel.send(`ALERT! All registered users ready. Go Go Go!`);
	} else {
		message.channel.send(`Not all registered users ready.`);
		message.channel.send(`Currently Registered: ${currentStatus.currentUsers.length}\nCurrently Instanced: ${currentStatus.currentInstanced.length}\nCurrently Ready: ${currentStatus.currentReady.length}`)
	}
}
