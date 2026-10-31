(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- The mark: many single rings of three colours wander at random inside one circle;
   rings of the same colour then slowly gather, everything settles, and they become one ring.
   The spring back to chaos is quick. ---------- */
(function(){
  var cv=$('#ring'),mark=$('#mark'),c=cv.getContext('2d'),DPR=Math.min(window.devicePixelRatio||1,2),S=0;
  function size(){var r=cv.getBoundingClientRect();S=r.width||300;cv.width=Math.round(S*DPR);cv.height=Math.round(S*DPR)}
  size();addEventListener('resize',size);

  /* one cycle, in seconds: A random wandering, M same colours gather then everything unifies and rests,
     H hold as one ring, Sp quick spring back to chaos */
  var A=3.0,M=2.8,H=1.1,Sp=.8,P=A+M+H+Sp,N=160,TAU=6.2832,NR=15;
  function clamp01(x){return x<0?0:x>1?1:x}
  function sm(a,b,x){var t=clamp01((x-a)/(b-a));return t*t*(3-2*t)}
  function lerp(a,b,t){return a+(b-a)*t}
  function outBack(x){x=clamp01(x);var c1=1.6,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)}
  function rnd(a,b){return a+Math.random()*(b-a)}
  function sign(){return Math.random()<.5?-1:1}
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
  /* k1: same colours gathered into one ring each. k2: all colours unified and at rest. */
  var k1=0,k2=0;
  function setK(tc){
    if(tc<A){k1=0;k2=0}
    else if(tc<A+M){var m=(tc-A)/M;k1=sm(0,.7,m);k2=sm(.45,1,m)}
    else if(tc<A+M+H){k1=1;k2=1}
    else{var k=Math.max(-.05,1-outBack((tc-A-M-H)/Sp));k1=k;k2=k}
  }
  var COLS=['90,169,224','240,122,58','230,189,107'];       /* blue, red-orange, gold */
  var rings=[],groups=[];
  function waves(amps){
    var hs=[2,3,4,5,6,7],h=[],k;
    for(k=0;k<3;k++)h.push(hs.splice(Math.floor(Math.random()*hs.length),1)[0]);
    h.sort(function(x,y){return x-y});
    return {h:h,a:[rnd(amps[0]*.6,amps[0]),rnd(amps[1]*.6,amps[1]),rnd(amps[2]*.6,amps[2])],sp:[sign()*rnd(.5,1.5),sign()*rnd(.8,2),sign()*rnd(1.1,2.5)],ph:[rnd(0,TAU),rnd(0,TAU),rnd(0,TAU)]};
  }
  /* New random rings every cycle (called while everything is one ring, so the change is invisible).
     Sizes are spread across the circle and colours alternate through the sizes, so no two neighbours share a colour. */
  function roll(){
    var perm=shuffle([0,1,2]),k;
    rings=[];
    for(k=0;k<NR;k++){
      var rf=Math.min(.95,.36+.59*k/(NR-1)+rnd(-.02,.02));
      var w=waves([.10,.07,.045]);
      rings.push({col:perm[k%3],rf:rf,w:w,dx:rnd(.35,1.3),dy:rnd(.35,1.3),pa:rnd(0,TAU),pb:rnd(0,TAU),
        oaf:Math.max(0,1-rf*1.22)*rnd(.75,1),ex:rnd(.84,1.18),ey:rnd(.84,1.18),dl:rnd(-2.4,2.4)});
    }
    shuffle(rings);
    groups=COLS.map(function(col,i){
      return {w:waves([.06,.04,.025]),dx:rnd(.3,.8),dy:rnd(.3,.8),pa:rnd(0,TAU),pb:rnd(0,TAU),ga:rnd(.12,.2),rf:.9+i*.1,ex:rnd(.95,1.08),ey:rnd(.95,1.08),rot:rnd(0,TAU),rs:sign()*rnd(.1,.35)};
    });
  }
  roll();
  var T=0,Tm=0,last=performance.now(),raf=0,vis=true,rolledFor=-1;
  var wg=[new Float32Array(N+1),new Float32Array(N+1),new Float32Array(N+1)];

  function waveAt(w,th,t){return w.a[0]*Math.sin(w.h[0]*th+w.ph[0]+w.sp[0]*t)+w.a[1]*Math.sin(w.h[1]*th+w.ph[1]+w.sp[1]*t)+w.a[2]*Math.sin(w.h[2]*th+w.ph[2]+w.sp[2]*t)}

  function draw(){
    var tc=T%P,cyc=Math.floor(T/P);
    if(!reduce&&tc>=A+M+.05&&rolledFor!==cyc){roll();rolledFor=cyc}
    if(reduce)setK(A+M+.01);else setK(tc);
    var u=clamp01(k2);
    var tm=tc-(A+M),flash=reduce?0:Math.exp(-Math.pow(tm/.2,2)),hold=(tc>=A+M&&tc<A+M+H)?Math.sin(Math.PI*(tc-A-M)/H):0;
    var U=S/1.36,Rmax=U*.46,Ru=U*.30,cx=S/2,cy=S/2,breath=.014*hold*(reduce?0:1),i,g,r,n;
    c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,S,S);
    c.globalCompositeOperation='lighter';c.lineJoin='round';c.lineCap='round';

    /* each colour's gathering ring: its own gentle shape and slow drift */
    var gs=groups.map(function(G,gi){
      for(i=0;i<=N;i++)wg[gi][i]=waveAt(G.w,i/N*TAU,Tm);
      return {x:(Math.sin(Tm*G.dx+G.pa)+.4*Math.sin(Tm*G.dx*2.1+G.pb))*Rmax*G.ga/1.4,y:(Math.cos(Tm*G.dy+G.pb)+.4*Math.cos(Tm*G.dy*1.9+G.pa))*Rmax*G.ga/1.4,
              rad:Ru*G.rf,ang:G.rot+G.rs*Tm,ex:G.ex,ey:G.ey};
    });

    for(var ci=0;ci<3;ci++){
      var core=new Path2D(),glow=new Path2D();
      rings.forEach(function(R){
        if(R.col!==ci)return;
        var Gs=gs[ci],oa=Rmax*R.oaf;
        var ox=(Math.sin(Tm*R.dx+R.pa)+.45*Math.sin(Tm*R.dx*2.3+R.pb))*oa/1.45,oy=(Math.cos(Tm*R.dy+R.pb)+.45*Math.cos(Tm*R.dy*1.9+R.pa))*oa/1.45;
        var rad=lerp(lerp(Rmax*R.rf,Gs.rad,k1),Ru,k2),
            px0=lerp(ox,Gs.x,k1)*(1-k2),py0=lerp(oy,Gs.y,k1)*(1-k2),
            ex=lerp(lerp(R.ex,Gs.ex,k1),1,k2),ey=lerp(lerp(R.ey,Gs.ey,k1),1,k2),
            ang=Gs.ang+R.dl*(1-k1),ca=Math.cos(ang),sa=Math.sin(ang),calm=1-k2,
            pth=new Path2D();
        for(i=0;i<=N;i++){
          var th=i/N*TAU,wi=waveAt(R.w,th,Tm),wob=lerp(wi,wg[ci][i],k1)*calm;
          var common=(.012*Math.sin(3*th+T*1.1)+.008*Math.sin(5*th-T*.9))*u;
          r=rad*(1+wob+common+breath);
          var x=Math.cos(th)*r*ex,y=Math.sin(th)*r*ey,X=cx+px0+x*ca-y*sa,Y=cy+py0+x*sa+y*ca;
          if(i)pth.lineTo(X,Y);else pth.moveTo(X,Y);
        }
        pth.closePath();core.addPath(pth);glow.addPath(pth);
      });
      c.shadowBlur=0;c.strokeStyle='rgba('+COLS[ci]+',.13)';c.lineWidth=3.4;c.stroke(glow);
      c.strokeStyle='rgba('+COLS[ci]+','+(.82-.2*u).toFixed(2)+')';c.lineWidth=1.1;c.shadowColor='rgba('+COLS[ci]+',.95)';c.shadowBlur=10+8*u;c.stroke(core);
    }
    /* once they are one, the ring blooms white-gold; a brief flash marks the moment they meet */
    var bloom=u*u*u*.5+flash*u*.55;
    if(bloom>.01){
      c.beginPath();c.arc(cx,cy,Ru*(1+breath),0,TAU);
      c.strokeStyle='rgba(255,243,215,'+bloom.toFixed(3)+')';c.lineWidth=2.2+flash*1.2;c.shadowColor='rgba(255,232,180,.95)';c.shadowBlur=18+30*(u*.6+flash);c.stroke();
    }
    c.shadowBlur=0;
    mark.style.setProperty('--g',clamp01(u*.75+flash*.5).toFixed(2));
  }
  function loop(now){
    var dt=Math.min(.05,(now-last)/1000);last=now;T+=dt;
    Tm+=dt*(1-.85*clamp01(k2));           /* motion slows to rest as the rings unify, and speeds back up as they break apart */
    draw();
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

  /* Product deck: 18 slides, arrows, keys and swipe */
  var N=18,di=0,img=$('#slide'),prev=$('#prev'),next=$('#next'),count=$('#count'),frame=$('#deckFrame');
  function src(n){return 'assets/deck/slide-'+(n<10?'0':'')+n+'.jpg'}
  function show(k){
    di=Math.max(0,Math.min(N-1,k));
    img.src=src(di+1);img.alt='ParaIQ product deck, slide '+(di+1)+' of '+N;
    count.textContent=(di+1)+' / '+N;prev.disabled=di===0;next.disabled=di===N-1;
    [di-1,di+1].forEach(function(j){if(j>=0&&j<N){var p=new Image();p.src=src(j+1)}});
  }
  $('#openDeck').addEventListener('click',function(){show(di);open($('#ovDeck'),this);try{frame.focus({preventScroll:true})}catch(e){}});
  prev.addEventListener('click',function(){show(di-1)});
  next.addEventListener('click',function(){show(di+1)});
  addEventListener('keydown',function(e){
    if(!cur||cur.id!=='ovDeck')return;
    if(e.key==='ArrowRight'){show(di+1);e.preventDefault()}else if(e.key==='ArrowLeft'){show(di-1);e.preventDefault()}
  });
  var x0=null,y0=null;
  frame.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
  frame.addEventListener('touchend',function(e){
    if(x0===null)return;var dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;
    if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.4)show(dx<0?di+1:di-1);
  },{passive:true});

  [$('#ovFilm'),$('#ovDeck'),$('#ovMail')].forEach(function(ov){
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
