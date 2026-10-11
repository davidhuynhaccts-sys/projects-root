'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import type { GameHandle, GameSnapshot, Control } from './game';
const initial:GameSnapshot={health:3,cookies:0,charge:0,detector:0,bossHealth:0,bossMax:18,status:'loading',hint:'Opening Jaylean’s Bakery…',progress:0};
export default function GameClient(){
 const mount=useRef<HTMLDivElement>(null), engine=useRef<GameHandle|null>(null);
 const [state,setState]=useState(initial),[muted,setMuted]=useState(false),[best,setBest]=useState(0),[error,setError]=useState('');
 useEffect(()=>{let disposed=false;let handle:GameHandle|undefined;
  try{setBest(Number(localStorage.getItem('superelly-best')||0));}catch{}
  import('./game').then(({createGame})=>{if(disposed||!mount.current)return;handle=createGame(mount.current,s=>{setState(s);if(s.status==='won'){try{const n=Math.max(s.cookies,Number(localStorage.getItem('superelly-best')||0));localStorage.setItem('superelly-best',String(n));setBest(n);}catch{}}});engine.current=handle;
   if('serviceWorker' in navigator) navigator.serviceWorker.ready.then(reg=>reg.active?.postMessage({type:'CACHE_GAME',urls:performance.getEntriesByType('resource').map(r=>r.name).filter(u=>{const url=new URL(u);return url.origin===location.origin&&url.pathname.startsWith('/_next/static/');})})).catch(()=>{});}).catch(()=>setError('The bakery couldn’t load. Check your connection and try again.'));
  if('serviceWorker' in navigator)navigator.serviceWorker.register('/superelly/sw.js',{scope:'/superelly/'}).catch(()=>{});
  const hidden=()=>{if(document.hidden)engine.current?.pause();};document.addEventListener('visibilitychange',hidden);
  return()=>{disposed=true;handle?.destroy();engine.current=null;document.removeEventListener('visibilitychange',hidden);};
 },[]);
 const press=(key:Control)=>(e:React.PointerEvent<HTMLButtonElement>)=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);engine.current?.input(key,true);};
 const release=(key:Control)=>(e:React.PointerEvent<HTMLButtonElement>)=>{e.preventDefault();engine.current?.input(key,false);};
 const button=(key:Control,symbol:string,label:string)=> <button className={`pad pad-${key}`} aria-label={label} onPointerDown={press(key)} onPointerUp={release(key)} onPointerCancel={release(key)} onLostPointerCapture={()=>engine.current?.input(key,false)}><span aria-hidden="true">{symbol}</span><small>{label}</small>{key==='special'&&<i style={{width:`${state.charge}%`}}/>}</button>;
 const toggleMute=()=>setMuted(v=>{engine.current?.mute(!v);return !v;});
 return <main className="elly-game-shell"><div className="elly-game">
 <header className="game-header"><div className="game-top"><Link href="/superelly" aria-label="Super Elly home" className="game-brand">Super Elly<small>BAKERY MONSTERS</small></Link><span className="level-label">Level 1<br/><b>Jaylean’s Bakery</b></span><button className="pause-btn" aria-label="Pause game" onClick={()=>engine.current?.pause()}>Ⅱ</button></div>
 <div className="game-stats"><div className="hearts" aria-label={`${state.health} of 3 hearts`}>{[0,1,2].map(n=><span key={n} className={n<state.health?'':'empty-heart'}>♥</span>)}</div><div className="cookie-count" aria-label={`${state.cookies} cookies`}>🍪 <b>{String(state.cookies).padStart(2,'0')}</b></div><div className="detector"><span>♧ Monster Detector</span><div role="meter" aria-label="Monster proximity" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(state.detector)}><i style={{width:`${state.detector}%`}}/></div></div></div></header>
 <div className="game-stage"><div className="phaser-mount" ref={mount}/><div className="game-hint" aria-live="polite">{state.hint}</div>{state.bossHealth>0&&<div className="boss-hud"><span>Cookie Machine Monster</span><div><i style={{width:`${state.bossHealth/state.bossMax*100}%`}}/></div></div>}
 <div className="journey-track"><i style={{width:`${state.progress}%`}}/></div>
 {(state.status!=='playing')&&<div className="game-overlay"><section className="story-card">
 <span className="card-sparkle">✦</span><p className="eyebrow">SUPER ELLY • LEVEL 1</p>
 <h1>{error?'Oops!':state.status==='loading'?'A little magic…':state.status==='ready'?'The cookie caper':state.status==='paused'?'Cookie break!':state.status==='won'?'You saved the cookies!':'A little more courage?'}</h1>
 <p>{error|| (state.status==='ready'?'A monster is making the cookie machine go wild! Help Elly cross the bakery and switch it off.':state.status==='paused'?'Your adventure will be right here.':state.status==='won'?`Jaylean can bake again! You rescued ${state.cookies} cookies. Best: ${best}.`:state.status==='lost'?'Those sneaky monsters! Take a breath and try again.':'Packing the flashlight and a little bravery.')}</p>
 {state.status==='ready'&&<div className="how-to"><span>◀ ▶ Move</span><span>↑ Jump</span><span>☀ Hold flashlight</span><span>✋ Action up close</span><span>★ Charge a special</span><span>🍪 Rescue cookies</span></div>}
 {error?<button className="elly-primary" onClick={()=>location.reload()}>Try loading again</button>:state.status!=='loading'&&<button className="elly-primary" onClick={()=>state.status==='paused'?engine.current?.resume():engine.current?.start()}>{state.status==='ready'?'Let’s go!':state.status==='paused'?'Keep playing':'Play again'} <span>➜</span></button>}
 {state.status==='loading'&&!error&&<div className="loading-dots">● ● ●</div>}
 <button className="sound-btn" onClick={toggleMute}>{muted?'♪ Sound off':'♫ Sound on'}</button>
 {(state.status==='won'||state.status==='paused')&&<Link className="home-link" href="/superelly">Back to Super Elly</Link>}
 {state.status==='ready'&&<small className="install-tip">iPhone: Share → Add to Home Screen<br/>Keyboard: arrows, Space, F, E, Q</small>}
 </section></div>}
 </div>
 <nav className="touch-controls" aria-label="Game controls"><div className="move-pad">{button('left','◀','Left')}{button('right','▶','Right')}<span>— MOVE —</span></div><div className="action-pad">{button('jump','↑','Jump')}{button('flash','🔦','Flashlight')}{button('action','✋','Action')}{button('special','★',state.charge>=100?'Ready!':'Special')}</div></nav>
 </div></main>
}
