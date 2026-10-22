'use client';
import {useEffect,useRef} from 'react';
import type {PointerEvent} from 'react';

/** Original CSS 3D study object: layered geometry, one light source, no canvas.
 * Text, navigation, and learning controls remain outside the decorative scene. */
export function LearningSculpture(){
 const scene=useRef<HTMLDivElement>(null),canMove=useRef(false);
 useEffect(()=>{
  const preference=window.matchMedia('(prefers-reduced-motion: no-preference) and (hover: hover)');
  const reset=()=>{scene.current?.style.setProperty('--tilt-x','0deg');scene.current?.style.setProperty('--tilt-y','0deg');};
  const update=()=>{canMove.current=preference.matches&&!document.hidden;if(!canMove.current)reset();};
  update();preference.addEventListener('change',update);document.addEventListener('visibilitychange',update);
  return()=>{preference.removeEventListener('change',update);document.removeEventListener('visibilitychange',update);};
 },[]);
 function move(event:PointerEvent<HTMLDivElement>){
  if(!canMove.current||event.pointerType==='touch')return;
  const bounds=event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--tilt-y',`${((event.clientX-bounds.left)/bounds.width-.5)*12}deg`);
  event.currentTarget.style.setProperty('--tilt-x',`${(.5-(event.clientY-bounds.top)/bounds.height)*9}deg`);
 }
 function reset(){scene.current?.style.setProperty('--tilt-x','0deg');scene.current?.style.setProperty('--tilt-y','0deg');}
 return <div className="learning-sculpture" ref={scene} aria-hidden="true" onPointerMove={move} onPointerLeave={reset}>
  <div className="sculpture-halo"/>
  <div className="sculpture-world">
   <div className="sculpture-plinth"><span/></div>
   <div className="sculpture-card sculpture-card-back"><span>习</span><i/><i/><i/></div>
   <div className="sculpture-card sculpture-card-front"><small>01 / 每天</small><span>学</span><div className="sculpture-reading">xué · learn</div><i/></div>
   <div className="sculpture-seal">中</div>
  </div>
  <div className="sculpture-orbit"><span/><span/><span/></div>
 </div>;
}
