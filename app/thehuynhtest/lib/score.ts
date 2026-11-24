import { FILMS,CORE_FILMS,AXES,AXIS_LABELS,TONES,LEGACY_TONE_LABELS,TEST_VERSION,type Axis,type Film } from "./data";
export type AnswerStatus = "watched" | "unwatched" | "unfamiliar";
export type AspectAnswer = { id:string; valence:number|"mixed"|"unsure"|null };
export type FilmAnswer = { status:AnswerStatus; rating:number|null; tone:string|null; tones:string[]; sliders:(number|null)[]; aspects:AspectAnswer[]; updatedAt?:number };
export type FilmPoint = {filmId:string;title:string;rating:number;tone:string;tones:string[];vector:[number,number,number,number];point:[number,number,number];selectedAspects:string[];mixed:boolean;evidence:[boolean,boolean,boolean,boolean]};
export type Profile = {version:string;stage:"core"|"expanded";completed:number;skipped:number;total:number;incomplete:boolean;orientationScores:Record<Axis,number|null>;points:FilmPoint[];centroid:[number,number,number]|null;headline:string;narrative:string;topFilms:string[];coveredOrientations:Axis[]};
export const EMPTY_ANSWER:FilmAnswer={status:"watched",rating:null,tone:null,tones:[],sliders:[null,null,null,null,null],aspects:[]};
export function freshAnswer():FilmAnswer { return {status:"watched",rating:null,tone:null,tones:[],sliders:[null,null,null,null,null],aspects:[]}; }
export function normalizeAnswer(film:Film,raw:any):FilmAnswer {
 const status:AnswerStatus=["watched","unwatched","unfamiliar"].includes(raw?.status)?raw.status:"watched";
 if(status!=="watched")return {status,rating:null,tone:null,tones:[],sliders:[null,null,null,null,null],aspects:[],updatedAt:typeof raw?.updatedAt==="number"?raw.updatedAt:undefined};
 const rating=Number.isInteger(raw?.rating)&&raw.rating>=1&&raw.rating<=5?raw.rating:null;
 const allowed=new Set<string>([...TONES.map(t=>t.id),...Object.keys(LEGACY_TONE_LABELS)]);
 const toneInput:Array<unknown>=Array.isArray(raw?.tones)?raw.tones:(typeof raw?.tone==="string"?[raw.tone]:[]);
 let tones=Array.from(new Set(toneInput.filter((t):t is string=>typeof t==="string"&&allowed.has(t)))).slice(0,3);
 // Indifferent and Not sure are exclusive. Keep older single-tone answers unchanged.
 if(tones.includes("unsure"))tones=["unsure"];
 else if(tones.includes("indifferent"))tones=["indifferent"];
 const tone=tones[0]||null;
 const sliders=Array.from({length:5},(_,i)=>{const n=raw?.sliders?.[i];return Number.isInteger(n)&&n>=-1&&n<=6?n:null;});
 const seen=new Set<string>();const aspects:AspectAnswer[]=[];
 if(Array.isArray(raw?.aspects))for(const item of raw.aspects.slice(0,6)){
  const id=String(item?.id||"");if(seen.has(id)||!(film.aspects.some(a=>a.id===id)||id==="unsure"))continue;
  const v=item?.valence;const valence=Number.isInteger(v)&&v>=0&&v<=6?v:(v==="mixed"||v==="unsure"?v:null);
  aspects.push({id,valence});seen.add(id);if(aspects.length>=2)break;
 }
 return {status,rating,tone,tones,sliders,aspects,updatedAt:typeof raw?.updatedAt==="number"?raw.updatedAt:undefined};
}
export function complete(a:FilmAnswer):boolean {
 if(a.status!=="watched")return true;
 return a.rating!==null&&((a.tones?.length||0)>0||a.tone!==null)&&a.sliders.length===5&&a.sliders.every(v=>v!==null)&&a.aspects.length>0&&a.aspects.every(x=>x.valence!==null);
}
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const normal=(n:number|null)=>n===null||n===-1?null:n/6;
export function project(vector:[number,number,number,number]):[number,number,number] {
 const [e,m,h,a]=vector;
 return [+(a-e).toFixed(4),+(h-m).toFixed(4),+((e+m+h+a-2)/2).toFixed(4)];
}
function scoreFilm(film:Film,a:FilmAnswer):FilmPoint|null {
 const s=a.sliders.map(normal);
 // Uncertain answers are absent evidence, not artificial neutral observations.
 const weighted=(items:Array<[number,number]>):number|null=>{
  let total=0,weight=0;
  for(const [idx,w] of items)if(s[idx]!==null){total+=(s[idx] as number)*w;weight+=w;}
  return weight?total/weight:null;
 };
 const standard=[
  weighted([[0,.25],[4,.75]]),
  weighted([[1,.28],[4,.25],[0,.47]]),
  weighted([[1,.55],[0,.45]]),
  weighted([[3,.56],[2,.44]])
 ];
 const sums=[0,0,0,0];let selectedCount=0;
 const tones=a.tones?.length?a.tones:(a.tone?[a.tone]:[]);
 let signedSum=0,signedCount=0,hasMixed=tones.includes("mixed")||tones.includes("bittersweet");
 for(const item of a.aspects){
  const selected=film.aspects.find(x=>x.id===item.id);
  if(!selected||item.valence===null||item.valence==="unsure")continue;
  const i=AXES.indexOf(selected.axis);
  const strength=item.valence==="mixed"?1:(.45+.55*Math.abs(item.valence-3)/3);
  sums[i]+=strength;selectedCount++;
  if(item.valence==="mixed")hasMixed=true;
  if(typeof item.valence==="number"){signedSum+=(item.valence-3)/3;signedCount++;}
 }
 const evidence=standard.map((base,i)=>base!==null||sums[i]>0) as [boolean,boolean,boolean,boolean];
 if(!evidence.some(Boolean))return null;
 const vector=standard.map((base,i)=>{
  const aspect=sums[i]>0?sums[i]/Math.max(1,selectedCount):null;
  const value=base===null?aspect:aspect===null?base:.64*base+.36*aspect;
  if(value===null)return 0; // Undefined dimension is flagged, never scored as zero.
  return clamp(value*(.55+.45*film.weights[i]));
 }) as [number,number,number,number];
 const ratingValence=((a.rating||3)-3)/2;
 const aspectValence=signedCount?signedSum/signedCount:null;
 const toneWeights:Record<string,number|null>={
  joyful:.85,hopeful:.75,warm:.65,sad:-.75,tense:-.65,unsettled:-.8,angry:-.85,awed:.55,
  reflective:null,bittersweet:null,mixed:null,indifferent:0,unsure:null,uplifting:.7,difficult:-.7
 };
 const valenced=tones.map(t=>toneWeights[t]).filter((n):n is number=>typeof n==="number");
 const toneValence=valenced.length?valenced.reduce((a,b)=>a+b,0)/valenced.length:null;
 // Unknown or deliberately mixed reactions do not become artificial neutral observations.
 let weightedOpinion=.55*ratingValence,weight=.55;
 if(aspectValence!==null){weightedOpinion+=.3*aspectValence;weight+=.3;}
 if(toneValence!==null){weightedOpinion+=.15*toneValence;weight+=.15;}
 const opinion=weightedOpinion/weight;
 const base=project(vector);
 const point:[number,number,number]=[base[0],base[1],+opinion.toFixed(4)];
 return {filmId:film.id,title:film.title,rating:a.rating||3,tone:a.tone||"unsure",tones,vector,point,selectedAspects:a.aspects.map(x=>x.id),mixed:hasMixed,evidence};
}
export function scoreProfile(answers:Record<string,FilmAnswer>,expanded=false):Profile {
 const stage=expanded?"expanded":"core";
 const included=expanded?FILMS:CORE_FILMS;
 const points:FilmPoint[]=[];let skipped=0,completed=0;
 for(const film of included){
  const a=answers[film.id];if(!a)continue;
  if(a.status!=="watched"){skipped++;continue;}
  if(!complete(a))continue;
  completed++;
  const point=scoreFilm(film,a);if(point)points.push(point);
 }
 const dims=AXES.map((_,i)=>{
  const supported=points.filter(p=>p.evidence[i]);
  return supported.length?supported.reduce((sum,p)=>sum+p.vector[i],0)/supported.length:null;
 });
 const orientationScores=Object.fromEntries(AXES.map((axis,i)=>[axis,dims[i]===null?null:Math.round((dims[i] as number)*100)])) as Record<Axis,number|null>;
 const ranked=AXES.map((axis,i)=>({axis,value:dims[i]})).filter(x=>x.value!==null).sort((a,b)=>(b.value as number)-(a.value as number));
 const top=ranked[0]?.axis||"existential";
 const second=ranked[1]?.axis||top;
 const topFilms=points.filter(p=>p.evidence[AXES.indexOf(top)]).sort((a,b)=>b.vector[AXES.indexOf(top)]-a.vector[AXES.indexOf(top)]).slice(0,3).map(x=>x.title);
 const titleWords:Record<Axis,string>={existential:"Reflective Explorer",moral:"Social Observer",emotional:"Empathetic Connector",artistic:"Creative Interpreter"};
 const headline=ranked.length?titleWords[top]:"Your constellation begins here";
 const narrative=ranked.length
 ? "Your completed film responses place the strongest emphasis on "+AXIS_LABELS[top].toLowerCase()+(ranked.length>1?", with "+AXIS_LABELS[second].toLowerCase()+" also present":"")+". These patterns describe what you engaged with across these films, not a fixed personality trait. "+(topFilms.length?"Films contributing examples include "+topFilms.join(", ")+". ":"")+(completed<included.length?"Your profile has missing film coverage and may change as you assess more films.":expanded?"You have assessed all twenty films.":"You have assessed all ten Core films.")
 : completed?"You completed films but marked their scoring questions as uncertain. Your responses are saved, but there is not yet enough evidence for orientation scores.":"Complete a familiar movie to begin an exploratory Movie Personality Profile. There are no correct tastes or interpretations.";
 const centroid:[number,number,number]|null=points.length?[
  ...([0,1,2].map(i=>+(points.reduce((sum,p)=>sum+p.point[i],0)/points.length).toFixed(4)) as [number,number,number])
 ]:null;
 const coveredOrientations=ranked.map(x=>x.axis);
 return {version:TEST_VERSION,stage,completed,skipped,total:included.length,incomplete:completed<included.length,orientationScores,points,centroid,headline,narrative,topFilms,coveredOrientations};
}
export function sharedProfile(profile:Profile) {return {version:profile.version,stage:profile.stage,completed:profile.completed,skipped:profile.skipped,total:profile.total,incomplete:profile.incomplete,orientationScores:profile.orientationScores,points:profile.points,centroid:profile.centroid,headline:profile.headline,narrative:profile.narrative};}
