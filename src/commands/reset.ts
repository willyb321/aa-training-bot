/**
 * @module Commands
 */
/**
 * ignore
 */
import {currentStatus} from '../utils';

export function reset(message) {
	if (!currentStatus.session) {
		message.channel.send('Session not running!');
		return;
	}
	currentStatus.session = false;
	currentStatus.currentUsers = [];
	currentStatus.currentInstanced = [];
	currentStatus.currentReady = [];
	currentStatus.teams = [];
	currentStatus.teamMessage = '';
	currentStatus.teamsNumber = 2;
	message.reply('Training session stopped. Use !start to start another.');
}
