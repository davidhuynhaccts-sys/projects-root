import Phaser from 'phaser';
import {BakeryModel,emptyControls,WORLD,BOSS_X,MACHINE_X,LEVELS,LevelId,Control,GameSnapshot,GameEvent} from './model';
import {BakeryAudio,Effect} from './audio';
export type {Control,GameSnapshot} from './model';

export type GameHandle={input:(key:Control,down:boolean)=>void;start:()=>void;pause:()=>void;resume:()=>void;mute:(v:boolean)=>void;destroy:()=>void};
export const ASSETS=['elly-idle','elly-run','elly-jump','cartwheel','roll','bridge','yellow','pink','blue','boss','cookie','crate','egg','milk','cheese','room-shop','room-pantry','room-kitchen','room-machine'];
export function createGame(parent:HTMLElement,onState:(s:GameSnapshot)=>void,level:LevelId=1):GameHandle{
 const controls=emptyControls();let scene:BakeryScene|undefined;let destroyed=false;
 const audio=new BakeryAudio(()=>{if(scene){scene.model.state.audioBlocked=true;scene.emit();}});
 const clear=()=>Object.keys(controls).forEach(k=>controls[k as Control]=false);
 class BakeryScene extends Phaser.Scene{
  model!:BakeryModel;player!:Phaser.GameObjects.Image;shadow!:Phaser.GameObjects.Ellipse;beam!:Phaser.GameObjects.Graphics;aura!:Phaser.GameObjects.Graphics;
  monsters=new Map<number,Phaser.GameObjects.Image>();bars=new Map<number,Phaser.GameObjects.Graphics>();cookies=new Map<number,Phaser.GameObjects.Image>();shots=new Map<number,Phaser.GameObjects.Image>();crateSprites=new Map<number,Phaser.GameObjects.Image>();snacks=new Map<number,Phaser.GameObjects.Container>();cookieSprites=new Map<number,Phaser.GameObjects.Image>();trails:Phaser.GameObjects.Image[]=[];machine!:Phaser.GameObjects.Container;
  loaded=false;loadFailed=false;lastEmit=0;lastSound=0;superVisual=0;
  constructor(){super('Bakery');scene=this;}
  init(){this.model=new BakeryModel(this.scale.height,Math.random,level);this.monsters=new Map();this.bars=new Map();this.cookies=new Map();this.shots=new Map();this.crateSprites=new Map();this.snacks=new Map();this.trails=[];this.cookieSprites=new Map();this.loaded=false;this.loadFailed=false;this.lastEmit=0;this.lastSound=0;this.superVisual=0;}
  preload(){for(const key of ASSETS)this.load.image(key,`/superelly/assets/${key}.webp`);this.load.once('loaderror',()=>this.loadFailed=true);}
  create(){
   if(this.loadFailed){this.model.state.status='error';this.model.state.hint='An illustration could not load. Please reload.';this.emit();return;}
   const peanut=this.make.graphics({x:0,y:0});peanut.fillStyle(0xd6a269);peanut.lineStyle(2,0x936039);peanut.fillEllipse(17,14,23,25).strokeEllipse(17,14,23,25);peanut.fillEllipse(17,32,23,25).strokeEllipse(17,32,23,25);peanut.lineStyle(1,0xb9814a);for(let i=8;i<40;i+=6)peanut.lineBetween(10,i,24,i+3);peanut.generateTexture('peanut',35,48);peanut.destroy();
   const h=this.scale.height;
   LEVELS[level].rooms.forEach((name,i)=>{this.add.image(i*1100,0,`room-${name}`).setOrigin(0).setDisplaySize(1102,h).setDepth(-20);if(i>0){this.add.rectangle(i*1100,h/2,20,h,0xc79970).setDepth(-10);this.add.rectangle(i*1100+8,h/2,5,h,0xf4d6b0).setDepth(-9);}this.add.text(i*1100+380,Math.max(75,h*.25),LEVELS[level].zones[i],{fontFamily:'Georgia',fontSize:'19px',color:'#754b36',backgroundColor:'#fff4de',padding:{x:15,y:9}}).setOrigin(.5).setDepth(-8);});
   if(level===2){
    for(let room=0;room<4;room++){
     const shelf=this.add.graphics().setDepth(-7);shelf.fillStyle([0xc7b8d5,0xc5d5bd,0xdac6ad,0xbcc7d6][room],.75).fillRoundedRect(room*1100+30,h*.35,1035,h*.47,15);
     for(let row=0;row<3;row++){const y=h*(.45+row*.12);shelf.fillStyle(0xa47d5c).fillRoundedRect(room*1100+45,y+28,1000,9,3);
      for(let j=0;j<11;j++){const x=room*1100+85+j*88;this.add.image(x,y+25,j%3===0?'crate':j%3===1?'milk':'cheese').setDisplaySize(j%3===0?65:36,j%3===0?49:43).setDepth(-6);}
     }
     this.add.text(room*1100+900,h*.38,room===3?'MORE! MORE!':'DELIVERY',{fontFamily:'Georgia',fontSize:'18px',color:'#805b64',backgroundColor:'#fff0d6',padding:{x:8,y:6}}).setOrigin(.5).setDepth(-5);
    }
   }
   for(const c of this.model.crates)this.crateSprites.set(c.id,this.add.image(c.x,c.y,'crate').setOrigin(.5,1).setDisplaySize(95,59).setDepth(c.y));
   for(const c of this.model.cookies)this.cookies.set(c.id,this.add.image(c.x,c.y,'cookie').setDisplaySize(27,27).setDepth(c.y+70));
   for(const e of this.model.enemies){this.monsters.set(e.id,this.add.image(e.x,e.y,e.kind).setOrigin(.5,1).setDisplaySize(e.boss?(level===2?185:155):83,e.boss?(level===2?180:145):80));this.bars.set(e.id,this.add.graphics());}
   this.shadow=this.add.ellipse(this.model.x,this.model.y,65,12,0x77513a,.24).setDepth(this.model.y-1);
   this.player=this.add.image(this.model.x,this.model.y,'elly-idle').setOrigin(.5,1).setDisplaySize(116,129);this.beam=this.add.graphics().setDepth(2000);this.aura=this.add.graphics().setDepth(1999);
   for(let i=0;i<4;i++)this.trails.push(this.add.image(0,0,'elly-jump').setVisible(false));
   this.machine=level===1?this.makeMachine(MACHINE_X,this.model.lane(.7)):this.add.container(MACHINE_X,this.model.lane(.7),[this.add.image(0,-35,'crate').setDisplaySize(110,85),this.add.image(-20,-99,'crate').setDisplaySize(90,70),this.add.text(0,-168,'ORDERS',{fontFamily:'Georgia',fontSize:'18px',color:'#76533f',backgroundColor:'#fff1d4',padding:{x:8,y:7}}).setOrigin(.5)]).setDepth(this.model.lane(.7));
   this.cameras.main.setBounds(0,0,WORLD,h);this.cameras.main.startFollow(this.player,true,.12,0,-60,0);this.cameras.main.setScroll(0,0);
   this.input.keyboard?.on('keydown',(e:KeyboardEvent)=>{const key=keyControl(e.code);if(key){e.preventDefault();if(this.model.state.status==='playing')controls[key]=true;}if(e.code==='Escape'){if(this.model.state.status==='playing')this.pauseGame();else if(this.model.state.status==='paused')this.resumeGame();}});
   this.input.keyboard?.on('keyup',(e:KeyboardEvent)=>{const key=keyControl(e.code);if(key)controls[key]=false;});
   this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{clear();this.input.keyboard?.removeAllListeners();});this.loaded=true;this.renderFrame();this.emit();
  }
  makeMachine(x:number,y:number){const parts:Phaser.GameObjects.GameObject[]=[this.add.rectangle(0,-36,84,70,0xb3c8ba).setStrokeStyle(3,0x81654f),this.add.circle(0,-42,23,0xe58480).setStrokeStyle(3,0x97524b),this.add.text(0,-43,'Ⅱ',{fontFamily:'Arial',fontSize:'28px',color:'#fff7df'}).setOrigin(.5),this.add.text(0,-95,'STOP SWITCH',{fontFamily:'Georgia',fontSize:'12px',color:'#75503b',backgroundColor:'#fff4db',padding:{x:8,y:5}}).setOrigin(.5)];return this.add.container(x,y,parts).setDepth(y);}
  emit(){const m=this.model;if(!m)return;parent.dataset.gameState=JSON.stringify({version:5,level,x:Math.round(m.x),y:Math.round(m.y),jump:Math.round(m.z),health:m.state.health,cookies:m.state.cookies,charge:m.state.charge,status:m.state.status,move:m.acro,superActive:m.state.superActive,bossHealth:m.state.bossHealth,comboHits:m.state.comboHits,comboTotal:m.superTotal,cookieShots:m.cookieShots.length,comboMove:m.state.comboMove,crates:m.crates.map(c=>c.hp),pickups:m.pickups,zone:m.state.zone,enemies:m.enemies.map(e=>({id:e.id,hp:e.hp,x:Math.round(e.x),y:Math.round(e.y-e.z)})),projectiles:m.shots.map(s=>s.food),...audio.diagnostics()});onState({...m.state});}
  begin(){clear();this.model.start();audio.playMusic();this.emit();}
  pauseGame(){if(this.model.state.status!=='playing')return;this.model.pause();clear();this.tweens.pauseAll();audio.pause();this.emit();}
  resumeGame(){if(this.model.state.status!=='paused')return;this.model.resume();clear();this.tweens.resumeAll();audio.playMusic();this.emit();}
  spark(x:number,y:number,color:number,count=8){for(let i=0;i<count;i++){const dot=this.add.star(x,y,4,2,6,color,.9).setDepth(3000);this.tweens.add({targets:dot,x:x+Phaser.Math.Between(-45,45),y:y+Phaser.Math.Between(-60,20),angle:160,alpha:0,scale:0,duration:500,onComplete:()=>dot.destroy()});}}
  comic(text:string,x:number,y:number,color='#fff09b',duration=1000){x=Phaser.Math.Clamp(x,this.cameras.main.scrollX+145,this.cameras.main.scrollX+this.scale.width-145);y=Phaser.Math.Clamp(y,120,this.scale.height-80);const burst=this.add.star(0,0,12,43,65,Phaser.Display.Color.HexStringToColor(color).color,.94).setScale(2.1,.8).setStrokeStyle(2,0xa57556);const label=this.add.text(0,0,text,{fontFamily:'Impact, Arial Black, sans-serif',fontStyle:'bold italic',fontSize:text.length>15?'24px':'30px',color:'#fff9e6',stroke:'#6f4036',strokeThickness:6,align:'center',wordWrap:{width:320}}).setOrigin(.5).setShadow(2,3,'#9a645c',0,true,false);const group=this.add.container(x,y,[burst,label]).setDepth(5000).setAngle(-7).setScale(.3);this.tweens.add({targets:group,scale:1,duration:130,ease:'Back.easeOut'});this.tweens.add({targets:group,y:y-22,alpha:0,delay:duration-250,duration:250,onComplete:()=>group.destroy()});}
  event(e:GameEvent){const sound:Partial<Record<GameEvent['type'],Effect>>={cookie:'cookie',jump:'jump',hit:'hit',acro:'acro',special:'special',hurt:'hurt',throw:'throw',break:'hit',heal:'cookie',win:'win'};if(sound[e.type])audio.effect(sound[e.type]!);
   if(e.type==='cookie'||e.type==='heal')this.spark(e.x,e.y,0xffe798,6);
   if(e.type==='break'){this.crateSprites.get(e.id!)?.setVisible(false);this.spark(e.x,e.y,0xc69163,12);this.comic('CRUNCH!',e.x,e.y-50,'#ffe3a2',550);}
   if(e.type==='heal')this.comic('+1 HEART!',e.x,e.y-60,'#ffd1db',700);
   if(e.type==='hit'){this.spark(e.x,e.y,0xffdc98,9);const sprite=this.monsters.get(e.id!);sprite?.setTint(0xffd7b5);}
   if(e.type==='hurt'){this.spark(e.x,e.y,0xf1a7a0,10);this.comic('OOF!',e.x,e.y-70,'#ffc8bc',650);}
   if(e.type==='acro')this.comic(e.text!,e.x,e.y,'#bde8f0');
   if(e.type==='warning'){this.comic(e.text!,e.x,e.y,e.food==='egg'?'#ffe8ae':'#c8e8f8',1400);this.spark(e.x,e.y+50,0xffefb4,5);}
   if(e.type==='throw')this.spark(e.x,e.y,0xffeac4,5);
   if(e.type==='special'){this.comic(e.text!,e.x,e.y-65,'#f9daff',1400);this.spark(e.x,e.y,0xffef93,18);}
   if(e.type==='superHit'){const hits=e.hits!;if(hits===1||hits===this.model.superTotal)this.comic(e.text!,this.model.x,this.model.y-160,'#fff0a0',750);if(hits%4===0){this.spark(e.x,e.y,0xffeda7,5);audio.effect('hit');}if(hits===this.model.superTotal){const ring=this.add.circle(e.x,e.y,20,0xffecac,.2).setStrokeStyle(6,0xffeb92).setDepth(2500);this.tweens.add({targets:ring,scale:12,alpha:0,duration:550,onComplete:()=>ring.destroy()});}}
   if(e.type==='defeat'){this.comic(e.text!,e.x,e.y-55,'#e0f0c5',850);const sprite=this.monsters.get(e.id!);if(sprite)this.tweens.add({targets:sprite,x:sprite.x+(sprite.x>=this.model.x?90:-90),y:sprite.y+40,angle:120,alpha:0,duration:700,ease:'Cubic.easeOut',onComplete:()=>sprite.destroy()});this.bars.get(e.id!)?.clear();}
   if(e.type==='win'){for(let i=0;i<5;i++)this.spark(this.model.x+Phaser.Math.Between(-140,140),this.model.y-Phaser.Math.Between(30,220),[0xffd797,0xbde4d3,0xd9b6ea][i%3],12);audio.stopMusic();}
  }
  renderFrame(){const m=this.model,now=m.time,acro=now<m.acroUntil?m.acro:null;let texture=acro|| (m.z>0?'elly-jump':m.moving&&Math.floor(now/140)%2?'elly-run':'elly-idle');
   if(m.state.superActive){const age=now-m.superStart;texture=age<650||age>3250?'elly-jump':'cartwheel';}
   this.player.setTexture(texture).setPosition(m.x,m.y-m.z).setFlipX(m.facing<0).setDepth(m.y+1);this.player.setDisplaySize(acro==='roll'?96:acro==='bridge'?140:116,acro==='roll'?96:acro==='bridge'?88:129);this.player.setOrigin(.5,acro==='roll'?.5:1);if(acro==='roll')this.player.y-=45;
   const p=(now-m.acroStart)/700;this.player.angle=acro==='roll'?p*360*m.facing:acro==='cartwheel'?Math.sin(p*Math.PI*2)*24*m.facing:0;
   if(m.state.superActive){const age=now-m.superStart,entry=Math.min(1,age/750),exit=Math.max(0,Math.min(1,(age-3250)/750)),spin=(age-750)/95;
    // Plant hands, hold the inverted split while the legs helicopter, then step through.
    const angle=age<750?-180*entry:age<3250?-180:-180-180*exit;
    this.player.setOrigin(.5,1).setDisplaySize(116,129).setPosition(m.superAnchor-65*m.facing,m.y-(age<750?Math.sin(entry*Math.PI/2)*120:120*(1-exit))).setAngle(angle*m.facing);
    if(age>=750&&age<3250)this.player.setScale(this.player.scaleX*(.3+.7*Math.abs(Math.cos(spin))),this.player.scaleY).setFlipX(Math.sin(spin)<0);
   }
   for(let i=0;i<this.trails.length;i++){const ghost=this.trails[i];ghost.setVisible(m.state.superActive&&now-m.superStart>=750&&now-m.superStart<3250);if(ghost.visible)ghost.setTexture('cartwheel').setOrigin(.5,1).setDisplaySize(116,129).setPosition(m.superAnchor-65*m.facing,m.y-120).setAngle(-180*m.facing+i*9).setAlpha(.08).setTint(0xd8b6fa).setDepth(m.y);}
   this.player.setAlpha(now<m.invulnerable&&!m.state.superActive?(Math.floor(now/100)%2?.55:1):1);if(m.state.superActive)this.player.setTint(0xffefaa);else this.player.clearTint();
   this.shadow.setPosition(m.x,m.y+1).setDepth(m.y-1).setScale(Math.max(.4,1-m.z/230));this.beam.clear();this.aura.clear();
   const liveCookies=new Set(m.cookieShots.map(c=>c.id));for(const [id,sprite] of Array.from(this.cookieSprites.entries()))if(!liveCookies.has(id)){sprite.destroy();this.cookieSprites.delete(id);}for(const c of m.cookieShots){let sprite=this.cookieSprites.get(c.id);if(!sprite){sprite=this.add.image(c.x,c.y,'cookie').setDisplaySize(30,30).setDepth(2200);this.cookieSprites.set(c.id,sprite);}sprite.setPosition(c.x,c.y).setRotation(c.age*12);}
   for(const e of m.enemies){const image=this.monsters.get(e.id)!;if(e.hp<=0||!image.active)continue;image.setPosition(e.x,e.y-e.z).setDepth(e.y).setFlipX(e.x<m.x);image.angle=now<e.stunnedUntil?Math.sin((now-e.hitAt)/200)*55*(e.knockX>=0?1:-1):0;if(now-e.hitAt>170)image.clearTint();const bar=this.bars.get(e.id)!;bar.clear();if(e.hp<e.max){bar.fillStyle(0xfff3da,.9).fillRoundedRect(e.x-26,image.y-image.displayHeight-10,52,6,3);bar.fillStyle(0x8caf78).fillRoundedRect(e.x-25,image.y-image.displayHeight-9,50*e.hp/e.max,4,2);bar.setDepth(e.y+2);}}
   for(const c of m.cookies){const image=this.cookies.get(c.id)!;if(c.taken){image.setVisible(false);continue;}image.y=c.y+Math.sin(now/330+c.id)*4;}
   const active=new Set(m.shots.map(s=>s.id));for(const [id,image] of Array.from(this.shots.entries()))if(!active.has(id)){image.destroy();this.shots.delete(id);}for(const s of m.shots){let image=this.shots.get(s.id);if(!image){image=this.add.image(s.x,s.y,s.food).setDisplaySize(s.food==='milk'?31:35,39).setDepth(2200);this.shots.set(s.id,image);}image.setPosition(s.x,s.y).setRotation(s.age*(s.food==='milk'?2:5));}
   for(const crate of m.crates)this.crateSprites.get(crate.id)?.setVisible(crate.hp>0).setAlpha(crate.hp===1?.72:1);
   for(const item of m.pickups){let snack=this.snacks.get(item.id);if(!snack){const art=this.add.graphics();art.lineStyle(2,0xa57445);if(item.kind==='donut'){art.fillStyle(0xe2b374).fillCircle(0,0,18).strokeCircle(0,0,18);art.fillStyle(0xefb3bc).fillCircle(0,-2,15);art.fillStyle(0xffe5b8).fillCircle(0,-2,5);for(let i=0;i<8;i++){const a=i*Math.PI/4;art.lineStyle(2,i%2?0xfff0b4:0xa5ccc8).lineBetween(Math.cos(a)*10,Math.sin(a)*10-2,Math.cos(a)*13,Math.sin(a)*13-2);}}else{art.fillStyle(item.kind==='waffle'?0xe3b369:0xd4a05d).fillRoundedRect(-20,-14,40,28,7).strokeRoundedRect(-20,-14,40,28,7);art.lineStyle(2,0xb78346,.7);if(item.kind==='waffle'){for(let i=-12;i<=12;i+=8){art.lineBetween(i,-10,i,10);art.lineBetween(-16,i*.65,16,i*.65);}}else{for(let i=0;i<17;i++){const x=(i*13%32)-16,y=(i*7%20)-10;art.lineBetween(x,y,x+5,y+2);}}}const heart=this.add.text(13,-22,'♥',{fontSize:'13px',color:'#d77689',stroke:'#fff5df',strokeThickness:3});snack=this.add.container(item.x,item.y-25,[art,heart]).setDepth(item.y+2);this.snacks.set(item.id,snack);}snack.setVisible(!item.taken);snack.y=item.y-25+Math.sin(now/250)*3;}
   this.machine.rotation=m.bossActive&&!m.bossDefeated?Math.sin(now/55)*.01:0;
  }
  update(_time:number,delta:number){if(!this.loaded)return;const before=this.model.state.status;if(before==='playing'){this.model.step(delta/1000,controls);this.renderFrame();for(const e of this.model.drainEvents())this.event(e);if(this.model.state.status!==before){clear();if(this.model.state.status==='lost')audio.pause();this.emit();}else if(this.model.time-this.lastEmit>120){this.lastEmit=this.model.time;this.emit();}}}
 }
 function keyControl(code:string):Control|undefined{return ({ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',Space:'jump',KeyF:'flash',KeyE:'action',KeyQ:'special'} as Record<string,Control>)[code];}
 const height=Math.max(320,Math.round(parent.clientHeight/Math.max(1,parent.clientWidth)*480));
 const game=new Phaser.Game({type:Phaser.AUTO,parent,width:480,height,backgroundColor:'#edc49c',render:{antialias:true,pixelArt:false,powerPreference:'low-power'},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},fps:{target:60},audio:{noAudio:true},scene:BakeryScene});
 const blur=()=>scene?.pauseGame();window.addEventListener('blur',blur);
 return {input:(key,down)=>{if(scene?.model.state.status!=='playing')return;if(down)audio.unlock();controls[key]=down;},start:()=>{audio.unlock();if(!scene?.loaded)return;if(scene.model.state.status==='ready')scene.begin();else{scene.scene.restart();scene.events.once(Phaser.Scenes.Events.CREATE,()=>scene?.begin());}},pause:()=>scene?.pauseGame(),resume:()=>scene?.resumeGame(),mute:v=>{if(scene)scene.model.state.audioBlocked=false;audio.mute(v,scene?.model.state.status==='playing');scene?.emit();},destroy:()=>{destroyed=true;window.removeEventListener('blur',blur);clear();audio.destroy();game.destroy(true);}};
}
