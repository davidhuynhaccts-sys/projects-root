export type Control='left'|'right'|'up'|'down'|'jump'|'flash'|'action'|'special';
export type Status='loading'|'ready'|'playing'|'paused'|'learning'|'won'|'lost'|'error';
export type Move='cartwheel'|'roll'|'bridge';
export type Food='egg'|'milk'|'cheese';
export type GameSnapshot={health:number;cookies:number;charge:number;detector:number;bossHealth:number;bossMax:number;status:Status;hint:string;progress:number;zone:string;lesson:number;lessonFeedback:string;learned:number;audioBlocked:boolean;superActive:boolean};
export type GameEvent={type:'cookie'|'jump'|'hit'|'acro'|'special'|'superHit'|'hurt'|'throw'|'warning'|'learn'|'win'|'defeat';x:number;y:number;text?:string;id?:number;food?:Food};
export type Monster={id:number;x:number;y:number;z:number;home:number;lane:number;hp:number;max:number;boss:boolean;kind:string;hitAt:number;attackAt:number;stunnedUntil:number;knockX:number;knockY:number;warning:Food|null;throwAt:number;phase:number};
export type Projectile={id:number;food:Food;x:number;y:number;vx:number;vy:number;age:number};
export const WORLD=4400,BOSS_X=3990,MACHINE_X=4220,SPEED=185;
export const ZONES=['The cookie shop','The flour pantry','The prep kitchen','The cookie machine'];
export const LESSONS=[
 {title:'Why are the cookies breaking?',text:'The machine sends the cookies back and forth, again and again. What would help?',choices:['Send them on more trips','Move them only when needed'],correct:1,success:'Exactly! Extra trips can break cookies and waste time. Move them only when needed.'},
 {title:'Choose the cookie route',text:'Jaylean needs to get a tray from the kitchen to the display. Which route is better?',choices:['Kitchen → Display','Kitchen → Pantry → Kitchen → Display'],correct:0,success:'Yes! A short, careful route keeps more cookies safe. Less moving, more cookies!'}
];
export const emptyControls=():Record<Control,boolean>=>({left:false,right:false,up:false,down:false,jump:false,flash:false,action:false,special:false});
export class BakeryModel{
 state:GameSnapshot; x=120;y:number;z=0;vz=0;facing=1;time=0;floor:number;top:number;moving=false;
 enemies:Monster[]=[];shots:Projectile[]=[];cookies:{id:number;x:number;y:number;taken:boolean}[]=[];
 crates:{x:number;y:number}[]=[];events:GameEvent[]=[];bossActive=false;bossDefeated=false;
 acro:Move|null=null;acroStart=0;acroUntil=0;superStart=0;superUntil=0;superPulse=0;invulnerable=0;
 private lastFlash=-1000;private lastAction=-1000;private lastJump=-1000;private nextId=100;private previousMove:Move|null=null;
 private lessonSeen=[false,false];private hintUntil=0;
 constructor(height:number,private random=()=>Math.random()){
  this.floor=height-38;this.top=Math.max(155,height*.61);if(this.top>this.floor-100)this.top=this.floor-100;this.y=this.lane(.7);
  this.state={health:5,cookies:0,charge:0,detector:0,bossHealth:0,bossMax:24,status:'ready',hint:'A little hero. A bakery full of trouble.',progress:0,zone:ZONES[0],lesson:-1,lessonFeedback:'',learned:0,audioBlocked:false,superActive:false};
  [680,1240,1730,2330,2860,3330].forEach((x,i)=>this.enemies.push({id:i,x,y:this.lane(.25+(i%3)*.27),z:0,home:x,lane:.25+(i%3)*.27,hp:4,max:4,boss:false,kind:['yellow','pink','blue'][i%3],hitAt:-1000,attackAt:0,stunnedUntil:0,knockX:0,knockY:0,warning:null,throwAt:0,phase:i}));
  this.enemies.push({id:6,x:BOSS_X,y:this.lane(.55),z:0,home:BOSS_X,lane:.55,hp:24,max:24,boss:true,kind:'boss',hitAt:-1000,attackAt:0,stunnedUntil:0,knockX:0,knockY:0,warning:null,throwAt:0,phase:0});
  for(let i=0;i<36;i++)this.cookies.push({id:i,x:240+i*97,y:this.lane(.5+Math.sin(i*.68)*.36)-25,taken:false});
  this.crates=[{x:970,y:this.lane(.25)},{x:1950,y:this.lane(.77)},{x:3020,y:this.lane(.4)}];
 }
 lane(f:number){return this.top+(this.floor-this.top)*f;}
 start(){if(this.state.status==='ready')this.state.status='playing';}
 pause(){if(this.state.status==='playing')this.state.status='paused';}
 resume(){if(this.state.status==='paused')this.state.status='playing';}
 event(type:GameEvent['type'],x=this.x,y=this.y-this.z-55,extra:Partial<GameEvent>={}){this.events.push({type,x,y,...extra});}
 choose(index:number){if(this.state.status!=='learning'||this.state.lessonFeedback.startsWith('Exactly')||this.state.lessonFeedback.startsWith('Yes!'))return;const lesson=LESSONS[this.state.lesson];if(index===lesson.correct){this.state.lessonFeedback=lesson.success;this.state.learned++;this.state.charge=Math.min(100,this.state.charge+20);this.event('learn');}else this.state.lessonFeedback='Extra trips can damage cookies. Try the route with less moving.';}
 continueLesson(){if(this.state.status!=='learning'||this.state.learned<=this.state.lesson)return;this.state.status='playing';this.state.lesson=-1;this.state.lessonFeedback='';this.invulnerable=this.time+1000;}
 hint(text:string,duration=2100){this.state.hint=text;this.hintUntil=this.time+duration;}
 hit(e:Monster,damage:number,superHit=false){if(e.hp<=0||(!superHit&&this.time-e.hitAt<270))return;e.hitAt=this.time;e.hp=Math.max(0,e.hp-damage);e.knockX=(e.x>=this.x?1:-1)*(e.boss?65:damage>=2?265:150);e.knockY=-20;e.stunnedUntil=this.time+(e.boss?220:damage>=2?650:300);this.state.charge=Math.min(100,this.state.charge+(this.superUntil>this.time?0:e.boss?5:10));this.event('hit',e.x,e.y-e.z-40,{id:e.id});if(e.boss)this.state.bossHealth=e.hp;
  if(e.hp===0){this.state.cookies+=e.boss?10:2;this.event('defeat',e.x,e.y-e.z-45,{id:e.id,text:e.boss?'MONSTER BE GONE!':'+2 COOKIES!'});if(e.boss){this.bossDefeated=true;this.shots=[];this.hint('Go to the red switch and press Action to save the cookies!',100000);}}}
 hurt(){if(this.time<this.invulnerable||this.state.status!=='playing')return;this.invulnerable=this.time+1800;this.state.health=Math.max(0,this.state.health-1);this.event('hurt');if(this.state.health===0)this.state.status='lost';}
 action(){if(this.time-this.lastAction<780||this.time<this.superUntil)return;this.lastAction=this.time;
  if(this.bossDefeated&&Math.abs(this.x-MACHINE_X)<110&&Math.abs(this.y-this.lane(.7))<95){this.state.status='won';this.state.progress=100;this.state.hint='Less moving, more cookies! Jaylean can bake again.';this.event('win');return;}
  const moves:Move[]=['cartwheel','roll','bridge'];const available=moves.filter(m=>m!==this.previousMove);this.acro=available[Math.floor(this.random()*available.length)];this.previousMove=this.acro;this.acroStart=this.time;this.acroUntil=this.time+700;this.invulnerable=Math.max(this.invulnerable,this.time+500);
  this.event('acro',this.x,this.y-this.z-125,{text:{cartwheel:'CARTWHEEL!',roll:'FORWARD ROLL!',bridge:'BACK BRACE!'}[this.acro]});
  for(const e of this.enemies)if(e.hp>0&&(!e.boss||this.bossActive)&&Math.abs(e.x-this.x)<155&&Math.abs(e.y-e.z-(this.y-this.z))<110)this.hit(e,2);
 }
 special(){if(this.time<this.superUntil)return;if(this.state.charge<100){this.hint('Collect cookies and hit monsters to charge ★ Special.');return;}this.state.charge=0;this.superStart=this.time;this.superUntil=this.time+2400;this.superPulse=0;this.state.superActive=true;this.invulnerable=this.superUntil+600;this.event('special',this.x,this.y-this.z-70,{text:'SUPER ELLY!'});}
 step(seconds:number,input:Record<Control,boolean>){if(this.state.status!=='playing')return;const dt=Math.min(.05,Math.max(0,seconds));this.time+=dt*1000;
  const oldX=this.x,oldY=this.y;let dx=Number(input.right)-Number(input.left),dy=Number(input.down)-Number(input.up);const norm=Math.hypot(dx,dy)||1;dx/=norm;dy/=norm;this.moving=!!(dx||dy);if(dx)this.facing=Math.sign(dx);
  const superActive=this.time<this.superUntil;this.x=clamp(this.x+dx*SPEED*dt*(superActive?.4:1),55,WORLD-60);this.y=clamp(this.y+dy*145*dt,this.top,this.floor);
  if(this.time<this.acroUntil&&this.acro!=='bridge')this.x=clamp(this.x+this.facing*80*dt,55,WORLD-60);
  if(input.jump&&this.z===0&&this.time-this.lastJump>350){this.vz=430;this.lastJump=this.time;this.event('jump');}input.jump=false;
  if(this.z>0||this.vz>0){this.vz-=1050*dt;this.z=Math.max(0,this.z+this.vz*dt);if(this.z===0)this.vz=0;}
  for(const crate of this.crates)if(this.z<42&&Math.abs(this.x-crate.x)<62&&Math.abs(this.y-crate.y)<28){this.x=oldX;this.y=oldY;}
  if(input.action){input.action=false;this.action();}if(input.special){input.special=false;this.special();}
  if(input.flash&&this.time-this.lastFlash>=420&&!superActive){this.lastFlash=this.time;const enemy=this.enemies.filter(e=>e.hp>0&&(!e.boss||this.bossActive)&&(e.x-this.x)*this.facing>-15&&Math.abs(e.x-this.x)<265&&Math.abs(e.y-e.z-(this.y-this.z))<75).sort((a,b)=>Math.abs(a.x-this.x)-Math.abs(b.x-this.x))[0];if(enemy)this.hit(enemy,1);}
  for(const c of this.cookies)if(!c.taken&&Math.abs(c.x-this.x)<48&&Math.abs(c.y-(this.y-this.z-43))<58){c.taken=true;this.state.cookies++;this.state.charge=Math.min(100,this.state.charge+5);this.event('cookie',c.x,c.y);}
  if(this.x>3650&&!this.bossActive){this.bossActive=true;this.state.bossHealth=this.enemies[6].hp;this.enemies[6].attackAt=this.time+1000;this.hint('Dodge the ingredients! Match the monster’s height to attack.',4000);}
  if(this.time<this.superUntil){this.state.superActive=true;const age=this.time-this.superStart;const pulse=age<600?0:age<1000?1:age<1400?2:age<1800?3:4;if(pulse>this.superPulse){this.superPulse=pulse;this.event('superHit',this.x,this.y-this.z-55,{text:pulse===4?'COOKIE COMET!':`${pulse} HIT COMBO!`});this.shots=[];for(const e of this.enemies)if(e.hp>0&&(!e.boss||this.bossActive)&&Math.abs(e.x-this.x)<430)this.hit(e,pulse===4?4:2,true);}}else this.state.superActive=false;
  for(const e of this.enemies){if(e.hp<=0)continue;
   if(this.time<e.stunnedUntil){e.x=clamp(e.x+e.knockX*dt,e.home-240,e.home+200);e.y=clamp(e.y+e.knockY*dt,this.top,this.floor);e.knockX*=Math.exp(-5*dt);continue;}
   const targetY=this.lane(clamp(e.lane+Math.sin(this.time/(e.boss?1000:1400)+e.phase)*.28,.08,.93));e.y+=(targetY-e.y)*Math.min(1,dt*2);e.z=Math.max(0,Math.sin(this.time/(e.boss?620:380)+e.phase))*(e.boss?33:e.kind==='blue'?42:13);
   if(e.boss){if(!this.bossActive)continue;e.x+=(e.home+Math.sin(this.time/1200)*90-e.x)*Math.min(1,dt*2);
    if(!e.warning&&this.time>=e.attackAt){e.warning=(['egg','milk','cheese'] as Food[])[Math.floor(this.random()*3)];e.throwAt=this.time+750;this.event('warning',e.x,e.y-e.z-140,{food:e.warning,text:e.warning==='egg'?'EGG ALLERGY!':'DAIRY ALLERGY!'});}
    if(e.warning&&this.time>=e.throwAt){const food=e.warning;const sx=e.x+(this.x<e.x?-65:65),sy=e.y-e.z-60;const tx=this.x,ty=this.y-this.z-45;const distance=Math.max(1,Math.hypot(tx-sx,ty-sy));const speed=food==='egg'?200:food==='milk'?175:185;this.shots.push({id:this.nextId++,food,x:sx,y:sy,vx:(tx-sx)/distance*speed,vy:(ty-sy)/distance*speed,age:0});this.event('throw',sx,sy,{food});e.warning=null;e.attackAt=this.time+1900+this.random()*600;}
   }else{const distance=Math.abs(this.x-e.x);const vx=distance<250&&distance>70?Math.sign(this.x-e.x)*30:Math.cos(this.time/1000+e.phase)*18;e.x=clamp(e.x+vx*dt,e.home-120,e.home+120);}
   if(Math.abs(e.x-this.x)<(e.boss?72:45)&&Math.abs(e.y-e.z-(this.y-this.z))<(e.boss?78:55))this.hurt();
  }
  for(const shot of this.shots){shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;shot.age+=dt;if(Math.abs(shot.x-this.x)<37&&Math.abs(shot.y-(this.y-this.z-45))<42){this.hurt();shot.age=9;}}
  this.shots=this.shots.filter(s=>s.age<6&&s.x>0&&s.x<WORLD&&s.y>30&&s.y<this.floor+70);
  if(this.state.status!=='playing')return;
  for(let i=0;i<2;i++)if(!this.lessonSeen[i]&&this.x>[850,2520][i]){this.lessonSeen[i]=true;this.state.status='learning';this.state.lesson=i;this.state.lessonFeedback='';break;}
  if(this.time>=this.hintUntil&&!this.bossDefeated){this.state.hint=this.x<600?'Move ↑ ↓ ← →. Jump over crates and trouble.':this.x<1100?'Hold 🔦 to attack. Try Action for an acrobatic move!':this.x<2200?'Extra trips can break cookies. Keep their route short.':this.x<3300?'A careful, shorter route saves cookies and time.':this.bossActive?'Dodge the food! Get close for Action, or unleash ★.':'The cookie machine is just ahead…';}
  const nearest=Math.min(800,...this.enemies.filter(e=>e.hp>0).map(e=>Math.hypot(e.x-this.x,e.y-this.y)));this.state.detector=clamp(100-nearest/4,0,100);this.state.progress=Math.min(98,this.x/MACHINE_X*100);this.state.zone=ZONES[Math.min(3,Math.floor(this.x/1100))];
 }
 drainEvents(){return this.events.splice(0);}
}
export function clamp(n:number,min:number,max:number){return Math.min(max,Math.max(min,n));}
