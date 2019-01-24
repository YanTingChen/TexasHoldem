export default class PlayerRecordEntity {
    public um_id: string;
    public pr_sessionRecordID: string;
    public pr_round: string;
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
        return `{"id":"${this.um_id}","session":"${this.pr_sessionRecordID}","round":"${this.pr_round}","hands_amount":"${this.pr_handsAmount}","seat":"${this.pr_seat}","privacy_card":"${this.pr_hands}","sec":"${this.pr_costTime}","bet":"${this.pr_bet}","action":"${this.pr_action}","pot":"${this.pr_deskBetPool}","insurance_bet":"${this.pr_insurance}"}`;
    }
}
