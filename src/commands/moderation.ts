/**
 * @module Commands
 */
/**
 * ignore
 */
import * as Discord from 'discord.js';
import {client} from '../index';
import {currentStatus, config} from '../utils';
import * as _ from 'lodash';
import {botLog} from '../utils';
import * as Raven from 'raven';

Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();

const guild = '374103486154932234';
const mutedRoleId = '383059187942293504';
const botLogId = '383143845841600513';
const oofs = ['oof', '00f', '0of', 'o0f', 'Oоf'];
const unicodeOofs = [];
export function modReport(message: Discord.Message) {
	if (isItOof(message)) {
		noOof(message);
		return;
	}
	if (currentStatus.currentDms[message.author.id] && message.createdTimestamp - currentStatus.currentDms[message.author.id].createdTimestamp < 60000) {
		return message.reply('Not sent. No spam thx.');
	}
	message.react('📧')
		.then(() => {
			botLog(`${message.author.tag}: \`\`\`${message.content.toString()}\`\`\``, true);
		});
}

export function isItOof(message: Discord.Message) {
	let oofedContent = message.content;
	oofedContent = _.deburr(oofedContent);
	oofedContent = _.words(oofedContent).join(' ');
	if (oofedContent.startsWith('o') && oofedContent.endsWith('f') && oofedContent.search('oof') > -1) {
		return true
	}
	if (oofedContent.search(`🇴`) > -1 && oofedContent.search('🇫') > -1) {
		return true
	}
	return _.indexOf(oofs, oofedContent.toLowerCase()) >= 0;
}

export function noOof(message: Discord.Message) {
	message.author.createDM()
		.then(dm => {
			dm.send('Oof.');
			message.delete()
				.catch(err => {
					if (err.message === 'Cannot execute action on a DM channel') {
						return;
					} else {
						Raven.captureException(err);
					}
				});
	}).catch(err => {
		console.log(err);
	})
}

export function noSpamPls(message: Discord.Message) {
	const mutedRole: any = client.guilds.get(guild).roles.get(mutedRoleId);
	if (!mutedRole) { return; }
	if (config.allowedUsers.includes(message.author.id)) {
		return;
	}
	if (checkAllowed(message)) {
		return;
	}
	if (currentStatus.currentSpams[message.author.id].muted === true || message.member.roles.get(mutedRole)) {
		return;
	}
	message.mentions.roles.array().forEach(elem => {
		if (currentStatus.currentSpams[message.author.id].roleMentions[elem.id] > 3 && currentStatus.currentSpams[message.author.id].currentTime.getMilliseconds() - new Date().getMilliseconds() < 30000) {
			console.log(`Muting this guy: ${message.author.tag}`);
			currentStatus.currentSpams[message.author.id].muted = true;
			botLog(`Muting: ${message.author.tag}\nReason: Spammed roles more than 3 times in 30 seconds\nMute will be removed in 30 seconds.`);
			message.member.addRole(mutedRole, 'Spammed roles more than 3 times in 30 seconds');
			setTimeout(() => {
				message.member.removeRole(mutedRole, 'Spammed roles more than 3 times in 30 seconds');
				currentStatus.currentSpams[message.author.id].roleMentions[elem.id] = 0;
				currentStatus.currentSpams[message.author.id].muted = false;
			}, 30000);
		}
	});
	message.mentions.users.array().forEach(elem => {
		if (currentStatus.currentSpams[message.author.id].userMentions[elem.id] > 3 && currentStatus.currentSpams[message.author.id].currentTime.getMilliseconds() - new Date().getMilliseconds() < 30000) {
			console.log(`Muting this guy: ${message.author.tag}`);
			currentStatus.currentSpams[message.author.id].muted = true;
			botLog(`Muting: ${message.author.tag}\nReason: Spammed users more than 3 times in 30 seconds.\nMute will be removed in 30 seconds.`);
			message.member.addRole(mutedRole, 'Spammed users more than 3 times in 30 seconds');
			setTimeout(() => {
				message.member.removeRole(mutedRole, 'Spammed users more than 3 times in 30 seconds');
				currentStatus.currentSpams[message.author.id].userMentions[elem.id] = 0;
				currentStatus.currentSpams[message.author.id].muted = false;
			}, 30000);
		}
	});
}

export function checkAllowed(msg) {
	if (!msg || !msg.author || !msg.author.id || !msg.member || !msg.member.roles) {
		return;
	}
	if (config.allowedUsers.includes(msg.author.id)) {
		return true;
	}
	return !!msg.member.roles.find(elem => config.allowedRoles.includes(elem.id));
}
