///<reference path="../node_modules/@types/node/index.d.ts"/>
/**
 * @module Index
 */
/**
 * ignore
 */
// Import modules
import 'source-map-support/register';
import * as Commando from 'discord.js-commando';
import * as Discord from 'discord.js';
import * as _ from 'lodash';
import * as meSpeak from 'mespeak';
import * as Raven from 'raven';
import * as AudioSprite from 'audiosprite-pkg';
import {botLog, checkCurrentPolls, config, currentStatus, isItOof, noOof} from './utils';
import {join} from 'path';
import * as fs from 'fs';
import {tmpdir} from 'os';
// import antiSpam, {antiSpamOpts} from './anti-spam';
import {moderatePVP, pvpVideoID} from './pvpmod';
import {existsSync} from 'fs';
import * as Admin from './commands/admin/schedule';

import * as sqlite from "sqlite";

const oneLine = require('common-tags').oneLine;

meSpeak.loadVoice(require('mespeak/voices/en/en-us.json'));

Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();

// Create an instance of a Discord client
export const client = new Commando.CommandoClient({
	owner: config.owners,
	commandPrefix: '?',
	unknownCommandResponse: false
});
const {allowedServers, token} = config;

process.on('uncaughtException', (err) => {
	Raven.captureException(err);
	console.error(err);
});

process.on('unhandledRejection', (err: Error) => {
	Raven.captureException(err);
	console.error(err);
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
		if (currentStatus.lastStfu && now - currentStatus.lastStfu <= config.stfuInterval) {
			console.log(`Not STFUing since ${config.stfuInterval / 1000} seconds have not passed since the last one. (${now - currentStatus.lastStfu})`);
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
		if (currentStatus.lastStfu && now - currentStatus.lastStfu <= config.stfuInterval) {
			console.log(`Not STFUing since ${config.stfuInterval / 1000} seconds have not passed since the last one. (${now - currentStatus.lastStfu})`);
			return;
		}
		currentStatus.inVoice = true;
		currentStatus.lastStfu = Math.floor(Date.now());
		stfuTrue(newUser);
	}
}

export function stfuTrue(newUser: Discord.GuildMember) {
	newUser.user.username = _.escapeRegExp(newUser.user.username);
	newUser.user.username = newUser.user.username.replace('/', '+');
	console.log(`Joining ${newUser.voiceChannel.name} to tell ${newUser.user.username} to STFU`);
	botLog(`Joining ${newUser.voiceChannel.name} to tell ${newUser.user.username} to STFU`, `STFUing ${newUser.user.tag}`, 'STFU');
	setTimeout(() => {
		if (newUser.voiceChannel) {
			if (existsSync(join(tmpdir(), `stfu-${newUser.user.username}.mp3`))) {
				return stfu(newUser);
			} else {
				const msg = `Shut the fuck up ${newUser.user.username}`;
				const buf = meSpeak.speak(msg, {rawdata: 'buffer'});
				fs.writeFileSync(join(tmpdir(), `stfu-${newUser.user.username}.wav`), buf);
				const outputfile = new AudioSprite();
				outputfile.inputFile(join(tmpdir(), `stfu-${newUser.user.username}.wav`), err => {
					if (err) {
						Raven.captureException(err);
						console.error(err);
					}
					outputfile.outputFile(join(tmpdir(), `stfu-${newUser.user.username}.mp3`), {format: 'mp3'}, err => {
						if (err) {
							Raven.captureException(err);
							console.error(err);
						}
						stfu(newUser);
					});
				});
			}
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
			const voiceDis = voice.play(join(tmpdir(), `stfu-${newUser.user.username}.mp3`), {
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

			});
			voiceDis.on('error', err => {
				Raven.captureException(err);
			});
		})
		.catch(err => {
			Raven.captureException(err);
			return;
		});
}

client
	.on('error', console.error)
	.on('warn', console.warn)
	.on('debug', process.env.NODE_ENV !== 'production' ? console.info : () => null)
	.on('ready', () => {
		console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
	})
	.on('disconnect', () => { console.warn('Disconnected!'); })
	.on('reconnecting', () => { console.warn('Reconnecting...'); })
	.on('commandError', (cmd, err) => {
		if (err instanceof Commando.FriendlyError) { return; }
		console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
	})
	.on('commandBlocked', (msg, reason) => {
		console.log(oneLine`
			Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
			blocked; ${reason}
		`);
	})
	.on('commandPrefixChange', (guild, prefix) => {
		console.log(oneLine`
			Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on('commandStatusChange', (guild, command, enabled) => {
		console.log(oneLine`
			Command ${command.groupID}:${command.memberName}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on('groupStatusChange', (guild, group, enabled) => {
		console.log(oneLine`
			Group ${group.id}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	});

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
	console.log('I am ready!');
	client.user.setActivity('in moderation')
		.then(() => {
			// no-op
		})
		.catch(err => {
			Raven.captureException(err);
		});
	Admin.addAllAnnouncementsToMemory();
	checkCurrentPolls()
});

client.on('guildMemberAdd', (member: Discord.GuildMember) => {
	const guestRole = client.guilds.get(config.paradigmID).roles.get('374118887060668417');
	const editData = {roles: ['374118887060668417']};
	member.edit(editData)
		.then(() => {
			console.log(`Gave ${member.displayName} guest`);
		})
		.catch(err => {
			console.error(err);
			Raven.captureException(err);
		})
});

client.registry
	.registerGroup('misc', 'misc')
	.registerGroup('admin', 'admin')
	.registerDefaults()
	.registerCommandsIn(join(__dirname, 'commands', 'misc'))
	.registerCommandsIn(join(__dirname, 'commands', 'admin'));

// Create an event listener for messages
client.on('message', (message: Discord.Message) => {
	if (message.author.id === client.user.id) {
		return;
	}
	if (message.member && message.member.roles.get(config.botRoleID)) {
		return;
	}
	if (!message.guild) {
		return;
	}
	if (_.indexOf(allowedServers, message.guild.id) === -1) {
		return;
	}
	if (message.channel.id === pvpVideoID) {
		return moderatePVP(message);
	}

	message.content = message.content.toLowerCase();
	if (isItOof(message)) {
		return noOof(message);
	}
});
client.setProvider(
	sqlite.open(join(__dirname, '..', 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);


// Log our bot in
client.login(token)
	.then(() => {
		console.log('Ainsley logged in.');
	})
	.catch((err: Error) => {
		Raven.captureException(err);
		process.exit(1);
	});
