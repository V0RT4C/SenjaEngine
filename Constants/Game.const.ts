export const GAME_BEAT_MS = 50;
export const GAME_TICKS_PER_MINUTE = (1000 / GAME_BEAT_MS) * 60;

export const MAX_LIGHT_LEVEL = 250;
export const MIN_LIGHT_LEVEL = 40;
export const ONE_DAY_IN_MINUTES = 1440;

export enum CREATURE_ID_RANGE {
    PLAYER_START_ID                       = 0x10000000,
    PLAYER_END_ID                         = 0x40000000,
    MONSTER_START_ID                      = 0x40000000,
    MONSTER_END_ID                        = 0x80000000,
    NPC_START_ID                          = 0x80000000,
    NPC_END_ID                            = 0xffffffff
}

export enum THING_ID {
    STATIC_TEXT                           = 0x60,
    UNKNOWN_CREATURE                      = 0x61,
    KNOWN_CREATURE                        = 0x62,
    CREATURE                              = 0x63
}

export enum THING_TYPE {
    ITEM                                = 0x01,
    MONSTER                             = 0x02,
    PLAYER                              = 0x03,
    NPC                                 = 0x04
}

export enum CREATURE_TYPE {
    CREATURE_TYPE_PLAYER                  = 0,
    CREATURE_TYPE_MONSTER,
    CREATURE_TYPE_NPC,
    CREATURE_TYPE_SUMMON_OWN,
    CREATURE_TYPE_SUMMON_OTHERS,
    CREATURE_TYPE_HIDDEN                  = 0xFF
}

export enum RETURN_MESSAGE {
    DESTINATION_OUT_OF_REACH         = 'Destination is out of reach.',
    OBJECT_NOT_MOVABLE  = 'You cannot move this object.',
    DROP_TWO_HANDED_FIRST = 'Drop the double-handed object first.',
    BOTH_HANDS_NEED_TO_BE_FREE = 'Both hands need to be free.',
    TOO_FAR_AWAY = 'You are too far away.',
    FIRST_GO_DOWN_STAIRS = 'First go downstairs.',
    FIRST_GO_UP_STAIRS = 'First go upstairs.',
    TOO_HEAVY = 'This object is too heavy for you to carry.',
    CONTAINER_IS_FULL = 'You cannot put more objects in this container.',
    NOT_ENOUGH_ROOM = 'There is not enough room.',
    THERE_IS_NO_WAY = 'There is no way.',
    CANNOT_ENTER_PZ = 'You can not enter a protection zone after attacking another player.',
    NOT_INVITED_IN_HOUSE = 'You are not invited.',
    DEPOT_IS_FULL = 'You cannot put more items in this depot.',
    CANNOT_USE_THIS_OBJECT = 'You cannot use this object.',
    PLAYER_WITH_NAME_NOT_ONLINE = 'A player with this name is not online.',
    NOT_REQUIRED_MLEVEL_TO_USE_RUNE = 'You do not have the required magic level to use this rune.',
    YOU_ARE_ALREADY_TRADING = 'You are already trading. Finish this trade first.',
    PLAYER_IS_ALREADY_TRADING = 'This player is already trading.',
    CANNOT_LOG_OUT_DURING_FIGHT = 'You may not logout during or immediately after a fight!',
    YOU_ARE_EXHAUSTED = 'You are exhausted.',
    NOT_PERMITTED_IN_PZ = 'This action is not permitted in a protection zone.',
    CANNOT_ATTACK_THIS_CREATURE = 'You may not attack this creature.',
    CANNOT_ATTACK_THIS_PERSON = 'You may not attack this person.',
    YOU_MUST_LEARN_SPELL_FIRST = 'You must learn this spell first.',
    CANNOT_LOGOUT_HERE = 'You can not logout here.',
    NOT_POSSIBLE = 'Sorry, not possible.'
}