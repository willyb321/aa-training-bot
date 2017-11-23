/**
 * @module Commands
 */
/**
 * ignore
 */
import * as Discord from 'discord.js';
import * as _ from 'lodash';
import {client} from '../index';
import {currentStatus} from "../utils";
import * as leven from 'leven';

const modChannel = '382662529349976066';
const guild = '374103486154932234';
const mutedRoleId = '383059187942293504';
const botLogId = '383143845841600513';

export function modReport(message: Discord.Message) {
	const moderatorReports: any = client.guilds.get(guild).channels.get(modChannel);
	if (currentStatus.currentDms[message.author.id] && message.createdTimestamp - currentStatus.currentDms[message.author.id].createdTimestamp < 60000) {
		message.reply(`Not sent. No spam thx.`);
		return;
	}
	message.react('📧');
	moderatorReports.send(`${message.author.tag}: \`\`\`${message.content.toString()}\`\`\``)
}

export function noSpamPls(message: Discord.Message) {
	const mutedRole: any = client.guilds.get(guild).roles.get(mutedRoleId);
	const botLog: any = client.guilds.get(guild).channels.get(botLogId);
	message.mentions.roles.array().forEach(elem => {
		if (currentStatus.currentSpams[message.author.id].roleMentions[elem.id] > 3 && currentStatus.currentSpams[message.author.id].currentTime.getMilliseconds() - new Date().getMilliseconds() < 30000) {
			console.log(`Muting this guy: ${message.author.tag}`);
			botLog.send(`Muting: ${message.author.tag}\nReason: Spammed roles more than 3 times in 30 seconds\nMute will be removed in 30 seconds.`);
			message.member.addRole(mutedRole, `Spammed roles more than 3 times in 30 seconds`);
			setTimeout(() => {
				message.member.removeRole(mutedRole, `Spammed roles more than 3 times in 30 seconds`);
				currentStatus.currentSpams[message.author.id].roleMentions[elem.id] = 0;
			}, 30000)
		}
	});
	message.mentions.users.array().forEach(elem => {
		if (currentStatus.currentSpams[message.author.id].userMentions[elem.id] > 3 && currentStatus.currentSpams[message.author.id].currentTime.getMilliseconds() - new Date().getMilliseconds() < 30000) {
			console.log(`Muting this guy: ${message.author.tag}`);
			botLog.send(`Muting: ${message.author.tag}\nReason: Spammed users more than 3 times in 30 seconds.\nMute will be removed in 30 seconds.`);
			message.member.addRole(mutedRole, `Spammed users more than 3 times in 30 seconds`);
			setTimeout(() => {
				message.member.removeRole(mutedRole, `Spammed users more than 3 times in 30 seconds`);
				currentStatus.currentSpams[message.author.id].userMentions[elem.id] = 0;
			}, 30000)
		}
	})
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
		console.log(`Leven = ${leven(elem, spamtest[ind + 1] || '')}`)
	});
}
