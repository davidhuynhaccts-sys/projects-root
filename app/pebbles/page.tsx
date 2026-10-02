"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import "./pebbles.css";

type PeriodKind = "period" | "spotting";
type PillStatus = "taken" | "missed";
type Profile = { name: string; birthday?: string; heightInches?: number; weightLb?: number; sprintecStartDate?: string };
type PebblesState = {
  profile: Profile;
  periods: Record<string, PeriodKind>;
  pills: Record<string, PillStatus>;
  poops: Record<string, boolean>;
  updatedAt: number;
};
type Prediction = {
  starts: string[];
  cycleLengths: number[];
  averageCycleLength: number;
  predictedPeriodStart: string | null;
  lastPoop: string | null;
  pillDay: number | null;
  pillTakenToday: boolean;
  pillTakenCount: number;
  today: string;
  note: string;
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS = ["S","M","T","W","T","F","S"];

function isoDate(d: Date) {
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-");
}
function fromIso(s: string) {
  return new Date(s + "T12:00:00");
}
function formatShort(s: string | null) {
  if (!s) return "Not yet";
  return fromIso(s).toLocaleDateString("en-US",{month:"short",day:"numeric"});
}
function daysBetween(a: string, b: string) {
  return Math.round((fromIso(b).getTime()-fromIso(a).getTime())/86400000);
}
function addDays(s: string, n: number) {
  const d=fromIso(s); d.setDate(d.getDate()+n); return isoDate(d);
}
function monthKey(y:number,m:number){ return `${y}-${String(m+1).padStart(2,"0")}`; }

function Month({
  year, month, state, predictedDays, today, selected, onSelect
}:{
  year:number; month:number; state:PebblesState; predictedDays:Set<string>; today:string; selected:string|null; onSelect:(d:string)=>void;
}) {
  const first = new Date(year,month,1);
  const count = new Date(year,month+1,0).getDate();
  const cells:(string|null)[] = Array(first.getDay()).fill(null);
  for(let n=1;n<=count;n++) cells.push(isoDate(new Date(year,month,n)));
  while(cells.length%7) cells.push(null);
  return <section className="month" id={monthKey(year,month)}>
    <h2>{MONTHS[month]} <span>{year}</span></h2>
    <div className="weekdays">{WEEKDAYS.map((d,i)=><div key={i}>{d}</div>)}</div>
    <div className="days">
      {cells.map((date,i)=>{
        if(!date) return <div className="day blank" key={"b"+i}/>;
        const kind=state.periods[date];
        const pill=state.pills[date];
        const poop=state.poops[date];
        const predicted=predictedDays.has(date) && !kind;
        return <button
          className={[
            "day",
            kind==="period"?"period":"",
            kind==="spotting"?"spotting":"",
            predicted?"predicted":"",
            date===today?"today":"",
            date===selected?"selected":"",
          ].filter(Boolean).join(" ")}
          key={date}
          onClick={()=>onSelect(date)}
          aria-label={date}
        >
          <span className="number">{Number(date.slice(-2))}</span>
          <span className="markers">
            {pill==="taken" && <span className="pillmark" title="Pill taken">✓</span>}
            {pill==="missed" && <span className="missedmark" title="Pill missed">!</span>}
            {poop && <span className="poopmark" title="Poop">●</span>}
          </span>
        </button>;
      })}
    </div>
  </section>;
}

function apiPath(path:string){
  if (typeof window !== "undefined" && window.location.hostname === "pebbles.projectsproject.com") return `/api/${path}`;
  return `/pebbles/api/${path}`;
}

export default function PebblesPage(){
  const [auth,setAuth]=useState<"checking"|"in"|"out">("checking");
  const [passcode,setPasscode]=useState("");
  const [loginError,setLoginError]=useState("");
  const [state,setState]=useState<PebblesState|null>(null);
  const [prediction,setPrediction]=useState<Prediction|null>(null);
  const [selected,setSelected]=useState<string|null>(null);
  const [saving,setSaving]=useState(false);
  const [showSettings,setShowSettings]=useState(false);
  const [showTopJump,setShowTopJump]=useState(false);
  const calendarRef=useRef<HTMLDivElement>(null);

  async function load(){
    const a=await fetch(apiPath("auth"),{cache:"no-store"});
    if(!a.ok){setAuth("out");return;}
    setAuth("in");
    const r=await fetch(apiPath("state"),{cache:"no-store"});
    if(r.ok){const data=await r.json();setState(data.state);setPrediction(data.prediction);}
  }
  useEffect(()=>{load().catch(()=>setAuth("out"));},[]);

  async function login(e:FormEvent){
    e.preventDefault(); setLoginError("");
    const r=await fetch(apiPath("auth"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({passcode})});
    if(!r.ok){setLoginError("That passcode didn't work.");return;}
    setAuth("in"); await load();
  }

  async function persist(next:PebblesState){
    setState(next); setSaving(true);
    try{
      const r=await fetch(apiPath("state"),{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(next)});
      if(r.ok){const data=await r.json();setState(data.state);setPrediction(data.prediction);}
    } finally { setSaving(false); }
  }

  function patchDate(kind:"period"|"spotting"|"pill"|"poop", value:boolean){
    if(!state||!selected)return;
    const next={...state,periods:{...state.periods},pills:{...state.pills},poops:{...state.poops}};
    if(kind==="period"){
      if(value) next.periods[selected]="period"; else if(next.periods[selected]==="period") delete next.periods[selected];
    }
    if(kind==="spotting"){
      if(value) next.periods[selected]="spotting"; else if(next.periods[selected]==="spotting") delete next.periods[selected];
    }
    if(kind==="pill"){
      if(value) next.pills[selected]="taken"; else delete next.pills[selected];
    }
    if(kind==="poop"){
      if(value) next.poops[selected]=true; else delete next.poops[selected];
    }
    persist(next);
  }

  function saveProfile(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); if(!state)return;
    const fd=new FormData(e.currentTarget);
    const next={...state,profile:{
      ...state.profile,
      birthday:String(fd.get("birthday")||"")||undefined,
      sprintecStartDate:String(fd.get("sprintecStartDate")||"")||undefined,
      heightInches:Number(fd.get("heightInches"))||undefined,
      weightLb:Number(fd.get("weightLb"))||undefined,
    }};
    persist(next); setShowSettings(false);
  }

  const today=prediction?.today || isoDate(new Date());
  const months=useMemo(()=>{
    const start=new Date(2026,3,1);
    const end=new Date(); end.setMonth(end.getMonth()+12);
    const out:{year:number;month:number}[]=[];
    for(const d=new Date(start);d<=end;d.setMonth(d.getMonth()+1))out.push({year:d.getFullYear(),month:d.getMonth()});
    return out;
  },[]);

  const predictedDays=useMemo(()=>{
    const s=new Set<string>();
    if(prediction?.predictedPeriodStart){
      const cycle=Math.max(15,Math.round(prediction.averageCycleLength||28));
      const horizon=new Date();
      horizon.setMonth(horizon.getMonth()+13);
      let start=prediction.predictedPeriodStart;
      while(fromIso(start)<=horizon){
        for(let i=0;i<5;i++) s.add(addDays(start,i));
        start=addDays(start,cycle);
      }
    }
    return s;
  },[prediction]);

  useEffect(()=>{
    if(auth!=="in"||!state)return;
    setTimeout(()=>document.getElementById(today.slice(0,7))?.scrollIntoView({block:"start"}),50);
  },[auth,!!state]);

  useEffect(()=>{
    const onScroll=()=>setShowTopJump(window.scrollY>520);
    onScroll();
    window.addEventListener("scroll",onScroll,{passive:true});
    return ()=>window.removeEventListener("scroll",onScroll);
  },[]);

  if(auth==="checking") return <main className="shell loading">Pebbles</main>;
  if(auth==="out") return <main className="loginPage">
    <div className="loginOrb">p</div>
    <h1>Pebbles</h1>
    <p>Elly's little calendar for everyday rhythms.</p>
    <form onSubmit={login}>
      <input autoFocus type="password" value={passcode} onChange={e=>setPasscode(e.target.value)} placeholder="Passcode"/>
      <button>Open Pebbles</button>
      {loginError&&<div className="error">{loginError}</div>}
    </form>
  </main>;
  if(!state||!prediction) return <main className="shell loading">Loading Pebbles…</main>;

  const selectedKind=selected?state.periods[selected]:undefined;
  const selectedPill=selected?state.pills[selected]:undefined;
  const selectedPoop=selected?state.poops[selected]:false;
  const poopAgo=prediction.lastPoop?daysBetween(prediction.lastPoop,today):null;

  return <main className="shell" id="pebbles-top">
    <header className="topbar">
      <div>
        <div className="brand">Pebbles</div>
        <div className="subbrand">{state.profile.name}'s calendar</div>
      </div>
      <button className="gear" onClick={()=>setShowSettings(true)} aria-label="Settings">•••</button>
    </header>

    <section className="summary">
      <div className="predictionLabel">Next period</div>
      <div className="predictionDate">{formatShort(prediction.predictedPeriodStart)}</div>
      {state.profile.sprintecStartDate&&<div className="predictionHint">Sprintec may change the timing</div>}
      <div className="todayGrid">
        <button className="quick pillQuick" onClick={()=>{setSelected(today);}}>
          <span>Pill</span><strong>{state.pills[today]==="taken"?"Taken ✓":"Log today"}</strong>
        </button>
        <button className="quick poopQuick" onClick={()=>{setSelected(today);}}>
          <span>Poop</span><strong>{poopAgo===0?"Today":poopAgo===1?"Yesterday":poopAgo!=null?`${poopAgo} days ago`:"Not logged"}</strong>
        </button>
      </div>
    </section>

    <section className="feelCard">
      <span className="sparkle">✦</span>
      <div><strong>You might notice</strong><p>{prediction.note}</p></div>
    </section>

    <div className="calendarIntro"><span>Calendar</span><small>{saving?"Saving…":"Saved"}</small></div>
    <div className="calendar" ref={calendarRef}>
      {months.map(m=><Month key={monthKey(m.year,m.month)} {...m} state={state} predictedDays={predictedDays} today={today} selected={selected} onSelect={setSelected}/>)}
    </div>

    {showTopJump&&<button
      className="topJump"
      onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}
      aria-label="Go to next period"
    ><span>↑</span> Next period</button>}

    {selected&&<div className="overlay" onClick={()=>setSelected(null)}>
      <section className="sheet" onClick={e=>e.stopPropagation()}>
        <div className="grabber"/>
        <div className="sheetDate">{fromIso(selected).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
        <div className="toggles">
          <button className={selectedKind==="period"?"active periodToggle":""} onClick={()=>patchDate("period",selectedKind!=="period")}>
            <span className="toggleDot periodDot"/>Period <b>{selectedKind==="period"?"✓":""}</b>
          </button>
          <button className={selectedKind==="spotting"?"active spottingToggle":""} onClick={()=>patchDate("spotting",selectedKind!=="spotting")}>
            <span className="toggleDot spottingDot"/>Spotting <b>{selectedKind==="spotting"?"✓":""}</b>
          </button>
          <button className={selectedPill==="taken"?"active pillToggle":""} onClick={()=>patchDate("pill",selectedPill!=="taken")}>
            <span className="toggleDot pillDot"/>Pill taken <b>{selectedPill==="taken"?"✓":""}</b>
          </button>
          <button className={selectedPoop?"active poopToggle":""} onClick={()=>patchDate("poop",!selectedPoop)}>
            <span className="toggleDot poopDot"/>Poop <b>{selectedPoop?"✓":""}</b>
          </button>
        </div>
        <button className="done" onClick={()=>setSelected(null)}>Done</button>
      </section>
    </div>}

    {showSettings&&<div className="overlay" onClick={()=>setShowSettings(false)}>
      <section className="sheet settings" onClick={e=>e.stopPropagation()}>
        <div className="grabber"/>
        <h3>About Elly</h3>
        <form onSubmit={saveProfile}>
          <label>Birthday<input name="birthday" type="date" defaultValue={state.profile.birthday||""}/></label>
          <label>Sprintec started<input name="sprintecStartDate" type="date" defaultValue={state.profile.sprintecStartDate||""}/></label>
          <div className="twoCols">
            <label>Height (in)<input name="heightInches" type="number" step="0.1" defaultValue={state.profile.heightInches||""}/></label>
            <label>Weight (lb)<input name="weightLb" type="number" step="0.1" defaultValue={state.profile.weightLb||""}/></label>
          </div>
          <button className="done">Save</button>
        </form>
      </section>
    </div>}
  </main>;
}
