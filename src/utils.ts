/**
 * @module Utils
 */
/**
 * ignore
 */
import * as Datastore from 'nedb';
import {client} from './index';

export const config = require('../config.json');
const modChannel = '382662529349976066';
const guild = '374103486154932234';

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
	replies
};

export const chunk = (target, size) => {
	return target.reduce((memo, value, index) => {
		// Here it comes the only difference
		if (index % (target.length / size) == 0 && index !== 0) { memo.push([]); }
		memo[memo.length - 1].push(value);
		return memo;
	}, [[]]);
};

export function botLog(message: string) {
	const moderatorReports: any = client.guilds.get(guild).channels.get(modChannel);
	if (moderatorReports) {
		moderatorReports.send(message);
	}
}
