"use client";
import {useEffect,useLayoutEffect,useMemo,useRef,useState} from "react";
import {FILMS,CORE_FILMS,EXPANDED_FILMS,QUESTIONS,RATINGS,TONES,LEGACY_TONE_LABELS,ASPECT_LABELS,AXES,AXIS_LABELS,TEST_VERSION} from "./lib/data";
import {complete,freshAnswer,normalizeAnswer,scoreProfile,type FilmAnswer,type Profile} from "./lib/score";
import Constellation from "./Constellation";
import {STILLS} from "./lib/stills";
const BASE="/thehuynhtest";
type User={id:string;handle:string;name:string;createdAt:number;shareEnabled:boolean};
type Friend={id:string;name:string;handle:string;profile:Profile};
type Tab="home"|"test"|"results"|"friends";
const palette=["#97cced","#fab67e","#b49be2","#81c8b1","#f0a8bc","#e8d17b","#93a4dc","#adce9f","#c5a3c8"];
export default function HuynhTest(){
 const [loading,setLoading]=useState(true),[user,setUser]=useState<User|null>(null),[authMode,setAuthMode]=useState<"login"|"register">("login");
 const [handle,setHandle]=useState(""),[password,setPassword]=useState(""),[displayName,setDisplayName]=useState("");
 const [authError,setAuthError]=useState(""),[authBusy,setAuthBusy]=useState(false);
 const [tab,setTab]=useState<Tab>("home"),[filmIndex,setFilmIndex]=useState(0),[answers,setAnswers]=useState<Record<string,FilmAnswer>>({}),[expanded,setExpanded]=useState(false);
 const ref=useRef<Record<string,FilmAnswer>>({}),timer=useRef<ReturnType<typeof setTimeout>|null>(null),pending=useRef<{id:string;answer:FilmAnswer}|null>(null),queue=useRef<Promise<unknown>>(Promise.resolve());
 const [saveState,setSaveState]=useState<"idle"|"saving"|"saved"|"error">("idle");
 const [sharing,setSharing]=useState<{enabled:boolean;token:string|null}>({enabled:false,token:null}),[shareBusy,setShareBusy]=useState(false);
 const [friends,setFriends]=useState<Friend[]>([]),[friendInput,setFriendInput]=useState(""),[friendError,setFriendError]=useState(""),[addingFriend,setAddingFriend]=useState(false);
 const [friendVisible,setFriendVisible]=useState<Record<string,boolean>>({});
 const currentFilms=expanded?FILMS:CORE_FILMS;
 const coreReady=CORE_FILMS.every(f=>Boolean(answers[f.id]&&complete(answers[f.id])));
 const expandedReady=FILMS.every(f=>Boolean(answers[f.id]&&complete(answers[f.id])));
 const film=FILMS[filmIndex];const answer=answers[film.id]||freshAnswer();
 const profile=useMemo(()=>scoreProfile(answers,expanded),[answers,expanded]);
 const answered=currentFilms.filter(f=>answers[f.id]&&complete(answers[f.id])&&answers[f.id].status==="watched").length;
 const skipped=currentFilms.filter(f=>answers[f.id]&&answers[f.id].status!=="watched").length;
 const activeFilmCount=answered+skipped;
 const shareUrl=sharing.enabled&&sharing.token&&typeof window!=="undefined"?window.location.origin+BASE+"/share/"+sharing.token:"";
 const participants=useMemo(()=>[{id:"self",name:user?.name||"You",color:palette[0],profile},...friends.filter(f=>friendVisible[f.id]!==false).map((f,i)=>({id:f.id,name:f.name,color:palette[(i+1)%palette.length],profile:f.profile}))],[user,profile,friends,friendVisible]);
 const request=async (url:string,init?:RequestInit)=>{const r=await fetch(BASE+url,{...init,headers:{"Content-Type":"application/json",...init?.headers},cache:"no-store"});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||"Request failed");return j;};
 async function initialize(){
  try{
   const a=await request("/api/account");
   if(a.user){setUser(a.user);const s=await request("/api/state");const raw=s.answers||{};ref.current=raw;setAnswers(raw);
    const enabled=Boolean(s.expanded);setExpanded(enabled);
     const coreComplete=CORE_FILMS.every(f=>Boolean(raw[f.id]&&complete(raw[f.id])));
     const unfinished=(enabled?FILMS:CORE_FILMS).findIndex(f=>!(raw[f.id]&&complete(raw[f.id])));
     setFilmIndex(unfinished<0?0:unfinished);setTab(coreComplete?"results":"home");
    const [share,friend]=await Promise.allSettled([request("/api/share"),request("/api/friends")]);
    if(share.status==="fulfilled")setSharing(share.value);
    if(friend.status==="fulfilled")setFriends(friend.value.friends||[]);
   }
  }catch(e){setAuthError(e instanceof Error?e.message:"Unable to connect to the assessment service.");}
  finally{setLoading(false);}
 }
 useEffect(()=>{initialize();return ()=>{if(timer.current)clearTimeout(timer.current)};},[]);
 const persist=(id:string,a:FilmAnswer)=>{
  const task=queue.current.catch(()=>{}).then(()=>request("/api/state",{method:"PUT",keepalive:true,body:JSON.stringify({filmId:id,answer:a})}));
  queue.current=task;task.then(()=>setSaveState("saved")).catch(()=>setSaveState("error"));
  return task;
 };
 const flush=()=>{
  if(timer.current){clearTimeout(timer.current);timer.current=null;}
  const p=pending.current;pending.current=null;if(p)persist(p.id,p.answer).catch(()=>{});
 };
 const change=(update:Partial<FilmAnswer>)=>{
  const old=ref.current[film.id]||freshAnswer();
  const next=normalizeAnswer(film,{...old,...update});
  ref.current={...ref.current,[film.id]:next};setAnswers(ref.current);setSaveState("saving");
  pending.current={id:film.id,answer:next};
  if(timer.current)clearTimeout(timer.current);
  timer.current=setTimeout(flush,520);
 };
 const navigate=(idx:number)=>{flush();setFilmIndex(Math.max(0,Math.min(currentFilms.length-1,idx)));setTab("test");};
 useLayoutEffect(()=>{if(tab!=="test")return;document.getElementById("ht-current-film-hero")?.scrollIntoView({behavior:"auto",block:"start"});},[filmIndex,tab]);
 const setTabSafe=(next:Tab)=>{flush();setTab(next);if(next!=="test")window.scrollTo(0,0);if(next==="friends")loadFriends();};
 useEffect(()=>{const onHide=()=>{if(document.visibilityState==="hidden")flush()};document.addEventListener("visibilitychange",onHide);window.addEventListener("pagehide",flush);return()=>{document.removeEventListener("visibilitychange",onHide);window.removeEventListener("pagehide",flush);};});
 async function submitAuth(e:React.FormEvent){
  e.preventDefault();setAuthBusy(true);setAuthError("");
  try{const a=await request("/api/account",{method:"POST",body:JSON.stringify({action:authMode,handle,password,name:displayName})});
   setUser(a.user);setPassword("");const s=await request("/api/state");const saved=s.answers||{};ref.current=saved;setAnswers(saved);
   const enabled=Boolean(s.expanded);setExpanded(enabled);
   const coreComplete=CORE_FILMS.every(f=>Boolean(saved[f.id]&&complete(saved[f.id])));
   const first=(enabled?FILMS:CORE_FILMS).findIndex(f=>!(saved[f.id]&&complete(saved[f.id])));
   setFilmIndex(first<0?0:first);setTab(coreComplete?"results":"home");setLoading(false);
   const [share,friend]=await Promise.allSettled([request("/api/share"),request("/api/friends")]);if(share.status==="fulfilled")setSharing(share.value);if(friend.status==="fulfilled")setFriends(friend.value.friends||[]);
  }catch(e){setAuthError(e instanceof Error?e.message:"Could not sign in");}finally{setAuthBusy(false);}
 }
 async function logout(){flush();await queue.current.catch(()=>{});await request("/api/account",{method:"DELETE"}).catch(()=>{});setUser(null);setAnswers({});ref.current={};setExpanded(false);setTab("home");setSharing({enabled:false,token:null});setFriends([]);}
 async function toggleSharing(){setShareBusy(true);try{const s=await request("/api/share",{method:"POST",body:JSON.stringify({enabled:!sharing.enabled})});setSharing(s);}catch(e){alert(e instanceof Error?e.message:"Could not update sharing");}finally{setShareBusy(false);}}
 async function loadFriends(){try{const f=await request("/api/friends");setFriends(f.friends||[]);}catch(e){setFriendError(e instanceof Error?e.message:"Unable to load friends");}}
 async function addFriend(e:React.FormEvent){e.preventDefault();setAddingFriend(true);setFriendError("");try{await request("/api/friends",{method:"POST",body:JSON.stringify({link:friendInput})});setFriendInput("");await loadFriends();}catch(e){setFriendError(e instanceof Error?e.message:"Could not add friend");}finally{setAddingFriend(false);}}
 async function removeFriend(id:string){try{await request("/api/friends",{method:"DELETE",body:JSON.stringify({id})});await loadFriends();}catch(e){setFriendError(e instanceof Error?e.message:"Could not remove friend");}}
 async function startExpanded(){
  if(!coreReady)return;
  flush();
  try{
   await request("/api/state",{method:"POST",body:JSON.stringify({action:"enableExpanded"})});
   setExpanded(true);
   const next=EXPANDED_FILMS.findIndex(f=>!(ref.current[f.id]&&complete(ref.current[f.id])));
   setFilmIndex(next<0?10:10+next);setTab(next<0?"results":"test");
  }catch(e){alert(e instanceof Error?e.message:"Could not unlock the expanded test.");}
 }
 function toggleTone(id:string){
  const earlier=answer.tones?.length?answer.tones:(answer.tone?[answer.tone]:[]);
  const current=earlier.filter(x=>TONES.some(t=>t.id===x));
  let next:string[];
  if(id==="indifferent"||id==="unsure")next=current.includes(id)?[]:[id];
  else if(current.includes(id))next=current.filter(x=>x!==id);
  else if(current.filter(x=>x!=="unsure"&&x!=="indifferent").length>=3)return;
  else next=[...current.filter(x=>x!=="unsure"&&x!=="indifferent"),id];
  change({tones:next,tone:next[0]||null});
 }
 function toggleAspect(id:string){
  if(id==="unsure"){change({aspects:[{id:"unsure",valence:"unsure"}]});return;}
  let next=answer.aspects.filter(a=>a.id!=="unsure");
  if(next.some(a=>a.id===id))next=next.filter(a=>a.id!==id);
  else if(next.length<2)next=[...next,{id,valence:null}];
  change({aspects:next});
 }
 function aspectValence(id:string,v:number|"mixed"|"unsure"){change({aspects:answer.aspects.map(a=>a.id===id?{...a,valence:v}:a)});}
 if(loading)return <div className="ht-loading"><div className="ht-mark">✺</div><p>Preparing your constellation...</p></div>;
 return <div className="ht-shell">
 <header className="ht-header">
  <button className="ht-brand" type="button" onClick={()=>setTabSafe("home")}><span className="ht-symbol">✺</span><span>THE HUYNH TEST<small>A MOVIE PERSONALITY EXPERIMENT</small></span></button>
  <nav>{user?<><button className={tab==="home"?"active":""} onClick={()=>setTabSafe("home")}>Overview</button><button className={tab==="test"?"active":""} onClick={()=>setTabSafe("test")}>The test</button><button className={tab==="results"?"active":""} onClick={()=>setTabSafe("results")}>My profile</button><button className={tab==="friends"?"active":""} onClick={()=>setTabSafe("friends")}>Friends</button></>:<a href="#how">How it works</a>}</nav>
  <div className="ht-account">{user?<><span>@{user.handle}</span><button className="ht-link" onClick={logout}>Sign out</button></>:<span className="pill">PILOT 002 · V2.0</span>}</div>
 </header>
 {!user?<main className="ht-landing">
  <div className="ht-hero">
   <div className="eyebrow"><span className="little-star">✦</span> 10 CORE FILMS · OPTIONAL EXPANSION · INFINITE PERSPECTIVES</div>
   <h1>Every movie<br/>leaves a <em>trace.</em></h1>
   <p>Not just what you loved. What moved you, challenged you, or stayed with you. Begin with ten remarkable films, explore your constellation, then choose whether to go deeper with ten more.</p>
   <div className="hero-stars"><span>✧</span><span>✦</span><span>✺</span><span>✧</span><span>✶</span></div>
   <div id="how" className="ht-how"><div><strong>01</strong><span>Start with ten films and a few thoughtful questions for each.</span></div><div><strong>02</strong><span>Receive your provisional Core Profile and Emotional Constellation.</span></div><div><strong>03</strong><span>Deepen your profile or compare constellations with friends.</span></div></div>
  </div>
  <form className="ht-auth" onSubmit={submitAuth}>
   <div className="auth-choice" role="group" aria-label="Account access"><button type="button" aria-pressed={authMode==="login"} className={authMode==="login"?"selected":""} onClick={()=>{setAuthMode("login");setAuthError("");}}>Sign In</button><button type="button" aria-pressed={authMode==="register"} className={authMode==="register"?"selected":""} onClick={()=>{setAuthMode("register");setAuthError("");}}>Create Account</button></div>
   <div className="eyebrow">YOUR PERSONAL MOVIE UNIVERSE</div><h2>{authMode==="register"?"Begin your journey":"Welcome back"}</h2>
   <p>{authMode==="register"?"Create a private account. Your responses will be saved so you can return whenever you like.":"Sign in to return to your saved answers and shared constellation."}</p>
   {authMode==="register"?<label>Display name<input required minLength={2} maxLength={60} value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="What should friends call you?"/></label>:null}
   <label>Handle (your unique username, not display name)<input required minLength={3} maxLength={24} value={handle} onChange={e=>setHandle(e.target.value)} placeholder="Enter your handle" autoComplete="username"/></label>
   <label>Password<input required type="password" minLength={authMode==="register"?12:1} maxLength={128} autoComplete={authMode==="register"?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder={authMode==="register"?"At least 12 characters":"Your password"}/></label>
   {authError?<p className="error" role="alert">{authError}</p>:null}
   <button disabled={authBusy} className="btn-primary" type="submit">{authBusy?"Connecting...":authMode==="register"?"Create my account →":"Sign in →"}</button>
   <button className="swap-auth" type="button" onClick={()=>{setAuthMode(authMode==="register"?"login":"register");setAuthError("");}}>{authMode==="register"?"Already have an account? Sign in":"New here? Create an account"}</button>
   <p className="fine-print">Returning participants: sign in with the handle you created, not your display name. Passwords are case-sensitive. Your results are private unless you turn on sharing. Password recovery by email is not yet available.</p>
  </form>
 </main>:<main className="ht-main">
 {tab==="home"?<>
  <section className="ht-welcome"><div className="eyebrow">YOUR CINEMATIC UNIVERSE</div><h1>Welcome back, <em>{user.name}.</em></h1><p>Start with ten films. See your constellation, then choose whether to explore ten more.</p></section>
  <div className="ht-dashboard-grid">
   <div className="ht-panel progress-panel"><div className="eyebrow">{expanded?"EXPANDED TEST":"CORE TEST"} · YOUR JOURNEY</div><div className="progress-big"><strong>{activeFilmCount}</strong><span>/ {currentFilms.length}</span></div><div className="progress-meter"><span style={{width:(activeFilmCount/currentFilms.length*100)+"%"}}/></div><p>{answered} assessed · {skipped} skipped · {currentFilms.length-activeFilmCount} remaining</p><button className="btn-primary" onClick={()=>{const next=currentFilms.findIndex(f=>!(ref.current[f.id]&&complete(ref.current[f.id])));if(next<0)setTabSafe("results");else navigate(next);}}>{activeFilmCount===currentFilms.length?"Explore My Constellation →":activeFilmCount?"Continue Test →":"Begin Test →"}</button></div>
   <div className="ht-panel constellation-teaser"><span className="teaser-mark">✺</span><div className="eyebrow">YOUR CONSTELLATION</div><h3>A portrait of how<br/>you see the world.</h3><p>{answered?"Your provisional profile is taking shape.":"Your unique pattern of film responses will appear here."}</p><button className="btn-secondary" onClick={()=>setTabSafe("results")}>Explore my profile ↗</button></div>
   <div className="ht-panel friends-teaser"><div className="eyebrow">SHARED PERSPECTIVES</div><h3>See the same films<br/>through new eyes.</h3><p>Compare the emotional constellations of friends who choose to share their results.</p><button className="btn-secondary" onClick={()=>setTabSafe("friends")}>Connect with friends ↗</button></div>
  </div>
  <div className="section-heading"><h2>{expanded?"Explore all twenty films":"The ten Core films"}</h2><span>Choose any film to revisit your answers</span></div>
  <div className="film-grid">{currentFilms.map((f,i)=>{const a=answers[f.id];const done=Boolean(a&&complete(a));return <button key={f.id} className="film-tile" onClick={()=>navigate(i)} style={{background:"linear-gradient(140deg, "+f.color+"24,#141a29 75%)"}}><img className="film-tile-still" src={STILLS[f.id]?.src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={e=>{e.currentTarget.style.display="none"}}/><span className="film-number">{String(i+1).padStart(2,"0")}</span><span className="film-tile-title">{f.title}</span><span className="film-year">{f.year}</span><span className={"film-status "+(done?"done":"")}>{done?a.status==="watched"?"✓ Completed":"↗ Skipped":"Not started"}</span></button>})}</div>
 </>:null}
 {tab==="test"?<>
  <section className="test-bar"><div><div className="eyebrow">{expanded?"EXPANDED TEST":"CORE TEST"} · {TEST_VERSION.toUpperCase()}</div><h1>Film {String(filmIndex+1).padStart(2,"0")} <span>/ {currentFilms.length}</span></h1></div><div><span>{activeFilmCount} of {currentFilms.length} addressed</span><div className="progress-meter"><span style={{width:(activeFilmCount/currentFilms.length*100)+"%"}}/></div></div></section>
  <div className="test-layout">
   <aside className="test-sidebar"><div className="eyebrow">{expanded?"ALL FILMS":"CORE FILMS"}</div>{currentFilms.map((f,i)=>{const a=answers[f.id];const done=a&&complete(a);return <button key={f.id} className={i===filmIndex?"selected":""} onClick={()=>navigate(i)}><span>{String(i+1).padStart(2,"0")}</span><strong>{f.title}</strong><span className={done?"dot completed":"dot"}>{done?"✓":"·"}</span></button>})}</aside>
   <div className="question-panel">
    <div id="ht-current-film-hero" className="film-hero" style={{background:"radial-gradient(ellipse at 68% 30%, "+film.color+"70, transparent 65%),linear-gradient(135deg,#172338,#0d1322)"}}><img className="film-still" src={STILLS[film.id]?.src} alt={STILLS[film.id]?.scene||film.title+" film still"} loading="eager" referrerPolicy="no-referrer" onError={e=>{e.currentTarget.style.display="none"}}/><div className="film-watermark">✺</div><span className="eyebrow">FILM {String(filmIndex+1).padStart(2,"0")} OF {currentFilms.length}</span><h2>{film.title}</h2><p>{film.year} · {film.category}</p><a className="film-still-credit" href={STILLS[film.id]?.sourcePage} target="_blank" rel="noopener noreferrer">Film still: {STILLS[film.id]?.source}</a></div>
    <div className="question-content">
     <div className="status-question"><h3>Have you watched this movie, and do you remember it?</h3><div className="chip-row">{[{id:"watched",label:"Yes, I'm familiar"},{id:"unwatched",label:"Have not watched"},{id:"unfamiliar",label:"Unfamiliar / don't remember"}].map(o=><button key={o.id} className={answer.status===o.id?"choice selected":"choice"} onClick={()=>change({status:o.id as FilmAnswer["status"]})}>{o.label}</button>)}</div></div>
     {answer.status==="watched"?<>
      <div className="question-block"><div className="qnum">01 · OVERALL IMPRESSION</div><h3>Overall, how would you rate this movie?</h3><div className="emoji-row">{RATINGS.map(r=><button key={r.n} className={answer.rating===r.n?"emoji selected":"emoji"} onClick={()=>change({rating:r.n})}><span>{r.emoji}</span><small>{r.label}</small></button>)}</div></div>
      <div className="question-block"><div className="qnum">02 · EMOTIONAL TONE</div><h3>How did this movie make you feel?</h3><p className="hint">Choose up to three feelings. Indifferent and Not sure are exclusive.</p>
      <div className="tone-grid">{TONES.map(t=>{const chosen=answer.tones?.includes(t.id)||false;const count=answer.tones?.filter(x=>x!=="indifferent"&&x!=="unsure").length||0;const disabled=!chosen&&t.id!=="indifferent"&&t.id!=="unsure"&&count>=3;return <button type="button" aria-pressed={chosen} disabled={disabled} key={t.id} className={chosen?"tone selected":"tone"} onClick={()=>toggleTone(t.id)}><span>{t.emoji}</span><small>{t.label}</small>{chosen?<span className="tone-check">✓</span>:null}</button>})}</div>
      {answer.tones?.some(t=>LEGACY_TONE_LABELS[t])?<p className="hint legacy-tone-note">Earlier answer preserved: {answer.tones.filter(t=>LEGACY_TONE_LABELS[t]).map(t=>LEGACY_TONE_LABELS[t]).join(", ")}. Choose a new emotion to refine it.</p>:null}
      <p className="tone-count">{answer.tones?.filter(t=>!LEGACY_TONE_LABELS[t]).length||0} of 3 selected</p>
     </div>
      <div className="question-block"><div className="qnum">03 · YOUR EXPERIENCE</div><h3>How the movie resonated with you</h3><p className="hint">Same five questions for every film. The middle is not automatically an answer.</p>
      {QUESTIONS.map((q,i)=>{const v=answer.sliders[i];return <div className="slider-question" key={q.id}><div className="slider-heading"><strong>{q.question}</strong><div className={"slider-response"+(v===null?" is-empty":"")} aria-live="polite"><span className="slider-response-caption">YOUR RESPONSE</span><span className="slider-response-value">{v===null?"Not answered":v===-1?"Not sure":q.labels[v]}</span></div></div><input aria-label={q.question} type="range" min="0" max="6" step="1" value={v!==null&&v!==-1?v:3} onChange={e=>change({sliders:answer.sliders.map((old,j)=>j===i?Number(e.target.value):old)})}/><div className="slider-ends"><span>{q.labels[0]}</span><span>{q.labels[6]}</span></div><div className="slider-actions"><button type="button" className={v===3?"tiny active": "tiny"} onClick={()=>change({sliders:answer.sliders.map((old,j)=>j===i?3:old)})}>Select middle</button><button type="button" className={v===-1?"tiny active":"tiny"} onClick={()=>change({sliders:answer.sliders.map((old,j)=>j===i?-1:old)})}>Not sure</button></div></div>})}</div>
      <div className="question-block"><div className="qnum">04 · THE DETAILS THAT MATTERED</div><h3>Which aspects most influenced your opinion of this movie?</h3><p className="hint">Select one or two. Evaluate each separately. There are no right answers.</p><div className="aspect-grid">{film.aspects.map(a=><button key={a.id} className={answer.aspects.some(x=>x.id===a.id)?"choice selected":"choice"} onClick={()=>toggleAspect(a.id)}><span>{answer.aspects.some(x=>x.id===a.id)?"✓ ":"○ "}</span>{a.label}</button>)}<button className={answer.aspects.some(x=>x.id==="unsure")?"choice selected":"choice"} onClick={()=>toggleAspect("unsure")}>Not sure</button></div>
       {answer.aspects.filter(a=>a.id!=="unsure").map(a=>{const label=film.aspects.find(x=>x.id===a.id)?.label||a.id;return <div className="aspect-rating" key={a.id}><div className="aspect-rating-heading"><strong>How did you feel about: {label}?</strong><div className={"slider-response"+(a.valence===null?" is-empty":"")} aria-live="polite"><span className="slider-response-caption">YOUR RESPONSE</span><span className="slider-response-value">{a.valence===null?"Not answered":typeof a.valence==="number"?ASPECT_LABELS[a.valence]:a.valence==="mixed"?"Mixed / conflicted":"Not sure"}</span></div></div><input aria-label={"Your response to "+label} type="range" min="0" max="6" step="1" value={typeof a.valence==="number"?a.valence:3} onChange={e=>aspectValence(a.id,Number(e.target.value))}/><div className="slider-ends"><span>Very negative</span><span>Very positive</span></div><div className="slider-actions"><button className={a.valence===3?"tiny active":"tiny"} onClick={()=>aspectValence(a.id,3)}>Select neutral</button><button className={a.valence==="mixed"?"tiny active":"tiny"} onClick={()=>aspectValence(a.id,"mixed")}>Mixed / conflicted</button><button className={a.valence==="unsure"?"tiny active":"tiny"} onClick={()=>aspectValence(a.id,"unsure")}>Not sure</button></div></div>})}
      </div>
     </>:<div className="skip-message"><h3>That's completely fine.</h3><p>We will skip this film without treating it as a neutral or negative answer. You can watch it and return later to improve your profile.</p></div>}
     <div className="question-footer"><div><span className={"save-indicator "+saveState}>{saveState==="saving"?"● Saving answers...":saveState==="saved"?"✓ Saved privately":saveState==="error"?"⚠ Save failed. Make a new selection to retry.":"Your answers save automatically"}</span>{answer.status==="watched"&&!complete(answer)?<p className="hint">Complete every question to finish this film. You can return to drafts later.</p>:null}</div><div className="footer-actions"><button className="btn-secondary" onClick={()=>filmIndex>0?navigate(filmIndex-1):setTabSafe("home")}>← Back</button><button className="btn-primary" disabled={!complete(answer)} onClick={()=>filmIndex===currentFilms.length-1?setTabSafe("results"):navigate(filmIndex+1)}>{filmIndex===currentFilms.length-1?"See My Profile →":"Next Film →"}</button></div></div>
    </div>
   </div>
  </div>
 </>:null}
 {tab==="results"?<>
  <section className="results-intro"><div className="eyebrow">YOUR {expanded?"EXPANDED":"CORE"} MOVIE PERSONALITY PROFILE · EXPLORATORY PILOT</div><h1>{profile.headline}<span className="accent-star"> ✺</span></h1><p>{profile.narrative}</p><div className="result-count"><span>{profile.completed} / {profile.total} films assessed</span><span>{profile.incomplete?"PARTIAL FILM COVERAGE":"FULL FILM COVERAGE"}</span><span>PROVISIONAL SCORING</span></div></section>
  <Constellation people={[{id:"self",name:user.name,color:palette[0],profile}]}/>
  <div className="results-grid">
   <div className="ht-panel"><div className="eyebrow">FOUR CORE ORIENTATIONS</div><h3>Your response patterns</h3><p className="hint">These scores summarize engagement with themes, not intelligence, morality, or fixed personality traits.</p>{AXES.map(ax=><div className="orientation" key={ax}><div><span>{AXIS_LABELS[ax]}</span><strong>{profile.orientationScores[ax]===null?"—":profile.orientationScores[ax]}</strong></div><div className="progress-meter"><span style={{width:(profile.orientationScores[ax]||0)+"%"}}/></div></div>)}</div>
   <div className="ht-panel"><div className="eyebrow">PROFILE COVERAGE</div><h3>Built from your own answers.</h3><p>You have completed {profile.completed} film assessments and skipped {profile.skipped}. Every point comes from a specific response, not an invented answer.</p><p className="hint">Your scores and narrative may change as you add films. The current scoring model is exploratory and has not been psychometrically validated.</p><button className="btn-secondary" onClick={()=>setTabSafe("test")}>Review and complete films ↗</button></div>
  </div>
  <div className="results-actions"><button className="btn-primary" onClick={()=>setTabSafe("friends")}>Compare with friends →</button><button className="btn-secondary" onClick={()=>setTabSafe("home")}>Back to overview</button></div>
 </>:null}
 {tab==="friends"?<>
  <section className="results-intro"><div className="eyebrow">SHARED PERSPECTIVES</div><h1>Find the space <em>between us.</em></h1><p>Put your constellation alongside friends in the same 3D space. Explore where your film responses converge and where they diverge.</p></section>
  <div className="results-grid">
   <div className="ht-panel"><div className="eyebrow">YOUR SHARE LINK</div><h3>Choose who can see your profile.</h3><p className="hint">Sharing is off by default. Turning it on creates a link to your display name, orientation profile, and film-response constellation. It does not publish your password or raw questionnaire answers. Anyone with the link can view it.</p><button className={sharing.enabled?"btn-secondary":"btn-primary"} disabled={shareBusy} onClick={toggleSharing}>{shareBusy?"Updating...":sharing.enabled?"Turn off sharing":"Enable profile sharing"}</button>{shareUrl?<div className="share-url"><input readOnly value={shareUrl} aria-label="Your profile sharing link"/><button onClick={()=>navigator.clipboard.writeText(shareUrl).then(()=>alert("Link copied")).catch(()=>alert("Copy the link from the field"))}>Copy</button></div>:null}<p className="fine-print">Turning sharing off immediately revokes the existing link. Re-enabling creates a new link.</p></div>
   <div className="ht-panel"><div className="eyebrow">CONNECT CONSTELLATIONS</div><h3>Add a friend's shared profile</h3><p className="hint">Ask your friend to turn on sharing and send you their Huynh Test profile link. No one is added without that link.</p><form onSubmit={addFriend} className="add-friend"><input required value={friendInput} onChange={e=>setFriendInput(e.target.value)} placeholder="Paste your friend's sharing link"/><button className="btn-primary" disabled={addingFriend}>{addingFriend?"Adding...":"Add friend"}</button></form>{friendError?<p className="error">{friendError}</p>:null}</div>
  </div>
  <div className="ht-panel friend-list"><div className="eyebrow">PROFILES IN YOUR COMPARISON</div><h3>{friends.length} shared {friends.length===1?"friend":"friends"}</h3>{friends.length?friends.map((f,i)=><div className="friend-row" key={f.id}><label><input type="checkbox" checked={friendVisible[f.id]!==false} onChange={e=>setFriendVisible(v=>({...v,[f.id]:e.target.checked}))}/><span className="dot-mini" style={{background:palette[(i+1)%palette.length]}}/><strong>{f.name}</strong> <span className="muted">@{f.handle} · {f.profile.completed}/20 films</span></label><button className="ht-link" onClick={()=>removeFriend(f.id)}>Remove</button></div>):<p className="hint">Your friends will appear here after you add their sharing links. Their permission to share can be revoked at any time.</p>}</div>
  <Constellation people={participants}/>
  <p className="fine-print">Friends only see what someone explicitly shares. This comparison has no friendship ranking or mental-health inference.</p>
 </>:null}
 </main>}
 <footer className="ht-footer"><div>✺ THE HUYNH TEST <span>AN EXPERIMENT IN HOW WE EXPERIENCE CINEMA</span></div><span>V2.0 PILOT · Deep Test in Alpha · <a href="https://www.projectsproject.com">The Projects Project</a></span></footer>
 </div>;
}
