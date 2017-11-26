import * as Discord from 'discord.js';
import * as _ from 'lodash';
import {stfuInit} from '../index';

const allowedToSTFU: any = ['374118891854495744', '374118893012385792'];

export function stfu(message: Discord.Message) {
	const user = message.mentions.members.first();
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
