/**
 * @module Admin
 */
/**
 * ignore
 */
import * as Datastore from 'nedb';
import * as Discord from 'discord.js';
import {client} from '../index';
import {config} from "../utils";
import * as mongoose from 'mongoose';
import * as nlp from 'compromise';
import * as later from 'later';
import * as Raven from "raven";
import * as autoIncrement from 'mongoose-auto-increment';
import _ = require("lodash");
import {match} from "minimatch";

Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();
export const announcements: later.Timer[] = [];

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

export function addSchedule(message: Discord.Message) {
	if (!message.member.roles.get(config.adminRoleID)) {
		return;
	}
	message.content = message.content.replace('!addschedule', '').trim();
	const doc = nlp(message.content);
	const matches = doc.sentences().out('array');
	if (matches.length < 2) {
		return;
	}
	if (matches.length > 3) {
		return;
	}
	matches[2] = (!matches[2] ? false : true);
	const parsedTime = later.parse.text(matches[0]);
	if (parsedTime.error !== -1) {
		message.channel.send(`Invalid expression. Position of error (from 0): ${parsedTime.error}`);
		return;
	}
	const scheduleDoc = new Schedule({
		timeExpression: matches[0],
		message: matches[1],
		channelId: message.channel.id,
		everyone: matches[2]
	});
	scheduleDoc.save()
		.then((elem) => {
			const annouce = later.setInterval(() => announce(matches[1], message.channel.id, matches[2]), parsedTime);
			announcements[elem._id] = annouce;
			message.channel.send(`:ok_hand: Done! Id: ${scheduleDoc._id}`);

		})
		.catch(err => {
			Raven.captureException(err);
		})
}

export function addAllAnnouncementsToMemory() {
	Schedule.find({}, (err, docs) => {
		if (err) {
			Raven.captureException(err);
		} else {
			docs.forEach((elem: ISchedule) => {
				const parsedTime = later.parse.text(elem.timeExpression);
				const annouce = later.setInterval(() => {announce(elem.message, elem.channelId, elem.everyone)}, parsedTime);
				announcements[elem._id] = annouce;
			});
		}
	})
}

function announce(message: string, channelId: string, everyone: boolean) {
	console.log('Announcing!');
	const channel: any = client.guilds.get(config.paradigmID).channels.get(channelId);
	channel.send(`${message.toString()}\n${everyone ? '@everyone' : ''}`);
}

export function removeSchedule(message: Discord.Message) {
	if (!message.member.roles.get(config.adminRoleID)) {
		return;
	}
	const doc = nlp(message.content.replace('!delschedule', '').trim());
	const matches = doc.words().out('array');
	console.log(matches);
	if (matches.length < 1) {
		return;
	}
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
				})
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
			})
	}
}

export function getSchedule(message: Discord.Message) {
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
				embed.addField(`ID: ${elem._id} - Time: ${elem.timeExpression}`, elem.message);
			});
			if (docs.length === 0) {
				embed.addField('Empty', 'No scheduled announcements')
			}
			embed.addField('Help with schedules', 'See https://willb.info/s/rJ7u4Xy4z');
			message.channel.send({embed});
		}
	})
}
