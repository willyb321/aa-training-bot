/**
 * @module Commands
 */
/**
 * ignore
 */
import * as Raven from 'raven';
import {config, currentStatus, Poll, timeTill} from '../../utils';
import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import {client} from '../../index';


Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();

const addDays = (date, days) => date.setTime(date.getTime() + days * 86400000);

function insertPollToMemory(elem) {
	console.log(timeTill(elem.timeToFinish));
	if (currentStatus.polls.has(elem.msgID)) {
		return;
	}
	let timeout = setTimeout(() => {
		setup(elem);
	}, timeTill(elem.timeToFinish));
	currentStatus.polls.set(elem.msgID, timeout);
}

async function setup(elem) {
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
	realReactions.forEach(elem => sum += elem.count - 1);
	let toSend = `Poll Results for ID \`${elem.id}\` (${sum} voted):\n`;
	realReactions.forEach(elem => {
		toSend += `${elem.emoji.toString()} - \`${elem.count}\`\n`;
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
					min: 1,
					max: 10
				},
				{
					key: 'msg',
					prompt: 'Poll words?',
					type: 'string'
				}
			]
		});
	}
	hasPermission(message) {
		return !!message.member && !!message.member.roles.find(elem => elem.id === config.councilID);
	}
	async run(message, args) {
		const channel = client.channels.get(config.pollChannelID) as Discord.TextChannel;
		const ALPHABET = args.msg.join('').replace(' ', '').replace(/[^a-zA-Z0-9]/igm, '');

		const ID_LENGTH = 4;

		const generate = () => {
			let rtn = '';
			for (let i = 0; i < ID_LENGTH; i++) {
				rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
			}
			return rtn;
		};
		const id = generate();
		if (!channel) {
			return message.channel.send('Had an error. Contact Willy');
		}
		let date = new Date();
		date = new Date(date.setTime(date.getTime() + args.days * 86400000));
		return channel.send(`New Poll from ${message.author.toString()} (id: \`${id}\`):\n${args.msg.join(' ')}\n\nPoll ends on: ${date.toISOString()}`)
			.then(async (poll: Discord.Message) => {
				try {
					await poll.react('👍');
					await poll.react('👎');
					await poll.react('🇵');
					console.log(date);
					const pollDoc = new Poll({msgID: poll.id, timeToFinish: date, id});
					await pollDoc.save();
					insertPollToMemory(pollDoc);
				} catch (err) {
					console.error(err);
					Raven.captureException(err);
				}
			});
	}
}
