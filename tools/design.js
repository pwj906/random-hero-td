/* 디자인 확인 모드 — 시험판에만 붙는다(배포 빌드에는 들어가지 않음). 게임 스크립트 끝에 이어 붙여 같은 변수에 접근한다. */
(()=>{
const D={on:false,pose:null,tags:true,aura:true,snd:false,only:null,sel:null,n:26};window.DM=D;
const RN={Melee:"근거리",Shot:"중거리",Sniper:"원거리"},PN=["대기","준비","공격","마무리"];
const roster=()=>TOWERS.filter(t=>!t.off).sort((a,b)=>a.grade-b.grade||a.i-b.i);
/* 길 옆 칸을 시계 방향으로, 한 칸씩 띄워서 먼저 쓰고 모자라면 나머지 */
const mid=()=>{let x=0,y=0;for(const q of SLOTS){x+=q.x;y+=q.y}return[x/SLOTS.length,y/SLOTS.length]};
/* 옆으로 치는 모습이 보이게: 왼쪽 줄·오른쪽 줄을 한 줄씩 건너 먼저(4+4), 그다음 나머지 길 옆 */
const ring=()=>{const xs=SLOTS.map(q=>q.x),lo=Math.min(...xs),hi=Math.max(...xs),col=x=>SLOTS.map((q,k)=>[k,q]).filter(([,q])=>q.x===x).sort((a,b)=>a[1].y-b[1].y).map(a=>a[0]),Lc=col(lo),Rc=col(hi),ev=a=>a.filter((_,i)=>i%2===0),od=a=>a.filter((_,i)=>i%2),A=[...ev(Lc),...ev(Rc),...od(Lc),...od(Rc)];return[...A,...SLOTS.map((q,k)=>k).filter(k=>edgeSlot(SLOTS[k])&&!A.includes(k))]};
const inner=()=>{const[cx,cy]=mid();return SLOTS.map((q,k)=>[k,Math.hypot(q.x-cx,q.y-cy)]).filter(([k])=>!edgeSlot(SLOTS[k])).sort((a,b)=>a[1]-b[1]).map(a=>a[0])};
/* ---- 게임 동작 덮어쓰기(모드가 켜졌을 때만) ---- */
const _leak=leak;leak=m=>{if(!D.on)return _leak(m);m.d-=PATHLEN};
const _damage=damage;damage=function(m,...a){if(D.on)m.hp=m.maxhp=1e12;return _damage(m,...a)};
const _crate=crateTick;crateTick=()=>{if(!D.on)_crate()};
const _lv=lvText;lvText=(c,tw)=>{if(!D.on||D.tags)_lv(c,tw)};
const _sfx=sfx;sfx=(...a)=>{if(!D.on||D.snd)_sfx(...a)};
const _pose0=drawPose,_pose=function(c,t,...r){const s=SPR[t.uid],k=s&&s.aura;if(!D.on||D.aura||!k)return _pose0(c,t,...r);s.aura=null;const v=_pose0(c,t,...r);s.aura=k;return v};drawPose=function(c,t,x,y,R,ang,tw){
  if(!D.on||!tw||D.pose==null)return _pose(c,t,x,y,R,ang,tw);
  const a=tw.atk;tw.atk=null;tw.pf=D.pose;const r=_pose(c,t,x,y,R,ang,tw);tw.atk=a;tw.pf=null;return r};
function mobs(){S.mons=[];for(let i=0;i<D.n;i++){const def=waveDef(themeI*20+Math.floor(i/4)%4);spawn(def,1e12,"wave");const m=S.mons[S.mons.length-1];m.d=PATHLEN*i/D.n;m.spd=2.2;const p=pathAt(m.d);m.x=p[0];m.y=p[1];m.a=p[2]}}
const _heroIn=heroIn;heroIn=(t,sl)=>{if(!D.placing)_heroIn(t,sl)};
function place(){D.placing=true;try{place0()}finally{D.placing=false}}
function place0(){for(const tw of [...S.towers])removeTower(tw);S.sel=null;S.fx=[];S.proj=[];
  const EDGE=ring(),INNER=inner();
  if(D.only!=null){for(const i of [1,2,5,6,11])addTower(SLOTS[EDGE[i]],D.only,false);addTower(SLOTS[INNER[0]],D.only,false)}
  else{let e=0,n=0;for(const t of roster()){const melee=t.upg==="Melee",k=melee&&e<EDGE.length?EDGE[e++]:n<INNER.length?INNER[n++]:EDGE[e++];if(SLOTS[k]&&!SLOTS[k].tower)addTower(SLOTS[k],t.i,false)}}
  S.fx=[];$("banner").style.display="none"}
function enter(){
  Object.assign(tipSeen,{summon:1,merge:1,aug:1,upg:1,boss:1});D.entering=true;start("normal");D.entering=false;S.phase="design";S.cd=1e9;D.on=true;D.pose=null;D.only=null;speed=1;paused=false;
  document.body.classList.add("design");if(D.sel==null)D.sel=roster()[0].i;place();mobs();ui()}
function leave(){D.on=false;running=false;S.mons=[];document.body.classList.remove("design","dmMin");$("banner").style.display="";$("goHome").click()}
/* 지금 판을 계속 깨끗하게: 배너·알림·도움말 숨기기 */
const css=document.createElement("style");css.textContent=`
body.design .toast,body.design #toast,body.design #banner,body.design .bubble,body.design .mnav,body.design .ctl,body.design .skip,body.design .lotto,body.design .mergeAll,body.design .hud,body.design #mapNext,body.design .mapBanner,body.design .tip{display:none!important}
#dmTop,#dmPan,#dmBig,#dmTap{display:none}
body.design #dmTop{display:flex;position:fixed;z-index:60;left:0;right:0;top:0;gap:6px;padding:8px;align-items:center;background:rgba(27,36,80,.92);color:#fff;font:700 13px sans-serif}
#dmTop b{flex:1;text-align:center;font-size:14px;white-space:nowrap}#dmTop .dmb{white-space:nowrap}
body.design #dmPan{display:block;position:fixed;z-index:60;left:0;right:0;bottom:0;background:#1f2c63;color:#fff;font:700 12px sans-serif;padding:8px 8px calc(8px + env(safe-area-inset-bottom));box-shadow:0 -3px 12px rgba(0,0,0,.35)}
body.design #dmTap{display:none;position:fixed;z-index:50;inset:0;touch-action:manipulation}
.dmb{appearance:none;border:0;border-radius:9px;background:#34478f;color:#fff;font:700 12px sans-serif;padding:6px 10px;min-height:30px;cursor:pointer}
.dmb[aria-pressed=true]{background:#ffd24d;color:#1b2450}
.dmr{display:flex;gap:5px;align-items:center;margin-top:4px}.dmr>span{width:30px;flex:none;color:#b9c6ff}.dmr .dmb{flex:1;padding:8px 2px}
#dmL{display:flex;gap:5px;overflow-x:auto;padding-bottom:2px}
#dmL button{flex:none;width:58px;padding:3px 0 4px;border-radius:10px;border:2px solid transparent;background:#2b3a7c;color:#fff;font:700 10px sans-serif;cursor:pointer}
#dmL button[aria-pressed=true]{border-color:#ffd24d;background:#3d50a3}#dmL .im{display:block;width:44px;height:44px;margin:0 auto;overflow:hidden}#dmL img{width:100%;height:100%;transform:scale(1.5);transform-origin:50% 62%}
body.design.dmMin #dmPan .dmr,body.design.dmMin #dmC{display:none}
#dmC{display:block;width:100%;height:84px;border-radius:10px;margin-top:6px;background:#78aa5a;cursor:zoom-in}
body.design #dmBig.on{display:flex;position:fixed;z-index:70;inset:0;flex-direction:column;background:rgba(15,20,50,.97);color:#fff;font:700 14px sans-serif;padding:12px;gap:8px;box-sizing:border-box}
#dmBig canvas{flex:1;min-height:0;width:100%;border-radius:14px}
@media(min-width:900px){body.design #dmPan{left:auto;top:52px;width:380px}#dmL{flex-wrap:wrap}}
`;document.head.append(css);
const el=(tag,id,html="")=>{const e=document.createElement(tag);e.id=id;e.innerHTML=html;document.body.append(e);return e};
const tap=el("div","dmTap"),top=el("div","dmTop"),pan=el("div","dmPan"),big=el("div","dmBig");
/* 판 위: 끌면 게임과 똑같이 옮겨지고(자리 바꾸기 포함), 누르면 그 캐릭터를 고른다. 소환·합성·정보창은 막는다 */
document.addEventListener("click",ev=>{if(!D.on||!ev.target.closest||ev.target.closest("#dmTop,#dmPan,#dmBig"))return;ev.stopPropagation();ev.preventDefault();
  const r=cv.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width*cv.width,y=(ev.clientY-r.top)/r.height*cv.height/TILT;let b=null,bd=TS*1.1;for(const tw of S.towers){const d=Math.hypot(tw.x*K-x,tw.y*K-TS*.35-y);if(d<bd){bd=d;b=tw}}S.sel=null;if(b){D.sel=b.type;ui()}},true);
const B=(t,on,fn)=>{const b=document.createElement("button");b.type="button";b.className="dmb";b.textContent=t;b.setAttribute("aria-pressed",!!on);b.onclick=()=>{fn();ui()};return b};
function row(label,...bs){const d=document.createElement("div");d.className="dmr";const s=document.createElement("span");s.textContent=label;d.append(s,...bs);return d}
let cvs=null;
function ui(){
  top.replaceChildren(B("← 나가기",0,leave));const nm=document.createElement("b");nm.textContent=THEMES[themeI].name;
  top.append(B("◀",0,()=>{setTheme((themeI+THEMES.length-1)%THEMES.length,false);mobs()}),nm,B("▶",0,()=>{setTheme((themeI+1)%THEMES.length,false);mobs()}),B("표시",D.tags,()=>D.tags=!D.tags),B("오라",D.aura,()=>D.aura=!D.aura),B("소리",D.snd,()=>D.snd=!D.snd),B(document.body.classList.contains("dmMin")?"펼치기":"접기",0,()=>document.body.classList.toggle("dmMin")));
  const old=document.getElementById("dmL"),sx=old?old.scrollLeft:0,L=document.createElement("div");L.id="dmL";
  for(const t of roster()){const b=document.createElement("button");b.type="button";b.setAttribute("aria-pressed",t.i===D.sel);b.innerHTML=`<span class="im"><img alt="" src="${ICON0[t.i]}"></span>${GRADE[t.grade]}`;b.onclick=()=>{D.sel=t.i;if(D.only!=null){D.only=t.i;place()}ui()};L.append(b)}
  cvs=document.createElement("canvas");cvs.id="dmC";cvs.onclick=()=>{big.classList.add("on");bigUi()};
  pan.replaceChildren(L,cvs,
    row("등장",...[5,6,7,8].map(l=>B("LV"+l,0,()=>{const t=roster().find(o=>o.grade===l-1),tw=S.towers.find(o=>o.type===t.i);introEnd();heroIn(t,tw?tw.slot:SLOTS[13]);sfx(l===8?"god":"rare")}))),
    row("배치",B("전체(처음 자리)",D.only==null,()=>{D.only=null;place()}),B("고른 캐릭터만",D.only!=null,()=>{D.only=D.sel;place()})),
    row("속도",...[[.1,"0.1배"],[.25,"0.25배"],[.5,"0.5배"],[1,"1배"]].map(([v,t])=>B(t,speed===v,()=>speed=v))),
    row("자세",B("자동",D.pose==null,()=>D.pose=null),...PN.map((t,k)=>B(t,D.pose===k,()=>D.pose=k))));
  L.scrollLeft=sx;if(!sx){const a=L.querySelector("[aria-pressed=true]");if(a)L.scrollLeft=Math.max(0,a.offsetLeft-160)}}
const BG=["#78aa5a","#dfe6ea","#2a2f57","#b0603f"];let bgI=0,bc=null;
function bigUi(){const t=TOWERS[D.sel];big.replaceChildren();const h=document.createElement("div");h.style.cssText="display:flex;gap:8px;align-items:center";const s=document.createElement("span");s.style.flex="1";s.textContent=`${GRADE[t.grade]} ${t.name} · ${RN[t.upg]} · ${t.area?"범위":"지정"}`;
  const b=(x,f)=>{const q=document.createElement("button");q.type="button";q.className="dmb";q.textContent=x;q.onclick=f;return q};
  const step=d=>{const R=roster(),i=R.findIndex(o=>o.i===D.sel);D.sel=R[(i+d+R.length)%R.length].i;ui();bigUi()};
  h.append(s,b("닫기",()=>{big.classList.remove("on");bc=null}));bc=document.createElement("canvas");const f=document.createElement("div");f.className="dmr";f.append(b("◀ 이전",()=>step(-1)),b("배경 바꾸기",()=>bgI=(bgI+1)%BG.length),b("다음 ▶",()=>step(1)));big.append(h,bc,f)}
/* 한 번의 공격을 반복: 대기 650 → 준비 230 → 공격 160 → 대기 360 (ms, 속도 단추를 따름) */
let clock=0,lastT=0;const phase=()=>{const p=clock%1400;return p<600?0:p<800?1:p<1000?2:p<1140?3:0};
function frame(c,im,k,x,y,z){const au=D.aura&&(SPR[TOWERS[D.sel].uid]||{}).aura;if(au){const A=c.globalAlpha,q0=SPR[TOWERS[D.sel].uid];if(q0.aura_rays){const tm=performance.now()/1000,sp=(m,w)=>{c.save();c.translate(x,y-z*232/512);c.rotate(w);c.drawImage(m,-z/2,-z*232/512,z,z);c.restore()};sp(q0.aura_rays,-tm*.16);sp(au,tm*.22)}else{c.globalAlpha=.5+.1*(TOWERS[D.sel].grade-4);c.drawImage(au,x-z/2,y-z*232/256,z,z);c.globalAlpha=A}}c.drawImage(im,k*im.naturalWidth/4,0,im.naturalWidth/4,im.naturalHeight,x-z/2,y-z*232/256,z,z);const q=SPR[TOWERS[D.sel].uid]||{};if(k===2&&q.swing)c.drawImage(q.swing,x-z/2,y-z*232/256,z,z)}
function draw(cn,bigMode){
  const w=cn.clientWidth,h=cn.clientHeight;if(!w||!h)return;const q=Math.min(3,devicePixelRatio||1);if(cn.width!==Math.round(w*q)||cn.height!==Math.round(h*q)){cn.width=Math.round(w*q);cn.height=Math.round(h*q)}
  const c=cn.getContext("2d"),t=TOWERS[D.sel],im=(SPR[t.uid]||{}).pose,hit=(SPR[t.uid]||{}).hit;c.setTransform(q,0,0,q,0,0);c.fillStyle=BG[bigMode?bgI:0];c.fillRect(0,0,w,h);if(!im)return;
  const dark=bigMode&&bgI!==1,lab=(s,x,y,z)=>{c.font=`700 ${z}px sans-serif`;c.textAlign="center";c.lineWidth=z*.28;c.lineJoin="round";c.strokeStyle="rgba(20,28,66,.85)";c.strokeText(s,x,y);c.fillStyle="#fff";c.fillText(s,x,y)};
  const k=phase();
  if(bigMode){const z=Math.min(w*.86,h*.6);frame(c,im,k,w/2,h*.56,z);const P=POSE[t.uid],sh=SPR[t.uid].shot;if(k===2&&sh&&P.mz){const e=clock%1400-800,u=Math.min(1,e/120),X=w/2+(P.mz[0]/256-.5)*z,Y=h*.56+(P.mz[1]-232)/256*z,g=z*.5,x=X+u*w*.1;if(u<1)c.drawImage(sh,x-g*320/384,Y-g/2,g,g);else if(hit)c.drawImage(hit,Math.min(w-g,x-g/2+g*.3),Y-g/2,g,g)}
    const s=Math.min(w/4,h*.3);for(let i=0;i<4;i++){const x=w*(i+.5)/4;frame(c,im,i,x,h-26,s);lab(PN[i],x,h-8,13)}}
  else{const s=Math.min(h*1.0,w/5);frame(c,im,k,w/10,h-18,s);lab("반복",w/10,h-5,11);for(let i=0;i<4;i++){const x=w*(i+1.5)/5;frame(c,im,i,x,h-18,s);lab(PN[i],x,h-5,11)}}}
(function raf(now){if(D.on&&S){clock+=Math.min(60,now-lastT)*speed;S.mons.forEach(m=>{m.hp=m.maxhp});if(!D.tags)S.fx=S.fx.filter(f=>f.k!=="txt");if(cvs)draw(cvs,false);if(bc)draw(bc,true)}lastT=now;requestAnimationFrame(raf)})(0);
/* 시험판은 열자마자 디자인 확인 화면. 일반 게임도 8명을 미리 세워 둔다 */
(function wait(){if(!Object.keys(ICON0).length||!roster().every(t=>(SPR[t.uid]||{}).pose))return setTimeout(wait,150);if(document.body.classList.contains("atHome"))enter()})();
const _start=start;start=d=>{_start(d);if(S&&!D.on&&!D.entering){place();S.cd=240}};
/* 홈 단추 */
const hb=document.createElement("button");hb.type="button";hb.id="dmOpen";hb.textContent="디자인 확인";hb.style.cssText="display:block;margin:10px auto 0;padding:10px 22px;border-radius:14px;border:2px solid #fff;background:#243D83;color:#fff;font:800 15px sans-serif;cursor:pointer";hb.onclick=enter;document.querySelector("#startOv .homeLow").append(hb);
})();
