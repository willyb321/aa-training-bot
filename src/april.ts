import * as Discord from 'discord.js';
import * as Raven from 'raven';
import {config} from './utils';
import {scheduleJob} from 'node-schedule';
import {client} from './index';
import {join} from "path";

Raven.config(config.ravenDSN, {
	autoBreadcrumbs: true
}).install();
const nameData = require(join(__dirname, '..', 'nicknames.json'));
const startDate = new Date('2018-04-01');
const endDate = new Date('2018-04-02');

const start = scheduleJob(startDate, () => {
	console.log('WILLY B JAM FOOLED??');
	setAllNicksOnServer();
});
const job = scheduleJob(endDate, () => {
	console.log('WILLY B JAM FOOLED??');
	setAllNicksOnServer(true);
});
export function setAllNicksOnServer(changeBack?: boolean) {
	const guild = client.guilds.get(config.paradigmID) as Discord.Guild;
	if (!guild || !guild.available) {
		return;
	}
	const roleAddDate: Discord.RoleData = {
		name: 'Not Jamfooled',
		color: 'LUMINOUS_VIVID_PINK',
		mentionable: true
	};
	let role;
	role = guild.roles.find('name', 'Not Jamfooled');
	if (!role) {
		guild.roles.create({data: roleAddDate, reason: 'JAMFOOLS'})
			.then(newrole => {
				role = newrole;
			})
			.catch(err => {
				console.error(err);
				Raven.captureException(err);
			});
	}

	guild.members.forEach(async member => {
		try {
			if (!changeBack) {
				await member.setNickname('WILLY B JAM FOOLED?');
			} else {
				const name = nameData.find(elem => elem.id === member.id);
				if (name && name.name) {
					await member.setNickname(name.name);
				}
			}
		} catch (err) {
			if (err.message === 'Privilege is too low...') {
				await member.roles.add(role)
			} else {
				console.error(err);
				Raven.captureException(err);
			}
		}
	});
}

export async function onTryToChangeBack(oldMember: Discord.GuildMember, newMember: Discord.GuildMember) {
	if (oldMember.nickname === newMember.nickname || newMember.nickname === 'WILLY B JAM FOOLED?') {
		return;
	}
	const name = nameData.find(elem => elem.id === newMember.id);
	if (name && name.name === newMember.nickname) {
		return;
	}
	try {
		await newMember.setNickname('WILLY B JAM FOOLED?');
	} catch (err) {
		console.error(err);
		Raven.captureException(err);
	}
}
