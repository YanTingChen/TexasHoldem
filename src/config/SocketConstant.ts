
export class SocketConstant {
    public static readonly CONNECTION = 'connection';
    public static readonly DISCONNECT = 'disconnect';
    public static readonly ERROR = 'error';
    public static readonly ON_CHANNEL_OPEN = 'onChannelOpen';
    public static readonly ON_CHANNEL_CLOSE = 'onChannelClose';
    public static readonly ON_PUBLISH = 'onPublish';
    public static readonly JOIN = 'join';
    public static readonly LOBBY = 'lobby'; // 大廳訊息
    public static readonly LOBBY_ACCOUNT = 'lobby_account'; // 帳號相關
    public static readonly LOBBY_CLUB = 'lobby_club'; // 俱樂部相關
    public static readonly LOBBY_RECORD = 'lobby_record'; // 戰績相關
    public static readonly LOBBY_CHIP = 'lobby_chip'; // 籌碼相關
    // public static readonly LOBBY_EVENT = 'lobby_event';
	public static readonly LOBBY_TEXAS = 'lobby_texas_event'; // 進入遊戲相關
	public static readonly GAME_INTO_ROOM = 'gameIntoRoom';
    public static readonly GAME_SELECT_SEAT = 'gameSelectSeat';
    public static readonly GAME_BUTTON_FOLD = 'gameButtonFold';
    public static readonly GAME_BUTTON_CALL = 'gameButtonCall';
    public static readonly GAME_BUTTON_CHECK = 'gameButtonCheck';
    public static readonly GAME_BUTTON_RAISE = 'gameButtonRaise';
    public static readonly GAME_BUTTON_ALLIN = 'gameButtonAllin';
    public static readonly GAME_START = 'gameStart';
    public static readonly GAME_BUTTON_MENU = 'gameButtonMenu';
    public static readonly GAME_ADD_POINT = 'gameAddPoint';
}
