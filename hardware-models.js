/* Reconstruções originais de referências comerciais. Consulte MODEL-REFERENCES.md. */
'use strict';
window.refineHardwareModels=function(api){
const {T,scene,renderer,models,mats,box,cyl,text,wire,mesh,chassis,fans}=api;
// Ambiente de estúdio para reflexos físicos, sem depender de HDRs externos.
const studio=new T.Scene();studio.background=new T.Color(0x333944);
const panel=(x,y,z,w,h,d,color)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({color}));m.position.set(x,y,z);studio.add(m);};
panel(0,500,0,700,10,500,0xffffff);panel(-450,180,0,10,500,500,0x9dafc4);panel(430,220,-150,10,300,180,0xffe1bb);panel(0,120,500,200,250,10,0x777d87);
const pmrem=new T.PMREMGenerator(renderer);const environment=pmrem.fromScene(studio,.04);scene.environment=environment.texture;pmrem.dispose();studio.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
let seed=3407;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function texture(draw,w=1024,h=1024,color=true){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);if(color)t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;}
const brushed=texture((a,w,h)=>{a.fillStyle='#b8b8b8';a.fillRect(0,0,w,h);for(let i=0;i<5000;i++){const v=130+rand()*80;a.strokeStyle=`rgb(${v},${v},${v})`;a.lineWidth=.2+rand()*.6;a.beginPath();const y=rand()*h;a.moveTo(0,y);a.lineTo(w,y);a.stroke();}},512,512,false);
for(const name of ['silver','edge','case']){mats[name].roughnessMap=brushed;mats[name].bumpMap=brushed;mats[name].bumpScale=.025;mats[name].envMapIntensity=.8;}
mats.silver.color.set(0xc2c5c8);mats.silver.roughness=.35;mats.black.color.set(0x25292f);mats.black.roughness=.59;mats.case.color.set(0x292c31);mats.pcb.color.set(0x181e1e);mats.green.color.set(0x20392a);
const satin=new T.MeshStandardMaterial({color:0x373d43,metalness:.7,roughness:.43});const darkMetal=new T.MeshStandardMaterial({color:0x282d34,metalness:.75,roughness:.42});const labelMaterial=new T.MeshStandardMaterial({color:0xe5e5df,roughness:.8});
function rounded(w,h,d,r=.7){r=Math.min(r,w/5,h/5,d/5);w-=2*r;h-=2*r;const s=new T.Shape();const x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);const geo=new T.ExtrudeGeometry(s,{depth:d-2*r,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:r,bevelThickness:r,curveSegments:3});geo.translate(0,0,-d/2+r);geo.computeVertexNormals();return geo;}
const cache=new Map();function rb(g,x,y,z,w,h,d,m='black',r=.7){const k=[w,h,d,r].join(',');if(!cache.has(k))cache.set(k,rounded(w,h,d,r));return mesh(g,cache.get(k),typeof m==='string'?mats[m]:m,x,y,z);}
function plane(g,tex,x,y,z,w,h,orientation='top'){const p=mesh(g,new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:tex,transparent:true,roughness:.65,polygonOffset:true,polygonOffsetFactor:-1}),x,y,z);if(orientation==='top')p.rotation.x=-Math.PI/2;if(orientation==='left')p.rotation.y=-Math.PI/2;if(orientation==='back')p.rotation.y=Math.PI;return p;}
function decal(g,lines,x,y,z,w,h,orientation='top',bg=null){const tex=texture((a,W,H)=>{if(bg){a.fillStyle=bg;a.fillRect(0,0,W,H);}lines.forEach(l=>{a.fillStyle=l.color||'#d8dcdb';a.font=`${l.weight||500} ${l.size||36}px Arial`;a.textAlign=l.align||'left';a.fillText(l.text,l.x||24,l.y||50);});},1024,256);return plane(g,tex,x,y,z,w,h,orientation);}
function instances(g,geometry,material,coords){const m=new T.InstancedMesh(geometry,typeof material==='string'?mats[material]:material,coords.length),dummy=new T.Object3D();coords.forEach((p,i)=>{dummy.position.set(...p);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);});m.instanceMatrix.needsUpdate=true;m.castShadow=false;m.receiveShadow=true;g.add(m);return m;}
function screw(g,x,y,z){cyl(g,x,y,z,2,1.7,'edge',20);box(g,x,y+1,z,2.5,.12,.5,'black');box(g,x,y+1,z,.5,.12,2.5,'black');}
function ring(g,x,y,z,r,t,mat='black'){const m=mesh(g,new T.TorusGeometry(r,t,8,64),mat,x,y,z);m.rotation.x=Math.PI/2;return m;}
function fan(g,x,y,z,r,{vertical=false,brand='',guard=true}={}){
 const root=new T.Group();root.position.set(x,y,z);if(vertical)root.rotation.x=Math.PI/2;g.add(root);
 cyl(root,0,-3,0,r,1,'black',64);
 ring(root,0,1,0,r,1.3,'black');if(guard){ring(root,0,0,0,r+3,2,'black');for(let i=0;i<4;i++){const bar=box(root,0,-1,0,1.8,2,r*1.5,'black');bar.rotation.y=i*Math.PI/2;bar.position.x=Math.sin(i*Math.PI/2)*r*.3;bar.position.z=Math.cos(i*Math.PI/2)*r*.3;}}
 const rotor=new T.Group();root.add(rotor);const s=new T.Shape();s.moveTo(r*.19,0);s.bezierCurveTo(r*.32,-r*.12,r*.61,-r*.37,r*.91,-r*.17);s.bezierCurveTo(r*.99,-r*.04,r*.95,r*.20,r*.85,r*.31);s.bezierCurveTo(r*.67,r*.23,r*.50,r*.08,r*.23,r*.12);s.closePath();const geo=new T.ExtrudeGeometry(s,{depth:1.2,bevelEnabled:true,bevelSize:.4,bevelThickness:.3,bevelSegments:2,steps:1,curveSegments:8});geo.rotateX(-Math.PI/2);const vertices=geo.attributes.position;for(let i=0;i<vertices.count;i++){const xx=vertices.getX(i),zz=vertices.getZ(i);vertices.setY(i,vertices.getY(i)+Math.sin(xx/r*Math.PI)*zz*.15);}vertices.needsUpdate=true;geo.computeVertexNormals();
 for(let i=0;i<9;i++){const blade=mesh(rotor,geo,mats.black,0,1.3,0);blade.rotation.y=i*Math.PI*2/9;}
 const hubRatio=brand==='ASUS'?.29:.25;cyl(rotor,0,2,0,r*hubRatio,5,'black',48);ring(rotor,0,5,0,r*(hubRatio-.01),.5,'edge');
 if(brand==='ASUS'){cyl(rotor,0,5.2,0,r*.25,.4,'edge',48);ring(rotor,0,5.5,0,r*.22,.35,'silver');ring(rotor,0,2,0,r*.96,.9,'black');}
 if(brand)text(rotor,brand,0,brand==='ASUS'?5.6:5.1,0,r*.5,r*.16,'#d6d9d9');fans.push(rotor);return root;
}
function connector(g,x,y,z,rows,cols,spacing=4.1){rb(g,x,y,z,cols*spacing+3,10,rows*spacing+3,'black',.4);const points=[];for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){box(g,x+(i-(cols-1)/2)*spacing,y+5.1,z+(j-(rows-1)/2)*spacing,2.7,.1,2.7,'chip');points.push([x+(i-(cols-1)/2)*spacing,y+5.3,z+(j-(rows-1)/2)*spacing]);}instances(g,new T.BoxGeometry(.8,.3,.8),'gold',points);}
function clear(id){const g=models[id];g.clear();g.rotation.set(0,0,0);return g;}
fans.length=0;
// Gabinete de serviço maior para respeitar o comprimento real da fonte ATX.
chassis.clear();rb(chassis,0,-4,48,322,7,515,'case',1);for(const x of [-158,158]){rb(chassis,x,25,48,5,58,515,'case');rb(chassis,x,55,48,9,3,515,'edge');}rb(chassis,0,42,305,315,94,5,'case');rb(chassis,0,37,-210,315,82,5,'case');for(let i=0;i<30;i++)box(chassis,-140+i*9.6,43,308,3,68,1,'black');for(const x of [-144,144])for(const z of [-193,285]){cyl(chassis,x,-10,z,10,7,'black');screw(chassis,x,1,z);}for(let i=0;i<7;i++){rb(chassis,-156,18+i*10,46,1.5,5,70,'edge',.3);}
let g=clear('board');box(g,-8,12,-15,244,1.6,305,'pcb');
const pcb=texture((a,W,H)=>{
 a.fillStyle='#1b2122';a.fillRect(0,0,W,H);
 for(let i=0;i<600;i++){let x=rand()*W,y=rand()*H;const length=10+rand()*95;a.strokeStyle=i%5?'#313b38':'#424b42';a.lineWidth=.5+rand()*.8;a.beginPath();a.moveTo(x,y);a.lineTo(x+length,y);a.lineTo(x+length+14,y+14);a.lineTo(x+length+14,y+45);a.stroke();}
 for(let i=0;i<900;i++){const x=rand()*W,y=rand()*H;a.fillStyle=i%7?'#59615a':'#a89a71';a.fillRect(x,y,1.4,2.4);if(i%6===0){a.fillStyle='#a8ae9e';a.font='5px monospace';a.fillText('R'+i,x+3,y+3);}}
 a.strokeStyle='#9da7a1';a.lineWidth=1.5;for(let i=0;i<8;i++)a.strokeRect(40+i*130,1190,80,40);
 a.fillStyle='#c7ceca';a.font='bold 24px Arial';a.fillText('MAG B550 TOMAHAWK',400,1440);a.font='12px monospace';a.fillText('MS-7C91   VER: 2.0    AM4',420,1470);
},1220,1525);plane(g,pcb,-8,12.85,-15,244,305);
for(const x of [-125,109])for(const z of [-140,-13,115]){ring(g,x,13,z,3,.6,'silver');screw(g,x,13.8,z);}
// Soquete AM4, matriz de contatos e alavanca de retenção.
rb(g,-48,15.5,-76,53,5,53,'black',.6);rb(g,-48,18.4,-76,46,1,46,'black',.3);const holes=[];for(let row=0;row<25;row++)for(let col=0;col<25;col++)if(!(row>9&&row<15&&col>9&&col<15))holes.push([-69+col*1.75,19,-97+row*1.75]);instances(g,new T.CylinderGeometry(.38,.38,.12,6),'chip',holes);wire(g,[[-19,18,-101],[-15,18,-101],[-15,18,-49],[-20,18,-47]],.7,0xb7bec1);
for(const x of [17,32,47,62]){rb(g,x,16.5,-77,6.8,7,139,'black',.3);box(g,x,20.1,-77,1.2,.3,132,'chip');for(const z of [-147,-7]){rb(g,x,20,z,7.8,8,6,'black',.4);box(g,x,24,z,5.5,.5,3,'edge');}const contacts=[];for(let i=0;i<72;i++)contacts.push([x-1,20,-141+i*1.8],[x+1,20,-141+i*1.8]);instances(g,new T.BoxGeometry(.35,.3,.5),'gold',contacts);}
for(const z of [37,85]){rb(g,-38,17,z,144,9,8,'black',.3);if(z===37){box(g,-38,21.7,z-4.2,141,.5,.6,'silver');box(g,-38,21.7,z+4.2,141,.5,.6,'silver');}box(g,-38,21.6,z,135,.2,1.2,'chip');rb(g,38,19,z,9,10,10,'black',.4);}
for(const z of [59,108])rb(g,-76,16,z,33,5,7,'black',.4);
// Grandes dissipadores cinza e pretos característicos da Tomahawk.
rb(g,-109,27,-97,36,29,103,darkMetal,1.2);rb(g,-46,26,-143,78,25,30,darkMetal,1);for(let i=0;i<10;i++)box(g,-124+i*3.2,42,-97,1.2,.7,90,'edge');decal(g,[{text:'TOMAHAWK',size:53,x:55,y:140}],-109,42,-97,27,85);
rb(g,-8,19,5,89,9,21,satin,1);decal(g,[{text:'M.2 SHIELD FROZR',size:43,x:30,y:140}],-8,23.7,5,79,12);for(const x of [-48,33])screw(g,x,24,5);
rb(g,70,22,94,66,16,49,darkMetal,1);for(let i=0;i<8;i++){const line=box(g,52+i*5,30.3,94,1,.4,45,'edge');line.rotation.y=-.25;}decal(g,[{text:'MSI',size:94,x:150,y:170}],70,31,94,42,19);
for(let i=0;i<14;i++){const x=-106+(i%7)*12,z=-30+Math.floor(i/7)*17;cyl(g,x,19,z,3,11,'silver',20);cyl(g,x,24.6,z,2.8,.2,'black');box(g,x,24.8,z,4,.1,.25,'edge');}
for(let i=0;i<13;i++)rb(g,-104+(i%7)*13,17,-43+Math.floor(i/7)*-81,8,6,7,'chip',.4);
for(let i=0;i<52;i++){const x=-112+(i%13)*16,z=50+Math.floor(i/13)*19;if(x>30)continue;box(g,x,14.2,z,4,2,2,'chip');box(g,x-2.2,14.2,z,.6,1.8,2,'silver');}
connector(g,102,19,-64,2,12);connector(g,-104,19,-143,2,4);for(let i=0;i<3;i++){rb(g,105,18,45+i*14,12,11,12,'black',.4);box(g,111.2,18,45+i*14,.3,6,8,'chip');}
for(const z of [85,105,125]){cyl(g,-111,18,z,3,9,'gold',20);cyl(g,-111,22.7,z,2.8,.3,'black');}cyl(g,-87,16,104,10,3,'silver',40);text(g,'CR2032',-87,17.7,104,15,5,'#555b5c');
for(let i=0;i<5;i++){rb(g,-111+i*22,22,-160,18,19,17,'silver',.5);box(g,-111+i*22,23,-169,13,9,.4,'black');box(g,-111+i*22,23,-169.4,11,3,.2,i<3?'blue':'black');}text(g,'DDR4 BOOST',43,13.1,-153,48,5);text(g,'A2',32,13,-1,9,4);text(g,'B2',62,13,-1,9,4);
// Ryzen 5 5600: substrato, IHS chanfrado, gravação e pinos inferiores.
g=clear('cpu');rb(g,-48,20.5,-76,40,1.3,40,'green',.25);rb(g,-48,22.5,-76,37.5,2.6,37.5,'silver',.9);decal(g,[{text:'AMD Ryzen 5 5600',size:65,x:45,y:73,color:'#4f5457'},{text:'RYZEN',size:100,x:200,y:180,color:'#53595b'},{text:'100-000000927   AM4',size:26,x:180,y:227,color:'#63696a'}],-48,23.9,-76,33,30);const pins=[];for(let row=0;row<25;row++)for(let col=0;col<25;col++)if(!(row>9&&row<15&&col>9&&col<15))pins.push([-65.4+col*1.45,18.8,-93.4+row*1.45]);instances(g,new T.CylinderGeometry(.18,.18,2.1,5),'gold',pins);const triangle=new T.Shape();triangle.moveTo(0,0);triangle.lineTo(2.3,0);triangle.lineTo(0,2.3);triangle.closePath();const marker=mesh(g,new T.ShapeGeometry(triangle),'gold',-66,21.3,-94);marker.rotation.x=-Math.PI/2;
// Wraith Stealth: aletas radiais e ventoinha de pás curvas.
g=clear('cooler');cyl(g,-48,28,-76,18,6,'silver',48);for(let i=0;i<64;i++){const a=i*Math.PI*2/64,fin=box(g,-48+Math.sin(a)*27,39,-76+Math.cos(a)*27,.65,21,28,'silver');fin.rotation.y=a;}fan(g,-48,55,-76,38,{brand:'AMD'});for(const x of [-83,-13])for(const z of [-111,-41]){rb(g,x,36,z,9,11,9,'black');cyl(g,x,42,z,2,11,'silver',16);screw(g,x,48,z);}wire(g,[[-10,58,-76],[0,45,-55],[3,19,-12]],.8,0x25292e);
// Kingston FURY Beast: envelope 133,35 × 34 × 7,2 mm, assimetria e contatos separados.
g=clear('ram');for(const x of [32,62]){
 box(g,x,35,-77,1.4,30,133.35,'pcb');for(let i=0;i<8;i++)rb(g,x-1.5,35,-132+i*16,1.4,10,12,'chip',.2);
 for(let i=0;i<144;i++){const z=-142.3+i*.91;if(Math.abs(z+80)<1.5)continue;box(g,x-.82,21.4,z,.2,4,.53,'gold');box(g,x+.82,21.4,z,.2,4,.53,'gold');}
 for(const sign of [-1,1]){rb(g,x+sign*2.5,38,-77,2.2,24,130,'black',.6);for(let i=0;i<7;i++){const rib=rb(g,x+sign*3.65,40,-128+i*16,.5,14,4,darkMetal,.1);rib.rotation.x=.18;}const logo=decal(g,[{text:'FURY',size:128,x:50,y:145},{text:'BEAST',size:55,x:610,y:140},{text:'KINGSTON',size:24,x:60,y:200}],x+sign*3.75,39,-77,112,20,sign<0?'left':'left');logo.rotation.z=Math.PI/2;if(sign>0)logo.rotation.y=Math.PI/2;}
 rb(g,x,51.5,-84,7.2,3,108,'black',.5);rb(g,x,49.5,-19,7.2,3,16,'black',.5);
}
// WD_BLACK SN770 : PCB 2280, contrôleur et étiquette imprimée d'origine.
g=clear('ssd');rb(g,-40,17,61,80,1,22,'pcb',.3);for(let i=0;i<3;i++)rb(g,-61+i*22,18.2,61,18,1.6,17,'chip',.2);decal(g,[{text:'WD_BLACK',size:75,x:28,y:90},{text:'SN770  NVMe SSD',size:44,x:28,y:156},{text:'1TB',size:100,x:740,y:160},{text:'PCIe Gen4 x4    WDS100T3X0E',size:24,x:28,y:216}],-40,19.1,61,69,18,'top','#191b1c');for(let i=0;i<22;i++)box(g,-.5,17,51+i*.86,3,.3,.45,'gold');screw(g,-77,19,61);
// Corsair CX650, châssis fermé, grille, entrée secteur et étiquette latérale.
g=clear('psu');rb(g,65,44,221,150,86,140,'case',1.2);fan(g,65,87,221,56,{brand:'CORSAIR',guard:false});for(let i=0;i<9;i++)ring(g,65,94,221,14+i*5.2,.65,'edge');for(const x of [3,127])for(const z of [162,280])screw(g,x,89,z);
const psuLabel=[{text:'CORSAIR',size:48,x:40,y:65},{text:'CX650',size:126,x:40,y:188},{text:'650 W  /  80 PLUS BRONZE',size:25,x:40,y:235}];decal(g,psuLabel,65,44,291.3,131,65,'front','#272b30');decal(g,[{text:'CX650',size:100,x:190,y:145}],-10.4,44,220,100,40,'left','#272b30');rb(g,111,44,291.7,24,18,2,'black',.3);box(g,112,44,293,14,9,.5,'chip');rb(g,133,44,292,10,15,2,'black',.3);text(g,'I / O',133,88,280,12,5);
// ASUS Dual RTX 4060 OC : 227,2 × 123,24 × 49,6 mm, carte verticale sur PCIe.
g=clear('gpu');const cardX=-20,cardZ=37,baseY=22.2;
rb(g,cardX,baseY+62,cardZ,219,113,1.5,'pcb',.4);rb(g,cardX,baseY+64,cardZ-3,224,116,2,darkMetal,.8);
for(let i=0;i<84;i++){const x=-99+i*1.65;if(x>-84&&x<-80)continue;box(g,x,25,cardZ+.9,1.03,5.5,.2,'gold');}
for(let i=0;i<59;i++)box(g,-128+i*3.65,baseY+64,cardZ+20,.6,91,28,'silver');
for(const yy of [56,78,104])wire(g,[[-122,yy,49],[-110,yy+4,56],[75,yy+4,56],[86,yy,49]],1.6,0x979d9d);
const outline=new T.Shape();outline.moveTo(-109,-57);outline.lineTo(108,-57);outline.lineTo(113,-48);outline.lineTo(113,48);outline.lineTo(104,59);outline.lineTo(-105,59);outline.lineTo(-114,49);outline.lineTo(-114,-48);outline.closePath();for(const x of [-57,57]){const h=new T.Path();h.absarc(x,0,44,0,Math.PI*2,true);outline.holes.push(h);}const shroud=new T.ExtrudeGeometry(outline,{depth:3,bevelEnabled:true,bevelSize:1,bevelThickness:.8,bevelSegments:2,curveSegments:48});mesh(g,shroud,mats.black,-20,baseY+62,cardZ+43);
fan(g,-77,baseY+62,cardZ+45,42,{vertical:true,brand:'ASUS',guard:false});fan(g,37,baseY+62,cardZ+45,42,{vertical:true,brand:'ASUS',guard:false});
const facePaint=texture((a,W,H)=>{
 const path=(points,fill,stroke=null)=>{a.beginPath();points.forEach((p,i)=>i?a.lineTo(...p):a.moveTo(...p));a.closePath();a.fillStyle=fill;a.fill();if(stroke){a.strokeStyle=stroke;a.lineWidth=3;a.stroke();}};
 path([[0,0],[790,0],[1020,240],[1160,880],[1320,H],[200,H],[0,760]],'#343a40');
 path([[810,0],[W-55,0],[W,100],[W,350],[1170,350]],'#242b31');
 path([[20,700],[340,H-20],[20,H-20]],'#7b8589');
 path([[1120,380],[W-30,380],[W-30,H-28],[1320,H-28],[1080,770]],'#394147');
 path([[30,340],[880,340],[1070,915],[1300,H-35],[W-70,H-35]],'#30383e','#879197');
 a.strokeStyle='#7a858a';a.lineWidth=5;a.beginPath();a.moveTo(35,40);a.lineTo(780,40);a.lineTo(1010,285);a.moveTo(1270,30);a.lineTo(W-110,30);a.lineTo(W-25,115);a.stroke();
 a.fillStyle='#afb7b9';a.textAlign='center';a.font='28px monospace';a.fillText('D U A L',1050,770);a.font='bold 66px Arial';a.fillText('ASUS',165,960);
 a.strokeStyle='#a3afb0';a.lineWidth=3;a.beginPath();a.moveTo(955,500);a.lineTo(990,680);a.lineTo(1100,680);a.stroke();
 a.globalCompositeOperation='destination-out';for(const xx of [512,1536]){a.beginPath();a.ellipse(xx,H/2,44/228*W,44/116*H,0,0,Math.PI*2);a.fill();}a.globalCompositeOperation='source-over';
},2048,1024);plane(g,facePaint,-20,baseY+62,cardZ+47.1,228,116,'front');
rb(g,cardX,baseY+122,cardZ+21,227.2,3,49.6,darkMetal,.5);decal(g,[{text:'GEFORCE RTX',size:90,x:160,y:170}],cardX,baseY+123.7,cardZ+21,119,17);decal(g,[{text:'ASUS DUAL',size:75,x:110,y:150}],cardX,baseY+8,cardZ+47,90,10,'front');
for(const x of [-127,87])for(const y of [baseY+10,baseY+114]){const s=cyl(g,x,y,cardZ+48,1.5,1,'edge',16);s.rotation.x=Math.PI/2;}
rb(g,-136,baseY+61,cardZ+21,2.2,123.24,49.6,'silver',.4);for(let i=0;i<4;i++){rb(g,-137.4,baseY+16+i*23,cardZ+17,1,12,18,'black',.3);box(g,-138.1,baseY+16+i*23,cardZ+17,.3,7,12,'chip');}connector(g,70,baseY+114,cardZ+26,2,4);
// Les câbles suivent maintenant le connecteur supérieur de la carte verticale.
g=clear('cables');for(let i=0;i<12;i++)wire(g,[[124+i*.6,40,154],[143+i*.4,48,100],[133+i*.3,43,-10],[101+(i%2)*3,31,-84+(i%6)*8]],1.05,0x24282b);for(let i=0;i<8;i++)wire(g,[[122+i,40,156],[149+i*.6,62,-15],[130+i,52,-154],[-113+(i%4)*4,28,-145+(i%2)*4]],.9,0x252a2c);for(let i=0;i<8;i++)wire(g,[[113+i,41,156],[114+i,170,118],[70+(i%4)*4,149,60+(i%2)*4]],1.15,0x24292c);connector(g,102,29,-64,2,12);connector(g,70,143,63,2,4);
return {environment};
};
