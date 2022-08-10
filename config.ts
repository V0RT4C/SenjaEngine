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
 * General game settings
 */

//Day/night settings
export const WORLD_DYNAMIC_LIGHT_ENABLED = true;
export const WORLD_TIME_AT_STARTUP = 360; // 6AM
export const WORLD_TIME_SPEED_INCREASE_X = 24;

export const LIGHT_LEVEL_DAY = 250;
export const LIGHT_LEVEL_NIGHT = 40;
export const SUNRISE_START = 360; // 6AM
export const SUNRISE_STOP = 540; // 9AM
export const SUNSET_START = 1020; // 5PM
export const SUNSET_END = 1140; // 7PM

//Creature base speed
export const BASE_SPEED = 220;

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

//Default player inventory items {itemId|null}

export const INVENTORY_SLOT_HELMET          = null;
export const INVENTORY_SLOT_AMULET          = null;
export const INVENTORY_SLOT_BACKPACK        = null;
export const INVENTORY_SLOT_ARMOR           = null;
export const INVENTORY_SLOT_SHIELD          = null;
export const INVENTORY_SLOT_WEAPON          = null;
export const INVENTORY_SLOT_LEGS            = null;
export const INVENTORY_SLOT_BOOTS           = null;
export const INVENTORY_SLOT_RING            = null;
export const INVENTORY_SLOT_AMMUNITION      = null;

