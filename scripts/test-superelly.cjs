const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),Module=require('node:module');
const source=fs.readFileSync('app/superelly/bakery-monsters/model.ts','utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const moduleObject=new Module('bakery-model');moduleObject._compile(compiled,'bakery-model.cjs');
const {BakeryModel,emptyControls,LESSONS,MACHINE_X}=moduleObject.exports;
const tick=(m,seconds,keys={})=>{const control={...emptyControls(),...keys};for(let t=0;t<seconds;t+=1/60)m.step(1/60,control);};
const fresh=(random=()=>.5)=>{const m=new BakeryModel(600,random);m.start();return m;};
let m=fresh();assert.equal(m.state.health,5);const initialY=m.y;tick(m,.4,{up:true});assert(m.y<initialY);tick(m,3,{down:true});assert.equal(m.y,m.floor);tick(m,3,{up:true});assert.equal(m.y,m.top);tick(m,.05,{jump:true});assert(m.z>0);tick(m,1);assert.equal(m.z,0);m.pause();const time=m.time;tick(m,2,{right:true});assert.equal(m.time,time);m.resume();tick(m,.1,{right:true});assert(m.x>120);
console.log('PASS five hearts, four-direction bounds, separate jump, pause/resume');
let moveIndex=0;m=fresh(()=>[0,0,.99][moveIndex++%3]);const first=m.cookies[0];m.x=first.x;m.y=first.y+43;tick(m,.02);assert(m.state.cookies>=1);assert(m.state.charge>=5);
const enemy=m.enemies[0];m.x=enemy.x-90;m.y=enemy.y;const x=enemy.x;m.action();assert.equal(enemy.hp,2);tick(m,.15);assert(enemy.x>x);assert(enemy.stunnedUntil>m.time);const moves=new Set([m.acro]);for(let i=0;i<8;i++){tick(m,.9);m.action();moves.add(m.acro);}assert.equal(moves.size,3);
console.log('PASS cookies charge special, acrobatic damage, knockback and randomized moves');
m=fresh();for(const x of [860,2525]){m.x=x;tick(m,.02);assert.equal(m.state.status,'playing');}for(const h of [320,450,600,850]){const floorModel=new BakeryModel(h);assert(floorModel.top>=h*.84);for(const e of floorModel.enemies)assert(e.y>=floorModel.top&&e.y<=floorModel.floor);}
console.log('PASS uninterrupted play and floor boundaries at four screen heights');
m=fresh();m.invulnerable=1e9;m.state.health=2;for(const crate of m.crates.slice(0,3)){m.x=crate.x-80;m.y=crate.y;m.action();assert.equal(crate.hp,0);m.x=crate.x;tick(m,.9);}assert.equal(m.state.health,5);assert.deepEqual(m.pickups.map(p=>p.kind),['donut','hashbrown','waffle']);assert(m.pickups.every(p=>p.taken));
const last=m.crates[3];m.breakCrate(last,2);m.x=last.x;m.y=last.y;tick(m,.1);assert(!m.pickups[3].taken);m.state.health=4;tick(m,.1);assert.equal(m.state.health,5);assert(m.pickups[3].taken);
console.log('PASS crate attacks, all snack drops, healing cap and full-health pickup preservation');
let counter=123;m=fresh(()=>((counter=(counter*1664525+1013904223)>>>0)/4294967296));m.x=3700;
m.invulnerable=1e9;const seen=new Set(),warnings=new Map();let throws=0,verticalMin=1e9,verticalMax=-1e9;
for(let frame=0;frame<60*20;frame++){m.step(1/60,emptyControls());verticalMin=Math.min(verticalMin,m.enemies[6].y);verticalMax=Math.max(verticalMax,m.enemies[6].y);for(const event of m.drainEvents()){if(event.type==='warning')warnings.set(event.id,m.time);if(event.type==='throw'){seen.add(event.food);throws++;assert(m.time-warnings.get(event.id)>=749);}}}
assert.equal(seen.size,4);assert(throws>=4);assert(verticalMax-verticalMin>25);
const boss=m.enemies[6];m.x=boss.x-200;m.state.charge=100;const hp=boss.hp;m.special();tick(m,4.1);assert(Math.abs(hp-boss.hp-16)<.01);assert.equal(m.state.comboHits,m.superTotal);assert.equal(m.state.charge,0);assert(!m.state.superActive);
console.log('PASS vertically moving boss, all four projectiles, warnings and randomized Hyper Front Walkover');
m=fresh();m.hurt();assert.equal(m.state.health,4);m.hurt();assert.equal(m.state.health,4);for(let i=0;i<4;i++){tick(m,1.9);m.hurt();}assert.equal(m.state.status,'lost');assert.equal(fresh().state.health,5);
console.log('PASS damage grace period, loss and reset');
// An actual input-driven run: fight each monster from range, align vertically,
// jump obstructions, answer clues, charge and use the combo, then stop the machine.
m=fresh(()=>.3);let frames=0,actionAt=0,usedSpecial=false,events=new Set();
while(m.state.status!=='won'&&m.state.status!=='lost'&&frames<60*120){
 const input=emptyControls();const target=m.enemies.find(e=>e.hp>0&&e.x>m.x-120);
 let destX=MACHINE_X,destY=m.lane(.7);
 if(target){destX=target.x-180;destY=target.y-target.z;input.flash=true;if(target.boss&&!m.bossActive)destX=3700;if(m.state.charge>=100&&target.boss&&m.bossActive){input.special=true;usedSpecial=true;}}
 if(Math.abs(destX-m.x)>12){input.right=destX>m.x;input.left=destX<m.x;}if(Math.abs(destY-m.y)>8){input.down=destY>m.y;input.up=destY<m.y;}
 if(m.crates.some(c=>Math.abs(c.x-m.x)<95&&Math.abs(c.y-m.y)<42))input.jump=true;
 if(m.bossDefeated&&Math.abs(m.x-MACHINE_X)<100&&m.time-actionAt>800){input.action=true;actionAt=m.time;}
 m.step(1/60,input);for(const event of m.drainEvents())events.add(event.type);frames++;
}
assert.equal(m.state.status,'won',JSON.stringify({x:m.x,y:m.y,health:m.state.health,boss:m.enemies[6].hp,time:m.time,enemies:m.enemies.map(e=>e.hp)}));assert(usedSpecial);assert(m.state.cookies>0);assert(m.bossDefeated);assert(events.has('throw'));console.log(`PASS full Level 1 completion in ${(frames/60).toFixed(1)} active seconds, ${m.state.health} hearts, ${m.state.cookies} cookies, animated repair ending after boss defeat`);

m=fresh();m.x=550;m.state.charge=100;m.special();tick(m,4.1);assert.equal(m.state.comboHits,m.superTotal);assert.equal(m.enemies[0].hp,0);assert(!m.state.superActive);assert(m.enemies.every(e=>e.y>=m.top&&e.y<=m.floor));console.log('PASS small monster receives full randomized hit sequence before defeat');

for(const [random,total] of [[0,35],[.5,45],[.999,55]]){m=fresh(()=>random);m.x=550;m.state.charge=100;m.special();let actual=0;for(let i=0;i<250;i++){m.step(1/60,emptyControls());actual+=m.drainEvents().filter(e=>e.type==='superHit').length;}assert.equal(m.superTotal,total);assert.equal(actual,total);assert.equal(m.state.comboHits,total);assert.equal(m.enemies[0].hp,0);}
console.log('PASS random endpoints 35 and 55 and midpoint 45 match actual delivered hits');
m=fresh();m.x=480;m.y=m.enemies[0].y;m.invulnerable=1e9;const originalHp=m.enemies[0].hp;tick(m,.02,{flash:true});assert.equal(m.enemies[0].hp,originalHp);assert.equal(m.cookieShots.length,1);tick(m,.6);assert(m.enemies[0].hp<originalHp);
console.log('PASS cookies travel before damaging monsters');
for(const [random,food,warning] of [[0,'egg','EGG ALLERGY!'],[.3,'milk','DAIRY ALLERGY!'],[.6,'cheese','DAIRY ALLERGY!'],[.99,'peanut','NUT ALLERGY!']]){m=fresh(()=>random);m.x=420;m.invulnerable=1e9;tick(m,.85);const events=m.drainEvents();assert(events.some(e=>e.type==='warning'&&e.food===food&&e.text===warning));assert(events.some(e=>e.type==='throw'&&e.food===food));}
console.log('PASS regular monsters throw all four allergens with matching warnings');

for(const height of [320,600,850]){
 const storage=new BakeryModel(height,()=>.3,2);assert.equal(storage.state.bossMax,32);assert.equal(storage.enemies.length,9);assert.equal(storage.crates.length,9);assert.equal(storage.boss.id,8);assert.equal(storage.boss.kind,'pink');
 assert(storage.enemies.every(e=>e.y>=storage.top&&e.y<=storage.floor));assert.equal(storage.state.zone,'The delivery doorway');
}
for(const roll of [0,.5,.999]){const storage=new BakeryModel(600,()=>roll,2);storage.start();storage.x=3700;tick(storage,.02);storage.x=storage.boss.x-100;storage.state.charge=100;storage.special();tick(storage,4.1);assert.equal(storage.state.comboHits,35+Math.floor(roll*21));assert(Math.abs(storage.boss.hp-16)<.01);}
console.log('PASS Level 2 configuration, floor boundaries and special damage');
for(const seed of [7,43,109]){
 let rng=seed;const storage=new BakeryModel(600,()=>((rng=(rng*1664525+1013904223)>>>0)/4294967296),2);storage.start();let frame=0,specials=0;const visited=new Set();
 while(storage.state.status==='playing'&&frame<60*150){
  const input=emptyControls(),target=storage.enemies.find(e=>e.hp>0&&e.x>storage.x-150);let destX=MACHINE_X,destY=storage.lane(.7);
  if(target){destX=target.x-(target.boss?105:180);destY=target.y-target.z;input.flash=true;if(target.boss&&storage.bossActive)input.action=true;if(target.boss&&!storage.bossActive)destX=3700;if(storage.state.charge>=100&&target.boss&&storage.bossActive&&!storage.state.superActive){input.special=true;specials++;}}
  if(Math.abs(destX-storage.x)>12){input.right=destX>storage.x;input.left=destX<storage.x;}if(Math.abs(destY-storage.y)>8){input.down=destY>storage.y;input.up=destY<storage.y;}
  if(storage.crates.some(c=>c.hp>0&&Math.abs(c.x-storage.x)<140&&Math.abs(c.y-storage.y)<60))input.action=true;
  if(storage.bossActive&&storage.shots.some(s=>Math.abs(s.x-storage.x)<75&&Math.abs(s.y-(storage.y-storage.z-45))<75))input.jump=true;
  storage.step(1/60,input);visited.add(storage.state.zone);storage.drainEvents();frame++;
 }
 assert.equal(storage.state.status,'won',JSON.stringify({seed,x:storage.x,hp:storage.state.health,boss:storage.boss.hp,enemies:storage.enemies.map(e=>e.hp)}));assert.equal(visited.size,4);assert(specials>0);assert(storage.crates.some(c=>c.hp===0));assert.equal(storage.shots.length,0);
 console.log(`PASS Level 2 input-driven run seed ${seed}: ${(frame/60).toFixed(1)} seconds, ${storage.state.health} hearts, all four rooms, victory`);
}
const replay=new BakeryModel(600,()=>.5,2);assert.equal(replay.state.status,'ready');assert.equal(replay.state.health,5);assert.equal(replay.boss.hp,32);assert(replay.crates.every(c=>c.hp===2));assert.equal(new BakeryModel(600).boss.hp,24);
console.log('PASS Level 2 replay resets and Level 1 remains unchanged');
