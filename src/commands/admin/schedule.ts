/**
 * @module Admin
 */
/**
 * ignore
 */
import * as Discord from 'discord.js';
import {client} from '../../index';
import {config} from '../../utils';
import * as mongoose from 'mongoose';
import * as later from 'later';
import * as Raven from 'raven';
import * as autoIncrement from 'mongoose-auto-increment';

Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();
export const announcements = [];

mongoose.connect(config.mongoURL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Mongo connected!');
});
autoIncrement.initialize(db);

const scheduleSchema = new mongoose.Schema({
	timeExpression: String,
	message: String,
	channelId: String,
	everyone: Boolean
});

export interface ISchedule extends mongoose.Document {
	timeExpression: string;
	message: string;
	channelId: string;
	everyone: boolean;
}

scheduleSchema.plugin(autoIncrement.plugin, 'Schedule');
const Schedule = mongoose.model('Schedule', scheduleSchema);

export function addAllAnnouncementsToMemory() {
	Schedule.find({}, (err, docs) => {
		if (err) {
			Raven.captureException(err);
		} else {
			docs.forEach((elem: ISchedule) => {
				const parsedTime = later.parse.text(elem.timeExpression);
				const annouce = later.setInterval(() => {announce(elem.message, elem.channelId, elem.everyone);}, parsedTime);
				announcements[elem._id] = annouce;
			});
		}
	});
}

function announce(message: string, channelId: string, everyone: boolean) {
	console.log('Announcing!');
	const channel = client.guilds.get(config.paradigmID).channels.get(channelId);
	channel.send(`${message.toString()}\n${everyone ? '@everyone' : ''}`);
}

import * as Commando from 'discord.js-commando';

export class AddScheduleCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: 'addschedule',
			group: 'admin',
			memberName: 'addschedule',
			description: 'Add a message to schedule.',
			details: 'Add a message to schedule.',
			examples: ['addschedule \'at 8:00 am on saturday\' \'true\' \'first training session of the day starts now\''],
			argsSingleQuotes: true,
			args: [
				{
					key: 'time',
					prompt: 'Schedule?',
					type: 'string'
				},
				{
					key: 'everyone',
					prompt: 'At everyone?',
					type: 'boolean'
				},
				{
					key: 'channel',
					prompt: 'Channel (use #)?',
					type: 'channel'
				},
				{
					key: 'message',
					prompt: 'Message?',
					type: 'string',
					infinite: true
				}
			]
		});
	}

	async run(message, args) {
		if (!message.member.roles.get(config.adminRoleID)) {
			return;
		}
		const parsedTime = later.parse.text(args.time);
		if (parsedTime.error !== -1) {
			message.channel.send(`Invalid expression. Position of error (from 0): ${parsedTime.error}`);
			return;
		}
		const scheduleDoc = new Schedule({
			timeExpression: args.time,
			message: args.message.join(' '),
			channelId: args.channel.id,
			everyone: args.everyone
		});
		scheduleDoc.save()
			.then( elem => {
				const annouce = later.setInterval(() => announce(args.message, args.channel.id, args.everyone), parsedTime);
				announcements[elem._id] = annouce;
				message.channel.send(`:ok_hand: Done! Id: ${scheduleDoc._id}`);

			})
			.catch(err => {
				Raven.captureException(err);
			});
	}
}
export class DelScheduleCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: 'delschedule',
			group: 'admin',
			memberName: 'delschedule',
			description: 'Remove from schedule.',
			details: 'Remove from schedule.',
			examples: ['delschedule 1'],
			argsSingleQuotes: true,
			args: [
				{
					key: 'id',
					prompt: 'Schedule?',
					type: 'integer',
					infinite: true,
					validate: elem => parseInt(elem) >= 0
				}
			]
		});
	}

	async run(message, args) {
		if (!message.member.roles.get(config.adminRoleID)) {
			return;
		}
		const matches = args.id;
		if (matches.length > 1) {
			for (const i of matches) {
				Schedule.findOneAndRemove({_id: i})
					.then(() => {
						if (announcements[i] && announcements[i].clear) {
							announcements[i].clear();
						}
						announcements.splice(i, 1);
						message.channel.send(`:ok_hand: Done! Id: ${i}`);
					})
					.catch(err => {
						Raven.captureException(err);
					});
			}
		} else {
			Schedule.findOneAndRemove({_id: matches[0]})
				.then(() => {
					if (announcements[matches[0]] && announcements[matches[0]].clear) {
						announcements[matches[0]].clear();
					}
					announcements.splice(matches[0], 1);
					message.channel.send(`:ok_hand: Done! Deleted id #${matches[0]}`);
				})
				.catch(err => {
					Raven.captureException(err);
				});
		}
	}
}

export class GetScheduleCommand extends Commando.Command {
	constructor(client) {
		super(client, {
			name: 'sched',
			group: 'admin',
			memberName: 'sched',
			description: 'Get schedule.',
			details: 'Get schedule.',
			examples: ['sched']
		});
	}

	async run(message, args) {
		if (!message.member.roles.get(config.adminRoleID)) {
			return;
		}
		Schedule.find({}, (err, docs) => {
			if (err) {
				Raven.captureException(err);
			} else {
				const embed = new Discord.RichEmbed();
				embed
					.setTitle('Ainsley Schedule')
					.setAuthor('Ainsley', 'https://willb.info/i/face45a7d6378b600bda26bf69e531d7')
					.setDescription('Announcement schedule: ')
					.setFooter('By Willyb321', 'https://willb.info/i/22f73495510de53cb95cba9615549bc9')
					.setTimestamp();
				docs.forEach((elem: any) => {
					embed.addField(`ID: ${elem._id} - Time: ${elem.timeExpression}`, `Channel: <#${elem.channelId}> - ${elem.message}`);
				});
				if (docs.length === 0) {
					embed.addField('Empty', 'No scheduled announcements');
				}
				embed.addField('Help with schedules', 'See https://willb.info/s/rJ7u4Xy4z');
				return message.channel.send({embed});
			}
		});
	}
}
