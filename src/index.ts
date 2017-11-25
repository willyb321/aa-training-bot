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

meSpeak.loadVoice(require("mespeak/voices/en/en-us.json"))
import {currentStatus} from './utils';
import {join} from "path";
import * as fs from "fs";
import {PassThrough, Readable, Writable} from "stream";
import {tmpdir} from "os";

const serve = require('serve');
const AudioSprite = require('audiosprite-pkg');

// Create an instance of a Discord client
export const client = new Discord.Client();
const {allowedChannels, allowedServers} = require('../config.json');
// The token of your bot - https://discordapp.com/developers/applications/me
const token = require('../config.json').token;

process.on('uncaughtException', (err: Error) => {
	console.log(err);
});

process.on('unhandledRejection', (err: Error) => {
	console.log(err);
});
meSpeak.loadConfig(require('mespeak/src/mespeak_config.json'));
meSpeak.loadVoice(require("mespeak/voices/en/en-us.json"), () => {
});
const server = serve(tmpdir(), {
	port: 1337
});
const ax3 = ['139931372247580672', '156911063089020928', '120257529740525569', '111992757635010560', '145883108170924032', '254833351846920192', '299390680000626688'];
client.on('voiceStateUpdate', (oldUser: Discord.GuildMember, newUser: Discord.GuildMember) => {
	if (ax3.indexOf(newUser.user.id) >= 0) {
		if (client.voiceConnections.array().length > 0) {
			return;
		}
		if (_.random(1, 100) > 50) return;
		setTimeout(() => {
			if (newUser.voiceChannel) {
				newUser.voiceChannel.join()
					.then(voice => {
						const buf = meSpeak.speak(`Shut the fuck up ${newUser.user.username}`, {rawdata: "buffer"});
						fs.writeFileSync(join(tmpdir(), `stfu-${newUser.user.username}.wav`), buf);
						let songs = [join(tmpdir(), `stfu-${newUser.user.username}.wav`), join(tmpdir(), `stfu-${newUser.user.username}.wav`), join(tmpdir(), `stfu-${newUser.user.username}.wav`), join(tmpdir(), `stfu-${newUser.user.username}.wav`)];
						for (let i = 0; i < 3; i++) {
							songs = songs.concat(songs);
						}
						console.log(songs.length)
						const as = new AudioSprite();
						as.inputFile(songs, function (err) {
							if (err) console.log(err);
							// .outputFile can also be called many times with different formats
							as.outputFile(join(tmpdir(), `stfu-${newUser.user.username}-concat.mp3`), {format: 'mp3'}, function (err) {
								if (err) {
									console.log(err);
								}
								const voiceDis = voice.playArbitraryInput(join(tmpdir(), `/stfu-${newUser.user.username}-concat.mp3`));
								voiceDis.setVolume(1);
								voiceDis.on('start', () => {
									console.log('start');
									voice.disconnect();
								});
								voiceDis.on('end', () => {
									console.log('test');
									voice.disconnect();
								});
								voiceDis.on('speaking', (yesorno) => {
									console.log('test');
									if (yesorno && voiceDis.time === voiceDis.totalStreamTime) {
										voice.disconnect();
									}
								});
								voiceDis.on('error', (err) => {
									console.log(err);
									// voice.disconnect();
								})
							});
						});
					}).catch(err => {
					console.log(err);
				})
			}
		}, _.random(1000, 5000))
	}
});

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
	console.log('I am ready!');
	client.user.setGame('in moderation');
});

// Create an event listener for messages
client.on('message', (message: Discord.Message) => {
	if (message.author.id === client.user.id) {
		return;
	}
	if (message.channel.type === 'dm') {
		commands.isItOof(message);
		commands.modReport(message);
		currentStatus.currentDms[message.author.id] = message;
		return;
	}
	if (_.indexOf(allowedServers, message.guild.id) === -1) {
		return;
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
	if (commands.isItOof(message)) {
		commands.noOof(message);
	}
	commands.noSpamPls(message);
	if (_.indexOf(allowedChannels, message.channel.id) === -1) {
		return;
	}
	//TODO add some replies
	// if (message.isMentioned(client.user)) {
	// 	_.shuffle(currentStatus.replies);
	// 	message.reply(currentStatus.replies[0]);
	// }
	// If the message is "!start"
	if (message.content === '!start') {
		// Send "pong" to the same channel
		commands.start(message);
	}
	if (message.content.startsWith('!register') || message.content.startsWith('!reg')) {
		// Send "pong" to the same channel
		commands.register(message);
	}
	if (message.content.startsWith('!unregister') || message.content.startsWith('!unreg')) {
		// Send "pong" to the same channel
		commands.unregister(message);
	}
	if (message.content === '!who') {
		// Send "pong" to the same channel
		commands.who(message);
	}
	if (message.content.startsWith('!teams')) {
		// Send "pong" to the same channel
		commands.teams(message);
	}
	if (message.content.startsWith('!rating')) {
		// Send "pong" to the same channel
		commands.rating(message);
	}
	if (message.content.startsWith('!remove')) {
		// Send "pong" to the same channel
		commands.remove(message);
	}
	if (message.content === '!instanced' || message.content === '!i') {
		// Send "pong" to the same channel
		commands.instanced(message);
	}
	if (message.content === '!ready' || message.content === '!r') {
		// Send "pong" to the same channel
		commands.ready(message);
	}
	if (message.content.startsWith('!ir')) {
		// Send "pong" to the same channel
		commands.instanced(message);
		commands.ready(message);
	}
	if (message.content === '!go') {
		// Send "pong" to the same channel
		commands.go(message);
	}
	if (message.content === '!reset') {
		// Send "pong" to the same channel
		commands.reset(message);
	}
	if (message.content === '!help') {
		// Send "pong" to the same channel
		commands.help(message);
	}
});
console.log(commands);
// Log our bot in
client.login(token);
