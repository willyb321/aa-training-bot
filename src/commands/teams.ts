/**
 * @module Commands
 */
/**
 * ignore
 */
import {chunk, currentStatus} from "../utils";
import * as Discord from 'discord.js';
import * as _ from 'lodash';
import {CurriedFunction1} from "lodash";

export function teams(message: Discord.Message) {
	if (!currentStatus.session) {
		message.channel.send('No session running!');
		return;
	}
	if (currentStatus.currentUsers.length <= 1) {
		message.reply('Get some more people!');
		return;
	}
	let split = message.content.split(' ');
	let teamsNumber: number;
	if (split[1]) {
		try {
			teamsNumber = parseInt(split[1]);
		} catch (e) {
			console.log(e);
		}
		if (isNaN(teamsNumber) || !teamsNumber) {
			teamsNumber = 2;
		}
		Math.round((currentStatus.currentUsers.length / teamsNumber));
		currentStatus.teamsNumber = currentStatus.currentUsers.length / teamsNumber;
		console.log(currentStatus.teamsNumber);
		// if (currentStatus.teamsNumber <= 1) {
		// 	currentStatus.teamsNumber = Math.round(( currentStatus.currentUsers.length / 2));
		// }
		// if (currentStatus.teamsNumber < 2) {
		// 	currentStatus.teamsNumber = Math.round(( currentStatus.currentUsers.length / ((parseInt(split[1]) / currentStatus.currentUsers.length) + 1) * parseInt(split[1])));
		// }
		console.log(`currentStatus.teamsNumber: ${currentStatus.teamsNumber}`);
		console.log(`teamsNumber: ${teamsNumber}`);
		if (currentStatus.teamsNumber > currentStatus.currentUsers.length || currentStatus.teamsNumber <= 1) {
			currentStatus.teamsNumber = 2;
		}
		currentStatus.currentUsers = _.shuffle(currentStatus.currentUsers);
		currentStatus.teams = _.chunk(currentStatus.currentUsers, Math.ceil(currentStatus.currentUsers.length / teamsNumber));
		currentStatus.teamsNumber = currentStatus.teams.length;
	}
	console.log(currentStatus.teamsNumber);
	let teamMessage = `${currentStatus.teamsNumber} Teams:\n\n`;
	if (!currentStatus.teams) {
		message.channel.send('Use !teams [number of teams] first.');
		return
	}
	currentStatus.teams.forEach((elem, index) => {
		teamMessage += `Team ${index + 1}:\n`;
		elem.forEach((user, index) => {
			teamMessage += `${user.toString()}\n`;
		})
	});
	currentStatus.teamMessage = teamMessage;
	message.channel.send(currentStatus.teamMessage)
}
