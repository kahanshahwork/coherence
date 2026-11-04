(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- The mark: single rings of three colours, each fixed in place, spinning on its own axis with
   free-form, ever-changing waves. Same colours then gather, everything settles, and they become one ring.
   The spring back to chaos is quick. ---------- */
(function(){
  var cv=$('#ring'),mark=$('#mark'),c=cv.getContext('2d'),DPR=Math.min(window.devicePixelRatio||1,2),S=0;
  function size(){var r=cv.getBoundingClientRect();S=r.width||300;cv.width=Math.round(S*DPR);cv.height=Math.round(S*DPR)}
  size();addEventListener('resize',size);

  /* one cycle, in seconds: A free wandering shapes, M same colours gather then everything unifies and rests,
     H hold as one ring, Sp quick spring back to chaos */
  var A=3.0,M=2.8,H=1.1,Sp=.8,P=A+M+H+Sp,N=130,TAU=6.2832,NR=15,NH=5;
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
  /* A free-form wave: several random harmonics, each with its own drifting phase and a slowly
     breathing strength, so the outline keeps changing into shapes nobody planned. */
  function freeWave(amp){
    var pool=[2,3,4,5,6,7,8,9],w={h:[],a:[],sp:[],ph:[],es:[],ep:[]},j;
    for(j=0;j<NH;j++){
      var h=pool.splice(Math.floor(Math.random()*pool.length),1)[0];
      w.h.push(h);w.a.push(amp*rnd(.5,1)*(1.25-.1*h));w.sp.push(sign()*rnd(.4,2.2));w.ph.push(rnd(0,TAU));
      w.es.push(rnd(.35,1.2));w.ep.push(rnd(0,TAU));
    }
    return w;
  }
  /* New random rings every cycle (made while everything is one ring, so the change is invisible).
     Sizes are spread across the circle and colours alternate through the sizes, so neighbours differ. */
  function roll(){
    var perm=shuffle([0,1,2]),k;
    rings=[];Tm=0;
    for(k=0;k<NR;k++){
      var rf=Math.min(.95,.36+.59*k/(NR-1)+rnd(-.02,.02));
      var oa=Rmaxf*Math.max(0,1-rf*1.25)*rnd(.7,1),oang=rnd(0,TAU);
      rings.push({col:perm[k%3],rf:rf,w:freeWave(.085),ox:Math.cos(oang)*oa,oy:Math.sin(oang)*oa,
        a0:rnd(0,TAU),rs:sign()*rnd(.12,.6),ex:rnd(.88,1.14),ey:rnd(.88,1.14)});
    }
    shuffle(rings);
    groups=COLS.map(function(col,i){
      var oang=rnd(0,TAU),oa=Rmaxf*rnd(.03,.07);
      return {w:freeWave(.05),ox:Math.cos(oang)*oa,oy:Math.sin(oang)*oa,rf:.93+i*.07,ex:rnd(.96,1.06),ey:rnd(.96,1.06),a0:rnd(0,TAU),rs:sign()*rnd(.1,.3)};
    });
  }
  var Rmaxf=.46,Tm=0;
  roll();
  var T=0,last=performance.now(),raf=0,vis=true,rolledFor=-1;
  var wg=[new Float32Array(N+1),new Float32Array(N+1),new Float32Array(N+1)],wr=new Float32Array(N+1);

  /* fill out[i] with the wave's offset at every point of the outline, at time t */
  var cA=new Float32Array(NH),cP=new Float32Array(NH);
  function fillWave(w,t,out){
    var j,i;
    for(j=0;j<NH;j++){cA[j]=w.a[j]*(.45+.55*Math.sin(w.es[j]*t+w.ep[j]));cP[j]=w.ph[j]+w.sp[j]*t}
    for(i=0;i<=N;i++){var th=i/N*TAU,v=0;for(j=0;j<NH;j++)v+=cA[j]*Math.sin(w.h[j]*th+cP[j]);out[i]=v}
  }

  function draw(){
    var tc=T%P,cyc=Math.floor(T/P);
    if(!reduce&&tc>=A+M+.05&&rolledFor!==cyc){roll();rolledFor=cyc}
    if(reduce)setK(A+M+.01);else setK(tc);
    var u=clamp01(k2);
    var tm=tc-(A+M),flash=reduce?0:Math.exp(-Math.pow(tm/.2,2)),hold=(tc>=A+M&&tc<A+M+H)?Math.sin(Math.PI*(tc-A-M)/H):0;
    var U=S/1.36,Rmax=U*.46,Ru=U*.37,cx=S/2,cy=S/2,breath=.014*hold*(reduce?0:1),i,r;
    c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,S,S);
    c.globalCompositeOperation='lighter';c.lineJoin='round';c.lineCap='round';

    /* each colour's gathering ring: fixed in place, gentle free-form shape, slow spin */
    for(var gi=0;gi<3;gi++)fillWave(groups[gi].w,Tm,wg[gi]);

    for(var ci=0;ci<3;ci++){
      var core=new Path2D(),glow=new Path2D(),G=groups[ci];
      rings.forEach(function(R){
        if(R.col!==ci)return;
        fillWave(R.w,Tm,wr);
        var rad=lerp(lerp(Rmax*R.rf,Ru*G.rf,k1),Ru,k2),
            px0=lerp(R.ox,G.ox,k1)*(1-k2),py0=lerp(R.oy,G.oy,k1)*(1-k2),
            ex=lerp(lerp(R.ex,G.ex,k1),1,k2),ey=lerp(lerp(R.ey,G.ey,k1),1,k2),
            ang=lerp(R.a0+R.rs*Tm,G.a0+G.rs*Tm,k1),ca=Math.cos(ang),sa=Math.sin(ang),calm=1-k2,
            pth=new Path2D();
        for(i=0;i<=N;i++){
          var th=i/N*TAU,wob=lerp(wr[i],wg[ci][i],k1)*calm;
          var common=(.012*Math.sin(3*th+T*1.1)+.008*Math.sin(5*th-T*.9))*u;
          r=rad*(1+wob+common+breath);
          var x=Math.cos(th)*r*ex,y=Math.sin(th)*r*ey,X=cx+px0*U+x*ca-y*sa,Y=cy+py0*U+x*sa+y*ca;
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
    mark.parentNode.style.setProperty('--g',clamp01(u*.75+flash*.5).toFixed(2));
    mark.style.setProperty('--t',sm(.35,.95,k2).toFixed(3));
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

  /* Product deck: 17 slides, arrows, keys and swipe */
  var N=17,di=0,img=$('#slide'),prev=$('#prev'),next=$('#next'),count=$('#count'),frame=$('#deckFrame');
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
