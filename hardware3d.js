/* Modelos procedurais originais. Coordenadas em milímetros aproximados. */
'use strict';
window.createHardwareView=function(canvas,onInstall,hooks={}){
const T=THREE,scene=new T.Scene();scene.background=new T.Color('#171e23');scene.fog=new T.Fog('#171e23',1100,2200);
const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.4;
const camera=new T.PerspectiveCamera(38,1,1,3000);const focus=new T.Vector3(0,25,0);let yaw=.5,pitch=.85,distance=740,exploded=false,powered=false,selection=null,installedSet=new Set(),pointer=null;
scene.add(new T.HemisphereLight(0xdbe9ff,0x34362f,2));function light(color,power,x,y,z){const l=new T.DirectionalLight(color,power);l.position.set(x,y,z);scene.add(l);return l;}const key=light(0xffeed5,3,200,600,-200);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-450,right:450,top:450,bottom:-450,near:1,far:1300});key.shadow.bias=-.0003;key.shadow.normalBias=.7;light(0x9ecbff,2,-350,200,150);
const mats={};function mat(name,color,metalness=0,roughness=.5){return mats[name]=new T.MeshStandardMaterial({color,metalness,roughness});}
mat('case',0x22282c,.75,.37);mat('edge',0x56616b,.8,.25);mat('black',0x101519,.15,.48);mat('pcb',0x193b33,.25,.55);mat('gold',0xc1a15c,.8,.27);mat('silver',0xb5b9ba,.95,.24);mat('chip',0x17191e,.15,.68);mat('white',0xd7dfdc,.15,.45);mat('green',0x204c38,.2,.5);mat('copper',0xae6c36,.85,.28);mat('blue',0x4b778b,.5,.3);mat('paste',0xbec3c4,.3,.8);
const geos=new Map();function geo(key,create){if(!geos.has(key))geos.set(key,create());return geos.get(key);}function mesh(g,geometry,material,x,y,z){const m=new T.Mesh(geometry,typeof material==='string'?mats[material]:material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function box(g,x,y,z,w,h,d,m){return mesh(g,geo(`b${w},${h},${d}`,()=>new T.BoxGeometry(w,h,d)),m,x,y,z);}
function cyl(g,x,y,z,r,h,m,n=20){return mesh(g,geo(`c${r},${h},${n}`,()=>new T.CylinderGeometry(r,r,h,n)),m,x,y,z);}
function screw(g,x,y,z){cyl(g,x,y,z,2.3,1.8,'silver',12);box(g,x,y+1,z,3,.3,.6,'black');box(g,x,y+1,z,.6,.3,3,'black');}
function text(g,value,x,y,z,w=55,d=12,color='#d9e2e3',bg=null){const c=document.createElement('canvas');c.width=512;c.height=128;const a=c.getContext('2d');if(bg){a.fillStyle=bg;a.fillRect(0,0,512,128);}a.fillStyle=color;a.font='bold 44px Arial';a.textAlign='center';a.textBaseline='middle';a.fillText(value,256,64);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const p=mesh(g,new T.PlaneGeometry(w,d),new T.MeshStandardMaterial({map:texture,transparent:true,roughness:.6,depthWrite:false}),x,y,z);p.rotation.x=-Math.PI/2;return p;}
function wire(g,points,r,color){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(g,new T.TubeGeometry(curve,32,r,7,false),new T.MeshStandardMaterial({color,roughness:.7}),0,0,0);}
const fans=[];function fan(g,x,y,z,r){const root=new T.Group();root.position.set(x,y,z);g.add(root);cyl(root,0,0,0,r+3,3,'black',40);const rotor=new T.Group();root.add(rotor);for(let i=0;i<9;i++){const blade=box(rotor,0,2,0,r*.38,1.7,r*.72,'black');const a=i*Math.PI*2/9;blade.position.set(Math.cos(a)*r*.55,2,Math.sin(a)*r*.55);blade.rotation.y=-a+.5;}cyl(rotor,0,4,0,r*.23,5,'edge',24);cyl(rotor,0,7,0,r*.12,1,'black');fans.push(rotor);return root;}
const table=new T.Group();scene.add(table);box(table,0,-33,0,1400,40,1050,'black');const grid=new T.GridHelper(1000,40,0x435455,0x2b3739);grid.position.y=-12.8;scene.add(grid);text(table,'BANCADA / HARDWARE LAB',0,-12.5,245,250,24,'#73868b');
const chassis=new T.Group();scene.add(chassis);box(chassis,0,-5,10,320,9,430,'case');for(const x of [-155,155]){box(chassis,x,24,10,7,58,430,'case');box(chassis,x,56,10,10,5,430,'edge');}box(chassis,0,28,-202,310,65,5,'case');box(chassis,0,40,223,310,90,7,'case');box(chassis,0,88,223,310,4,10,'edge');for(let i=0;i<18;i++)box(chassis,-125+i*14,41,227,5,55,2,'black');for(let i=0;i<7;i++)box(chassis,-118,20,-205+i*.1,4,16,4,'silver');for(const x of [-139,139])for(const z of [-183,203]){cyl(chassis,x,-12,z,10,8,'black');screw(chassis,x,2,z);}text(chassis,'ATX / OPEN SERVICE',0,.1,194,130,12,'#96a4a9');
const models={};function group(id){const g=new T.Group();g.userData.id=id;scene.add(g);models[id]=g;return g;}
let g=group('standoffs');for(const x of [-125,109])for(const z of [-140,-13,115]){cyl(g,x,5,z,3.2,10,'gold',6);cyl(g,x,10.5,z,1.3,1,'black');}
g=group('board');box(g,-8,12,-15,244,2.2,305,'pcb');for(const x of [-125,109])for(const z of [-140,-13,115])screw(g,x,14,z);
// Traces du circuit, sérigraphie, résistances et contrôleurs.
for(let i=0;i<42;i++){const x=-113+(i%14)*15,z=-145+Math.floor(i/14)*125;box(g,x,13.2,z, .45,.13,28+(i%4)*9,'gold');box(g,x+5,13.2,z+9,9,.13,.4,'gold');}
for(let i=0;i<64;i++){const x=-112+(i%16)*14,z=-8+Math.floor(i/16)*20;box(g,x,14.7,z,5,2.5,3,'chip');box(g,x-2.8,14.5,z,1,2,3,'silver');}
box(g,-48,16,-76,61,5,61,'black');box(g,-48,19,-76,49,.5,49,'white');for(let row=0;row<12;row++)for(let col=0;col<12;col++)box(g,-70+col*4,19.5,-98+row*4,1,.25,1,'black');wire(g,[[-16,19,-106],[-12,19,-106],[-12,19,-46]],.9,0xbac0bc);
for(const x of [17,32,47,62]){box(g,x,17,-77,7,7,125,'black');box(g,x,21,-77,1.5,.5,115,'gold');for(const z of [-142,-12])box(g,x,20,z,9,6,7,'white');}
for(const z of [37,85]){box(g,-38,18,z,150,8,9,'black');box(g,-38,22.2,z,139,.3,1.3,'gold');box(g,40,20,z,7,11,11,'white');}box(g,-50,16,59,74,4,7,'black');
for(const x of [-112,-96,-80]){box(g,x,25,-95,11,23,92,'edge');for(let i=0;i<4;i++)box(g,x-4+i*2.5,37,-95,.8,2,90,'silver');}for(let i=0;i<10;i++){cyl(g,-114+(i%5)*13,21,-23+Math.floor(i/5)*17,3.5,13,'silver');cyl(g,-114+(i%5)*13,28,-23+Math.floor(i/5)*17,3,1,'black');}
box(g,76,22,96,53,16,39,'edge');for(let i=0;i<10;i++)box(g,53+i*5,31,96,1,3,36,'black');text(g,'B550',76,33,96,31,9);text(g,'AM4 / DDR4',-23,13.3,110,74,10);text(g,'A2',32,14,-151,12,6);text(g,'B2',62,14,-151,12,6);
for(let i=0;i<5;i++){box(g,-119+i*24,23,-157,19,20,19,'silver');box(g,-119+i*24,24,-167,14,10,.5,'black');}box(g,103,20,-57,10,14,50,'black');for(let i=0;i<12;i++)for(const x of [100,106])box(g,x,27.5,-79+i*4,2,.5,2,'gold');cyl(g,-88,16,106,10,4,'silver',32);
g=group('cpu');box(g,-48,21,-76,40,2,40,'green');box(g,-48,23,-76,37,2.5,37,'silver');text(g,'RYZEN',-48,24.4,-79,28,7,'#3b4145');text(g,'5 5600',-48,24.4,-70,22,5,'#535a60');box(g,-64,24.5,-92,2,.2,2,'gold');
g=group('paste');const paste=cyl(g,-48,25,-76,5,.8,'paste',24);paste.scale.z=.85;
g=group('cooler');box(g,-48,31,-76,47,9,47,'copper');for(let i=0;i<26;i++)box(g,-48,38+i*1.6,-76,75,.55,68,'silver');for(const x of [-72,-24])wire(g,[[x,30,-103],[x,82,-103],[x,84,-49],[x,32,-49]],2.1,0xb3764f);fan(g,-48,83,-76,35);for(const x of [-84,-12])for(const z of [-108,-44])screw(g,x,89,z);wire(g,[[-12,86,-45],[3,69,-31],[0,18,-12]],1,0x272d32);
g=group('ram');for(const x of [32,62]){box(g,x,34,-77,2.5,30,116,'green');box(g,x,22,-77,3,5,112,'gold');for(let i=0;i<8;i++)box(g,x-2,35,-124+i*13,2,12,10,'chip');box(g,x,47,-77,7,5,120,'edge');for(const z of [-135,-19])box(g,x,39,z,6,19,5,'edge');text(g,'DDR4',x,50,-77,5,40);}
g=group('ssd');box(g,-40,17,6,80,1.3,22,'green');for(let i=0;i<3;i++)box(g,-62+i*23,19,6,18,2,17,'chip');box(g,-38,20.2,6,50,.2,17,'white');text(g,'NVMe / 1 TB',-38,20.4,6,45,9,'#22272c');screw(g,-77,19,6);
g=group('psu');box(g,65,37,167,145,72,83,'case');fan(g,65,74,167,33);for(let i=0;i<7;i++){const ring=mesh(g,new T.TorusGeometry(7+i*4, .65,5,40),'silver',65,81,167);ring.rotation.x=Math.PI/2;}for(const x of [7,123])for(const z of [137,197])screw(g,x,76,z);text(g,'650 W',22,74,168,34,14);box(g,138,37,166,1,26,40,'black');
g=group('gpu');box(g,-20,46,47,230,3,19,'green');box(g,-20,50,47,236,5,42,'edge');for(let i=0;i<35;i++)box(g,-130+i*6.5,62,47,.7,19,37,'silver');box(g,-20,74,47,238,5,56,'black');fan(g,-79,79,47,25);fan(g,35,79,47,25);for(const x of [-134,94])for(const z of [23,71])screw(g,x,78,z);box(g,-141,45,47,4,65,58,'silver');text(g,'GEFORCE / PCIe',-20,77,22,112,7);box(g,78,65,70,20,12,12,'black');
g=group('cables');for(let i=0;i<12;i++){const x=100+(i%2)*3;wire(g,[[115+i*.9,40,150],[135+i*.5,58,99],[133+i*.4,45,-10],[x,32,-78+(i%6)*8]],1.2,i%4===0?0x827663:0x1b2025);}for(let i=0;i<8;i++)wire(g,[[112+i,40,145],[144+i*.8,70,5],[126+i,57,-150],[-115+i*3,35,-143]],1,0x232a31);for(let i=0;i<8;i++)wire(g,[[85+i,40,135],[100+i,100,105],[78+(i%4)*3,82,72]],1.3,0x30363c);box(g,103,30,-57,12,10,50,'black');
const ring=mesh(scene,new T.TorusGeometry(22,1,8,64),new T.MeshBasicMaterial({color:0xb8f4bb,transparent:true,opacity:.85,depthTest:false}),0,0,0);ring.rotation.x=-Math.PI/2;ring.renderOrder=5;
// Os modelos foram desenhados na posição final; centralize os pivôs para segurá-los.
const homes={},placement=new HardwarePlacement(),raycaster=new T.Raycaster();
const tolerances={standoffs:28,board:26,cpu:13,paste:12,cooler:18,ram:14,ssd:17,psu:25,gpu:20,cables:23};
for(const [id,model] of Object.entries(models)){
  const center=new T.Box3().setFromObject(model).getCenter(new T.Vector3());
  for(const child of model.children)child.position.sub(center);
  homes[id]=center;model.position.copy(center);model.userData.destination=center.clone();model.visible=false;
}
let ghost=null,lastState='',cursorInside=false;
const ghostMaterial=new T.MeshBasicMaterial({color:0x78cbd4,transparent:true,opacity:.14,depthWrite:false});
const cursorMarker=mesh(scene,new T.TorusGeometry(8,.7,6,32),new T.MeshBasicMaterial({color:0xd8e6ed,depthTest:false}),0,0,0);
cursorMarker.rotation.x=-Math.PI/2;cursorMarker.visible=false;cursorMarker.renderOrder=6;
function notify(force=false){
  const state=placement.state();
  const signature=JSON.stringify([state.id,state.canPlace,state.reason,state.degrees]);
  if(force||signature!==lastState){lastState=signature;hooks.onState?.(state);}
  ring.material.color.set(state.canPlace?0xa3f2ab:placement.missing.length?0xf1b86d:0x78cbd4);
  ghostMaterial.color.copy(ring.material.color);
}
function clearGhost(){if(ghost){scene.remove(ghost);ghost=null;}ring.visible=false;cursorMarker.visible=false;}
function cancel(){placement.cancel();clearGhost();canvas.classList.remove('holding');sync(installedSet,selection);notify(true);}
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
function rotate(direction){placement.rotate(direction);updateHeld();}
function movePointer(clientX,clientY){
  if(!placement.id)return;
  const rect=canvas.getBoundingClientRect();
  cursorInside=clientX>=rect.left&&clientX<=rect.right&&clientY>=rect.top&&clientY<=rect.bottom;
  if(!cursorInside)return;
  raycaster.setFromCamera(new T.Vector2((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1),camera);
  const point=new T.Vector3(),plane=new T.Plane(new T.Vector3(0,1,0),-homes[placement.id].y);
  if(raycaster.ray.intersectPlane(plane,point)){placement.move(point.x,point.z);updateHeld();}
}
function tryPlace(){
  const state=placement.state();
  if(!state.id)return false;
  if(!state.canPlace){hooks.onMessage?.(state.reason);return false;}
  onInstall(state.id);return true;
}
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(canvas);resize();
function resetCamera(){yaw=.5;pitch=.85;distance=820;focus.set(0,25,0);}
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{
  canvas.focus();canvas.setPointerCapture(e.pointerId);
  pointer={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false,orbit:e.button===2||!placement.id,button:e.button};
  if(placement.id&&e.button===0)movePointer(e.clientX,e.clientY);
});
canvas.addEventListener('pointermove',e=>{
  if(placement.id&&(!pointer||!pointer.orbit))movePointer(e.clientX,e.clientY);
  if(!pointer)return;
  const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
  pointer.moved ||= Math.hypot(e.clientX-pointer.startX,e.clientY-pointer.startY)>5;
  if(pointer.orbit&&pointer.moved){yaw-=dx*.007;pitch=Math.max(.16,Math.min(1.5,pitch+dy*.006));}
  pointer.x=e.clientX;pointer.y=e.clientY;
});
canvas.addEventListener('pointerup',e=>{
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
canvas.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(230,Math.min(1250,distance+e.deltaY*.55));},{passive:false});
function handleKey(e){
  if(e.target.matches('input,select,textarea')||e.target.isContentEditable)return;
  const key=e.key.toLowerCase();
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
  sync,begin,cancel,rotate,tryPlace,resetCamera,
  getHandState:()=>placement.state(),
  setPowered(value){powered=value;},
  toggleExploded(){if(placement.id){hooks.onMessage?.('Devolva a peça à biblioteca antes de abrir a vista explodida.');return exploded;}exploded=!exploded;sync(installedSet,selection);return exploded;}
};
};
