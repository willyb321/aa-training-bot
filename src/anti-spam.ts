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

const authors = [];
const warned: string[] = [];
const banned: string[] = [];
const messagelog = [];

export interface antiSpamOpts {
	warnBuffer: number;
	interval: number;
	duplicates: number;
}

/**
 * Add simple spam protection to discord server.
 * Shamelessly nicked from https://github.com/Michael-J-Scofield/discord-anti-spam
 * @param  {any} bot - The discord.js Client/bot
 * @param  {object} options - Optional (Custom configuration options)
 */
export default function antiSpam(bot: Discord.Client, options: antiSpamOpts) {
	// Set options
	const warnBuffer = (options && options.warnBuffer) || 3;
	const interval = (options && options.interval) || 1000;
	const maxDuplicatesWarning = (options && options.duplicates || 7);

	bot.on('message', message => {
		if (checkAllowed(message)) {
			return;
		}
		if (message.author.id === bot.user.id) {
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
				authors.splice(i);
				warned.splice(warned.indexOf(authors[i]));
				banned.splice(warned.indexOf(authors[i]));
			}
			if (messagelog.length >= 100) {
				messagelog.shift();
			}
		}
	});

	/**
	 * Mute a user
	 * @param {any} message The message containing info how to mute user.
	 */
	function mute(message: Discord.Message) {
		const mutedRole: any = client.guilds.get(guild).roles.get(mutedRoleId);
		if (message.member.roles.get(mutedRole.id)) {
			return;
		}
		message.member.addRole(mutedRole, 'Spammed text')
			.then(() => {
				stfuInit(message.member, message.member);
				botLog(`Muting: ${message.author.tag}\nReason: Spammed some text a bit.\nMute will be removed in 30 seconds.`);
				setTimeout(() => {
					message.member.removeRole(mutedRole, 'Spammed text')
						.then(() => {
							currentStatus.currentSpams[message.author.id].muted = false;
						})
						.catch(err => {
							Raven.captureException(err);
						});
				}, 90000);
			})
			.catch(err => {
				Raven.captureException(err);
			});
	}

}
