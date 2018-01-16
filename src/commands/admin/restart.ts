/**
 * @module Commands
 */
/**
 * ignore
 */
import {config} from '../../utils';
import {client} from '../../index';
import * as Raven from 'raven';

Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();
import * as Commando from 'discord.js-commando';

export class RestartCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: 'restart',
			group: 'misc',
			memberName: 'restart',
			description: 'restart.',
			details: 'restart.',
			examples: ['restart']
		});
	}

	async run(message) {
		if (!message.member.roles.map(elem => config.allowedRoles.includes(elem))) {
			console.log('Not restarting');
			return;
		}
		console.log('Restarting');
		message.channel.send(':wave:')
			.then(() => {
				client.destroy()
					.then(() => {
						process.exit(0);
					})
					.catch(err => {
						Raven.captureException(err);
						process.exit(1);
					});
			}).catch(err => {
			Raven.captureException(err);
			process.exit(1);
		});
	}
}
