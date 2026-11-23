// ---------- dopamine: crits, kill coins, all-clear bonus, crisis warning and escape ----------
const CRIT_P=.08,CRIT_X=2.5;
let lastCrit=0,coinAcc=0,lastCoin=0;
function critFx(m,v){if(S.frame-lastCrit<4)return;lastCrit=S.frame;S.fx.push({k:"txt",t:fmt(v)+"!",x:m.x+(Math.random()-.5)*16,y:m.y-14,c:"#ffe14a",sc:"#8a2a00",big:true,life:22,max:22})}
