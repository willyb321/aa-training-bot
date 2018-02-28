/**
 * @module Commands
 */
/**
 * ignore
 */
import {config, botLog} from '../../utils';
import {client} from '../../index';
import * as Raven from 'raven';
import * as Discord from "discord.js";
Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();
import * as Commando from 'discord.js-commando';

export class ReportCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: 'report',
			group: 'misc',
			memberName: 'report',
			description: 'Make a report.',
			details: 'Make a report.',
			examples: ['report'],
			throttling: {
				usages: 1,
				duration: 60
			},
			args: [
				{
					key: 'message',
					prompt: 'What do you want to report?',
					type: 'string',
					infinite: true
				}
			]
		});
	}

	hasPermission(msg) {
		return !msg.member
	}

	async run(message, args) {
		const modreportChannel = client.channels.get(config.modChannel);
		if (!modreportChannel) {
			return message.channel.send('I hit a bug. Contact willyb.')
		}
		return botLog(`\`\`\`${args.message.join(' ')}\`\`\``, `Moderator Report from ${message.author.tag}`, 'Moderator Report', config.modChannel)

	}
}
