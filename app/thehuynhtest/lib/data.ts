export type Axis = "existential" | "moral" | "emotional" | "artistic";
export type FilmAspect = { id: string; label: string; axis: Axis };
export type Film = { id: string; title: string; year: number; color: string; category: string; weights: [number, number, number, number]; aspects: FilmAspect[] };
const raw: Array<[string,string,number,string,string,[number,number,number,number],string[]]> = [
 ["truman","The Truman Show",1998,"#7a9da3","Freedom and reality",[1,.45,.7,.8],["authenticity|Living authentically|existential","freedom|Freedom and personal agency|existential","relationships|Trust and relationships|emotional","ethics|The ethics of surveillance|moral","craft|The concept and filmmaking|artistic"]],
 ["sunshine","Little Miss Sunshine",2006,"#d4a04c","Family and expectations",[.4,.6,1,.65],["family|The family's relationships|emotional","success|Ideas about success and failure|existential","social|Social expectations and judgment|moral","humor|Humor and tonal contrasts|artistic","characters|The individual characters|emotional"]],
 ["matrix","The Matrix",1999,"#477b6c","Perception and choice",[1,.7,.35,1],["reality|The nature of reality|existential","agency|Choice and free will|existential","action|Action and visual innovation|artistic","control|Authority and social control|moral","story|The plot and world-building|artistic"]],
 ["greenbook","Green Book",2018,"#b4a078","Friendship and prejudice",[.3,1,.9,.45],["friendship|The central friendship|emotional","racism|The depiction of racism|moral","history|Historical and social context|moral","performance|Acting and character performances|artistic","tone|The uplifting storytelling approach|artistic"]],
 ["spirited","Spirited Away",2001,"#8ca9a0","Identity and imagination",[.8,.65,.8,1],["identity|Identity and growing up|existential","morality|The complexity of the characters|moral","world|The imaginative world|artistic","art|Animation, music, and visual craft|artistic","bonds|Friendship and compassion|emotional"]],
 ["whiplash","Whiplash",2014,"#b58d69","Ambition and sacrifice",[.7,.85,.75,1],["ambition|Ambition and the cost of greatness|existential","mentor|The teacher-student relationship|emotional","ethics|The ethics of extreme pressure|moral","music|Music and performance sequences|artistic","ending|The ending and its implications|artistic"]],
 ["amelie","Amélie",2001,"#b76d64","Connection and wonder",[.55,.4,1,1],["kindness|Small acts of kindness|moral","loneliness|Loneliness and human connection|emotional","imagination|Visual imagination and whimsy|artistic","romance|Love and vulnerability|emotional","story|Narration and storytelling style|artistic"]],
 ["parasite","Parasite",2019,"#748c7c","Class and inequality",[.65,1,.65,1],["class|Class and economic inequality|moral","choices|The characters' moral choices|moral","families|The two families and their relationships|emotional","twists|Plot development and twists|artistic","visuals|Visual symbolism and filmmaking|artistic"]],
 ["eeaao","Everything Everywhere All at Once",2022,"#a27ab5","Meaning and possibility",[1,.6,1,1],["meaning|Meaning in a chaotic universe|existential","family|Family relationships and reconciliation|emotional","possibility|Identity and alternate lives|existential","style|Unconventional editing and creativity|artistic","kindness|Kindness and moral choice|moral"]],
 ["goodwill","Good Will Hunting",1997,"#9a866d","Potential and vulnerability",[.85,.55,1,.65],["potential|Talent and self-worth|existential","therapy|Trust and emotional vulnerability|emotional","friendship|Friendship and loyalty|emotional","class|Class and opportunity|moral","dialogue|Dialogue and performances|artistic"]],
 ["odyssey","2001: A Space Odyssey",1968,"#747da5","Evolution and mystery",[1,.55,.2,1],["evolution|Human evolution and consciousness|existential","mystery|Ambiguity and unexplained meaning|existential","technology|Humanity and technology|moral","imagery|Visual design and cinematic scale|artistic","pacing|Pacing and unconventional structure|artistic"]],
 ["getout","Get Out",2017,"#7a8d9a","Power and perception",[.6,1,.7,.95],["racism|Racism and social power|moral","agency|Identity and bodily autonomy|existential","tension|Suspense and emotional tension|emotional","satire|Social satire and symbolism|artistic","twists|Plot reveals and storytelling|artistic"]],
 ["ladybird","Lady Bird",2017,"#bb8e8f","Identity and belonging",[.7,.55,1,.7],["mother|Mother-daughter relationships|emotional","identity|Growing up and identity|existential","class|Social class and belonging|moral","honesty|Emotional authenticity|emotional","story|Dialogue and slice-of-life storytelling|artistic"]],
 ["joker","Joker",2019,"#7d846e","Alienation and society",[.75,1,.75,.8],["alienation|Loneliness and alienation|emotional","systems|Social neglect and institutions|moral","violence|The portrayal of violence|moral","identity|The main character's identity|existential","style|Performance and visual style|artistic"]],
 ["arrival","Arrival",2016,"#879eac","Time and communication",[1,.6,1,.85],["language|Language and communication|existential","time|Time, fate, and choice|existential","family|Love, family, and loss|emotional","politics|Fear, cooperation, and conflict|moral","atmosphere|Visuals, sound, and atmosphere|artistic"]],
 ["godfather","The Godfather",1972,"#75675d","Power and loyalty",[.75,1,.9,.9],["family|Family and loyalty|emotional","power|Power and corruption|moral","choice|Responsibility and moral choice|moral","character|Michael's transformation|existential","craft|Direction, performances, and pacing|artistic"]],
 ["groundhog","Groundhog Day",1993,"#a8a19b","Change and renewal",[1,.5,.9,.7],["purpose|Purpose and the meaning of life|existential","change|Personal growth and change|existential","love|Love and connection|emotional","ethics|Selfishness and altruism|moral","comedy|Comedy and storytelling concept|artistic"]],
 ["lastjedi","Star Wars: The Last Jedi",2017,"#ae5d58","Legacy and expectation",[.7,.75,.65,1],["legacy|Legacy and changing traditions|existential","heroes|Heroes and moral ambiguity|moral","characters|Character relationships and choices|emotional","risk|Unexpected creative decisions|artistic","story|Plot and established story continuity|artistic"]],
 ["moonlight","Moonlight",2016,"#527ca0","Identity and intimacy",[.9,.75,1,.95],["identity|Identity and self-discovery|existential","vulnerability|Intimacy and vulnerability|emotional","society|Social pressure and expectations|moral","memory|Memory and stages of life|existential","style|Visual storytelling and atmosphere|artistic"]],
 ["shawshank","The Shawshank Redemption",1994,"#87949a","Hope and resilience",[.95,.75,1,.65],["hope|Hope and resilience|existential","friendship|Friendship and loyalty|emotional","justice|Institutional injustice|moral","freedom|Freedom and perseverance|existential","story|Story structure and emotional payoff|artistic"]]
];
export const FILMS: Film[] = raw.map(([id,title,year,color,category,weights,aspects])=>({
 id,title,year,color,category,weights,aspects:aspects.map(a=>{ const [id,label,axis]=a.split("|"); return {id,label,axis:axis as Axis}; })
}));
/** These 20 films and their order are the approved Version 2.0 lineup.
 * Pilot 001 historical stills / excluded titles remain a separate legacy baseline. */
export const CORE_FILMS:Film[] = FILMS.slice(0,10);
export const EXPANDED_FILMS:Film[] = FILMS.slice(10);
export const CORE_FILM_IDS = CORE_FILMS.map(f=>f.id);
export const EXPANDED_FILM_IDS = EXPANDED_FILMS.map(f=>f.id);
export const AXES: Axis[] = ["existential","moral","emotional","artistic"];
export const AXIS_LABELS: Record<Axis,string> = {
 existential:"Existential & Philosophical",moral:"Moral & Social",emotional:"Emotional & Interpersonal",artistic:"Artistic & Narrative"
};
export const QUESTIONS = [
 {id:"impact",question:"How strongly did this movie affect you emotionally?",labels:["Not at all","Very slightly","Slightly","Moderately","Strongly","Very strongly","Extremely"]},
 {id:"connection",question:"How deeply did you connect with the characters?",labels:["Not at all","Very slightly","Slightly","Moderately","Strongly","Very deeply","Extremely deeply"]},
 {id:"story",question:"How satisfying did you find the storytelling?",labels:["Very unsatisfying","Unsatisfying","A little unsatisfying","Neither satisfying nor unsatisfying","A little satisfying","Satisfying","Very satisfying"]},
 {id:"originality",question:"How much did you appreciate the movie's originality and creativity?",labels:["Not at all","Very slightly","Slightly","Moderately","Strongly","Very much","Extremely"]},
 {id:"reflection",question:"How much did this movie make you think about life or your own experiences?",labels:["Not at all","Very slightly","Slightly","Moderately","Strongly","Very much","Extremely"]}
] as const;
/** Film-specific reactions describe engagement, not endorsement or moral character.
 * Preserve raw reaction identifiers and prior slider values separately. */
export const ASPECT_REACTIONS = [
 {id:"made_me_think",label:"Made me think",emoji:"💭",strength:.90},
 {id:"moved_me",label:"Moved me emotionally",emoji:"💗",strength:.95},
 {id:"unsettled_me",label:"Unsettled me",emoji:"😟",strength:.88},
 {id:"impressed_me",label:"Impressed me",emoji:"✨",strength:.80},
 {id:"frustrated_me",label:"Frustrated me",emoji:"😤",strength:.70},
 {id:"left_me_conflicted",label:"Left me conflicted",emoji:"⚖️",strength:.86},
 {id:"didnt_resonate",label:"Didn't resonate",emoji:"➖",strength:.12},
 {id:"unsure",label:"Not sure",emoji:"❔",strength:null}
] as const;
export type AspectReactionId = typeof ASPECT_REACTIONS[number]["id"];
/** Historical seven-position aspect labels, retained solely to display prior answers. */
export const ASPECT_LABELS = ["Very negative","Negative","A little negative","Neither positive nor negative","A little positive","Positive","Very positive"];
export const RATINGS = [{n:1,emoji:"😖",label:"Terrible"},{n:2,emoji:"🙁",label:"Bad"},{n:3,emoji:"😐",label:"OK"},{n:4,emoji:"🙂",label:"Good"},{n:5,emoji:"🤩",label:"Amazing"}];
export const TONES = [
 {id:"joyful",label:"Joyful / amused",emoji:"😊"},
 {id:"hopeful",label:"Hopeful / uplifted",emoji:"🌤️"},
 {id:"warm",label:"Warm / comforted",emoji:"🥰"},
 {id:"sad",label:"Sad / melancholic",emoji:"😢"},
 {id:"tense",label:"Tense / anxious",emoji:"😰"},
 {id:"unsettled",label:"Disturbed / unsettled",emoji:"😨"},
 {id:"angry",label:"Angry / frustrated",emoji:"😠"},
 {id:"awed",label:"Awed / inspired",emoji:"✨"},
 {id:"reflective",label:"Reflective / contemplative",emoji:"🤔"},
 {id:"bittersweet",label:"Bittersweet",emoji:"🥹"},
 {id:"mixed",label:"Mixed / conflicted",emoji:"🌗"},
 {id:"indifferent",label:"Indifferent",emoji:"😐"},
 {id:"unsure",label:"Not sure",emoji:"❔"}
] as const;
export const LEGACY_TONE_LABELS:Record<string,string>={uplifting:"Uplifting (previous response)",difficult:"Difficult (previous response)"};
export const TEST_VERSION="2.0-pilot-3";
