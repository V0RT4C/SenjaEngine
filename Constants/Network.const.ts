export enum NETWORK_MESSAGE_SIZES {
    BUFFER_MAXSIZE = 65536,
    MAX_STRING_LENGTH = 65536,
    MAX_HEADER_SIZE = 8
}

export enum PROTOCOL_SEND {
    FIRST_GAME                                          = 0x32, //Three zero Bytes
    LOGIN_OR_PENDING                                    = 0x0A, //playerId, serverbeat, canreportbugs
    GM_ACTIONS                                          = 0x0B, //Try to skip this one
    FULL_MAP                                            = 0x64,
    MAP_TOP_ROW                                         = 0x65,
    MAP_EAST_ROW                                        = 0x66,
    MAP_BOTTOM_ROW                                      = 0x67,
    MAP_WEST_ROW                                        = 0x68,
    MAP_ADD_THING                                       = 0x6A,
    MAP_UPDATE_THING                                    = 0x6B,
    REMOVE_THING_FROM_TILE                              = 0x6C,
    MOVE_CREATURE                                       = 0x6D,
    OPEN_CONTAINER                                      = 0x6E,
    CLOSE_CONTAINER                                     = 0x6F,
    ADD_TO_CONTAINER                                    = 0x70,
    DELETE_FROM_CONTAINER                               = 0x72,
    UPDATE_INVENTORY                                    = 0x78,
    DELETE_INVENTORY                                    = 0x79,
    WORLD_LIGHT                                         = 0x82,
    MAGIC_EFFECT                                        = 0x83,
    CREATURE_LIGHT                                      = 0x8D,
    CREATURE_SPEED                                      = 0x8F,
    CREATURE_OUTFIT                                     = 0x8E,
    PLAYER_DATA                                         = 0xA0,
    PLAYER_SKILLS                                       = 0xA1,
    PLAYER_MODES                                        = 0xA7,
    CREATURE_SPEAK                                      = 0xAA,
    PONG                                                = 0x1D, //Not a 7.4 version OP
    REQUEST_PING_BACK_OTCLIENT                          = 0x1E,
    TEXT_MESSAGE                                        = 0xB4,
    CANCEL_WALK                                         = 0xB5,
    WAIT_WALK                                           = 0xB6,
    FLOOR_CHANGE_UP                                     = 0xBE,
    FLOOR_CHANGE_DOWN                                   = 0xBF,
    EDIT_OUTFIT                                         = 0xC8
}

export enum PROTOCOL_RECEIVE {
    ENTER_GAME                                          = 0x0A,
    LEAVE_GAME                                          = 0x14,

    /**
     * MOVEMENT
     */

    MOUSE_CLICK_MOVE                                    = 0x64,
    MOVE_NORTH                                          = 0x65,
    MOVE_EAST                                           = 0x66,
    MOVE_SOUTH                                          = 0x67,
    MOVE_WEST                                           = 0x68,
    STOP_AUTO_WALK                                      = 0x69,
    MOVE_NORTH_EAST                                     = 0x6A,
    MOVE_SOUTH_EAST                                     = 0x6B,
    MOVE_SOUTH_WEST                                     = 0x6C,
    MOVE_NORTH_WEST                                     = 0x6D,
    TURN_NORTH                                          = 0x6F,
    TURN_EAST                                           = 0x70,
    TURN_SOUTH                                          = 0x71,
    TURN_WEST                                           = 0x72,

    /**
     * ITEM ACTIONS
     */

    MOVE_THING                                          = 0x78,
    USE_ITEM                                            = 0x82,
    USE_ITEM_ON                                         = 0x83,

    BATTLE_WINDOW                                       = 0x84,
    CLOSE_CONTAINER                                     = 0x87,
    LOOK_AT                                             = 0x8C,
    SPEAK                                               = 0x96,
    
    CANCEL_MOVE                                         = 0xBE,
    
    CHANGE_FIGHT_MODE                                   = 0xA0, //Attack & Follow modes
    ATTACK                                              = 0xA1,
    FOLLOW                                              = 0xA2,
    FORCE_QUIT                                          = 0x69,
    PING                                                = 0x1E,
    REQUEST_CHANGE_OUTFIT                               = 0xD2,
    REQUEST_SET_OUTFIT                                  = 0xD3
}

export enum PROTOCOL_LOGIN_RECEIVE {
    LOGIN                                   = 0x01
}

export enum PROTOCOL_LOGIN_SEND {
    ERROR                                   = 0x0A,
    MOTD                                    = 0x14,
    CHARACTER_LIST                          = 0x64
}

export enum SPEAK_TYPE {
    NONE                                    = 0,
    SAY                                     = 1,
    WHISPER                                 = 2,
    YELL                                    = 3,
    PRIVATE_FROM                            = 4,
    PRIVATE_TO                              = 4, //(quickfix) 5 in otclient (Havent figured out what Proto::translateMessageModeToServer(mode)) does yet
    MONSTER_YELL                            = 16,
    MONSTER_SPEAK                           = 17,
    MESSAGE_ADVANCE                         = 19,
    MESSAGE_DAMAGE_RECEIVED                 = 20,
    MESSAGE_LOGIN                           = 21,
    MESSAGE_QUEST_INFO                      = 22, //You have found ... etc...
    MESSAGE_INFO                            = 23, //Normal, eg "Sorry not possible"
    MESSAGE_ANIMATED_TEXT                   = 999
}

export enum SPEAK_CHANNEL {
    CHANNEL_Y                                           = 0x07,
    CHANNEL_O                                           = 0x08
}

export enum MESSAGE_TYPE {
    ORANGE_MESSAGE_CONSOLE                              = 0x11,
    RED_MESSAGE_SCREEN_CENTER_AND_CONSOLE               = 0x12,
    WHITE_MESSAGE_SCREEN_CENTER_AND_CONSOLE             = 0x13,
    WHITE_MESSAGE_SCREEN_BOTTOM_AND_CONSOLE             = 0x14,
    //Same as 0x14 WHITE_MESSAGE_SCREEN_BOTTOM                         = 0x15,
    GREEN_MESSAGE_SCREEN_CENTER_AND_CONSOLE             = 0x16,
    WHITE_MESSAGE_SCREEN_BOTTOM                         = 0x17,
    PURPLE_MESSAGE_CONSOLE                              = 0x18,
    RED_MESSAGE_CONSOLE                                 = 0x19
}
