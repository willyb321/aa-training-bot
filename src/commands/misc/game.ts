/**
 * @module Commands
 */
/**
 * ignore
 */
import * as Raven from 'raven';
import {config} from '../../utils';
import * as Commando from 'discord.js-commando';
import {client} from '../../index';

Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();

export class GameCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: 'game',
			group: 'misc',
			memberName: 'game',
			description: 'Toggle a game tag.',
			details: 'Toggle a game tag.',
			examples: ['game game-pubg'],
			guildOnly: true,
			throttling: {
				usages: 1,
				duration: 10
			},

			args: [
				{
					key: 'tag',
					prompt: 'What game tag to add / remove?',
					type: 'string'
				}
			]
		});
	}

	async run(message, args) {
		if (!message || !message.member || !message.guild) {
			return
		}
		const currentRoles = message.member.roles;
		let newRoles = currentRoles;
		const role = message.guild.roles.find(elem => elem.name.toLowerCase().replace('game-', '') === args.tag.toLowerCase().replace('game-', ''));
		if (!role) {
			const validRoles = [];
			message.guild.roles.forEach(elem => {
				if (elem.name.startsWith('game-')) {
					validRoles.push(elem.name.replace('game-', ''));
				}
			});
			return message.reply(`Can't find role ${args.tag}\nValid Choices:\n${validRoles.join(', ')}`);
		}
		if (!role.name.toLowerCase().startsWith('game-')) {
			return message.reply('Cheeky.')
		}
		if (currentRoles.find(elem => elem.id === role.id)) {
			return newRoles.remove(role)
				.then(() => {
					console.log(`Removing ${role.name} from ${message.author.tag}`);
					console.log('Done.');
					return message.reply(`${role.name} removed from ${message.author.tag}`);
				})
				.catch(err => {
					console.error(err);
					Raven.captureException(err);
				})

		}
		return newRoles.add(role)
			.then(() => {
				console.log(`Giving ${role.name} to ${message.author.tag}`);
				console.log('Done.');
				return message.reply(`${role.name} added to ${message.author.tag}`);
			}).catch(err => {
				console.error(err);
				Raven.captureException(err);
			})
	}
}
