import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export type GardenRenderer={resize:(width:number,height:number)=>void;render:(time:number,x:number,y:number,motion:boolean)=>void;dispose:()=>void};

/** An original miniature Chinese study garden. All geometry and textures are
 * authored here; no external models, image downloads, or postprocessing passes. */
export function createGardenRenderer(canvas:HTMLCanvasElement):GardenRenderer{
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 const scene=new THREE.Scene();scene.fog=new THREE.Fog('#f3f0e5',23,45);
 const camera=new THREE.OrthographicCamera(-6,6,4.5,-4.5,.1,80);
 camera.position.set(11,9,13);camera.lookAt(0,1.1,0);
 scene.add(new THREE.HemisphereLight('#fff6de','#809e8a',3));
 const sunlight=new THREE.DirectionalLight('#fff0cd',4.2);sunlight.position.set(-5,11,7);sunlight.castShadow=true;
 sunlight.shadow.mapSize.set(1024,1024);Object.assign(sunlight.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:1,far:28});
 sunlight.shadow.normalBias=.035;sunlight.shadow.bias=-.0002;scene.add(sunlight);
 const garden=new THREE.Group();garden.rotation.y=-.13;scene.add(garden);
 const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();
 const geometry=<T extends THREE.BufferGeometry>(value:T)=>{geometries.add(value);return value;};
 const material=(color:string,metalness=0)=>{const value=new THREE.MeshStandardMaterial({color,roughness:.74,metalness});materials.add(value);return value;};
 const palette={stone:material('#eee6ce'),edge:material('#c7c9aa'),earth:material('#8b9b7d'),jade:material('#205a47'),roof:material('#244f40'),gold:material('#c3a16b',.2),red:material('#a7533c'),trunk:material('#785f46'),leaf:material('#4e7752'),leafLight:material('#77955f'),water:material('#6eab9d')};
 const cube=geometry(new THREE.BoxGeometry(1,1,1)),sphere=geometry(new THREE.SphereGeometry(1,14,9));
 const cylinder=geometry(new THREE.CylinderGeometry(1,1,1,12)),rock=geometry(new THREE.DodecahedronGeometry(1,0));
 function mesh(shape:THREE.BufferGeometry,surface:THREE.Material,parent:THREE.Object3D=garden){const m=new THREE.Mesh(shape,surface);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(x:number,y:number,z:number,w:number,h:number,d:number,surface:THREE.Material,parent:THREE.Object3D=garden){const m=mesh(cube,surface,parent);m.position.set(x,y,z);m.scale.set(w,h,d);return m;}
 function rod(x:number,y:number,z:number,r:number,h:number,surface:THREE.Material,parent:THREE.Object3D=garden){const m=mesh(cylinder,surface,parent);m.position.set(x,y,z);m.scale.set(r,h,r);return m;}
 function tube(points:THREE.Vector3[],radius:number,surface:THREE.Material,parent:THREE.Object3D=garden){return mesh(geometry(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,radius,6,false)),surface,parent);}
 function islandShape(){const s=new THREE.Shape();s.moveTo(-4.1,-1.8);s.bezierCurveTo(-4.8,-.5,-4.6,1.7,-3.1,2.5);s.bezierCurveTo(-1.4,3.5,1.3,3.3,3.4,2);s.bezierCurveTo(4.7,1.1,4.6,-1.2,3.1,-2.3);s.bezierCurveTo(1.7,-3.2,-2.8,-3.1,-4.1,-1.8);return s;}
 const islandGeo=geometry(new THREE.ExtrudeGeometry(islandShape(),{depth:.48,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.19,bevelThickness:.12,curveSegments:28}));
 const base=mesh(islandGeo,palette.earth);base.rotation.x=-Math.PI/2;base.position.y=-.74;
 const ledge=mesh(islandGeo,palette.edge);ledge.rotation.x=-Math.PI/2;ledge.position.y=-.55;ledge.scale.set(1.02,1.02,.42);
 const land=mesh(geometry(new THREE.ShapeGeometry(islandShape(),28)),palette.stone);land.rotation.x=-Math.PI/2;land.position.y=.065;land.receiveShadow=true;
 // The pond, ripples, and a small arched stone bridge.
 const pondShape=new THREE.Shape();pondShape.moveTo(-2.5,1);pondShape.bezierCurveTo(-2.3,-.2,-.6,-.8,.8,-.1);pondShape.bezierCurveTo(2.8,.2,3.7,1.1,2.7,1.9);pondShape.bezierCurveTo(.9,2.6,-2.3,2.9,-2.5,1);
 const pondOutline=new THREE.Shape(pondShape.getPoints(36).map(point=>new THREE.Vector2(point.x,-point.y)));
 const pond=mesh(geometry(new THREE.ShapeGeometry(pondOutline,36)),palette.water);pond.rotation.x=-Math.PI/2;pond.position.set(.1,.092,.1);pond.receiveShadow=true;
 const rippleMaterial=new THREE.MeshBasicMaterial({color:'#d8ead4',transparent:true,opacity:.6,side:THREE.DoubleSide});materials.add(rippleMaterial);
 for(const [x,z,r]of [[1.7,1.25,.29],[1.7,1.25,.46],[-1.7,1.8,.25]]){const ring=mesh(geometry(new THREE.TorusGeometry(r,.012,5,44)),rippleMaterial);ring.rotation.x=Math.PI/2;ring.position.set(x,.105,z);ring.castShadow=false;}
 const bridge=new THREE.Group();bridge.position.set(-.65,.14,1.45);bridge.rotation.y=-.3;garden.add(bridge);
 for(let i=0;i<13;i++){const x=(i-6)*.18,y=.12+.46*(1-(x/1.2)**2);box(x,y,0,.19,.12,.8,palette.stone,bridge);}
 for(const z of [-.48,.48]){
  const points=Array.from({length:9},(_,i)=>{const x=(i-4)*.28;return new THREE.Vector3(x,.6+.4*(1-(x/1.2)**2),z);});tube(points,.035,palette.gold,bridge);
  for(const x of [-1.05,-.5,0,.5,1.05])rod(x,.36+.44*(1-(x/1.2)**2),z,.035,.55,palette.stone,bridge);
 }
 // A Chinese garden pavilion with curved eaves and a second roof tier.
 const pavilion=new THREE.Group();pavilion.position.set(1.15,.13,-.9);pavilion.rotation.y=.1;garden.add(pavilion);
 box(0,.12,0,2.85,.24,2.4,palette.edge,pavilion);box(0,.28,0,2.6,.12,2.2,palette.stone,pavilion);
 for(const [w,y,z]of [[2.25,.08,1.5],[1.9,.16,1.32],[1.6,.25,1.17]])box(0,y,z,w,.14,.4,palette.stone,pavilion);
 for(const x of [-.98,.98])for(const z of [-.78,.78]){rod(x,1.32,z,.075,2.02,palette.red,pavilion);rod(x,.41,z,.14,.2,palette.gold,pavilion);box(x,2.28,z,.26,.13,.25,palette.gold,pavilion);}
 for(const z of [-.8,.8])box(0,2.22,z,2.15,.13,.13,palette.red,pavilion);
 for(const x of [-1.02,1.02])box(x,2.22,0,.13,.13,1.65,palette.red,pavilion);
 function roof(width:number,depth:number,y:number,height:number){
  const grid=22,vertices:number[]=[],indices:number[]=[];
  const roofHeight=(u:number,v:number)=>height*(1-Math.max(Math.abs(u),Math.abs(v)))+.25*Math.pow(Math.abs(u*v),3);
  for(let j=0;j<=grid;j++)for(let i=0;i<=grid;i++){const u=i/grid*2-1,v=j/grid*2-1;vertices.push(u*width/2,roofHeight(u,v),v*depth/2);}
  for(let j=0;j<grid;j++)for(let i=0;i<grid;i++){const a=j*(grid+1)+i,b=a+1,c=a+grid+1,d=c+1;indices.push(a,c,b,b,c,d);}
  const shape=new THREE.BufferGeometry();shape.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));shape.setIndex(indices);shape.computeVertexNormals();geometry(shape);
  const m=mesh(shape,palette.roof,pavilion);m.position.y=y;
  for(const side of [-1,1]){
   tube(Array.from({length:13},(_,i)=>{const u=i/6-1;return new THREE.Vector3(u*width/2,y+roofHeight(u,side),side*depth/2);}),.035,palette.gold,pavilion);
   tube(Array.from({length:13},(_,i)=>{const v=i/6-1;return new THREE.Vector3(side*width/2,y+roofHeight(side,v),v*depth/2);}),.035,palette.gold,pavilion);
  }
  // Roof seams follow the curved surface, retaining detail in the small view.
  for(let i=-5;i<=5;i++){const u=i/6;tube(Array.from({length:9},(_,j)=>{const v=j/4-1;return new THREE.Vector3(u*width/2,y+roofHeight(u,v)+.012,v*depth/2);}),.011,palette.jade,pavilion);}
 }
 roof(3.6,3.1,2.36,.68);roof(1.95,1.75,3.1,.44);rod(0,3.72,0,.045,.38,palette.gold,pavilion);
 const finial=mesh(sphere,palette.gold,pavilion);finial.scale.setScalar(.11);finial.position.y=3.95;
 const lanternMaterial=material('#e6b568');lanternMaterial.emissive.set('#bb732c');lanternMaterial.emissiveIntensity=.4;
 for(const x of [-.78,.78]){const lantern=mesh(sphere,lanternMaterial,pavilion);lantern.position.set(x,1.93,.84);lantern.scale.set(.12,.17,.12);rod(x,1.71,.84,.015,.12,palette.gold,pavilion);}
 const glow=new THREE.PointLight('#ffd58d',3.5,4,2);glow.position.set(0,1.8,.2);pavilion.add(glow);
 // A circular moon gate: traditional garden geometry, distinct from the roof.
 const gate=new THREE.Group();gate.position.set(-2.18,1.13,-1.25);gate.rotation.y=.2;garden.add(gate);
 mesh(geometry(new THREE.TorusGeometry(.96,.13,10,56)),palette.stone,gate);
 for(const x of [-.7,.7])box(x,-.94,0,.42,.23,.48,palette.edge,gate);
 // Study steles are authored textures, not HTML text captured from the page.
 function glyphTexture(char:string,reading:string){const surface=document.createElement('canvas');surface.width=512;surface.height=768;const ctx=surface.getContext('2d')!;ctx.strokeStyle='#d3bc8170';ctx.lineWidth=4;ctx.strokeRect(30,30,452,708);ctx.fillStyle='#f4e8bc';ctx.textAlign='center';ctx.font='340px KaiTi, STKaiti, "Microsoft YaHei", serif';ctx.fillText(char,256,465);ctx.font='32px Georgia, serif';ctx.fillStyle='#e3d3a8';ctx.fillText(reading,256,610);const texture=new THREE.CanvasTexture(surface);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());textures.add(texture);return texture;}
 function stele(char:string,reading:string,x:number,z:number,scale:number,angle:number){const group=new THREE.Group();group.position.set(x,.15,z);group.rotation.y=angle;group.scale.setScalar(scale);garden.add(group);box(0,.08,0,1.5,.16,.8,palette.edge,group);box(0,1.12,0,1.25,2,.36,palette.jade,group);box(0,2.16,0,1.37,.1,.48,palette.gold,group);const face=new THREE.MeshBasicMaterial({map:glyphTexture(char,reading),transparent:true,depthWrite:false});materials.add(face);const inscription=mesh(geometry(new THREE.PlaneGeometry(1.22,1.96)),face,group);inscription.position.set(0,1.12,.187);inscription.castShadow=false;return group;}
 stele('学','xué',-2.8,.8,1,.37);stele('习','xí',-3.25,-.1,.72,.2);
 // Sculpted pine canopies and slender bamboo use shared primitive geometries.
 const foliage=geometry(new THREE.IcosahedronGeometry(1,1));
 function pine(x:number,z:number,size:number,lean:number){const tree=new THREE.Group();tree.position.set(x,.12,z);tree.rotation.z=lean;garden.add(tree);rod(0,.75*size,0,.085*size,1.5*size,palette.trunk,tree);for(let i=0;i<3;i++){const branch=box((i-1)*.27*size,(1+i*.2)*size,0,.7*size,.055*size,.05*size,palette.trunk,tree);branch.rotation.z=(i-1)*.25;const crown=mesh(foliage,i===1?palette.leafLight:palette.leaf,tree);crown.position.set((i-1)*.34*size,(1.3+i*.17)*size,0);crown.scale.set(.65*size,.31*size,.48*size);}}
 pine(3.3,-.8,1.05,-.07);pine(2.8,-2,1.2,.1);pine(-3.5,-1.5,1.1,-.15);pine(3.2,1.35,.63,.12);
 const bamboo=new THREE.Group();bamboo.position.set(-.35,.12,-2.1);garden.add(bamboo);
 for(let i=0;i<9;i++){const x=(i%3)*.18,z=Math.floor(i/3)*.2,height=1.15+(i%4)*.24;rod(x,height/2,z,.028,height,palette.leaf,bamboo);for(let j=1;j<4;j++){rod(x,height*j/4,z,.038,.035,palette.leafLight,bamboo);const leaf=mesh(sphere,palette.leaf,bamboo);leaf.position.set(x+(j%2?-.16:.16),height*j/4+.08,z);leaf.scale.set(.24,.035,.075);leaf.rotation.z=j%2?-.45:.45;}}
 for(const [x,z,s]of [[3.35,.35,.36],[-3.9,.1,.4],[2.7,2,.22],[-1.15,-2.4,.31]]){const stone=mesh(rock,palette.edge);stone.position.set(x,s*.55,z);stone.scale.set(s,.85*s,.72*s);stone.rotation.set(.3,x,.2);}
 for(let i=0;i<6;i++){const step=mesh(cylinder,palette.edge);step.position.set(-1.6+i*.46,.108,-.05-i*.13);step.scale.set(.18,.055,.14);}
 // Small lily pads keep the water legible without a costly reflective pass.
 for(const [x,z]of [[1.8,1.6],[2.2,1.25],[-1.7,1.9]]){const lily=mesh(cylinder,palette.leafLight);lily.scale.set(.18,.02,.14);lily.position.set(x,.115,z);}
 const moonMaterial=new THREE.MeshBasicMaterial({color:'#e0c48d',fog:false});materials.add(moonMaterial);
 const moon=mesh(geometry(new THREE.CircleGeometry(.82,64)),moonMaterial);moon.position.set(-1.6,3.65,-3);moon.quaternion.copy(camera.quaternion);moon.castShadow=false;moon.receiveShadow=false;
 const cloudMaterial=material('#f5f2e5');const cloud=new THREE.Group();cloud.position.set(2.5,4,-2.4);garden.add(cloud);
 for(let i=0;i<3;i++){const m=mesh(sphere,cloudMaterial,cloud);m.position.x=(i-1)*.48;m.scale.set(.55,.14+(i===1?.1:0),.2);m.castShadow=false;}
 const shadowMaterial=new THREE.ShadowMaterial({color:'#576d51',opacity:.16});materials.add(shadowMaterial);
 const shadow=mesh(geometry(new THREE.PlaneGeometry(28,22)),shadowMaterial,scene);shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.12;shadow.castShadow=false;
 // Bake static local transforms and merge by material. Keep the cloud and
 // transparent inscriptions separate; the garden still moves as one object.
 garden.updateMatrixWorld(true);
 const inverseGarden=garden.matrixWorld.clone().invert();
 const batches=new Map<string,{surface:THREE.Material;cast:boolean;receive:boolean;parts:THREE.BufferGeometry[];objects:THREE.Mesh[]}>();
 garden.traverse(object=>{
  if(!(object instanceof THREE.Mesh)||object.parent===cloud||Array.isArray(object.material)||object.material.transparent)return;
  const key=object.material.uuid+Number(object.castShadow)+Number(object.receiveShadow);
  let batch=batches.get(key);if(!batch){batch={surface:object.material,cast:object.castShadow,receive:object.receiveShadow,parts:[],objects:[]};batches.set(key,batch);}
  const part=object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone();
  part.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverseGarden,object.matrixWorld));
  batch.parts.push(part);batch.objects.push(object);
 });
 for(const batch of batches.values()){
  const combined=mergeGeometries(batch.parts,false);
  if(combined){geometry(combined);const object=mesh(combined,batch.surface);object.castShadow=batch.cast;object.receiveShadow=batch.receive;for(const old of batch.objects)old.removeFromParent();}
  for(const part of batch.parts)part.dispose();
 }
 let rotationX=0,rotationY=0,dead=false;
 return {
  resize(width,height){if(dead)return;const aspect=Math.max(.5,width/Math.max(1,height)),view=aspect<1.25?10.6:9.5;camera.left=-view*aspect/2;camera.right=view*aspect/2;camera.top=view/2;camera.bottom=-view/2;camera.updateProjectionMatrix();const pixelBudget=1_600_000;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75,Math.sqrt(pixelBudget/Math.max(1,width*height))));renderer.setSize(width,height,false);},
  render(time,x,y,motion){if(dead)return;if(motion){rotationX+=(y*.035-rotationX)*.07;rotationY+=(x*.13-rotationY)*.07;}else{rotationX=0;rotationY=0;}garden.rotation.set(rotationX,-.13+rotationY,0);cloud.position.y=4+(motion?Math.sin(time*.0004)*.045:0);renderer.render(scene,camera);const calls=String(renderer.info.render.calls),triangles=String(renderer.info.render.triangles);if(canvas.dataset.drawCalls!==calls)canvas.dataset.drawCalls=calls;if(canvas.dataset.triangles!==triangles)canvas.dataset.triangles=triangles;},
  dispose(){if(dead)return;dead=true;for(const item of geometries)item.dispose();for(const item of materials)item.dispose();for(const item of textures)item.dispose();sunlight.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();},
 };
}
