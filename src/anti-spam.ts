/**
 * @module AntiSpam
 */
/**
 * ignore
 */
import * as Discord from 'discord.js';
import {botLog, currentStatus, config} from './utils';
import {client, stfuInit} from './index';
import {checkAllowed} from './commands';
import * as Raven from 'raven';

Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();

const guild = '374103486154932234';
const mutedRoleId = '383059187942293504';

let authors: IAuthors[] = [];
let warned: string[] = [];
let messagelog = [];

export interface antiSpamOpts {
	warnBuffer: number;
	interval: number;
	duplicates: number;
}

export interface IAuthors {
	time: number;
	author: string;
}
const timers = [];
/**
 * Add simple spam protection to discord server.
 * Shamelessly nicked from https://github.com/Michael-J-Scofield/discord-anti-spam
 * @param  {Discord.Client} bot - The discord.js Client/bot
 * @param  {antiSpamOpts} options - Optional (Custom configuration options)
 */
export default function antiSpam(bot: Discord.Client, options: antiSpamOpts) {
	// Set options
	const warnBuffer = (options && options.warnBuffer) || 3;
	const interval = (options && options.interval) || 1000;
	const maxDuplicatesWarning = (options && options.duplicates || 7);

	bot.on('message', (message: Discord.Message) => {
		if (checkAllowed(message)) {
			return;
		}
		if (message.author.id === bot.user.id) {
			return;
		}
		if (message.attachments.first() && [...message.content].length === 0) {
			return;
		}
		const now = Math.floor(Date.now());
		authors.push({
			time: now,
			author: message.author.id
		});
		messagelog.push({
			message: message.content,
			author: message.author.id
		});
		setTimeout(() => {
			messagelog = [];
			authors = [];
			warned = [];

		}, config.muteMS / 2);
		// Check how many times the same message has been sent.
		let msgMatch = 0;
		for (let i = 0; i < messagelog.length; i++) {
			if (messagelog[i].message == message.content && (messagelog[i].author == message.author.id) && (message.author.id !== bot.user.id)) {
				msgMatch++;
			}
		}
		// Check matched count
		if (msgMatch >= maxDuplicatesWarning && !warned.includes(message.author.id)) {
			mute(message);
		}

		let matched = 0;

		for (let i = 0; i < authors.length; i++) {
			if (authors[i].time > now - interval) {
				matched++;
				if (matched >= warnBuffer && !warned.includes(message.author.id)) {
					mute(message);
				}
			}
			else if (authors[i].time < now - interval) {
				warned.splice(warned.indexOf(authors[i].author), 1);
				authors.splice(i, 1);
			}
			if (messagelog.length >= 100) {
				messagelog = [];
			}
		}
	});

	/**
	 * Mute a user
	 * @param {Discord.Message} message The message containing user info.
	 */
	function mute(message: Discord.Message): void {
		let mutedRole: Discord.Role;
		try {
			mutedRole = client.guilds.get(guild).roles.get(mutedRoleId);
		} catch(err) {
			Raven.captureException(err);
		}
		if (message.member.roles.get(mutedRoleId)) {
			return;
		}
		if (!mutedRole) {
			return;
		}
		message.member.addRole(mutedRole, 'Spammed text')
			.then(() => {
				botLog(`Muting ${message.author.tag}`, 'Text spam mute', 'Reason: Spammed text.');
				setTimeout(() => {
					message.member.removeRole(mutedRole, 'Spammed text')
						.then(() => {
							currentStatus.currentSpams[message.author.id].muted = false;
						})
						.catch(err => {
							Raven.captureException(err);
						});
				}, config.muteMS);
				stfuInit(message.member, message.member);
			})
			.catch(err => {
				Raven.captureException(err);
			});
	}

}
