/**
 * @module Utils
 */
/**
 * ignore
 */
import * as Datastore from 'nedb';

export interface dbInterface {
	sessions: Datastore;
	ratings: Datastore;
}

export const db: dbInterface = {
	sessions: new Datastore({filename: './sessions.db', autoload: true}),
	ratings: new Datastore({filename: './ratings.db', autoload: true})
};

export const currentStatus = {
	session: false,
	currentUsers: [],
	teams: undefined,
	teamsNumber: 2,
	currentInstanced: [],
	currentReady: [],
	teamMessage: '',
	currentSpams: {},
	currentDms: {}
};

export const chunk = (target, size) => {
	return target.reduce((memo, value, index) => {
		// Here it comes the only difference
		if (index % (target.length / size) == 0 && index !== 0) { memo.push([]); }
		memo[memo.length - 1].push(value);
		return memo;
	}, [[]]);
};
