export default class PlayerRecordEntity {
    public um_id: string;
    public pr_sessionRecordID: string;
    public pr_roundStatusID: string;
    public pr_handsAmount: string;
    public pr_seat: string;
    public pr_hands: string;
    public pr_costTime: string;
    public pr_bet: string;
    public pr_action: string;
    public pr_deskBetPool: string;
    public pr_insurance: string;
    public makePlayerRecord() {
        // tslint:disable-next-line:max-line-length
        return `{"um_id":"${this.um_id}","pr_sessionRecordID":"${this.pr_sessionRecordID}","pr_roundStatusID":"${this.pr_roundStatusID}","pr_handsAmount":"${this.pr_handsAmount}","pr_seat":"${this.pr_seat}","pr_hands":"${this.pr_hands}","pr_costTime":"${this.pr_costTime}","pr_bet":"${this.pr_bet}","pr_action":"${this.pr_action}","pr_deskBetPool":"${this.pr_deskBetPool}","pr_insurance":"${this.pr_insurance}"}`;
    }
}
