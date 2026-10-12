export type Control='left'|'right'|'up'|'down'|'jump'|'flash'|'action'|'special';
export type Status='loading'|'ready'|'playing'|'paused'|'won'|'lost'|'error';
export type Move='cartwheel'|'roll'|'bridge';
export type Food='egg'|'milk'|'cheese'|'peanut';
export type GameSnapshot={health:number;cookies:number;charge:number;detector:number;bossHealth:number;bossMax:number;status:Status;hint:string;progress:number;zone:string;comboHits:number;comboMove:string;audioBlocked:boolean;superActive:boolean};
export type GameEvent={type:'cookie'|'jump'|'hit'|'acro'|'special'|'superHit'|'hurt'|'throw'|'warning'|'break'|'heal'|'win'|'defeat';x:number;y:number;text?:string;id?:number;food?:Food;hits?:number};
export type Monster={id:number;x:number;y:number;z:number;home:number;lane:number;hp:number;max:number;boss:boolean;kind:string;hitAt:number;attackAt:number;stunnedUntil:number;knockX:number;knockY:number;warning:Food|null;throwAt:number;phase:number};
export type Projectile={id:number;food:Food;x:number;y:number;vx:number;vy:number;age:number};
export const WORLD=4400,BOSS_X=3990,MACHINE_X=4220,SPEED=185;
export const ZONES=['The cookie shop','The flour pantry','The prep kitchen','The cookie machine'];
export type LevelId=1|2|3;
export const LEVELS={
 1:{title:'The cookie caper',boss:'Cookie Machine Monster',zones:ZONES,rooms:['shop','pantry','kitchen','machine'],bossHp:24,intro:'The machine is moving cookies too much and breaking them! Help Elly cross four bakery rooms and defeat the cookie machine monster.'},
 2:{title:'Storage room scramble',boss:'Inventory Monster',zones:['The delivery doorway','The crowded storeroom','The ingredient stacks','The inventory monster'],rooms:['pantry','pantry','kitchen','pantry'],bossHp:32,intro:'The storage room is overflowing! A monster keeps buying more ingredients than Jaylean needs. Clear a path through the stacks and make room for cookies!'},
 3:{title:'Kitchen in a whirl',boss:'Motion Monster',zones:['The scattered kitchen','The busy prep counter','The tool wall','The spinning kitchen'],rooms:['kitchen','kitchen','pantry','kitchen'],bossHp:30,intro:'Jaylean is running all over the kitchen! A monster has scattered the tools and ingredients. Put things close to where they are needed and help Jaylean stop all that extra running!'}
} as const;
export const emptyControls=():Record<Control,boolean>=>({left:false,right:false,up:false,down:false,jump:false,flash:false,action:false,special:false});
export class BakeryModel{
 state:GameSnapshot; x=120;y:number;z=0;vz=0;facing=1;time=0;floor:number;top:number;moving=false;
 cookieShots:{id:number;x:number;y:number;vx:number;age:number}[]=[];enemies:Monster[]=[];shots:Projectile[]=[];cookies:{id:number;x:number;y:number;taken:boolean}[]=[];
 crates:{id:number;x:number;y:number;hp:number}[]=[];pickups:{id:number;x:number;y:number;kind:'donut'|'hashbrown'|'waffle';taken:boolean}[]=[];events:GameEvent[]=[];bossActive=false;bossDefeated=false;
 acro:Move|null=null;acroStart=0;acroUntil=0;superStart=0;superUntil=0;superPulse=0;superTotal=40;superTarget=-1;superAnchor=0;invulnerable=0;
 private lastFlash=-1000;private lastAction=-1000;private lastJump=-1000;private nextId=100;private previousMove:Move|null=null;
 private hintUntil=0;
 constructor(height:number,private random=()=>Math.random(),public level:LevelId=1){
  this.floor=height-12;this.top=height*.84;this.y=this.lane(.7);
  this.state={health:5,cookies:0,charge:0,detector:0,bossHealth:0,bossMax:24,status:'ready',hint:'A little hero. A bakery full of trouble.',progress:0,zone:ZONES[0],comboHits:0,comboMove:'',audioBlocked:false,superActive:false};
  [680,1240,1730,2330,2860,3330].forEach((x,i)=>this.enemies.push({id:i,x,y:this.lane(.25+(i%3)*.27),z:0,home:x,lane:.25+(i%3)*.27,hp:4,max:4,boss:false,kind:['yellow','pink','blue'][i%3],hitAt:-1000,attackAt:0,stunnedUntil:0,knockX:0,knockY:0,warning:null,throwAt:0,phase:i}));
  this.enemies.push({id:6,x:BOSS_X,y:this.lane(.55),z:0,home:BOSS_X,lane:.55,hp:24,max:24,boss:true,kind:'boss',hitAt:-1000,attackAt:0,stunnedUntil:0,knockX:0,knockY:0,warning:null,throwAt:0,phase:0});
  for(let i=0;i<36;i++)this.cookies.push({id:i,x:240+i*97,y:this.lane(.5+Math.sin(i*.68)*.36)-25,taken:false});
  this.crates=[780,1450,2200,3020,3590].map((x,id)=>({id,x,y:this.lane([.3,.7,.45][id%3]),hp:2}));
  if(level===2){
   const positions=[510,890,1390,1810,2240,2640,3090,3450];
   this.enemies=positions.map((x,i)=>({...this.enemies[i%6],id:i,x,home:x,hp:5,max:5,kind:['pink','blue','yellow'][i%3],phase:i}));
   this.enemies.push({id:8,x:BOSS_X,y:this.lane(.55),z:0,home:BOSS_X,lane:.55,hp:32,max:32,boss:true,kind:'pink',hitAt:-1000,attackAt:0,stunnedUntil:0,knockX:0,knockY:0,warning:null,throwAt:0,phase:0});
   this.crates=[650,1040,1210,1590,2020,2460,2840,3220,3650].map((x,id)=>({id,x,y:this.lane([.18,.8,.48][id%3]),hp:2}));
   this.cookies=Array.from({length:44},(_,id)=>({id,x:220+id*82,y:this.lane(.5+Math.sin(id*.55)*.35)-25,taken:false}));
  }
  if(level===3){
   const positions=[520,930,1370,1770,2220,2670,3090,3480];
   this.enemies=positions.map((x,i)=>({...this.enemies[i%6],id:i,x,home:x,hp:5,max:5,kind:['yellow','blue','pink'][i%3],phase:i}));
   this.enemies.push({id:8,x:BOSS_X,y:this.lane(.55),z:0,home:BOSS_X,lane:.55,hp:30,max:30,boss:true,kind:'pink',hitAt:-1000,attackAt:0,stunnedUntil:0,knockX:0,knockY:0,warning:null,throwAt:0,phase:4});
   this.crates=[700,1120,1510,1940,2370,2780,3170,3590].map((x,id)=>({id,x,y:this.lane([.35,.75,.48][id%3]),hp:2}));
   this.cookies=Array.from({length:42},(_,id)=>({id,x:230+id*86,y:this.lane(.5+Math.sin(id*.59)*.32)-25,taken:false}));
  }
  this.state.bossMax=LEVELS[level].bossHp;this.state.zone=LEVELS[level].zones[0];
 }
 get boss(){return this.enemies.find(e=>e.boss)!;}
 lane(f:number){return this.top+(this.floor-this.top)*f;}
 start(){if(this.state.status==='ready')this.state.status='playing';}
 pause(){if(this.state.status==='playing')this.state.status='paused';}
 resume(){if(this.state.status==='paused')this.state.status='playing';}
 event(type:GameEvent['type'],x=this.x,y=this.y-this.z-55,extra:Partial<GameEvent>={}){this.events.push({type,x,y,...extra});}
 finish(){this.state.status='won';this.state.superActive=false;this.state.progress=100;this.state.hint='';this.shots=[];this.cookieShots=[];this.event('win');}
 breakCrate(crate:typeof this.crates[number],damage:number){if(crate.hp<=0)return;crate.hp=Math.max(0,crate.hp-damage);if(crate.hp===0){this.pickups.push({id:crate.id,x:crate.x,y:crate.y,kind:(['donut','hashbrown','waffle'] as const)[crate.id%3],taken:false});this.event('break',crate.x,crate.y-25,{id:crate.id,text:'SNACK TIME!'});}}
 hint(text:string,duration=2100){this.state.hint=text;this.hintUntil=this.time+duration;}
 hit(e:Monster,damage:number,superHit=false){if(e.hp<=0||(!superHit&&this.time-e.hitAt<270))return;e.hitAt=this.time;e.hp=Math.max(0,e.hp-damage);e.knockX=(e.x>=this.x?1:-1)*(e.boss?65:damage>=2?265:150);e.knockY=-20;e.stunnedUntil=this.time+(e.boss?220:damage>=2?650:300);this.state.charge=Math.min(100,this.state.charge+(this.superUntil>this.time?0:e.boss?5:10));this.event('hit',e.x,e.y-e.z-40,{id:e.id});if(e.boss)this.state.bossHealth=e.hp;
  if(e.hp===0){this.state.cookies+=e.boss?10:2;this.event('defeat',e.x,e.y-e.z-45,{id:e.id,text:e.boss?'MONSTER BE GONE!':'+2 COOKIES!'});if(e.boss){this.bossDefeated=true;this.shots=[];if(!this.state.superActive)this.finish();}}}
 hurt(){if(this.time<this.invulnerable||this.state.status!=='playing')return;this.invulnerable=this.time+1800;this.state.health=Math.max(0,this.state.health-1);this.event('hurt');if(this.state.health===0)this.state.status='lost';}
 action(){if(this.time-this.lastAction<780||this.time<this.superUntil)return;this.lastAction=this.time;
  const moves:Move[]=['cartwheel','roll','bridge'];const available=moves.filter(m=>m!==this.previousMove);this.acro=available[Math.floor(this.random()*available.length)];this.previousMove=this.acro;this.acroStart=this.time;this.acroUntil=this.time+700;this.invulnerable=Math.max(this.invulnerable,this.time+500);
  this.event('acro',this.x,this.y-this.z-125,{text:{cartwheel:'CARTWHEEL!',roll:'FORWARD ROLL!',bridge:'BACK BRACE!'}[this.acro]});
  for(const crate of this.crates)if(Math.abs(crate.x-this.x)<155&&Math.abs(crate.y-this.y)<65)this.breakCrate(crate,2);
  for(const e of this.enemies)if(e.hp>0&&(!e.boss||this.bossActive)&&Math.abs(e.x-this.x)<155&&Math.abs(e.y-e.z-(this.y-this.z))<110)this.hit(e,2);
 }
 special(){if(this.time<this.superUntil)return;if(this.state.charge<100){this.hint('Collect cookies and hit monsters to charge ★ Special.');return;}
  const target=this.enemies.filter(e=>e.hp>0&&(!e.boss||this.bossActive)&&Math.abs(e.x-this.x)<520).sort((a,b)=>Math.abs(a.x-this.x)-Math.abs(b.x-this.x))[0];
  if(!target){this.hint('Get closer to a monster to use Hyper Front Walkover!');return;}
  this.state.charge=0;this.superStart=this.time;this.superUntil=this.time+4000;this.superPulse=0;this.superTotal=35+Math.floor(this.random()*21);this.acroUntil=0;this.z=0;this.vz=0;this.superTarget=target.id;this.superAnchor=clamp(this.x+this.facing*100,90,WORLD-100);this.state.comboHits=0;this.state.comboMove='FRONT WALKOVER';this.state.superActive=true;this.invulnerable=this.superUntil+600;this.shots=[];this.cookieShots=[];this.event('special',this.x,this.y-70,{text:'HYPER FRONT WALKOVER!'});
 }
 step(seconds:number,input:Record<Control,boolean>){if(this.state.status!=='playing')return;const dt=Math.min(.05,Math.max(0,seconds));this.time+=dt*1000;
  const oldX=this.x,oldY=this.y;let dx=Number(input.right)-Number(input.left),dy=Number(input.down)-Number(input.up);const norm=Math.hypot(dx,dy)||1;dx/=norm;dy/=norm;this.moving=!!(dx||dy);if(dx)this.facing=Math.sign(dx);
  const superActive=this.time<this.superUntil;this.x=clamp(this.x+dx*SPEED*dt*(superActive?0:1),55,WORLD-60);this.y=clamp(this.y+dy*145*dt*(superActive?0:1),this.top,this.floor);
  if(this.time<this.acroUntil&&this.acro!=='bridge')this.x=clamp(this.x+this.facing*80*dt,55,WORLD-60);
  if(input.jump&&!superActive&&this.z===0&&this.time-this.lastJump>350){this.vz=430;this.lastJump=this.time;this.event('jump');}input.jump=false;
  if(this.z>0||this.vz>0){this.vz-=1050*dt;this.z=Math.max(0,this.z+this.vz*dt);if(this.z===0)this.vz=0;}
  for(const crate of this.crates)if(crate.hp>0&&this.z<42&&Math.abs(this.x-crate.x)<62&&Math.abs(this.y-crate.y)<28){this.x=oldX;this.y=oldY;}
  if(input.action){input.action=false;this.action();}if(input.special){input.special=false;this.special();}
  if(input.flash&&this.time-this.lastFlash>=420&&!this.state.superActive){this.lastFlash=this.time;this.cookieShots.push({id:this.nextId++,x:this.x+this.facing*35,y:this.y-this.z-48,vx:this.facing*440,age:0});this.event('throw',this.x,this.y-this.z-48);}
  for(const shot of this.cookieShots){shot.x+=shot.vx*dt;shot.age+=dt;const enemy=this.enemies.find(e=>e.hp>0&&(!e.boss||this.bossActive)&&Math.abs(e.x-shot.x)<(e.boss?62:38)&&Math.abs(e.y-e.z-45-shot.y)<55);const crate=this.crates.find(c=>c.hp>0&&Math.abs(c.x-shot.x)<48&&Math.abs(c.y-30-shot.y)<40);if(crate){this.breakCrate(crate,1);shot.age=9;}else if(enemy){this.hit(enemy,1);shot.age=9;}}
  this.cookieShots=this.cookieShots.filter(s=>s.age<1.2&&s.x>0&&s.x<WORLD);
  for(const c of this.cookies)if(!c.taken&&Math.abs(c.x-this.x)<48&&Math.abs(c.y-(this.y-this.z-43))<58){c.taken=true;this.state.cookies++;this.state.charge=Math.min(100,this.state.charge+5);this.event('cookie',c.x,c.y);}
  if(this.x>3650&&!this.bossActive){this.bossActive=true;this.state.bossHealth=this.boss.hp;this.boss.attackAt=this.time+1000;this.hint('Dodge the ingredients! Match the monster’s height to attack.',4000);}
  for(const item of this.pickups)if(!item.taken&&this.state.health<5&&Math.abs(item.x-this.x)<50&&Math.abs(item.y-this.y)<45&&this.z<45){item.taken=true;this.state.health=Math.min(5,this.state.health+1);this.event('heal',item.x,item.y-35,{text:'+1 HEART!'});}
  if(this.time<this.superUntil){this.state.superActive=true;const age=this.time-this.superStart,target=this.enemies.find(e=>e.id===this.superTarget)!;
   target.x+=(this.superAnchor-target.x)*Math.min(1,dt*12);target.y+=(this.y-target.y)*Math.min(1,dt*12);target.z=age<600?0:35+Math.sin(age/60)*14;this.shots=[];
   const pulse=clamp(Math.floor((age-750)/(2400/(this.superTotal-1)))+1,0,this.superTotal);
   while(this.superPulse<pulse&&target.hp>0){this.superPulse++;this.state.comboHits=this.superPulse;this.state.comboMove=this.superPulse<this.superTotal?'HELICOPTER KICK':'WALKOVER FINISH!';this.hit(target,this.superPulse<this.superTotal?Math.min(14/(this.superTotal-1),Math.max(0,target.hp-.1)):2,true);this.event('superHit',target.x,target.y-target.z-50,{text:this.state.comboMove,hits:this.superPulse});}
  }else if(this.state.superActive){this.state.superActive=false;this.z=0;this.vz=0;if(this.bossDefeated){this.finish();return;}}
  for(const e of this.enemies){if(e.hp<=0)continue;if(this.state.superActive&&e.id===this.superTarget)continue;
   if(this.time<e.stunnedUntil){e.x=clamp(e.x+e.knockX*dt,e.home-240,e.home+200);e.y=clamp(e.y+e.knockY*dt,this.top,this.floor);e.knockX*=Math.exp(-5*dt);continue;}
   const targetY=this.lane(clamp(e.lane+Math.sin(this.time/(e.boss?1000:1400)+e.phase)*.28,.08,.93));e.y+=(targetY-e.y)*Math.min(1,dt*2);e.z=Math.max(0,Math.sin(this.time/(e.boss?620:380)+e.phase))*(e.boss?33:e.kind==='blue'?42:13);
   if(e.boss){if(!this.bossActive)continue;e.x+=(e.home+Math.sin(this.time/1200)*90-e.x)*Math.min(1,dt*2);}
   else{const distance=Math.abs(this.x-e.x);const vx=distance<250&&distance>70?Math.sign(this.x-e.x)*30:Math.cos(this.time/1000+e.phase)*18;e.x=clamp(e.x+vx*dt,e.home-120,e.home+120);}
   if(Math.abs(e.x-this.x)<(e.boss?700:430)&&!this.state.superActive){
    if(!e.warning&&this.time>=e.attackAt){e.warning=(['egg','milk','cheese','peanut'] as Food[])[Math.floor(this.random()*4)];e.throwAt=this.time+750;this.event('warning',e.x,e.y-e.z-(e.boss?140:85),{id:e.id,food:e.warning,text:e.warning==='egg'?'EGG ALLERGY!':e.warning==='peanut'?'NUT ALLERGY!':'DAIRY ALLERGY!'});}
    if(e.warning&&this.time>=e.throwAt){const food=e.warning,sx=e.x+(this.x<e.x?-45:45),sy=e.y-e.z-50,tx=this.x,ty=this.y-this.z-45;const distance=Math.max(1,Math.hypot(tx-sx,ty-sy)),speed=e.boss?185:145;this.shots.push({id:this.nextId++,food,x:sx,y:sy,vx:(tx-sx)/distance*speed,vy:(ty-sy)/distance*speed,age:0});if(this.level===2&&e.boss){const a=Math.atan2(ty-sy,tx-sx)+.25;this.shots.push({id:this.nextId++,food,x:sx,y:sy,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,age:0});}this.event('throw',sx,sy,{id:e.id,food});e.warning=null;e.attackAt=this.time+(e.boss?(this.level===2?1500:1900):2700)+this.random()*600;}
   }
   if(Math.abs(e.x-this.x)<(e.boss?72:45)&&Math.abs(e.y-e.z-(this.y-this.z))<(e.boss?78:55))this.hurt();
  }
  for(const shot of this.shots){shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;shot.age+=dt;if(Math.abs(shot.x-this.x)<37&&Math.abs(shot.y-(this.y-this.z-45))<42){this.hurt();shot.age=9;}}
  this.shots=this.shots.filter(s=>s.age<6&&s.x>0&&s.x<WORLD&&s.y>30&&s.y<this.floor+70);
  if(this.state.status!=='playing')return;
  if(this.time>=this.hintUntil&&!this.bossDefeated){this.state.hint=this.x<600?'Move along the floor. Break crates with Action!':this.x<1100?'Hold 🍪 to throw cookies. Try Action for an acrobatic move!':this.x<2200?'Break crates for snacks that restore a heart.':this.x<3300?'Donuts, hash browns and waffles restore hearts.':this.bossActive?'Dodge the food! Get close for Action, or unleash ★.':this.level===2?'The inventory monster is just ahead…':this.level===3?'The motion monster is just ahead…':'The cookie machine is just ahead…';}
  const nearest=Math.min(800,...this.enemies.filter(e=>e.hp>0).map(e=>Math.hypot(e.x-this.x,e.y-this.y)));this.state.detector=clamp(100-nearest/4,0,100);this.state.progress=Math.min(98,this.x/MACHINE_X*100);this.state.zone=LEVELS[this.level].zones[Math.min(3,Math.floor(this.x/1100))];
 }
 drainEvents(){return this.events.splice(0);}
}
export function clamp(n:number,min:number,max:number){return Math.min(max,Math.max(min,n));}
