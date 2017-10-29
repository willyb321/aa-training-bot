/*
  A ping pong bot, whenever you send "ping", it replies "pong".
*/

// Import modules
import * as Discord from 'discord.js';
import * as commands from './commands'
import {db} from './utils';
// Create an instance of a Discord client
export const client = new Discord.Client();

// The token of your bot - https://discordapp.com/developers/applications/me
const token = 'MzcxNDYyMDIxODA5NTY5Nzk0.DM1-ew.yL9HT5A8GrkOEchDmt6mU0NNBq8';

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
	console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', message => {
	// If the message is "!start"
	if (message.content === '!start') {
		// Send "pong" to the same channel
		commands.start(message);
	}
	if (message.content.startsWith('!register') || message.content.startsWith('!reg')) {
		// Send "pong" to the same channel
		commands.register(message);
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
	if (message.content === '!go') {
		// Send "pong" to the same channel
		commands.go(message);
	}
	if (message.content === '!reset') {
		// Send "pong" to the same channel
		commands.reset(message);
	}
});
console.log(commands);
// Log our bot in
client.login(token);
