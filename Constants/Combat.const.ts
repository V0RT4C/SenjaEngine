export enum FIGHT_MODE {
    OFFENSIVE                                   = 1,
    BALANCED                                    = 2,
    DEFENSE                                     = 3              
}

export enum CHASE_MODE {
    ON                                          = 1,
    OFF                                         = 0
}

export enum SAFE_FIGHT_MODE {
    ON                                          = 1,
    OFF                                         = 0
}

export enum SKULL {
	NONE                                        = 0,
	YELLOW                                      = 1,
	GREEN                                       = 2,
	WHITE                                       = 3,
	RED                                         = 4,
	BLACK                                       = 5,
	ORANGE                                      = 6,
}

export enum PARTY_SHIELD {
    SHIELD_NONE                                 = 0,
	SHIELD_WHITEYELLOW                          = 1,
	SHIELD_WHITEBLUE                            = 2,
	SHIELD_BLUE                                 = 3,
	SHIELD_YELLOW                               = 4,
	SHIELD_BLUE_SHAREDEXP                       = 5,
	SHIELD_YELLOW_SHAREDEXP                     = 6,
	SHIELD_BLUE_NOSHAREDEXP_BLINK               = 7,
	SHIELD_YELLOW_NOSHAREDEXP_BLINK             = 8,
	SHIELD_BLUE_NOSHAREDEXP                     = 9,
	SHIELD_YELLOW_NOSHAREDEXP                   = 10,
	SHIELD_GRAY                                 = 11,
}

export enum SKILL {
    FIST                                        = 0,
    CLUB,
    SWORD,
    AXE,
    DISTANCE,
    SHIELDING,
    FISHING
}