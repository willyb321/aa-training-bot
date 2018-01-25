/**
 * @module Commands
 */
/**
 * ignore
 */
import * as Raven from 'raven';
import {config} from '../../utils';
import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import {client} from '../../index';
import * as mongoose from "mongoose";
import * as autoIncrement from 'mongoose-auto-increment';

Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();

mongoose.connect(config.mongoURL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Mongo connected!');
});
autoIncrement.initialize(db);

const pollSchema = new mongoose.Schema({
	timeExpression: String,
	message: String,
	channelId: String,
	everyone: Boolean
});

export interface IPoll extends mongoose.Document {
	msgID: string;
	timeToFinish: Date;
}

export interface IPollModel extends mongoose.Model<IPoll> {

}

pollSchema.plugin(autoIncrement.plugin, 'Poll');
const Poll: IPollModel = mongoose.model('Poll', pollSchema);

const timeTill = (date: Date): number => date.getMilliseconds() - new Date().getMilliseconds();

function checkCurrentPolls() {
	Poll.find({})
		.then(docs => {
			if (docs) {
				docs.forEach(elem => {
					const channel = client.channels.get(config.pollChannelID) as Discord.TextChannel;
					if (!channel) {
						return;
					}
					const msg = channel.messages.get(elem.msgID);
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
					let toSend = `Poll Results (${sum} voted):\n`;
					if (sum < 9) {

					}
					realReactions.forEach(elem => {
						toSend += `${elem.emoji.toString()} - ${elem.count}`;
					})
				})
			}
		});
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
				} catch (err) {
					console.error(err);
					Raven.captureException(err);
				}
			});
	}
}
