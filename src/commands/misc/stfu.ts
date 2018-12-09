/**
 * @module Commands
 */
/**
 * ignore
 */
import {stfuInit, client} from '../../index';
import {join} from 'path';
import {currentStatus, config, stfu} from '../../utils';
import * as Raven from 'raven';

Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();



import * as Commando from 'discord.js-commando';

export class StfuCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: 'stfu',
			group: 'misc',
			memberName: 'stfu',
			description: 'Tell a user to STFU.',
			details: 'Tell a user to STFU.',
			examples: ['stfu @Scorpius#2025'],
			throttling: {
				usages: 1,
				duration: 90
			},
			args: [
				{
					key: 'user',
					prompt: 'Who?',
					type: 'member'
				}
			]
		});
	}
	hasPermission(message) {
		if (!!message.member.roles.find(elem => config.allowedToSTFU.includes(elem.id))) {
			return true
		}
		return !!message.member && !!message.member.roles.find(elem => config.allowedRoles.includes(elem.id))
	}
	async run(message, args) {
		const user = args.user;
		if (currentStatus.inVoice) {
			return;
		}
		if (!user) {
			return;
		}
		if (message.member.roles.find(elem => config.allowedRoles.includes(elem.id)) && user.voice.channel) {
			console.log('Doing it!');
			stfuInit(user, user);
			return;
		}
		if (!user.voice.channel && message.member.roles.find(elem => config.allowedRoles.includes(elem.id))) {
			return message.channel.send(`STFU ${user.toString()}!`);
		}
	}
}

export class MeatCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: 'rub',
			group: 'misc',
			memberName: 'rub',
			description: 'Give your meat a good rub.',
			details: 'Give your meat a good rub.',
			examples: ['rub @Scorpius#2025'],

			args: [
				{
					key: 'user',
					prompt: 'Who?',
					type: 'member'
				}
			]
		});
	}

	hasPermission(message) {
		if (!!message.member.roles.find(elem => config.allowedToSTFU.includes(elem.id))) {
			return true;
		}
		return !!message.member && !!message.member.roles.find(elem => config.allowedRoles.includes(elem.id));
	}

	async run(message, args) {
		if (client.voiceConnections.first()) {
			return;
		}
		if (!message) {
			return;
		}
		const newUser = args.user;
		if (!newUser) {
			return;
		}
		const now = Math.floor(Date.now());
		if (currentStatus.lastStfu && now - currentStatus.lastStfu <= config.stfuInterval) {
			console.log(`Its only been: ${currentStatus.lastStfu - now} since last stfu.`);
			console.log('Not STFUing.');
			return;
		}
		if (!newUser.voice.channel && message.member.roles.find(elem => config.allowedRoles.includes(elem.id))) {
			return;
		}
		if (currentStatus.inVoice) {
			return;
		}
		if (message.member.roles.find(elem => config.allowedRoles.includes(elem.id)) && newUser.voice.channel) {
			console.log('Doing it!');
			currentStatus.lastStfu = Math.floor(Date.now());
			currentStatus.inVoice = true;
			return newUser.voice.channel.join()
				.then(voice => {
					const voiceDis = voice.play(join(__dirname, '..', '..', '..', 'meat.mp3'), {
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
				});
		}
	}
}
