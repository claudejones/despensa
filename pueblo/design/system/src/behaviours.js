/* Shapes: Pueblo's own polar shapes, every one sampled at the same point count so any two morph with a clip-path transition.
   Not the Material shape library (Google does not publish it for web); drawn in its manner. */
(function(){
var N=96;
function tri(x){x=x/(2*Math.PI);x=x-Math.floor(x);return 1-4*Math.abs(x-0.5);}
var F={
 circle:function(a){return 1;},
 squircle:function(a){var c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));return Math.min(1.16,1/Math.pow(Math.pow(c,4)+Math.pow(s,4),0.25))*0.86;},
 clover:function(a){return 0.86+0.14*Math.cos(4*a);},
 flower:function(a){return 0.72+0.28*Math.abs(Math.cos(3*a));},
 cookie:function(a){return 0.91+0.09*Math.cos(9*a);},
 sunny:function(a){return 0.86+0.14*tri(12*a);},
 burst:function(a){return 0.78+0.22*tri(8*a);}
};
function shape(name){var f=F[name]||F.circle,p=[];for(var i=0;i<N;i++){var a=i/N*2*Math.PI-Math.PI/2,r=f(a)*50;p.push((50+r*Math.cos(a)).toFixed(2)+"% "+(50+r*Math.sin(a)).toFixed(2)+"%");}return "polygon("+p.join(",")+")";}
function applyShapes(root){(root||document).querySelectorAll("[data-shape]").forEach(function(el){el.style.clipPath=shape(el.getAttribute("data-shape"));});}
var P=window.Pueblo;
P.shape=shape;P.shapes=Object.keys(F);P.applyShapes=applyShapes;
P.MASTERY=[{id:"new",label:"New",shape:"circle"},{id:"learning",label:"Learning",shape:"clover"},{id:"familiar",label:"Familiar",shape:"cookie"},{id:"known",label:"Known",shape:"sunny"}];

/* Speech: the device's Spanish voice. Quality varies by phone. */
P.speak=function(text,rate){if(!window.speechSynthesis)return false;speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(text);
 var v=speechSynthesis.getVoices().filter(function(x){return /^es/i.test(x.lang);});var mx=v.filter(function(x){return /es[-_]MX/i.test(x.lang);})[0]||v[0];
 if(mx)u.voice=mx;u.lang=mx?mx.lang:"es-MX";u.rate=rate||0.9;speechSynthesis.speak(u);return true;};

/* Match: put Spanish tiles into blanks by tapping or dragging.
   Markup: [data-match] holds .pb-slot[data-answer] and .pb-tile[data-word]; a [data-tray] inside is where tiles rest. */
P.match=function(root){
 var tray=root.querySelector("[data-tray]"),picked=null,quiet=0;
 function slots(){return [].slice.call(root.querySelectorAll(".pb-slot[data-answer]"));}
 function clear(s){s.classList.remove("pb-slot--correct","pb-slot--wrong","pb-slot--filled");var r=s.closest(".pb-listrow");if(r)r.removeAttribute("data-result");}
 function place(tile,slot){if(!slot)return;var old=slot.querySelector(".pb-tile");if(old)tray.appendChild(old);clear(slot);slot.textContent="";slot.appendChild(tile);slot.classList.add("pb-slot--filled");
  tile.classList.remove("is-picked");picked=null;tile.animate([{transform:"scale(1.18)"},{transform:"scale(1)"}],{duration:500,easing:"cubic-bezier(0.38,1.21,0.22,1)"});fire();}
 function back(tile){var s=tile.closest(".pb-slot");tray.appendChild(tile);if(s){clear(s);}fire();}
 function fire(){root.dispatchEvent(new CustomEvent("pb-change",{detail:{filled:slots().filter(function(s){return s.querySelector(".pb-tile");}).length,total:slots().length}}));}
 root.addEventListener("click",function(e){
  if(Date.now()-quiet<350)return;
  var t=e.target.closest(".pb-tile"),s=e.target.closest(".pb-slot[data-answer]");
  if(t&&t.closest(".pb-slot")){back(t);return;}
  if(t){if(picked)picked.classList.remove("is-picked");picked=t;t.classList.add("is-picked");var empty=slots().filter(function(x){return !x.querySelector(".pb-tile");});if(empty.length===1)place(t,empty[0]);return;}
  if(s&&picked)place(picked,s);
 });
 var drag=null;
 root.addEventListener("pointerdown",function(e){var t=e.target.closest(".pb-tile");if(!t)return;drag={t:t,x:e.clientX,y:e.clientY,moved:false};});
 window.addEventListener("pointermove",function(e){if(!drag)return;var dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.abs(dx)+Math.abs(dy)<8)return;drag.moved=true;drag.t.style.transition="none";drag.t.style.transform="translate("+dx+"px,"+dy+"px) scale(1.08) rotate(-2deg)";drag.t.style.zIndex=5;drag.t.style.pointerEvents="none";e.preventDefault();},{passive:false});
 window.addEventListener("pointerup",function(e){if(!drag)return;var d=drag;drag=null;
  /* Hit-test while the tile still ignores the pointer; it is under the finger until its transform is cleared. */
  var el=d.moved?document.elementFromPoint(e.clientX,e.clientY):null,s=el&&el.closest?el.closest(".pb-slot[data-answer]"):null;
  d.t.style.transform="";d.t.style.zIndex="";d.t.style.pointerEvents="";
  if(!d.moved){d.t.style.transition="";return;}
  quiet=Date.now();if(s&&root.contains(s))place(d.t,s);
  requestAnimationFrame(function(){d.t.style.transition="";});
 });
 return {check:function(){var ok=0;slots().forEach(function(s){var t=s.querySelector(".pb-tile");if(!t)return;var good=t.getAttribute("data-word")===s.getAttribute("data-answer");if(good)ok++;
   s.classList.remove("pb-slot--filled");s.classList.add(good?"pb-slot--correct":"pb-slot--wrong");var r=s.closest(".pb-listrow");if(r)r.setAttribute("data-result",good?"correct":"wrong");});return {correct:ok,total:slots().length};},
  reset:function(){slots().forEach(function(s){var t=s.querySelector(".pb-tile");if(t)tray.appendChild(t);clear(s);});fire();}};
};

/* Number pad and accent keys: type into the element named by data-for. */
P.keys=function(root){root.addEventListener("click",function(e){var k=e.target.closest("[data-key]");if(!k)return;var out=document.getElementById(root.getAttribute("data-for"));if(!out)return;
 var v=k.getAttribute("data-key"),isIn=("value" in out),cur=isIn?out.value:out.textContent;
 if(v==="back")cur=cur.slice(0,-1);else if(cur.length<(+root.getAttribute("data-max")||40))cur+=v;
 if(isIn){out.value=cur;out.focus();}else out.textContent=cur;out.dispatchEvent(new Event("input",{bubbles:true}));});};

/* Pay: tap coins and notes in the wallet to move them to the counter, tap again to take them back. */
P.pay=function(root){var wallet=root.querySelector("[data-wallet]"),counter=root.querySelector("[data-counter]"),out=root.querySelector("[data-paid]");
 function sum(){var t=0;counter.querySelectorAll("[data-value]").forEach(function(c){t+=+c.getAttribute("data-value");});if(out)out.textContent="$"+t;root.dispatchEvent(new CustomEvent("pb-change",{detail:{paid:t}}));return t;}
 root.addEventListener("click",function(e){var c=e.target.closest("[data-value]");if(!c)return;(c.parentNode===wallet?counter:wallet).appendChild(c);
  c.animate([{transform:"translateY(-10px) scale(1.12)"},{transform:"none"}],{duration:350,easing:"cubic-bezier(0.42,1.67,0.21,0.9)"});sum();});
 sum();return {paid:sum};};

function boot(){applyShapes();document.querySelectorAll("[data-keys]").forEach(P.keys);
 document.addEventListener("click",function(e){var s=e.target.closest("[data-say]");if(s)P.speak(s.getAttribute("data-say"));});}
if(document.readyState!=="loading")boot();else document.addEventListener("DOMContentLoaded",boot);
})();
