"use client";
import {useEffect,useState} from "react";
import {useParams} from "next/navigation";
import Link from "next/link";
import Constellation from "../../Constellation";
import {AXES,AXIS_LABELS} from "../../lib/data";
import type {Profile} from "../../lib/score";
type Shared={name:string;handle:string;profile:Profile};
export default function SharedPage(){
 const params=useParams();const token=String(params.token||"");
 const [data,setData]=useState<Shared|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 useEffect(()=>{fetch("/thehuynhtest/api/public/"+encodeURIComponent(token),{cache:"no-store"}).then(async r=>{const j=await r.json();if(!r.ok)throw new Error(j.error||"Unavailable");setData(j)}).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[token]);
 return <div className="ht-shell"><header className="ht-header"><Link className="ht-brand" href="/thehuynhtest"><span className="ht-symbol">✺</span><span>THE HUYNH TEST<small>A MOVIE PERSONALITY EXPERIMENT</small></span></Link><Link className="btn-secondary" href="/thehuynhtest">Take the test ↗</Link></header><main className="ht-main">{loading?<div className="ht-loading">Loading shared profile...</div>:error?<div className="ht-panel"><h2>Profile unavailable</h2><p>{error}</p><Link className="btn-primary" href="/thehuynhtest">Explore the Huynh Test</Link></div>:data?<><section className="results-intro"><div className="eyebrow">SHARED MOVIE PERSONALITY PROFILE</div><h1>{data.name}'s constellation</h1><p>{data.profile.narrative}</p><div className="result-count"><span>{data.profile.completed} / 20 films</span><span>{data.profile.incomplete?"INCOMPLETE":"FULL FILM COVERAGE"}</span><span>EXPLORATORY PILOT</span></div></section><div className="ht-panel"><div className="eyebrow">FOUR CORE ORIENTATIONS</div><h3>{data.profile.headline}</h3>{AXES.map(ax=><div className="orientation" key={ax}><div><span>{AXIS_LABELS[ax]}</span><strong>{data.profile.orientationScores[ax]??"—"}</strong></div><div className="progress-meter"><span style={{width:(data.profile.orientationScores[ax]||0)+"%"}}/></div></div>)}</div><Constellation people={[{id:"self",name:data.name,color:"#97cced",profile:data.profile}]}/><div className="results-actions"><Link className="btn-primary" href="/thehuynhtest">Take the test and compare →</Link></div></>:null}</main><footer className="ht-footer">✺ THE HUYNH TEST · A PROVISIONAL CINEMATIC RESPONSE PROFILE</footer></div>;
}
