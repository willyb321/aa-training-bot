import {db, currentStatus} from '../utils';

export function start(message) {
	if (currentStatus.session) {
		message.channel.send('Session already running!');
		return;
	}
	currentStatus.session = true;
	currentStatus.currentUsers.push(message.author);
	message.reply(`Training session started. Registered ${message.author.username}. Use !reg[ister] to join.`);
}
