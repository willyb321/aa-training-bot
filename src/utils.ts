/**
 * @module Utils
 */
/**
 * ignore
 */
import * as Discord from 'discord.js';
import {client, stfuInit} from './index';
import * as Raven from 'raven';
import * as later from 'later';
import * as _ from 'lodash';
import {config} from './config';
import * as mongoose from "mongoose";
import * as autoIncrement from "mongoose-auto-increment";
export {config} from './config';

export const announcements = [];
mongoose.connect(config.mongoURL);
export interface ISchedule extends mongoose.Document {
	timeExpression: string;
	message: string;
	channelId: string;
	everyone: boolean;
}

export function announce(message: string, channelId: string, everyone: boolean) {
	return undefined
	// console.log('Announcing!');
	// const channel = client.guilds.get(config.paradigmID).channels.get(channelId);
	// channel.send(`${message.toString()}\n${everyone ? '@everyone' : ''}`);
}

export function stfu(message: Discord.Message) {
	if (!message || !message.mentions) {
		return;
	}
	const user = message.mentions.members.first();
	if (currentStatus.inVoice) {
		return;
	}
	if (!user) {
		return;
	}
	if (message.member.roles.find(elem => config.allowedRoles.includes(elem.id)) && user.voice.channel) {
		console.log('Doing it!');
		stfuInit(user, user);
		return;
	}
	if (!user.voice.channel && message.member.roles.find(elem => config.allowedRoles.includes(elem.id))) {
		message.channel.send(`STFU ${user.toString()}!`);
		return;
	}
}

export function addAllAnnouncementsToMemory() {
	Schedule.find({}, (err, docs) => {
		if (err) {
			Raven.captureException(err);
		} else {
			docs.forEach((elem: ISchedule) => {
				const parsedTime = later.parse.text(elem.timeExpression);
				announcements[elem._id] = later.setInterval(() => {
					announce(elem.message, elem.channelId, elem.everyone);
				}, parsedTime);
			});
		}
	});
}

const replies = ['nah m90', 'uwot', 'k', 'meh'];
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
	polls: Map<string, any>;
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
	lastStfu: null,
	polls: new Map()
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
			.setAuthor('Ainsley', 'https://willb.info/i/face45a7d6378b600bda26bf69e531d7.png')
			.setDescription(message)
			.setFooter('By Willyb321', 'https://willb.info/i/2167372b54bbaf90900a8205a28f3733.png')
			.setTimestamp()
			.addField('Event', event);

		channel.send({embed});
	}
}

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Mongo connected!');
});
autoIncrement.initialize(db);


const scheduleSchema = new mongoose.Schema({
	timeExpression: String,
	message: String,
	channelId: String,
	everyone: Boolean
});



scheduleSchema.plugin(autoIncrement.plugin, 'Schedule');
export const Schedule = mongoose.model('Schedule', scheduleSchema);


const pollSchema = new mongoose.Schema({
	msgID: String,
	timeToFinish: Date,
	id: String
});

export interface IPoll extends mongoose.Document {
	msgID: string;
	timeToFinish: Date;
	id: string;
}

export interface IPollModel extends mongoose.Model<IPoll> {

}
export const Poll: IPollModel = mongoose.model('Poll', pollSchema);
export const timeTill = (date: Date): number => date.valueOf() - new Date().valueOf();

export function checkCurrentPolls() {
	Poll.find({})
		.then(docs => {
			if (docs) {
				docs.forEach(elem => {
					console.log(elem);
					console.log(elem.timeToFinish);
					console.log(`timeTill(elem.timeToFinish): ${timeTill(elem.timeToFinish)}`);
					if (currentStatus.polls.has(elem.msgID)) {
						return;
					}
					let timeout = setTimeout(() => {
						setup(elem);
					}, timeTill(elem.timeToFinish));
					currentStatus.polls.set(elem.msgID, timeout);
				})
			}
		});
}

async function setup(elem) {
	const channel = client.channels.get(config.pollChannelID) as Discord.TextChannel;
	if (!channel) {
		return;
	}
	// const msg = await channel.messages.fetch(elem.msgID);
	let msg
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
	let toSend = `Poll Results for ID ${elem.id} (${sum} voted):\n`;
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
}
