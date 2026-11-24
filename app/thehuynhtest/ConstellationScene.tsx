"use client";
import {useEffect,useRef,useState} from "react";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export type CelestialNode={
 key:string;personId:string;personName:string;color:string;
 filmId:string;title:string;point:[number,number,number];
 position:[number,number,number];centroid:[number,number,number];
 mixed:boolean;
};
export type CelestialCentroid={id:string;name:string;color:string;position:[number,number,number]};
export type CameraCommand={id:number;kind:"reset"|"in"|"out"|"focus"};
type Props={
 nodes:CelestialNode[];centroids:CelestialCentroid[];
 selectedKey:string|null;showLabels:boolean;showConnections:boolean;
 autoRotate:boolean;reduceMotion:boolean;
 onSelect:(key:string|null)=>void;onHover:(key:string|null)=>void;
 command:CameraCommand;
};
type RenderedNode={group:THREE.Group;target:THREE.Vector3;label:HTMLButtonElement;visible:boolean;key:string};
type Engine={
 renderer:THREE.WebGLRenderer;scene:THREE.Scene;camera:THREE.PerspectiveCamera;
 controls:OrbitControls;pointGroup:THREE.Group;lineGroup:THREE.Group;centroidGroup:THREE.Group;
 starfield:THREE.Points;raycaster:THREE.Raycaster;entries:Map<string,RenderedNode>;
 hitMeshes:THREE.Object3D[];glow:THREE.CanvasTexture;
 centroidEntries:Map<string,THREE.Group>;cameraFocus:THREE.Vector3;frame:number;
 resize:ResizeObserver;pointerStart:{x:number;y:number}|null;
};
function toWorld(p:[number,number,number]){return new THREE.Vector3(p[0],p[1],p[2]);}
function freeObject(obj:THREE.Object3D){
 obj.traverse(child=>{if(child instanceof THREE.Mesh||child instanceof THREE.Line||child instanceof THREE.Sprite){
  const geometry=(child as THREE.Mesh).geometry;
  if(geometry)geometry.dispose();
  const materials=(child as THREE.Mesh).material;
  if(materials)(Array.isArray(materials)?materials:[materials]).forEach((m:THREE.Material)=>m.dispose());
 }});
}
export default function ConstellationScene({nodes,centroids,selectedKey,showLabels,showConnections,autoRotate,reduceMotion,onSelect,onHover,command}:Props){
 const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),labels=useRef<HTMLDivElement>(null);
 const engine=useRef<Engine|null>(null);
 const onSelectRef=useRef(onSelect),onHoverRef=useRef(onHover);
 const selectedRef=useRef<string|null>(selectedKey);
 const reducedRef=useRef(reduceMotion);
 const [fallback,setFallback]=useState(false);
 useEffect(()=>{onSelectRef.current=onSelect;onHoverRef.current=onHover;selectedRef.current=selectedKey;},[onSelect,onHover,selectedKey]);
 useEffect(()=>{reducedRef.current=reduceMotion;},[reduceMotion]);

 useEffect(()=>{
  const element=host.current,screen=canvas.current,labelLayer=labels.current;
  if(!element||!screen||!labelLayer)return;
  let renderer:THREE.WebGLRenderer;
  try{
   if(!screen.getContext("webgl2")&&!screen.getContext("webgl"))throw Error("WebGL not supported");
   renderer=new THREE.WebGLRenderer({canvas:screen,alpha:true,antialias:true,powerPreference:"high-performance",preserveDrawingBuffer:true});
  }catch{setFallback(true);return;}
  renderer.setClearColor(0x000000,0);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(48,1,.1,200);
  camera.position.set(0,1.8,17);
  const controls=new OrbitControls(camera,screen);
  controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=4;controls.maxDistance=34;
  // Native vertical touch scrolling moves between the constellation and the
  // MPP section; horizontal dragging continues to rotate the 3D scene.
  screen.style.touchAction="pan-y";
  controls.enablePan=true;controls.panSpeed=.62;controls.rotateSpeed=.55;controls.autoRotateSpeed=.23;
  controls.touches.ONE=THREE.TOUCH.ROTATE;controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
  const stars:number[]=[];let seed=15237;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<1300;i++){const r=18+random()*55,a=random()*Math.PI*2,b=(random()-.5)*Math.PI;stars.push(Math.cos(a)*Math.cos(b)*r,Math.sin(b)*r,Math.sin(a)*Math.cos(b)*r);}
  const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute("position",new THREE.Float32BufferAttribute(stars,3));
  const starfield=new THREE.Points(starGeometry,new THREE.PointsMaterial({color:0xb1cee9,size:.038,transparent:true,opacity:.66,depthWrite:false,sizeAttenuation:true}));
  scene.add(starfield);
  const orbitGrid=new THREE.Group();
  for(let radius=2;radius<=8;radius+=2){
   const pts:Array<THREE.Vector3>=[];
   for(let i=0;i<=160;i++){const a=i/160*Math.PI*2;pts.push(new THREE.Vector3(radius*Math.cos(a),radius*Math.sin(a),0));}
   const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x7fa7cc,transparent:true,opacity:.09,depthWrite:false}));
   orbitGrid.add(line);
  }
  for(const axis of [new THREE.Vector3(1,0,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1)]){
   const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([axis.clone().multiplyScalar(-8),axis.clone().multiplyScalar(8)]),new THREE.LineBasicMaterial({color:0x8ca8c7,transparent:true,opacity:.12,depthWrite:false}));
   orbitGrid.add(line);
  }
  scene.add(orbitGrid);
  const glowCanvas=document.createElement("canvas");glowCanvas.width=128;glowCanvas.height=128;
  const ctx=glowCanvas.getContext("2d");
  if(ctx){const gradient=ctx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,"rgba(255,255,255,.8)");gradient.addColorStop(.15,"rgba(255,255,255,.42)");gradient.addColorStop(.4,"rgba(255,255,255,.12)");gradient.addColorStop(1,"rgba(255,255,255,0)");ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);}
  const glow=new THREE.CanvasTexture(glowCanvas);
  const pointGroup=new THREE.Group(),lineGroup=new THREE.Group(),centroidGroup=new THREE.Group();
  scene.add(lineGroup,pointGroup,centroidGroup);
  const raycaster=new THREE.Raycaster();
  const resize=()=>{const w=Math.max(1,element.clientWidth),h=Math.max(1,element.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);};
  const observer=new ResizeObserver(resize);observer.observe(element);resize();
  const items:Engine={renderer,scene,camera,controls,pointGroup,lineGroup,centroidGroup,starfield,raycaster,entries:new Map(),hitMeshes:[],glow,centroidEntries:new Map(),cameraFocus:new THREE.Vector3(),frame:0,resize:observer,pointerStart:null};
  engine.current=items;
  const hit=(ev:PointerEvent)=>{
   const rect=screen.getBoundingClientRect();
   const normalized=new THREE.Vector2((ev.clientX-rect.left)/rect.width*2-1,-((ev.clientY-rect.top)/rect.height*2-1));
   raycaster.setFromCamera(normalized,camera);
   return raycaster.intersectObjects(items.hitMeshes,false)[0]?.object.userData.key as string|undefined;
  };
  const pointerDown=(ev:PointerEvent)=>{items.pointerStart={x:ev.clientX,y:ev.clientY};};
  const pointerMove=(ev:PointerEvent)=>{const match=hit(ev)||null;onHoverRef.current(match);screen.style.cursor=match?"pointer":"grab";};
  const pointerUp=(ev:PointerEvent)=>{const start=items.pointerStart;items.pointerStart=null;
   if(start&&Math.hypot(start.x-ev.clientX,start.y-ev.clientY)<5){const match=hit(ev);if(match)onSelectRef.current(match);}
  };
  // On desktop the wheel scrolls to the MPP above, instead of zooming into
  // the constellation. Camera zoom remains available via the +/- buttons.
  const wheelScroll=(event:WheelEvent)=>{if(!event.ctrlKey)event.stopImmediatePropagation();};
  screen.addEventListener("wheel",wheelScroll,{capture:true,passive:true});
  screen.addEventListener("pointerdown",pointerDown);
  screen.addEventListener("pointermove",pointerMove);
  screen.addEventListener("pointerup",pointerUp);
  let frame=0;
  const animate=()=>{
   frame=requestAnimationFrame(animate);items.frame=frame;
   const motion=reducedRef.current||window.matchMedia("(prefers-reduced-motion: reduce)").matches;
   if(!motion)starfield.rotation.y+=.000035;
   for(const item of Array.from(items.entries.values())){
    item.group.position.lerp(item.target,motion?1:.083);
    const active=item.key===selectedRef.current;
    const scale=active?1.5:1;item.group.scale.lerp(new THREE.Vector3(scale,scale,scale),motion?1:.09);
    const projected=item.group.position.clone().project(camera);
    const visible=projected.z<1&&projected.z>-1&&Math.abs(projected.x)<1.12&&Math.abs(projected.y)<1.12;
    item.label.style.display=visible&&item.visible?"block":"none";
    if(visible){item.label.style.transform="translate3d("+((projected.x*.5+.5)*element.clientWidth+12)+"px,"+((-projected.y*.5+.5)*element.clientHeight-12)+"px,0)";item.label.style.opacity=active?"1":".78";item.label.style.zIndex=active?"8":"1";}
   }
   controls.autoRotate=!motion&&items.controls.autoRotate;
   if(!motion)controls.target.lerp(items.cameraFocus,.024);else controls.target.copy(items.cameraFocus);
   controls.update();renderer.render(scene,camera);
  };
  animate();
  return ()=>{
   cancelAnimationFrame(frame);observer.disconnect();
   screen.removeEventListener("wheel",wheelScroll,true);
   screen.removeEventListener("pointerdown",pointerDown);screen.removeEventListener("pointermove",pointerMove);screen.removeEventListener("pointerup",pointerUp);
   controls.dispose();
   for(const item of Array.from(items.entries.values())){item.label.remove();freeObject(item.group);}
   items.entries.clear();
   freeObject(orbitGrid);freeObject(lineGroup);freeObject(centroidGroup);freeObject(pointGroup);
   starfield.geometry.dispose();(starfield.material as THREE.Material).dispose();glow.dispose();renderer.dispose();
   engine.current=null;
  };
 },[]);

 // Keep the WebGL scene alive while changing modes, filters and participants.
 useEffect(()=>{
  const e=engine.current,layer=labels.current;if(!e||!layer)return;
  const current=new Set(nodes.map(n=>n.key));
  for(const [key,item] of Array.from(e.entries)){
   if(current.has(key))continue;
   e.pointGroup.remove(item.group);item.label.remove();freeObject(item.group);e.entries.delete(key);
  }
  const globe=new THREE.SphereGeometry(.12,16,12),hit=new THREE.SphereGeometry(.22,12,10);
  for(const n of nodes){
   let existing=e.entries.get(n.key);
   if(!existing){
    const group=new THREE.Group();
    const aura=new THREE.Sprite(new THREE.SpriteMaterial({map:e.glow,color:new THREE.Color(n.color),transparent:true,opacity:.56,depthWrite:false,blending:THREE.AdditiveBlending}));
    aura.scale.set(.8,.8,.8);group.add(aura);
    const core=new THREE.Mesh(globe.clone(),new THREE.MeshBasicMaterial({color:new THREE.Color(n.color)}));group.add(core);
    const target=new THREE.Mesh(hit.clone(),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));target.userData.key=n.key;group.add(target);
    if(n.mixed){const ring=new THREE.Mesh(new THREE.TorusGeometry(.21,.013,5,36),new THREE.MeshBasicMaterial({color:n.color,transparent:true,opacity:.75}));group.add(ring);}
    group.position.copy(toWorld(n.position));group.scale.setScalar(.01);e.pointGroup.add(group);
    const label=document.createElement("button");label.type="button";label.className="cosmos-star-label";label.textContent=n.title;
    label.style.color=n.color;label.setAttribute("aria-label",n.personName+": "+n.title);
    label.addEventListener("click",()=>onSelectRef.current(n.key));layer.appendChild(label);
    existing={group,target:toWorld(n.position),label,visible:showLabels,key:n.key};
    e.entries.set(n.key,existing);
   }
   existing.target.copy(toWorld(n.position));existing.visible=showLabels||n.key===selectedKey;existing.label.textContent=n.title;
  }
  globe.dispose();hit.dispose();
  e.hitMeshes=Array.from(e.entries.values()).map(v=>v.group.children.find(child=>child.userData.key===v.key)!).filter(Boolean);
  for(const child of [...e.centroidGroup.children]){e.centroidGroup.remove(child);freeObject(child);}
  e.centroidEntries.clear();
  for(const c of centroids){
   const g=new THREE.Group();g.position.copy(toWorld(c.position));
   const halo=new THREE.Mesh(new THREE.TorusGeometry(.37,.012,5,56),new THREE.MeshBasicMaterial({color:c.color,transparent:true,opacity:.55,depthWrite:false}));g.add(halo);
   const diamond=new THREE.Mesh(new THREE.OctahedronGeometry(.16),new THREE.MeshBasicMaterial({color:c.color,wireframe:true,transparent:true,opacity:.9}));g.add(diamond);
   const centroidHit=new THREE.Mesh(new THREE.SphereGeometry(.38,10,8),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));centroidHit.userData.key="centroid:"+c.id;g.add(centroidHit);
   e.centroidGroup.add(g);e.centroidEntries.set(c.id,g);
  }
  for(const child of [...e.lineGroup.children]){e.lineGroup.remove(child);freeObject(child);}
  e.hitMeshes.push(...Array.from(e.centroidEntries.values()).map(g=>g.children.find(c=>c.userData.key?.startsWith("centroid:"))!).filter(Boolean));
  if(showConnections){
   for(const person of centroids){
    const relevant=nodes.filter(n=>n.personId===person.id);if(!relevant.length)continue;
    const vertices:number[]=[];for(const node of relevant){vertices.push(...person.position,...node.position);}
    const geom=new THREE.BufferGeometry();geom.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));
    e.lineGroup.add(new THREE.LineSegments(geom,new THREE.LineBasicMaterial({color:person.color,transparent:true,opacity:.20,depthWrite:false})));
   }
  }
 },[nodes,centroids,showConnections,showLabels,selectedKey]);
 useEffect(()=>{
  if(!engine.current)return;
  engine.current.controls.autoRotate=autoRotate&&!reduceMotion;
 },[autoRotate,reduceMotion]);
 useEffect(()=>{
  const e=engine.current;if(!e)return;
  if(selectedKey){const item=e.entries.get(selectedKey);e.cameraFocus.copy(item?.target||new THREE.Vector3());}
  else e.cameraFocus.set(0,0,0);
 },[selectedKey,nodes]);
 useEffect(()=>{
  const e=engine.current;if(!e||command.id===0)return;
  if(command.kind==="reset"){e.cameraFocus.set(0,0,0);e.controls.target.set(0,0,0);e.camera.position.set(0,1.8,17);e.controls.update();}
  else if(command.kind==="in"||command.kind==="out"){
   const radius=e.camera.position.clone().sub(e.controls.target);
   radius.multiplyScalar(command.kind==="in"?.78:1.28);radius.clampLength(4,34);
   e.camera.position.copy(e.controls.target).add(radius);e.controls.update();
  }
 },[command]);
 if(fallback)return <div className="cosmos-fallback" role="img" aria-label="Interactive 2D fallback for the constellation.">
  <svg viewBox="0 0 1000 740" aria-hidden="true"><defs><radialGradient id="cosmos-fallback-bg"><stop stopColor="#182c49"/><stop offset="1" stopColor="#080b16"/></radialGradient></defs><rect width="1000" height="740" fill="url(#cosmos-fallback-bg)"/>{nodes.map(n=><g key={n.key} role="button" onClick={()=>onSelect(n.key)} style={{cursor:"pointer"}}><circle cx={500+n.position[0]*45} cy={370-n.position[1]*45} r="7" fill={n.color}/><text x={512+n.position[0]*45} y={365-n.position[1]*45} fill="#e2ecfb" fontSize="13">{n.title}</text></g>)}</svg>
  <div className="cosmos-fallback-note">3D graphics are unavailable on this device. This interactive 2D view uses the same saved response coordinates.</div>
 </div>;
 return <div ref={host} className="cosmos-stage" aria-label="Interactive three-dimensional film constellation">
  <canvas ref={canvas} className="cosmos-canvas" aria-label="Drag to rotate. Pinch or scroll to zoom. Select a film point to inspect."/>
  <div ref={labels} className="cosmos-star-labels" aria-hidden={!showLabels}/>
 </div>;
}
