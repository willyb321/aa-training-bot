/**
 * @module Commands
 */

/** ignore */
import {currentStatus} from "../utils";
import * as _ from 'lodash';
import * as Discord from 'discord.js';

export function unregister(message: Discord.Message) {
	if (!currentStatus.session) {
		message.channel.send('No session currently running!');
		return;
	}
	if (message.mentions.users.array().length >= 1) {
		message.mentions.users.array().forEach(user => {
			if (currentStatus.currentUsers.find(elem => elem === user)) {
				_.remove(currentStatus.currentUsers, elem => elem === user);
				message.channel.send(`Unregistered ${user.username}.`);
			}
		});
		return;
	} else if (currentStatus.currentUsers.find(elem => elem === message.author)) {
		_.remove(currentStatus.currentUsers, elem => elem === message.author);
		message.channel.send(`Unregistered ${message.author.username}.`);
		return;
	}
	currentStatus.currentUsers = _.uniq(currentStatus.currentUsers);
}
