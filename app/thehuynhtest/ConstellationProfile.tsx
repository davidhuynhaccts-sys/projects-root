"use client";
import {AXES,AXIS_LABELS,FILMS,TONES,LEGACY_TONE_LABELS,ASPECT_REACTIONS} from "./lib/data";
import type {Axis} from "./lib/data";
import type {Profile,FilmPoint} from "./lib/score";

type Person={id:string;name:string;color:string;profile:Profile};
type Props={people:Person[];onReturn:()=>void;onClose?:()=>void;onFilm:(id:string)=>void};
const toneName=(id:string)=>TONES.find(t=>t.id===id)?.label||LEGACY_TONE_LABELS[id]||id;
const dist=(a:[number,number,number],b:[number,number,number])=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const t=(s:string)=>s.charAt(0).toLowerCase()+s.slice(1);
const frame:Record<Axis,{identity:string;paragraph:string;counterpoint:string;meaning:string;questions:string}>={
 existential:{
  identity:"The meaning-seeker",
  paragraph:"Questions of identity, reality, freedom, memory, and time tend to be especially visible in this orientation. When those questions surface in a film, your recorded responses provide more evidence of engagement with them than with some other dimensions.",
  counterpoint:"That does not necessarily mean you prefer complicated films or dislike straightforward stories. It means that, within this particular selection of movies, meaning-making themes contributed strongly to your responses.",
  meaning:"Questions about existence, self-understanding, purpose, time, and the tension between what is real and what is believed.",
  questions:"What does this film say about being human? Which questions stay with you after the story ends?"
 },
 moral:{
  identity:"The observer of human systems",
  paragraph:"This orientation tracks engagement with ethical choices, inequality, responsibility, belonging, and the social systems that shape people's lives. A morally uncomfortable film can contribute strongly even if you would never endorse what its characters do.",
  counterpoint:"A strong Moral and Social signal is not a judgment of your values or political views. It reflects the salience of social and ethical questions in the films you assessed.",
  meaning:"People's decisions, fairness, power, responsibility, and the structures that constrain or enable choices.",
  questions:"Who bears the consequences of a choice? What does the film ask you to understand, rather than excuse?"
 },
 emotional:{
  identity:"The human connection-seeker",
  paragraph:"This orientation reflects the extent to which relationships, feelings, and connections to characters figured in your reactions. The response may be tenderness, grief, discomfort, recognition, or empathy. The intensity of a connection is not the same thing as whether the film felt pleasant.",
  counterpoint:"An elevated signal does not prove how empathetic you are outside the cinema. It describes the kind of attention your film responses reveal.",
  meaning:"Character relationships, longing, vulnerability, grief, love, belonging, and identification with other people's experiences.",
  questions:"Whose experience stayed with you? Which relationships carried the film's emotional weight?"
 },
 artistic:{
  identity:"The interpreter of cinematic craft",
  paragraph:"This orientation reflects engagement with how a movie tells its story: its visual imagination, performances, originality, narrative structure, and formal choices. A film can be admired as art even when its characters or subject matter leave you unsettled.",
  counterpoint:"This signal does not establish refined taste, expertise, or superiority. It tells us that storytelling and expressive choices figured prominently in these answers.",
  meaning:"Visual language, inventive ideas, filmmaking choices, storytelling, performance, structure, and the effect of artistic form.",
  questions:"Why did the filmmaker choose to tell the story this way? How did style change what the film meant to you?"
 }
};
const mostConnected=(profile:Profile,axis:Axis)=>profile.points.filter(p=>p.evidence?.[AXES.indexOf(axis)]).sort((a,b)=>b.vector[AXES.indexOf(axis)]-a.vector[AXES.indexOf(axis)]).slice(0,3);
const rankedAxes=(profile:Profile)=>AXES.filter(a=>profile.orientationScores[a]!==null).sort((a,b)=>(profile.orientationScores[b]||0)-(profile.orientationScores[a]||0));
function toneCounts(points:FilmPoint[]){
 const m=new Map<string,number>();
 for(const film of points)for(const tone of Array.from(new Set(film.tones||[])))if(tone!=="unsure")m.set(tone,(m.get(tone)||0)+1);
 return Array.from(m.entries()).sort((a,b)=>b[1]-a[1]);
}
function reactionCounts(points:FilmPoint[]){
 const m=new Map<string,{count:number;films:string[]}>();
 for(const film of points){
  const selected=new Set<string>((film.aspectReactions||[]).flatMap(a=>a.reactions||[]).filter(r=>r!=="unsure"&&r!=="didnt_resonate"));
  for(const r of Array.from(selected)){
   const item=m.get(r)||{count:0,films:[]};item.count++;item.films.push(film.title);m.set(r,item);
  }
 }
 return Array.from(m.entries()).sort((a,b)=>b[1].count-a[1].count);
}
function goToFilm(onFilm:(id:string)=>void,film:FilmPoint){return <button key={film.filmId} type="button" onClick={()=>onFilm(film.filmId)}>{film.title} ↗</button>;}
export default function ConstellationProfile({people,onReturn,onClose,onFilm}:Props){
 const primary=people[0],profile=primary?.profile;
 if(!profile)return <section className="cosmos-story-empty"><h2>Your MPP is taking shape</h2><p>Complete a film to reveal more of your profile.</p><button onClick={onReturn}>↑ Back to the Constellation</button></section>;
 const ranked=rankedAxes(profile),lead=ranked[0],runner=ranked[1],tones=toneCounts(profile.points),reactions=reactionCounts(profile.points);
 const leadExamples=lead?mostConnected(profile,lead):[];
 const outliers=profile.centroid?profile.points.map(film=>({film,distance:dist(film.point,profile.centroid!)})).sort((a,b)=>b.distance-a.distance).slice(0,3):[];
 const lovedDifficult=profile.points.filter(f=>f.rating>=4&&f.tones.some(x=>["sad","tense","unsettled","angry","difficult","mixed","bittersweet"].includes(x))).slice(0,3);
 const highlyRated=profile.points.filter(f=>f.rating>=4).sort((a,b)=>b.rating-a.rating).slice(0,4);
 const friends=people.slice(1),filmTitles=new Map(FILMS.map(f=>[f.id,f.title]));
 const completeness=profile.total?profile.completed/profile.total:0;
 const completeness=profile.total?profile.completed/profile.total:0;
 return <div className="cosmos-story-shell">
  <header className="cosmos-story-header">
   <div className="cosmos-story-brand">✧ THE HUYNH TEST <span>/ YOUR MOVIE PERSONALITY PROFILE</span></div>
   <div className="cosmos-story-nav"><button type="button" onClick={onReturn}>↑ Constellation</button>{onClose?<button type="button" onClick={onClose} aria-label="Exit immersive experience">✕</button>:null}</div>
  </header>
  <main className="cosmos-story-main">
   <section className="cosmos-story-hero" aria-labelledby="cosmos-mpp-name">
    <div className="cosmos-story-kicker">YOUR MOVIE PERSONALITY PROFILE · {profile.stage==="expanded"?"EXPANDED":"CORE"} TEST</div>
    <h1 id="cosmos-mpp-name">{profile.headline}</h1>
    <p className="cosmos-story-lede">{profile.narrative}</p>
    <div className="cosmos-story-facts"><span>{profile.completed} films assessed</span><span>{profile.skipped} skipped</span><span>{profile.total} films in this stage</span><span>Exploratory pilot</span></div>
    <div className="cosmos-portrait-intro">
     <p>Think of this profile as a portrait of your relationship with stories. It is less concerned with which movies you like than with <em>what you notice, what moves you, and what stays with you</em>. Each interpretation below comes from patterns in your movie responses, not assumptions about how you behave outside the theater.</p>
     {lead?<p>{frame[lead].identity} is the strongest theme in your current profile. {runner&&runner!==lead?"Alongside it, "+t(AXIS_LABELS[runner])+" offers a second perspective on your responses. ":""}The two orientations can work together: a movie may challenge you intellectually, affect you emotionally, and impress you artistically at the same time.</p>:<p>There isn't enough orientation evidence to name a leading theme yet. Your answers remain part of the profile as you add more films.</p>}
    </div>
   </section>
   <section className="cosmos-story-section cosmos-story-personality" aria-labelledby="cosmos-story-main-heading">
    <div className="cosmos-story-section-head"><span>01 / YOUR CINEMATIC ORIENTATION</span><h2 id="cosmos-story-main-heading">The pattern behind your profile name.</h2></div>
    {lead?<div className="cosmos-story-longform">
      <div className="cosmos-story-chapter-tag">YOUR LEADING ORIENTATION · {AXIS_LABELS[lead]}</div>
      <p className="cosmos-story-chapter-lede">{frame[lead].paragraph}</p>
      <p>{leadExamples.length?"In films such as "+leadExamples.map(f=>f.title).join(", ")+", this orientation has relatively strong evidence in your recorded reactions. That doesn't mean the films convey only these ideas. It means that this part of their experience is well represented in your current data.":"As you complete more films, individual responses will clarify which experiences contribute most strongly to this orientation."}</p>
      <p>{frame[lead].counterpoint}</p>
      {runner&&runner!==lead?<div className="cosmos-story-secondary-insight"><strong>THE SECOND THREAD: {AXIS_LABELS[runner]}</strong><p>{frame[runner].meaning} This second orientation gives your profile dimension: rather than explaining every movie reaction through one label, the MPP considers several kinds of engagement at once.</p></div>:null}
      <div className="cosmos-story-reflection"><span>A QUESTION TO EXPLORE</span><p>{frame[lead].questions}</p></div>
     </div>:<div className="cosmos-story-longform"><p>Once you have enough distinct film responses, this section will interpret the strongest and second-strongest orientations together. Unanswered or skipped films will never be treated as negative responses.</p></div>}
   </section>
   <section className="cosmos-story-section" aria-label="The four core orientations">
    <div className="cosmos-story-section-head"><span>02 / YOUR FOUR ORIENTATIONS</span><h2>Four ways you enter a story.</h2><p>These are not four competing personality types. Everyone can respond through all four orientations. The chart shows the relative strength of evidence within your completed films, not whether one kind of person is better than another.</p></div>
    <div className="cosmos-story-axes">
     {AXES.map((axis,i)=>{
      const value=profile.orientationScores[axis],examples=mostConnected(profile,axis);
      return <article className="cosmos-story-axis" key={axis}>
       <div className="cosmos-story-axis-header"><span className="cosmos-story-axis-index">0{i+1}</span><h3>{AXIS_LABELS[axis]}</h3><strong>{value===null?"—":value+" / 100"}</strong></div>
       <div className="cosmos-story-axis-bar"><span style={{width:(value||0)+"%",background:primary.color}}/></div>
       <p>{frame[axis].meaning}</p>
       <p className="cosmos-story-axis-nuance">{frame[axis].counterpoint}</p>
       {examples.length?<div className="cosmos-story-film-evidence"><span>FILMS CONTRIBUTING EVIDENCE</span><div>{examples.map(f=>goToFilm(onFilm,f))}</div></div>:<p className="cosmos-story-muted">No supported evidence for this orientation yet.</p>}
      </article>;
     })}
    </div>
   </section>
   <section className="cosmos-story-section cosmos-story-split">
    <div className="cosmos-story-section-head"><span>03 / YOUR EMOTIONAL SIGNATURE</span><h2>What lingered after the credits.</h2>
     <p>There is a difference between liking a movie and liking the feelings it evokes. A story can be haunting, infuriating, or heartbreaking while still being something you deeply admire.</p>
     {lovedDifficult.length?<p>That distinction appears in your answers to {lovedDifficult.map(f=>f.title).join(", ")}. You rated {lovedDifficult.length===1?"this movie":"these movies"} positively while also selecting a difficult or conflicted emotion. The profile preserves both responses rather than averaging them into a single positive or negative judgment.</p>:<p>Your overall film ratings and emotional-tone choices are kept separate. As you assess more movies, we can look for cases where admiration and discomfort coexist.</p>}
    </div>
    <div className="cosmos-story-emotions">
     {tones.length?tones.slice(0,8).map(([id,n])=><div className="cosmos-story-emotion" key={id}><strong>{toneName(id)}</strong><span>{n} {n===1?"film":"films"}</span></div>):<p>There are not enough recorded emotional tones to identify a recurring pattern yet.</p>}
    </div>
   </section>
   <section className="cosmos-story-section cosmos-story-reactions">
    <div className="cosmos-story-section-head"><span>04 / THE DETAILS THAT MATTERED</span><h2>How stories leave their mark.</h2><p>Your selected film-specific details indicate which subjects or storytelling decisions mattered to you. The reactions you chose describe what those aspects did for you: made you think, unsettled you, moved you, or left you conflicted. None of these reactions is treated as approval of a character's conduct.</p></div>
    {reactions.length?<div className="cosmos-story-reaction-grid">
     {reactions.slice(0,4).map(([id,item])=>{
      const label=ASPECT_REACTIONS.find(r=>r.id===id)?.label||id;
      return <article key={id}><span>RECORDED IN {item.count} {item.count===1?"FILM":"FILMS"}</span><h3>{label}</h3><p>{item.count>=2?"This reaction appears across more than one film, which makes it a recurring observation rather than a single-movie impression.":"This reaction was present in one assessed film. It may become a larger pattern as you complete more titles."}</p><div>{item.films.slice(0,3).map(name=><span key={name}>{name}</span>)}</div></article>;
     })}
    </div>:<div className="cosmos-story-longform"><p>You have not yet recorded enough new film-specific reactions to identify a recurring pattern. Earlier slider responses remain preserved as historical answers, without being reinterpreted as reactions you never selected.</p></div>}
   </section>
   <section className="cosmos-story-section">
    <div className="cosmos-story-section-head"><span>05 / DISTINCTIVE FILM RESPONSES</span><h2>The films that sit apart.</h2><p>Not every movie lands in the same part of your constellation. These films are relatively far from the center of your own film-response points. Their distance reflects the way modeled responses combine, not whether you liked them more or less.</p></div>
    <div className="cosmos-story-films">
     {outliers.length?outliers.map(({film},i)=><button type="button" className="cosmos-story-film" key={film.filmId} onClick={()=>onFilm(film.filmId)}><span>0{i+1}</span><strong>{film.title}</strong><small>{film.tones.length?film.tones.map(toneName).join(" · "):"No emotional tones selected"}</small><i>Explore in constellation ↗</i></button>):<p>No film-response points are available yet.</p>}
    </div>
    {highlyRated.length?<div className="cosmos-story-longform cosmos-story-film-pattern"><h3>Movies you particularly appreciated</h3><p>{highlyRated.map(f=>f.title).join(", ")} {highlyRated.length===1?"is":"are"} among your positively rated films. Appreciation is only one part of your profile, so a highly rated film will not automatically define your leading orientation.</p></div>:null}
   </section>
   <section className="cosmos-story-section cosmos-story-method">
    <div className="cosmos-story-section-head"><span>06 / READING YOUR PROFILE</span><h2>The seven lenses behind the interpretation.</h2><p>The MPP currently reports four orientation scores, while seven separate analytic lenses inform how we interpret your film responses. These lenses are conceptual perspectives, not seven independently validated personality scores.</p></div>
    <div className="cosmos-story-lenses">
     {[
      ["Personal resonance","Where a film intersects with experiences or ideas meaningful to you."],
      ["Existential meaning","How identity, purpose, time, and questions about being human feature in your reactions."],
      ["Emotional valence","Which feelings the film evoked, kept separate from whether you liked it."],
      ["Originality sensitivity","How unusual ideas, forms, and creative choices contribute to your appreciation."],
      ["Narrative coherence","How the storytelling and its resolution worked for you, including responses to the standardized questions."],
      ["Emotional identification","How your responses reflect connection to characters and their situations."],
      ["Temporal reflection","How memory, change, time, and future consequences appear in your engagement."]
     ].map(([title,description],i)=><div key={title} className="cosmos-story-lens"><span>{String(i+1).padStart(2,"0")}</span><div><h3>{title}</h3><p>{description}</p></div></div>)}
    </div>
   </section>
   {friends.length?<section className="cosmos-story-section">
    <div className="cosmos-story-section-head"><span>07 / SHARED PERSPECTIVES</span><h2>Where your worlds meet.</h2><p>Compare how friends responded to films you both assessed. Close points reflect similarity within this provisional model, not interpersonal compatibility or moral alignment.</p></div>
    <div className="cosmos-story-friends">{friends.map(friend=>{
     const mine=new Map(profile.points.map(p=>[p.filmId,p]));
     const common=friend.profile.points.flatMap(f=>{const other=mine.get(f.filmId);return other?[{title:filmTitles.get(f.filmId)||f.title,d:dist(other.point,f.point)}]:[];}).sort((a,b)=>a.d-b.d);
     return <article key={friend.id}><h3>{friend.name}</h3><p>{common.length?common.length+" films in common. Closest response positions: "+common.slice(0,2).map(f=>f.title).join(", ")+". Most different: "+common.slice(-2).reverse().map(f=>f.title).join(", ")+".":"No completed films in common yet."}</p></article>;
    })}</div>
   </section>:null}
   <section className="cosmos-story-closing">
    <div className="cosmos-story-kicker">YOUR STORY IS STILL UNFOLDING</div>
    <h2>The constellation is not the conclusion.</h2>
    <p>{profile.incomplete?"Your profile is based on the films you completed, and some films are still missing from this stage. Skips and unanswered questions are missing evidence, not neutral or negative responses. ":"You have addressed the films in this stage. "}The more varied your future responses, the more opportunities the model has to distinguish a recurring pattern from the effect of one particular film.</p>
    <p>{completeness>=.8?"Treat the profile name as a useful shorthand for the strongest pattern we observed, not a permanent label.":"With limited coverage, especially, treat this as an early sketch rather than a stable portrait."} You may respond differently to these same films at another point in your life, and that possibility is part of what makes the test interesting.</p>
    <button type="button" onClick={onReturn}>↑ Return to the Emotional Constellation</button>
    <small>Huynh Test Version {profile.version}. Exploratory film-conditioned analysis, not a validated psychometric or mental-health assessment.</small>
   </section>
  </main>
 </div>;
}
