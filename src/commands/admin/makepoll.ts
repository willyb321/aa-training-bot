/**
 * @module Commands
 */
/**
 * ignore
 */
import * as Raven from 'raven';
import {config, Poll, timeTill} from '../../utils';
import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import {client} from '../../index';


Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();

const addDays = (date, days) => date.setDate(date.getDate() + days);

function insertPollToMemory(elem) {
	setTimeout(async () => {
		const channel = client.channels.get(config.pollChannelID) as Discord.TextChannel;
		if (!channel) {
			return;
		}
		const msg = await channel.messages.fetch(elem.msgID);
		if (!msg) {
			return;
		}
		const reactions = msg.reactions;
		let realReactions = reactions.filterArray(elem => elem.emoji.toString() === '👍' || elem.emoji.toString() === '👎' || elem.emoji.toString() === '🇵');
		if (!realReactions) {
			return;
		}
		let sum = 0;
		realReactions.forEach(elem => sum = sum + elem.count - 1);
		let toSend = `<@&${config.councilID}>\nPoll Results (${sum} voted):\n`;
		if (sum < 9) {

		}
		realReactions.forEach(elem => {
			toSend += `${elem.emoji.toString()} - ${elem.count -1}\n`;
		});
		return msg.channel.send(toSend)
			.then(async () => {
				try {
					await elem.remove()
				} catch (err) {
					console.error(err);
					Raven.captureException(err);
				}
			})
	}, timeTill(elem.timeToFinish));
}

export class PollCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: 'poll',
			group: 'admin',
			memberName: 'poll',
			description: 'Make a poll in #council-polls.',
			details: 'Make a poll in #council-polls.',
			examples: ['poll'],

			args: [
				{
					key: 'days',
					prompt: 'Poll length (in days)?',
					type: 'integer',
					default: 3,
					min: 1
				},
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
		return !!message.member && !!message.member.roles.find(elem => elem.id === config.councilID);
	}
	async run(message, args) {
		const channel = client.channels.get(config.pollChannelID) as Discord.TextChannel;
		if (!channel) {
			return message.channel.send('Had an error. Contact Willy');
		}
		return channel.send(`<@&${config.councilID}>\nNew Poll from ${message.author.toString()}:\n${args.msg.join('\n')}`)
			.then(async (poll: Discord.Message) => {
				try {
					await poll.react('👍');
					await poll.react('👎');
					await poll.react('🇵');
					const pollDoc = new Poll({msgID: poll.id, timeToFinish: addDays(new Date(), args.days)});
					await pollDoc.save();
					insertPollToMemory(pollDoc);
				} catch (err) {
					console.error(err);
					Raven.captureException(err);
				}
			});
	}
}
