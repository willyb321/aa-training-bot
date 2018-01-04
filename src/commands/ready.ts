/**
 * @module Commands
 */
/**
 * ignore
 */
import {config, currentStatus} from '../utils';
import * as Discord from 'discord.js';
import * as Raven from "raven";

Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();

export function ready(message: Discord.Message) {
	if (!currentStatus.session) {
		message.channel.send('No session running!');
		return;
	}
	if (message.mentions.users.array().length >= 1) {
		message.mentions.users.array().forEach(user => {
			if (!currentStatus.currentReady.find(elem => elem === user)) {
				currentStatus.currentReady.push(user);
				message.channel.send(`Ready: ${user.toString()}.`);
			}
		});
	}
	if (currentStatus.currentUsers.length === currentStatus.currentReady.length && currentStatus.currentUsers.length > 1) {
		const mentions = [];
		currentStatus.currentUsers.forEach(elem => mentions.push(elem.toString()));
		message.channel.send(`ALERT! All registered users ready\n${mentions.join(' ')}`);
		return;
	} else if (currentStatus.currentUsers.length === currentStatus.currentReady.length && currentStatus.currentUsers.length === 1) {
		message.channel.send('ALERT! Need at least 2 registered users to continue.');
	}
	if (currentStatus.currentInstanced.find(elem => elem === message.author)) {
		currentStatus.currentReady.push(message.author);
		message.reply('Registered as ready.')
			.then(() => {
				message.channel.send(`Currently Registered: ${currentStatus.currentUsers.length}\nCurrently Instanced: ${currentStatus.currentInstanced.length}\nCurrently Ready: ${currentStatus.currentReady.length}`);
			})
			.catch((err: Error) => {
				Raven.captureException(err);
			});
	} else {
		message.reply('Not instanced, use !i[nstanced] to register instanced')
			.then(() => {
				message.channel.send(`Currently Registered: ${currentStatus.currentUsers.length}\nCurrently Instanced: ${currentStatus.currentInstanced.length}\nCurrently Ready: ${currentStatus.currentReady.length}`);
			}).catch((err: Error) => {
			Raven.captureException(err);
		});
	}
}
