"use client";
import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import dynamic from "next/dynamic";
import {AXES,AXIS_LABELS,FILMS,TONES,LEGACY_TONE_LABELS,ASPECT_REACTIONS} from "./lib/data";
import {STILLS} from "./lib/stills";
import type {Axis} from "./lib/data";
import type {FilmPoint,Profile} from "./lib/score";
import type {CelestialNode,CelestialCentroid,CameraCommand} from "./ConstellationScene";
const Scene=dynamic(()=>import("./ConstellationScene"),{ssr:false,loading:()=> <div className="cosmos-loading-scene">Preparing your universe…</div>});
export type ConstellationPerson={id:string;name:string;color:string;profile:Profile};
type ViewMode="constellation"|"orbit"|"compare"|"film";
type Props={people:ConstellationPerson[];onClose?:()=>void;onShare?:()=>void;initialMode?:ViewMode};
const MODES:{id:ViewMode;label:string;description:string}[]=[
 {id:"constellation",label:"Constellation",description:"Your film response positions"},
 {id:"orbit",label:"Orbit",description:"A stylized personal solar system"},
 {id:"compare",label:"Compare",description:"Friends in a shared coordinate space"},
 {id:"film",label:"Film lens",description:"One film across participants"}
];
const ratingLabel=(n:number)=>n===5?"🤩 Amazing":n===4?"🙂 Good":n===3?"😐 OK":n===2?"🙁 Bad":"😖 Terrible";
const toneLabel=(id:string)=>TONES.find(t=>t.id===id)?.label||LEGACY_TONE_LABELS[id]||id;
const rawXYZ=(p:[number,number,number]):[number,number,number]=>[p[0]*9,p[1]*9,p[2]*5];
const distance=(a:[number,number,number],b:[number,number,number])=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
function describePoint(f:FilmPoint){
 const scored=AXES.map((axis,i)=>({label:AXIS_LABELS[axis],val:f.vector[i],has:f.evidence?.[i]??true})).filter(v=>v.has).sort((a,b)=>b.val-a.val);
 if(!scored.length)return "This film has little measurable orientation evidence so far.";
 const parts=scored.slice(0,2).map(o=>o.label.toLowerCase());
 return "This film contributes evidence of "+parts.join(" and ")+". Its position also reflects your separate movie rating and emotional tone. These coordinates are provisional, not a diagnosis or fixed trait.";
}
function FilmDetail({person,film,onClose}:{person:ConstellationPerson;film:FilmPoint;onClose:()=>void}){
 const meta=FILMS.find(f=>f.id===film.filmId),still=STILLS[film.filmId];
 const details=(film.aspectReactions||[]).map(a=>({
  label:meta?.aspects.find(v=>v.id===a.id)?.label||a.id,
  reactions:a.reactions?.map(r=>ASPECT_REACTIONS.find(x=>x.id===r)?.label||r)||[]
 }));
 const fallbackAspects=film.selectedAspects.filter(id=>id!=="unsure").map(id=>meta?.aspects.find(a=>a.id===id)?.label||id);
 return <div className="cosmos-film-detail">
  <div className="cosmos-detail-heading"><div className="cosmos-kicker">EXPLORE A FILM</div><button onClick={onClose} aria-label="Close film details">✕</button></div>
  {still?<><div className="cosmos-still"><img src={still.src} alt={still.scene} referrerPolicy="no-referrer"/></div><a className="cosmos-source" href={still.sourcePage} rel="noopener noreferrer" target="_blank">Still source: {still.source}</a></>:null}
  <h2>{film.title}</h2><div className="cosmos-film-person"><span style={{background:person.color}}/>{person.name}</div>
  <div className="cosmos-review-line"><span className="cosmos-rating">{ratingLabel(film.rating)}</span><span>{person.profile.stage==="core"?"Core":"Expanded"} profile</span></div>
  <div className="cosmos-detail-section"><h3>Emotional tones</h3><div className="cosmos-chips">{film.tones.length?film.tones.map(t=><span key={t}>{toneLabel(t)}</span>):<span>Not sure</span>}</div></div>
  <div className="cosmos-detail-section"><h3>The details that mattered</h3>
   {details.length?details.map((a,i)=><div className="cosmos-aspect-entry" key={i}><strong>{a.label}</strong><div className="cosmos-chips">{a.reactions.length?a.reactions.map(r=><span key={r}>{r}</span>):<span>Earlier response preserved</span>}</div></div>):
    fallbackAspects.length?<div className="cosmos-chips">{fallbackAspects.map(x=><span key={x}>{x}</span>)}</div>:<p>No film-specific aspect was selected.</p>}
  </div>
  <div className="cosmos-detail-section"><h3>Orientation signals</h3>{AXES.map((axis,i)=><div className="cosmos-axis-score" key={axis}><div><span>{AXIS_LABELS[axis]}</span><span>{film.evidence?.[i]===false?"No evidence":Math.round(film.vector[i]*100)+"%"}</span></div><div className="cosmos-track"><span style={{width:film.evidence?.[i]===false?"0%":clamp(film.vector[i]*100)+"%",background:person.color}}/></div></div>)}</div>
  <div className="cosmos-detail-section"><h3>Why it appears here</h3><p>{describePoint(film)}</p></div>
 </div>;
}
function friendComparisons(people:ConstellationPerson[]){
 const self=people[0];if(!self)return [];
 const own=new Map(self.profile.points.map(p=>[p.filmId,p]));
 return people.slice(1).map(p=>{
  const common=p.profile.points.flatMap(other=>{const mine=own.get(other.filmId);return mine?[{film:other.title,dist:distance(other.point,mine.point)}]:[];});
  common.sort((a,b)=>a.dist-b.dist);
  return {person:p,common:common.length,aligned:common.slice(0,2).map(x=>x.film),divergent:common.slice(-2).reverse().map(x=>x.film)};
 });
}
export default function Constellation({people,onClose,onShare,initialMode}:Props){
 const [mode,setMode]=useState<ViewMode>(initialMode||(people.length>1?"compare":"constellation"));
 const [selected,setSelected]=useState<string|null>(null);
 const [hovered,setHovered]=useState<string|null>(null);
 const [filmLens,setFilmLens]=useState<string>("");
 const [mood,setMood]=useState("all");
 const [orientation,setOrientation]=useState<Axis|"all">("all");
 const [amazingOnly,setAmazingOnly]=useState(false);
 const [visiblePeople,setVisiblePeople]=useState<Record<string,boolean>>({});
 const [labels,setLabels]=useState(true),[paths,setPaths]=useState(true);
 const [tour,setTour]=useState(false),[autoRotate,setAutoRotate]=useState(true);
 const [reduceMotion,setReduceMotion]=useState(false),[showGuide,setShowGuide]=useState(false);
 const [showInsights,setShowInsights]=useState(true),[showFilters,setShowFilters]=useState(false);
 const [command,setCommand]=useState<CameraCommand>({id:0,kind:"reset"});
 const [notice,setNotice]=useState("");
 const tourRef=useRef(0);
 const starList=useMemo(()=>people.flatMap(p=>p.profile.points.map((film,index)=>({key:p.id+":"+film.filmId,person:p,film,index}))),[people]);
 const films=useMemo(()=>FILMS.filter(f=>starList.some(s=>s.film.filmId===f.id)),[starList]);
 useEffect(()=>{if(!filmLens&&films.length)setFilmLens(films[0].id);},[films,filmLens]);
 useEffect(()=>{setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const previous=document.body.style.overflow;document.body.style.overflow="hidden";
  return ()=>{document.body.style.overflow=previous;};
 },[]);
 useEffect(()=>{const handler=(event:KeyboardEvent)=>{
  if(event.key==="Escape"){if(selected)setSelected(null);else onClose?.();}
  if(event.key.toLowerCase()==="r"&&!(event.target instanceof HTMLInputElement)){setCommand(c=>({id:c.id+1,kind:"reset"}));}
 };window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler);},[onClose,selected]);
 const present=useMemo(()=>people.filter(p=>visiblePeople[p.id]!==false),[people,visiblePeople]);
 const filtered=useMemo(()=>starList.filter(s=>
  visiblePeople[s.person.id]!==false&&
  (mode!=="film"||s.film.filmId===filmLens)&&
  (mood==="all"||s.film.tones.includes(mood))&&
  (!amazingOnly||s.film.rating===5)&&
  (orientation==="all"||s.film.evidence[AXES.indexOf(orientation)]&&s.film.vector[AXES.indexOf(orientation)]>=.42)
 ),[starList,mode,filmLens,mood,amazingOnly,orientation,visiblePeople]);
 const centroids=useMemo<CelestialCentroid[]>(()=>present.filter(p=>p.profile.centroid).map(p=>({id:p.id,name:p.name,color:p.color,position:rawXYZ(p.profile.centroid!)})),[present]);
 const nodes=useMemo<CelestialNode[]>(()=>filtered.map(s=>{
  const base=rawXYZ(s.film.point),center=rawXYZ(s.person.profile.centroid||[0,0,0]);
  let position=base;
  if(mode==="orbit"){
   // Orbit mode deliberately stylizes placement; it is not a distance measure.
   const a=s.index/Math.max(1,s.person.profile.points.length)*Math.PI*2;
   const r=2.4+((s.index*7)%6)*.24;
   position=[center[0]+Math.cos(a)*r,center[1]+Math.sin(a)*r,center[2]+Math.sin(a*2)*.65];
  }
  return {key:s.key,personId:s.person.id,personName:s.person.name,color:s.person.color,filmId:s.film.filmId,title:s.film.title,point:s.film.point,position,centroid:center,mixed:s.film.mixed};
 }),[filtered,mode]);
 const nodeKeys=nodes.map(n=>n.key).join("|");
 useEffect(()=>{if(selected&&!nodes.some(n=>n.key===selected))setSelected(null);},[nodeKeys,selected,nodes]);
 const active=selected?starList.find(s=>s.key===selected):null;
 const hover=hovered?starList.find(s=>s.key===hovered):null;
 const comparisons=useMemo(()=>friendComparisons(present),[present]);
 const selectedPerson=active?.person||null;
 const motionAllowed=!reduceMotion;
 useEffect(()=>{
  if(!tour||!motionAllowed||nodes.length===0)return;
  const timer=window.setInterval(()=>{const node=nodes[tourRef.current%nodes.length];tourRef.current++;setSelected(node.key);},4500);
  return()=>window.clearInterval(timer);
 },[tour,motionAllowed,nodeKeys,nodes]);
 useEffect(()=>{if(mode==="film"&&filmLens){const first=nodes[0];if(first)setSelected(first.key);}},[mode,filmLens]);
 const changeMode=(m:ViewMode)=>{setMode(m);setTour(false);setSelected(null);if(m==="compare")setPaths(true);};
 const camera=(kind:CameraCommand["kind"])=>setCommand(c=>({id:c.id+1,kind}));
 const screenshot=()=>{
  try{const node=document.querySelector(".cosmos-canvas") as HTMLCanvasElement|null;if(!node)throw Error();
   const link=document.createElement("a");link.href=node.toDataURL("image/png");link.download="huynh-test-emotional-constellation.png";link.click();
  }catch{setNotice("A snapshot could not be captured on this device.");window.setTimeout(()=>setNotice(""),3500);}
 };
 const summary=present[0]?.profile;
 const outliers=useMemo(()=>{
  const profile=people[0]?.profile;if(!profile?.centroid)return [];
  return profile.points.map(f=>({film:f,d:distance(f.point,profile.centroid!)}))
   .sort((a,b)=>b.d-a.d).slice(0,2);
 },[people]);
 return <div className="cosmos-portal" role="dialog" aria-modal="true" aria-label="Emotional Constellation immersive view">
  <div className="cosmos-aura" aria-hidden="true"/>
  <Scene nodes={nodes} centroids={centroids} selectedKey={selected} showLabels={labels&&(mode!=="compare"||people.length<=2)}
   showConnections={paths} autoRotate={autoRotate} reduceMotion={reduceMotion}
   onSelect={key=>{if(key?.startsWith("centroid:")){setSelected(null);setShowInsights(true);}else setSelected(key);setTour(false);}} onHover={setHovered} command={command}/>
  <header className="cosmos-header">
   <div className="cosmos-ident"><span className="cosmos-symbol">✧</span><div><span className="cosmos-brand">THE HUYNH TEST</span><h1>Emotional <em>Constellation</em></h1></div></div>
   <div className="cosmos-header-right"><span className="cosmos-version">{summary?.stage==="expanded"?"EXPANDED":"CORE"} PROFILE · {summary?.completed||0} FILMS</span>
    {onShare?<button type="button" className="cosmos-top-action" onClick={onShare}>↗ Share</button>:null}
    <button className="cosmos-close" type="button" onClick={()=>onClose?.()} aria-label="Return to Movie Personality Profile">✕ <span>Close</span></button>
   </div>
  </header>
  <nav className="cosmos-mode-tabs" aria-label="Constellation viewing modes">
   {MODES.map(m=><button type="button" key={m.id} title={m.description} className={mode===m.id?"active":""} aria-pressed={mode===m.id} onClick={()=>changeMode(m.id)}>{m.label}</button>)}
  </nav>
  <div className="cosmos-left-tools">
   <div className="cosmos-glass cosmos-intro-panel">
    <div className="cosmos-kicker">AN EXPERIMENT IN PERSPECTIVE</div>
    <h2>{mode==="orbit"?"The films in your orbit":mode==="compare"?"Where our worlds intersect":mode==="film"?"One film. Different eyes.":"A map of what moved you."}</h2>
    <p>{mode==="orbit"?"A poetic arrangement around each person's center. Distances in this mode are illustrative.":mode==="compare"?"Compare the same film experiences across shared profiles, using a consistent coordinate system.":mode==="film"?"Select a movie to see how different people responded to it.":"Each glowing point represents a film you experienced. Rotate the space and select a star to discover why it is here."}</p>
    <div className="cosmos-person-key">
     {people.map((p,i)=><label key={p.id} className={visiblePeople[p.id]===false?"muted":""}><input type="checkbox" checked={visiblePeople[p.id]!==false} onChange={e=>setVisiblePeople(v=>({...v,[p.id]:e.target.checked}))}/><i style={{background:p.color}}/><span>{p.name}</span><small>{p.profile.completed}/{p.profile.total}</small></label>)}
    </div>
   </div>
   <div className="cosmos-glass cosmos-filter-panel">
    <button className="cosmos-panel-toggle" onClick={()=>setShowFilters(s=>!s)} aria-expanded={showFilters}><span>◈ Refine your view</span><span>{showFilters?"−":"+"}</span></button>
    {showFilters?<div className="cosmos-filter-fields">
     {mode==="film"?<label>Film<select value={filmLens} onChange={e=>setFilmLens(e.target.value)}>{films.map(f=><option key={f.id} value={f.id}>{f.title}</option>)}</select></label>:null}
     <label>Emotional tone<select value={mood} onChange={e=>setMood(e.target.value)}><option value="all">All feelings</option>{TONES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select></label>
     <label>Orientation lens<select value={orientation} onChange={e=>setOrientation(e.target.value as Axis|"all")}><option value="all">All orientations</option>{AXES.map(a=><option key={a} value={a}>{AXIS_LABELS[a]}</option>)}</select></label>
     <label className="cosmos-checkbox-row"><input type="checkbox" checked={amazingOnly} onChange={e=>setAmazingOnly(e.target.checked)}/>Amazing movies only</label>
     <label className="cosmos-checkbox-row"><input type="checkbox" checked={labels} onChange={e=>setLabels(e.target.checked)}/>Movie labels</label>
     <label className="cosmos-checkbox-row"><input type="checkbox" checked={paths} onChange={e=>setPaths(e.target.checked)}/>Connection paths</label>
     <button className="cosmos-ghost" onClick={()=>{setMood("all");setOrientation("all");setAmazingOnly(false);}}>Clear filters</button>
    </div>:null}
   </div>
  </div>
  <div className="cosmos-right-tools">
   <div className="cosmos-camera-controls" aria-label="Camera controls">
    <button onClick={()=>camera("in")} aria-label="Zoom in">＋</button>
    <button onClick={()=>camera("out")} aria-label="Zoom out">−</button>
    <button onClick={()=>{camera("reset");setSelected(null);}} aria-label="Reset camera">⌖</button>
   </div>
   <div className="cosmos-glass cosmos-details-panel">
    {active&&selectedPerson?<FilmDetail person={selectedPerson} film={active.film} onClose={()=>setSelected(null)}/>:<div className="cosmos-insights">
     <div className="cosmos-detail-heading"><div className="cosmos-kicker">MOVIE PERSONALITY PROFILE</div><button onClick={()=>setShowInsights(s=>!s)} aria-label="Toggle profile insights">{showInsights?"−":"+"}</button></div>
     <h2>{summary?.headline||"Your universe starts here"}</h2>
     {showInsights?<><p>{summary?.narrative||"Complete a film to begin your constellation."}</p>
      {summary?AXES.map(axis=><div className="cosmos-axis-score" key={axis}><div><span>{AXIS_LABELS[axis]}</span><span>{summary.orientationScores[axis]??"—"}</span></div><div className="cosmos-track"><span style={{width:(summary.orientationScores[axis]||0)+"%",background:people[0]?.color||"#91c7ec"}}/></div></div>):null}
      {outliers.length&&mode!=="film"?<div className="cosmos-outliers"><h3>Films farthest from your center</h3>
       {outliers.map(({film})=><button key={film.filmId} onClick={()=>{setMode("constellation");setSelected(people[0].id+":"+film.filmId);}}>{film.title}<span>Explore ↗</span></button>)}
      </div>:null}
      {mode==="compare"&&comparisons.length?<div className="cosmos-compare-insights"><h3>Shared film perspectives</h3>{comparisons.map(c=><div key={c.person.id}><strong>{c.person.name}</strong>{c.common>=2?<><p>{c.common} films assessed by both participants. Close responses: {c.aligned.join(", ")}. Most different responses: {c.divergent.join(", ")}.</p></>:<p>Not enough films in common for a comparison yet.</p>}</div>)}</div>:null}
      {mode==="film"?<div className="cosmos-film-picker"><label>Compare a film<select value={filmLens} onChange={e=>setFilmLens(e.target.value)}>{films.map(f=><option key={f.id} value={f.id}>{f.title}</option>)}</select></label></div>:null}
     </>:<p>Insights collapsed. Select any glowing point to explore it.</p>}
    </div>}
   </div>
  </div>
  {hover&&!selected?<div className="cosmos-hover-hint"><span style={{background:hover.person.color}}/>{hover.film.title} <small>· {hover.person.name}</small></div>:null}
  <div className="cosmos-bottom-hud">
   <div className="cosmos-bottom-left">
    <div className="cosmos-count"><strong>{filtered.length}</strong> visible film responses <span>· {present.length} {present.length===1?"person":"people"}</span></div>
    <button className="cosmos-guide-trigger" onClick={()=>setShowGuide(s=>!s)}>{showGuide?"Hide guide":"What am I looking at?"}</button>
    {showGuide?<div className="cosmos-guide"><strong>Reading your constellation</strong>
     <p>The four orientations are condensed mathematically into three visible dimensions. Left/right contrasts Artistic with Existential engagement; up/down contrasts Emotional with Moral engagement; depth combines separate ratings and emotional tones.</p>
     <p>Core and Expanded results share the same projection. Closer points represent similarity <em>within this provisional model only</em>. Orbit mode deliberately rearranges points for storytelling.</p>
    </div>:null}
   </div>
   <div className="cosmos-bottom-actions">
    <button className={tour?"active":""} onClick={()=>{setTour(s=>!s);setAutoRotate(false);}} disabled={!nodes.length||!motionAllowed}>{tour?"Ⅱ Pause tour":"▷ Auto-tour"}</button>
    <button className={autoRotate?"active":""} onClick={()=>setAutoRotate(s=>!s)} disabled={!motionAllowed}>⟳ Drift</button>
    <button onClick={screenshot}>↓ Snapshot</button>
    <button onClick={()=>setReduceMotion(s=>!s)}>{reduceMotion?"Enable motion":"Reduce motion"}</button>
   </div>
  </div>
  {notice?<div className="cosmos-toast" role="status">{notice}</div>:null}
  <div className="cosmos-small-print">DRAG TO ROTATE · SCROLL OR PINCH TO ZOOM · SELECT A STAR · PROVISIONAL MODEL, NOT A PSYCHOLOGICAL DIAGNOSIS</div>
 </div>;
}
