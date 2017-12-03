/**
 * @module Commands
 */
/**
 * ignore
 */
import {db, config} from '../utils';
import * as Discord from 'discord.js';
import * as Raven from 'raven';

Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();

export function rating(message: Discord.Message) {
	const pilotRating = (message.author);
	console.log(pilotRating.username);
	db.ratings.remove({
		_id: parseInt(pilotRating.id)
	}, function (err, newDocs) {
		if (err) {
			Raven.captureException(err);
		}
		// newDocs is an array with these documents, augmented with their _id
	});
	db.ratings.insert({
		_id: parseInt(pilotRating.id),
		username: message.author.username,
		rating: message.content.split(' ')[1]
	}, function (err, newDocs) {
		if (err) {
			Raven.captureException(err);
		}
		// Two documents were inserted in the database
		// newDocs is an array with these documents, augmented with their _id
	});
}
