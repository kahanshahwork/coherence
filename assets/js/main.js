(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- The mark: three lights merge into one ring, hold, then rise apart again, forever ---------- */
(function(){
  var cv=$('#ring'),mark=$('#mark'),c=cv.getContext('2d'),DPR=Math.min(window.devicePixelRatio||1,2),S=0;
  function size(){var r=cv.getBoundingClientRect();S=r.width||300;cv.width=Math.round(S*DPR);cv.height=Math.round(S*DPR)}
  size();addEventListener('resize',size);
  var P=11; /* seconds per cycle: apart, merge, hold, apart */
  var RINGS=[{col:'90,169,224',k:5,ph:0,w:.6},{col:'240,138,60',k:6,ph:2.1,w:-.5},{col:'230,189,107',k:7,ph:4.2,w:.4}];
  function sm(a,b,x){var t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)}
  function conv(u){return sm(.12,.44,u)*(1-sm(.66,.94,u))}
  var last=performance.now(),T=0,raf=0,vis=true,i,a;
  function draw(){
    var u=(T%P)/P,cc=reduce?1:conv(u),R=S*.335,cx=S/2,cy=S/2;
    c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,S,S);c.globalCompositeOperation='lighter';
    RINGS.forEach(function(g,n){
      var A=R*.19*(1-cc)+(reduce?0:R*.012*cc*Math.sin(T*1.3+g.k));
      var ox=Math.cos(T*.5+n*2.1)*S*.04*(1-cc),oy=Math.sin(T*.42+n*2.1)*S*.04*(1-cc),rr=R*(1+(n-1)*.07*(1-cc));
      c.beginPath();
      for(i=0;i<=200;i++){a=i/200*6.2832;var r=rr+A*Math.sin(g.k*a+g.ph),x=cx+ox+Math.cos(a)*r,y=cy+oy+Math.sin(a)*r;if(i)c.lineTo(x,y);else c.moveTo(x,y)}
      c.closePath();c.strokeStyle='rgba('+g.col+','+(.92-.3*cc).toFixed(2)+')';c.lineWidth=1.7;c.shadowColor='rgba('+g.col+',.9)';c.shadowBlur=14;c.stroke();
    });
    if(cc>0){c.beginPath();c.arc(cx,cy,R,0,6.2832);c.strokeStyle='rgba(255,244,220,'+(.62*cc).toFixed(2)+')';c.lineWidth=2.5;c.shadowColor='rgba(255,236,190,.9)';c.shadowBlur=30*cc;c.stroke()}
    mark.style.setProperty('--g',cc.toFixed(2));
  }
  function loop(now){
    var dt=Math.min(.05,(now-last)/1000);last=now;
    /* wave phases keep turning at a steady speed; separation and merge follow the cycle */
    RINGS.forEach(function(g){g.ph+=dt*g.w*(1-.9*(reduce?1:conv((T%P)/P)))});
    T+=dt;draw();
    if(vis&&!document.hidden)raf=requestAnimationFrame(loop);else raf=0;
  }
  function go(){if(!raf){last=performance.now();raf=requestAnimationFrame(loop)}}
  if(reduce){draw();addEventListener('resize',draw);return}
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis)go()}).observe(cv);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)go()});
  go();
})();

/* ---------- Overlays: film and connect ---------- */
(function(){
  var opener=null,cur=null,film=$('#film');
  function open(ov,from){
    cur=ov;opener=from;ov.hidden=false;document.body.style.overflow='hidden';
    var x=$('[data-close]',ov);if(x)x.focus({preventScroll:true});
  }
  function close(){
    if(!cur)return;
    if(cur.id==='ovFilm'){try{film.pause()}catch(e){}}
    cur.hidden=true;cur=null;document.body.style.overflow='';
    if(opener)try{opener.focus({preventScroll:true})}catch(e){}
  }
  $('#openFilm').addEventListener('click',function(){
    open($('#ovFilm'),this);
    try{if(film.ended)film.currentTime=0;var p=film.play();if(p&&p.catch)p.catch(function(){})}catch(e){}
  });
  $('#openMail').addEventListener('click',function(){open($('#ovMail'),this)});
  [$('#ovFilm'),$('#ovMail')].forEach(function(ov){
    ov.addEventListener('click',function(e){if(e.target===ov||(e.target.closest&&e.target.closest('[data-close]')))close()});
  });
  addEventListener('keydown',function(e){if(e.key==='Escape')close()});
  var btn=$('#copy'),t=$('#addr');
  btn.addEventListener('click',function(){
    function ok(){btn.textContent='Copied';setTimeout(function(){btn.textContent='Copy'},1600)}
    function pick(){var rg=document.createRange();rg.selectNodeContents(t);var s=getSelection();s.removeAllRanges();s.addRange(rg);btn.textContent='Selected';setTimeout(function(){btn.textContent='Copy'},1600)}
    try{navigator.clipboard.writeText(t.textContent).then(ok,pick)}catch(e){pick()}
  });
})();
})();
