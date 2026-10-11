const names=['cookie','jump','hit','acro','special','hurt','throw','learn','win','flash'] as const;
export type Effect=typeof names[number];
export class BakeryAudio{
 private music:HTMLAudioElement; private context:AudioContext|null=null; private buffers=new Map<Effect,AudioBuffer>(); private muted=false; private disposed=false;
 constructor(private onBlocked:()=>void){this.music=new Audio('/superelly/audio/bakery-theme.mp3');this.music.loop=true;this.music.preload='auto';this.music.volume=.38;}
 unlock(){if(this.disposed)return;const C=window.AudioContext||(window as any).webkitAudioContext;if(!this.context&&C){this.context=new C();const context=this.context!;for(const name of names)fetch(`/superelly/audio/${name}.wav`).then(r=>{if(!r.ok)throw new Error(name);return r.arrayBuffer();}).then(b=>context.decodeAudioData(b)).then(b=>{if(!this.disposed)this.buffers.set(name,b);}).catch(()=>{});}this.context?.resume().catch(()=>{});}
 playMusic(){this.unlock();if(!this.muted&&!this.disposed)this.music.play().catch(()=>this.onBlocked());}
 effect(name:Effect){if(this.muted||this.disposed||!this.context||this.context.state!=='running')return;const buffer=this.buffers.get(name);if(!buffer)return;const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=buffer;gain.gain.value=name==='special'?.65:.5;source.connect(gain);gain.connect(this.context.destination);source.start();source.onended=()=>{source.disconnect();gain.disconnect();};}
 stopMusic(){this.music.pause();}
 pause(){this.music.pause();this.context?.suspend().catch(()=>{});}
 mute(value:boolean,playing:boolean){this.muted=value;if(value){this.music.pause();this.context?.suspend().catch(()=>{});}else{this.unlock();if(playing)this.playMusic();}}
 diagnostics(){return{musicPlaying:!this.music.paused,musicTime:Math.round(this.music.currentTime*10)/10,muted:this.muted,effectsReady:this.buffers.size,audioContext:this.context?.state||'not-started'};}
 destroy(){this.disposed=true;this.music.pause();this.music.removeAttribute('src');this.music.load();this.context?.close().catch(()=>{});this.buffers.clear();}
}
