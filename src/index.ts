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
import {currentStatus} from './utils';

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

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
	console.log('I am ready!');
	client.user.setGame('in moderation');
});

// Create an event listener for messages
client.on('message', (message: Discord.Message) => {
	if (message.author.id === client.user.id) { return; }
	if (message.channel.type === 'dm') {
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
		if (!currentStatus.currentSpams[message.author.id].roleMentions[elem.id]) { currentStatus.currentSpams[message.author.id].roleMentions[elem.id] = 0; }
		currentStatus.currentSpams[message.author.id].roleMentions[elem.id]++;
	});
	message.mentions.users.array().forEach(elem => {
		if (!currentStatus.currentSpams[message.author.id].userMentions[elem.id]) { currentStatus.currentSpams[message.author.id].userMentions[elem.id] = 0; }
		currentStatus.currentSpams[message.author.id].userMentions[elem.id]++;
	});
	commands.noSpamPls(message);
	if (_.indexOf(allowedChannels, message.channel.id) === -1) {
		return;
	}
	message.content = _.deburr(message.content);
	if (message.content.toLowerCase().startsWith('oof') || message.content.toLowerCase().startsWith('00f') || message.content.toLowerCase().startsWith('0of') || message.content.toLowerCase().startsWith('o0f')) {
		message.author.createDM()
			.then(dm => {
				dm.send('Oof.');
				message.delete();
			});
	}
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
