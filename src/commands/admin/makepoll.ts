/**
 * @module Commands
 */
/**
 * ignore
 */
import * as Raven from 'raven';
import {config} from '../../utils';
import * as Commando from 'discord.js-commando';
import {client} from '../../index';

Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();

export class PollCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: 'poll',
			group: 'admin',
			memberName: 'poll',
			description: 'Make a poll in #council-polls.',
			details: 'Purge messages.',
			examples: ['purge 5'],

			args: [
				{
					key: 'msg',
					prompt: 'Poll words?',
					type: 'string',
					infinite: true
				}
			]
		});
	}
	hasPermission(message) {
		return message.member && message.member.roles.find(elem => elem.id === config.councilID);
	}
	async run(message, args) {
		const channel = client.channels.get(config.pollChannelID);
		if (!channel) {
			return message.channel.send('Had an error. Contact Willy')
		}
		return channel.send(`New Poll from ${message.author.toString()}:\n${args.msg.join('\n')}`)
			.then(async poll => {
				try {
					await poll.react('👍');
					await poll.react('👎');
				} catch (err) {
					console.error(err);
					Raven.captureException(err);
				}
			});
	}
}
