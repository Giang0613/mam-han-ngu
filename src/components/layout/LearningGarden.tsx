'use client';
import {useEffect,useRef,useState} from 'react';
import type {GardenRenderer} from './garden-renderer';

function GardenStill(){return <svg className="garden-still" viewBox="0 0 600 440" fill="none" aria-hidden="true">
 <ellipse cx="306" cy="354" rx="214" ry="39" fill="#b2bea5" opacity=".16"/>
 <circle cx="240" cy="109" r="57" fill="#e7d6ab"/>
 <path d="M98 297 274 218 501 283 325 380Z" fill="#9eae92"/>
 <path d="M98 282 274 203 501 268 325 365Z" fill="#e8e4cb"/>
 <path d="m183 288 96-43 117 32-104 49Z" fill="#a8cbbb"/>
 <path d="M309 209v73m98-57v70m-135-40 115 31" stroke="#9b5a40" strokeWidth="7"/>
 <path d="m255 204 103-79 113 112-119-24Z" fill="#265b48"/>
 <path d="m255 204 97 9 119 24" stroke="#c3a277" strokeWidth="5"/>
 <path d="m312 147 46-51 61 69-61-12Z" fill="#285a46"/>
 <path d="m312 147 46 6 61 12" stroke="#c3a277" strokeWidth="4"/>
 <path d="M151 259v-99l55 17v102Z" fill="#285a46"/>
 <path d="m151 160 55 17m-56-5 48 15" stroke="#bea06a" strokeWidth="4"/>
 <text x="170" y="233" fill="#eddbad" fontSize="43" fontFamily="KaiTi,serif" transform="rotate(16 170 233)">学</text>
 <ellipse cx="440" cy="212" rx="36" ry="15" fill="#658260"/><ellipse cx="463" cy="229" rx="31" ry="14" fill="#3a664e"/>
 <path d="M449 227v67" stroke="#7e6a4b" strokeWidth="6"/>
 <path d="M233 307q48-52 104-8" stroke="#e9dfbe" strokeWidth="12"/>
 </svg>;}

export function LearningGarden(){
 const host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 const [state,setState]=useState<'loading'|'ready'|'unavailable'>('loading');
 useEffect(()=>{
  const element=host.current,target=canvas.current;if(!element||!target)return;
  let renderer:GardenRenderer|undefined,disposed=false,visible=true,lost=false,rendered=false,frame=0,last=0,x=0,y=0;
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  const schedule=()=>{if(!disposed&&renderer&&visible&&!document.hidden&&!lost&&!frame)frame=requestAnimationFrame(draw);};
  function draw(time:number){frame=0;if(disposed||!renderer||document.hidden||!visible||lost)return;
   if(time-last>=32||preference.matches){try{renderer.render(time,x,y,!preference.matches);}catch{lost=true;setState('unavailable');return;}last=time;if(!rendered){rendered=true;setState('ready');}}
   if(!preference.matches)schedule();
  }
  const resize=()=>{const bounds=element.getBoundingClientRect();renderer?.resize(Math.max(1,bounds.width),Math.max(1,bounds.height));last=0;schedule();};
  const stop=()=>{if(frame)cancelAnimationFrame(frame);frame=0;};
  const visibility=()=>{if(document.hidden)stop();else{last=0;schedule();}};
  const pointer=(event:PointerEvent)=>{if(preference.matches||event.pointerType==='touch')return;const bounds=element.getBoundingClientRect();x=(event.clientX-bounds.left)/bounds.width*2-1;y=(event.clientY-bounds.top)/bounds.height*2-1;schedule();};
  const leave=()=>{x=0;y=0;schedule();};
  const motion=()=>{leave();stop();last=0;schedule();};
  const contextLost=(event:Event)=>{event.preventDefault();lost=true;rendered=false;stop();if(!disposed)setState('unavailable');};
  const contextRestored=()=>{lost=false;last=0;schedule();};
  const observer=new ResizeObserver(resize);observer.observe(element);
  const intersection=new IntersectionObserver(([entry])=>{visible=entry?.isIntersecting??true;if(!visible)stop();else{last=0;schedule();}});intersection.observe(element);
  target.addEventListener('pointermove',pointer,{passive:true});target.addEventListener('pointerleave',leave);
  target.addEventListener('webglcontextlost',contextLost);target.addEventListener('webglcontextrestored',contextRestored);
  document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',leave);preference.addEventListener('change',motion);
  import('./garden-renderer').then(module=>{if(disposed)return;renderer=module.createGardenRenderer(target);resize();}).catch(()=>{if(!disposed)setState('unavailable');});
  return()=>{disposed=true;stop();observer.disconnect();intersection.disconnect();target.removeEventListener('pointermove',pointer);target.removeEventListener('pointerleave',leave);target.removeEventListener('webglcontextlost',contextLost);target.removeEventListener('webglcontextrestored',contextRestored);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',leave);preference.removeEventListener('change',motion);renderer?.dispose();};
 },[]);
 return <div className="garden-scene" ref={host} data-state={state} aria-hidden="true"><GardenStill/><canvas ref={canvas} className="garden-canvas"/><span className="garden-scene-caption" lang="zh-Hans" translate="no">学而时习之</span></div>;
}
