export enum GameSend {
    PROTOCOL_LOGIN_INFORMATION = 1,
    EVENT_SEND_DESKSDATA = 'game_event_SendDesksdata',
    PROTOCOL_SEND_DESK_INFORMATION = 3,
    PROTOCOL_SEND_SIT = 3,
    /**
     * 決定按鈕 顯示
     * @constant
     */
    PROTOCOL_BUTTON_DISPLAY = 12,
    /**
     * 時間倒數
     * @constant
     */
    PROTOCOL_DESK_INFO = 1,
    /**
     * 私牌資訊
     * @constant
     */
    PROTOCOL_PRIVATE_POKERS = 6,
    /**
     * 玩家按鈕
     */
    PROTOCOL_PLAYER_BUTTON = 12,
    /**
     * 贏家資訊
     */
    PROTOCOL_WINNER_INFO = 4,
    /**
     * 每round 資訊
     */
    PROTOCOL_ROUND_INFO = 5,
    /**
     * 坐下後資訊
     */
    PROTOCOL_SELECT_SEAT = 8,
    /**
     * 入桌
     */
    PROTOCOL_INTO_ROOM = 7
}
