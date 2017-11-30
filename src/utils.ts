/**
 * @module Utils
 */
/**
 * ignore
 */
import * as Datastore from 'nedb';
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
	inVoice: false
};

export const chunk = (target, size) => {
	return target.reduce((memo, value, index) => {
		// Here it comes the only difference
		if (index % (target.length / size) == 0 && index !== 0) { memo.push([]); }
		memo[memo.length - 1].push(value);
		return memo;
	}, [[]]);
};

export function botLog(message: string, modReport?: boolean) {
	const botLogId = '383143845841600513';
	const moderatorReports: any = client.guilds.get(config.paradigmID).channels.get((modReport ? config.modChannel : botLogId));
	if (moderatorReports) {
		moderatorReports.send(message);
	}
}
