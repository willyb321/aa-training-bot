import * as Discord from 'discord.js';
import {stfuInit, client} from '../index';
import {join} from 'path';
import {currentStatus} from "../utils";

const allowedToSTFU: any = ['374118891854495744', '374118893012385792', '381988545088323584'];

export function stfu(message: Discord.Message) {
	const user = message.mentions.members.first();
	if (currentStatus.inVoice) {
		return;
	}
	if (!user) {
		return;
	}
	if (message.member.roles.find(elem => allowedToSTFU.includes(elem.id)) && user.voiceChannel) {
		console.log('Doing it!');
		stfuInit(user, user);
		return;
	}
	if (!user.voiceChannel && message.member.roles.find(elem => allowedToSTFU.includes(elem.id))) {
		message.channel.send(`STFU ${user.toString()}!`);
		return;
	}
}

export function meat(message: Discord.Message) {
	if (client.voiceConnections.first()) {
		return;
	}
	const newUser = message.mentions.members.first();
	if (!newUser) {
		return;
	}
	if (!newUser.voiceChannel && message.member.roles.find(elem => allowedToSTFU.includes(elem.id))) {
		return;
	}
	if (currentStatus.inVoice) {
		return;
	}
	if (message.member.roles.find(elem => allowedToSTFU.includes(elem.id)) && newUser.voiceChannel) {
		console.log('Doing it!');
		currentStatus.inVoice = true;
		newUser.voiceChannel.join()
			.then(voice => {
				const voiceDis = voice.playFile(join(__dirname, '..', '..', 'meat.mp3'), {
					bitrate: 10000,
					passes: 1
				});
				voiceDis.on('start', () => {
					console.log('Start');
				});
				voiceDis.on('end', () => {
					console.log('End');
					setTimeout(() => {
						voice.disconnect();
						currentStatus.inVoice = false;
					}, 10000);
					voice.disconnect();
				});
				voiceDis.on('speaking', yesorno => {
					console.log('Speaking');
				});
				voiceDis.on('error', err => {
					console.log(err);
				});
			})
			.catch(err => {
				console.log(err);
			});
	}
}
