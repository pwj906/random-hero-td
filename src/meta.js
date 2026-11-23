// ---------- home screen and result screen ----------
function bestWave(){try{return +localStorage.getItem("rhd_best")||0}catch(e){return 0}}
function showHome(){
  $("startOv").hidden=false;document.body.classList.add("atHome");const b=bestWave();
  $("homeBest").textContent=b?`최고 기록 ${b} 웨이브`:"아직 기록이 없어요";homeSndSync();
}
function homeSndSync(){const on=SND.on;$("homeSndImg").src=`ui/home/btn_sound_${on?"on":"off"}.png`;$("homeSnd").setAttribute("aria-label",on?"소리 끄기":"소리 켜기")}
$("homeSnd").onclick=()=>{audioInit();setSound(!SND.on);homeSndSync()};
$("homeHelp").onclick=()=>{$("helpModal").hidden=false};
$("homeCodex").onclick=()=>{$("codexSlot").appendChild($("codex"));$("codexModal").hidden=false};
document.querySelectorAll(".homeModal [data-close]").forEach(b=>b.onclick=()=>{const m=b.closest(".homeModal");m.hidden=true;if(m.id==="codexModal")$("codexCard").appendChild($("codex"))});
document.querySelectorAll(".homeModal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)m.querySelector("[data-close]").click()}));
function showResult(){
  const wave=S.wi+1,prev=bestWave(),isNew=wave>prev;if(isNew)try{localStorage.setItem("rhd_best",wave)}catch(e){}
  $("resBanner").src=`ui/result/banner_${isNew?"newrecord":"record"}.png`;$("resBanner").alt=isNew?"신기록!":"기록";
  $("resWave").textContent=wave;$("resBest").textContent=`최고 기록 ${Math.max(prev,wave)} 웨이브`;
  $("resAugs").innerHTML=S.aug.length?S.aug.map(id=>`<img alt="${AUG[id].name}" title="${AUG[id].name}" src="ui/aug/icons/${id}.png">`).join(""):`<small>고른 증강 없음</small>`;
  const top=[...S.towers].sort((a,b)=>TOWERS[b.type].grade-TOWERS[a.type].grade||(b.conc||0)-(a.conc||0))[0];
  $("resHero").innerHTML=top?`<img alt="${TOWERS[top.type].name}" src="${ICON[top.type]}"><small>${TOWERS[top.type].name}${top.conc?" ★"+(top.conc+1):""}</small>`:"";
}
showHome();

// ---------- situational tips: each one shows once, the first time its situation comes up ----------
const TIPS={
  summon:{t:"여기 빈 칸을 눌러 보세요!",d:"골드 100으로 캐릭터가 나와요",at:()=>{const mid=ROWS*WT/2,sl=SLOTS.filter(s=>!s.tower&&s.x<=96).sort((a,b)=>Math.abs(a.y-mid)-Math.abs(b.y-mid))[0]||SLOTS.find(s=>!s.tower);tipSlot=sl;const r=cv.getBoundingClientRect(),k=r.width/(COLS*WT);return {left:r.left+(sl.x-WT)*k,top:r.top+(sl.y-WT)*k,width:2*WT*k,height:2*WT*k,right:r.left+(sl.x+WT)*k,bottom:r.top+(sl.y+WT)*k}},when:()=>S.towers.length===0&&S.frame>10},
  merge:{t:"같은 캐릭터 2명! 합성을 눌러 보세요",d:"캐릭터를 두 번 톡톡 눌러도 돼요",at:()=>MQ.matches?$("navMerge"):$("mergeAll"),when:()=>S.towers.some(tw=>TOWERS[tw.type].grade<5&&sameCount(tw)>=2)},
  aug:{t:"증강 하나를 골라 보세요!",d:"골드 등급이 가장 세요",at:null,when:()=>augOpen&&$("augCards")&&$("augCards").classList.contains("in")},
  upg:{t:"업글을 눌러 강화해 보세요!",d:"보석으로 공격력을 올려요",at:()=>MQ.matches?document.querySelector('[data-sheet="pUpg"]'):$("pUpg"),when:()=>S.wi>=6&&S.phase==="prep"},
  boss:{t:"받을까, 2배에 걸까?",d:"실패하면 0골드!",at:null,when:()=>rewardOpen&&$("rewardBox").classList.contains("bossP")},
};
let tipSeen={};try{tipSeen=JSON.parse(localStorage.getItem("rhd_tips")||"{}")}catch(e){}
let tipNow=null,tipSlot=null;
// pulsing ring + pointing hand on the slot the summon tip points at (drawn by the board renderer)
function tipDraw(c,time){if(tipNow!=="summon"||!tipSlot)return;const x=tipSlot.x*K,y=tipSlot.y*K,p=(Math.sin(time*.18)+1)/2;
  c.save();c.lineWidth=TS*.09;c.strokeStyle=`rgba(255,211,79,${.6+.4*p})`;c.shadowColor="#ffd34f";c.shadowBlur=TS*.4;c.strokeRect(x-TS*(.92+.06*p),y-TS*(.92+.06*p),TS*(1.84+.12*p),TS*(1.84+.12*p));c.restore();
  c.font=`${TS*.9}px sans-serif`;c.textAlign="center";c.textBaseline="middle";c.fillText("👆",x+TS*.25,y+TS*(.35+.15*p));c.textBaseline="alphabetic"}
function tipClose(){tipSlot=null;const el=$("tipBox");if(el)el.hidden=true;document.querySelectorAll(".tipHi").forEach(e=>e.classList.remove("tipHi"));tipNow=null}
function tipShow(id){
  const T=TIPS[id];tipSeen[id]=1;try{localStorage.setItem("rhd_tips",JSON.stringify(tipSeen))}catch(e){}
  let el=$("tipBox");if(!el){el=document.createElement("div");el.id="tipBox";el.className="tipBox";document.body.appendChild(el)}
  el.innerHTML=`<b>${T.t}</b><p>${T.d}</p><button type="button">확인</button><i class="tArw"></i>`;el.querySelector("button").onclick=tipClose;
  el.hidden=false;el.className="tipBox";tipNow=id;
  const tg=T.at&&T.at(),W=innerWidth,H=innerHeight,bw=Math.min(320,W-24);el.style.width=bw+"px";
  if(tg){const isEl=!!tg.getBoundingClientRect;if(isEl)tg.classList.add("tipHi");const r=isEl?tg.getBoundingClientRect():tg,bh=el.offsetHeight,cx=r.left+r.width/2;
    let left=Math.max(12,Math.min(W-bw-12,cx-bw/2)),top;
    if(r.height>H*.4){top=r.top+r.height*.35;el.classList.add("mid")}           // the board: float over its middle
    else if(r.top>bh+24){top=r.top-bh-12;el.classList.add("up")}              // above the button
    else{top=r.bottom+12;el.classList.add("down")}
    el.style.left=left+"px";el.style.top=top+"px";el.style.setProperty("--ax",Math.max(16,Math.min(bw-16,cx-left))+"px")}
  else{el.style.left=(W-bw)/2+"px";el.style.top=Math.max(12,H*.06)+"px";el.classList.add("mid")}
  clearTimeout(el._t);el._t=setTimeout(()=>{if(tipNow===id)tipClose()},14000)}
setInterval(()=>{if(!S||window.AUG_AUTO)return;
  if(tipNow){let still=true;try{still=TIPS[tipNow].when()}catch(e){}if(!still)tipClose();return}if(!running&&!augOpen&&!rewardOpen)return;
  for(const id in TIPS){if(tipSeen[id])continue;let ok=false;try{ok=TIPS[id].when()}catch(e){}if(ok){tipShow(id);break}}},400);
$("tipReset").onclick=()=>{tipSeen={};try{localStorage.removeItem("rhd_tips")}catch(e){}$("tipReset").textContent="다음 판에 다시 보여 줄게요";$("tipReset").disabled=true};

// no page zoom: pinch or double-tap anywhere (e.g. on the bottom tab bar) used to zoom the whole page
// and the map area (touch-action:none) could not pinch it back. iOS ignores user-scalable=no, so block it here too.
(function(){const no=e=>{if(e.cancelable)e.preventDefault()};
  ["gesturestart","gesturechange","gestureend"].forEach(k=>document.addEventListener(k,no,{passive:false}));
  document.addEventListener("touchmove",e=>{if(e.touches.length>1||(e.scale&&e.scale!==1))no(e)},{passive:false});
  document.addEventListener("dblclick",no,{passive:false});
  let lastEnd=0;document.addEventListener("touchend",e=>{const t=Date.now();
    if(t-lastEnd<300&&e.touches.length===0&&!(e.target.closest&&e.target.closest("button,input,textarea,select,a,canvas,.vp"))){no(e)}lastEnd=t},{passive:false});
})();

// stale page guard: phones keep the old index.html cached for a while after a deploy.
// if the server has a newer build, reload once from a fresh URL (skipped inside claude.ai, where there is no version file)
(function(){if(typeof BUILD==="undefined"||!/github\.io$/.test(location.hostname))return;
  fetch("version.txt?t="+Date.now(),{cache:"no-store"}).then(r=>r.ok?r.text():"").then(v=>{v=(v||"").trim();
    if(v&&v!==BUILD&&!location.search.includes("v="+v))location.replace(location.pathname+"?v="+v)}).catch(()=>{})})();
