"use client";
import { useMemo,useRef,useState } from "react";
import type { Profile,FilmPoint } from "./lib/score";
type Person={id:string;name:string;color:string;profile:Profile};
type Dot={person:Person;film:FilmPoint;x:number;y:number;z:number;radius:number};
export default function Constellation({people}:{people:Person[]}){
 const [yaw,setYaw]=useState(-.55),[pitch,setPitch]=useState(.35),[zoom,setZoom]=useState(1);
 const [picked,setPicked]=useState<{id:string;filmId:string}|null>(null);
 const pointer=useRef<{x:number;y:number}|null>(null);
 const transform=(v:[number,number,number])=>{
  const [x,y,z]=v;const x1=x*Math.cos(yaw)+z*Math.sin(yaw),z1=-x*Math.sin(yaw)+z*Math.cos(yaw);
  const y1=y*Math.cos(pitch)-z1*Math.sin(pitch),z2=y*Math.sin(pitch)+z1*Math.cos(pitch);
  const scale=315*zoom/(1+Math.max(-.8,z2)*.24);
  return {x:500+x1*scale,y:295-y1*scale,z:z2};
 };
 const dots=useMemo(()=>{
  const result:Dot[]=[];
  for(const person of people)for(const film of person.profile.points){
   const p=transform(film.point);result.push({...p,film,person,radius:person.id==="self"?6.2:5.6});
  }
  return result.sort((a,b)=>a.z-b.z);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[people,yaw,pitch,zoom]);
 const selected=dots.find(d=>picked&&d.person.id===picked.id&&d.film.filmId===picked.filmId);
 return <section className="constellation">
  <div className="constellation-top">
   <div><div className="eyebrow">THE EMOTIONAL CONSTELLATION</div><h3>One space. Different inner worlds.</h3></div>
   <div className="view-controls">
    <button type="button" onClick={()=>{setYaw(-.55);setPitch(.35);setZoom(1);setPicked(null)}}>Reset view</button>
    <button type="button" aria-label="Zoom out" onClick={()=>setZoom(z=>Math.max(.6,z-.15))}>−</button>
    <button type="button" aria-label="Zoom in" onClick={()=>setZoom(z=>Math.min(2.2,z+.15))}>+</button>
   </div>
  </div>
  <div className="constellation-legend">
   {people.map(p=><div key={p.id}><span style={{background:p.color}}/>{p.name} <small>{p.profile.completed}/20 films</small></div>)}
  </div>
  <svg className="starfield" viewBox="0 0 1000 620" role="img" aria-label="Interactive 3D projection of film response profiles. Drag to rotate and select movie points." onPointerDown={e=>{pointer.current={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(!pointer.current)return;const dx=e.clientX-pointer.current.x,dy=e.clientY-pointer.current.y;pointer.current={x:e.clientX,y:e.clientY};if(Math.abs(dx)+Math.abs(dy)>.5){setYaw(x=>x+dx*.008);setPitch(x=>Math.max(-1.35,Math.min(1.35,x+dy*.008)));}}} onPointerUp={()=>{pointer.current=null}} onPointerCancel={()=>{pointer.current=null}}>
   <defs><radialGradient id="ht-space"><stop offset="0%" stopColor="#182641"/><stop offset="100%" stopColor="#080c17"/></radialGradient></defs>
   <rect width="1000" height="620" fill="url(#ht-space)" rx="16"/>
   {Array.from({length:45},(_,i)=><circle key={"star"+i} cx={(i*239+121)%997} cy={(i*167+43)%595} r={(i%4===0?1.25:.65)} fill="#e0e9ff" opacity={.12+(i%4)*.07}/>)}
   {[.25,.5,.75,1].map((r)=><ellipse key={r} cx="500" cy="295" rx={r*290*zoom} ry={r*140*zoom} fill="none" stroke="#58729b" strokeDasharray="4 8" opacity=".23"/>)}
   <line x1="80" x2="920" y1="295" y2="295" stroke="#536787" opacity=".28"/>
   <line x1="500" x2="500" y1="30" y2="570" stroke="#536787" opacity=".18"/>
   {dots.map(d=>{
    const active=picked?.id===d.person.id&&picked?.filmId===d.film.filmId;
    return <g key={d.person.id+":"+d.film.filmId} onClick={e=>{e.stopPropagation();setPicked({id:d.person.id,filmId:d.film.filmId})}} className="star-dot" role="button" tabIndex={0} onKeyDown={e=>{if(e.key==="Enter")setPicked({id:d.person.id,filmId:d.film.filmId})}}>
     <circle cx={d.x} cy={d.y} r={active?16:d.radius+3} fill={d.person.color} opacity={active?.25:.13}/>
     <circle cx={d.x} cy={d.y} r={active?8.5:d.radius} fill={d.person.color} stroke={active?"#fff":"#0a1224"} strokeWidth={active?2:1.2}/>
     <text x={d.x+9} y={d.y-8} fill={active?"#fff":"#c0cade"} fontSize={active?13:10} fontWeight={active?700:400} opacity={d.person.id==="self"||people.length===1||active?.96:.65} paintOrder="stroke" stroke="#0b1220" strokeWidth="3" strokeLinejoin="round">{d.film.title}</text>
    </g>;
   })}
   <text x="26" y="593" fill="#8b9ab2" fontSize="13">Drag to rotate · Select a movie to inspect · Same coordinate system for everyone</text>
  </svg>
  {selected?<div className="selected-star"><span style={{background:selected.person.color}} className="dot-mini"/><div><strong>{selected.film.title}</strong><p>{selected.person.name} · {selected.film.rating===5?"🤩 Amazing":selected.film.rating===4?"🙂 Good":selected.film.rating===3?"😐 OK":selected.film.rating===2?"🙁 Bad":"😖 Terrible"} · {selected.film.tone==="mixed"?"Mixed / conflicted":selected.film.tone}</p></div><button type="button" onClick={()=>setPicked(null)}>Close</button></div>:null}
  <p className="fine-print">Pilot visualization uses a fixed projection of four provisional orientation dimensions into 3D. Proximity illustrates the current model, not a validated psychological similarity measure.</p>
 </section>;
}
