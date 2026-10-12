'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import type {GameHandle} from './game';
import {type GameSnapshot, type Control} from './model';
const initial:GameSnapshot={health:5,cookies:0,charge:0,detector:0,bossHealth:0,bossMax:24,status:'loading',hint:'Opening Jaylean’s Bakery…',progress:0,zone:'The cookie shop',comboHits:0,comboMove:'',audioBlocked:false,superActive:false};
export default function GameClient(){
 const mount=useRef<HTMLDivElement>(null),engine=useRef<GameHandle|null>(null);
 const [state,setState]=useState(initial),[muted,setMuted]=useState(false),[best,setBest]=useState(0),[error,setError]=useState('');
 useEffect(()=>{let disposed=false;let handle:GameHandle|undefined;
  try{setBest(Number(localStorage.getItem('superelly-best')||0));}catch{}
  import('./game').then(({createGame})=>{if(disposed||!mount.current)return;handle=createGame(mount.current,s=>{setState(s);if(s.status==='won'){try{const n=Math.max(s.cookies,Number(localStorage.getItem('superelly-best')||0));localStorage.setItem('superelly-best',String(n));setBest(n);}catch{}}});engine.current=handle;
   if('serviceWorker' in navigator)navigator.serviceWorker.ready.then(reg=>reg.active?.postMessage({type:'CACHE_GAME',urls:performance.getEntriesByType('resource').map(r=>r.name).filter(u=>{const url=new URL(u);return url.origin===location.origin&&url.pathname.startsWith('/_next/static/');})})).catch(()=>{});
  }).catch(()=>setError('The bakery couldn’t load. Check your connection and try again.'));
  if('serviceWorker' in navigator)navigator.serviceWorker.register('/superelly/sw.js',{scope:'/superelly/'}).then(reg=>reg.update()).catch(()=>{});
  const hidden=()=>{if(document.hidden)engine.current?.pause();};document.addEventListener('visibilitychange',hidden);
  return()=>{disposed=true;handle?.destroy();engine.current=null;document.removeEventListener('visibilitychange',hidden);};
 },[]);
 const press=(key:Control)=>(e:React.PointerEvent<HTMLButtonElement>)=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);engine.current?.input(key,true);};
 const release=(key:Control)=>(e:React.PointerEvent<HTMLButtonElement>)=>{e.preventDefault();engine.current?.input(key,false);};
 const button=(key:Control,symbol:string,label:string)=><button className={`pad pad-${key} ${key==='special'&&state.charge>=100?'special-ready':''}`} aria-label={label} onPointerDown={press(key)} onPointerUp={release(key)} onPointerCancel={release(key)} onLostPointerCapture={()=>engine.current?.input(key,false)}><span aria-hidden="true">{symbol}</span><small>{label}</small>{key==='special'&&<i style={{width:`${state.charge}%`}}/>}</button>;
 const toggleMute=()=>{if(state.audioBlocked){engine.current?.mute(false);setMuted(false);}else setMuted(v=>{engine.current?.mute(!v);return !v;});};
 const failed=error||state.status==='error';
 return <main className="elly-game-shell"><div className="elly-game">
 <header className="game-header"><div className="game-top"><Link href="/superelly" aria-label="Super Elly home" className="game-brand">Super Elly<small>BAKERY MONSTERS</small></Link><span className="level-label">Level 1<br/><b>Jaylean’s Bakery</b></span><button className="audio-toggle" aria-label={muted?'Turn sound on':state.audioBlocked?'Start audio':'Mute sound'} onClick={toggleMute}>{muted?'♪̸':'♫'}</button><button className="pause-btn" aria-label="Pause game" onClick={()=>engine.current?.pause()}>Ⅱ</button></div>
 <div className="game-stats"><div className="hearts" aria-label={`${state.health} of 5 hearts`}>{[0,1,2,3,4].map(n=><span key={n} className={n<state.health?'':'empty-heart'}>♥</span>)}</div><div className="cookie-count" aria-label={`${state.cookies} cookies`}>🍪 <b>{String(state.cookies).padStart(2,'0')}</b></div><div className="detector"><span>♧ Monster Detector</span><div role="meter" aria-label="Monster proximity" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(state.detector)}><i style={{width:`${state.detector}%`}}/></div></div></div></header>
 <div className="game-stage"><div className="phaser-mount" ref={mount}/><div className="game-hint" aria-live="polite">{state.hint}</div>{state.bossHealth>0&&<div className="boss-hud"><span>Cookie Machine Monster</span><div><i style={{width:`${state.bossHealth/state.bossMax*100}%`}}/></div></div>}
 {state.audioBlocked&&state.status==='playing'&&<button className="audio-retry" onClick={toggleMute}>♫ Tap for music</button>}
 <div className="combo-hud" hidden={!state.superActive}><strong>{state.comboHits}</strong><span>HIT COMBO</span><small>{state.comboMove}</small></div>
 <div className="journey-track"><i style={{width:`${state.progress}%`}}/></div>
 {state.status==='won'?<div className="game-overlay ending-overlay"><section className="story-card ending-card"><p className="eyebrow">BAKERY RESCUED • LEVEL 1 COMPLETE</p><h1>Less moving.<br/>More cookies!</h1><p>Elly stopped the cookie machine’s extra trips and gave the cookies a short, careful route to the display. She eliminated unnecessary transportation waste!</p><div className="cookie-comparison"><div className="cookie-before"><b>BEFORE</b><span>Kitchen</span><div className="cookie-route tangled">🍪 ↔ 📦 ↔ 🍪<br/>↘ 📦 ↗<br/>💔 🍪 💔</div><span>Extra trips. Broken cookies.</span></div><div className="cookie-after"><b>AFTER</b><span>Kitchen</span><div className="cookie-route direct">🍪 🍪 🍪<br/>↓<br/>✨ 🍪 ✨</div><span>One short trip to the display.</span></div></div><p className="ending-score">{state.cookies} cookies rescued • Best: {best}</p><button className="elly-primary" onClick={()=>engine.current?.start()}>Play again ➜</button><Link className="home-link" href="/superelly">Back to Super Elly</Link></section></div>:state.status!=='playing' &&<div className="game-overlay"><section className="story-card">
 <span className="card-sparkle">✦</span><p className="eyebrow">SUPER ELLY • LEVEL 1</p>
 <h1>{failed?'Oops!':state.status==='loading'?'A little magic…':state.status==='ready'?'The cookie caper':state.status==='paused'?'Cookie break!':'A little more courage?'}</h1>
 <p>{error||(state.status==='error'?'An illustration couldn’t load. Please try again.':state.status==='ready'?'The machine is moving cookies too much and breaking them! Help Elly cross four bakery rooms and defeat the cookie machine monster.':state.status==='paused'?'Your adventure will be right here.':state.status==='lost'?'Those sneaky monsters! Take a breath and try again.':'Packing the flashlight and a little bravery.')}</p>
 {state.status==='ready'&&<div className="how-to"><span>✥ Move four ways</span><span>↑ Jump over trouble</span><span>🔦 Hold to attack</span><span>✋ Acrobatic Action</span><span>🍪 Cookies charge ★</span><span>★ 40-hit gymnastics blitz!</span></div>}
 {failed?<button className="elly-primary" onClick={()=>location.reload()}>Try loading again</button>:state.status!=='loading'&&<button className="elly-primary" onClick={()=>state.status==='paused'?engine.current?.resume():engine.current?.start()}>{state.status==='ready'?'Let’s go!':state.status==='paused'?'Keep playing':'Play again'} <span>➜</span></button>}
 {state.status==='loading'&&!failed&&<div className="loading-dots">● ● ●</div>}
 <button className="sound-btn" onClick={toggleMute}>{muted?'♪ Sound off':'♫ Music & sound on'}</button>
 {(state.status==='paused')&&<Link className="home-link" href="/superelly">Back to Super Elly</Link>}
 {state.status==='ready'&&<small className="install-tip">A 1–2 minute adventure • iPhone: Share → Add to Home Screen<br/>Keyboard: arrows/WASD • Space jump • F / E / Q</small>}
 </section></div>}
 </div>
 <nav className="touch-controls" aria-label="Game controls"><div className="move-pad">{button('up','▲','Up')}{button('left','◀','Left')}<span className="move-center">MOVE</span>{button('right','▶','Right')}{button('down','▼','Down')}</div><div className="action-pad">{button('jump','↑','Jump')}{button('flash','🔦','Flashlight')}{button('action','✋','Action')}{button('special','★',state.charge>=100?'Ready!':'Special')}</div></nav>
 </div></main>;
}
