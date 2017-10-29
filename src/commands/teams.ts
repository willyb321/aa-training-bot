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
		console.log(
			(parseInt(split[1]) / currentStatus.currentUsers.length)
		)
		currentStatus.teamsNumber = Math.round(( currentStatus.currentUsers.length / parseInt(split[1])));
		currentStatus.currentUsers = _.shuffle(currentStatus.currentUsers);
		currentStatus.teams = _.chunk(currentStatus.currentUsers, currentStatus.teamsNumber);
		currentStatus.teamsNumber = currentStatus.teams.length;
	}
	console.log(currentStatus.teams);
	console.log(currentStatus.teamsNumber);
	let teamMessage = `${currentStatus.teamsNumber} Teams:\n\n`;
	if (!currentStatus.teams) {
		message.channel.send('Use !teams [number of teams] first.');
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
