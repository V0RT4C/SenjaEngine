/**
 * Development mode
 * (Creates default account & characters for login etc...)
 */

import { PLAYER_SEX } from "./Constants/Player.const.ts";

export const DEVELOPMENT_MODE = true;
export const WELCOME_MESSAGE = 'Welcome to Senja Engine V.0.0.2\nYour last visit was: never';

/**
 * Log level
 * {DEBUG|INFO|WARNING|ERROR}
 */

export const LOG_LEVEL = 'DEBUG';

/**
 *  Allowed client versions
 */

export const CLIENT_VERSION_MIN = 760;
export const CLIENT_VERSION_MAX = 760;

/**
 * Network & Server settings
 */

export const TCP_LOGINSERVER_HOST = '0.0.0.0';
export const TCP_LOGINSERVER_PORT = 7171;

export const TCP_GAMESERVER_HOST = '0.0.0.0';
export const TCP_GAMESERVER_PORT = 7373;


/**
 * Player settings
 */

//Default sex
export const DEFAULT_PLAYER_SEX = PLAYER_SEX.MALE;

//Default Spawn position
export const DEFAULT_PLAYER_SPAWN_POSITION_X = 1039;
export const DEFAULT_PLAYER_SPAWN_POSITION_Y = 1041;
export const DEFAULT_PLAYER_SPAWN_POSITION_Z = 7;

//Default Outfit
export const DEFAULT_LOOKTYPE = 128;
export const DEFAULT_LOOKHEAD = 78;
export const DEFAULT_LOOKBODY = 87;
export const DEFAULT_LOOKLEGS = 58;
export const DEFAULT_LOOKFEET = 76;


export const BASE_SPEED = 220;