/**
 * @module Commands
 */
/**
 * ignore
 */
import {db, currentStatus} from '../utils';

export function start(message) {
	if (currentStatus.session) {
		message.channel.send('Session already running!');
		return;
	}
	currentStatus.session = true;
	if (message.mentions.users.array().length >= 1) {
		message.channel.send(`Training session started. Registering mentioned users.`);
		message.mentions.users.array().forEach(user => {
			if (!currentStatus.currentUsers.find(elem => elem === user)) {
				currentStatus.currentUsers.push(user);
				message.channel.send(`Registered ${user.toString()}.`);
			}
		});
		return;
	}
	currentStatus.currentUsers.push(message.author);
	message.channel.send(`Training session started. Registered ${message.author.toString()}. Use !reg[ister] to join.`);
}
