/* Modelos procedurais originais. Coordenadas em milímetros aproximados. */
'use strict';
window.createHardwareView=function(canvas,onInstall,hooks={}){
const T=THREE,scene=new T.Scene();scene.background=new T.Color('#171e23');scene.fog=new T.Fog('#171e23',1100,2200);
const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.4;
const camera=new T.PerspectiveCamera(38,1,1,3000);const focus=new T.Vector3(0,25,0);let yaw=.5,pitch=.85,distance=740,exploded=false,powered=false,selection=null,installedSet=new Set(),pointer=null;
scene.add(new T.HemisphereLight(0xdbe9ff,0x34362f,2));function light(color,power,x,y,z){const l=new T.DirectionalLight(color,power);l.position.set(x,y,z);scene.add(l);return l;}const key=light(0xffeed5,3,200,600,-200);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-450,right:450,top:450,bottom:-450,near:1,far:1300});key.shadow.bias=-.0003;key.shadow.normalBias=.7;light(0x9ecbff,2,-350,200,150);light(0xf1f4ff,2.5,100,260,500);
const mats={};function mat(name,color,metalness=0,roughness=.5){return mats[name]=new T.MeshStandardMaterial({color,metalness,roughness});}
mat('case',0x22282c,.75,.37);mat('edge',0x56616b,.8,.25);mat('black',0x101519,.15,.48);mat('pcb',0x193b33,.25,.55);mat('gold',0xc1a15c,.8,.27);mat('silver',0xb5b9ba,.95,.24);mat('chip',0x17191e,.15,.68);mat('white',0xd7dfdc,.15,.45);mat('green',0x204c38,.2,.5);mat('copper',0xae6c36,.85,.28);mat('blue',0x4b778b,.5,.3);mat('paste',0xbec3c4,.3,.8);
const geos=new Map();function geo(key,create){if(!geos.has(key))geos.set(key,create());return geos.get(key);}function mesh(g,geometry,material,x,y,z){const m=new T.Mesh(geometry,typeof material==='string'?mats[material]:material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function box(g,x,y,z,w,h,d,m){return mesh(g,geo(`b${w},${h},${d}`,()=>new T.BoxGeometry(w,h,d)),m,x,y,z);}
function cyl(g,x,y,z,r,h,m,n=20){return mesh(g,geo(`c${r},${h},${n}`,()=>new T.CylinderGeometry(r,r,h,n)),m,x,y,z);}
function screw(g,x,y,z){cyl(g,x,y,z,2.3,1.8,'silver',12);box(g,x,y+1,z,3,.3,.6,'black');box(g,x,y+1,z,.6,.3,3,'black');}
function text(g,value,x,y,z,w=55,d=12,color='#d9e2e3',bg=null){const c=document.createElement('canvas');c.width=512;c.height=128;const a=c.getContext('2d');if(bg){a.fillStyle=bg;a.fillRect(0,0,512,128);}a.fillStyle=color;a.font='bold 44px Arial';a.textAlign='center';a.textBaseline='middle';a.fillText(value,256,64);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const p=mesh(g,new T.PlaneGeometry(w,d),new T.MeshStandardMaterial({map:texture,transparent:true,roughness:.6,depthWrite:false}),x,y,z);p.rotation.x=-Math.PI/2;return p;}
function wire(g,points,r,color){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(g,new T.TubeGeometry(curve,32,r,7,false),new T.MeshStandardMaterial({color,roughness:.7}),0,0,0);}
const fans=[];
const table=new T.Group();scene.add(table);box(table,0,-33,0,1400,40,1050,'black');const grid=new T.GridHelper(1000,40,0x435455,0x2b3739);grid.position.y=-12.8;scene.add(grid);text(table,'BANCADA / HARDWARE LAB',0,-12.5,245,250,24,'#73868b');
const chassis=new T.Group();scene.add(chassis);
const models={};function group(id){const g=new T.Group();g.userData.id=id;scene.add(g);models[id]=g;return g;}
for(const id of ['standoffs','board','cpu','paste','cooler','ram','ssd','psu','gpu','cables'])group(id);
for(const x of [-125,109])for(const z of [-140,-13,115]){cyl(models.standoffs,x,5,z,3.2,10,'gold',6);cyl(models.standoffs,x,10.5,z,1.3,1,'black');}
const paste=cyl(models.paste,-48,25,-76,5,.8,'paste',24);paste.scale.z=.85;
refineHardwareModels({T,scene,renderer,models,mats,box,cyl,text,wire,mesh,chassis,fans});
const ring=mesh(scene,new T.TorusGeometry(22,1,8,64),new T.MeshBasicMaterial({color:0xb8f4bb,transparent:true,opacity:.85,depthTest:false}),0,0,0);ring.rotation.x=-Math.PI/2;ring.renderOrder=5;
// Os modelos foram desenhados na posição final; centralize os pivôs para segurá-los.
const homes={},placement=new HardwarePlacement(),raycaster=new T.Raycaster();
const tolerances={standoffs:28,board:26,cpu:13,paste:12,cooler:18,ram:14,ssd:17,psu:25,gpu:20,cables:23};
for(const [id,model] of Object.entries(models)){
  const center=new T.Box3().setFromObject(model).getCenter(new T.Vector3());
  for(const child of model.children)child.position.sub(center);
  homes[id]=center;model.position.copy(center);model.userData.destination=center.clone();model.visible=false;
}
let ghost=null,lastState='',cursorInside=false,inspection=null;
const ghostMaterial=new T.MeshBasicMaterial({color:0x78cbd4,transparent:true,opacity:.14,depthWrite:false});
const cursorMarker=mesh(scene,new T.TorusGeometry(8,.7,6,32),new T.MeshBasicMaterial({color:0xd8e6ed,depthTest:false}),0,0,0);
cursorMarker.rotation.x=-Math.PI/2;cursorMarker.visible=false;cursorMarker.renderOrder=6;
function handState(){const state=placement.state();if(inspection){state.inspecting=true;state.canPlace=false;state.reason='Inspeção de perto. Arraste para girar; Esc volta à bancada.';}return state;}
function notify(force=false){
  const state=handState();
  const signature=JSON.stringify([state.id,state.canPlace,state.reason,state.degrees]);
  if(force||signature!==lastState){lastState=signature;hooks.onState?.(state);}
  ring.material.color.set(state.canPlace?0xa3f2ab:placement.missing.length?0xf1b86d:0x78cbd4);
  ghostMaterial.color.copy(ring.material.color);
}
function clearGhost(){if(ghost){scene.remove(ghost);ghost=null;}ring.visible=false;cursorMarker.visible=false;}
function closeInspection(){if(!inspection)return;scene.remove(inspection.clone);for(const [object,visible]of inspection.visibility)object.visible=visible;focus.copy(inspection.focus);yaw=inspection.yaw;pitch=inspection.pitch;distance=inspection.distance;inspection=null;hooks.onInspect?.(false);sync(installedSet,selection);notify(true);}
function inspect(){
  if(inspection){closeInspection();return false;}
  const id=placement.id||selection;if(!models[id])return false;
  const clone=models[id].clone(true);clone.visible=true;clone.position.set(0,100,0);clone.rotation.set(0,0,0);clone.updateMatrixWorld(true);
  const size=new T.Box3().setFromObject(clone).getSize(new T.Vector3());
  const visibility=scene.children.filter(o=>!o.isLight).map(o=>[o,o.visible]);
  inspection={clone,visibility,focus:focus.clone(),yaw,pitch,distance};for(const[o]of visibility)o.visible=false;
  scene.add(clone);focus.set(0,100,0);distance=Math.max(90,size.length()*1.9);yaw=.25;pitch=.42;hooks.onInspect?.(true);notify(true);return true;
}
function cancel(){closeInspection();placement.cancel();clearGhost();canvas.classList.remove('holding');sync(installedSet,selection);notify(true);}
function sync(set,id){
  installedSet=new Set(set);selection=id;
  if(placement.id&&installedSet.has(placement.id)){placement.cancel();clearGhost();canvas.classList.remove('holding');notify(true);}
  for(const [key,model] of Object.entries(models)){
    model.visible=installedSet.has(key)||key===placement.id;
    if(key!==placement.id){model.userData.destination.copy(homes[key]);model.userData.destination.y+=installedSet.has(key)&&exploded?Object.keys(models).indexOf(key)*18:0;model.rotation.y=0;}
  }
}
function begin(id,missing=[]){
  if(!models[id]||installedSet.has(id))return false;
  cancel();exploded=false;hooks.onExploded?.(false);sync(installedSet,id);
  const home=homes[id];placement.begin(id,home,tolerances[id],missing);
  const model=models[id];model.visible=true;model.rotation.y=0;
  model.position.set(placement.position.x,home.y+45,placement.position.z);
  ghost=model.clone(true);ghost.position.copy(home);ghost.rotation.set(0,0,0);
  ghost.traverse(o=>{if(o.isMesh){o.material=ghostMaterial;o.castShadow=false;o.receiveShadow=false;}});scene.add(ghost);
  ring.position.set(home.x,home.y+3,home.z);ring.visible=true;
  canvas.classList.add('holding');notify(true);return true;
}
function updateHeld(){if(!placement.id)return;const id=placement.id,model=models[id];model.position.set(placement.position.x,homes[id].y+45,placement.position.z);model.rotation.y=placement.turns*Math.PI/2;cursorMarker.position.set(placement.position.x,homes[id].y+1,placement.position.z);cursorMarker.visible=true;notify();}
function rotate(direction){if(inspection){inspection.clone.rotation.y+=direction*Math.PI/2;return;}placement.rotate(direction);updateHeld();}
function movePointer(clientX,clientY){
  if(!placement.id||inspection)return;
  const rect=canvas.getBoundingClientRect();
  cursorInside=clientX>=rect.left&&clientX<=rect.right&&clientY>=rect.top&&clientY<=rect.bottom;
  if(!cursorInside)return;
  raycaster.setFromCamera(new T.Vector2((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1),camera);
  const point=new T.Vector3(),plane=new T.Plane(new T.Vector3(0,1,0),-homes[placement.id].y);
  if(raycaster.ray.intersectPlane(plane,point)){placement.move(point.x,point.z);updateHeld();}
}
function tryPlace(){
  if(inspection){hooks.onMessage?.('Feche a inspeção para voltar à montagem.');return false;}
  const state=placement.state();
  if(!state.id)return false;
  if(!state.canPlace){hooks.onMessage?.(state.reason);return false;}
  onInstall(state.id);return true;
}
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(canvas);resize();
function resetCamera(){closeInspection();yaw=.5;pitch=.85;distance=820;focus.set(0,25,0);}
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{
  canvas.focus();canvas.setPointerCapture(e.pointerId);
  pointer={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false,orbit:!!inspection||e.button===2||!placement.id,button:e.button};
  if(placement.id&&e.button===0)movePointer(e.clientX,e.clientY);
});
canvas.addEventListener('pointermove',e=>{
  if(placement.id&&(!pointer||!pointer.orbit))movePointer(e.clientX,e.clientY);
  if(!pointer)return;
  const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
  pointer.moved ||= Math.hypot(e.clientX-pointer.startX,e.clientY-pointer.startY)>5;
  if(pointer.orbit&&pointer.moved){yaw-=dx*.007;pitch=Math.max(inspection?-1.3:.16,Math.min(1.5,pitch+dy*.006));}
  pointer.x=e.clientX;pointer.y=e.clientY;
});
canvas.addEventListener('pointerup',e=>{
  if(inspection){pointer=null;return;}
  if(pointer&&pointer.button===0){
    if(placement.id&&!pointer.orbit){movePointer(e.clientX,e.clientY);if(cursorInside)tryPlace();else cancel();}
    else if(!pointer.moved){
      const rect=canvas.getBoundingClientRect();
      raycaster.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);
      const hit=raycaster.intersectObjects(Object.values(models).filter(m=>m.visible),true)[0];
      if(hit){let model=hit.object;while(model.parent&& !model.userData.id)model=model.parent;if(model.userData.id)hooks.onPick?.(model.userData.id);}
    }
  }
  pointer=null;
});
canvas.addEventListener('pointercancel',()=>{pointer=null;cancel();});
canvas.addEventListener('dragover',e=>{e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect='move';movePointer(e.clientX,e.clientY);});
canvas.addEventListener('drop',e=>{e.preventDefault();movePointer(e.clientX,e.clientY);tryPlace();canvas.focus();});
canvas.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(inspection?25:230,Math.min(1250,distance+e.deltaY*.55));},{passive:false});
function handleKey(e){
  if(e.target.matches('input,select,textarea')||e.target.isContentEditable)return;
  const key=e.key.toLowerCase();
  if(inspection){if(['escape','q','e','arrowleft','arrowright','arrowup','arrowdown'].includes(key))e.preventDefault();if(key==='escape')closeInspection();if(key==='q'||key==='arrowleft')yaw-=.15;if(key==='e'||key==='arrowright')yaw+=.15;if(key==='arrowup')pitch=Math.min(1.5,pitch+.1);if(key==='arrowdown')pitch=Math.max(-1.3,pitch-.1);return;}
  if(placement.id){
    if(['q','e','escape','enter','w','a','s','d','arrowleft','arrowright','arrowup','arrowdown'].includes(key))e.preventDefault();
    if(key==='q')rotate(-1);if(key==='e')rotate(1);
    if(key==='escape'){cancel();return;}
    if(key==='enter')tryPlace();
    const step=e.shiftKey?2:10,offsets={w:[0,-step],s:[0,step],a:[-step,0],d:[step,0],arrowleft:[-step,0],arrowright:[step,0],arrowup:[0,-step],arrowdown:[0,step]};
    if(offsets[key]){const [dx,dz]=offsets[key];placement.move(placement.position.x+dx,placement.position.z+dz);updateHeld();}
  }else if(e.target===canvas&&key.startsWith('arrow')){
    e.preventDefault();if(key==='arrowleft')yaw-=.1;if(key==='arrowright')yaw+=.1;
    if(key==='arrowup')pitch=Math.min(1.5,pitch+.08);if(key==='arrowdown')pitch=Math.max(.16,pitch-.08);
  }
  if(key==='r')resetCamera();
}
document.addEventListener('keydown',handleKey);
let last=0;
function frame(time){
  requestAnimationFrame(frame);const dt=Math.min((time-last)/1000,.05);last=time;
  for(const [id,model] of Object.entries(models))if(id!==placement.id)model.position.lerp(model.userData.destination,1-Math.exp(-dt*9));
  if(powered)for(const rotor of fans)rotor.rotation.y+=dt*18;
  ring.scale.setScalar(1+Math.sin(time*.003)*.06);
  camera.position.set(focus.x+Math.sin(yaw)*Math.cos(pitch)*distance,focus.y+Math.sin(pitch)*distance,focus.z+Math.cos(yaw)*Math.cos(pitch)*distance);
  camera.lookAt(focus);renderer.render(scene,camera);
}
sync(new Set(),null);resetCamera();requestAnimationFrame(frame);
return {
  sync,begin,cancel,rotate,tryPlace,resetCamera,inspect,
  getHandState:handState,
  setPowered(value){powered=value;},
  toggleExploded(){if(inspection){hooks.onMessage?.('Feche a inspeção para abrir a vista explodida.');return exploded;}if(placement.id){hooks.onMessage?.('Devolva a peça à biblioteca antes de abrir a vista explodida.');return exploded;}exploded=!exploded;sync(installedSet,selection);return exploded;}
};
};
