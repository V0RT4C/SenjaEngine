export enum PLAYER_GROUP {
    REGULAR_PLAYER                  = 10,
    TUTOR                           = 20,
    GAMEMASTER                      = 30,
    GOD                             = 40
}

export enum PLAYER_VOCATION {
    NO_VOCATION                     = 10,
    KNIGHT                          = 20,
    PALADIN                         = 30,
    SORCERER                        = 40,
    DRUID                           = 50
}

export enum PLAYER_SEX {
    MALE                            = 1,
    FEMALE                          = 2
}

export enum DEFAULT_LOOK {
    LOOK_TYPE                       = 128,
    LOOK_HEAD                       = 78,
    LOOK_BODY                       = 106,
    LOOK_LEGS                       = 58,
    LOOK_FEET                       = 95
}

export enum PLAYER_SKULL {
    NONE = 0,
    YELLOW,
    GREEN,
    WHITE,
    RED,
    BLACK,
    ORANGE
}

export enum PLAYER_BLESSING {
    NONE                            = 0,
    ADVENTURER                      = 1,
    SPIRITUAL_SHIELDING             = 1 << 1,
    EMBRACE_OF_TIBIA                = 1 << 2,
    FIRE_OF_SUNS                    = 1 << 3,
    WISDOM_OF_SOLITUDE              = 1 << 4,
    SPARK_OF_PHOENIX                = 1 << 5
}


export enum INVENTORY_SLOT {
    UNKNOWN                         = 0,
    HELMET,
    AMULET,
    BACKPACK,
    ARMOR,
    SHIELD,
    WEAPON,
    LEGS,
    BOOTS,
    RING,
    AMMUNITION
}