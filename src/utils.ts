/**
 * @module Utils
 */
/**
 * ignore
 */
import * as Datastore from 'nedb';
import * as Discord from 'discord.js';
import {client} from './index';
import * as Raven from "raven";
import * as _ from "lodash";

export const config = require('../config.json');


const replies = ['nah m90', 'uwot', 'k', 'meh'];
const guild = '374103486154932234';
const mutedRoleId = '383059187942293504';
const botLogId = '383143845841600513';
const oofs = ['oof', '00f', '0of', 'o0f', 'Oоf', '()()|=', 'οοf', 'Ооf', 'ооf'];
const unicodeOs = [];
export interface IcurrentStatus {
	session: boolean;
	currentUsers: Discord.User[];
	teams: Discord.User[][];
	lastStfu: number;
	teamsNumber: number;
	currentInstanced: Discord.User[];
	currentReady: Discord.User[];
	teamMessage: Discord.RichEmbed;
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

export const chunk = (target, size) => {
	return target.reduce((memo, value, index) => {
		// Here it comes the only difference
		if (index % (target.length / size) == 0 && index !== 0) {
			memo.push([]);
		}
		memo[memo.length - 1].push(value);
		return memo;
	}, [[]]);
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
	})
}
export function isItOof(message: Discord.Message) {
	let oofedContent = message.content;
	oofedContent = _.deburr(oofedContent);
	oofedContent = oofedContent.toLowerCase();
	oofedContent = _.words(oofedContent).join('');
	if (oofedContent.startsWith('o') && oofedContent.endsWith('f') && oofedContent.search('oof') > -1) {
		return true
	}
	if (oofedContent.search(`🇴`) > -1 && oofedContent.search('🇫') > -1) {
		return true
	}
	return _.indexOf(oofs, oofedContent) >= 0;
}


export function botLog(message: string, title: string, event: string, channelId?: string) {
	const botLogId = '383143845841600513';
	const channel: any = client.guilds.get(config.paradigmID).channels.get(channelId || botLogId);
	if (channel) {
		const embed = new Discord.RichEmbed();
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
