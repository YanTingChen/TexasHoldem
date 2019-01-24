# Redis Key Definition
[Structure definition(結構定義)](http://breakdance.io) stick with a schema.  For instance `{object} : type : id`

### member
信箱驗證碼
    ```
    {member:mail}:str:email
    ```
線上會員列表
    ```
    {member:online}:hash:lobby
    ```
會員登入有效時間
    ```
    {member:barrel}:hash:id
    ```

### game
##### [desk]
牌桌資訊
    ```
    {game:desk}:hash:desksinfo:tableId
    ```
每個玩家的此round 下注金額
    ```
    {game:desk}:hash:frontBet:tableId
    ```
牌桌觀看玩家
    ```
    {game:desk}:hash:lookPlayer:tableId
    ```
玩家列表
    ```
    {game:desk}:list:playersit:tableId
    ```
牌桌內玩家列表
    ```
    {game:desk}:list:playingPlayer:tableId
    ```
每個玩家的金錢列表
    ```
    {game:desk}:list:playerPoint:tableId
    ```
公牌
    ```
    {game:desk}:list:publicPoker:tableId
    ```
每個玩家的動作列表
    ```
    {game:desk}:list:playerAction:tableId
    ```
allin的金額列表
    ```
    {game:desk}:list:allinBet:tableId
    ```
pot池的金額列表
    ```
    {game:desk}:list:paPool:tableId
    ```
牌桌倒數控制
    ```
    {game:desk}:list:countDowner:tableId
    ```
桌子的遊戲歷程
    ```
    {game:desk}:list:playerBetRecord:tableId
    ```
目前有在遊玩的桌子
    ```
    {game:desk}:list:deskPlaying
    ```

##### [player]
玩家資訊
    ```
    {game:player}:hash:playerinfo:id
    ```
私牌
    ```
    {game:player}:list:poker:id
    ```
玩家按鈕
    ```
    {game:player}:list:Button:id
    ```
