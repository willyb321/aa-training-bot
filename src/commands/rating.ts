import {db} from "../utils";
import * as Discord from 'discord.js';

export function rating(message: Discord.Message) {
	const pilotRating = (message.author);
	console.log(pilotRating.username);
	db.ratings.remove({
		_id: parseInt(pilotRating.id)
	}, function (err, newDocs) {
		if (err) {
			console.log(err);
		}
		// newDocs is an array with these documents, augmented with their _id
	});
	db.ratings.insert({
		_id: parseInt(pilotRating.id),
		username: message.author.username,
		rating: message.content.split(' ')[1]
	}, function (err, newDocs) {
		if (err) {
			console.log(err);
		}
		// Two documents were inserted in the database
		// newDocs is an array with these documents, augmented with their _id
	})
}
