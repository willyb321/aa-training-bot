import {chunk, currentStatus} from "../utils";
import * as Discord from 'discord.js';
import * as _ from 'lodash';

export function teams(message: Discord.Message) {
	if (!currentStatus.session) {
		message.channel.send('No session running!');
		return;
	}
	let split = message.content.split(' ');
	if (split[1]) {
		currentStatus.teams = _.chunk(currentStatus.currentUsers, parseInt(split[1].toString()));
		currentStatus.teamsNumber = parseInt(split[1].toString())
	}
	console.log(currentStatus.teams);
	let teamMessage = `${currentStatus.teamsNumber} Teams:\n\n`;
	if (!currentStatus.teams) {
		message.channel.send('Use !teams [number of people on each team] first.');
		return
	}
	currentStatus.teams.forEach((elem, index) => {
		teamMessage += `Team ${index+1}:\n`;
		elem.forEach((user, index) => {
			teamMessage += `${user.username}\n`;
		})
	});
	currentStatus.teamMessage = teamMessage;
	message.channel.send(currentStatus.teamMessage)
}
