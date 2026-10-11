import Phaser from 'phaser';
export type Control='left'|'right'|'jump'|'flash'|'action'|'special';
export type GameSnapshot={health:number;cookies:number;charge:number;detector:number;bossHealth:number;bossMax:number;status:'loading'|'ready'|'playing'|'paused'|'won'|'lost';hint:string;progress:number};
export type GameHandle={input:(key:Control,down:boolean)=>void;start:()=>void;pause:()=>void;resume:()=>void;mute:(v:boolean)=>void;destroy:()=>void};
type Enemy={sprite:Phaser.GameObjects.Image;hp:number;max:number;home:number;boss:boolean;hitAt:number;attackAt:number;phase:number};
const WORLD=6400, BOSS_X=5900, SPEED=205;
export function createGame(parent:HTMLElement,onState:(s:GameSnapshot)=>void):GameHandle{
 const held:Record<Control,boolean>={left:false,right:false,jump:false,flash:false,action:false,special:false};
 let scene:BakeryScene;let soundOff=false;let audio:AudioContext|undefined;
 const clear=()=>{(Object.keys(held) as Control[]).forEach(k=>held[k]=false);};
 const tone=(freq:number,duration=.08,kind:OscillatorType='sine')=>{if(soundOff||!audio)return;try{const osc=audio.createOscillator(),gain=audio.createGain();osc.type=kind;osc.frequency.setValueAtTime(freq,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(Math.max(50,freq*.6),audio.currentTime+duration);gain.gain.setValueAtTime(.035,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration);}catch{}};
 const unlock=()=>{if(!audio){const AC=window.AudioContext||(window as any).webkitAudioContext;if(AC)audio=new AC();}audio?.resume().catch(()=>{});};
 class BakeryScene extends Phaser.Scene{
  player!:Phaser.Physics.Arcade.Sprite;ground!:Phaser.Physics.Arcade.StaticGroup;cookies!:Phaser.Physics.Arcade.StaticGroup;
  enemies:Enemy[]=[];projectiles:{image:Phaser.GameObjects.Image;vx:number}[]=[];
  beam!:Phaser.GameObjects.Graphics;floor=500;facing=1;invulnerable=0;lastFlash=0;lastAction=0;lastJump=0;lastEmit=0;bossActive=false;bossDefeated=false;shakeUntil=0;machine!:Phaser.GameObjects.Container;shadow!:Phaser.GameObjects.Ellipse;
  state:GameSnapshot={health:3,cookies:0,charge:0,detector:0,bossHealth:0,bossMax:18,status:'loading',hint:'Opening Jaylean’s Bakery…',progress:0};
  constructor(){super('Bakery');scene=this;}
  init(){this.enemies=[];this.projectiles=[];this.facing=1;this.invulnerable=0;this.lastFlash=0;this.lastAction=0;this.lastJump=0;this.lastEmit=0;this.bossActive=false;this.bossDefeated=false;this.state={health:3,cookies:0,charge:0,detector:0,bossHealth:0,bossMax:18,status:'loading',hint:'Opening Jaylean’s Bakery…',progress:0};}
  preload(){for(const name of ['elly-idle','elly-run','elly-jump','yellow','pink','blue','boss','cookie','crate','bakery'])this.load.image(name,`/superelly/assets/${name}.webp`);this.load.on('loaderror',()=>{this.state.hint='An illustration did not load. Please refresh to try again.';this.emit();});}
  create(){
   this.floor=this.scale.height-48;this.physics.world.setBounds(0,-400,WORLD,this.floor+440);this.cameras.main.setBounds(0,0,WORLD,this.scale.height);
   const bg=this.textures.get('bakery').getSourceImage() as HTMLImageElement;const bgHeight=this.scale.height,bgWidth=bgHeight*(bg.width/bg.height);
   for(let x=0;x<WORLD+bgWidth;x+=bgWidth)this.add.image(x,0,'bakery').setOrigin(0).setDisplaySize(bgWidth+1,bgHeight).setDepth(-10);
   this.add.rectangle(WORLD/2,this.floor+32,WORLD,70,0xefcda5,.24).setDepth(-5);
   this.ground=this.physics.add.staticGroup();const floor=this.add.rectangle(WORLD/2,this.floor+20,WORLD,40,0,0);this.ground.add(floor);
   const platforms=[{x:750,w:100,h:48},{x:1350,w:130,h:65},{x:2020,w:100,h:48},{x:2820,w:160,h:75},{x:3750,w:100,h:55},{x:4500,w:145,h:65}];
   for(const p of platforms){const crate=this.add.image(p.x,this.floor,'crate').setOrigin(.5,1).setDisplaySize(p.w,p.h);this.ground.add(crate);(crate.body as Phaser.Physics.Arcade.StaticBody).setSize(p.w,p.h).updateFromGameObject();}
   this.addSign(390,'Jaylean’s Bakery','Follow the cookies →');this.addSign(2550,'A little courage!','Keep going →');this.addSign(5050,'Cookie machine','Something is stirring…');
   this.cookies=this.physics.add.staticGroup();for(let i=0;i<37;i++){const x=310+i*144;const platform=platforms.find(p=>Math.abs(x-p.x)<p.w/2+65);const y=this.floor-42-(platform?platform.h+24:(i%5===3?85:0));const c=this.add.image(x,y,'cookie').setDisplaySize(28,28);this.cookies.add(c);(c.body as Phaser.Physics.Arcade.StaticBody).setCircle(11,3,3);this.tweens.add({targets:c,y:y-6,duration:900,delay:i%4*130,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});}
   this.shadow=this.add.ellipse(130,this.floor+2,70,13,0x896140,.22).setDepth(4);
   this.player=this.physics.add.sprite(130,this.floor-62,'elly-idle').setDisplaySize(116,125).setDepth(8);this.player.setCollideWorldBounds(true);this.player.setGravityY(1050);this.setPlayerBody();this.physics.add.collider(this.player,this.ground);this.physics.add.overlap(this.player,this.cookies,(_p,c)=>{const item=c as Phaser.GameObjects.Image;if(!item.active)return;this.spark(item.x,item.y,0xffe2a0,6);item.destroy();this.state.cookies++;this.state.charge=Math.min(100,this.state.charge+5);tone(700+this.state.cookies%4*100);this.emit();});
   [1050,1690,2390,3190,3990,4780].forEach((x,i)=>this.addEnemy(x,['yellow','pink','blue'][i%3],3,false));this.addEnemy(BOSS_X,'boss',18,true);
   this.machine=this.makeMachine(BOSS_X+170,this.floor);this.beam=this.add.graphics().setDepth(7);
   this.cameras.main.startFollow(this.player,true,.09,.12,-65,0);
   this.input.keyboard?.on('keydown',(e:KeyboardEvent)=>{const key=keyControl(e.code);if(key){e.preventDefault();held[key]=true;}if(e.code==='Escape'){if(this.state.status==='playing')this.pauseGame();else if(this.state.status==='paused')this.resumeGame();}});
   this.input.keyboard?.on('keyup',(e:KeyboardEvent)=>{const key=keyControl(e.code);if(key)held[key]=false;});
   this.state.status='ready';this.state.hint='A little hero. A bakery full of trouble.';this.physics.pause();this.emit();
   this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{this.input.keyboard?.removeAllListeners();clear();});
  }
  setPlayerBody(){const body=this.player.body as Phaser.Physics.Arcade.Body;const source=this.textures.get(this.player.texture.key).getSourceImage() as HTMLImageElement;body.setSize(source.width*.42,source.height*.85);body.setOffset(source.width*.38,source.height*.12);}
  addSign(x:number,title:string,sub:string){const y=Math.max(100,this.floor-270);this.add.rectangle(x,y,190,72,0xfff0d7,.94).setStrokeStyle(3,0xb58d68);this.add.text(x,y-20,title,{fontFamily:'Georgia',fontSize:'19px',color:'#79523b'}).setOrigin(.5);this.add.text(x,y+12,sub,{fontFamily:'Georgia',fontSize:'13px',color:'#8c6b52'}).setOrigin(.5);}
  makeMachine(x:number,y:number){const parts:Phaser.GameObjects.GameObject[]=[];const body=this.add.rectangle(0,-63,145,112,0xd8dacc).setStrokeStyle(4,0x948f7c);parts.push(body);parts.push(this.add.rectangle(0,-127,160,28,0xe4ba90).setStrokeStyle(3,0x9f7b58));for(let i=0;i<4;i++)parts.push(this.add.circle(-49+i*32,-26,12,0xb3b9aa).setStrokeStyle(2,0x8a9384));const button=this.add.circle(0,-76,19,0xea8b85).setStrokeStyle(3,0xa26452);parts.push(button);parts.push(this.add.text(0,-78,'Ⅱ',{fontSize:'20px',color:'#fff8e5',fontFamily:'Arial'}).setOrigin(.5));parts.push(this.add.text(0,-171,'COOKIE MACHINE',{fontSize:'12px',fontFamily:'Georgia',color:'#674c3b',backgroundColor:'#fff0d7',padding:{x:9,y:6}}).setOrigin(.5));return this.add.container(x,y,parts).setDepth(2);}
  addEnemy(x:number,key:string,hp:number,boss:boolean){const sprite=this.add.image(x,this.floor,key).setOrigin(.5,1).setDisplaySize(boss?170:82,boss?157:80).setDepth(6);this.enemies.push({sprite,hp,max:hp,home:x,boss,hitAt:-1000,attackAt:0,phase:0});}
  emit(){onState({...this.state});}
  begin(){clear();if(this.state.status==='ready'){this.state.status='playing';this.state.hint='Hold ◀ ▶ to move. Tap ↑ to hop over crates.';this.physics.resume();this.emit();}}
  pauseGame(){if(this.state.status!=='playing')return;clear();this.state.status='paused';this.physics.pause();this.tweens.pauseAll();this.emit();}
  resumeGame(){if(this.state.status!=='paused')return;clear();this.state.status='playing';this.physics.resume();this.tweens.resumeAll();this.emit();}
  spark(x:number,y:number,color:number,count=8){for(let i=0;i<count;i++){const dot=this.add.star(x,y,4,2,6,color,.9).setDepth(12);this.tweens.add({targets:dot,x:x+Phaser.Math.Between(-48,48),y:y+Phaser.Math.Between(-65,15),angle:180,alpha:0,scale:0,duration:480,onComplete:()=>dot.destroy()});}}
  label(x:number,y:number,text:string){const t=this.add.text(x,y,text,{fontFamily:'Georgia',fontSize:'19px',color:'#76503c',backgroundColor:'#fff4d9',padding:{x:8,y:4}}).setOrigin(.5).setDepth(15);this.tweens.add({targets:t,y:y-40,alpha:0,delay:250,duration:800,onComplete:()=>t.destroy()});}
  hit(enemy:Enemy,damage:number,time:number){if(enemy.hp<=0||time-enemy.hitAt<300)return;enemy.hitAt=time;enemy.hp=Math.max(0,enemy.hp-damage);enemy.sprite.setTint(0xffedbc);this.time.delayedCall(140,()=>{if(enemy.sprite.active)enemy.sprite.clearTint();});this.spark(enemy.sprite.x,enemy.sprite.y-enemy.sprite.displayHeight/2,0xffe69d,5);this.state.charge=Math.min(100,this.state.charge+(enemy.boss?5:12));tone(enemy.boss?190:360,.1);
   if(enemy.boss)this.state.bossHealth=enemy.hp;
   if(enemy.hp===0){this.state.cookies+=enemy.boss?10:2;this.label(enemy.sprite.x,enemy.sprite.y-70,enemy.boss?'Get out of here, monster!':'+2 cookies!');this.tweens.add({targets:enemy.sprite,y:enemy.sprite.y-80,alpha:0,scaleX:0,scaleY:0,duration:500,onComplete:()=>enemy.sprite.destroy()});if(enemy.boss){this.bossDefeated=true;this.state.hint='Great work! Go to the machine and press Action ✋.';this.projectiles.forEach(p=>p.image.destroy());this.projectiles=[];}else tone(900,.18);}
   this.emit();
  }
  hurt(time:number){if(time<this.invulnerable||this.state.status!=='playing')return;this.invulnerable=time+1800;this.state.health--;this.player.setVelocityY(-220);this.spark(this.player.x,this.player.y,0xf6adac,7);tone(130,.2,'triangle');this.cameras.main.shake(100,.003);if(this.state.health<=0){this.state.status='lost';this.physics.pause();clear();this.state.hint='Every hero gets another try.';}this.emit();}
  flash(time:number){const x=this.player.x+this.facing*42,y=this.player.y-5;this.beam.fillStyle(0xfff3ae,.22);this.beam.fillTriangle(x,y,x+this.facing*210,y-64,x+this.facing*210,y+65);this.beam.fillStyle(0xfff8db,.22);this.beam.fillTriangle(x,y,x+this.facing*180,y-27,x+this.facing*180,y+32);
   if(time-this.lastFlash<480)return;this.lastFlash=time;const target=this.enemies.filter(e=>e.hp>0&&(!e.boss||this.bossActive)&&(e.sprite.x-this.player.x)*this.facing>0&&Math.abs(e.sprite.x-this.player.x)<248&&Math.abs(e.sprite.y-45-this.player.y)<110).sort((a,b)=>Math.abs(a.sprite.x-this.player.x)-Math.abs(b.sprite.x-this.player.x))[0];if(target)this.hit(target,1,time);}
  action(time:number){if(time-this.lastAction<450)return;this.lastAction=time;
   if(this.bossDefeated&&Math.abs(this.player.x-(BOSS_X+170))<120){this.win();return;}
   this.spark(this.player.x+this.facing*52,this.player.y,0xbae5ef,7);tone(330,.07);for(const e of this.enemies)if(e.hp>0&&(!e.boss||this.bossActive)&&Math.abs(e.sprite.x-this.player.x)<120&&Math.abs(e.sprite.y-45-this.player.y)<120)this.hit(e,2,time);
  }
  special(time:number){if(this.state.charge<100){this.state.hint='Collect cookies and hit monsters to charge ★.';this.emit();return;}this.state.charge=0;const ring=this.add.circle(this.player.x,this.player.y,24,0xffeab0,.4).setStrokeStyle(5,0xfff4bc).setDepth(10);this.tweens.add({targets:ring,scale:12,alpha:0,duration:650,onComplete:()=>ring.destroy()});this.spark(this.player.x,this.player.y,0xfff0a1,20);tone(880,.4,'triangle');for(const e of this.enemies)if(e.hp>0&&(!e.boss||this.bossActive)&&Math.abs(e.sprite.x-this.player.x)<340)this.hit(e,5,time);this.projectiles.forEach(p=>{if(Math.abs(p.image.x-this.player.x)<350)p.image.destroy();});this.projectiles=this.projectiles.filter(p=>p.image.active);this.invulnerable=time+1000;this.emit();}
  win(){this.state.status='won';this.state.hint='The cookie machine is safe. Thank you, Super Elly!';this.state.progress=100;this.physics.pause();clear();for(let i=0;i<6;i++)this.time.delayedCall(i*120,()=>this.spark(this.player.x+Phaser.Math.Between(-180,180),this.player.y-Phaser.Math.Between(20,200),[0xf4adac,0xffe49c,0xb4d7ca][i%3],12));tone(1040,.4);this.emit();}
  update(time:number,delta:number){if(this.state.status!=='playing')return;const dt=Math.min(delta,40)/1000;const body=this.player.body as Phaser.Physics.Arcade.Body;
   const direction=(held.right?1:0)-(held.left?1:0);this.player.setVelocityX(direction*SPEED);if(direction)this.facing=direction;this.player.setFlipX(this.facing<0);
   if(held.jump&&(body.blocked.down||body.touching.down)&&time-this.lastJump>300){this.player.setVelocityY(-490);this.lastJump=time;held.jump=false;tone(470,.12);}
   const texture=!body.blocked.down?'elly-jump':direction?(Math.floor(time/140)%2?'elly-run':'elly-idle'):'elly-idle';if(this.player.texture.key!==texture){this.player.setTexture(texture).setDisplaySize(116,125);this.setPlayerBody();}
   this.player.setAlpha(time<this.invulnerable?(Math.floor(time/95)%2?.45:1):1);this.shadow.setX(this.player.x);this.shadow.setScale(Math.max(.4,1-(this.floor-this.player.y)/350));
   this.beam.clear();if(held.flash)this.flash(time);if(held.action){held.action=false;this.action(time);}if(held.special){held.special=false;this.special(time);}
   if(this.player.x>5480&&!this.bossActive){this.bossActive=true;this.state.bossHealth=18;this.state.hint='The machine monster! Dodge the dough, shine your light!';tone(170,.3);this.emit();}
   let nearest=1000;
   for(const e of this.enemies){if(e.hp<=0)continue;const dist=Math.abs(e.sprite.x-this.player.x);nearest=Math.min(nearest,dist);
    if(e.boss){if(!this.bossActive)continue;e.sprite.setX(e.home+Math.sin(time/1000)*90);e.sprite.setY(this.floor+Math.sin(time/170)*3);if(time-e.attackAt>2300){e.attackAt=time;const image=this.add.image(e.sprite.x-40,this.floor-35,'cookie').setDisplaySize(30,30).setTint(0xd3a385).setDepth(7);this.projectiles.push({image,vx:-175});this.spark(e.sprite.x-50,this.floor-55,0xffd5a0,4);tone(220,.08);}}
    else{const chase=dist<280&&dist>75?Math.sign(this.player.x-e.sprite.x)*34:Math.cos(time/900+e.home)*18;e.sprite.x+=chase*dt;e.sprite.x=Phaser.Math.Clamp(e.sprite.x,e.home-120,e.home+120);e.sprite.y=this.floor+Math.sin(time/180+e.home)*3;e.sprite.setFlipX(this.player.x>e.sprite.x);}
    if(dist<(e.boss?83:49)&&Math.abs(this.player.y-(this.floor-45))<80)this.hurt(time);
   }
   for(const p of this.projectiles){p.image.x+=p.vx*dt;p.image.rotation+=dt*4;if(Math.abs(p.image.x-this.player.x)<38&&Math.abs(p.image.y-this.player.y)<58){this.hurt(time);p.image.destroy();}else if(p.image.x<this.player.x-650)p.image.destroy();}this.projectiles=this.projectiles.filter(p=>p.image.active);
   if(this.bossActive&&!this.bossDefeated)this.machine.rotation=Math.sin(time/55)*.012;else this.machine.rotation=0;
   if(!this.bossActive){if(this.player.x>800&&this.player.x<1800)this.state.hint='Hold Flashlight ☀ to send monsters packing.';else if(this.player.x>=1800&&this.player.x<3000)this.state.hint='Action ✋ works up close. Jump to stay safe!';else if(this.player.x>=3000&&this.player.x<4800)this.state.hint=this.state.charge>=100?'★ Special is ready! Tap it near monsters.':'Cookies and monster hits charge your ★ Special.';else if(this.player.x>=4800)this.state.hint='The detector is picking up something big…';}
   this.state.detector=Phaser.Math.Clamp(100-nearest/5,0,100);this.state.progress=Math.min(97,this.player.x/(BOSS_X+170)*100);
   if(time-this.lastEmit>130){this.lastEmit=time;this.emit();}
  }
 }
 function keyControl(code:string):Control|undefined{return ({ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',Space:'jump',KeyW:'jump',KeyF:'flash',KeyE:'action',KeyQ:'special'} as Record<string,Control>)[code];}
 const height=Math.max(320,Math.round(parent.clientHeight/Math.max(1,parent.clientWidth)*480));
 const game=new Phaser.Game({type:Phaser.AUTO,parent,width:480,height,backgroundColor:'#edc49c',transparent:false,render:{antialias:true,pixelArt:false,powerPreference:'low-power'},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'arcade',arcade:{debug:false}},fps:{target:60,forceSetTimeOut:false},audio:{noAudio:true},scene:BakeryScene});
 const blur=()=>scene?.pauseGame();window.addEventListener('blur',blur);
 return {input:(key,down)=>{if(scene?.state.status!=='playing')return;if(down)unlock();held[key]=down;},start:()=>{unlock();if(!scene)return;if(scene.state.status==='ready')scene.begin();else{scene.scene.restart();scene.events.once(Phaser.Scenes.Events.CREATE,()=>scene.begin());}},pause:()=>scene?.pauseGame(),resume:()=>{unlock();scene?.resumeGame();},mute:v=>{soundOff=v;},destroy:()=>{window.removeEventListener('blur',blur);clear();audio?.close().catch(()=>{});game.destroy(true);}};
}
