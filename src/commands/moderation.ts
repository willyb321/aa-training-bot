/**
 * @module Commands
 */
/**
 * ignore
 */
import * as Discord from 'discord.js';
import * as _ from 'lodash';
import {client} from '../index';
import {currentStatus} from "../utils";

const modChannel = '382662529349976066';
const guild = '374103486154932234';

export function modReport(message: Discord.Message) {
	const moderatorReports: any = client.guilds.get(guild).channels.get(modChannel);
	if (currentStatus.currentDms[message.author.id] && message.createdTimestamp - currentStatus.currentDms[message.author.id].createdTimestamp < 60000) {
		message.reply(`Not sent. No spam thx.`);
		return;
	}
	message.react('📧');
	moderatorReports.send(`${message.author.tag}: \`\`\`${message.content.toString()}\`\`\``)
}

export function noSpamPls(message: Discord.Message) {

}
