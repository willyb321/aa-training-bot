/**
 * @module Commands
 */
/**
 * ignore
 */
import * as Discord from 'discord.js';
import {client} from '../index';
import {currentStatus} from '../utils';
import * as leven from 'leven';
import * as _ from 'lodash';
import {botLog} from '../utils';

const config = require('../../config.json');
const guild = '374103486154932234';
const mutedRoleId = '383059187942293504';
const botLogId = '383143845841600513';
const oofs = ['oof', '00f', '0of', 'o0f'];

export function modReport(message: Discord.Message) {
	if (isItOof(message)) {
		noOof(message);
		return;
	}
	if (currentStatus.currentDms[message.author.id] && message.createdTimestamp - currentStatus.currentDms[message.author.id].createdTimestamp < 60000) {
		message.reply('Not sent. No spam thx.');
		return;
	}
	message.react('📧')
		.then(() => {
			botLog(`${message.author.tag}: \`\`\`${message.content.toString()}\`\`\``, true);
		});
}

export function isItOof(message: Discord.Message) {
	message.content = _.deburr(message.content);
	return _.indexOf(oofs, message.content.toLowerCase()) >= 0;
}

export function noOof(message: Discord.Message) {
	message.author.createDM()
		.then(dm => {
			dm.send('Oof.');
			message.delete()
				.catch(err => {
					if (err.message === 'Cannot execute action on a DM channel') {
						return;
					}
				});
		});
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
	if (config.allowedUsers.includes(msg.author.id)) {
		return true;
	}
	return !!msg.member.roles.find(elem => config.allowedRoles.includes(elem.id));
}

function levenTesting() {
	const spamtest = ['aertgaerg',
		'e6j',
		'34f',
		'23F',
		'QW5H',
		'Q2W57HJ',
		'34G£$',
		'GQ45',
		'H',
		'3G',
		'3',
		'H1345',
		'H',
		'51346H',
		'146QJN',
		'257J',
		'F3q',
		'34T3Q 7N5',
		'3 4T',
		'3TB',
		'Q45 67',
		'6UQ5',
		'Q4 6UYQ345',
		'234tb b4q23t 45',
		'qua456',
		'q45 yqw56 j4',
		'h 5q',
		'q45y hq45 h',
		'w567jqw5 6u',
		'3 y45',
		'adrg asdfgAERG',
		'wefWEFEGEG',
		'SEFwfaergaw4g',
		'qaergqaercvqearv',
		'tbrqaerg qef q',
		'fqe',
		'ghqhq',
		'e g',
		'w34fq3454gdawefawefWEFQ4T6HAEWRFGQ3E44FG',
		'QERTGQ46G3VSTGHSEGASGAETG',
		'ADTGBWRYH134GVAERGQWRTGH',
		'aegsrthq2w456hq5gqaegaerthgq456hw5h',
		'asdfhaerthw57jq24harbsgrhnarhsryhjaer',
		'hwrjhwr6hjq45hqa4brargsrfghqaerth',
		'aergq45hqhqw7jkw5jathzdfghsty',
		'jme6jQ3GW5NWETBNSTGEGSDHJ',
		'46JWHNRSNHQAH45ETTHQA4',
		'GH65QAH4BW46AHUJWHN6SN',
		'46YUQAZ6QHA46J5YRJNS5A6U4'];
	spamtest.forEach((elem: string, ind: number) => {
		console.log(`String 1: ${elem}`);
		console.log(`String 2: ${spamtest[ind + 1]}`);
		console.log(`Leven = ${leven(elem, spamtest[ind + 1] || '')}`);
	});
}
