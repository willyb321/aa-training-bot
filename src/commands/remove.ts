/**
 * @module Commands
 */
/**
 * ignore
 */
import {currentStatus} from "../utils";
import * as Discord from 'discord.js';
import * as _ from 'lodash';

export function remove(message: Discord.Message) {
    if (!currentStatus.session) {
        message.channel.send('No session currently running!');
        return;
    }
    if (!message.mentions.users.array()[0]) {
    	message.channel.send('Nobody specified to remove! Use !reset to reset the training.');
    	return;
	}
	currentStatus.currentUsers = _.remove(currentStatus.currentUsers, elem => {
    	return elem.id !== message.mentions.users.array()[0].id;
	});
	console.log(currentStatus.currentUsers.length)
}
