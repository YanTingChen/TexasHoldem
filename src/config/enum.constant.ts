export enum Constant {
    // Status
    /**
     * Inactive
     * @constant
     */
    STATUS_INACTIVE = 0,
    /**
     * Active
     * @constant
     */
    STATUS_ACTIVE = 1,
    /**
     * Fail
     * @constant
     */
    STATUS_FAIL = 0,
    /**
     * Success
     * @constant
     */
    STATUS_SUCCESS = 1,

    // MemberStatus
    /**
     * Freezen
     * @constant
     */
    MEMBER_STATUS_FREZZEN = 0,
    /**
     * Active
     * @constant
     */
    MEMBER_STATUS_ACTIVE = 1,
    /**
     * Abandon
     * @constant
     */
    MEMBER_STATUS_ABANDON = 2,

    // MemberBehavior
    /**
     * Freezen
     * @constant
     */
    MEMBER_BEHAVIOR_FREZZEN = 0,
    /**
     * Active
     * @constant
     */
    MEMBER_BEHAVIOR_ACTIVE = 1,
    /**
     * Abandon
     * @constant
     */
    MEMBER_BEHAVIOR_ABANDON = 2,
    /**
     * Unabandon
     * @constant
     */
    MEMBER_BEHAVIOR_UNABANDON = 3,
    /**
     * Enabled
     * @constant
     */
    ENABLED = 1,

    // BlockType
    /**
     * Birthday
     * @constant
     */
    BIRTHDAY = 0,
    /**
     * No Play
     * @constant
     */
    BLOCK_TYPE_NO_PLAY = 1,
    /**
     * No Bonus
     * @constant
     */
    BLOCK_TYPE_NO_BONUS = 2,
    /**
     * No Offer Meal
     * @constant
     */
    BLOCK_TYPE_NO_OFFER_MEAL = 3,
    /**
     * No Bingo Promotion
     * @constant
     */
    BLOCK_TYPE_NO_BINGO_PROMOTION = 4,
    /**
     * No Bingo Promotion
     * @constant
     */
    BLOCK_TYPE_NO_BONU_BY_SYSTEM = 5,

    // msConfig
    /**
     * Max Password Failed Times
     * @constant
     */
    MS_CONFIG_MAX_PASSWORD_FAILED_TIMES = 'MaxPasswordFailedTimes',
    /**
     * Max Avail Card Num
     * @constant
     */
    MS_CONFIG_MAX_AVAIL_CARD_NUM = 'MaxAvailCardNum',
    /**
     * Member Workstation Login Failed Times
     * @constant
     */
    MS_CONFIG_MEMBER_WORKSTATION_LOGIN_FAILED_TIMES = 'Member Workstation.Login.Failed.Times',
    /**
     * Number New Member Promotion
     * @constant
     */
    MS_CONFIG_PARAMETER_NUMBER_NEW_MEMBER_PROMOTION = 'Number.New.Member.Promotion',
    /**
     * Supervisor Password Available Days
     * @constant
     */
    MS_CONFIG_SUPERVISOR_PASSWORD_AVAILABLE_DAYS = 'Supervisor.Password.Available.Days',
    /**
     * Operator Password Expired Update
     * @constant
     */
    MS_CONFIG_OPERATOR_PASSWORD_EXPIRED_UPDATE = 'Operator.Password.Expired.Update',
    /**
     * Auto Generate
     * @constant
     */
    OPERATOR_PASSWORD_EXPIRED_AUTO_GENERATE = 1,
    /**
     * Loyalty Credit Expire Days
     * @constant
     */
    MS_CONFIG_LOYALTY_CREDIT_EXPIRE_DAYS = 'Loyalty_Credit_Expire_Days',
    /**
     * Reward Point Expire Days
     * @constant
     */
    MS_CONFIG_REWARD_POINT_EXPIRE_DAYS = 'Reward_Point_Expire_Days',
    /**
     * Supervisior Password MinDigits
     * @constant
     */
    MS_CONFIG_SUPERVISOR_PASSWORD_MINDIGITS = 'Supervisior.Password.MinDigits',

    // Jackpot type
    /**
     * System
     * @constant
     */
    JACKPOT_SYSTEM = 0,
    /**
     * Horse Racing
     * @constant
     */
    JACKPOT_HORSE_RACING = 1,

    // BonusType
    /**
     * Reward Point
     * @constant
     */
    REWARD_POINT = 0,
    /**
     * Loyalty Credit
     * @constant
     */
    LOYALTY_CREDIT = 1,
    /**
     * Bonus
     * @constant
     */
    BONUS = 2,
    /**
     * Bingo Coupon
     * @constant
     */
    BINGO_COUPON = 3,
    /**
     * Table Reward Point
     * @constant
     */
    TABLE_REWARD_POINT = 4,

    // Place
    /**
     * Workstation
     * @constant
     */
    WORKSTATION = 0,
    /**
     * EGM
     * @constant
     */
    EGM = 1,

    // LotteryType
    /**
     * Red
     * @constant
     */
    LOTTERY_TYPE_RED = 1,
    /**
     * Yellow
     * @constant
     */
    LOTTERY_TYPE_YELLOW = 2,

    // Bet Coupon Txn List Behavior
    /**
     * Add
     * @constant
     */
    BET_COUPON_TXN_LIST_BEHAVIOR_ADD = 1,
    /**
     * Sub
     * @constant
     */
    BET_COUPON_TXN_LIST_BEHAVIOR_SUB = 2,

    // Bet Coupon Txn List status
    /**
     * Gain
     * @constant
     */
    BET_COUPON_TXN_LIST_STATUS_GAIN = 0,
    /**
     * Redeem
     * @constant
     */
    BET_COUPON_TXN_LIST_STATUS_REDEEM = 1,
    /**
     * Void
     * @constant
     */
    BET_COUPON_TXN_LIST_STATUS_VOID = 2,
    /**
     * Expire
     * @constant
     */
    BET_COUPON_TXN_LIST_STATUS_EXPIRE = 3,

    // Behavior
    /**
     * Add
     * @constant
     */
    BEHAVIOR_ADD = 1,
    /**
     * Sub
     * @constant
     */
    BEHAVIOR_SUB = 2,
    /**
     * Void
     * @constant
     */
    BEHAVIOR_VOID = 2,
    /**
     * Exchange Gift
     * @constant
     */
    BEHAVIOR_EXCHANGE_GIFT = 3,

    // msOperator Type
    /**
     * Member Info
     * @constant
     */
    MS_OPERATOR_TYPE_MEMBER_INFO = 1,
    /**
     * Member Bouns
     * @constant
     */
    MS_OPERATOR_TYPE_MEMBER_BOUNS = 2,
    /**
     * Lottery
     * @constant
     */
    MS_OPERATOR_TYPE_LOTTERY = 3,
    /**
     * Promotion
     * @constant
     */
    MS_OPERATOR_TYPE_PROMOTION = 4,
    /**
     * Nine Card
     * @constant
     */
    MS_OPERATOR_TYPE_NINE_CARD = 5,
    /**
     * Maintenance
     * @constant
     */
    MS_OPERATOR_TYPE_MAINTENANCE = 6,
    /**
     * Login Log
     * @constant
     */
    MS_OPERATOR_TYPE_LOGIN_LOG = 7,
    /**
     * DT Promotion
     * @constant
     */
    MS_OPERATOR_TYPE_DT_PROMOTION = 8,
    /**
     * Incidental
     * @constant
     */
    MS_OPERATOR_TYPE_INCIDENTAL = 9,

    // msModifyHisoryLog - Log Type
    /**
     * Add
     * @constant
     */
    MS_MODIFY_HISORY_LOG_TYPE_ADD = 1,
    /**
     * Modify
     * @constant
     */
    MS_MODIFY_HISORY_LOG_TYPE_MODIFY = 2,

    // msSession
    /**
     * Status - Close
     * @constant
     */
    MS_SESSION_STATUS_CLOSE = 0,
    /**
     * Status - Open
     * @constant
     */
    MS_SESSION_STATUS_OPEN = 1,
    /**
     * Export - Close
     * @constant
     */
    MS_SESSION_EXPORT_CLOSE = 1,
    /**
     * Export - Open
     * @constant
     */
    MS_SESSION_EXPORT_OPEN = 0,
    /**
     * Finish Time Default
     * @constant
     */
    MS_SESSION_FINISH_TIME_DEFAULT = '1899-12-30 00:00:00.000',

    // msSessionTransList
    /**
     * Behavior - Close
     * @constant
     */
    MS_SESSION_TRANS_LIST_BEHAVIOR_CLOSE = 0,
    /**
     * Behavior - Open
     * @constant
     */
    MS_SESSION_TRANS_LIST_BEHAVIOR_OPEN = 1,

    // Memo Log String
    /**
     * Active
     * @constant
     */
    ACTIVE_STRING = 'Active',
    /**
     * Inactive
     * @constant
     */
    INACTIVE_STRING = 'Inactive',
    /**
     * Add
     * @constant
     */
    ADD_STRING = 'Add',
    /**
     * Modify
     * @constant
     */
    MODIFY_STRING = 'Modify',
    /**
     * Yes
     * @constant
     */
    YES_STRING = 'Yes',
    /**
     * No
     * @constant
     */
    NO_STRING = 'No',
    /**
     * None
     * @constant
     */
    NONE_STRING = 'None',
    /**
     * Success
     * @constant
     */
    SUCCESS_STRING = 'Success',
    /**
     * Failure
     * @constant
     */
    FAILURE_STRING = 'Failure',
    /**
     * Changed
     * @constant
     */
    CHANGED_STRING = 'Changed',
    /**
     * Unchanged
     * @constant
     */
    UNCHANGED_STRING = 'Unchanged',
    /**
     * Red
     * @constant
     */
    RED_STRING = 'Red',
    /**
     * Yellow
     * @constant
     */
    YELLOW_STRING = 'Yellow',
    /**
     * Format DB DateTime
     * @constant
     */
    DB_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS',
    /**
     * Format DateTime
     * @constant
     */
    DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss',
    /**
     * Format DateTime
     * @constant
     */
    DATE_ONLY_FORMAT = 'YYYY-MM-DD',
    /**
     * Format DateTime
     * @constant
     */
    TIME_ONLY_FORMAT = 'HH:mm:ss',
    /**
     * Format PDF DateTime
     * @constant
     */
    PDF_HOURS_TIME_FORMAT = 'YYYY-MM-DD-HH',
    /**
     * Format PDF NowHorrsDateTime
     * @constant
     */
    PDF_NOW_HOURS_TIME_FORMAT = 'HH',
    /**
     * Unix Millisecond Timestamp
     * @constant
     */
    PDF_TIME_FORMAT = 'x',
    /**
     * Format Birthday Time
     * @constant
     */
    BIRTHDAY_TIME_FORMAT = 'YYYY-MM-DD',
    /**
     * 設定回傳直接是圖片
     * @constant
     */
    MEMBER_PROMOTION_DIVISOR = 1000,
    IMAGE = 'image/png',
    PDF = 'application/pdf',
    MEMBER_CARD_SERIAL_FORMAT_LONG = ';\\d+[:|;](\\d{13})[0-9,:,;,<,=,>,.][\\?|\\/]',
    MEMBER_CARD_SERIAL_FORMAT_SHORT = ';(\\d{12})\\d[\\?|\\/]',
    EMPLOYEE_CARD_SERIAL_FORMAT = ';7980(\\d{8})\\d[\\?|\\/]',
    DB_PASSWORD_KEY = 'J2U0M0B9O0C7M0S1',
    AES_128_ECB_KEY = 'J2U0M0B9O0C7M0S1',
    AES_CLEAR_ENCODING = 'utf8',
    AES_CIPHER_ENCODING = 'hex',
    AES_CIPHER = 'aes-128-ecb',
    AES_CIPHER_IV = '',
    OPCARD_MAGIC_NUMBER = 1397,
    OPCARD_MAGIC_PAIR_NUMBER = 53,
    OPCARD_PRINTER_HEAD = '~2,BPI75,MPC5,COEH,;',
    OPCARD_PRINTER_HEAD_EMPTY = ';',
    OPCARD_LONG_PRINTER_MAGICSTRING1 = '00',
    OPCARD_LONG_PRINTER_MAGICSTRING2 = ':',
    OPCARD_PRINTER_AFTER9END = '?',
    OPCARD_PRINTER_SHORTEND = '?',
    OPCARD_PRINTER_BE10END = ':?',
    OPCARD_PRINTER_BE11END = ';?',
    OPCARD_PRINTER_BE12END = '<?',
    OPCARD_PRINTER_BE13END = '=?',
    OPCARD_PRINTER_BE14END = '>?',
    OPCARD_PRINTER_BE15END = 'A?',

    // tslint:disable-next-line:max-line-length
    NO_IMAGE = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',

    // ConfigParameter
    /**
     * Period.Account.StartTime
     * @constant
     */
    CONFIG_PARAMETER_PERIOD_ACCOUNT_STARTTIME = 'Period.Account.StartTime',
    /**
     * Bank.Account.Time
     * @constant
     */
    CONFIG_PARAMETER_BANK_ACCOUNT_TIME = 'Bank.Account.Time',
    /**
     * Buffer.Minute
     * @constant
     */
    CONFIG_PARAMETER_BUFFER_MINUTE = 'Buffer.Minute',

    /**
     * CONFIG_KIOSK_TICKET_TITLE
     * @constant
     */
    CONFIG_KIOSK_TICKET_TITLE = 'KIOSK_TICKET_TITLE',
    /**
     * CONFIG_TKT_LOCATION
     * @constant
     */
    CONFIG_TKT_LOCATION = 'TKT_LOCATION',
    /**
     * Mantissa.Unit
     * @constant
     */
    CONFIG_PARAMETER_MANTISSA_UNIT = 41,

    // Period Type
    /**
     * Original
     * @constant
     */
    PERIOD_TYPE_ORIGINAL = 1,
    /**
     * New
     * @constant
     */
    PERIOD_TYPE_NEW = 2,

    // Period Type Area
    /**
     * One
     * @constant
     */
    PERIOD_TYPE_AREA_ONE = 1,
    /**
     * Two
     * @constant
     */
    PERIOD_TYPE_AREA_TWO = 2,

    // msSection LimitBonusIndividually
    /**
     * Universe
     * @constant
     */
    MS_SECTION_LIMIT_BONUS_INDIVIDUALLY_UNIVERSE = 0,

    /**
     * One
     * @constant
     */
    MS_SECTION_LIMIT_BONUS_INDIVIDUALLY_SINGLE = 1,

    // Promotion Type
    /**
     * Loyalty Credit
     * @constant
     */
    PROMOTION_TYPE_LOYALTY_CREDIT = 1,
    /**
     * Lucky Money
     * @constant
     */
    PROMOTION_TYPE_LUCKY_MONEY = 2,
    /**
     * Limit Promotion Credit
     * @constant
     */
    PROMOTION_TYPE_LIMIT_PROMOTION_CREDIT = 3,
    /**
     * Food Point
     * @constant
     */
    PROMOTION_TYPE_FOOD_POINT = 4,

    // msConfigPrivilegeParameter
    /**
     * Lottery Setting
     * @constant
     */
    PRIVILEGE_LOTTERY_SETTING = 'Lottery Setting',
    /**
     * Update Member Bet Coupon
     * @constant
     */
    PRIVILEGE_UPDATE_MEMBER_BET_COUPON = 'Update Member Bet Coupon',
    /**
     * MODIFY_MEMBER_PASSWORD
     * @constant
     */
    PRIVILEGE_MODIFY_MEMBER_PASSWORD = 'Modify Member Password',
    /**
     * DISABLE_PRIVILEGE_CHECK_AFTER_EDITING_PATRON_INFO
     * @constant
     */
    PRIVILEGE_DISABLE_PRIVILEGE_CHECK_AFTER_EDITING_PATRON_INFO = 'Disable Privilege Check After Editing Patron Info',
    /**
     * Password Security
     * @constant
     */
    PRIVILEGE_PASSWORD_SECURITY = 'Password Security',
    /**
     * TICKET_PURCHASE_AMOUNT1
     * @constant
     */
    TICKET_PURCHASE_AMOUNT1 = 15,
    /**
     * TICKET_PURCHASE_AMOUNT2
     * @constant
     */
    TICKET_PURCHASE_AMOUNT2 = 16,
    /**
     * TICKET_PURCHASE_AMOUNT3
     * @constant
     */
    TICKET_PURCHASE_AMOUNT3 = 17,
    /**
     * TICKET_PURCHASE_AMOUNT4
     * @constant
     */
    TICKET_PURCHASE_AMOUNT4 = 18,
    /**
     * TICKET_PURCHASE_AMOUNT5
     * @constant
     */
    TICKET_PURCHASE_AMOUNT5 = 19,
    /**
     * TICKET_PURCHASE_AMOUNT6
     * @constant
     */
    TICKET_PURCHASE_AMOUNT6 = 68,
    /**
     * CASHLESS_AMOUNT1
     * @constant
     */
    CASHLESS_AMOUNT1 = 36,
    /**
     * CASHLESS_AMOUNT2
     * @constant
     */
    CASHLESS_AMOUNT2 = 37,
    /**
     * CASHLESS_AMOUNT3
     * @constant
     */
    CASHLESS_AMOUNT3 = 38,
    /**
     * CASHLESS_AMOUNT4
     * @constant
     */
    CASHLESS_AMOUNT4 = 39,
    /**
     * CASHLESS_AMOUNT5
     * @constant
     */
    CASHLESS_AMOUNT5 = 40,
    /**
     * CASHLESS_AMOUNT6
     * @constant
     */
    CASHLESS_AMOUNT6 = 59,
    /**
     * CAPITAL_AMOUNT1
     * @constant
     */
    CAPITAL_AMOUNT1 = 70,
    /**
     * CAPITAL_AMOUNT2
     * @constant
     */
    CAPITAL_AMOUNT2 = 71,

    /**
     * Separate.Ticket.Unit1 = 52
     * @constant
     */
    SEPARATE_TICKET_UNIT1 = 52,
    /**
     * Separate.Ticket.Unit2 = 53
     * @constant
     */
    SEPARATE_TICKET_UNIT2 = 53,
    /**
     * Separate.Ticket.Unit1 = 54
     * @constant
     */
    SEPARATE_TICKET_UNIT3 = 54,
    /**
     * Separate.Ticket.Unit1 = 55
     * @constant
     */
    SEPARATE_TICKET_UNIT4 = 55,

    /**
     * Member Password Failed
     * @constant
     */
    MEMBER_PASSWORD_FAILED = 0,
    /**
     * Member Password Success
     * @constant
     */
    MEMBER_PASSWORD_SUCCESS = 1,
    /**
     * Member Password Try Max Times
     * @constant
     */
    MEMBER_PASSWORD_TRY_MAX_TIMES = 2,
    /**
     * DISABLE_PRIVILEGE_CHECK_AFTER_EDITING_PATRON_INFO
     * @constant
     */
    DISABLE_PRIVILEGE_CHECK_AFTER_EDITING_PATRON_INFO = 'Disable Privilege Check After Editing Patron Info',
    /**
     * Update Member Bet Coupon
     * @constant
     */
    PROMOTION_EXPIRED_DAY_LIMIT_ENABLED = 'Promotion.Expired.Day.Limit.Enabled',
    /**
     * Update Member Bet Coupon
     * @constant
     */
    REWARD_POINT_EXPIRED_ENABLED = 'Reward.Point.Expired.Enabled',
    /**
     * JACKPOT_HANDPAY_TAX_RATE
     * @constant
     */
    JACKPOT_HANDPAY_TAX_RATE = 'Jackpot.Handpay.Tax.Rate',
    /**
     * MeterRestrict ACTIVE
     * @constant
     */
    METER_RESTRICT_ACTIVE = 1,
    /**
     * MeterRestrict INACTIVE
     * @constant
     */
    METER_RESTRICT_INACTIVE = 0,
    /**
     * TKT_STATE_UNPAID
     * @constant
     */
    TKT_STATE_UNPAID = 1,
    /**
     * TKT_STATE_PURCHASE_TICKET
     * @constant
     */
    TKT_STATE_PURCHASE_TICKET = 2,
    /**
     * TKT_STATE_PENDING_VALIDATION
     * @constant
     */
    TKT_STATE_PENDING_VALIDATION = 6,
    /**
     * TKT_STATE_PAID_EXTERNALLY
     * @constant
     */
    TKT_STATE_PAID_EXTERNALLY = 7,
    /**
     * TKT_STATE_DUPLICATE
     * @constant
     */
    TKT_STATE_DUPLICATE = 97,
    /**
     * TKT_STATE_VOID
     * @constant
     */
    TKT_STATE_VOID = 99,
    /**
     * TKT_VALIDATION_TYPE_EGM
     * @constant
     */
    TKT_VALIDATION_TYPE_EGM = 0x01,
    /**
     * TKT_VALIDATION_TYPE_WK
     * @constant
     */
    TKT_VALIDATION_TYPE_WK = 0x02,
    /**
     * TKT_VALIDATION_TYPE_KIOSK
     * @constant
     */
    TKT_VALIDATION_TYPE_KIOSK = 0x03,
    /**
     * MODIFY_ACCOUNT_HANDPAY_OPERATOR_TYPE
     * @constant
     */
    MODIFY_ACCOUNT_HANDPAY_OPERATOR_TYPE = 1,
    /**
     * MODIFY_ACCOUNT_METER_OPERATOR_TYPE
     * @constant
     */
    MODIFY_ACCOUNT_METER_OPERATOR_TYPE = 2,
    /**
     * MODIFY_ACCOUNT_TICKET_OPERATOR_TYPE
     * @constant
     */
    MODIFY_ACCOUNT_TICKET_OPERATOR_TYPE = 3,
    /**
     * MODIFY_ACCOUNT_AFT_OPERATOR_TYPE
     * @constant
     */
    MODIFY_ACCOUNT_AFT_OPERATOR_TYPE = 4,
    /**
     * MODIFY_ACCOUNT_SOFTDROP_OPERATOR_TYPE
     * @constant
     */
    MODIFY_ACCOUNT_SOFTDROP_OPERATOR_TYPE = 5,
    /**
     * MODIFY_ACCOUNT_MAINTENANCE_OPERATOR_TYPE
     * @constant
     */
    MODIFY_ACCOUNT_MAINTENANCE_OPERATOR_TYPE = 6,
    /**
     * MODIFY_ACCOUNT_LOGINLOG_OPERATOR_TYPE
     * @constant
     */
    MODIFY_ACCOUNT_LOGINLOG_OPERATOR_TYPE = 7,
    /**
     * MODIFY_ACCOUNT_TOKEN_OPERATOR_TYPE
     * @constant
     */
    MODIFY_ACCOUNT_TOKEN_OPERATOR_TYPE = 8,
    /**
     * MODIFY_ACCOUNT_INCIDENTAL_OPERATOR_TYPE
     * @constant
     */
    MODIFY_ACCOUNT_INCIDENTAL_OPERATOR_TYPE = 9,
    /**
     * MODIFY_ACCOUNT_START_SESSION_OPERATOR_TYPE
     * @constant
     */
    MODIFY_ACCOUNT_START_SESSION_OPERATOR_TYPE = 10,
    /**
     * MODIFY_ACCOUNT_TICKET_LOG_TYPE
     * @constant
     */
    MODIFY_ACCOUNT_TICKET_LOG_TYPE = 2,
    /**
     * MODIFY_ACCOUNT_CAPITAL_LOG_TYPE
     * @constant
     */
    MODIFY_ACCOUNT_CAPITAL_LOG_TYPE = 1,
    /**
     * MODIFY_ACCOUNT_CASHLESS_PENDING_RESOLVE_LOG_TYPE
     * @constant
     */
    MODIFY_ACCOUNT_CASHLESS_PENDING_RESOLVE_LOG_TYPE = 2,
    /**
     * MODIFY_ACCOUNT_SESSION_OVERRIDE_LOG_TYPE
     * @constant
     */
    MODIFY_ACCOUNT_SESSION_OVERRIDE_LOG_TYPE = 1,
    /**
     * MODIFY_ACCOUNT_CHANGE_ACC_DATE_LOG_TYPE
     * @constant
     */
    MODIFY_ACCOUNT_CHANGE_ACC_DATE_LOG_TYPE = 2,
    /**
     * TICKET_STATE_PURCHASE
     * @constant
     */
    TICKET_STATE_PURCHASE = 2,
    /**
     * IS_SCANNED
     * @constant
     */
    SESSION_TRANS_IS_SCANNED = 1,
    /**
     * Session.Close.Scan.Ticket = 58
     * @constant
     */
    SESSION_CLOSE_SCAN_TICKRT = 58,
    /**
     * TICKET_OPERATION_ISSUE = 4
     * @constant
     */
    TICKET_OPERATION_ISSUE = 4,
    /**
     * NO_DIPLICATE = 0
     * @constant
     */
    NO_DIPLICATE = 0,
    /**
     * 新桌一開始只會一個人
     */
    NEW_TABLEDESK_PLAYERS = 1,
    /**
     * 觀看狀態
     */
    STATUS_LOOK = 0,
    /**
     * CALL 玩家按了跟注
     */
    STATUS_CALL = 1,
    /**
     * RAISE 玩家按了加注
     */
    STATUS_RAISE = 2,
    /**
     * Allin 玩家按了Allin
     */
    STATUS_ALLIN = 3,
    /**
     * 棄牌 玩家按了棄牌
     */
    STATUS_FOLD = 4,
    /**
     * 看牌 玩家按了看牌
     */
    STATUS_CHECK = 5,
    /**
     * BET 玩家按了下注
     */
    STATUS_BET = 6,
    /**
     * 取消等待大盲
     */
    STATUS_CANCELWAITBIG = 10,
    /**
     * 等待成為大盲
     */
    STATUS_WAITBIG = 11,
    /**
     * 沒有籌碼
     */
    STATUS_NO_BET = 12,
    /**
     * 沒有籌碼
     */
    STATUS_ADD_BET = 13,
    /**
     * 離開桌子
     */
    STATUS_LEAVE_DESK = 14,
    /**
     * 離開位置
     */
    STATUS_LEAVE_SEAT = 14,
    /**
     * 決定動作中
     */
    STATUS_ACTION = 99,
    /**
     * 沒有此玩家的action
     */
    STATUS_ACTION_NOPLAYER = 100,
    /**
     * 遊戲進行中
     */
    GAME_IS_PLAYING = 1,
    /**
     * 遊戲尚未開始
     */
    GAME_NO_PLAYING = 0,
    /**
     * 遊戲最少進行玩家
     */
    GAME_MIN_PLAYERS = 2,
    /**
     * 目前資料庫預設開局倒數秒數
     */
    GAME_START_COUNTDOWN_DEFAULT = 10,
    /**
     * 1秒
     * @constant
     */
    UNIT_ONE_SECOND = 1,
    /**
     * 是否是桌主模式,YES: (0~8), NO: 1
     * @constant
     */
    IS_MASTER_COUNTDOWN = 1,
    /**
     * 遊戲開始的順序
     * @constant
     */
    GAME_BEGINE_TURN = 0,
    /**
     * 廣播給所有在這桌的玩家
     * @constant
     */
    ALLCHANNEL = 'publicChannel',
    /**
     * 給特定玩家廣播
     * @constant
     */
    PRIVATE_CHANNEL = 'privateChannel',
    /**
     * 給特定玩家廣播
     * @constant
     */
    PRIVATE_ERRORCHANNEL = 'errorChannel',
    /**
     * 需決定動作
     * @constant
     */
    NEED_TO_ACTION = 0,
    /**
     * 等待決定動作
     * @constant
     */
    WATTING_ACTION = 30,
    /**
     * 等待決定動作(String)
     * @constant
     */
    WATTING_ACTION_S= 30,
    /**
     * 離位/離桌動作
     * @constant
     */
    PLAYER_LEAVE_ACTION = 70,
    /**
     * 等待前端動畫
     * @constant
     */
    WATTING_CHIENT_ANIMATION = 2,
    /**
     * 不須決定動作(座位沒人 棄排 ALLIN 等待新局玩家)
     * @constant
     */
    NO_ACTION = 100,
    /**
     * 最高可能會用到的牌
     * @constant
     */
    MAXSIZE_PORKER = 48,
    /**
     * 沒有玩家(Number)
     * @constant
     */
    NO_PLAYER = -1,
    /**
     * 沒有玩家(string)
     * @constant
     */
    NO_PLAYER_S = '-1',
    /**
     * 無限注德州
     * @constant
     */
    NLH = 'N',
    /**
     * 有限注德州
     * @constant
     */
    TLH = 'T',
    /**
     * 沒有成功入桌,居然可以選桌
     * @constant
     */
    WHAT_THE_HACK = '-1',
    /**
     * 玩家動作棄排
     * @constant
     */
    PLAYER_ACTION_FOLD = 60,
    /**
     * 玩家動作ALLIN
     * @constant
     */
    PLAYER_ACTION_ALLIN = 50,
    /**
     * 不理會此玩家
     * @constant
     */
    PLAYER_ACTION_PASS = 100,
    /**
     * 玩家動作看牌
     * @constant
     */
    PLAYER_ACTION_CHECK = 30,
    /**
     * 玩家動作跟注
     * @constant
     */
    PLAYER_ACTION_CALL = 30,
    /**
     * 玩家棄排後比重
     * @constant
     */
    PLAYER_FOLD_WEIGHT = 0,
    /**
     * 前面沒有出價金額
     * @constant
     */
    FRONT_MONEY_ZERO = 0,
    /**
     * 分PA 第5回合
     * @constant
     */
    SHARE_POT_ROUND = 4,
    /**
     * 離開座位
     * @constant
     */
    PLAYER_LEAVE_SEAT = -1,
    /**
     * 玩家人數扣除離開座位的玩家
     * @constant
     */
    SUB_PLAYER_LEAVE = -1,
    /**
     * 初始化玩家自身座位
     * @constant
     */
    PLAYER_SEAT_INIT = -1,
    /**
     * 關閉按鈕
     * @constant
     */
    BUTTON_CLOSE = 0,
    /**
     * 打開按鈕
     * @constant
     */
    BUTTON_OPEN = 1,
    /**
     * 功能沒有開啟
     * @constant
     */
    SYSTEM_NO_OPEN = 0,
    /**
     * 功能有開啟
     * @constant
     */
    SYSTEM_IS_OPEN = 1,
    /**
     * 不需分錢的人
     * @constant
     */
    NO_SHARE_PA = -99,
    /**
     * 沒有桌子(string)
     * @constant
     */
    NO_TABLE = '-1',
    /**
     * 玩家沒有座位置(string)
     * @constant
     */
    PLAYER_NO_SEAT = '-1',
    /**
     * 玩家沒有座位置(數字)
     * @constant
     */
    PLAYER_NO_SEAT_N = -1,
    /**
     * 玩家入座
     * @constant
     */
    PLAYER_INTO_SEAT = 0,
    /**
     * 初始化(number)
     * @constant
     */
    INIT = -1,
    /**
     * LOOK_PLAYER 遊戲中的玩家
     * @constant
     */
    PLAYING_PLAYER = 1,
    /**
     * LOOK_PLAYER 觀看的玩家
     * @constant
     */
    LOOKING_PLAYER = 2,
    /**
     * 玩家斷線
     */
    DISCONNECT_PLAYER = 87,
    /** 玩家沒有桌子(string)
     * @constant
     */
    PLAYER_NO_TABLE = '-1',
    /**
     * 玩家沒有session(string)
     * @constant
     */
    PLAYER_NO_SESSION = '-1',
    /**
     * 玩家沒有session(string)
     * @constant
     */
    PLAYER_NO_MONEY = 0,
    /**
     * 局數
     * @constant
     */
    GAME_ROUND = 4,
    /**
     * 前端動畫
     * @constant
     */
    CLIENT_GAME_END_ANIMATION = 6,
    /**
     * 離桌成功
     * @constant
     */
    PLAYER_LEAVE_SUCCESS = 100014
}
