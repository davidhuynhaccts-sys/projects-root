import { FILMS,AXES,AXIS_LABELS,TEST_VERSION,type Axis,type Film } from "./data";
export type AnswerStatus = "watched" | "unwatched" | "unfamiliar";
export type AspectAnswer = { id:string; valence:number|"mixed"|"unsure"|null };
export type FilmAnswer = { status:AnswerStatus; rating:number|null; tone:string|null; sliders:(number|null)[]; aspects:AspectAnswer[]; updatedAt?:number };
export type FilmPoint = {filmId:string;title:string;rating:number;tone:string;vector:[number,number,number,number];point:[number,number,number];selectedAspects:string[]};
export type Profile = {version:string;completed:number;skipped:number;total:number;incomplete:boolean;orientationScores:Record<Axis,number|null>;points:FilmPoint[];centroid:[number,number,number]|null;headline:string;narrative:string;topFilms:string[];coveredOrientations:Axis[]};
export const EMPTY_ANSWER:FilmAnswer={status:"watched",rating:null,tone:null,sliders:[null,null,null,null,null],aspects:[]};
export function freshAnswer():FilmAnswer { return {status:"watched",rating:null,tone:null,sliders:[null,null,null,null,null],aspects:[]}; }
export function normalizeAnswer(film:Film,raw:any):FilmAnswer {
 const status:AnswerStatus=["watched","unwatched","unfamiliar"].includes(raw?.status)?raw.status:"watched";
 if(status!=="watched")return {status,rating:null,tone:null,sliders:[null,null,null,null,null],aspects:[]};
 const rating=Number.isInteger(raw?.rating)&&raw.rating>=1&&raw.rating<=5?raw.rating:null;
 const tone=["uplifting","difficult","mixed","indifferent","unsure"].includes(raw?.tone)?raw.tone:null;
 const sliders=Array.from({length:5},(_,i)=>{const n=raw?.sliders?.[i];return Number.isInteger(n)&&n>=-1&&n<=6?n:null;});
 const seen=new Set<string>();const aspects:AspectAnswer[]=[];
 if(Array.isArray(raw?.aspects))for(const item of raw.aspects.slice(0,6)){
  const id=String(item?.id||"");if(seen.has(id)||!(film.aspects.some(a=>a.id===id)||id==="unsure"))continue;
  const v=item?.valence;const valence=Number.isInteger(v)&&v>=0&&v<=6?v:(v==="mixed"||v==="unsure"?v:null);
  aspects.push({id,valence});seen.add(id);if(aspects.length>=2)break;
 }
 return {status,rating,tone,sliders,aspects};
}
export function complete(a:FilmAnswer):boolean {
 if(a.status!=="watched")return true;
 return a.rating!==null&&a.tone!==null&&a.sliders.length===5&&a.sliders.every(v=>v!==null)&&a.aspects.length>0&&a.aspects.every(x=>x.valence!==null);
}
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const normal=(n:number|null)=>n===null||n===-1?null:n/6;
export function project(vector:[number,number,number,number]):[number,number,number] {
 const [e,m,h,a]=vector;
 return [+(a-e).toFixed(4),+(h-m).toFixed(4),+((e+m+h+a-2)/2).toFixed(4)];
}
function scoreFilm(film:Film,a:FilmAnswer):FilmPoint {
 const s=a.sliders.map(normal);
 // Missing/Not sure answers contribute no evidence rather than a fictitious neutral response.
 const value=(i:number)=>s[i]===null?.5:s[i] as number;
 const input:[number,number,number,number]=[
  .25*value(0)+.75*value(4),
  .28*value(1)+.25*value(4)+.47*value(0),
  .55*value(1)+.45*value(0),
  .56*value(3)+.44*value(2)
 ];
 const aspectSum=[0,0,0,0];let chosen=0;
 for(const item of a.aspects){
  const found=film.aspects.find(x=>x.id===item.id);
  if(!found||item.valence==="unsure"||item.valence===null)continue;
  const axisIndex=AXES.indexOf(found.axis);
  const strength=item.valence==="mixed"?1:(.45+.55*Math.abs(item.valence-3)/3);
  aspectSum[axisIndex]+=strength;chosen++;
 }
 const v=input.map((base,i)=>{
  const salience=chosen?aspectSum[i]/chosen:base;
  const relevance=film.weights[i];
  return clamp((.64*base+.36*salience)*(.55+.45*relevance));
 }) as [number,number,number,number];
 return {filmId:film.id,title:film.title,rating:a.rating||3,tone:a.tone||"unsure",vector:v,point:project(v),selectedAspects:a.aspects.map(x=>x.id)};
}
export function scoreProfile(answers:Record<string,FilmAnswer>):Profile {
 const points:FilmPoint[]=[];let skipped=0;
 for(const film of FILMS){const a=answers[film.id];if(!a)continue;if(a.status!=="watched"){skipped++;continue;}if(complete(a))points.push(scoreFilm(film,a));}
 const count=points.length;
 const dims=AXES.map((_,i)=>count?points.reduce((sum,p)=>sum+p.vector[i],0)/count:null);
 const orientationScores=Object.fromEntries(AXES.map((axis,i)=>[axis,dims[i]===null?null:Math.round((dims[i] as number)*100)])) as Record<Axis,number|null>;
 const ranked=AXES.map((axis,i)=>({axis,value:dims[i]||0})).sort((a,b)=>b.value-a.value);
 const topFilms=points.slice().sort((a,b)=>(b.vector[AXES.indexOf(ranked[0].axis)]-a.vector[AXES.indexOf(ranked[0].axis)])).slice(0,3).map(x=>x.title);
 const top=ranked[0]?.axis||"existential";const second=ranked[1]?.axis||"emotional";
 const titleWords:Record<Axis,string>={existential:"Reflective Explorer",moral:"Social Observer",emotional:"Empathetic Connector",artistic:"Creative Interpreter"};
 const headline=count?titleWords[top]:"Your constellation begins here";
 const narrative=count
 ? "Your completed film responses place the strongest emphasis on "+AXIS_LABELS[top].toLowerCase()+", with "+AXIS_LABELS[second].toLowerCase()+" also present. These patterns describe what you engaged with across these films, not a fixed personality trait. "+(topFilms.length?"Films contributing examples include "+topFilms.join(", ")+". ":"")+(count<20?"Your profile is incomplete and may change as you assess more films.":"You have assessed all twenty films.")
 : "Complete a familiar movie to begin an exploratory Movie Personality Profile. There are no correct tastes or interpretations.";
 const centroid: [number,number,number]|null =count?project(dims.map(x=>x||0) as [number,number,number,number]):null;
 const coveredOrientations=AXES.filter((ax,i)=>points.some(p=>p.vector[i]>.28));
 return {version:TEST_VERSION,completed:count,skipped,total:FILMS.length,incomplete:count<FILMS.length,orientationScores,points,centroid,headline,narrative,topFilms,coveredOrientations};
}
export function sharedProfile(profile:Profile) {return {version:profile.version,completed:profile.completed,total:profile.total,incomplete:profile.incomplete,orientationScores:profile.orientationScores,points:profile.points,centroid:profile.centroid,headline:profile.headline,narrative:profile.narrative};}
