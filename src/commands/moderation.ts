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
import * as _ from "lodash";

const config = require('../../config.json');
const modChannel = '382662529349976066';
const guild = '374103486154932234';
const mutedRoleId = '383059187942293504';
const botLogId = '383143845841600513';

export function modReport(message: Discord.Message) {
	const moderatorReports: any = client.guilds.get(guild).channels.get(modChannel);
	if (currentStatus.currentDms[message.author.id] && message.createdTimestamp - currentStatus.currentDms[message.author.id].createdTimestamp < 60000) {
		message.reply('Not sent. No spam thx.');
		return;
	}
	message.react('📧');
	moderatorReports.send(`${message.author.tag}: \`\`\`${message.content.toString()}\`\`\``);
}
const oofs = ['oof', '00f', '0of', 'o0f'];
export function isItOof(message: Discord.Message) {
	message.content = _.deburr(message.content);
	if (_.indexOf(oofs, message.content.toLowerCase()) >= 0) {
		message.author.createDM()
			.then(dm => {
				dm.send('Oof.');
				message.delete();
			});
	}
}

export function noSpamPls(message: Discord.Message) {
	const mutedRole: any = client.guilds.get(guild).roles.get(mutedRoleId);
	const botLog: any = client.guilds.get(guild).channels.get(botLogId);
	if (config.allowedUsers.includes(message.author.id)) return;
	config.allowedRoles.forEach(elem => {
		if (message.member.roles.array().find(role => role.id === elem)) {
			return;
		}
	});
	if (currentStatus.currentSpams[message.author.id].muted === true) { return; }
	message.mentions.roles.array().forEach(elem => {
		if (currentStatus.currentSpams[message.author.id].roleMentions[elem.id] > 3 && currentStatus.currentSpams[message.author.id].currentTime.getMilliseconds() - new Date().getMilliseconds() < 30000) {
			console.log(`Muting this guy: ${message.author.tag}`);
			currentStatus.currentSpams[message.author.id].muted = true;
			botLog.send(`Muting: ${message.author.tag}\nReason: Spammed roles more than 3 times in 30 seconds\nMute will be removed in 30 seconds.`);
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
			botLog.send(`Muting: ${message.author.tag}\nReason: Spammed users more than 3 times in 30 seconds.\nMute will be removed in 30 seconds.`);
			message.member.addRole(mutedRole, 'Spammed users more than 3 times in 30 seconds');
			setTimeout(() => {
				message.member.removeRole(mutedRole, 'Spammed users more than 3 times in 30 seconds');
				currentStatus.currentSpams[message.author.id].userMentions[elem.id] = 0;
				currentStatus.currentSpams[message.author.id].muted = false;
			}, 30000);
		}
	});
	isItSpam(message);
}

function mute(msg: Discord.Message) {
	const botLog: any = client.guilds.get(guild).channels.get(botLogId);
	const mutedRole: any = client.guilds.get(guild).roles.get(mutedRoleId);
	if (msg.member.roles.get(mutedRole.id)) return;
	msg.member.addRole(mutedRole, 'Spammed text');
	botLog.send(`Muting: ${msg.author.tag}\nReason: Spammed some text a bit.\nMute will be removed in 30 seconds.`);
	setTimeout(() => {
		msg.member.removeRole(mutedRole, 'Spammed text');
		currentStatus.currentSpams[msg.author.id].muted = false;
	}, 30000);
}

let messagelog = [];
const maxDuplicatesWarning = 3;
const interval = 1000;
const authors = [];
let warned: any = [];
let banned: any = [];
const warnBuffer = 3;
const maxBuffer = 5;

/**
 * Shamelessly nicked from https://github.com/Michael-J-Scofield/discord-anti-spam
 */
function isItSpam(msg: Discord.Message) {
	if (msg.author.id === client.user.id) return;
	const now = Math.floor(Date.now());
	authors.push({
		time: now,
		author: msg.author.id
	});
	messagelog.push({
		message: msg.content,
		author: msg.author.id
	});
	// Check how many times the same message has been sent.
	let msgMatch = 0;
	for (let i = 0; i < messagelog.length; i++) {
		if (messagelog[i].message == msg.content && (messagelog[i].author == msg.author.id) && (msg.author.id !== client.user.id)) {
			msgMatch++;
		}
	}
	// Check matched count
	if (msgMatch === maxDuplicatesWarning && !warned.includes(msg.author.id)) {
		mute(msg);
	}

	let matched = 0;

	for (let i = 0; i < authors.length; i++) {
		if (authors[i].time > now - interval) {
			matched++;
			if (matched == warnBuffer && !warned.includes(msg.author.id)) {
				mute(msg);
			}
			else if (matched == maxBuffer) {
				if (!banned.includes(msg.author.id)) {
					mute(msg);
				}
			}
		}
		else if (authors[i].time < now - interval) {
			authors.splice(i);
			warned.splice(warned.indexOf(authors[i]));
			banned.splice(warned.indexOf(authors[i]));
		}
		if (messagelog.length >= 200) {
			messagelog.shift();
		}
	}
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
