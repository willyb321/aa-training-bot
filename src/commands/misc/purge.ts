/**
 * @module Commands
 */
/**
 * ignore
 */
import * as Raven from 'raven';
import {config} from '../../utils';

Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();

import * as Commando from 'discord.js-commando';

export class PurgeCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: 'purge',
			group: 'admin',
			memberName: 'purge',
			description: 'Purge messages.',
			details: 'Purge messages.',
			examples: ['purge 5'],

			args: [
				{
					key: 'amount',
					prompt: 'How many messages to purge?',
					type: 'integer',
					validate: val => parseInt(val) >= 1 && parseInt(val) < 25
				}
			]
		});
	}

	async run(message, args) {
		if (!message.member.roles.get('374118891854495744')) {
			return;
		}
		let limit = args.amount;
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
}
