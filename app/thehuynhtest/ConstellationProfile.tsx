"use client";
import {AXES,AXIS_LABELS,FILMS,TONES,LEGACY_TONE_LABELS} from "./lib/data";
import type {Axis} from "./lib/data";
import type {Profile,FilmPoint} from "./lib/score";

type Person={id:string;name:string;color:string;profile:Profile};
type Props={people:Person[];onReturn:()=>void;onClose?:()=>void;onFilm:(id:string)=>void};
const toneName=(tone:string)=>TONES.find(t=>t.id===tone)?.label||LEGACY_TONE_LABELS[tone]||tone;
const axisMeaning:Record<Axis,string>={
 existential:"Responses to questions about identity, reality, freedom, meaning, and how experience changes over time.",
 moral:"Engagement with ethical dilemmas, inequality, community, responsibility, and social systems.",
 emotional:"Connections to characters, personal relationships, empathy, grief, affection, and belonging.",
 artistic:"Responses to filmmaking, imagery, originality, structure, performance, and narrative craft."
};
const mostConnected=(profile:Profile,axis:Axis)=>profile.points.filter(p=>p.evidence?.[AXES.indexOf(axis)]).sort((a,b)=>b.vector[AXES.indexOf(axis)]-a.vector[AXES.indexOf(axis)]).slice(0,3);
const rank=(profile:Profile)=>AXES.filter(a=>profile.orientationScores[a]!==null).sort((a,b)=>(profile.orientationScores[b]||0)-(profile.orientationScores[a]||0));
const toneCounts=(points:FilmPoint[])=>{
 const counts=new Map<string,number>();
 for(const film of points)for(const tone of new Set(film.tones)){if(tone!=="unsure")counts.set(tone,(counts.get(tone)||0)+1);}
 return Array.from(counts).sort((a,b)=>b[1]-a[1]);
};
const dist=(a:[number,number,number],b:[number,number,number])=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
export default function ConstellationProfile({people,onReturn,onClose,onFilm}:Props){
 const primary=people[0],profile=primary?.profile;
 if(!profile)return <section className="cosmos-story-empty"><h2>Your MPP is taking shape</h2><p>Complete a film to reveal more of your profile.</p><button onClick={onReturn}>Return to constellation ↓</button></section>;
 const ranked=rank(profile),tones=toneCounts(profile.points);
 const center=profile.centroid;
 const outliers=center?profile.points.map(f=>({film:f,distance:dist(f.point,center)})).sort((a,b)=>b.distance-a.distance).slice(0,3):[];
 const filmTitles=new Map(FILMS.map(f=>[f.id,f.title]));
 const friends=people.slice(1);
 return <div className="cosmos-story-shell">
  <header className="cosmos-story-header">
   <div className="cosmos-story-brand">✧ THE HUYNH TEST <span>/ YOUR MOVIE PERSONALITY PROFILE</span></div>
   <div className="cosmos-story-nav"><button type="button" onClick={onReturn}>↓ Return to Constellation</button>{onClose?<button type="button" onClick={onClose} aria-label="Exit immersive experience">✕</button>:null}</div>
  </header>
  <main className="cosmos-story-main">
   <section className="cosmos-story-hero">
    <div className="cosmos-story-kicker">YOUR CINEMATIC PORTRAIT · {profile.stage==="expanded"?"EXPANDED":"CORE"} TEST</div>
    <h1>{profile.headline}<span aria-hidden="true"> ✧</span></h1>
    <p className="cosmos-story-lede">{profile.narrative}</p>
    <div className="cosmos-story-facts"><span>{profile.completed} films assessed</span><span>{profile.skipped} skipped</span><span>{profile.total} films in this stage</span><span>Exploratory pilot</span></div>
    <p className="cosmos-story-intro">The films are not measuring whether your taste is good or bad. They reveal different ways you respond to ideas, characters, and storytelling. The patterns below come from your completed responses and will evolve as you revisit films or deepen your profile.</p>
   </section>
   <section className="cosmos-story-section" aria-label="The four core orientations">
    <div className="cosmos-story-section-head"><span>01 / THE FOUR ORIENTATIONS</span><h2>How your responses take shape.</h2><p>Each orientation represents one kind of engagement with the movies you have assessed. Higher values indicate stronger evidence in this particular sample of films, not better or more admirable personality traits.</p></div>
    <div className="cosmos-story-axes">
     {AXES.map((axis,i)=>{
      const value=profile.orientationScores[axis],examples=mostConnected(profile,axis);
      return <article className="cosmos-story-axis" key={axis}>
       <div className="cosmos-story-axis-header"><span className="cosmos-story-axis-index">0{i+1}</span><h3>{AXIS_LABELS[axis]}</h3><strong>{value===null?"—":value+" / 100"}</strong></div>
       <div className="cosmos-story-axis-bar"><span style={{width:(value||0)+"%",background:primary.color}}/></div>
       <p>{axisMeaning[axis]}</p>
       {examples.length?<div className="cosmos-story-film-evidence"><span>FILMS CONTRIBUTING EVIDENCE</span><div>{examples.map(f=><button type="button" key={f.filmId} onClick={()=>onFilm(f.filmId)}>{f.title} ↗</button>)}</div></div>:<p className="cosmos-story-muted">There is not enough film-specific evidence on this orientation yet.</p>}
      </article>;
     })}
    </div>
   </section>
   <section className="cosmos-story-section cosmos-story-split">
    <div className="cosmos-story-section-head"><span>02 / EMOTIONAL SIGNATURE</span><h2>What lingered after the credits.</h2><p>These are the feelings you actually selected. Different emotions may coexist within the same movie, even when you loved the film overall.</p></div>
    <div className="cosmos-story-emotions">
     {tones.length?tones.slice(0,7).map(([id,n])=><div className="cosmos-story-emotion" key={id}><strong>{toneName(id)}</strong><span>{n} {n===1?"film":"films"}</span></div>):<p>You have not selected enough emotional tones to identify a recurring pattern yet.</p>}
    </div>
   </section>
   <section className="cosmos-story-section">
    <div className="cosmos-story-section-head"><span>03 / YOUR MOST DISTINCT FILM RESPONSES</span><h2>The films that sit apart.</h2><p>These are the films whose provisional positions fall furthest from your profile's center. They may be distinctive because of emotional tone, orientation engagement, or the way the dimensions interact. Distance alone does not tell us why.</p></div>
    <div className="cosmos-story-films">
     {outliers.length?outliers.map(({film},i)=><button type="button" className="cosmos-story-film" key={film.filmId} onClick={()=>onFilm(film.filmId)}><span>0{i+1}</span><strong>{film.title}</strong><small>{film.tones.length?film.tones.map(toneName).join(" · "):"No emotional tones selected"}</small><i>Explore in constellation ↗</i></button>):<p>No film-response points are available yet.</p>}
    </div>
   </section>
   {friends.length?<section className="cosmos-story-section">
     <div className="cosmos-story-section-head"><span>04 / SHARED PERSPECTIVES</span><h2>Where your worlds meet.</h2><p>Comparison highlights differences within the same provisional response space. It does not rank the people in it.</p></div>
     <div className="cosmos-story-friends">{friends.map(friend=>{
      const mine=new Map(profile.points.map(p=>[p.filmId,p]));
      const common=friend.profile.points.flatMap(f=>{const other=mine.get(f.filmId);return other?[{title:filmTitles.get(f.filmId)||f.title,d:dist(other.point,f.point)}]:[];}).sort((a,b)=>a.d-b.d);
      return <article key={friend.id}><h3>{friend.name}</h3><p>{common.length?common.length+" films in common. Closest film-response positions: "+common.slice(0,2).map(f=>f.title).join(", ")+". Most different: "+common.slice(-2).reverse().map(f=>f.title).join(", ")+".":"No completed films in common yet."}</p></article>;
     })}</div>
   </section>:null}
   <section className="cosmos-story-closing"><div className="cosmos-story-kicker">THE MAP CONTINUES</div><h2>Your constellation is still changing.</h2><p>Each film response adds another point, and each new point may change the emerging pattern. Your profile is a portrait of these responses at this moment, not a permanent label.</p><button type="button" onClick={onReturn}>↓ Return to the Emotional Constellation</button><small>Provisional exploratory analysis. Not a validated psychometric or mental-health assessment.</small></section>
  </main>
 </div>;
}
