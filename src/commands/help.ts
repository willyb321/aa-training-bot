/**
 * @module Commands
 */
/**
 * ignore
 */
import * as Discord from 'discord.js';

export function help(message: Discord.Message) {
	let helpMessage: string = '';
	helpMessage += 'Commands:\n';
	helpMessage += '!start: Start a training session\n';
	helpMessage += '!reg[ister] [@people]: Register yourself or others for a training session.\n';
	helpMessage += '!i[nstanced] [@people]: Mark as instanced.\n';
	helpMessage += '!r[eady] [@people]: Mark as ready to shoot.\n';
	helpMessage += '!ir [@people]: Mark as instanced and ready to shoot.\n';
	helpMessage += '!go: Mark the start of the shooting.\n';
	helpMessage += '!reset: Reset the session.\n';
	helpMessage += '!rub [@people]: Give your meat a good old rub..\n';
	helpMessage += '!stfu [@people]: Yes.\n';
	message.reply(helpMessage);
	return;
}
