/**
 * @module Index
 */
/**
 * ignore
 */
// Import modules
import 'source-map-support/register';
import * as Discord from 'discord.js';
import * as commands from './commands';
import * as _ from 'lodash';
import * as meSpeak from 'mespeak';
import * as Raven from 'raven';
import * as AudioSprite from 'audiosprite-pkg';
meSpeak.loadVoice(require('mespeak/voices/en/en-us.json'));
import {botLog, config, currentStatus} from './utils';
import {join} from 'path';
import * as fs from 'fs';
import {tmpdir} from 'os';
import antiSpam, {antiSpamOpts} from './anti-spam';
import {pvpVideoID} from "./commands";
import {existsSync} from "fs";

Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();

// Create an instance of a Discord client
export const client = new Discord.Client();
const {allowedServers, token} = config;
// The token of your bot - https://discordapp.com/developers/applications/me

process.on('uncaughtException', (err: Error) => {
	Raven.captureException(err);
});

process.on('unhandledRejection', (err: Error) => {
	Raven.captureException(err);
});
meSpeak.loadConfig(require('mespeak/src/mespeak_config.json'));
meSpeak.loadVoice(require('mespeak/voices/en/en-us.json'), () => {
});
client.on('voiceStateUpdate', (oldUser: Discord.GuildMember, newUser: Discord.GuildMember) => {
	try {
		newUser.guild.members.get(client.user.id).setMute(false, 'Nah.')
			.then(() => {
				// no-op
			})
			.catch(err => {
				Raven.captureException(err);
			});
	} catch (err) {
		Raven.captureException(err);
	}
	stfuInit(oldUser, newUser, true);
});

export function stfuInit(oldUser: Discord.GuildMember, newUser: Discord.GuildMember, joined?: boolean) {
	if (client.voiceConnections.array().length > 0) {
		return;
	}
	if (currentStatus.inVoice) {
		return;
	}
	const now = Math.floor(Date.now());
	if (!joined && newUser.voiceChannel !== undefined) {
		if (currentStatus.lastStfu && now - currentStatus.lastStfu <= commands.stfuInterval) {
			console.log(`Not STFUing since ${commands.stfuInterval / 1000} seconds have not passed since the last one. (${now - currentStatus.lastStfu})`);
			return;
		}
		currentStatus.inVoice = true;
		currentStatus.lastStfu = Math.floor(Date.now());
		stfuTrue(newUser);
		return;
	}
	if (Math.random() < 0.95) {
		return;
	}
	if (newUser.voiceChannel === undefined) {
		return;
	}
	if (oldUser.voiceChannel === undefined && newUser.voiceChannel !== undefined && !currentStatus.inVoice) {
		if (currentStatus.lastStfu && now - currentStatus.lastStfu <= commands.stfuInterval) {
			console.log(`Not STFUing since ${commands.stfuInterval / 1000} seconds have not passed since the last one. (${now - currentStatus.lastStfu})`);
			return;
		}
		currentStatus.inVoice = true;
		currentStatus.lastStfu = Math.floor(Date.now());
		stfuTrue(newUser);
	}
}

function stfuTrue(newUser: Discord.GuildMember) {
	newUser.user.username = _.escapeRegExp(newUser.user.username);
	newUser.user.username = newUser.user.username.replace('/', '+');
	console.log(`Joining ${newUser.voiceChannel.name} to tell ${newUser.user.username} to STFU`);
	botLog(`Joining ${newUser.voiceChannel.name} to tell ${newUser.user.username} to STFU`, `STFUing ${newUser.user.tag}`, 'STFU');
	setTimeout(() => {
		if (newUser.voiceChannel) {
			if (existsSync(join(tmpdir(), `stfu-${newUser.user.username}.mp3`))) {
				return stfu(newUser);
			}
			const msg = `Shut the fuck up ${newUser.user.username}`;
			const buf = meSpeak.speak(msg, {rawdata: 'buffer'});
			fs.writeFileSync(join(tmpdir(), `stfu-${newUser.user.username}.wav`), buf);
			const as = new AudioSprite();
			as.inputFile(join(tmpdir(), `stfu-${newUser.user.username}.wav`), function (err) {
				if (err) {
					Raven.captureException(err);
				}
				as.outputFile(join(tmpdir(), `stfu-${newUser.user.username}.mp3`), {format: 'mp3'}, function (err) {
					if (err) {
						Raven.captureException(err);
					}
					stfu(newUser);
				});
			});
		}
	}, _.random(1000, 5000));
}

function stfu(newUser: Discord.GuildMember) {
	if (!newUser || !newUser.voiceChannel) {
		return;
	}
	newUser.voiceChannel.join()
		.then(voice => {
			newUser.guild.members.get(client.user.id).setMute(false, 'Nah.')
				.then(() => {
					// no-op
				})
				.catch(err => {
					Raven.captureException(err);
				});
			const voiceDis = voice.playFile(join(tmpdir(), `stfu-${newUser.user.username}.mp3`), {
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
				}, 2000);
			});
			voiceDis.on('speaking', () => {
				console.log('Speaking');
			});
			voiceDis.on('error', err => {
				Raven.captureException(err);
			});
		})
		.catch(err => {
			Raven.captureException(err);
			return stfu(newUser);
		});
}

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
	console.log('I am ready!');
	client.user.setGame('in moderation')
		.then(() => {
			// no-op
		})
		.catch(err => {
			Raven.captureException(err);
		});
	const opts: antiSpamOpts = {
		warnBuffer: 10,
		interval: 20000,
		duplicates: 7
	};
	antiSpam(client, opts);
});

// Create an event listener for messages
client.on('message', (message: Discord.Message) => {
	if (message.author.id === client.user.id) {
		return;
	}
	if (message.channel.type === 'dm') {
		commands.isItOof(message);
		commands.modReport(message)
			.then(() => {
				currentStatus.currentDms[message.author.id] = message;
				return;
			})
			.catch(err => {
				Raven.captureException(err);
			});
	}
	if (_.indexOf(allowedServers, message.guild.id) === -1) {
		return;
	}
	if (message.channel.id === pvpVideoID) {
		return commands.moderatePVP(message);
	}
	if (!currentStatus.currentSpams[message.author.id]) {
		currentStatus.currentSpams[message.author.id] = {
			messages: [],
			roleMentions: {},
			userMentions: {},
			muted: false,
			currentTime: new Date()
		};
	}

	setTimeout(() => {
		currentStatus.currentSpams[message.author.id].currentTime = new Date();
		currentStatus.currentSpams[message.author.id].messages = [];
	}, 60000);

	currentStatus.currentSpams[message.author.id].messages.push(message);
	message.mentions.roles.array().forEach(elem => {
		if (!currentStatus.currentSpams[message.author.id].roleMentions[elem.id]) {
			currentStatus.currentSpams[message.author.id].roleMentions[elem.id] = 0;
		}
		currentStatus.currentSpams[message.author.id].roleMentions[elem.id]++;
	});
	message.mentions.users.array().forEach(elem => {
		if (!currentStatus.currentSpams[message.author.id].userMentions[elem.id]) {
			currentStatus.currentSpams[message.author.id].userMentions[elem.id] = 0;
		}
		currentStatus.currentSpams[message.author.id].userMentions[elem.id]++;
	});
	message.content = message.content.toLowerCase();
	if (commands.isItOof(message)) {
		return commands.noOof(message);
	}
	commands.noSpamPls(message);
	if (message.content.startsWith('!stfu')) {
		// Send "pong" to the same channel
		return commands.stfu(message);
	}
	if (message.content.startsWith('!rub') || message.content.startsWith('!meat')) {
		// Send "pong" to the same channel
		return commands.meat(message);
	}
	if (message.content.startsWith('!purge')) {
		return commands.purge(message);
	}

	//TODO add some replies
	// if (message.isMentioned(client.user)) {
	// 	_.shuffle(currentStatus.replies);
	// 	message.reply(currentStatus.replies[0]);
	// }
	// If the message is "!start"
	if (message.content === '!start') {
		// Send "pong" to the same channel
		return commands.start(message);
	}
	if (message.content.startsWith('!register') || message.content.startsWith('!reg')) {
		// Send "pong" to the same channel
		return commands.register(message);
	}
	if (message.content.startsWith('!unregister') || message.content.startsWith('!unreg')) {
		// Send "pong" to the same channel
		return commands.unregister(message);
	}
	if (message.content === '!who') {
		// Send "pong" to the same channel
		return commands.who(message);
	}
	if (message.content.startsWith('!teams')) {
		// Send "pong" to the same channel
		return commands.teams(message);
	}
	if (message.content.startsWith('!rating')) {
		// Send "pong" to the same channel
		return commands.rating(message);
	}
	if (message.content.startsWith('!remove')) {
		// Send "pong" to the same channel
		return commands.remove(message);
	}
	if (message.content === '!instanced' || message.content === '!i') {
		// Send "pong" to the same channel
		return commands.instanced(message);
	}
	if (message.content === '!ready' || message.content === '!r') {
		// Send "pong" to the same channel
		return commands.ready(message);
	}
	if (message.content.startsWith('!ir')) {
		// Send "pong" to the same channel
		commands.instanced(message);
		commands.ready(message);
		return;
	}
	if (message.content === '!go') {
		// Send "pong" to the same channel
		return commands.go(message);
	}
	if (message.content === '!reset') {
		// Send "pong" to the same channel
		return commands.reset(message);
	}
	if (message.content === '!help') {
		// Send "pong" to the same channel
		return commands.help(message);
	}
	// if (message.content.startsWith('!')) {
	// 	return message.reply('whadiyatalkinabeet');
	// }
});
console.log(commands);
// Log our bot in
client.login(token);
