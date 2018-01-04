import * as Discord from 'discord.js';
import * as Raven from 'raven';
import {config} from '../utils';

Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();

export function purge(message: Discord.Message) {
	if (!message.member.roles.get('374118891854495744')) {
		return;
	}
	const split = message.content.split(' ', 2);
	let limit = null;
	if (!split || !split[1]) {
		return;
	} else {
		limit = parseInt(split[1]);
	}
	if (!limit) {
		return;
	}
	if (limit > 25) {
		limit = 25;
	}
	message.channel.fetchMessages({limit: limit + 1})
		.then(messages => message.channel.bulkDelete(messages))
		.catch(err => {
			Raven.captureException(err);
		});
}
