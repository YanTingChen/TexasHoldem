const aa = {
    um_id :'?',
    sr_id :'?',
    rs_id :'?',
    pr_hands_bet :'?',
    pr_seat :'?',
    pr_hands :'?',
    pr_sec :'?',
    pr_blinds :'?',
    pr_action :'?',
    pr_bet :'?',
    pr_insurance :'?',
    pr_win :'?'
};
const json = JSON.stringify(aa);
console.log(`{"um_id":"${aa.um_id}","sr_id":"${aa.sr_id}","rs_id":"${aa.rs_id}","pr_hands_bet":"${aa.pr_hands_bet}","pr_seat":"${aa.pr_seat}","pr_hands":"${aa.pr_hands}","pr_sec":"${aa.pr_sec}","pr_blinds":"${aa.pr_blinds}","pr_action":"${aa.pr_action}","pr_bet":"${aa.pr_bet}","pr_insurance":"${aa.pr_insurance}","pr_win":"${aa.pr_win}}"`);