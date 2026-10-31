(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Reveals: a fixed-time fade, once, when a block comes into view ---------- */
(function(){
  var els=$$('.rv');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
  },{threshold:.15,rootMargin:'0px 0px -6% 0px'});
  els.forEach(function(e){io.observe(e)});
})();

/* ---------- Hero ring: three lights converge into one (plays once, then breathes) ---------- */
(function(){
  var cv=$('#ring');if(!cv)return;
  var c=cv.getContext('2d'),DPR=Math.min(window.devicePixelRatio||1,2),S=0;
  function size(){var r=cv.getBoundingClientRect();S=r.width||300;cv.width=Math.round(S*DPR);cv.height=Math.round(S*DPR)}
  size();addEventListener('resize',size);
  var RINGS=[{col:'90,169,224',k:5,ph:0,w:.55},{col:'240,138,60',k:6,ph:2.1,w:-.45},{col:'230,189,107',k:7,ph:4.2,w:.35}];
  var T0=performance.now(),vis=true,raf=0;
  function ease(x){return x<0?0:x>1?1:1-Math.pow(1-x,3)}
  function draw(now){
    var t=(now-T0)/1000,conv=reduce?1:ease((t-.7)/4.4),R=S*.30,cx=S/2,cy=S/2,i,a;
    c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,S,S);c.globalCompositeOperation='lighter';
    RINGS.forEach(function(g){
      var A=R*.17*(1-conv)+(reduce?0:R*.012*conv*Math.sin(t*1.2+g.k));
      c.beginPath();
      for(i=0;i<=180;i++){a=i/180*6.2832;var r=R+A*Math.sin(g.k*a+g.ph+g.w*t*(1-conv*.9)),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;if(i)c.lineTo(x,y);else c.moveTo(x,y)}
      c.closePath();c.strokeStyle='rgba('+g.col+','+(.9-.3*conv).toFixed(2)+')';c.lineWidth=1.6;c.shadowColor='rgba('+g.col+',.9)';c.shadowBlur=14;c.stroke();
    });
    if(conv>0){c.beginPath();c.arc(cx,cy,R,0,6.2832);c.strokeStyle='rgba(255,244,220,'+(.6*conv).toFixed(2)+')';c.lineWidth=2.4;c.shadowColor='rgba(255,236,190,.9)';c.shadowBlur=28*conv;c.stroke()}
    c.shadowBlur=0;var gr=c.createRadialGradient(cx,cy,0,cx,cy,S*.055);gr.addColorStop(0,'rgba(255,240,205,.95)');gr.addColorStop(1,'rgba(255,240,205,0)');c.fillStyle=gr;c.fillRect(cx-S*.055,cy-S*.055,S*.11,S*.11);
  }
  function loop(now){draw(now);if(vis&&!document.hidden&&!reduce)raf=requestAnimationFrame(loop);else raf=0}
  function go(){if(!raf)raf=requestAnimationFrame(loop)}
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis)go()}).observe(cv);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)go()});
  if(reduce)draw(performance.now()+6000);else go();
})();

/* ---------- Deck viewer ---------- */
(function(){
  var N=18,i=0,img=$('#slide'),prev=$('#prev'),next=$('#next'),count=$('#count'),segs=$('#segs'),viewer=$('#viewer');
  if(!img)return;
  function src(n){return 'assets/deck/slide-'+(n<10?'0':'')+n+'.jpg'}
  var btns=[];
  for(var n=1;n<=N;n++){(function(k){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Go to slide '+k);b.addEventListener('click',function(){show(k-1)});segs.appendChild(b);btns.push(b)})(n)}
  function show(k){
    i=Math.max(0,Math.min(N-1,k));
    img.src=src(i+1);img.alt='ParaIQ product deck, slide '+(i+1)+' of '+N;
    count.textContent=(i+1)+' / '+N;
    prev.disabled=i===0;next.disabled=i===N-1;
    btns.forEach(function(b,j){b.classList.toggle('on',j<=i)});
    [i-1,i+1].forEach(function(j){if(j>=0&&j<N){var p=new Image();p.src=src(j+1)}});
  }
  prev.addEventListener('click',function(){show(i-1)});
  next.addEventListener('click',function(){show(i+1)});
  viewer.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){show(i+1);e.preventDefault()}else if(e.key==='ArrowLeft'){show(i-1);e.preventDefault()}});
  var x0=null,y0=null;
  viewer.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
  viewer.addEventListener('touchend',function(e){
    if(x0===null)return;var dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;
    if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.4)show(dx<0?i+1:i-1);
  },{passive:true});
  show(0);
})();

/* ---------- Copy email ---------- */
(function(){
  var btn=$('#copyMail'),t=$('#mailText');if(!btn)return;
  btn.addEventListener('click',function(){
    function ok(){btn.textContent='Copied';setTimeout(function(){btn.textContent='Copy'},1600)}
    function pick(){var rg=document.createRange();rg.selectNodeContents(t);var s=getSelection();s.removeAllRanges();s.addRange(rg);btn.textContent='Selected';setTimeout(function(){btn.textContent='Copy'},1600)}
    try{navigator.clipboard.writeText(t.textContent).then(ok,pick)}catch(e){pick()}
  });
})();
})();
