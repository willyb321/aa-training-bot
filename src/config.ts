/**
 * @module Utils
 */
/**
 * ignore
 */
export interface IConfig {
	allowedChannels: string[];
	allowedServers: string[];
	allowedUsers: string[];
	allowedRoles: string[];
	modChannel: string;
	pvpVideosID: string;
	adminRoleID: string;
	owners: string[];
	paradigmID: string;
	botRoleID: string;
	ravenDSN: string;
	token: string;
	muteMS: number;
	feedChannelId: string;
	redditFeedToken: string;
	allowedToSTFU: string[];
	stfuInterval: number;
	mongoURL: string;
	pollChannelID: string;
	councilID: string;
}

/**
 * Make config.json in root dir. Fill in based on IConfig
 */
export const config: IConfig = require('../config.json');
