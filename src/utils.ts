/**
 * @module Utils
 */
/**
 * ignore
 */
import * as Datastore from 'nedb';
import * as Discord from 'discord.js';
import {client} from './index';

export const config = require('../config.json');

export interface dbInterface {
	sessions: Datastore;
	ratings: Datastore;
}

export const db: dbInterface = {
	sessions: new Datastore({filename: './sessions.db', autoload: true}),
	ratings: new Datastore({filename: './ratings.db', autoload: true})
};
const replies = ['nah m90', 'uwot', 'k', 'meh'];

export const currentStatus = {
	session: false,
	currentUsers: [],
	teams: undefined,
	teamsNumber: 2,
	currentInstanced: [],
	currentReady: [],
	teamMessage: '',
	currentSpams: {},
	currentDms: {},
	replies,
	inVoice: false,
	lastStfu: null
};

export const chunk = (target, size) => {
	return target.reduce((memo, value, index) => {
		// Here it comes the only difference
		if (index % (target.length / size) == 0 && index !== 0) { memo.push([]); }
		memo[memo.length - 1].push(value);
		return memo;
	}, [[]]);
};

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
