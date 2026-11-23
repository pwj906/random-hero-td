// ---------- sound: every effect and the music are synthesized with Web Audio (no audio files) ----------
const SND={ctx:null,master:null,sfx:null,music:null,on:true,last:{},recent:[],bgm:null};
try{SND.on=localStorage.getItem("rhd_sound")!=="off"}catch(e){}
function audioInit(){
  if(SND.ctx){if(SND.ctx.state==="suspended")SND.ctx.resume();return}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  const c=SND.ctx=new AC();SND.master=c.createGain();SND.master.gain.value=SND.on?1:0;SND.master.connect(c.destination);
  const comp=c.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=6;comp.connect(SND.master);
  SND.sfx=c.createGain();SND.sfx.gain.value=.42;SND.sfx.connect(comp);
  SND.music=c.createGain();SND.music.gain.value=.16;SND.music.connect(comp);
  const n=c.sampleRate*.5,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;SND.noise=b;
  bgmStart();
}
function setSound(on){SND.on=on;try{localStorage.setItem("rhd_sound",on?"on":"off")}catch(e){}if(SND.master)SND.master.gain.setTargetAtTime(on?1:0,SND.ctx.currentTime,.05);const b=$("sndBtn");if(b){b.setAttribute("aria-pressed",String(!on));b.setAttribute("aria-label",on?"소리 끄기":"소리 켜기")}}
// one synth voice: osc type, start freq -> end freq, length, volume
function tone(type,f0,f1,len,vol,at,dest){const c=SND.ctx,t=at||c.currentTime,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+len);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+Math.min(.012,len*.2));g.gain.exponentialRampToValueAtTime(0.0001,t+len);o.connect(g);g.connect(dest||SND.sfx);o.start(t);o.stop(t+len+.02)}
function noise(len,vol,fq,q,at,type,dest){const c=SND.ctx,t=at||c.currentTime,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=SND.noise;f.type=type||"bandpass";f.frequency.setValueAtTime(fq,t);f.Q.value=q||1;
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+len);s.connect(f);f.connect(g);g.connect(dest||SND.sfx);s.start(t,Math.random()*.3);s.stop(t+len+.02)}
const notes=(base,steps,gap,type,len,vol)=>{const t=SND.ctx.currentTime;steps.forEach((s,i)=>tone(type,base*Math.pow(2,s/12),0,len,vol,t+i*gap))};
const SFX={
  build(){tone("square",520,880,.09,.12);tone("triangle",880,1320,.12,.08,SND.ctx.currentTime+.05)},
  rare(){notes(523,[0,4,7,12],.07,"square",.16,.1)},
  god(){notes(392,[0,4,7,12,16,19,24],.06,"square",.35,.09);noise(.9,.18,6000,.4,0,"highpass")},
  merge(){tone("sine",300,1200,.22,.22);tone("triangle",600,2400,.25,.08,SND.ctx.currentTime+.04)},
  atk_Melee(){noise(.07,.35,900,1.2);tone("triangle",180,90,.07,.18)},
  atk_Shot(){noise(.05,.28,2600,1.5);tone("square",900,300,.05,.05)},
  atk_Sniper(){noise(.12,.35,1800,.8);tone("sawtooth",1400,200,.1,.06)},
  boom(){noise(.28,.4,320,.7,0,"lowpass");tone("sine",110,45,.25,.25)},
  pop(){tone("sine",700+Math.random()*300,180,.07,.1)},
  hurt(){tone("sawtooth",220,110,.25,.18);tone("square",233,117,.25,.08)},
  wave(){noise(.35,.2,800,.5);tone("triangle",196,392,.3,.14)},
  boss(){const t=SND.ctx.currentTime;tone("sawtooth",98,98,.5,.2,t);tone("sawtooth",104,104,.5,.12,t);tone("sawtooth",73,73,.7,.2,t+.45);noise(.6,.25,200,.6,t,"lowpass")},
  clear(){notes(659,[0,4,7],.08,"triangle",.18,.14)},
  coin(){tone("square",988,988,.06,.08);tone("square",1319,1319,.14,.08,SND.ctx.currentTime+.06)},
  up(){notes(440,[0,5,9,12],.05,"square",.1,.08)},
  tick(){tone("square",1500,1500,.02,.04)},
  reel(){tone("triangle",420,260,.06,.12);noise(.04,.12,3000,2)},
  miss(){tone("triangle",392,196,.35,.14);tone("triangle",370,185,.35,.08,SND.ctx.currentTime+.05)},
  win(){notes(784,[0,4,7,12],.06,"square",.12,.08)},
  jackpot(){notes(523,[0,4,7,12,7,12,16,19,24],.07,"square",.2,.09);noise(1.2,.15,7000,.4,0,"highpass")},
  flip(){noise(.12,.18,2500,.8);tone("sine",500,900,.08,.05)},
  pick(){notes(660,[0,7,12],.06,"triangle",.22,.14)},
  frost(){notes(1760,[0,5,12],.035,"sine",.18,.06);noise(.2,.08,8000,1)},
  spike(){noise(.08,.3,1500,2);tone("square",300,120,.06,.08)},
  zap(){noise(.25,.35,3500,.4,0,"highpass");tone("sawtooth",1800,90,.22,.12)},
  over(){notes(392,[0,-2,-4,-7],.18,"triangle",.4,.15)},
};
// throttle: busy fights trigger hundreds of hits; keep it to a pleasant rate
const SFX_GAP={atk_Melee:.07,atk_Shot:.06,atk_Sniper:.09,boom:.1,pop:.05,frost:.12,spike:.08,zap:.15,reel:.05,tick:.03};
function sfx(name){
  if(!SND.ctx||!SND.on||!SFX[name])return;const now=SND.ctx.currentTime;
  if(SFX_GAP[name]){if(now-(SND.last[name]||0)<SFX_GAP[name]*(speed>2?1.6:1))return;SND.recent=SND.recent.filter(x=>now-x<.25);if(SND.recent.length>=6)return;SND.recent.push(now)}
  SND.last[name]=now;try{SFX[name]()}catch(e){}
}
// ---------- music: a small looping chiptune; calm for normal waves, faster minor key for bosses ----------
const SONGS={
  calm:{bpm:112,chords:[[0,4,7],[-5,-1,2],[-3,0,4],[-7,-3,0]],root:261.63,lead:[12,11,7,4, 9,7,4,2, 4,7,9,12, 11,7,14,12]},
  boss:{bpm:138,chords:[[0,3,7],[-4,0,3],[-2,2,5],[-5,-1,2]],root:220,lead:[12,15,12,10, 8,7,8,10, 12,15,19,17, 15,14,12,11]},
};
function bgmStart(){if(SND.bgm)return;SND.bgm={song:"calm",step:0,next:SND.ctx.currentTime+.1};setInterval(bgmPump,40)}
function bgmMode(m){if(SND.bgm&&SONGS[m])SND.bgm.song=m}
function bgmPump(){
  const B=SND.bgm,c=SND.ctx;if(!B||!c||c.state!=="running")return;
  const quiet=!running||paused||document.hidden;
  while(B.next<c.currentTime+.15){
    const s=SONGS[B.song],q=60/s.bpm/2,st=B.step%64,bar=Math.floor(st/16)%4,ch=s.chords[bar],t=B.next;
    if(!quiet){const fr=k=>s.root*Math.pow(2,k/12);
      if(st%4===0)tone("triangle",fr(ch[0]-12),0,q*3.6,.5,t,SND.music);
      tone("square",fr(ch[st%3]+(st%8>3?12:0)),0,q*.8,.12,t,SND.music);
      if(st%2===0){const ln=s.lead[(st/2)%16];if(ln!=null&&(B.song==="boss"||st%8!==6))tone("square",fr(ln),0,q*1.6,.13,t,SND.music)}
      if(st%8===0)noise(.12,.5,120,.8,t,"lowpass",SND.music);
      if(st%8===4)noise(.1,.35,1800,.7,t,"bandpass",SND.music);
      if(B.song==="boss"&&st%2===1)noise(.03,.18,7000,1,t,"highpass",SND.music)}
    B.step++;B.next+=q}
}
// speaker toggle in the corner of the board
(function(){const b=document.createElement("button");b.type="button";b.id="sndBtn";b.className="sndBtn";
  b.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path class="spk" d="M4 9h4l5-4v14l-5-4H4z"/><path class="on" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke-width="2" stroke-linecap="round"/><path class="off" d="M16 9l6 6M22 9l-6 6" fill="none" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  b.onclick=()=>{audioInit();setSound(!SND.on)};(document.querySelector(".speed.ctl")||document.querySelector(".stage")).appendChild(b);setSound(SND.on)})();
// browsers only allow sound after a tap: unlock on the first one
addEventListener("pointerdown",audioInit,{once:false,passive:true});
