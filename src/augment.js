// ---------- augments: every 5 cleared waves, pick 1 of 3 (silver 60% / gold 32% / prism 8%) ----------
const AUGS=[
  // tier 0 = bronze, 1 = silver, 2 = gold (by measured strength). one tier is rolled per offer, all 3 cards share it
  {id:"melee_pow",tier:0,name:"근접 · 강타",desc:"근접 공격력 +20%"},
  {id:"melee_spd",tier:0,name:"근접 · 연타",desc:"근접 공속 +25%"},
  {id:"shot_pow",tier:1,name:"사격 · 철갑탄",desc:"사격 공격력 +20%"},
  {id:"shot_spd",tier:1,name:"사격 · 속사",desc:"사격 공속 +25%"},
  {id:"snipe_pow",tier:1,name:"저격 · 관통탄",desc:"저격 공격력 +20%"},
  {id:"snipe_spd",tier:1,name:"저격 · 빠른 장전",desc:"저격 공속 +25%"},
  {id:"single_pow",tier:0,name:"일점사",desc:"단발 캐릭터 공격력 +15%"},
  {id:"single_spd",tier:1,name:"난사",desc:"단발 캐릭터 공속 +20%"},
  {id:"area_pow",tier:0,name:"광역 폭격",desc:"범위 캐릭터 공격력 +15%"},
  {id:"area_spd",tier:1,name:"연쇄 폭격",desc:"범위 캐릭터 공속 +20%"},
  {id:"area_count",tier:1,name:"파편 탄",desc:"범위 공격 크기 +25%, 때리는 수 +2명"},
  {id:"snipe_range",tier:1,name:"매의 눈",desc:"저격 치명타 확률 +20% (치명타 2.5배)"},
  {id:"pure",tier:0,name:"순수 혈통",desc:"한 계열이 판의 70% 이상이면 공격력·공속 +25%"},
  {id:"trinity",tier:1,name:"삼위일체",desc:"세 계열이 각각 3명 이상이면 공격력·공속 +10%"},
  {id:"trap_frost",tier:0,name:"서리 함정",desc:"길 위 함정 3개. 밟은 적 2초간 40% 느려짐"},
  {id:"trap_spike",tier:1,name:"가시 덫",desc:"길 위 덫 3개. 밟을 때 최대 체력 4% 피해"},
  {id:"totem_curse",tier:1,name:"저주의 토템",desc:"토템 주변 2칸 안 적이 받는 피해 +15%"},
  {id:"ward_break",tier:1,name:"방어 파쇄 결계",desc:"길 3칸을 지난 적은 5초간 방어력 0, 받는 피해 +30%"},
  {id:"time_warp",tier:2,name:"시간 왜곡",desc:"모든 적이 영구히 28% 느려짐"},
  {id:"interest",tier:2,name:"이자",desc:"웨이브 끝마다 골드 +40 (500 넘게 모아두면 +100)"},
  {id:"hunter",tier:2,name:"사냥꾼",desc:"웨이브 보상 골드 +15%"},
  {id:"gem_mine",tier:2,name:"보석 광산",desc:"웨이브 끝마다 보석 +15"},
  {id:"cash_now",tier:0,name:"즉시 현금",desc:"지금 바로 골드 +400"},
  {id:"cheap_upg",tier:2,name:"짠돌이",desc:"업그레이드 비용 -25%"},
  {id:"junk",tier:0,name:"고물상",desc:"캐릭터를 같은 등급 다른 캐릭터로 교환 (견습 50골드, 등급마다 2배)"},
  {id:"jackpot",tier:0,name:"잭팟 체질",desc:"복권 영웅·전설·기적 확률 3배"},
  {id:"free_ticket",tier:2,name:"공짜 한 장",desc:"3웨이브마다 무료 복권 1장"},
  {id:"summon_bless",tier:0,name:"소환 축복",desc:"캐릭터를 뽑을 때 10% 확률로 한 등급 위"},
  {id:"double_up",tier:1,name:"겹경사",desc:"합성할 때 6% 확률로 두 등급 위"},
  {id:"recycle",tier:2,name:"재활용",desc:"합성할 때 10% 확률로 재료 1명이 남음"},
  {id:"god_call",tier:2,name:"신의 부름",desc:"다음 영웅 합성 1회는 전설을 건너뛰고 바로 신"},
  {id:"iron_wall",tier:0,name:"철벽",desc:"목숨 +10"},
  {id:"boss_hunter",tier:1,name:"보스 사냥꾼",desc:"보스 피해 +100%, 일반 적 피해 +10%"},
  {id:"execute",tier:1,name:"처형",desc:"체력 10% 이하 적 즉시 처치 (보스 제외)"},
  {id:"last_stand",tier:0,name:"마지막 저항",desc:"목숨 5 이하일 때 공속 +50%"},
  {id:"devil_deal",tier:2,name:"악마의 거래",desc:"목숨 -10, 대신 무작위 전설 1명"},
  {id:"all_in",tier:1,name:"올인",desc:"가진 골드를 전부 걸고 50% 확률로 3배, 실패하면 0"},
  {id:"fate_dice",tier:2,name:"운명의 주사위",desc:"판의 캐릭터를 모두 다른 캐릭터로, 3명은 한 등급 위"},
];
const AUG=Object.fromEntries(AUGS.map(a=>[a.id,a]));
const AUG_TIER=["bronze","silver","gold"],AUG_TNAME=["브론즈","실버","골드"],AUG_TW=[.55,.33,.12];
const has=id=>!!(S&&S.aug&&S.aug.includes(id));
const AUG_IMG={};for(const a of AUGS){const im=new Image();im.src=`ui/aug/icons/${a.id}.png`;AUG_IMG[a.id]=im}
// props art
const PIMG={};for(const[k,files]of Object.entries({trap_frost:["idle","trigger"],trap_spike:["idle","trigger"],totem_curse:["idle","floor"],ward_break:["floor","floor_corner","status_break"],time_warp:["impact"]})){PIMG[k]={};for(const f of files){const im=new Image();im.src=`sprites/props/${k}/${f}.png`;PIMG[k][f]=im}}
const ok=im=>im&&im.complete&&im.naturalWidth;

// ----- stat helpers used by combat -----
function rtOf(t){return t.rt}
function mh(t){return (t.maxHit||1)+(t.area&&has("area_count")?2:0)}
function upgPrice(lv){return Math.round(upgCost(lv)*(has("cheap_upg")?.75:1))}
function augMult(tw){
  const t=TOWERS[tw.type],r=ROLE[t.uid],N=(tw.conc||0)+1;let p=(S.allIn||1),s=1;
  if(N>1){p*=1+.1*N;s*=N} // 농축: N gods -> attack speed xN and damage +N0%
  if(r==="Melee"){if(has("melee_pow"))p*=1.2;if(has("melee_spd"))s*=1.25}
  if(r==="Shot"){if(has("shot_pow"))p*=1.2;if(has("shot_spd"))s*=1.25}
  if(r==="Sniper"){if(has("snipe_pow"))p*=1.2;if(has("snipe_spd"))s*=1.25}
  if(t.area){if(has("area_pow"))p*=1.15;if(has("area_spd"))s*=1.2}else{if(has("single_pow"))p*=1.15;if(has("single_spd"))s*=1.2}
  if(S.cBuff>0){p*=1.5;s*=1.5}
  if(S.pureOn){p*=1.25;s*=1.25}if(S.trinOn){p*=1.1;s*=1.1}
  if(has("last_stand")&&S.life<=5)s*=1.5;
  return[p,s]}
function augAuras(){ // called from applyAuras: board-wide conditions, then each character's multipliers
  const roles={};for(const tw of S.towers){const r=ROLE[TOWERS[tw.type].uid];roles[r]=(roles[r]||0)+1}
  S.pureOn=has("pure")&&S.towers.length>=5&&Math.max(...Object.values(roles))>=S.towers.length*.7;
  S.trinOn=has("trinity")&&(roles.Melee||0)>=3&&(roles.Shot||0)>=3&&(roles.Sniper||0)>=3;
  for(const tw of S.towers){const[p,s]=augMult(tw);tw.aPow=p;tw.aSpd=s;tw.bPow*=p;tw.bSpd*=s}
}
// props deal % of max HP and ignore armor; bosses and mission monsters take a quarter
function pctHit(m,pct){if(m.dead)return;const big=m.def.boss||m.kind==="mission";m.hp-=m.maxhp*pct*(big?.25:1);if(m.hp<=0)kill(m)}
function augDamage(m,v){ // final damage multipliers (after armor)
  if(has("boss_hunter"))v*=m.def.boss||m.kind==="mission"?2:1.1;
  if(m.wardT>0)v*=1.3;
  if(S.props&&S.props.totem&&inSquare(2,m.x-S.props.totem.x,m.y-S.props.totem.y,monR(m)*.5))v*=1.15;
  return v}
function augAfterHit(m){if(!m.dead&&has("execute")&&!m.def.boss&&m.kind!=="mission"&&m.hp<=m.maxhp*.1){m.hp=0;kill(m)}}

// ----- props placed on the ring path (cell index c sits at path distance c*CELL) -----
const PROP_CELLS={trap_frost:[3,9,16],trap_spike:[2,11,20],ward_break:[6,7,8],totem_curse:22,tower_bolt:5};
function cellPos(c){const p=pathAt(c*CELL);return{d:c*CELL,x:p[0],y:p[1],a:p[2]}}
function placeProps(id){
  S.props=S.props||{};
  if(id==="trap_frost"||id==="trap_spike")S.props[id]=PROP_CELLS[id].map((c,i)=>({...cellPos(c),key:id+i,trig:0}));
  if(id==="ward_break"){const cs=PROP_CELLS.ward_break.map(cellPos);S.props.ward={cells:cs,d0:cs[0].d-CELL/2,d1:cs[2].d+CELL/2}}
  if(id==="totem_curse")S.props.totem=cellPos(PROP_CELLS.totem_curse);
  if(id==="tower_bolt")S.props.bolt={...cellPos(PROP_CELLS.tower_bolt),cd:72,atk:0};
}
function augTick(){
  const P=S.props;if(!P)return;
  for(const k of["trap_frost","trap_spike"])for(const tr of P[k]||[]){if(tr.trig>0)tr.trig--;
    for(const m of S.mons){if(m.dead||Math.abs(m.d-tr.d)>CELL*.45)continue;m.tr=m.tr||new Set();if(m.tr.has(tr.key))continue;m.tr.add(tr.key);tr.trig=8;sfx(k==="trap_frost"?"frost":"spike");
      if(k==="trap_frost"){m.slowT=48;m.slowV=Math.max(m.slowV&&m.slowT>0?m.slowV:0,.4)}else pctHit(m,.04)}}
  if(P.ward)for(const m of S.mons){if(m.dead)continue;if(m.d>=P.ward.d0&&m.d<=P.ward.d1)m.wardT=120;else if(m.wardT>0)m.wardT--}
  const b=P.bolt;if(b){if(b.atk>0)b.atk--;if(--b.cd<=0){b.cd=72;const live=S.mons.filter(m=>!m.dead);
    if(live.length){b.atk=8;sfx("zap");for(let i=live.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[live[i],live[j]]=[live[j],live[i]]}
      for(const m of live.slice(0,3)){pctHit(m,.06);if(ok(PIMG.tower_bolt.impact))S.fx.push({k:"imp",im:PIMG.tower_bolt.impact,x:m.x,y:m.y-6,s:1.1,life:8,max:8})}}}}
}
function augSpawn(m){}
function drawPropsFloor(c,time){
  const P=S&&S.props;if(!P)return;const z=CELL*K;
  const at=(x,y,a,f)=>{c.save();c.translate(x*K,y*K);if(a)c.rotate(a);f();c.restore()};
  if(P.totem&&ok(PIMG.totem_curse.floor)){const zz=z*1.7;c.save();c.globalAlpha=.7;c.drawImage(PIMG.totem_curse.floor,P.totem.x*K-zz/2,P.totem.y*K-zz/2,zz,zz);c.restore()}
  if(P.ward&&ok(PIMG.ward_break.floor)){const m=P.ward.cells[1];at(m.x,m.y,m.a,()=>c.drawImage(PIMG.ward_break.floor,-z*1.5,-z/2,z*3,z))}
  for(const k of["trap_frost","trap_spike"])for(const tr of P[k]||[]){const I=PIMG[k];
    at(tr.x,tr.y,tr.a,()=>{if(tr.trig>0&&ok(I.trigger))cell(c,I.trigger,Math.min(3,Math.floor((8-tr.trig)/2)),4,-z/2,-z/2,z,z);else if(ok(I.idle))c.drawImage(I.idle,-z/2,-z/2,z,z)})}
}
function drawPropsTop(c,time){
  const P=S&&S.props,z=CELL*K;
  if(P&&P.totem&&ok(PIMG.totem_curse.idle))cell(c,PIMG.totem_curse.idle,Math.floor(time/3)%4,4,P.totem.x*K-z/2,P.totem.y*K-z*.6,z,z);
  if(P&&P.bolt){const I=PIMG.tower_bolt;if(P.bolt.atk>0&&ok(I.attack))cell(c,I.attack,Math.min(5,Math.floor((8-P.bolt.atk)*6/8)),6,P.bolt.x*K-z/2,P.bolt.y*K-z*.6,z,z);else if(ok(I.idle))c.drawImage(I.idle,P.bolt.x*K-z/2,P.bolt.y*K-z*.6,z,z)}
  for(const m of S.mons){if(m.dead)continue;
    if(m.frozen>0&&ok(PIMG.time_warp.impact)){const zz=z*1.4,fr=Math.min(3,Math.floor((120-m.frozen)/3));cell(c,PIMG.time_warp.impact,fr,4,m.x*K-zz/2,m.y*K-zz*.9,zz,zz)}
    if(m.wardT>0&&ok(PIMG.ward_break.status_break)){const zz=TS*.5;c.drawImage(PIMG.ward_break.status_break,m.x*K+monR(m)*K*.6,m.y*K-monR(m)*K-zz,zz,zz)}}
}

// ----- offer / pick -----
let augOpen=false,pickOpen=false;
function augTierRoll(){const r=Math.random();return r<AUG_TW[2]?2:r<AUG_TW[2]+AUG_TW[1]?1:0}
function augRoll(n,excl,tier){
  if(tier==null)tier=augTierRoll();
  const pool=AUGS.filter(a=>!S.aug.includes(a.id)&&!excl.includes(a.id));const out=[];
  for(let i=0;i<n&&pool.length;i++){
    let cand=pool.filter(a=>a.tier===tier&&!out.includes(a));for(let k=1;!cand.length&&k<3;k++)cand=pool.filter(a=>a.tier===tier-k&&!out.includes(a)); // tier ran dry: next lower tier
    for(let k=1;!cand.length&&k<3;k++)cand=pool.filter(a=>a.tier===tier+k&&!out.includes(a));
    if(!cand.length)break;out.push(pick(cand))}
  return out}
function augOffer(){
  const tier=augTierRoll(),ch=augRoll(3,[],tier);if(!ch.length)return;
  S.augOffer={ch,tier,rerolled:false,spun:false};
  if(window.AUG_AUTO){augTake(window.AUG_AUTO(ch).id);return}
  S.augPending=true}
function augTake(id){
  const a=AUG[id];S.aug.push(id);sfx("pick");S.augOffer=null;S.augPending=false;
  if(id==="cash_now")S.ore+=400;
  if(id==="iron_wall")S.life+=10;
  if(id==="god_call")S.godCall=1;
  if(id==="airdrop"){S.crateQ=(S.crateQ||0)+2}
  if(id==="supply_call")cratePlace();
  if(id==="devil_deal"){S.life=Math.max(1,S.life-10);placePrize(pick(byGrade(4)).i)}
  if(id==="all_in"){const bet=S.ore;if(Math.random()<.5){S.ore=bet*3;banner("올인 성공!","var(--ore)");log(`올인 성공! 골드 ${bet} → ${bet*3}`,"good");sfx("jackpot")}else{S.ore=0;banner("올인 실패…","var(--life)");log(`올인 실패… 골드 ${bet}을(를) 잃었어요`,"warn");sfx("miss")}}
  if(id==="fate_dice"){const tws=[...S.towers];for(const tw of tws){const t=TOWERS[tw.type],opts=byGrade(t.grade).filter(o=>o.i!==t.i);if(opts.length){const sl=tw.slot,cc=tw.conc;removeTower(tw);const nw=addTower(sl,pick(opts).i,false);if(cc)nw.conc=cc}}
    for(let k=0;k<3;k++){const up=S.towers.filter(tw=>TOWERS[tw.type].grade<4);if(!up.length)break;const tw=pick(up),g=TOWERS[tw.type].grade,sl=tw.slot;removeTower(tw);addTower(sl,pick(byGrade(g+1)).i)}}
  if(["trap_frost","trap_spike","ward_break","totem_curse","tower_bolt"].includes(id))placeProps(id);
  log(`증강 획득 · ${a.name}`,"good");
  if(!window.AUG_AUTO){closeAug();renderPanels()}
}
function ensureAugDom(){
  if($("augOv"))return;const ov=document.createElement("div");ov.id="augOv";ov.className="augOv";ov.hidden=true;
  ov.innerHTML=`<img class="augBanner" alt="증강 선택" src="ui/aug/banner_augment.png"><p class="augTier" id="augTier"></p><div class="augSpin" id="augSpin">${AUG_TNAME.map((n,i)=>`<div class="tp t${i}"><img class="pg" alt="" src="${A("ui/aug/plate_glow.webp")}"><img class="pl" alt="" src="${A(`ui/aug/plate_${AUG_TIER[i]}.webp`)}"><i class="fx"></i><b>${n}</b></div>`).join("")}</div><div class="augCards" id="augCards"></div><button type="button" class="augReroll" id="augReroll" aria-label="다시 뽑기, 보석 50"><img alt="" src="ui/aug/btn_reroll.png"></button><p class="augHint">하나를 골라요</p>`;
  document.querySelector(".stage").appendChild(ov);
  $("augReroll").onclick=()=>{const o=S.augOffer;if(!o||o.rerolled||S.gas<50)return;S.gas-=50;o.rerolled=true;o.ch=augRoll(3,o.ch.map(a=>a.id),o.tier);if(!o.ch.length)o.ch=augRoll(3,[],o.tier);showAug(true)};
}
// the main number of an augment (+20%, 3배…) shown big in the card's lower box; the full text sits under the card
const AUG_KEY={devil_deal:"전설!",god_call:"신!",free_ticket:"무료",fate_dice:"등급↑",junk:"교환",all_in:"×3",time_warp:"-28%",trap_frost:"-40%",pure:"+25%",iron_wall:"❤ +10",gem_mine:"+15",execute:"즉사",trap_spike:"4%"};
function augKey(d,id){if(id&&AUG_KEY[id])return AUG_KEY[id];const m=d.match(/[+\-]\d+(?:\.\d+)?%|\d+(?:\.\d+)?배|\d+(?:\.\d+)?%|[+\-]\d+/);return m?m[0]:"★"}
function cardHTML(a,i){return `<button type="button" class="augCard t${a.tier}" data-a="${a.id}" style="--d:${i*140}ms"><span class="flip"><span class="face back"><img alt="" src="ui/aug/aug_card_back.png"></span><span class="face front">${a.tier===2?`<img class="glow" alt="" src="${A("ui/aug/gold_glow.webp")}">`:""}<img class="frame" alt="" src="${A(`ui/aug/card_${AUG_TIER[a.tier]}.webp`)}"><img class="ic" alt="" src="ui/aug/icons/${a.id}.png"><i class="ds tn2" style="--n:${Math.max(3,a.name.length+.3)}">${a.name}</i></span></span><small class="dsx">${a.desc}</small></button>`}
// before the cards: bronze / silver / gold light up in turn, slow down and stop on this offer's tier
function augSpin(o,done){
  const ov=$("augOv"),sp=$("augSpin"),tps=[...sp.children];ov.classList.add("spinning");ov.hidden=false;sp.className="augSpin";
  // step i lights plate i%3; last step lands on o.tier
  const N=(()=>{let n=10+Math.floor(Math.random()*4);while(n%3!==o.tier)n++;return n})();let i=0;
  const step=()=>{tps.forEach((p,k)=>p.classList.toggle("on",k===i%3));sfx("tick");
    if(i>=N){sp.classList.add("done","t"+o.tier);sfx(o.tier===2?"jackpot":o.tier===1?"win":"pick");
      if(o.tier===2){const f=document.createElement("div");f.className="miracleFx";document.body.appendChild(f);setTimeout(()=>f.remove(),1600)}
      setTimeout(()=>{ov.classList.remove("spinning");done()},o.tier===2?1100:800);return}
    i++;const left=N-i;setTimeout(step,left>6?70:left>3?130:left>1?220:340)};
  step()}
function showAug(again){
  ensureAugDom();const o=S.augOffer;if(!o)return;augOpen=true;if(S.sel){S.sel=null;renderBubble()}
  if(!o.spun&&o.tier!=null){o.spun=true;augSpin(o,()=>showAug(true));return}
  $("augCards").innerHTML=o.ch.map(cardHTML).join("");{const t=$("augTier"),tr=o.tier!=null?o.tier:(o.ch[0]&&o.ch[0].tier)||0;t.textContent=AUG_TNAME[tr]+" 증강";t.className="augTier t"+tr}
  const rr=$("augReroll");rr.disabled=o.rerolled||S.gas<50;
  sfx("flip");$("augOv").hidden=false;requestAnimationFrame(()=>requestAnimationFrame(()=>$("augCards").classList.add("in")));
  if(again)$("augCards").classList.remove("in"),setTimeout(()=>$("augCards").classList.add("in"),30);
  $("augCards").querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{if(!$("augCards").classList.contains("in"))return;b.classList.add("chosen");setTimeout(()=>augTake(b.dataset.a),260)});
}
function closeAug(){augOpen=false;if($("augOv")){$("augOv").hidden=true;$("augCards").classList.remove("in")}}
function augLoopCheck(){if(S&&S.augPending&&!augOpen&&!rewardOpen&&!pickOpen&&running)showAug()}
// choose_line: ask which line the merge result should be
function askLine(cb){
  ensureAugDom();pickOpen=true;const ov=document.createElement("div");ov.className="augOv linePick";
  ov.innerHTML=`<div class="box"><h2>어느 계열로 받을까요?</h2><div class="lines">${UPGS.map(([k,n])=>`<button type="button" data-l="${k}" style="--c:${UPG_COL[k]}"><img alt="" src="ui/icons/icon_${UPG_ICON[k]}.svg">${n}</button>`).join("")}</div></div>`;
  document.querySelector(".stage").appendChild(ov);
  ov.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>{ov.remove();pickOpen=false;cb(b.dataset.l)});
}
function augList(){if(!S||!S.aug||!S.aug.length)return"";
  return `<div class="augOwn"><b>내 증강</b><div>${S.aug.map(id=>`<span class="ag t${AUG[id].tier}" title="${AUG[id].name}: ${AUG[id].desc}"><img alt="${AUG[id].name}" src="ui/aug/icons/${id}.png"></span>`).join("")}</div></div>`}

window.__rtd={get S(){return S},start,tick,TOWERS,WAVES,SLOTS,build,merge,addTower,spawn,augTake,augOffer,showAug,AUGS};

function augDetail(){if(!S||!S.aug.length)return `<p class="hint">아직 고른 증강이 없어요. 5·15·25…웨이브마다 하나씩 골라요.</p>`;
  return `<div class="augDet">${S.aug.map(id=>`<div class="ad t${AUG[id].tier}"><img alt="" src="ui/aug/icons/${id}.png"><div><b>${AUG[id].name}</b><small>${AUG[id].desc}</small></div></div>`).join("")}</div>`}

// ---------- supply crate (OFF: not called from the game any more): a small crate waits in a corner of the map. every cleared wave it rattles as if it will open;
// 3% of the time it really opens (glows, lid flies up) and a prize roulette runs ----------
const CRATE_P=.03,CRATE_P_UP=.10;
const CRATE=[ // weights per 100
  {k:"gold",w:30},{k:"gem",w:22},{k:"tix",w:12},{k:"elite",w:12},{k:"hero",w:8},{k:"frenzy",w:8},{k:"upg",w:5},{k:"legend",w:3}];
const CRATE_NAME={gold:"골드 (200 + 웨이브×15)",gem:"보석 (100 + 웨이브×5)",tix:"무료 복권 3장",elite:"정예 캐릭터",hero:"영웅 캐릭터",frenzy:"광폭: 20초간 모두 공격력·공속 1.5배",upg:"모든 업글 +1",legend:"전설 캐릭터"};
const crateP=()=>has("supply_call")?CRATE_P_UP:CRATE_P;
const CRATE_POS=()=>({x:COLS*WT-WT*.85,y:ROWS*WT-WT*.85}); // bottom-right corner of the map
const C_TEASE=34,C_OPEN=40; // frames: rattle, then (on a win) glow + open
function cratePool(){return CRATE.map(o=>has("supply_vip")&&["hero","legend","frenzy"].includes(o.k)?{...o,w:o.w*3}:o)}
function crateOddsHTML(){const pool=cratePool(),tot=pool.reduce((a,o)=>a+o.w,0);const pc=w=>{const v=w/tot*100;return v>=1?v.toFixed(1)+"%":v.toFixed(2)+"%"};
  return `<div class="oddsH">보급상자 <small>웨이브가 끝날 때마다 ${Math.round(crateP()*100)}% 확률로 열림${has("supply_vip")?" · 증강 적용":""}</small></div><table class="odds">${pool.map(o=>`<tr class="${["hero","legend","frenzy"].includes(o.k)?"hero":""}"><td>${CRATE_NAME[o.k]}</td><td>${pc(o.w)}</td></tr>`).join("")}</table>`}
// called when a wave is cleared (and twice by the airdrop augment)
function crateTry(force){if(S.cA&&S.cA.t<C_TEASE+C_OPEN){S.crateQ=(S.crateQ||0)+(force?1:0);return}
  S.cA={t:0,win:force||Math.random()<crateP()};sfx("reel");crateState("tease")}
function crateTick(){
  if(S.cBuff>0)S.cBuff--;
  const A=S.cA;if(!A){if(S.crateQ>0){S.crateQ--;crateTry(true)}return}
  A.t++;if(A.t%5===0&&A.t<C_TEASE)sfx("tick");
  if(A.t===C_TEASE){if(!A.win){sfx("miss");crateState("","fail");S.cA=null;return}
    sfx("jackpot");crateState("open");setTimeout(()=>{if(S.cA)crateState("opened")},620);log("보급상자가 열렸어요!","good")}
  if(A.win&&A.t===C_TEASE+14)crateOpen();
  if(A.t>=C_TEASE+C_OPEN){S.cA=null;setTimeout(()=>{if(!S.cA)crateState("")},2500)}}
let crateInfoHide=0;
function crateOpen(){
  const pool=cratePool(),tot=pool.reduce((a,o)=>a+o.w,0);let r=Math.random()*tot,o=pool[0];for(const q of pool){if((r-=q.w)<0){o=q;break}}
  if(window.FAST_LOTTO){crateGive(o);return}
  crateWheel(o.k,()=>crateGive(o))}
function crateGive(o){
  const w=S.wi+1,vip=has("supply_vip")?2:1,pr={k:o.k};let txt,rare=false;
  if(o.k==="gold"){pr.v=(200+15*w)*vip;S.ore+=pr.v;txt=`골드 +${pr.v}`}
  else if(o.k==="gem"){pr.v=(100+5*w)*vip;S.gas+=pr.v;txt=`보석 +${pr.v}`}
  else if(o.k==="tix"){S.freeTix=(S.freeTix||0)+3;txt="무료 복권 3장"}
  else if(o.k==="frenzy"){S.cBuff=24*20;applyAuras();txt="광폭! 20초간 공격력·공속 1.5배";rare=true}
  else if(o.k==="upg"){for(const k in S.upg)if(S.upg[k]<255)S.upg[k]++;txt="모든 업글 +1";rare=true}
  else{const g={elite:2,hero:3,legend:4}[o.k];pr.type=pick(byGrade(g)).i;placePrize(pr.type);txt=`${GRADE[g]} ${TOWERS[pr.type].name}`;rare=g>=3}
  log(`보급상자: ${txt}`,"good");if(rare)banner(o.k==="legend"?"보급 대박! 전설":"보급 대박!",o.k==="legend"?GCOL[4]:GCOL[3]);
  if(!window.FAST_LOTTO){const el=$("crateInfo");if(el){el.querySelector("h4 span").textContent=txt;el.classList.add(rare?"jp":"won");sfx(rare?"jackpot":"win");
    if(o.k==="legend"){const f=document.createElement("div");f.className="miracleFx";document.body.appendChild(f);setTimeout(()=>f.remove(),1600)}
    clearTimeout(crateInfoHide);crateInfoHide=setTimeout(()=>el.classList.remove("show","jp","won"),rare?2600:1900)}}
  renderPanels()}
// roulette: the 8 prizes sit in a ring, the light runs around, slows down and stops on the prize
const CRATE_ICON=Object.fromEntries(Object.entries({gold:"gold",gem:"gem",tix:"ticket",elite:"elite",hero:"hero",frenzy:"frenzy",upg:"upgrade",legend:"legend"}).map(([k,f])=>[k,`<img alt="" src="${A(`ui/roulette/prize_${f}.webp`)}">`]));
const CRATE_SHORT={gold:"골드",gem:"보석",tix:"복권 3장",elite:"정예",hero:"영웅",frenzy:"광폭",upg:"업글 +1",legend:"전설"};
function crateWheel(k,done){
  let el=$("crateInfo");if(!el){el=document.createElement("div");el.id="crateInfo";el.className="crateInfo";document.body.appendChild(el)}
  el.onclick=null;clearTimeout(crateInfoHide);el.classList.remove("jp","won");
  const pool=cratePool(),tot=pool.reduce((a,o)=>a+o.w,0),RING=[0,1,2,3,7,6,5,4]; // grid 4x2, walk around the edge
  const col={elite:GCOL[2],hero:GCOL[3],legend:GCOL[4]};
  el.innerHTML=`<p class="ctop"><b>${Math.round(crateP()*100)}%</b> 확률로 보급상자가 열렸어요!</p><h4><span>보급상자</span></h4><div class="cw">${pool.map(o=>`<div class="cc ${o.k}"${col[o.k]?` style="--g:${col[o.k]}"`:""}><i>${CRATE_ICON[o.k]}</i><b>${CRATE_SHORT[o.k]}</b><small>${Math.round(o.w/tot*1000)/10}%</small></div>`).join("")}</div>`;
  el.className="crateInfo wheel show spin";const cells=[...el.querySelectorAll(".cc")],target=pool.findIndex(o=>o.k===k),tpos=RING.indexOf(target);
  let N=16+Math.floor(Math.random()*8);while(N%8!==tpos)N++;let i=0;
  const step=()=>{cells.forEach(c=>c.classList.remove("on"));cells[RING[i%8]].classList.add("on");sfx("tick");
    if(i>=N){el.classList.remove("spin");cells[target].classList.add("hit");setTimeout(done,350);return}
    i++;const left=N-i;setTimeout(step,left>10?55:left>5?95:left>2?170:left>0?280:0)};
  setTimeout(step,500)}
function drawCrate(){} // the crate is a page element under the board (outside the road and the hero slots)
function crateEl(){let el=$("crateBox");if(!el){el=document.createElement("div");el.id="crateBox";el.className="crateBox";el.innerHTML=`<i class="cg"></i><i class="cs" role="img" aria-label="보급상자"></i><i class="cfx"></i><i class="cpf"></i><b class="cb"></b><small class="cl"></small>`;document.querySelector(".stage").appendChild(el)}return el}
function cratePlace(){const el=crateEl(),l=el.querySelector(".cl");if(l)l.textContent=`열릴 확률 ${Math.round(crateP()*100)}%`}
function crateState(st,txt){cratePlace();const el=crateEl();el.className="crateBox"+(st?" "+st:"");
  if(txt==="fail"){const pf=el.querySelector(".cpf");pf.classList.remove("go");void pf.offsetWidth;pf.classList.add("go");txt="아깝다!"}
  const b=el.querySelector(".cb");b.textContent=txt||"";if(txt){b.classList.remove("pop");void b.offsetWidth;b.classList.add("pop")}}
// supply crate removed from play (2026-10-28); code kept dormant
