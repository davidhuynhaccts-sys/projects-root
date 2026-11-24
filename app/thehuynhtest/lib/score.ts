import { FILMS,CORE_FILMS,AXES,AXIS_LABELS,TONES,ASPECT_REACTIONS,LEGACY_TONE_LABELS,TEST_VERSION,type Axis,type Film } from "./data";
export type AnswerStatus = "watched" | "unwatched" | "unfamiliar";
export type AspectAnswer = { id:string; valence:number|"mixed"|"unsure"|null; reactions:string[] };
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
  const allowed=new Set<string>(ASPECT_REACTIONS.map(r=>r.id));
  let reactions=Array.isArray(item?.reactions)
   ? Array.from(new Set<string>(item.reactions.filter((r:unknown):r is string=>typeof r==="string"&&allowed.has(r)))).slice(0,2)
   : [];
  if(reactions.includes("unsure"))reactions=["unsure"];
  else if(reactions.includes("didnt_resonate"))reactions=["didnt_resonate"];
  aspects.push({id,valence,reactions});seen.add(id);if(aspects.length>=2)break;
 }
 return {status,rating,tone,tones,sliders,aspects,updatedAt:typeof raw?.updatedAt==="number"?raw.updatedAt:undefined};
}
export function complete(a:FilmAnswer):boolean {
 if(a.status!=="watched")return true;
 return a.rating!==null&&((a.tones?.length||0)>0||a.tone!==null)&&a.sliders.length===5&&a.sliders.every(v=>v!==null)&&a.aspects.length>0&&a.aspects.every(x=>x.id==="unsure"||x.reactions?.length>0||x.valence!==null);
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
 // Responses describe the SALIENCE of selected themes, not approval of the topics.
 // Standardized sliders remain primary (65%); reactions are capped at 35% for
 // the matching film-specific orientation. No repeated reaction adds extra points.
 const sums=[0,0,0,0],counts=[0,0,0,0],legacyCounts=[0,0,0,0];
 const tones=a.tones?.length?a.tones:(a.tone?[a.tone]:[]);
 let hasMixed=tones.includes("mixed")||tones.includes("bittersweet");
 const reactionById=new Map<string,number|null>(ASPECT_REACTIONS.map(r=>[r.id,r.strength] as const));
 for(const item of a.aspects){
  const selected=film.aspects.find(x=>x.id===item.id);
  if(!selected)continue;
  const i=AXES.indexOf(selected.axis);
  const responses=item.reactions||[];
  const strengths=responses.map(id=>reactionById.get(id)).filter((v):v is number=>typeof v==="number");
  const hasNewResponse=responses.length>0;
  if(responses.includes("left_me_conflicted"))hasMixed=true;
  if(strengths.length){
   const salience=strengths.reduce((sum,v)=>sum+v,0)/strengths.length;
   sums[i]+=salience;counts[i]++;
  } else if(!hasNewResponse&&item.valence!==null&&item.valence!=="unsure"){
   // Legacy slider data is retained. It is weaker evidence because its
   // positive/negative wording was ambiguous, and is never recoded as a reaction.
   const v=item.valence;
   const salience=v==="mixed"?.78:(.4+.5*Math.abs(v-3)/3);
   sums[i]+=salience;counts[i]++;legacyCounts[i]++;
   if(v==="mixed")hasMixed=true;
  }
 }
 const evidence=standard.map((base,i)=>base!==null||counts[i]>0) as [boolean,boolean,boolean,boolean];
 if(!evidence.some(Boolean))return null;
 const vector=standard.map((base,i)=>{
  const aspect=counts[i]?sums[i]/counts[i]:null;
  // The two channels are merged once, not added together. A chosen aspect
  // does not dilute unrelated orientations, and repeated overlapping
  // "made me think" signals cannot inflate an axis.
  const confidence=counts[i]>0&&counts[i]===legacyCounts[i] ? .15 : .35;
  const value=base===null?aspect:aspect===null?base:base*(1-confidence)+aspect*confidence;
  if(value===null)return 0; // Undefined dimensions are separately flagged.
  return clamp(value*(.55+.45*film.weights[i]));
 }) as [number,number,number,number];
 const ratingValence=((a.rating||3)-3)/2;
 const toneWeights:Record<string,number|null>={
  joyful:.85,hopeful:.75,warm:.65,sad:-.75,tense:-.65,unsettled:-.8,angry:-.85,awed:.55,
  reflective:null,bittersweet:null,mixed:null,indifferent:0,unsure:null,uplifting:.7,difficult:-.7
 };
 const valenced=tones.map(t=>toneWeights[t]).filter((n):n is number=>typeof n==="number");
 const toneValence=valenced.length?valenced.reduce((a,b)=>a+b,0)/valenced.length:null;
 // Reactions such as "Unsettled me" or "Frustrated me" do not imply dislike of
 // the filmmaking. The emotional-valence coordinate comes from the participant's
 // separate overall rating and primary emotional tones only. Old aspect
 // valence remains stored but isn't treated as moral endorsement.
 let weightedOpinion=.8*ratingValence,weight=.8;
 if(toneValence!==null){weightedOpinion+=.2*toneValence;weight+=.2;}
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
