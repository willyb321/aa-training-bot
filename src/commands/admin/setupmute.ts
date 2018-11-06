/**
 * @module Commands
 */
/**
 * ignore
 */
import * as Commando from 'discord.js-commando';
import {GuildChannel} from "discord.js";


export class SetupMuteCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: 'setmute',
			group: 'misc',
			memberName: 'setmute',
			description: 'Set up a mute role and permissions.',
			details: 'Set up a mute role and permissions.',
			guildOnly: true,
			examples: ['mute @willyb321#2816 10']
		});
	}

	hasPermission(message) {
		return message.client.isOwner(message.author);
	}

	async run(message) {
		const muteRoleId = message.guild.settings.get('muteRole', '');
		let muteRole = message.guild.roles.get(muteRoleId);
		if (!muteRole) {
			try {
				muteRole = await message.guild.roles.create({
					data: {
						name: 'Muted',
						color: 'DARKER_GREY',
						mentionable: false
					}
				});
				await message.guild.settings.set('muteRole', muteRole.id);
			} catch (err) {
				console.error(err);
				return message.channel.send('Failed to setup mute role.');
			}
		}

		for (let chan of message.guild.channels.array()) {
			chan = chan as GuildChannel;
			if (chan) {
				if (chan.permissionOverwrites && chan.permissionOverwrites.get(muteRole.id)) {
					await chan.permissionOverwrites.get(muteRole.id).delete(`Mute role setup requested by ${message.author.tag}`);
				}
				try {
					await chan.createOverwrite(muteRole, {
						SEND_MESSAGES: false,
						SEND_TTS_MESSAGES: false,
						CHANGE_NICKNAME: false,
						ADD_REACTIONS: false,
						USE_EXTERNAL_EMOJIS: false,
						ATTACH_FILES: false,
						READ_MESSAGE_HISTORY: true
					}, `Mute role setup requested by ${message.author.tag}`);
				} catch (err) {
					console.error(err);
				}
			}
		}
		return message.channel.send(`Added mute role: ${muteRole.toString()}`);
	}
}
