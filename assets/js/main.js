(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- The mark: three lights drift, pull onto one ring, hold, then spring apart again, forever ---------- */
(function(){
  var cv=$('#ring'),mark=$('#mark'),c=cv.getContext('2d'),DPR=Math.min(window.devicePixelRatio||1,2),S=0;
  function size(){var r=cv.getBoundingClientRect();S=r.width||300;cv.width=Math.round(S*DPR);cv.height=Math.round(S*DPR)}
  size();addEventListener('resize',size);

  /* one cycle, in seconds: drift apart, pull together, hold as one ring, spring apart */
  var A=1.4,M=1.3,H=1.1,Sp=.8,P=A+M+H+Sp,N=200,TAU=6.2832;
  function clamp01(x){return x<0?0:x>1?1:x}
  function inOut(x){x=clamp01(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
  function outBack(x){x=clamp01(x);var c1=1.6,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)}
  /* separation: 1 = three rings apart, 0 = one ring. It can overshoot 1 a little on the spring back. */
  function sepAt(tc){
    if(tc<A)return 1;
    if(tc<A+M)return 1-inOut((tc-A)/M);
    if(tc<A+M+H)return 0;
    return outBack((tc-A-M-H)/Sp);
  }
  /* each light: colour, three gentle waves (harmonic, size, speed), where it drifts when apart */
  var L=[
    {col:'90,169,224', w:[[2,.095,.9],[3,.060,-1.3],[5,.034,1.9]], ph:[0,1.3,2.6], dx:.7, dy:.55, pa:0.0, r:-1},
    {col:'240,138,60', w:[[2,.090,-1.1],[4,.058,1.5],[5,.030,-2.1]], ph:[2.2,.4,4.1], dx:.55, dy:.8, pa:2.1, r:0},
    {col:'230,189,107',w:[[3,.092,1.0],[2,.056,-1.6],[4,.032,2.3]], ph:[4.0,3.1,.9], dx:.8, dy:.62, pa:4.2, r:1}
  ];
  var T=0,last=performance.now(),raf=0,vis=true;

  function path(ctx,g,R,cx,cy,sep,u,breath,off,sp,amp,ph0){
    /* strands of one light: same shape, nudged apart by `sp` so they read as a soft band */
    var j,i,a,r,th,k,x,y;
    for(j=0;j<off.length;j++){
      var d=off[j]*sp,pj=ph0*j*.35*sep;
      for(i=0;i<=N;i++){
        th=i/N*TAU;
        var wob=0;
        for(k=0;k<3;k++){var h=g.w[k];wob+=h[1]*Math.sin(h[0]*th+g.ph[k]+h[2]*T+pj)}
        /* the shared breath keeps all three exactly together once they are one */
        var common=.012*Math.sin(3*th+T*1.1)+.008*Math.sin(5*th-T*.9);
        r=R*(1+breath)+d+R*wob*amp*(1+off[j]*.05)+R*common*u;
        x=cx+Math.cos(th)*r;y=cy+Math.sin(th)*r;
        if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);
      }
    }
  }

  function draw(){
    var tc=T%P,sep=reduce?0:sepAt(tc),u=clamp01(1-sep);
    var tm=tc-(A+M),flash=reduce?0:Math.exp(-Math.pow(tm/.2,2)),hold=(tc>=A+M&&tc<A+M+H)?Math.sin(Math.PI*(tc-A-M)/H):0;
    var R=S*.335,cx=S/2,cy=S/2,breath=.014*hold*(reduce?0:1);
    c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,S,S);
    c.globalCompositeOperation='lighter';c.lineJoin='round';c.lineCap='round';
    var amp=sep>0?Math.min(sep,1.15):0;            /* waves shrink to nothing as the lights become one */
    var spread=R*(.010+.016*clamp01(sep));         /* strands tighten into a single line */
    L.forEach(function(g,n){
      var ox=Math.sin(T*g.dx+g.pa)*S*.05*sep,oy=Math.cos(T*g.dy+g.pa*.7)*S*.05*sep;
      var rr=R*(1+g.r*.075*sep);
      /* soft outer strands */
      c.beginPath();path(c,g,rr,cx+ox,cy+oy,sep,u,breath,[-2,2],spread,amp,n+1);
      c.strokeStyle='rgba('+g.col+','+(.34).toFixed(2)+')';c.lineWidth=1;c.shadowBlur=0;c.stroke();
      /* bright core strands with a glow */
      c.beginPath();path(c,g,rr,cx+ox,cy+oy,sep,u,breath,[-1,0,1],spread,amp,n+1);
      c.strokeStyle='rgba('+g.col+','+(.78-.22*u).toFixed(2)+')';c.lineWidth=1.25;c.shadowColor='rgba('+g.col+',.95)';c.shadowBlur=12+8*u;c.stroke();
    });
    /* once they are one, the ring blooms white-gold; a brief flash marks the moment they meet */
    var bloom=u*u*u*.5+flash*u*.55;
    if(bloom>.01){
      c.beginPath();c.arc(cx,cy,R*(1+breath),0,TAU);
      c.strokeStyle='rgba(255,243,215,'+bloom.toFixed(3)+')';c.lineWidth=2.2+flash*1.2;c.shadowColor='rgba(255,232,180,.95)';c.shadowBlur=18+30*(u*.6+flash);c.stroke();
    }
    c.shadowBlur=0;
    mark.style.setProperty('--g',clamp01(u*.75+flash*.5).toFixed(2));
  }
  function loop(now){
    var dt=Math.min(.05,(now-last)/1000);last=now;T+=dt;draw();
    if(vis&&!document.hidden)raf=requestAnimationFrame(loop);else raf=0;
  }
  function go(){if(!raf){last=performance.now();raf=requestAnimationFrame(loop)}}
  if(reduce){T=A+M+.01;draw();addEventListener('resize',function(){size();draw()});return}
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
