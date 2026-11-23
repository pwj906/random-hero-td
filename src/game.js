"use strict";
// ---------- board: 6x9 cells (1 cell = 2x2 tiles = 64 world px). outer ring of cells is the path,
// inner 4x7 cells are character slots. monsters enter at the top-left corner and run clockwise.
const COLS=12, WT=32, CELL=64; let ROWS=18;
const ART=window.ART||{},A=p=>ART[p]||p; // the claude.ai copy carries some images inline (file count limit)
const CRATE_STRIP=0; // (the supply crate is a corner button now, no extra room needed)
const GRID=[],RECTS=[],PATH=[],SEG=[],SLOTS=[];let PATHLEN=0,SPEED_K=1;
function buildBoard(){
  GRID.length=0;for(let y=0;y<ROWS;y++)GRID.push(y<2||y>=ROWS-2?"#".repeat(COLS):"##"+"P".repeat(COLS-4)+"##");
  RECTS.length=0;RECTS.push([2,2,COLS-4,ROWS-4]);
  const rp=[[1,1],[COLS-1,1],[COLS-1,ROWS-1],[1,ROWS-1],[1,1.5]];/* no exit gate: monsters walk back into the entrance cave */PATH.length=0;for(const p of rp)PATH.push([p[0]*WT,p[1]*WT]);
  SEG.length=0;PATHLEN=0;for(let i=0;i<PATH.length-1;i++){const a=PATH[i],b=PATH[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);SEG.push({a,b,l,s:PATHLEN});PATHLEN+=l}
  SPEED_K=0.43; // tuned by bot simulation to match the original early-game difficulty
  SLOTS.length=0;for(const[x,y,w,h]of RECTS)for(let sy=y;sy<y+h;sy+=2)for(let sx=x;sx<x+w;sx+=2)SLOTS.push({x:(sx+1)*WT,y:(sy+1)*WT,tower:null});
}
buildBoard();
function pathAt(d){for(const s of SEG){if(d<=s.s+s.l){const f=(d-s.s)/s.l;return[s.a[0]+(s.b[0]-s.a[0])*f,s.a[1]+(s.b[1]-s.a[1])*f,Math.atan2(s.b[1]-s.a[1],s.b[0]-s.a[0])]}}const e=PATH[PATH.length-1];return[e[0],e[1],Math.PI/2]}

// ---------- rules ----------
const MON_NAMES=["들쥐", "붕대병", "좀비", "뿔소", "사냥개", "장갑차", "일꾼 로봇", "그림자 검객", "새끼 벌레", "거대 풍선벌레", "수송선", "털북숭이", "수호 비행선", "여왕벌", "일벌", "거대 집게벌레", "암살자", "정찰 드론", "자폭벌", "거대 전함", "연구선", "화물선", "들소", "탐사선", "장수풍뎅이", "마녀벌", "산호새", "황금 기사", "에이스 전투기", "거대 굴착기", "지옥 전투기", "지옥 전투기", "지옥 전투기", "지옥 전투기", "지옥 전투기", "지옥 전투기", "지옥 전투기", "지옥 전투기", "지옥 전투기", "지옥 모함"];WAVES.forEach((w,i)=>w.name=MON_NAMES[i]);
const WAVE_SPR=["m_rat", "m_zombie", "m_zombie", "m_bull", "m_hound", "m_wagon", "m_robot", "m_assassin", "m_bug", "b_balloon", "m_snow_bunny", "m_yeti", "m_ice_wolf", "m_queen", "m_frost_bat", "m_snow_golem", "m_beetle", "m_airship", "m_ice_wolf", "b_battleship", "m_scorpion", "m_wagon", "m_mummy", "m_cactus", "m_bull", "m_sandworm", "m_bird", "m_knight", "m_scorpion", "b_driller", "m_imp", "m_skeleton_knight", "m_fire_spirit", "m_hellhound", "m_demon_mage", "m_shadow_bat", "m_lava_golem", "m_fighter", "m_skeleton_knight", "b_hell_carrier"];
const MON_TITLE={"m_bird": "산호새", "m_wagon": "장갑 수레", "m_bug": "벌레", "m_rat": "들쥐", "q_steel_knight": "강철 기사", "m_airship": "비행선", "b_balloon": "거대 풍선벌레", "m_assassin": "그림자 암살자", "b_battleship": "거대 전함", "m_queen": "여왕벌", "b_hell_carrier": "지옥 모함", "m_knight": "황금 기사", "b_driller": "거대 굴착기", "m_zombie": "좀비", "b_endless": "혼돈의 황제", "m_hound": "사냥개", "m_fighter": "지옥 전투기", "m_bull": "뿔소", "q_dino": "공룡", "q_flyer": "거대 비행체", "m_beetle": "딱정벌레", "m_robot": "고철 로봇", "m_yeti": "털북숭이", "m_ice_wolf": "얼음 늑대", "m_sandworm": "모래 벌레", "m_imp": "임프", "m_hellhound": "지옥견", "m_skeleton_knight": "해골 기사", "m_demon_mage": "악마 마법사", "m_shadow_bat": "그림자 박쥐", "m_mummy": "미라", "m_cactus": "선인장 괴물", "m_snow_golem": "눈사람 골렘", "m_lava_golem": "용암 골렘", "m_frost_bat": "서리 박쥐", "m_fire_spirit": "불 정령", "m_scorpion": "전갈", "m_snow_bunny": "눈토끼 떼", "m_sky_ship": "구름 해적선", "b_ice_titan": "얼음 거인", "m_griffin": "그리핀", "m_frogman": "개구리 전사", "b_mushroom_king": "버섯 왕", "m_harpy": "하피", "m_angel_knight": "타락 천사 기사", "b_storm_dragon": "폭풍 용", "m_mammoth": "매머드", "m_penguin_raider": "폭주 펭귄", "m_ice_crab": "빙하 게", "m_slime": "늪 슬라임", "m_frost_wraith": "서리 망령", "m_mushroom": "독버섯 돌이", "m_cloud_sprite": "구름 요정", "m_swamp_troll": "늪 트롤", "m_void_eye": "눈알 박쥐", "m_mech_walker": "보행 기계", "m_tank": "미니 전차", "m_drone": "공장 드론", "m_chaos_hound": "혼돈견", "b_chaos_lord": "혼돈의 군주", "m_crab_knight": "게 기사", "m_star_jelly": "별빛 해파리", "b_mega_factory": "거대 공장 로봇", "m_sea_serpent": "바다뱀", "b_kraken": "크라켄", "m_jellyfish": "해파리", "m_spider_bot": "거미 로봇", "m_rift_knight": "차원 기사", "m_piranha": "피라냐 떼", "m_void_titan": "공허 거인"};
const MON_SIZE={"m_bird": 1, "m_wagon": 3, "m_bug": 1, "m_rat": 1, "q_steel_knight": 1, "m_airship": 3, "b_balloon": 3, "m_assassin": 1, "b_battleship": 3, "m_queen": 2, "b_hell_carrier": 3, "m_knight": 1, "b_driller": 3, "m_zombie": 1, "b_endless": 3, "m_hound": 1, "m_fighter": 2, "m_bull": 3, "q_dino": 1, "q_flyer": 3, "m_beetle": 3, "m_robot": 1, "m_yeti": 1, "m_ice_wolf": 1, "m_sandworm": 3, "m_imp": 1, "m_hellhound": 2, "m_skeleton_knight": 1, "m_demon_mage": 2, "m_shadow_bat": 1, "m_mummy": 1, "m_cactus": 2, "m_snow_golem": 3, "m_lava_golem": 3, "m_frost_bat": 1, "m_fire_spirit": 1, "m_scorpion": 2, "m_snow_bunny": 1, "m_sky_ship": 3, "b_ice_titan": 3, "m_griffin": 2, "m_frogman": 2, "b_mushroom_king": 3, "m_harpy": 1, "m_angel_knight": 1, "b_storm_dragon": 3, "m_mammoth": 3, "m_penguin_raider": 1, "m_ice_crab": 2, "m_slime": 1, "m_frost_wraith": 1, "m_mushroom": 1, "m_cloud_sprite": 1, "m_swamp_troll": 3, "m_void_eye": 1, "m_mech_walker": 3, "m_tank": 2, "m_drone": 1, "m_chaos_hound": 2, "b_chaos_lord": 3, "m_crab_knight": 2, "m_star_jelly": 1, "b_mega_factory": 3, "m_sea_serpent": 3, "b_kraken": 3, "m_jellyfish": 1, "m_spider_bot": 1, "m_rift_knight": 2, "m_piranha": 1, "m_void_titan": 3};
WAVES.forEach((w,i)=>{w.spr=WAVE_SPR[i];w.name=MON_TITLE[w.spr];if(!w.boss)w.size=MON_SIZE[w.spr]||w.size});["공룡","강철 기사","거대 비행체"].forEach((n,i)=>MISSIONS[i].name=n);["q_dino","q_steel_knight","q_flyer"].forEach((k,i)=>MISSIONS[i].spr=k);
const GRADE=["견습","숙련","정예","영웅","전설","신"];
const GCOL=["#aab7c0","#428dff","#9b4dff","#ff573d","#ffd34f","#ff5cc8"];
const SELL=[50,100,200,400,0,0];
// upgrades: one line per role (사격·저격·범위·근접·마법), five characters each
const UPG_ICON={Single:"single",Shot:"gun",Sniper:"sniper",Area:"area",Melee:"sword",Magic:"magic"};
const UPG_DESC={Shot:"공격력 올리기",Sniper:"공격력 올리기",Area:"공격력 올리기",Melee:"공격력 올리기",Magic:"공격력 + 특수효과(버프·저주·둔화) 5%씩"};
const UPG_COL={Single:"#18A7B5",Shot:"#3D8BFF",Sniper:"#8B5CF6",Area:"#FFA62B",Melee:"#FF5A5F",Magic:"#2BC48A"};
const UPGS=[["Melee","근접"],["Shot","사격"],["Sniper","저격"]];
// second kind of upgrade, by attack type. each covers ~15 of the 30 characters (1.5x a line), so a level is weaker
const UPGS_T=[["Single","단발"],["Area","범위"]];const UPG_LINE_K=.10,UPG_TYPE_K=.07;
const UPG_K=1.5;const upgCost=lv=>Math.round(UPG_K*(7+lv));
// monster size no longer changes damage (the StarCraft concussive/explosive table was too hard to read)
const MULT={Normal:[1,1,1,1],Ignore_Armor:[1,1,1,1],Concussive:[1,1,1,1],Explosive:[1,1,1,1],Independent:[1,1,1,1]};
const MISSION_CD=7600; // 3800 trigger cycles
const HEAD={"대검타워":"blade","독침 타워":"spike","레이저 타워":"laser","바이클 타워":"grenade","스카웃 타워":"twin","캐논 타워":"cannon","표창 타워":"glaive","피스톨 타워":"rifle","EMP 타워":"orb","대포 타워":"mortar","블레이드 타워":"blade","빔 타워":"prism","쇼크 타워":"shock","스나이퍼 타워":"sniper","포이즌 타워":"venom","폭발 타워":"mortar","고철 타워":"gatling","광폭 타워":"cannon","맹독 타워":"venom","블러드 타워":"orb","빔소드 타워":"laser","촉수 타워":"tentacle","포토캐논 타워":"cannon","광자포 타워":"cannon","플레임 타워":"flame","학살 타워":"blade","저격 타워":"sniper","불릿 타워":"gatling","폭격 타워":"missile","미사일 타워":"missile","니들 타워":"spike","복 주머니":"bag","폭풍 타워":"shock","거인 타워":"hangar","래피드 타워":"gatling","핵 타워":"orb","수리검 타워":"glaive","야마토 타워":"cannon","여왕 타워":"crown","유령 타워":"sniper","지옥불 타워":"flame"};
const RENAME={"55": "그림자 닌자왕", "2": "쇠공 투척병", "70": "쌍권총잡이", "0": "화승총병", "16": "번개 마법사", "30": "박격포 사수", "61": "광선검 기사", "88": "광선 마법사", "68": "해머 전사", "1": "저격수", "46": "독가스 분사병", "32": "폭파 전문가", "3": "기관총 사수", "71": "공성포 기사", "62": "산성 연금술사", "52": "맹독 마녀", "21": "레이저 기사", "78": "에너지탄 사수", "10": "화염방사 특공대", "54": "쌍검 검성", "44": "대물 저격 명사수", "20": "개틀링 거한", "58": "로켓 포격대장", "76": "미사일 대장", "53": "작살 명사냥꾼", "81": "폭탄 도깨비", "67": "폭풍 현자", "82": "양봉 군주", "19": "미니건 전쟁신", "79": "불마법사", "100": "거포 대장군", "51": "용인 광전사", "99": "망령 저격왕", "103": "용암 창술왕", "39": "대검 병사", "38": "독침 사냥꾼", "8": "활잡이", "66": "나무 대포병", "43": "표창수", "104": "철퇴 기사"};
// ---------- roster v6: 4 roles x 5 grades = 20 characters (the other 15 original towers stay in data, unused) ----------
TOWERS.push(
  {uid:201,name:"견습 마법사",grade:0,weapon:"Aura",dmg:22,bonus:4,cd:18,range:48,splash:[0,0,0],exp:"Normal",dtype:"Normal",factor:1,noRescale:true,aura:{r:1,spd:.15}},
  {uid:202,name:"석궁수",grade:1,weapon:"Crossbow",dmg:62,bonus:9,cd:12,range:160,splash:[0,0,0],exp:"Normal",dtype:"Normal",factor:1,noRescale:true},
  {uid:203,name:"시간의 대마법사",grade:4,weapon:"Aura",dmg:350,bonus:45,cd:18,range:48,splash:[0,0,0],exp:"Normal",dtype:"Normal",factor:1,noRescale:true,aura:{r:99,spd:.1,slowAll:.08}});
// roster v6: 3 upgrade lines (근접·사격·저격); every grade has a single-target and an area character in each line = 6 per grade, 30 total
TOWERS.push(
  {uid:204,name:"권투 소년",grade:0,weapon:"Fists",dmg:40,bonus:7,cd:12,range:48,splash:[0,0,0],exp:"Normal",dtype:"Normal",factor:1,noRescale:true},
  {uid:205,name:"회오리 도끼 전사",grade:3,weapon:"Whirl_Axe",dmg:300,bonus:40,cd:24,range:48,splash:[20,40,60],exp:"Normal",dtype:"Normal",factor:1,noRescale:true});
TOWERS.push( // 신 grade (5): two legends merge into a random god. all six slots filled.
  {uid:301,name:"총신",grade:5,weapon:"God_Guns",dmg:1,bonus:0,cd:8,range:48,splash:[0,0,0],exp:"Normal",dtype:"Normal",factor:1,noRescale:true},
  {uid:302,name:"궁신",grade:5,weapon:"God_Bow",dmg:1,bonus:0,cd:24,range:48,splash:[0,0,0],exp:"Normal",dtype:"Normal",factor:1,noRescale:true},
  {uid:303,name:"태양신",grade:5,weapon:"Sun",dmg:1,bonus:0,cd:24,range:48,splash:[16,32,48],exp:"Normal",dtype:"Normal",factor:1,noRescale:true},
  {uid:304,name:"검신",grade:5,weapon:"God_Sword",dmg:1,bonus:0,cd:18,range:48,splash:[24,44,64],exp:"Normal",dtype:"Normal",factor:1,noRescale:true},
  {uid:305,name:"권신",grade:5,weapon:"God_Fist",dmg:1,bonus:0,cd:12,range:48,splash:[0,0,0],exp:"Normal",dtype:"Normal",factor:1,noRescale:true},
  {uid:306,name:"창신",grade:5,weapon:"God_Spear",dmg:1,bonus:0,cd:30,range:48,splash:[16,32,48],exp:"Normal",dtype:"Normal",factor:1,noRescale:true});
const ROLE={305:"Melee",306:"Sniper",301:"Shot",302:"Sniper",303:"Shot",304:"Melee",204:"Melee",39:"Melee",61:"Melee",68:"Melee",104:"Melee",10:"Melee",54:"Melee",205:"Melee",51:"Melee",103:"Melee",
  70:"Shot",43:"Shot",202:"Shot",32:"Shot",3:"Shot",52:"Shot",20:"Shot",58:"Shot",19:"Shot",79:"Shot",
  0:"Sniper",66:"Sniper",1:"Sniper",30:"Sniper",21:"Sniper",71:"Sniper",44:"Sniper",76:"Sniper",99:"Sniper",100:"Sniper"};
const TIER={305:1,306:4,301:3,302:4,303:3,304:1,204:1,39:1,61:1,68:1,104:1,10:1,54:1,205:1,51:1,103:1, 70:2,43:2,202:3,32:2,3:3,52:2,20:3,58:3,19:3,79:3,
  0:4,66:4,1:4,30:4,21:4,71:4,44:4,76:4,99:4,100:4};
TOWERS.forEach(t=>{t.off=!ROLE[t.uid];
  if(t.uid===39)t.splash=[16,32,48];   // greatsword sweeps around the target
  if(t.uid===68)t.splash=[20,40,60];   // hammer shockwave
  if(t.uid===66)t.splash=[8,16,28];    // wooden cannon
  if(t.uid===71)t.splash=[10,25,40];   // siege cannon
  if(t.uid===76)t.splash=[10,25,40];   // missiles
  if(t.uid===100)t.splash=[15,35,55]});// giant cannon
const pick=a=>a[Math.floor(Math.random()*a.length)];
TOWERS.forEach((t,i)=>{t.i=i;t.head=HEAD[t.name]||"rifle";t.hue=(i*47+20)%360;t.name=(t.uid===79?"화염 군주":t.uid===44?"철갑탄 명사수":RENAME[t.uid]||t.name).replace("대검타워","대검 타워");t.short=t.name.replace(" 타워","").replace("타워","")});
// ---------- range in whole cells (square, like the board) ----------
// a character hits monsters inside the (2N+1)x(2N+1) cell square around it.
// tiers follow the weapon: melee 1, short (pistol/throw/flame) 2, rifle/bow 3, sniper/artillery 4.
// attack speed is rescaled so each character's best slots deal the same total as with its original circular range
// (speed, not damage, so armor still works like the original).
// weapon-fit pass: reach follows the weapon in the picture.
// throw/spray = 2, mortar & siege cannon = 4 (long indirect/heavy guns), mages that cast at a spot = 3+
const RANGE_OVERRIDE={2:2,46:2,10:2,32:2,62:2,30:4,71:4,81:3,67:3,79:3};
// missiles explode: give the missile captain a small blast (it was single-target)
const MELEE_UIDS=new Set([204,39,61,68,104,10,54,205,51,103]);
function tierOf(t){if(ROLE[t.uid]==="Shot")return 2; // every 사격 character reaches 2 cells
  if(TIER[t.uid])return TIER[t.uid];if(MELEE_UIDS.has(t.uid))return 1;if(RANGE_OVERRIDE[t.uid])return RANGE_OVERRIDE[t.uid];return t.range<=128?2:t.range<=192?3:4}
function inSquare(N,dx,dy,pad){const h=(N+.5)*CELL+(pad||0);return Math.abs(dx)<=h&&Math.abs(dy)<=h}
(function rescale(){
  const pts=[];for(let d=0;d<PATHLEN;d+=4)pts.push(pathAt(d));
  const top8=f=>{const v=SLOTS.map(sl=>pts.reduce((a,p)=>a+(f(p[0]-sl.x,p[1]-sl.y)?1:0),0)).sort((a,b)=>b-a);return v.slice(0,8).reduce((a,b)=>a+b,0)||1};
  const sq={};for(let N=1;N<=4;N++)sq[N]=top8((dx,dy)=>inSquare(N,dx,dy));
  const circ={};
  TOWERS.forEach(t=>{const N=tierOf(t);if(t.noRescale){t.rt=N;t.range=(N+.5)*CELL-16;t.upg=ROLE[t.uid]||"Shot";return}const r=t.range+24;const c=circ[r]||(circ[r]=top8((dx,dy)=>dx*dx+dy*dy<=r*r));
    const m=c/sq[N];t.rt=N;t.melee=N===1&&MELEE_UIDS.has(t.uid);t.cd=Math.max(4,Math.round(t.cd/m));t.range=(N+.5)*CELL-16;
    t.upg=ROLE[t.uid]||"Shot"});
})();
// tempo fixes (same damage per second, different rhythm): x<1 = faster & lighter hits, x>1 = slower & heavier
// gatling/minigun spin fast, shuriken & bow fire quicker, the spiked flail and the giant cannon hit slow and hard
const TEMPO={20:.5,19:.5,43:.5,8:.6,104:2,100:3,30:.7,71:.6,67:.7}; // mortar/siege/storm got slow from their longer reach
TOWERS.forEach(t=>{const f=TEMPO[t.uid];if(!f)return;t.cd=Math.max(3,Math.round(t.cd*f));t.dmg=Math.round(t.dmg*f);t.bonus=Math.round(t.bonus*f)});
// role balance (tuned with bench2: real waves, base board leaking ~50%, value = leaked HP removed by one more character).
// goal: the five roles of a grade are about equal, and each grade is about twice the one below.
var TUNE={0:2.5,66:1.2,30:4.5,1:1.3,202:.9,61:.85,3:2.6,21:1.7,10:1.7,104:1.17,52:.8,20:1.8,44:1.6,58:.6,82:12.5,99:8,79:1.1,51:.9};
TOWERS.forEach(t=>{const f=TUNE[t.uid];if(!f)return;t.dmg=Math.round(t.dmg*f);t.bonus=Math.round(t.bonus*f)});
// v6 roster pass (bench2, 6 characters per grade)
var TUNE2={39:.75,204:.8,43:1.35,0:1.15,66:2.5, 61:.8,68:.65,32:2.8,1:1.1,30:1.35, 104:.85,10:.5,3:1.15,52:1.7,21:1.1,71:3.5,
  54:.9,205:1.7,58:.9,76:3.5, 51:.92,103:.8,19:2.2,100:1.8};
TOWERS.forEach(t=>{const f=TUNE2[t.uid];if(!f)return;t.dmg=Math.round(t.dmg*f);t.bonus=Math.round(t.bonus*f)});
// ---------- damage rule: DPS (damage x attack speed) is set by grade x role. closer = stronger ----------
// singles: 근접 1.0, 사격 0.8, 저격 0.62 / area: 근접 0.7, 사격 0.55, 저격 0.45 (area hits several, so lower per hit)
// grade base = 근접 단발 DPS at upgrade level 3; each grade ~2.4x the one below, god ~3x legend
const DPS_BASE=[100,240,520,1250,3000,9000];
const DPS_ROLE={Melee:[1,.7],Shot:[.8,.55],Sniper:[.62,.45]};
const AREA_SPLASH={Melee:[40,72,104],Shot:[32,60,88],Sniper:[32,60,88]};
const AREA_HIT={Melee:2.1,Shot:1.73,Sniper:1.73}; // the wider blast hits ~2x more monsters, so each hit is lighter (area total ~10% up) // wide enough that a blast usually catches several monsters
TOWERS.forEach(t=>{if(t.off||!ROLE[t.uid])return;
  const area=t.splash[2]>0||t.weapon.startsWith("Glave")||t.weapon==="Subterranean_Spines";t.area=area;
  if(area&&t.splash[2]>0)t.splash=AREA_SPLASH[ROLE[t.uid]].slice();
  const want=DPS_BASE[t.grade]*DPS_ROLE[ROLE[t.uid]][area?1:0]/(area&&t.splash[2]>0&&t.weapon!=="Subterranean_Spines"?AREA_HIT[ROLE[t.uid]]:1);
  const per=(t.factor||1)*(t.shots||1)/(t.cd/24);   // DPS per point of (dmg + 3 bonus)
  const hit=want/per;const share=t.bonus/(t.dmg+3*t.bonus||1)||.12;
  t.bonus=Math.max(0,Math.round(hit*share));t.dmg=Math.max(1,Math.round(hit-3*t.bonus))});
// area attacks hit at most this many enemies (closest to the impact first), so the card can say "N명"
// v7 per-hero pass (bench3: real waves, each hero added to a board that leaks half) - pull outliers to their grade median
const HERO_K={44:1.12,305:1.15,202:.76,1:.88,3:.79,52:1.19,54:1.45,58:.8,20:.88,51:1.15,79:.87,303:.81,301:.85};
TOWERS.forEach(t=>{const f=HERO_K[t.uid];if(!f)return;t.dmg=Math.max(1,Math.round(t.dmg*f));t.bonus=Math.round(t.bonus*f)});
const MAX_HIT=[3,3,4,5,6,8];
TOWERS.forEach(t=>{t.maxHit=t.area?MAX_HIT[t.grade]:1});
const byGrade=g=>TOWERS.filter(t=>t.grade===g&&!t.off);
const UID=uid=>TOWERS.findIndex(t=>t.uid===uid);

// ---------- state ----------
let S;
function fresh(diff){
  SLOTS.forEach(s=>s.tower=null);
  return {diff,ore:500,gas:0,gSlow:0,life:30,kills:0,frame:0,wi:0,phase:"prep",cd:Math.round(50*24*PREP_K),spawnLeft:0,spawnT:0,
    upg:{...Object.fromEntries(UPGS.map(u=>[u[0],3])),Single:0,Area:0},towers:[],mons:[],fx:[],proj:[],picks:[],
    tok:{boss:0,rare:0,unique:0,epic:0},mis:[0,0,0],ach:{},sel:null,over:false,nextId:1,aug:[],augPending:false,augOffer:null,freeTix:0,allIn:1,props:null};
}
let speed=1,paused=false,running=false;

// ---------- helpers ----------
const $=id=>document.getElementById(id);
let lastToast="",lastToastT=0;function toast(msg,cls){const now=Date.now();if(msg===lastToast&&now-lastToastT<2500)return;lastToast=msg;lastToastT=now;const T=$("toast");const p=document.createElement("p");p.textContent=msg;if(cls)p.className=cls;T.appendChild(p);while(T.children.length>3)T.firstChild.remove();setTimeout(()=>p.remove(),2500)}
function log(msg,cls){if(cls==="good"||cls==="warn")toast(msg,cls);const p=document.createElement("p");p.textContent=msg;if(cls)p.className=cls;const L=$("log");L.appendChild(p);while(L.children.length>80)L.firstChild.remove();L.scrollTop=L.scrollHeight}
let bannerT=0;function banner(t,col){const b=$("banner");let img="",txt=t;const mg=/^신 강림 · (.+)/.exec(t),mw=/WAVE (\d+)/.exec(t),mc=/(\d+)라운드 클리어/.exec(t);
  if(mg){img="god";txt=mg[1]}else if(mw){img=/BOSS/.test(t)?"boss":/HELL/.test(t)?"hell":"wave";txt=+mw[1]>40?mw[1]:mw[1]+" / 40"}else if(mc){img="clear";txt=mc[1]+"라운드"}
  b.innerHTML=(img?`<img alt="" src="ui/banners/banner_${img}.png">`:"")+`<span></span>`;b.querySelector("span").textContent=txt;b.classList.toggle("img",!!img);b.style.color=col||"var(--fg)";b.classList.add("show");clearTimeout(bannerT);bannerT=setTimeout(()=>b.classList.remove("show"),1800)}
function fmt(n){n=Math.round(n);return n>=1e6?(n/1e6).toFixed(2)+"M":n>=1e4?(n/1e3).toFixed(1)+"k":String(n)}
function lvl(t){return S.upg[t.upg]??0}
// one hit: the base (line level 3) grows +10% per line level and +7% per attack-type level
const typeKey=t=>t.area?"Area":"Single";
function upgMul(t){if(!S)return 1;return (1+UPG_LINE_K*(lvl(t)-3))*(1+UPG_TYPE_K*(S.upg[typeKey(t)]||0))}
function hitDmg(t){return (t.dmg+3*t.bonus)*upgMul(t)}
// HP multiplier curve: [wave index (0-based), multiplier], linear in between
// tuned with 16-seed bot runs to the target play time at x3 speed: usual run ~5 min, lucky/strong run ~15 min.
// the 28-slot board can't grow as strong as the original's, so later waves are scaled down hard.
var HPC=[[0,.6],[10,1.8],[16,1.5],[20,1],[30,.9],[39,1]];
const PREP_K=0.8; // shorter breaks between waves (time only; combat unchanged)
const ease=i=>{for(let k=1;k<HPC.length;k++)if(i<=HPC[k][0]){const[a,x]=HPC[k-1],[b,y]=HPC[k];return x+(y-x)*(i-a)/(b-a)}return HPC[HPC.length-1][1]};
// smooth difficulty: each normal wave's effective HP (HP x speed) follows one curve, so no wave is a sudden wall.
// faster monsters get less HP; armor creeps up from wave 21 instead of jumping at 31
const SMOOTH=[[1,55],[5,620],[9,3200],[14,10500],[19,21000],[24,35000],[29,54000],[34,82000],[39,125000]];
function smoothE(w){for(let k=1;k<SMOOTH.length;k++)if(w<=SMOOTH[k][0]){const[a,x]=SMOOTH[k-1],[b,y]=SMOOTH[k];return x*Math.pow(y/x,(w-a)/(b-a))}return SMOOTH[SMOOTH.length-1][1]}
WAVES.forEach((w,i)=>{if(!w.boss)w.ar=i<20?0:Math.round((i-19)*5.5)});
function waveHP(i,def){if(!def.boss&&i<WAVES.length)return Math.round(smoothE(i+1)*4.5/def.spd);let hp=def.hp;if(i>=30&&i<=38)hp+=(i-30)*4000;return Math.round(hp*ease(i))}
function monR(m){return [0,8,12,16][m.size]||10}

// ---------- waves ----------
// ---------- endless mode: after the 40 original waves, new waves keep coming and grow ~12%/wave ----------
// normal waves reuse the wave 21~29 monsters; every 10th wave is a big boss (gives the boss reward)
const ENDLESS_POOL=[20,21,22,23,24,25,26,27,28];
// waves 41~100: six new maps, each with its own monsters and a boss on the 10th wave; after 100 the six maps repeat
const MAP_POOL=[["m_cloud_sprite","m_griffin","m_angel_knight","m_harpy","m_sky_ship"],["m_ice_crab","m_penguin_raider","m_frost_wraith","m_mammoth"],
  ["m_mushroom","m_slime","m_frogman","m_swamp_troll"],["m_piranha","m_jellyfish","m_crab_knight","m_sea_serpent"],
  ["m_drone","m_spider_bot","m_tank","m_mech_walker"],["m_void_eye","m_star_jelly","m_rift_knight","m_chaos_hound","m_void_titan"]];
const MAP_BOSS=["b_storm_dragon","b_ice_titan","b_mushroom_king","b_kraken","b_mega_factory","b_chaos_lord"];
const SIZE_SPD=[0,5,4.3,3.4];
function waveDef(i){
  if(i<WAVES.length)return WAVES[i];
  S.gen=S.gen||{};if(S.gen[i])return S.gen[i];
  const n=i-WAVES.length,boss=(i+1)%10===0,m=(Math.floor(i/10)-4)%6,j=i%10,base=WAVES[ENDLESS_POOL[n%ENDLESS_POOL.length]];
  const spr=boss?(i>=100?"b_endless":MAP_BOSS[m]):MAP_POOL[m][j%MAP_POOL[m].length],size=boss?3:MON_SIZE[spr]||2,spd=boss?2:SIZE_SPD[size];
  const d=Object.assign({},base,{idx:i,boss:boss?1:0,name:(boss?"보스 · ":"")+MON_TITLE[spr],
    hp:Math.round(125000*Math.pow(1.1,n+1)*4.5/spd*(boss?12:1)),ar:Math.min(250,110+3*n),sh:0,size,spd,spr});
  return S.gen[i]=d}
function startWave(){
  const def=waveDef(S.wi);S.phase="wave";themeLoad(themeOf(S.wi+5));if(themeOf(S.wi)!==themeI)setTheme(themeOf(S.wi),true);sfx(def.boss?"boss":"wave");bgmMode(def.boss?"boss":"calm");
  S.spawnLeft=def.boss?1:30;S.spawnT=0;
  banner((def.boss===2?"HELL BOSS · ":def.boss?"BOSS · ":S.wi>=30&&S.wi<40?"HELL MODE · ":"")+"WAVE "+(S.wi+1),def.boss?"var(--life)":"var(--fg)");
  log("Wave "+(S.wi+1)+" · "+def.name+" (HP "+fmt(waveHP(S.wi,def))+(def.ar?", 방어 "+def.ar:"")+")","hi");
}
function spawn(def,hp,kind){
  const p=pathAt(0);
  S.mons.push({id:S.nextId++,def,kind,hp,maxhp:hp,sh:def.sh,maxsh:def.sh,ar:def.ar,size:def.size,spd:def.spd,d:0,x:p[0],y:p[1],a:p[2],acid:0,acidT:0,hue:kind==="mission"?40:(S.wi*37)%360});
  augSpawn(S.mons[S.mons.length-1]);
}
function endWave(){
  const i=S.wi;let ore=250,cd=35;
  if(i===9){ore=450;cd=70}else if(i>=10&&i<=18)cd=40;else if(i===19){ore=450;cd=80}else if(i>=20&&i<=28)cd=45;else if(i===29)cd=100;else if(i>=30)cd=50;if(i>=40)cd=(i+1)%10===9?60:45;
  if(has("hunter"))ore=Math.round(ore*1.15);
  let extra="";if(has("interest")){const v=S.ore>=500?100:40;S.ore+=v;extra+=` · 이자 +${v}`}
  if(has("gem_mine")){S.gas+=15;extra+=" · 보석 +15"}if(has("free_ticket")&&(i+1)%3===0){S.freeTix=(S.freeTix||0)+1;extra+=" · 무료 복권 +1"}
  const gem=(i+1)%10===0?30:10;S.gas+=gem;extra=` · 보석 +${gem}`+extra;
  sfx("clear");bgmMode("calm");S.ore+=ore;S.fx.push({k:"txt",t:`+${ore} 골드`,x:COLS*WT/2,y:ROWS*WT*.42,c:"#ffd34f",sc:"#5a3a00",big:true,life:30,max:30});log("Wave "+(i+1)+" 종료 · 골드 +"+ore+extra+" · 준비 "+cd+"초","good");
  S.wi++;S.phase="prep";S.cd=Math.round(cd*24*PREP_K);
  if(S.wi%10===5)augOffer(); // waves 5, 15, 25…
}
function leak(m){
  m.dead=true;
  let pen=1,msg="목숨이 하나 줄었습니다.";
  if(m.kind==="mission"){pen=10;msg="도전 미션 실패! 목숨 -10"}
  else if(m.def.boss===2){pen=S.life;msg="보스전 실패! 목숨을 모두 잃었습니다."}
  else if(m.def.boss){pen=15;msg="보스전 실패! 목숨 -15"}
  S.life=Math.max(0,S.life-pen);log(msg,"warn");sfx("hurt");
  if(S.life<=0)finish(false);
}
function kill(m){
  if(m.dead)return;m.dead=true;S.kills++;sfx("pop");
  if(m.def.spr&&MSPR[m.def.spr]&&MSPR[m.def.spr].death)S.fx.push({k:"mdie",spr:m.def.spr,x:m.x,y:m.y,a:m.a,z:monR(m)*1.45*(MQ.matches?1.1:1)*(m.def.boss?1.6:1)*(m.kind==="mission"?1.4:1)*2.9*(m.def.boss?.78:1),life:8,max:8});
  else S.fx.push({k:"pop",x:m.x,y:m.y,r:monR(m)*1.6,c:`hsl(${m.hue} 80% 60%)`,life:12,max:12});
  if(m.kind==="mission"){S.ore+=m.def.reward;log("도전 미션 클리어! 골드 +"+m.def.reward,"good");return}
  if(m.def.boss===1){S.tok.boss++;const r=(m.def.idx!=null?m.def.idx:WAVES.indexOf(m.def))+1;banner(r+"라운드 클리어!","var(--ore)");showReward()}
  if(m.def.boss===2){S.tok.boss++;banner("무한 모드 시작!","var(--ore)");log("40웨이브 클리어! 이제부터 끝없는 웨이브가 몰려와요","good");showReward()}
}
function finish(win){
  if(S.over)return;S.over=true;running=false;sfx("over");S.sel=null;renderBubble();
  showResult();
  $("endTitle").textContent=win?"승리":"패배";$("endOv").style.backgroundImage=`url(ui/screens/bg_${win?"victory":"defeat"}.jpg)`;
  $("endText").textContent=win?`40라운드 클리어. ${S.kills}킬, 남은 목숨 ${S.life}.`:`Wave ${S.wi+1}에서 목숨을 모두 잃었습니다. ${S.kills}킬.`;
  $("endOv").hidden=false;
}

// ---------- combat ----------
function inRange(t,tw,m){return inSquare(rtOf(t),m.x-tw.x,m.y-tw.y,monR(m)*.5)}
function damage(m,raw,dt){
  if(m.dead||raw<=0)return;
  let d=raw;
  if(m.sh>0){if(d<=m.sh){m.sh-=d;return}d-=m.sh;m.sh=0}
  const ar=dt==="Ignore_Armor"||m.wardT>0?0:m.ar-m.acid;
  let v=(d-ar)*(MULT[dt]||MULT.Normal)[m.size];
  if(v<0.5)v=0.5;
  if(m.curseT>0)v*=1+(m.curseV||.15); // venom witch curse (grows with magic upgrades)
  v=augDamage(m,v);
  if(Math.random()<CRIT_P+(S.src&&has("snipe_range")&&ROLE[S.src.uid]==="Sniper"?.2:0)){v*=CRIT_X;critFx(m,v)}
  m.hp-=v;if(m.hp<=0)kill(m);else augAfterHit(m);
}
function splash(t,cx,cy,raw){
  const rk=has("area_count")?1.25:1,[si,sm,so]=t.splash.map(v=>v*rk);const hits=[];sfx("boom");
  for(const m of S.mons){if(m.dead)continue;const dd=Math.hypot(m.x-cx,m.y-cy)-monR(m)*.5;if(dd<=so)hits.push([dd,m])}
  hits.sort((a,b)=>a[0]-b[0]);
  for(const[dd,m]of hits.slice(0,mh(t))){const f=dd<=si?1:dd<=sm?.8:.6;damage(m,raw*f,t.dtype)}
}
function fire(tw,t,m,noFx){
  S.src=t;
  const raw=hitDmg(t)*t.factor*(tw.bPow||1);const col=FXCOL[t.uid]||GCOL[t.grade];
  if(t.weapon==="Subterranean_Spines"){ // lurker line
    const ang=Math.atan2(m.y-tw.y,m.x-tw.x),L=(rtOf(t)+.7)*CELL,ex=tw.x+Math.cos(ang)*L,ey=tw.y+Math.sin(ang)*L;
    const hs=[];for(const o of S.mons){if(o.dead)continue;const dist=segDist(o.x,o.y,tw.x,tw.y,ex,ey);if(dist<=20+monR(o))hs.push(o)}
    hs.sort((a,b)=>Math.hypot(a.x-tw.x,a.y-tw.y)-Math.hypot(b.x-tw.x,b.y-tw.y));for(const o of hs.slice(0,mh(t)))damage(o,raw,t.dtype)
    if(noFx)ANIM.lineFx(tw,t,ex,ey);else S.fx.push({k:"spine",x:tw.x,y:tw.y,x2:ex,y2:ey,c:col,life:10,max:10});return;
  }
  if(t.weapon.startsWith("Glave_Wurm")){ // bounces 1, 1/3, 1/9
    let cur=m,prev=tw,f=1;const hit=new Set();
    for(let b=0;b<mh(t)&&cur;b++){damage(cur,raw*f,t.dtype);hit.add(cur);S.fx.push({k:"bolt",x:prev.x,y:prev.y,x2:cur.x,y2:cur.y,c:col,w:3,life:8,max:8});
      prev=cur;f/=3;let best=null,bd=96*96;for(const o of S.mons){if(o.dead||hit.has(o))continue;const q=(o.x-prev.x)**2+(o.y-prev.y)**2;if(q<bd){bd=q;best=o}}cur=best}
    return;
  }
  const shots=t.shots||1;
  if(t.splash[2]>0){splash(t,m.x,m.y,raw*shots);if(!noFx)S.fx.push({k:"ring",x:m.x,y:m.y,r:t.splash[2]||24,c:col,life:12,max:12})}
  else{for(let k=0;k<shots;k++)damage(m,raw,t.dtype)}
  if(t.exp==="Corrosive_Acid"&&!m.dead){m.acid=Math.min(9,m.acid+1);m.acidT=240}
  if(noFx)return;
  const style=t.head==="blade"||t.head==="crown"||t.head==="tentacle"?"slash":t.head==="hangar"?"swarm":t.weapon==="Yamato_Gun"||t.head==="laser"||t.head==="prism"?"beam":"bolt";
  S.fx.push({k:style,x:tw.x,y:tw.y,x2:m.x,y2:m.y,c:col,w:t.grade>=3?4:2.5,life:style==="beam"?10:7,max:style==="beam"?10:7});
}
function segDist(px,py,ax,ay,bx,by){const vx=bx-ax,vy=by-ay,l=vx*vx+vy*vy;let f=((px-ax)*vx+(py-ay)*vy)/l;f=Math.max(0,Math.min(1,f));return Math.hypot(px-ax-vx*f,py-ay-vy*f)}

// aura buffs: every magic character's buff adds up (two apprentice mages = +24%), capped at +100% per kind;
// magic upgrades make each buff 5%/level stronger
function applyAuras(){
  S.gSlow=0;for(const tw of S.towers){tw.bSpd=1;tw.bPow=1}
  for(const a of S.towers){const t=TOWERS[a.type];if(!t.aura)continue;const k=1+.05*(lvl(t)-3);
    if(t.aura.slowAll)S.gSlow=Math.min(.5,S.gSlow+t.aura.slowAll*k);
    for(const b of S.towers){if(b===a||TOWERS[b.type].aura)continue;
      if(Math.max(Math.abs(b.x-a.x),Math.abs(b.y-a.y))>t.aura.r*CELL+1)continue;
      if(t.aura.spd)b.bSpd=Math.min(2,b.bSpd+t.aura.spd*k);if(t.aura.pow)b.bPow=Math.min(2,b.bPow+t.aura.pow*k)}}
  augAuras();
}
function tick(){
  S.frame++;
  if(S.phase==="prep"){if(--S.cd<=0)startWave()}
  else if(S.phase==="wave"){
    if(S.spawnLeft>0){if(--S.spawnT<=0){const def=waveDef(S.wi);spawn(def,waveHP(S.wi,def),"wave");S.spawnLeft--;S.spawnT=24}}
    else if(S.mons.length===0)endWave();
  }
  for(const m of S.mons){if(m.dead)continue;if(m.frozen>0){m.frozen--;continue}m.d+=m.spd*SPEED_K*(m.slowT>0?1-m.slowV:1)*(1-S.gSlow)*(S.aug.includes("time_warp")?.72:1);if(m.slowT>0)m.slowT--;if(m.curseT>0)m.curseT--;if(m.acidT>0&&--m.acidT===0)m.acid=0;
    if(m.d>=PATHLEN){leak(m);continue}const p=pathAt(m.d);m.x=p[0];m.y=p[1];m.a=p[2]}
  if(S.frame%6===0)applyAuras();
  crateTick();
  for(const tw of S.towers){const t=TOWERS[tw.type];
    if(t.aura&&(tw.acool=(tw.acool||1)-1)<=0){tw.acool=72;ANIM.impact(t,tw.x,tw.y,t.aura.r>9?7:(t.aura.r*2+1)*2/1.5)} // buff ring every 3s; magic also attacks
    let m=tw.target;if(!m||m.dead||!inRange(t,tw,m)){m=null;let best=-1;for(const o of S.mons){if(!o.dead&&o.d>best&&inRange(t,tw,o)){best=o.d;m=o}}tw.target=m}
    if(m){const want=Math.atan2(m.y-tw.y,m.x-tw.x);let da=((want-tw.ang+Math.PI*3)%(Math.PI*2))-Math.PI;tw.ang+=Math.max(-.35,Math.min(.35,da))}
    if(tw.atk!=null){tw.atk++;if(!tw.fired&&tw.atk>=tw.relAt){tw.fired=true;ANIM.release(tw,t)}if(tw.atk>=tw.atkDur)tw.atk=null}
    if(tw.cool>0){tw.cool--;continue}
    if(m){sfx("atk_"+(ROLE[t.uid]||"Shot"));if(ANIM.has(t)){tw.cool=t.cd/(tw.bSpd||1);tw.atkDur=Math.min(7.2,tw.cool);tw.relAt=tw.atkDur*3.5/6;tw.atk=0;tw.fired=false;tw.pend=m}else{fire(tw,t,m);tw.cool=t.cd/(tw.bSpd||1);tw.kick=4}}
  }
  augTick();ANIM.stepProj();
  if(S.mons.some(m=>m.dead))S.mons=S.mons.filter(m=>!m.dead);
  for(const f of S.fx)f.life--;S.fx=S.fx.filter(f=>f.life>0);
  for(const tw of S.towers)if(tw.kick>0)tw.kick--;
}

// ---------- player actions ----------
function addTower(slot,type,msg){
  const tw={id:S.nextId++,type,slot,x:slot.x,y:slot.y,ang:-Math.PI/2,cool:0,target:null,kick:0,born:S.frame};
  slot.tower=tw;S.towers.push(tw);const t=TOWERS[type];
  if(msg!==false)log(`[${GRADE[t.grade]}] ${t.name} 건설`,t.grade>=3?"hi":"");
  if(t.grade>=5){banner(`신 강림 · ${t.name}`,GCOL[5]);const f=document.createElement("div");f.className="miracleFx";document.body.appendChild(f);setTimeout(()=>f.remove(),1600)}
  else if(t.grade>=3)banner(`${GRADE[t.grade]} · ${t.name}`,GCOL[t.grade]);
  S.fx.push({k:"pop",x:slot.x,y:slot.y,r:40,c:GCOL[t.grade],life:14,max:14});
  sfx(t.grade>=5?"god":t.grade>=3?"rare":"build");
  return tw;
}
// melee reach is 1 cell, so a melee character in the middle of the board hits nothing:
// new melee characters step out to a slot beside the road (empty first, otherwise swap with a ranged one)
const edgeSlot=sl=>sl.x<=96||sl.y<=96||sl.x>=COLS*WT-96||sl.y>=ROWS*WT-96;
function meleeToEdge(tw){
  const d=sl=>Math.hypot(sl.x-tw.x,sl.y-tw.y),edges=SLOTS.filter(edgeSlot).sort((a,b)=>d(a)-d(b));
  const to=edges.find(sl=>!sl.tower)||edges.find(sl=>sl.tower&&ROLE[TOWERS[sl.tower.type].uid]!=="Melee");
  if(to)moveTower(tw,to)}
function removeTower(tw){tw.slot.tower=null;S.towers=S.towers.filter(o=>o!==tw);if(S.sel===tw)S.sel=null}
function build(slot){
  if(!running||slot.tower)return;
  if(S.ore<100){log("골드가 부족합니다 (건설 100).","warn");return}
  S.ore-=100;
  const type=S.picks.length?S.picks.shift():pick(byGrade(has("summon_bless")&&Math.random()<.1?1:0)).i;
  addTower(slot,type);renderPanels(); // a new character is not auto-selected
}
function merge(tw,quiet,noSel){
  const t=TOWERS[tw.type];
  const partner=S.towers.filter(o=>o!==tw&&o.type===tw.type).sort((a,b)=>(a.conc||0)-(b.conc||0)||a.born-b.born)[0];
  if(!partner){log("같은 캐릭터가 하나 더 필요해요","warn");return}
  // gods concentrate instead: the two become one, keeping both powers. ★ shows how many gods are inside (★3 = 3 gods = attack x3)
  if(t.grade>=5){tw.conc=(tw.conc||0)+(partner.conc||0)+1;removeTower(partner);sfx("merge");
    S.fx.push({k:"pop",x:tw.x,y:tw.y,r:48,c:GCOL[5],life:16,max:16});banner(`농축 ★${tw.conc+1} · ${t.name}`,GCOL[5]);applyAuras();S.sel=quiet||noSel?null:tw;renderPanels();return}
  sfx("merge");
  const done=line=>{
    const slot=tw.slot;if(!(has("recycle")&&Math.random()<.1))removeTower(partner);else log("재활용! 재료 1명이 남았어요","good");removeTower(tw);
    let g=t.grade+1;if(S.godCall&&t.grade===3){g=5;S.godCall=0}else if(has("double_up")&&t.grade+2<=4&&Math.random()<.06){g=t.grade+2;log("겹경사! 두 등급 위","good")}
    let pool=byGrade(g);if(line&&g<5){const f=pool.filter(o=>ROLE[o.uid]===line);if(f.length)pool=f}
    const nt=addTower(slot,pick(pool).i);S.sel=quiet||noSel?null:nt;renderPanels()};
  if(!quiet&&has("choose_line")&&t.grade<4&&!(S.godCall&&t.grade===3)&&!window.AUG_AUTO)askLine(done);else done(null);
}
function mergeablePairs(){const by={};for(const tw of S.towers){const t=TOWERS[tw.type];if(t.grade<=3)(by[tw.type]=by[tw.type]||[]).push(tw)}
  return Object.values(by).reduce((n,a)=>n+Math.floor(a.length/2),0)}
function mergeAll(){
  if(!running)return;const by={};for(const tw of S.towers){const t=TOWERS[tw.type];if(t.grade<=3)(by[tw.type]=by[tw.type]||[]).push(tw)}
  let n=0;const keep=S.sel;for(const list of Object.values(by)){list.sort((a,b)=>a.born-b.born);for(let i=0;i+1<list.length;i+=2){if(!S.towers.includes(list[i])||!S.towers.includes(list[i+1]))continue;merge(list[i],true);n++}}
  S.sel=null;if(n)log(`합성 ${n}번`,"good");renderPanels()}
const xCost=g=>50<<g; // 고물상: swap price doubles per grade (견습 50 ... 전설 800)
function exchange(tw){ // 고물상 augment: swap for a different character of the same grade
  const t=TOWERS[tw.type],c=xCost(t.grade);if(t.grade>=5||!has("junk"))return;if(S.ore<c){log(`골드가 부족해요 (교환 ${c})`,"warn");return}
  const opts=byGrade(t.grade).filter(o=>o.i!==t.i);if(!opts.length)return;S.ore-=c;const sl=tw.slot;removeTower(tw);S.sel=addTower(sl,pick(opts).i,false);sfx("coin");renderPanels()}
function sell(tw){
  const t=TOWERS[tw.type];if(t.grade>=4){log("전설은 팔 수 없어요","warn");return}
  const v=t.uid===81?1000:SELL[t.grade];removeTower(tw);S.ore+=v;
  log(`${t.name}을(를) 팔고 ${v}원을 얻었습니다.`);sfx("coin");renderPanels();
}
const isType=k=>k==="Single"||k==="Area";
const upgShown=k=>isType(k)?S.upg[k]:S.upg[k]-3;            // levels shown from 0
const upgCostOf=k=>upgPrice(upgShown(k)+3);
const upgStep=k=>isType(k)?UPG_TYPE_K:UPG_LINE_K;
function buyUpg(key){
  const lv=S.upg[key],cost=upgCostOf(key);
  if(S.gas<cost){log("보석이 부족해요","warn");return}
  if(lv>=255)return;S.gas-=cost;S.upg[key]++;sfx("up");renderPanels();
}
// ---------- lotto: a slot machine with real misses, prizes of many kinds and rare miracles ----------
// weights per 1000 draws. average payback is about the price (the old table: ~105 gems, never lost),
// but the spread is huge: 48% nothing, 0.6% a legend, 0.2% a miracle that wipes the field.
// tuned with bots that spend ~1/3 of their gold here: same median play time, much wider luck spread.
const LOTTO=[
  {k:"miss",w:783}, // ~60% miss
  {k:"gold",w:130,v:120},
  {k:"gem",w:220},
  {k:"char",w:90},
  {k:"big",w:50},
  {k:"hero",w:14},{k:"elite",w:10},
  {k:"legend",w:6},
  {k:"miracle",w:2}];
const PITY=4; // after 4 misses in a row the next draw always wins something
let lottoBusy=false;
function lottoPool(pity){let pool=pity?LOTTO.filter(o=>o.k!=="miss"):LOTTO;
  return pool.map(o=>["hero","legend","miracle"].includes(o.k)&&has("jackpot")?{...o,w:o.w*3}:o)}
// odds table for the codex: what one ticket can give right now (augments included)
const LOTTO_NAME={miss:"꽝",gold:"골드 +120",gem:"보석 60~160",char:"견습·숙련 캐릭터",big:"대박 (골드 400 또는 보석 300)",elite:"정예 캐릭터",hero:"영웅 캐릭터",legend:"전설 캐릭터",miracle:"신의 기적 (적 전멸 + 전설 + 보석 500)"};
const ODDS_ORDER=["miss","gold","gem","char","big","elite","hero","legend","miracle"];
function lottoOddsHTML(){const pool=lottoPool(false).sort((a,b)=>ODDS_ORDER.indexOf(a.k)-ODDS_ORDER.indexOf(b.k)),tot=pool.reduce((a,o)=>a+o.w,0);
  const pc=w=>{const v=w/tot*100;return v>=1?v.toFixed(1)+"%":v.toFixed(2)+"%"};
  return `<div class="oddsH">복권 확률 <small>지금 기준${S&&has("jackpot")?" · 증강 적용":""}</small></div><table class="odds">${pool.map(o=>`<tr class="${o.k}"><td>${LOTTO_NAME[o.k]}</td><td>${pc(o.w)}</td></tr>`).join("")}</table>`}
function rollLotto(){
  const pool=lottoPool(false);const tot=pool.reduce((a,o)=>a+o.w,0);
  let r=Math.random()*tot;for(const o of pool){if((r-=o.w)<0)return o}return pool[0]}
function lotto(){
  if(lottoBusy)return;
  if(S.freeTix>0)S.freeTix--;
  else{if(S.ore<100){log("골드가 부족해요 (복권 100)","warn");return}S.ore-=100}const o=rollLotto();S.missRun=o.k==="miss"?(S.missRun||0)+1:0;
  // decide the concrete prize now so the reels can show it
  const pr={k:o.k};
  if(o.k==="gold")pr.gold=o.v;
  else if(o.k==="gem")pr.gem=[60,80,100,120,160][Math.floor(Math.random()*5)];
  else if(o.k==="big"){if(Math.random()<.5)pr.gold=400;else pr.gem=300}
  else if(o.k==="char")pr.type=pick(byGrade(Math.random()<.7?0:1)).i;
  else if(o.k==="elite")pr.type=pick(byGrade(2)).i;
  else if(o.k==="hero")pr.type=pick(byGrade(3)).i;
  else if(o.k==="legend"||o.k==="miracle")pr.type=pick(byGrade(4)).i;
  if(window.FAST_LOTTO){givePrize(pr);return}
  lottoShow(pr);
}
function placePrize(type){
  const t=TOWERS[type],empty=SLOTS.filter(s=>!s.tower);
  if(empty.length){addTower(empty[Math.floor(Math.random()*empty.length)],type);return}
  // board full: a big prize replaces the weakest character, a small one waits for the next empty slot
  const weakest=[...S.towers].sort((a,b)=>TOWERS[a.type].grade-TOWERS[b.type].grade||a.born-b.born)[0];
  if(weakest&&TOWERS[weakest.type].grade<t.grade){const sl=weakest.slot;removeTower(weakest);addTower(sl,type);log(`${TOWERS[weakest.type].name} 자리에 ${t.name} 등장!`,"good")}
  else{S.picks.unshift(type);log(`${t.name}: 다음 빈 칸에 나와요`,"good")}
}
function givePrize(pr){
  if(pr.gold)S.ore+=pr.gold;
  if(pr.gem)S.gas+=pr.gem;
  if(pr.k==="miracle"){for(const m of S.mons)if(!m.dead&&m.kind!=="mission"){if(m.def.boss){m.hp*=.5;continue}m.sh=0;m.hp=0;kill(m)}S.gas+=500} // bosses only lose half
  if(pr.type!=null)placePrize(pr.type);
  const t=pr.type!=null?TOWERS[pr.type]:null;
  const msg={miss:"꽝!",gold:`골드 +${pr.gold}`,gem:`보석 +${pr.gem}`,big:pr.gold?`대박! 골드 +${pr.gold}`:`대박! 보석 +${pr.gem}`,
    char:t&&`캐릭터 당첨! ${t.name}`,elite:t&&`초대박! 정예 ${t.name}`,hero:t&&`초대박! 영웅 ${t.name}`,legend:t&&`기적! 전설 ${t.name}`,miracle:t&&`신의 기적! 적 전멸 + 전설 ${t.name} + 보석 500`}[pr.k];
  log(msg,pr.k==="miss"?"warn":"good");
  if(["legend","miracle","hero"].includes(pr.k))banner(pr.k==="miracle"?"신의 기적!":pr.k==="legend"?"기적!":"초대박!",pr.k==="hero"?GCOL[3]:GCOL[4]);
  renderPanels();
}
// reel symbols: what each kind of prize looks like on a reel
function symHTML(kind,type){
  if(kind==="miss")return `<span class="sx">꽝</span>`;
  if(kind==="gold")return `<img alt="" src="ui/icons/icon_gold.svg">`;
  if(kind==="gem")return `<img alt="" src="ui/icons/icon_gem.svg">`;
  if(kind==="big")return `<span class="s7">7</span>`;
  if(kind==="miracle")return `<span class="sm">神</span>`;
  const sp=type!=null&&SPR[TOWERS[type].uid];const g=type!=null?TOWERS[type].grade:0;
  return sp&&sp.idle?`<span class="sc" style="border-color:${GCOL[g]};background-image:url(${sp.idle.src})"></span>`:`<span class="s7">★</span>`;
}
const REEL_KINDS=["miss","gold","gem","big","char","hero","legend"];
function randSym(){const k=REEL_KINDS[Math.floor(Math.random()*REEL_KINDS.length)];const g={char:0,hero:3,legend:4}[k];return symHTML(k,g!=null?pick(byGrade(g)).i:null)}
// the result shows at once (no spinning); tapping again right away is fine
let lottoHide=0;
function lottoShow(pr){
  let box=$("slotM");if(!box){box=document.createElement("div");box.id="slotM";box.className="slotm";document.body.appendChild(box)}
  const rare=["elite","hero","legend","miracle","big"].includes(pr.k),t=pr.type!=null?TOWERS[pr.type]:null;
  const face=pr.k==="miss"?null:symHTML(pr.k==="elite"?"char":pr.k,pr.type);
  const faces=face?[face,face,face]:[symHTML("gem"),symHTML("miss"),symHTML("gold")];
  box.innerHTML=`<div class="res"></div>${faces.map(f=>`<div class="reel hit">${f}</div>`).join("")}`;
  const txt={miss:"꽝",gold:`골드 +${pr.gold}`,gem:`보석 +${pr.gem}`,big:pr.gold?`대박! 골드 +${pr.gold}`:`대박! 보석 +${pr.gem}`,char:t&&`${t.name} 당첨!`,elite:t&&`초대박! ${t.name}`,hero:t&&`초대박! ${t.name}`,legend:t&&`기적! ${t.name}`,miracle:t&&`신의 기적! ${t.name}`}[pr.k];
  box.querySelector(".res").textContent=txt;box.className="slotm show "+(pr.k==="miss"?"lose":rare?"jackpot":"win");
  sfx(pr.k==="miss"?"miss":rare?"jackpot":"win");
  if(pr.k==="legend"||pr.k==="miracle"){const f=document.createElement("div");f.className="miracleFx";document.body.appendChild(f);setTimeout(()=>f.remove(),1600)}
  if(S)givePrize(pr);
  clearTimeout(lottoHide);lottoHide=setTimeout(()=>{box.className="slotm"},rare?1600:900);
}
function slotSpin(pr){
  lottoBusy=true;let box=$("slotM");if(!box){box=document.createElement("div");box.id="slotM";box.className="slotm";document.body.appendChild(box)}
  box.className="slotm show";box.innerHTML=`<div class="res"></div><div class="reel"></div><div class="reel"></div><div class="reel"></div>`;
  const reels=[...box.querySelectorAll(".reel")];const rare=["elite","hero","legend","miracle","big"].includes(pr.k);
  const kindOf=k=>k==="elite"||k==="hero"||k==="legend"?k:k;
  // final faces: three of a kind for a win; a miss shows a mixed line, often a painful near miss
  let faces;const win=symHTML(kindOf(pr.k)==="elite"?"char":pr.k,pr.type);
  if(pr.k==="miss"){if(Math.random()<.45){const tease=Math.random()<.5?"legend":"big";const ty=tease==="legend"?pick(byGrade(4)).i:null;const s=symHTML(tease,ty);faces=[s,s,symHTML("miss")];box.dataset.tease="1"}
    else{faces=[symHTML("gem"),symHTML("miss"),symHTML("gold")];box.dataset.tease=""}}
  else faces=[win,win,win];
  const stops=pr.k==="miss"&&box.dataset.tease?[420,760,1700]:rare?[420,760,pr.k==="miracle"||pr.k==="legend"?2300:1700]:[380,620,860];
  if(stops[2]>1000)setTimeout(()=>box.classList.add("tension"),stops[1]+40);
  sfx("tick");const iv=setInterval(()=>{sfx("tick");reels.forEach((r,i)=>{if(!r.dataset.stop)r.innerHTML=randSym()})},70);
  stops.forEach((ms,i)=>setTimeout(()=>{reels[i].dataset.stop="1";sfx("reel");reels[i].innerHTML=faces[i];reels[i].classList.add("hit")},ms));
  setTimeout(()=>{clearInterval(iv);box.classList.remove("tension");
    const t=pr.type!=null?TOWERS[pr.type]:null;
    const txt={miss:box.dataset.tease?"아깝다! 꽝":"꽝",gold:`골드 +${pr.gold}`,gem:`보석 +${pr.gem}`,big:pr.gold?`대박! 골드 +${pr.gold}`:`대박! 보석 +${pr.gem}`,char:t&&`${t.name} 당첨!`,elite:t&&`초대박! ${t.name}`,hero:t&&`초대박! ${t.name}`,legend:t&&`기적! ${t.name}`,miracle:"신의 기적! 적 전멸"}[pr.k];
    box.querySelector(".res").textContent=txt;box.classList.add(pr.k==="miss"?"lose":rare?"jackpot":"win");sfx(pr.k==="miss"?"miss":rare?"jackpot":"win");
    if(pr.k==="legend"||pr.k==="miracle"){const f=document.createElement("div");f.className="miracleFx";document.body.appendChild(f);setTimeout(()=>f.remove(),1600)}
    if(S)givePrize(pr);
    setTimeout(()=>{box.className="slotm";lottoBusy=false;if(S)hud()},rare?1500:650);
  },stops[2]+80);
}
function gachaFx(kind){const btn=MQ.matches?$("navLotto"):$("lottoBtn");const r=btn.getBoundingClientRect();
  const d=document.createElement("div");d.className="gfx";d.style.backgroundImage=`url(ui/gacha/lotto_${kind}_4.png)`;
  d.style.left=(r.left+r.width/2)+"px";d.style.top=(r.top+r.height/2-(MQ.matches?60:40))+"px";document.body.appendChild(d);setTimeout(()=>d.remove(),400)}
// missions recharge by waves (not seconds), so skipping the break costs nothing
const MIS_WAVES=3,MIS_REC=[4,12,21]; // recommended wave to try each one
const misLeft=i=>Math.max(0,(S.mis[i]||0)-S.wi);
function mission(i){
  if(!running)return;if(misLeft(i)>0){log(`${misLeft(i)}웨이브 뒤에 다시 도전할 수 있어요`,"warn");return}
  S.mis[i]=S.wi+MIS_WAVES;const d=MISSIONS[i];spawn(d,d.hp,"mission");
  log(`${i+1}단계 도전 미션 시작 · ${d.name} HP ${fmt(d.hp)}. 막지 못하면 목숨 -10.`,"hi");renderPanels();
}
// boss reward: 200 gold per boss so far (wave 10: 200, wave 20: 400…), take it or try "x2" again and again. each try is half as likely: 50% → 25% → 12.5%… a miss gives 0
const BOSS_GOLD=200;let bossSpin=false;
const pcTxt=p=>{const v=p*100;return (v>=10?Math.round(v):v>=1?+v.toFixed(1):+v.toFixed(2))+"%"};
function bossGambleHTML(bx,msg,fx){
  bx.classList.add("bossP");const st=Math.min(5,1+(S.bN||0));
  bx.innerHTML=`<h2>보스 처치 보상</h2><div class="bgPot"><img alt="" src="${A(`ui/boss/gold_${st}.webp`)}"><i class="bgFx${fx?" "+fx:""}"></i></div><b class="bgAmt" id="bgAmt">${S.bPot.toLocaleString()}</b><p class="bgMsg">${msg||"받거나, 2배에 도전해요. 실패하면 0골드!"}</p>
  <div class="bgBtns"><button type="button" class="bgTake" id="bgTake">받기<small>골드 +${S.bPot.toLocaleString()}</small></button><button type="button" class="bgDbl" id="bgDbl">2배 뽑기<small>${(S.bPot*2).toLocaleString()} · ${pcTxt(S.bP)}</small></button></div>`;
  $("bgTake").onclick=()=>{if(bossSpin)return;S.ore+=S.bPot;log(`보스 보상 골드 +${S.bPot}`,"good");sfx("coin");bossDone()};
  $("bgDbl").onclick=()=>{if(bossSpin)return;bossSpin=true;const win=Math.random()<S.bP,el=$("bgAmt"),a=S.bPot,b=a*2;let n=0;bx.classList.add("rolling");
    const t=setInterval(()=>{el.textContent=(n%2?b:0).toLocaleString();sfx("tick");if(++n<14)return;clearInterval(t);bx.classList.remove("rolling");bossSpin=false;
      if(win){S.bPot=b;S.bP/=2;S.bN=(S.bN||0)+1;sfx("jackpot");bossGambleHTML(bx,`성공! 다음 2배는 ${pcTxt(S.bP)}`,"win")}
      else{sfx("miss");bx.innerHTML=`<h2>보스 처치 보상</h2><div class="bgPot"><img alt="" src="${A("ui/boss/gold_lost.webp")}"><i class="bgFx lose"></i></div><b class="bgAmt lose">0</b><p class="bgMsg">꽝! ${a.toLocaleString()}골드가 날아갔어요…</p><div class="bgBtns one"><button type="button" class="bgTake" id="bgOk">확인</button></div>`;log(`보스 보상 2배 뽑기 실패 (${a}골드 잃음)`,"warn");$("bgOk").onclick=bossDone}},70)}}
function bossDone(){S.tok.boss=Math.max(0,S.tok.boss-1);S.bPot=null;S.bN=0;$("rewardBox").classList.remove("bossP");renderPanels();showReward()}
function useBoss(kind){
  if(S.tok.boss<1)return;S.tok.boss--;
  if(kind==="ore"){S.ore+=400;log("골드 +400","good")}else if(kind==="gas"){S.gas+=200;log("보석 +200","good")}else{S.tok.rare++}
  renderPanels();showReward();
}
function choose(grade,type){
  const key=["","","rare","unique","epic"][grade];if(S.tok[key]<1)return;S.tok[key]--;S.picks.push(type);
  log(`다음에 지으면 ${TOWERS[type].name}이(가) 나옵니다`,"good");renderPanels();showReward();
}

// ---------- achievements ----------
const NM=u=>TOWERS[UID(u)].short;

function showReward(){
  if(S.sel){S.sel=null;renderBubble()}
  const ov=$("rewardOv"),bx=$("rewardBox"),tk=S.tok;
  if(tk.boss>0){if(S.bPot==null){S.bPot=BOSS_GOLD*Math.max(1,Math.floor((S.wi+1)/10));S.bP=.5}bossGambleHTML(bx)}
  else if(tk.rare>0){bx.innerHTML=`<h2>정예 고르기</h2><p>다음에 빈 칸을 누르면 이 캐릭터가 나와요.</p><div class="pick">${byGrade(2).map(t=>`<button type="button" data-t="${t.i}"><img alt="" src="${ICON[t.i]}">${t.short}</button>`).join("")}</div>`;
    bx.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>choose(2,+b.dataset.t))}
  else{ov.hidden=true;rewardOpen=false;return}
  ov.hidden=false;rewardOpen=true;
}
let rewardOpen=false;


// ---------- animated hero & legend sprites ----------
// Each: base (fixed) + idle/attack(6f, 300ms, release on frame 3) rotating around center (facing right = 0),
// impact(4f, 300ms) and projectile(2f loop). Damage values/cycles stay the original game's.
const SPRITE_IDS={305:"god_fist",306:"god_spear",204:"boxer_boy",205:"whirl_axe_warrior",301:"god_gunner",302:"god_archer",303:"god_sun",304:"god_sword",201:"apprentice_mage",202:"crossbowman",203:"time_archmage",39:"greatsword_soldier",38:"blowdart_hunter",8:"archer",2:"iron_ball_thrower",70:"dual_pistol_gunner",66:"wooden_cannoneer",43:"shuriken_thrower",0:"matchlock_musketeer",54:"twin_blade_master",44:"antimateriel_marksman",20:"gatling_brute",58:"rocket_captain",76:"missile_captain",53:"harpoon_hunter",81:"bomb_goblin",67:"storm_sage",
  82:"beekeeper_monarch",19:"minigun_war_god",79:"fire_mage",55:"shadow_ninja_king",100:"cannon_general",51:"dragon_berserker",99:"wraith_sniper_king",103:"lava_spear_king",
  16:"lightning_mage",3:"heavy_machinegunner",71:"siege_cannon_knight",62:"acid_alchemist",52:"venom_witch",21:"laser_knight",104:"flail_knight",78:"energy_gunner",10:"flamethrower_trooper",30:"mortar_gunner",61:"lightsaber_knight",88:"light_mage",68:"hammer_warrior",1:"sniper",46:"poison_gas_sprayer",32:"demolition_expert"};
const MODE={305:"melee",204:"melee",303:"targeted",304:"self",205:"self",201:"aura",203:"aura",88:"aura",104:"melee",10:"flame",46:"spray",62:"spray",39:"melee",54:"melee",51:"melee",61:"melee",68:"self",67:"targeted",16:"targeted",103:"line"}; // others: projectile
const PSPD={306:22,301:26,302:30,202:22,71:14,62:13,52:12,21:28,78:16,30:13,32:12,88:20,1:30,46:12,2:13,66:15,43:14,81:11,79:12,58:14,76:16,82:10,55:15,100:20}; // px per game frame (default 24)
const FXCOL={305:"#fff3c4",306:"#ffd34f",204:"#ffffff",205:"#cfd8e0",301:"#ffd34f",302:"#9fe8ff",303:"#ff9a2a",304:"#fff3c4",202:"#cfd8e0",3:"#ffd27a",71:"#9aa4ae",62:"#9dff5a",52:"#c04cff",21:"#5ab8ff",104:"#cfd8e0",78:"#5ab8ff",10:"#ff5a2a",16:"#ffe45a",30:"#ff9a3c",61:"#fff3c4",88:"#ffffff",68:"#b98a5a",1:"#e6eef5",46:"#b06cff",32:"#ff7a3c",39:"#e6eef5",38:"#b06cff",8:"#cfa36a",2:"#9aa4ae",70:"#ffd27a",66:"#9aa4ae",43:"#d8dce6",0:"#ffd27a",82:"#ffd23f",19:"#ffe08a",79:"#ff8a2a",55:"#d8dce6",100:"#ffb547",51:"#ff5a3c",99:"#4fe0c8",103:"#ff6a1f",54:"#e6eef5",44:"#e6eef5",20:"#ffd27a",58:"#ff9a3c",76:"#ff9a3c",53:"#cfd8e0",81:"#ff9a3c",67:"#ffe45a"};
const SPR={};const BASE={};
function loadSprites(done){
  const list=["apprentice","skilled","elite","hero","legend","god"].map((id,i)=>["b:"+i,`sprites/base_${id}.png`]);
  for(const[u,id]of Object.entries(SPRITE_IDS))if(!(TOWERS[UID(+u)]||{}).off)for(const p of["idle","attack","impact","proj"])if(!(p==="proj"&&MODE[u]&&MODE[u]!=="proj"))list.push([u+":"+p,`sprites/${id}/${p}.png`]);
  let left=list.length;
  for(const[k,src]of list){const im=new Image();im.onload=im.onerror=()=>{if(im.naturalWidth){const[a,b]=k.split(":");if(a==="b")BASE[b]=im;else(SPR[a]=SPR[a]||{})[b]=im}if(--left===0)done()};im.src=src}
}
const MSPR={};
function loadMonsters(){for(const k of new Set([...WAVE_SPR,...MAP_POOL.flat(),...MAP_BOSS,"b_endless","q_dino","q_steel_knight","q_flyer"]))for(const p of["walk","death"]){const im=new Image();im.onload=()=>{(MSPR[k]=MSPR[k]||{})[p]=im};im.src=`sprites/mon/${k}/${p}.png`}}
loadMonsters();
function cell(c,im,i,n,dx,dy,w,h){const cw=im.naturalWidth/n;c.drawImage(im,i*cw,0,cw,im.naturalHeight,dx,dy,w,h)}
// visible size of each idle sprite (sqrt of opaque px at 192px), used to even out how big characters look
const SPR_AREA={305:91.9,306:92.1,204:75.4,205:79.7,301:105.4,302:105.0,303:99.7,304:102.5,201:43.5,202:56.3,203:81.4,39:47.3,38:39.8,8:40.1,2:44.2,70:41.0,66:39.4,43:42.5,0:34.7,54:71.7,44:57.6,20:68.0,58:71.6,76:68.3,53:61.0,81:63.6,67:75.7,82:73.6,19:82.8,79:72.9,55:77.3,100:73.5,51:89.3,99:72.7,103:58.4,16:32.0,3:52.4,71:58.0,62:54.4,52:68.8,21:53.1,104:49.8,78:52.2,10:53.9,30:32.8,61:30.5,88:31.1,68:33.7,1:31.9,46:33.6,32:32.2};
const SIZE_GOAL=[56,56,56,56,56,56];
const UPRIGHT=new Set([204,301,302,303,304,305,306]);
const IDLE_FLIP=new Set([305]); // 권신's idle art faces left while its attack faces right (until the art is redrawn)
function drawSprite(c,t,x,y,R,ang,kick,tw){
  const sp=SPR[t.uid],base=BASE[t.grade];if(!sp||!sp.idle||!base)return false;
  const sk=SPR_AREA[t.uid]?Math.max(.55,Math.min(1.6,SIZE_GOAL[t.grade]/SPR_AREA[t.uid])):1,sz=R*3.1*sk;c.save();c.translate(x,y);
  const bsz=R*1.55;c.drawImage(base,-bsz/2,-bsz/2+bsz*.015,bsz,bsz);
  if(UPRIGHT.has(t.uid)){if(Math.cos(ang)<-.05)c.scale(-1,1)} // drawn standing up (face visible): mirror toward the target instead of spinning upside down
  else c.rotate(ang);
  if(tw&&tw.atk!=null&&sp.attack){const f=Math.min(5,Math.floor(tw.atk/tw.atkDur*6));cell(c,sp.attack,f,6,-sz/2,-sz/2,sz,sz)}
  else{if(IDLE_FLIP.has(t.uid))c.scale(-1,1);c.drawImage(sp.idle,-sz/2,-sz/2,sz,sz)}
  c.restore();return true;
}
const ANIM={
  has:t=>!!(SPR[t.uid]&&SPR[t.uid].attack),
  impact(t,x,y,scale){const sp=SPR[t.uid];if(!sp||!sp.impact)return;S.fx.push({k:"imp",im:sp.impact,x,y,s:scale,life:7,max:7})},
  release(tw,t){
    let m=tw.pend;if(!m||m.dead||!inRange(t,tw,m))m=tw.target;if(!m||m.dead)return;
    if(t.aura){fire(tw,t,m);ANIM.impact(t,m.x,m.y,.7);return} // magic bolt
    const mode=MODE[t.uid]||"proj",R=TS*1.38;
    if(mode==="melee"){fire(tw,t,m,true);ANIM.impact(t,m.x,m.y,t.area&&t.splash[2]>0?(t.splash[2]*2+40)/96:1);return}
    if(mode==="flame"||mode==="spray"){fire(tw,t,m,true);const a=Math.atan2(m.y-tw.y,m.x-tw.x);
      S.fx.push({k:"flame",pal:mode==="spray"?(t.uid===46?"gas":"acid"):"fire",x:tw.x+Math.cos(a)*22,y:tw.y+Math.sin(a)*22,x2:m.x+Math.cos(a)*14,y2:m.y+Math.sin(a)*14,life:10,max:10});
      ANIM.impact(t,m.x,m.y,(t.splash[2]*2+40)/96);return}
    if(mode==="self"){fire(tw,t,m,true);ANIM.impact(t,tw.x,tw.y,(t.splash[2]*2+40)/96);return}
    if(mode==="targeted"){if(t.slow)for(const o of S.mons)if(!o.dead&&Math.hypot(o.x-m.x,o.y-m.y)<=t.splash[2]+monR(o)){o.slowT=t.slow.dur;o.slowV=Math.min(.7,t.slow.v*(1+.05*(lvl(t)-3)))}fire(tw,t,m,true);ANIM.impact(t,m.x,m.y,(t.splash[2]*2+40)/96);return}
    if(mode==="line"){fire(tw,t,m,true);return}
    const n=t.uid===82?(t.shots||8):1,spd=PSPD[t.uid]||24,mx=tw.x+Math.cos(tw.ang)*R*.9/K,my=tw.y+Math.sin(tw.ang)*R*.9/K;
    for(let k=0;k<n;k++)S.proj.push({tw,t,m,x:mx,y:my,tx:m.x,ty:m.y,spd,f:1,bounce:t.weapon.startsWith("Glave")?mh(t)-1:0,hit:new Set(),age:0,wob:n>1?(k-n/2)*.35:0,delay:n>1?k*1.2:0,bee:n>1});
  },
  stepProj(){
    for(const p of S.proj){
      if(p.delay>0){p.delay--;continue}
      p.age++;if(p.m&&!p.m.dead){p.tx=p.m.x;p.ty=p.m.y}
      const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy);p.a=Math.atan2(dy,dx);
      if(d<=p.spd||p.age>120){p.x=p.tx;p.y=p.ty;ANIM.arrive(p);p.done=true;continue}
      const w=p.bee?Math.sin(p.age*.5+p.wob*4)*.6:0;p.x+=Math.cos(p.a+w)*p.spd;p.y+=Math.sin(p.a+w)*p.spd;
    }
    S.proj=S.proj.filter(p=>!p.done);
  },
  arrive(p){
    const t=p.t,raw=hitDmg(t)*t.factor*p.f*(p.tw&&p.tw.bPow||1);S.src=t;
    if(t.curse){const cv=t.curse.v*(1+.05*(lvl(t)-3));for(const o of S.mons)if(!o.dead&&Math.hypot(o.x-p.x,o.y-p.y)<=t.splash[2]+monR(o)){o.curseT=t.curse.dur;o.curseV=cv}}
    if(t.splash[2]>0){splash(t,p.x,p.y,raw);ANIM.impact(t,p.x,p.y,(t.splash[2]*2+40)/96)}
    else{if(p.m&&!p.m.dead){damage(p.m,raw,t.dtype);if(t.exp==="Corrosive_Acid"&&!p.m.dead){p.m.acid=Math.min(9,p.m.acid+1);p.m.acidT=240}}
      ANIM.impact(t,p.x,p.y,p.bee?.5:1)}
    if(p.bounce>0&&p.m){p.hit.add(p.m);let best=null,bd=96*96;for(const o of S.mons){if(o.dead||p.hit.has(o))continue;const q=(o.x-p.x)**2+(o.y-p.y)**2;if(q<bd){bd=q;best=o}}
      if(best)S.proj.push({...p,m:best,tx:best.x,ty:best.y,f:p.f/3,bounce:p.bounce-1,age:0,done:false})}
  },
  lineFx(tw,t,ex,ey){const sp=SPR[t.uid];const L=Math.hypot(ex-tw.x,ey-tw.y),n=Math.floor(L/26);
    for(let i=1;i<=n;i++){const f=i/n;S.fx.push({k:"spike",im:sp&&sp.proj,v:i%2,x:tw.x+(ex-tw.x)*f,y:tw.y+(ey-tw.y)*f,life:9+i,max:9+i,del:i})}
    ANIM.impact(t,ex,ey,.8)},
};

// ---------- tower art ----------
function drawTower(c,t,x,y,R,ang,time,kick,tw){
  if(drawSprite(c,t,x,y,R,ang,kick,tw))return;
  const g=GCOL[t.grade],acc=`hsl(${t.hue} 85% 62%)`;
  c.save();c.translate(x,y);
  // fixed square grade plate; only the weapon rotates
  const plate=BASE[t.grade],bsz=R*1.55;
  if(plate)c.drawImage(plate,-bsz/2,-bsz/2+bsz*.015,bsz,bsz);
  else{c.fillStyle="#18252c";c.fillRect(-R*.9,-R*.9,R*1.8,R*1.8);c.strokeStyle=g;c.lineWidth=R*.08;c.strokeRect(-R*.9,-R*.9,R*1.8,R*1.8)}
  // head
  c.rotate(ang);c.translate(-(kick||0)*R*.03,0);c.scale(R,R);
  const H=HEADS[t.head]||HEADS.rifle;H(c,g,acc,time,t);
  c.restore();
}
function P(c,pts,fill,stroke,lw){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw||.05;c.stroke()}}
function rect(c,x,y,w,h,fill){c.fillStyle=fill;c.fillRect(x,y,w,h)}
function disc(c,x,y,r,fill){c.beginPath();c.arc(x,y,r,0,7);c.fillStyle=fill;c.fill()}
const DARK="#22323b",MID="#3a505c",LIGHT="#c9d6dc";
const HEADS={
 blade(c,g,a){P(c,[[-.2,-.15],[.9,-.05],[.95,0],[.9,.05],[-.2,.15]],LIGHT,g,.04);P(c,[[-.1,-.5],[.5,-.3],[.55,-.22],[0,-.2]],a);P(c,[[-.1,.5],[.5,.3],[.55,.22],[0,.2]],a);disc(c,0,0,.28,MID);disc(c,0,0,.14,g)},
 spike(c,g,a){disc(c,-.05,0,.38,MID);for(const s of[-.22,0,.22])P(c,[[.2,s-.07],[.85-Math.abs(s),s],[.2,s+.07]],LIGHT);disc(c,-.05,0,.2,a)},
 laser(c,g,a){rect(c,0,-.08,.95,.16,LIGHT);rect(c,.82,-.13,.1,.26,a);disc(c,0,0,.36,MID);disc(c,0,0,.18,a)},
 grenade(c,g,a){rect(c,0,-.2,.7,.4,MID);rect(c,.55,-.24,.18,.48,LIGHT);disc(c,-.05,0,.38,DARK);disc(c,-.05,0,.25,a)},
 twin(c,g,a){rect(c,0,-.26,.85,.13,LIGHT);rect(c,0,.13,.85,.13,LIGHT);P(c,[[-.4,-.35],[.25,-.3],[.25,.3],[-.4,.35]],MID,g,.04);disc(c,-.05,0,.12,a)},
 cannon(c,g,a,_,t){const w=t.grade>=2?.22:.17;rect(c,.05,-w,.95,w*2,LIGHT);rect(c,.8,-w-.05,.2,w*2+.1,MID);disc(c,0,0,.44,MID);disc(c,0,0,.3,DARK);disc(c,0,0,.16,a)},
 glaive(c,g,a,time){c.rotate(time*.25);for(let k=0;k<3;k++){c.rotate(Math.PI*2/3);P(c,[[0,-.12],[.85,-.05],[.6,.25],[0,.12]],k?LIGHT:a,g,.03)}disc(c,0,0,.18,MID)},
 rifle(c,g,a){rect(c,0,-.08,.85,.16,LIGHT);rect(c,.1,-.25,.35,.1,a);disc(c,-.05,0,.33,MID);disc(c,-.05,0,.15,g)},
 orb(c,g,a,time,t){const p=1+Math.sin(time*.15)*.08;c.save();c.globalAlpha=.25;disc(c,0,0,.75*p,a);c.restore();disc(c,0,0,.48*p,a);disc(c,-.12,-.12,.16,"#fff");c.strokeStyle=g;c.lineWidth=.05;c.beginPath();c.ellipse(0,0,.7,.25,time*.05,0,7);c.stroke()},
 mortar(c,g,a){P(c,[[-.45,-.4],[.3,-.4],[.45,0],[.3,.4],[-.45,.4]],MID,g,.04);disc(c,.15,0,.3,DARK);disc(c,.15,0,.2,LIGHT);disc(c,.15,0,.1,a)},
 prism(c,g,a,time){P(c,[[.75,0],[-.35,-.55],[-.35,.55]],a,g,.05);P(c,[[.45,0],[-.15,-.25],[-.15,.25]],"#ffffffaa")},
 shock(c,g,a,time){for(let k=0;k<3;k++){c.strokeStyle=k%2?a:g;c.lineWidth=.07;c.beginPath();c.arc(0,0,.25+k*.18,time*.1+k,time*.1+k+4.2);c.stroke()}disc(c,0,0,.18,LIGHT)},
 sniper(c,g,a){rect(c,0,-.06,1.1,.12,LIGHT);rect(c,.15,-.24,.45,.12,a);rect(c,1.0,-.1,.1,.2,g);disc(c,-.1,0,.3,MID)},
 venom(c,g,a){disc(c,-.15,0,.45,"#2f5a3a");disc(c,-.15,0,.3,a);rect(c,.2,-.1,.6,.2,MID);disc(c,.82,0,.11,a);disc(c,-.3,-.15,.08,"#ffffff88")},
 gatling(c,g,a,time,t){disc(c,-.05,0,.4,MID);for(let k=0;k<6;k++){const o=Math.sin(time*.6+k)*.16;rect(c,.15,o-.04,.8,.08,k%2?LIGHT:a)}rect(c,.85,-.22,.12,.44,DARK)},
 tentacle(c,g,a,time){c.lineCap="round";for(const s of[-.3,0,.3]){c.strokeStyle=s?a:LIGHT;c.lineWidth=.12;c.beginPath();c.moveTo(0,s*.5);for(let k=1;k<=6;k++)c.lineTo(k*.14,s*.5+Math.sin(time*.2+k+s*5)*.1+s*k*.04);c.stroke()}disc(c,-.05,0,.32,"#3c2a35")},
 flame(c,g,a,time){disc(c,-.2,0,.4,MID);rect(c,0,-.13,.7,.26,LIGHT);const f=.2+Math.random()*.1;P(c,[[.7,-.14],[1+f,0],[.7,.14]],"#ff9a3c");rect(c,-.5,-.38,.3,.76,a)},
 missile(c,g,a){P(c,[[-.4,-.45],[.4,-.45],[.5,0],[.4,.45],[-.4,.45]],MID,g,.04);for(const[x,y]of[[.2,-.22],[.2,.22],[-.15,-.22],[-.15,.22]]){P(c,[[x-.12,y-.08],[x+.15,y],[x-.12,y+.08]],a)}},
 bag(c,g,a){P(c,[[-.5,.1],[-.35,-.45],[.35,-.45],[.5,.1],[.3,.5],[-.3,.5]],"#c99a2e",g,.05);rect(c,-.25,-.55,.5,.12,a);c.fillStyle="#3a2a08";c.font="bold .5px sans-serif";c.textAlign="center";c.textBaseline="middle";c.fillText("福",0,.05)},
 hangar(c,g,a){P(c,[[.9,0],[.2,-.5],[-.6,-.42],[-.75,0],[-.6,.42],[.2,.5]],MID,g,.05);rect(c,-.4,-.08,.9,.16,a);disc(c,-.3,0,.15,LIGHT)},
 crown(c,g,a){P(c,[[-.45,.35],[-.5,-.4],[-.2,-.1],[0,-.5],[.2,-.1],[.5,-.4],[.45,.35]],a,g,.05);for(const s of[-.25,.25])P(c,[[.3,s-.06],[.95,s*.6],[.3,s+.06]],LIGHT)},
};
const ICON={};
const AREA_IMG=new Image();AREA_IMG.src="ui/icons/icon_area.svg";
function areaMark(c,x,y,r){c.beginPath();c.arc(x,y,r,0,7);c.fillStyle="#FF7A1A";c.fill();c.lineWidth=Math.max(1.5,r*.22);c.strokeStyle="#fff";c.stroke();if(AREA_IMG.complete&&AREA_IMG.naturalWidth)c.drawImage(AREA_IMG,x-r*.78,y-r*.78,r*1.56,r*1.56)}
const SINGLE_IMG=new Image();SINGLE_IMG.src="ui/icons/icon_single.svg";
// attack-type badge next to the line badge: orange burst = 범위, teal target = 단발
function typeMark(c,area,x,y,r){ // word pill beside the line badge: 범위 (orange) / 단발 (teal)
  const w=r*3.1,h=r*1.9,x0=x-r*.95;c.beginPath();c.roundRect(x0,y-h/2,w,h,h/2);c.fillStyle=area?"#FF7A1A":"#18A7B5";c.fill();c.lineWidth=Math.max(1.5,r*.22);c.strokeStyle="#fff";c.stroke();
  c.fillStyle="#fff";c.font=`900 ${r*1.12}px sans-serif`;c.textAlign="center";c.textBaseline="middle";c.fillText(area?"범위":"단발",x0+w/2,y+r*.06);c.textBaseline="alphabetic"}
function makeIcons(){for(const t of TOWERS){const cv=document.createElement("canvas");cv.width=cv.height=96;const c=cv.getContext("2d");drawTower(c,t,48,48,44,-Math.PI/4,10,0);typeMark(c,t.area,62,84,10);ICON[t.i]=cv.toDataURL()}}

// ---------- rendering ----------
const cv=$("cv"),ctx=cv.getContext("2d");
let TS=36,K=TS/WT; // canvas px per tile, world→canvas
let mapLayer=null;
const UPG_IMG={};for(const[k,v]of Object.entries(UPG_ICON)){UPG_IMG[k]=new Image();UPG_IMG[k].src=`ui/icons/icon_${v}.svg`}
const STAT_IMG={};for(const k of["status_slow","status_curse","buff_speed","buff_power"]){STAT_IMG[k]=new Image();STAT_IMG[k].src=`ui/status/${k}.png`}
const BADGE=new Image();BADGE.src="ui/badge_merge.png";
// themed boards (6x9, 128px per cell): 1~10 meadow, 11~20 snowy forest, 21~30 canyon, 31~ hell fortress
const THEMES=[{id:"map_meadow",name:"성 앞 초원"},{id:"map_forest",name:"눈 덮인 숲"},{id:"map_canyon",name:"사막 협곡"},{id:"map_hell",name:"지옥 요새"},{id:"map_sky",name:"하늘 성"},{id:"map_glacier",name:"얼음 심연"},{id:"map_swamp",name:"독 버섯 늪"},{id:"map_ruins",name:"해저 유적"},{id:"map_factory",name:"기계 공장"},{id:"map_chaos",name:"혼돈의 차원"}];
function themeLoad(k){const th=THEMES[k];if(!th||th.img)return;th.img=new Image();th.img.onload=()=>{if(MAP_TEXTURE===th.img)mapLayer=null};th.img.src=`ui/maps/${th.id}/board.jpg`;new Image().src=`ui/maps/${th.id}/bg.jpg`}
themeLoad(0);themeLoad(1); // later maps load a few waves before they are needed
let MAP_TEXTURE=THEMES[0].img,themeI=0,oldLayer=null,fadeT=0;
const themeOf=wi=>{const k=Math.floor(wi/10);return k<10?k:4+(k-10)%6};
function setTheme(k,announce){
  themeLoad(k);
  if(k===themeI&&!announce&&MAP_TEXTURE===THEMES[k].img)return;
  if(announce&&mapLayer){oldLayer=mapLayer;fadeT=1}
  themeI=k;MAP_TEXTURE=THEMES[k].img;mapLayer=null;document.documentElement.style.setProperty("--themeBg",`url(ui/maps/${THEMES[k].id}/bg.jpg)`);
  if(announce){let el=$("regionBan");if(!el){el=document.createElement("img");el.id="regionBan";el.className="regionBan";el.alt="";document.querySelector(".stage").appendChild(el)}
    el.src=`ui/maps/${THEMES[k].id}/banner.png`;el.alt=THEMES[k].name;el.classList.remove("show");setTimeout(()=>{void el.offsetWidth;el.classList.add("show");sfx("rare")},1700);log(`새 지역 · ${THEMES[k].name}`,"good")}
}

const MQ=matchMedia("(max-width:700px)");
function sizeCanvas(){TS=MQ.matches?56:36;K=TS/WT;cv.width=COLS*TS;cv.height=ROWS*TS;mapLayer=null}
sizeCanvas();MQ.addEventListener?.("change",()=>{sizeCanvas();closeSheet()});
function buildMap(){
  mapLayer=document.createElement("canvas");mapLayer.width=cv.width;mapLayer.height=cv.height;const c=mapLayer.getContext("2d");
  c.fillStyle="#F3DFAF";c.fillRect(0,0,cv.width,cv.height);
  if(MAP_TEXTURE.complete&&MAP_TEXTURE.naturalWidth){c.drawImage(MAP_TEXTURE,0,0,COLS*TS,ROWS*TS);return}
  // sandy path ring
  c.fillStyle="#FBEBC6";c.beginPath();c.roundRect(TS*.25,TS*.25,cv.width-TS*.5,cv.height-TS*.5,TS*.8);c.fill();
  c.strokeStyle="rgba(196,150,80,.35)";c.lineWidth=TS*.08;c.beginPath();c.roundRect(TS*.25,TS*.25,cv.width-TS*.5,cv.height-TS*.5,TS*.8);c.stroke();
  // grass field with slot cells
  const gx=TS*2,gy=TS*2,gw=cv.width-TS*4,gh=cv.height-TS*4;
  c.fillStyle="rgba(150,110,50,.18)";c.beginPath();c.roundRect(gx-TS*.06,gy+TS*.06,gw+TS*.12,gh+TS*.1,TS*.4);c.fill();
  const g=c.createLinearGradient(0,gy,0,gy+gh);g.addColorStop(0,"#A6DFB2");g.addColorStop(1,"#84CC9B");c.fillStyle=g;c.beginPath();c.roundRect(gx,gy,gw,gh,TS*.4);c.fill();
  c.strokeStyle="#5DAA79";c.lineWidth=TS*.07;c.stroke();
  for(const s of SLOTS){const X=s.x*K,Y=s.y*K,a=TS*.9;c.fillStyle="rgba(255,255,255,.16)";c.beginPath();c.roundRect(X-a,Y-a,a*2,a*2,TS*.28);c.fill();
    c.strokeStyle="rgba(255,255,255,.4)";c.lineWidth=Math.max(1.5,TS*.035);c.setLineDash([TS*.12,TS*.1]);c.stroke();c.setLineDash([])}
}
function render(){
  const c=ctx,time=S?S.frame:0;
  if(!mapLayer)buildMap();c.drawImage(mapLayer,0,0);
  if(oldLayer&&fadeT>0){c.globalAlpha=fadeT;c.drawImage(oldLayer,0,0);c.globalAlpha=1;fadeT-=.02;if(fadeT<=0)oldLayer=null}
  // path flow: moving chevrons show the route direction
  c.save();const step=TS*2.4,off=(time*.9)%step;c.fillStyle="rgba(166,128,64,.24)";
  for(const s of SEG){const ang=Math.atan2(s.b[1]-s.a[1],s.b[0]-s.a[0]),len=s.l*K;for(let d=off;d<len;d+=step){const x=s.a[0]*K+Math.cos(ang)*d,y=s.a[1]*K+Math.sin(ang)*d;
    c.save();c.translate(x,y);c.rotate(ang);c.beginPath();c.moveTo(TS*.22,0);c.lineTo(-TS*.14,-TS*.26);c.lineTo(-TS*.02,0);c.lineTo(-TS*.14,TS*.26);c.closePath();c.fill();c.restore()}}
  c.restore();
  const sp=PATH[0],ex=PATH[PATH.length-1];
  if(!MAP_TEXTURE.naturalWidth){const chip=(x,y,txt,bg)=>{c.font=`700 ${TS*.42}px ${getComputedStyle(document.body).getPropertyValue("--body")}`;const w=c.measureText(txt).width+TS*.5,h=TS*.62;
    c.fillStyle=bg;c.beginPath();c.roundRect(x-w/2,y-h/2,w,h,h/2);c.fill();c.fillStyle="#fff";c.textAlign="center";c.textBaseline="middle";c.fillText(txt,x,y+1);c.textBaseline="alphabetic"};
   chip(sp[0]*K,sp[1]*K,"IN","#e0435f");chip(ex[0]*K,ex[1]*K,"OUT","#2f7fe0")}

  if(!S)return;
  // hover
  if(hover&&!hover.tower&&running){c.fillStyle=S.ore>=100?"#ffb54722":"#ff6f7d22";c.fillRect(hover.x*K-TS+4,hover.y*K-TS+4,TS*2-8,TS*2-8);c.strokeStyle=S.ore>=100?"#ffb547":"#ff6f7d";c.lineWidth=2;c.strokeRect(hover.x*K-TS+4,hover.y*K-TS+4,TS*2-8,TS*2-8)}
  // selection range
  // range square: shown for the selected character, and while dragging it shows where it would reach from the slot under the finger
  const drawRange=(wx,wy,rt,mg)=>{if(rt>9)rt=9;const h=(rt+.5)*CELL*K,x0=Math.max(0,wx*K-h),y0=Math.max(0,wy*K-h),x1=Math.min(cv.width,wx*K+h),y1=Math.min(cv.height,wy*K+h);c.fillStyle=mg?"rgba(43,196,138,.18)":"rgba(255,255,255,.3)";c.fillRect(x0,y0,x1-x0,y1-y0);c.strokeStyle=mg?"rgba(20,140,95,.9)":"rgba(28,58,96,.85)";c.setLineDash([TS*.25,TS*.18]);c.lineWidth=Math.max(2,TS*.08);c.strokeRect(x0+1,y0+1,x1-x0-2,y1-y0-2);c.setLineDash([])};
  if(tdrag&&tdrag.active){const o=tdrag.over||tdrag.tw.slot;{const tt=TOWERS[tdrag.tw.type];drawRange(o.x,o.y,tt.aura?tt.aura.r:rtOf(tt),!!tt.aura)}}
  else if(S.sel){const tt=TOWERS[S.sel.type];drawRange(S.sel.x,S.sel.y,tt.aura?tt.aura.r:rtOf(tt),!!tt.aura)}
  const tc={};for(const tw of S.towers)tc[tw.type]=(tc[tw.type]||0)+1;
  for(const tw of S.towers){const dragging=tdrag&&tdrag.active&&tdrag.tw===tw;if(dragging)c.globalAlpha=.35;drawTower(c,TOWERS[tw.type],tw.x*K,tw.y*K,TS*1.38,tw.ang,time,tw.kick,tw);c.globalAlpha=1}
  if(tdrag&&tdrag.active){const o=tdrag.over;if(o&&o!==tdrag.tw.slot){c.fillStyle=o.tower?"rgba(255,194,58,.28)":"rgba(78,240,176,.28)";c.strokeStyle=o.tower?"#ffc23a":"#4ef0b0";c.lineWidth=3;c.fillRect(o.x*K-TS+3,o.y*K-TS+3,TS*2-6,TS*2-6);c.strokeRect(o.x*K-TS+3,o.y*K-TS+3,TS*2-6,TS*2-6)}
    c.globalAlpha=.9;drawTower(c,TOWERS[tdrag.tw.type],tdrag.cx,tdrag.cy-TS*.4,TS*1.38,tdrag.tw.ang,time,0,null);c.globalAlpha=1}
  // small upgrade-line badge under each character (sword = 근접, gun = 사격, cannon = 범위)
  for(const tw of S.towers){if(tdrag&&tdrag.active&&tdrag.tw===tw)continue;const im=UPG_IMG[TOWERS[tw.type].upg];if(!im||!im.complete)continue;const ar=TOWERS[tw.type].area,br=TS*.3,bx=tw.x*K-br*1.05,by=tw.y*K+TS*.86;typeMark(c,ar,bx+br*2.1,by,br*.92);
    c.beginPath();c.arc(bx,by,br,0,7);c.fillStyle=UPG_COL[TOWERS[tw.type].upg];c.fill();c.lineWidth=Math.max(1.5,TS*.05);c.strokeStyle="#fff";c.stroke();c.drawImage(im,bx-br*.72,by-br*.72,br*1.44,br*1.44)}
  for(const tw of S.towers){if(tw.conc){const bx=tw.x*K-TS*.7,by=tw.y*K-TS*.72;c.font=`900 ${TS*.38}px sans-serif`;c.textAlign="center";c.textBaseline="middle";c.lineWidth=TS*.1;c.strokeStyle="#5a2a6e";c.strokeText("★"+(tw.conc+1),bx,by);c.fillStyle="#ffe45a";c.fillText("★"+(tw.conc+1),bx,by);c.textBaseline="alphabetic"}}
  for(const tw of S.towers){if(tc[tw.type]<2)continue;const bx=tw.x*K+TS*.78,by=tw.y*K-TS*.78+Math.sin(time*.15)*TS*.04,br=TS*.24;
    if(BADGE.complete&&BADGE.naturalWidth){c.drawImage(BADGE,bx-br*1.2,by-br*1.2,br*2.4,br*2.4);continue}
    c.beginPath();c.arc(bx,by,br,0,7);c.fillStyle="#2bd889";c.fill();c.lineWidth=TS*.05;c.strokeStyle="#0d3b26";c.stroke();
    c.beginPath();c.moveTo(bx,by-br*.55);c.lineTo(bx+br*.5,by+br*.05);c.lineTo(bx+br*.2,by+br*.05);c.lineTo(bx+br*.2,by+br*.55);c.lineTo(bx-br*.2,by+br*.55);c.lineTo(bx-br*.2,by+br*.05);c.lineTo(bx-br*.5,by+br*.05);c.closePath();c.fillStyle="#fff";c.fill()}
  if(S.sel){c.strokeStyle="#fff";c.lineWidth=2;c.strokeRect(S.sel.x*K-TS+3,S.sel.y*K-TS+3,TS*2-6,TS*2-6)}
  drawPropsFloor(c,time);
  for(const m of S.mons)drawMon(c,m,time);
  drawPropsTop(c,time);
  drawCrate(c,time);
  tipDraw(c,time);
  // status icons: slowed (storm) and cursed monsters, buffed characters
  const si=(k,x,y,z)=>{const im=STAT_IMG[k];if(im&&im.complete&&im.naturalWidth)c.drawImage(im,x-z/2,y-z/2,z,z)};
  for(const m of S.mons){let n=0;const z=TS*.5,y=m.y*K-monR(m)*K-TS*.55;if(m.slowT>0)si("status_slow",m.x*K-z*.55+n++*z*1.1,y,z);if(m.curseT>0)si("status_curse",m.x*K-z*.55+n++*z*1.1,y,z)}
  for(const tw of S.towers){let n=0;const z=TS*.42,x=tw.x*K-TS*.72,y=tw.y*K-TS*.7;if(tw.bSpd/(tw.aSpd||1)>1)si("buff_speed",x,y+n++*z*1.05,z);if(tw.bPow/(tw.aPow||1)>1)si("buff_power",x,y+n++*z*1.05,z)}
  for(const p of S.proj){if(p.delay>0)continue;const im=SPR[p.t.uid]&&SPR[p.t.uid].proj;if(!im)continue;
    const z=TS*(p.bee?.6:p.t.uid===55?1:.7);c.save();c.translate(p.x*K,p.y*K);c.rotate(p.t.weapon.startsWith("Glave")?p.age*.6:p.a);cell(c,im,Math.floor(p.age/2)%2,2,-z/2,-z/2,z,z);c.restore()}
  for(const f of S.fx)drawFx(c,f);
}
function drawMon(c,m,time){
  const fade=Math.min(1,(PATHLEN-m.d)/56);if(fade<1){c.save();c.globalAlpha=Math.max(0,fade);drawMon0(c,m,time);c.restore();return}drawMon0(c,m,time)}
function drawMon0(c,m,time){
  const r=monR(m)*K*1.45*(MQ.matches?1.1:1)*(m.def.boss?1.6:1)*(m.kind==="mission"?1.4:1),x=m.x*K,y=m.y*K;
  c.save();c.translate(x,y);
  if(m.def.boss||m.kind==="mission"){c.beginPath();c.arc(0,0,r*(m.def.spr&&MSPR[m.def.spr]?1.05:1.45),0,7);c.strokeStyle=m.kind==="mission"?"#ffb547":"#ff6f7d";c.lineWidth=2;c.globalAlpha=.6+Math.sin(time*.2)*.3;c.stroke();c.globalAlpha=1}
  c.rotate(m.a);
  const ms=m.def.spr&&MSPR[m.def.spr];
  if(ms&&ms.walk){const z=r*2.9*(m.def.boss?.78:1);cell(c,ms.walk,Math.floor((time+m.id*2)/3)%4,4,-z/2,-z/2,z,z);c.restore();drawMonBars(c,m,x,y,r);return}
  const wob=Math.sin(time*.4+m.id)*r*.08;
  c.beginPath();const n=m.def.boss?10:6+(m.def.u%4);
  for(let k=0;k<n*2;k++){const a=k*Math.PI/n,rr=k%2?r*.78:r*(1.08)+(k===0?r*.25:0);c.lineTo(Math.cos(a)*rr+wob*(k%2),Math.sin(a)*rr)}
  c.closePath();c.fillStyle=`hsl(${m.hue} 55% 38%)`;c.fill();c.strokeStyle=`hsl(${m.hue} 70% 62%)`;c.lineWidth=1.5;c.stroke();
  disc(c,r*.35,0,r*.22,"#f4f1e8");disc(c,r*.42,0,r*.1,"#111");
  c.restore();
  drawMonBars(c,m,x,y,r);
}
function drawMonBars(c,m,x,y,r){
  if(m.acid){c.fillStyle="#7dff6a";for(let k=0;k<Math.min(m.acid,5);k++)c.fillRect(x-r+k*4,y+r+3,3,3)}
  if(m.hp<m.maxhp||m.sh<m.maxsh){const w=Math.max(18,r*2.2);c.fillStyle="#000a";c.fillRect(x-w/2,y-r-8,w,4);c.fillStyle=m.hp/m.maxhp>.4?"#5ee6a8":"#ff6f7d";c.fillRect(x-w/2,y-r-8,w*Math.max(0,m.hp/m.maxhp),4);if(m.maxsh){c.fillStyle="#5aa9ff";c.fillRect(x-w/2,y-r-12,w*m.sh/m.maxsh,3)}}
}
const FLAME_PAL={fire:["rgba(255,245,170,1)","rgba(255,150,30,.95)","rgba(225,50,15,.6)","rgba(180,30,10,0)"],
  gas:["rgba(240,215,255,.95)","rgba(180,90,240,.8)","rgba(120,40,170,.5)","rgba(90,20,130,0)"],acid:["rgba(240,255,200,.95)","rgba(160,240,60,.85)","rgba(80,170,30,.5)","rgba(50,120,20,0)"]};
function drawFx(c,f){
  const a=f.life/f.max;c.save();c.globalAlpha=Math.min(1,a*1.4);c.strokeStyle=f.c;c.fillStyle=f.c;
  if(f.k==="mdie"){c.globalAlpha=1;const z=f.z*K;c.translate(f.x*K,f.y*K);c.rotate(f.a);cell(c,MSPR[f.spr].death,Math.min(3,Math.floor((1-a)*4)),4,-z/2,-z/2,z,z)}
  else if(f.k==="bolt"||f.k==="beam"){c.lineWidth=(f.w||2)*(f.k==="beam"?1.6:1)*a+.5;c.beginPath();c.moveTo(f.x*K,f.y*K);c.lineTo(f.x2*K,f.y2*K);c.stroke();if(f.k==="beam"){c.globalAlpha*=.3;c.lineWidth*=3;c.stroke()}disc(c,f.x2*K,f.y2*K,3+3*a,f.c)}
  else if(f.k==="slash"){c.lineWidth=3;c.beginPath();c.arc(f.x2*K,f.y2*K,12,a*4,a*4+2.2);c.stroke()}
  else if(f.k==="swarm"){for(let k=0;k<8;k++){const t=1-a,ang=k*.8;const px=f.x+(f.x2-f.x)*t+Math.cos(ang+t*6)*20,py=f.y+(f.y2-f.y)*t+Math.sin(ang+t*6)*20;disc(c,px*K,py*K,2.5,f.c)}}
  else if(f.k==="ring"){c.lineWidth=3*a+1;c.beginPath();c.arc(f.x*K,f.y*K,f.r*K*(1.15-a*.4),0,7);c.stroke();c.globalAlpha*=.15;c.fill()}
  else if(f.k==="flame"){ // flamethrower jet: a widening, flickering stream from the nozzle to the target
    const life=1-a,len=Math.min(1,life*3.5);c.globalAlpha=Math.min(1,a*2.2);const n=18;
    for(let k=0;k<=n*len;k++){const u=k/n,x=(f.x+(f.x2-f.x)*u)*K+(Math.random()-.5)*TS*.12,y=(f.y+(f.y2-f.y)*u)*K+(Math.random()-.5)*TS*.12,r=TS*(.12+.42*u)*(0.8+Math.random()*.4);
      const g=c.createRadialGradient(x,y,0,x,y,r);const P=FLAME_PAL[f.pal||"fire"];g.addColorStop(0,P[0]);g.addColorStop(.35,P[1]);g.addColorStop(.75,P[2]);g.addColorStop(1,P[3]);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill()}}
  else if(f.k==="spine"){c.lineWidth=6*a+1;c.setLineDash([8,5]);c.beginPath();c.moveTo(f.x*K,f.y*K);c.lineTo(f.x2*K,f.y2*K);c.stroke()}
  else if(f.k==="imp"){const fr=Math.min(3,Math.floor((1-f.life/f.max)*4)),z=TS*1.5*f.s;c.globalAlpha=1;cell(c,f.im,fr,4,f.x*K-z/2,f.y*K-z/2,z,z)}
  else if(f.k==="spike"){const el=f.max-f.life;if(el<f.del*.6||!f.im){c.restore();return}c.globalAlpha=Math.min(1,f.life/5);const z=TS*.95;cell(c,f.im,f.v,2,f.x*K-z/2,f.y*K-z*.75,z,z)}
  else if(f.k==="txt"){const u=1-a;c.globalAlpha=a<.3?a/.3:1;const sz=TS*(f.big?.62:.4)*(f.big?1+Math.max(0,.25-u)*2:1);c.font=`900 ${sz}px ${getComputedStyle(document.body).getPropertyValue("--display")||"sans-serif"}`;c.textAlign="center";c.textBaseline="middle";
    const x=f.x*K,y=f.y*K-u*TS*(f.big?.9:.7);c.lineWidth=Math.max(3,sz*.18);c.strokeStyle=f.sc||"#3a1d00";c.strokeText(f.t,x,y);c.fillStyle=f.c;c.fillText(f.t,x,y);c.textBaseline="alphabetic"}
  else if(f.k==="pop"){c.lineWidth=2;c.beginPath();c.arc(f.x*K,f.y*K,f.r*K*(1.3-a*.6),0,7);c.stroke()}
  c.restore();
}

// ---------- UI panels ----------
let tab="pUpg";
function desc(t){
  const w=t.weapon;let s;
  if(w.startsWith("Glave"))s=`맞은 적 옆으로 튕겨 ${t.maxHit}명까지 공격`;
  else if(w==="Subterranean_Spines")s=`일직선으로 꿰뚫어 ${t.maxHit}명까지 공격`;
  else if(t.exp==="Corrosive_Acid")s="맞은 적의 방어를 녹여요";
  else if(t.shots>1)s="벌떼를 날려 여러 번 공격";
  else{const sp=t.cd<=10?"아주 빠르게 ":t.cd<=17?"빠르게 ":t.cd>=40?"느리지만 세게 ":"";const rg=t.rt<=1?"바로 옆 ":t.rt>=4?"멀리 있는 ":"";
    s=t.splash[2]>0?`${rg}적 ${t.maxHit}명을 ${sp}한 번에 공격`:`${rg}적 1명을 ${sp}공격`}
  if(t.dtype==="Ignore_Armor")s+=" · 방어 무시";return s}
function sameCount(tw){return S.towers.filter(o=>o.type===tw.type).length}
// character card: four numbers + at most two short trait tags, then 판매 / 합성
function traitTags(t){const tags=[];if(t.area)tags.push("범위 공격");const a=t.aura,pc=v=>Math.round(v*100)+"%";
  if(a){const w=a.r>9?"판 전체":`주변 ${a.r}칸`;if(a.spd)tags.push(`${w} 아군 공격 속도 +${pc(a.spd)}`);if(a.pow)tags.push(`${w} 아군 공격력 +${pc(a.pow)}`);if(a.slowAll)tags.push(`모든 적 ${pc(a.slowAll)} 느리게`)}
  if(t.curse)tags.push(`저주: 받는 피해 +${pc(t.curse.v)}`);if(t.slow)tags.push(`맞은 적 ${pc(t.slow.v)} 느리게`);
  if(t.weapon.startsWith("Glave"))tags.push("튕김");else if(t.weapon==="Subterranean_Spines")tags.push("일직선 관통");else if(t.shots>1)tags.push(`벌떼 ${t.shots}마리`);
  if(t.dtype==="Ignore_Armor")tags.push("방어 무시");if(t.exp==="Corrosive_Acid")tags.push("방어 녹임");
  return tags}
function renderBubble(){
  const bb=$("bubble"),tw=S&&S.sel;if(!tw){bb.hidden=true;bb.dataset.id="";return}
  const t=TOWERS[tw.type],key=[tw.id,sameCount(tw),lvl(t),tw.bSpd,tw.bPow,tw.conc||0,S.ore>=xCost(t.grade)].join(":");
  if(bb.dataset.id!==key){
    bb.dataset.id=key;const can=sameCount(tw)>=2,sv=t.uid===81?1000:SELL[t.grade];
    const area=`${mh(t)}명`;
    bb.innerHTML=`<div class="bh"><span class="gchip" style="background:${GCOL[t.grade]}">${GRADE[t.grade]}</span><b>${t.name}${tw.conc?` <span class="conc">★${tw.conc+1}</span>`:""}</b><span class="uchip" style="background:${UPG_COL[t.upg]}">${UPGS.find(u=>u[0]===t.upg)[1]}</span></div>
    ${`<div class="stats"><div><small>공격력</small><b>${fmt(hitDmg(t)*t.factor*(tw.bPow||1))}</b></div><div><small>공격 속도</small><b>${(t.cd/24/(tw.bSpd||1)).toFixed(1)}초</b></div><div><small>사거리</small><b>${rtOf(t)}칸</b></div><div><small>대상</small><b>${area}</b></div></div>`}
    ${traitTags(t).map(x=>`<span class="tag">${x}</span>`).join("")}
    <div class="bb"><button type="button" class="btn" id="bbS" ${sv?"":"disabled"}>판매${sv?" +"+sv:""}</button>${has("junk")&&t.grade<5?`<button type="button" class="btn" id="bbX" ${S.ore<xCost(t.grade)?"disabled":""}>교환 -${xCost(t.grade)}</button>`:""}<button type="button" class="btn primary" id="bbM" ${can?"":"disabled"}>${t.grade>=5?"농축":"합성"}</button></div>`;
    $("bbM").onclick=()=>{merge(tw)};if($("bbX"))$("bbX").onclick=()=>{exchange(tw)};$("bbS").onclick=()=>{sell(tw)};
  }
  bb.hidden=false;placeBubble();
}
function placeBubble(){
  const bb=$("bubble"),tw=S&&S.sel;if(!tw||bb.hidden)return;
  const st=bb.parentElement.getBoundingClientRect(),r=cv.getBoundingClientRect();
  const x=r.left+tw.x*K*r.width/cv.width-st.left,y=r.top+tw.y*K*r.height/cv.height-st.top,half=TS*r.width/cv.width;
  const w=bb.offsetWidth,h=bb.offsetHeight;let top=y-half-h-6;if(top<4)top=y+half+6;
  const left=Math.max(4,Math.min(st.width-w-4,x-w/2));bb.style.left=left+"px";bb.style.top=top+"px";
}
function renderSel(){
  const b=$("selBody");const showT=viewType!=null?TOWERS[viewType]:null;
  if(!showT){b.innerHTML=`<p class="hint">빈 칸을 누르면 골드 100으로 캐릭터를 뽑아요. 캐릭터를 누르면 합성하거나 팔 수 있어요.${S&&S.picks.length?`<br>다음에 나올 캐릭터: ${S.picks.map(i=>TOWERS[i].name).join(", ")}`:""}</p>`;return}
  const t=showT,L=S?lvl(t):3,dmg=hitDmg(t),own=S?S.towers.filter(o=>o.type===t.i).length:0;
  b.innerHTML=`<div class="sel"><img alt="" src="${ICON[t.i]}"><div><span class="gchip" style="background:${GCOL[t.grade]}">${GRADE[t.grade]}</span><div class="tname">${t.name}</div></div></div>
  <p class="desc">${desc(t)}</p>
  <dl class="kv"><dt>공격력</dt><dd>${fmt(dmg*t.factor*(t.shots||1))}</dd><dt>공격 간격</dt><dd>${(t.cd/24).toFixed(2)}초</dd><dt>사거리</dt><dd>${t.rt}칸</dd><dt>보유</dt><dd>${own}명</dd></dl>`;
}
let viewType=null;
function renderPanels(){
  if(!S)return;renderSel();
  // upgrades: groups with owned characters first
  const ownCnt={};for(const tw of S.towers){const k=TOWERS[tw.type].upg;ownCnt[k]=(ownCnt[k]||0)+1}
  const ownTypes=new Set(S.towers.map(o=>o.type));
  const order=UPGS.map((u,i)=>[u,i]).sort((a,b)=>((ownCnt[b[0][0]]?1:0)-(ownCnt[a[0][0]]?1:0))||a[1]-b[1]).map(x=>x[0]);
  $("augBody").innerHTML=augDetail();
  const row=([k,n])=>{const lv=upgShown(k),cost=upgCostOf(k),st=Math.round(upgStep(k)*100),cur=Math.round(upgStep(k)*lv*100);
    const mine=TOWERS.filter(t=>(isType(k)?typeKey(t)===k:t.upg===k)&&ownTypes.has(t.i));
    return `<div class="row up ${mine.length?"":"dim"}"><img class="gi" alt="" style="background:${UPG_COL[k]};border-radius:50%;padding:4px;box-sizing:border-box" src="ui/icons/icon_${UPG_ICON[k]}.svg"><div><b class="un" style="color:${UPG_COL[k]}">${n}</b><small class="ud">공격력 +${cur}% → <b class="nx">+${cur+st}%</b></small><span class="ui">${mine.length?mine.slice(0,4).map(t=>`<img alt="${t.name}" src="${ICON[t.i]}">`).join("")+(mine.length>4?`<small>+${mine.length-4}</small>`:""):`<small>보유 캐릭터 없음</small>`}</span></div><span class="lv">Lv${lv}</span><button class="btn gem" data-u="${k}" ${S.gas<cost?"disabled":""}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12l4 6-10 11L2 10z"/></svg>${cost}</button></div>`};
  $("pUpg").innerHTML=`<p class="upH">계열별 <small>레벨당 공격력 +${Math.round(UPG_LINE_K*100)}%</small></p><div class="rows">${order.map(row).join("")}</div><p class="upH">공격 방식별 <small>레벨당 공격력 +${Math.round(UPG_TYPE_K*100)}% · 적용 캐릭터가 더 많아요</small></p><div class="rows">${UPGS_T.map(row).join("")}</div>`;
  $("pUpg").querySelectorAll("[data-u]").forEach(b=>b.onclick=()=>buyUpg(b.dataset.u));
  // missions
  $("pMis").innerHTML=`<div class="rows">${MISSIONS.map((d,i)=>`<div class="row mis"><img class="mi" alt="" src="ui/missions/icon_mission_${i+1}.png"><div>${i+1}단계 · ${d.name}<small>권장 ${MIS_REC[i]}웨이브부터 · 보상 골드 +${d.reward}</small><small>놓치면 목숨 -10</small></div><span class="lv misLv">${misLeft(i)>0?misLeft(i)+"웨이브 뒤":""}</span><button class="btn" data-m="${i}" ${misLeft(i)>0||!running?"disabled":""}>도전</button></div>`).join("")}</div>`;
  $("pMis").querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>mission(+b.dataset.m));
  {const fr=S.freeTix>0,dis=(!fr&&S.ore<100)||lottoBusy;$("lottoBtn").disabled=dis;$("navLotto").disabled=dis;const lb=fr?`무료 ${S.freeTix}장`:"골드 100";$("lottoBtn").querySelector("span").textContent=lb;$("navLotto").querySelector("small").textContent=lb}
  {const n=mergeablePairs();$("mergeAll").disabled=!n||!running;$("mergeAllN").textContent=n;$("navMerge").disabled=!n||!running;$("navMergeN").textContent=n;$("navMergeN").hidden=!n}
  if(rail.dataset.view==="sel"&&!S.sel&&viewType==null)closeSheet();
  {const el=$("lottoOdds");if(el)el.innerHTML=lottoOddsHTML()}
  // codex
  const oc={};for(const o of S.towers)oc[o.type]=(oc[o.type]||0)+1;
  document.querySelectorAll("#codex .ci").forEach(b=>{const n=oc[+b.dataset.t]||0;b.classList.toggle("own",n>0);b.querySelector(".cnt").textContent=n?n:""});
  renderBubble();
}
function hud(){
  if(!S)return;
  {const n=S.wi+(S.phase==="wave"?1:0);$("sWave").textContent=n>40?`${n}`:`${n}/40`}
  $("sTimerLbl").textContent=S.phase==="prep"?"다음 웨이브":"남은 적";
  $("sTimer").textContent=S.phase==="prep"?Math.ceil(S.cd/24)+"s":String(S.mons.length+S.spawnLeft);$("skipBtn").hidden=S.phase!=="prep"||!running;
  $("sLife").textContent=S.life;const kf=n=>n>=10000?(n/1000).toFixed(1).replace(/\.0$/,"")+"k":String(n);$("sOre").textContent=kf(S.ore);$("sGas").textContent=kf(S.gas);$("sKill").textContent=S.kills;
}

// ---------- input ----------
let hover=null;
function slotAt(ev){const r=cv.getBoundingClientRect();const x=(ev.clientX-r.left)/r.width*cv.width/K,y=(ev.clientY-r.top)/r.height*cv.height/K;
  return SLOTS.find(s=>Math.abs(s.x-x)<=WT&&Math.abs(s.y-y)<=WT)||null}
cv.addEventListener("pointermove",e=>{if(e.pointerType!=="touch")hover=slotAt(e)});
cv.addEventListener("pointerleave",()=>hover=null);
// ---------- mobile pan (drag to move the zoomed map) ----------
const vp=$("vp");let panX=0,panY=0,drag=null,panned=false;
function clampPan(){
  const r=cv.getBoundingClientRect(),w=r.width,h=r.height;
  panX=Math.max(0,Math.min(panX,w-vp.clientWidth));panY=Math.max(0,Math.min(panY,h-vp.clientHeight));
  cv.style.transform=`translate(${-panX}px,${-panY}px)`}
function fitVp(){
  // whole board always fits the screen: no scrolling
  const top=(MQ.matches?document.querySelector(".stage"):vp).getBoundingClientRect().top+window.scrollY,nav=MQ.matches?(document.querySelector(".mnav").offsetHeight||58):16;
  const availH=Math.max(240,window.innerHeight-top-nav-(MQ.matches?14:8)-CRATE_STRIP),availW=document.querySelector(".board").clientWidth-2;
  // fixed 6x9-cell board, uniformly scaled to fit and centered
  const t=Math.min(availW/COLS,availH/ROWS);const w=Math.floor(t*COLS),h=Math.floor(t*ROWS);
  cv.style.width=w+"px";cv.style.height=h+"px";vp.style.width=w+"px";vp.style.height=h+"px";panX=panY=0;clampPan()}
// ---------- drag a character to another slot (move, or swap if occupied) ----------
let tdrag=null;
function moveTower(tw,to){
  if(!to||to===tw.slot)return false;const from=tw.slot,other=to.tower;
  if(other){other.slot=from;other.x=from.x;other.y=from.y;from.tower=other}else from.tower=null;
  tw.slot=to;tw.x=to.x;tw.y=to.y;to.tower=tw;return true}
vp.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"&&e.button!==0)return;panned=false;
  if(!S||!running)return;const s=slotAt(e);if(!s||!s.tower)return;
  tdrag={tw:s.tower,x:e.clientX,y:e.clientY,id:e.pointerId,active:false,cx:0,cy:0,over:null}});
vp.addEventListener("pointermove",e=>{if(!tdrag||e.pointerId!==tdrag.id)return;
  if(!tdrag.active&&Math.hypot(e.clientX-tdrag.x,e.clientY-tdrag.y)>10){tdrag.active=true;panned=true;S.sel=null;renderBubble();try{vp.setPointerCapture(e.pointerId)}catch(_){}}
  if(tdrag.active){const r=cv.getBoundingClientRect();tdrag.cx=(e.clientX-r.left)/r.width*cv.width;tdrag.cy=(e.clientY-r.top)/r.height*cv.height;tdrag.over=slotAt(e)}});
const endTDrag=e=>{if(!tdrag||e.pointerId!==tdrag.id)return;
  if(tdrag.active&&e.type==="pointerup"){const to=slotAt(e);if(moveTower(tdrag.tw,to))renderPanels()}
  tdrag=null};
vp.addEventListener("pointerup",endTDrag);vp.addEventListener("pointercancel",endTDrag);
cv.addEventListener("click",e=>{if(panned){e.stopImmediatePropagation();panned=false}},true);
addEventListener("resize",fitVp);MQ.addEventListener?.("change",fitVp);setTimeout(fitVp,0);addEventListener("load",fitVp);
let lastTap={};
cv.addEventListener("click",e=>{if(!S)return;const s=slotAt(e);viewType=null;
  if(!s){S.sel=null;renderPanels();return}
  if(s.tower){const tw=s.tower,now=performance.now();
    // double tap on a character that has a partner = merge right away
    if(lastTap.tw===tw&&now-lastTap.t<380&&sameCount(tw)>=2){lastTap={};merge(tw,false,true);S.sel=null;if(rail.dataset.view==="sel")closeSheet();renderPanels();return}
    lastTap={tw,t:now};S.sel=S.sel===tw?null:tw}else{if(S.sel){S.sel=null}else build(s)}if(rail.dataset.view==="sel")closeSheet();renderPanels()});
const rail=$("rail");
const SHEET_TITLE={sel:"캐릭터 정보",pUpg:"업글",pMis:"도전 미션",pAug:"내 증강",codex:"도감"};
function selectTab(pid){if(!MQ.matches)return;$("pUpg").hidden=pid!=="pUpg";$("pMis").hidden=pid!=="pMis"}
function openSheet(v){
  if(!MQ.matches)return;
  if(S&&v!=="sel"){S.sel=null;renderBubble()}
  rail.dataset.view=v;if(v.startsWith("p"))selectTab(v);
  $("sheetTitle").textContent=SHEET_TITLE[v]||"";rail.classList.add("open");rail.scrollTop=0;
  document.querySelectorAll(".mnav button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.sheet===v));
}
function closeSheet(){rail.classList.remove("open");rail.dataset.view="none";document.querySelectorAll(".mnav button").forEach(b=>b.setAttribute("aria-pressed","false"))}
document.querySelectorAll(".mnav button[data-sheet]").forEach(b=>b.onclick=()=>{const v=b.dataset.sheet;if(rail.classList.contains("open")&&rail.dataset.view===v)closeSheet();else openSheet(v)});
$("sheetClose").onclick=()=>{closeSheet();if(S&&rail.dataset.view==="none"){}};
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>selectTab(b.dataset.p));
const SPEEDS=[1,2,3,5],SPL=["x1","x2","x3","x5"];let spI=0;$("spX").onclick=()=>{spI=(spI+1)%SPEEDS.length;speed=SPEEDS[spI];$("spX").textContent=SPL[spI]};
$("spP").onclick=()=>{paused=!paused;$("spP").setAttribute("aria-pressed",paused);$("spP").setAttribute("aria-label",paused?"계속하기":"일시정지")};
document.addEventListener("keydown",e=>{if(!S||!S.sel)return;if(e.key==="q"||e.key==="Q")merge(S.sel);if(e.key==="s"||e.key==="S")sell(S.sel)});
$("dNormal").onclick=()=>start("normal");
$("skipBtn").onclick=()=>{if(S&&running&&S.phase==="prep")S.cd=1};
$("mergeAll").onclick=$("navMerge").onclick=()=>{if(S)mergeAll()};
$("lottoBtn").onclick=$("navLotto").onclick=()=>{if(S&&running)lotto()};
document.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".seg button").forEach(o=>o.setAttribute("aria-selected",o===b));$("pUpg").hidden=b.dataset.p!=="pUpg";$("pMis").hidden=b.dataset.p!=="pMis"});
$("restart").onclick=()=>{$("endOv").hidden=true;$("rewardOv").hidden=true;rewardOpen=false;start("normal")};
$("goHome").onclick=()=>{$("endOv").hidden=true;$("rewardOv").hidden=true;rewardOpen=false;showHome();S=null;render()};

function start(d){
  audioInit();
  S=null;running=false;fitVp();
  closeAug();setTheme(0,false);S=fresh(d);$("startOv").hidden=true;document.body.classList.remove("atHome");$("endOv").hidden=true;$("log").innerHTML="";running=true;
  log("50초 뒤 첫 웨이브가 옵니다. 빈 발판을 눌러 타워를 지으세요.");renderPanels();
}

// ---------- boot ----------
function buildCodex(){makeIcons();$("codex").innerHTML=[0,1,2,3,4,5].map(g=>`<div class="crow"><span class="glab" style="color:${GCOL[g]}">${GRADE[g]}</span><div class="cgrid">${byGrade(g).map(t=>`<button type="button" class="ci" data-t="${t.i}" title="${t.name}" style="--gc:${GCOL[g]}"><img alt="${t.name}" src="${ICON[t.i]}"><b class="cn">${t.short||t.name}</b><span class="cnt"></span></button>`).join("")}</div></div>`).join("");
document.querySelectorAll("#codex .ci").forEach(im=>im.onclick=()=>codexDetail(+im.dataset.t));if(S)renderPanels()}
// tapping a codex entry: a large card over everything (home screen and in game, phone and desktop)
function codexDetail(i){
  const t=TOWERS[i];let el=$("cxDet");if(!el){el=document.createElement("div");el.id="cxDet";el.className="cxDet";el.onclick=e=>{if(e.target===el||e.target.closest(".cxX"))el.hidden=true};document.body.appendChild(el)}
  const dmg=hitDmg(t),own=S?S.towers.filter(o=>o.type===t.i).length:null,role={Melee:"근접",Shot:"사격",Sniper:"저격"}[ROLE[t.uid]]||"";
  el.innerHTML=`<div class="cxCard" style="--gc:${GCOL[t.grade]}"><button type="button" class="cxX" aria-label="닫기">✕</button>
   <div class="cxTop"><div class="cxImg"><img alt="" src="${ICON[t.i]}"></div><div><span class="gchip" style="background:${GCOL[t.grade]}">${GRADE[t.grade]}</span><h3>${t.name}</h3><p class="cxTags">${role}${role?" · ":""}${t.area?"범위":"단발"}${t.area?` · 최대 ${t.maxHit}명`:""}</p></div></div>
   <p class="cxDesc">${desc(t)}</p>
   <dl class="cxKv"><div><dt>공격력</dt><dd>${fmt(dmg*t.factor*(t.shots||1))}</dd></div><div><dt>공격 간격</dt><dd>${(t.cd/24).toFixed(2)}초</dd></div><div><dt>사거리</dt><dd>${t.rt}칸</dd></div>${own!=null?`<div><dt>보유</dt><dd>${own}명</dd></div>`:""}</dl>
   ${S?`<p class="cxNote">공격력은 지금 업글 레벨 기준이에요.</p>`:""}</div>`;
  el.hidden=false}
buildCodex();loadSprites(buildCodex);
let last=performance.now(),acc=0,uiT=0;
function loop(now){
  const dt=Math.min(.25,(now-last)/1000);last=now;
  if(S&&S.sel)placeBubble();
  augLoopCheck();
  const menuHold=S&&running&&(S.sel||(MQ.matches&&rail.classList.contains("open")));document.body.classList.toggle("menuHold",!!menuHold&&!paused);
  if(S&&running&&!paused&&!rewardOpen&&!augOpen&&!pickOpen&&!menuHold){acc+=dt*24*speed;let n=0;while(acc>=1&&n<300&&running){tick();acc-=1;n++}}
  render();uiT+=dt;if(uiT>.25){uiT=0;hud();if(S&&tab)refreshLive()}
  requestAnimationFrame(loop);
}
let lastSig="";
function refreshLive(){const sig=[S.ore,S.gas,S.mis.join(),S.wi,S.towers.length,S.sel&&S.sel.id,running].join("|");if(sig!==lastSig){lastSig=sig;renderPanels()}}
requestAnimationFrame(loop);
