/**
 * @module Utils
 */
/**
 * ignore
 */
import * as Discord from 'discord.js';
import {client} from './index';
import * as Raven from 'raven';
import * as _ from 'lodash';
import {config} from './config';
import * as mongoose from "mongoose";
import * as autoIncrement from "mongoose-auto-increment";
export {config} from './config';

const replies = ['nah m90', 'uwot', 'k', 'meh'];
const guild = '374103486154932234';
const mutedRoleId = '383059187942293504';
const botLogId = '383143845841600513';
const oofs = ['oof', '00f', '0of', 'o0f', 'Oоf', '()()|=', 'οοf', 'Ооf', 'ооf'];
export interface IcurrentStatus {
	session: boolean;
	currentUsers: Discord.User[];
	teams: Discord.User[][];
	lastStfu: number;
	teamsNumber: number;
	currentInstanced: Discord.User[];
	currentReady: Discord.User[];
	teamMessage: Discord.MessageEmbed;
	currentSpams: {};
	currentDms: {};
	replies: string[];
	inVoice: boolean;
}

export const currentStatus: IcurrentStatus = {
	session: false,
	currentUsers: [],
	teams: undefined,
	teamsNumber: 2,
	currentInstanced: [],
	currentReady: [],
	teamMessage: null,
	currentSpams: {},
	currentDms: {},
	replies,
	inVoice: false,
	lastStfu: null
};


export function noOof(message: Discord.Message) {
	message.author.createDM()
		.then(dm => {
			dm.send('Oof.');
			message.delete()
				.catch(err => {
					if (err.message === 'Cannot execute action on a DM channel') {
						return;
					} else {
						Raven.captureException(err);
					}
				});
		}).catch(err => {
		console.log(err);
	});
}
export function isItOof(message: Discord.Message) {
	let oofedContent = message.content;
	oofedContent = _.deburr(oofedContent);
	oofedContent = oofedContent.toLowerCase();
	oofedContent = _.words(oofedContent).join('');
	if (oofedContent.startsWith('o') && oofedContent.endsWith('f') && oofedContent.search('oof') > -1) {
		return true;
	}
	if (oofedContent.search('🇴') > -1 && oofedContent.search('🇫') > -1) {
		return true;
	}
	return _.indexOf(oofs, oofedContent) >= 0;
}

export function botLog(message: string, title: string, event: string, channelId?: string) {
	const botLogId = '383143845841600513';
	const channel = client.channels.get(channelId || botLogId) as Discord.TextChannel;
	if (channel) {
		const embed = new Discord.MessageEmbed();
		embed
			.setTitle(title || 'Ainsley')
			.setAuthor('Ainsley', 'https://willb.info/i/face45a7d6378b600bda26bf69e531d7')
			.setDescription(message)
			.setFooter('By Willyb321', 'https://willb.info/i/22f73495510de53cb95cba9615549bc9')
			.setTimestamp()
			.addField('Event', event);

		channel.send({embed});
	}
}
mongoose.connect(config.mongoURL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Mongo connected!');
});
autoIncrement.initialize(db);

const pollSchema = new mongoose.Schema({
	msgID: String,
	timeToFinish: Date
});

export interface IPoll extends mongoose.Document {
	msgID: string;
	timeToFinish: Date;
}

export interface IPollModel extends mongoose.Model<IPoll> {

}
export const Poll: IPollModel = mongoose.model('Poll', pollSchema);
export const timeTill = (date: Date): number => date.getMilliseconds() - new Date().getMilliseconds();

export function checkCurrentPolls() {
	Poll.find({})
		.then(docs => {
			if (docs) {
				docs.forEach(elem => {
					console.log(elem);
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
				})
			}
		});
}
