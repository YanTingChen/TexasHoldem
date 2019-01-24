
export class GameRedis {
	public static readonly HASH_DESKINFO = '{game:desk}:hash:desksinfo:';
	/**
	 * 記住每位玩家 每一round 結束金額
	 */
	public static readonly HASH_FRONT_BET = '{game:desk}:hash:frontBet:';
	public static readonly HASH_LOOK_PLAYER = '{game:desk}:hash:lookPlayer:';
	public static readonly LIST_PLAYER_SIT = '{game:desk}:list:playersit:';
	public static readonly LIST_PLAYING_PLAYER = '{game:desk}:list:playingPlayer:';
	public static readonly LIST_PLAYER_POINT = '{game:desk}:list:playerPoint:';
	public static readonly LIST_PUBLIC_POKER = '{game:desk}:list:publicPoker:';
	public static readonly LIST_PLAYER_ACTION = '{game:desk}:list:playerAction:';
	public static readonly LIST_ONLINE_PLAYER = '{game:desk}:list:onlinePlayer:';
	public static readonly LIST_ALLIN_BET = '{game:desk}:list:allinBet:';
	public static readonly LIST_PA_POOL = '{game:desk}:list:paPool:';
	public static readonly LIST_PORKER_POOL = '{game:desk}:list:porkerPool:';
	public static readonly LIST_COUNT_DOWNER = '{game:desk}:list:countDowner:';
	public static readonly LIST_PLAYER_BET_RECORD = '{game:desk}:list:playerBetRecord:';

	public static readonly HASH_PLAYERINFO = '{game:player}:hash:playerinfo:';
	public static readonly LIST_POKER = '{game:player}:list:poker:';
	public static readonly LIST_BUTTON = '{game:player}:list:Button:';
	public static readonly DESK_PLAYING = '{game:desk}:list:deskPlaying';
}
