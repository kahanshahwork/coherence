(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- The mark: three lights wander in chaos, slowly pull onto one ring, hold, then spring apart quickly, forever ---------- */
(function(){
  var cv=$('#ring'),mark=$('#mark'),c=cv.getContext('2d'),DPR=Math.min(window.devicePixelRatio||1,2),S=0;
  function size(){var r=cv.getBoundingClientRect();S=r.width||300;cv.width=Math.round(S*DPR);cv.height=Math.round(S*DPR)}
  size();addEventListener('resize',size);

  /* one cycle, in seconds. M (tangled to unified) is the slow part; Sp (unified to tangled) is the quick part. */
  var A=1.4,M=3.0,H=1.1,Sp=.8,P=A+M+H+Sp,N=200,TAU=6.2832;
  function clamp01(x){return x<0?0:x>1?1:x}
  function inOut(x){x=clamp01(x);return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2}
  function outBack(x){x=clamp01(x);var c1=1.6,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)}
  function rnd(a,b){return a+Math.random()*(b-a)}
  function sign(){return Math.random()<.5?-1:1}
  /* separation: 1 = three rings tangled apart, 0 = one ring. It overshoots 1 a little on the spring back. */
  function sepAt(tc){
    if(tc<A)return 1;
    if(tc<A+M)return 1-inOut((tc-A)/M);
    if(tc<A+M+H)return 0;
    return outBack((tc-A-M-H)/Sp);
  }
  var COLS=['90,169,224','240,138,60','230,189,107'];
  var L=COLS.map(function(col){return {col:col}});
  /* Give every light a fresh random character: its waves, where it wanders, how it stretches and tilts.
     Called once per cycle while the rings are one, so the change is invisible. */
  function roll(){
    L.forEach(function(g){
      var hs=[2,3,4,5,6,7],h=[],k;
      for(k=0;k<3;k++)h.push(hs.splice(Math.floor(Math.random()*hs.length),1)[0]);
      h.sort(function(x,y){return x-y});
      g.w=[[h[0],rnd(.07,.125),sign()*rnd(.5,1.7)],[h[1],rnd(.05,.095),sign()*rnd(.8,2.3)],[h[2],rnd(.03,.065),sign()*rnd(1.2,2.8)]];
      g.ph=[rnd(0,TAU),rnd(0,TAU),rnd(0,TAU)];
      g.dx=rnd(.35,1.3);g.dy=rnd(.35,1.3);g.pa=rnd(0,TAU);g.pb=rnd(0,TAU);
      g.da=rnd(.075,.125);               /* how far it wanders */
      g.r=rnd(-.13,.13);                 /* its size against the others */
      g.ex=rnd(.86,1.16);g.ey=rnd(.86,1.16);g.rot=rnd(0,TAU);g.rs=sign()*rnd(.15,.55);
    });
  }
  roll();
  var T=0,last=performance.now(),raf=0,vis=true,rolledFor=-1;

  function path(ctx,g,R,cx,cy,sep,u,breath,off,sp,amp,ph0){
    var j,i,k,th,r,x,y,ang=g.rot+g.rs*T,ca=Math.cos(ang),sa=Math.sin(ang),ex=1+(g.ex-1)*sep,ey=1+(g.ey-1)*sep;
    for(j=0;j<off.length;j++){
      var d=off[j]*sp,pj=ph0*j*.5*sep;
      for(i=0;i<=N;i++){
        th=i/N*TAU;
        var wob=0;
        for(k=0;k<3;k++){var h=g.w[k];wob+=h[1]*Math.sin(h[0]*th+g.ph[k]+h[2]*T+pj)}
        /* the shared breath keeps all three exactly together once they are one */
        var common=.012*Math.sin(3*th+T*1.1)+.008*Math.sin(5*th-T*.9);
        r=R*(1+breath)+d+R*wob*amp*(1+off[j]*.05)+R*common*u;
        var px=Math.cos(th)*r*ex,py=Math.sin(th)*r*ey;
        x=cx+px*ca-py*sa;y=cy+px*sa+py*ca;
        if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);
      }
    }
  }

  function draw(){
    var tc=T%P,cyc=Math.floor(T/P);
    if(!reduce&&tc>=A+M+.05&&rolledFor!==cyc){roll();rolledFor=cyc}
    var sep=reduce?0:sepAt(tc),u=clamp01(1-sep);
    var tm=tc-(A+M),flash=reduce?0:Math.exp(-Math.pow(tm/.2,2)),hold=(tc>=A+M&&tc<A+M+H)?Math.sin(Math.PI*(tc-A-M)/H):0;
    var U=S/1.36,R=U*.32,cx=S/2,cy=S/2,breath=.014*hold*(reduce?0:1);
    c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,S,S);
    c.globalCompositeOperation='lighter';c.lineJoin='round';c.lineCap='round';
    var amp=sep>0?Math.min(sep,1.15):0;
    var spread=R*(.010+.022*clamp01(sep));
    L.forEach(function(g,n){
      /* wanders on two unrelated rhythms so the path never repeats; calms as sep falls */
      var ox=(Math.sin(T*g.dx+g.pa)+.45*Math.sin(T*g.dx*2.3+g.pb))*U*g.da*sep,oy=(Math.cos(T*g.dy+g.pb)+.45*Math.cos(T*g.dy*1.9+g.pa))*U*g.da*sep;
      var rr=R*(1+g.r*sep);
      c.beginPath();path(c,g,rr,cx+ox,cy+oy,sep,u,breath,[-2,2],spread,amp,n+1);
      c.strokeStyle='rgba('+g.col+',.34)';c.lineWidth=1;c.shadowBlur=0;c.stroke();
      c.beginPath();path(c,g,rr,cx+ox,cy+oy,sep,u,breath,[-1,0,1],spread,amp,n+1);
      c.strokeStyle='rgba('+g.col+','+(.78-.22*u).toFixed(2)+')';c.lineWidth=1.25;c.shadowColor='rgba('+g.col+',.95)';c.shadowBlur=12+8*u;c.stroke();
    });
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
