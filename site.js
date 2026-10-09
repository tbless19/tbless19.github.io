(function(){
  var root=document.documentElement, t=document.getElementById('theme');
  function get(){try{return localStorage.getItem('pt-aurora-theme')}catch(e){return null}}
  function set(v){try{localStorage.setItem('pt-aurora-theme',v)}catch(e){}}
  var saved=get(); if(saved) root.setAttribute('data-theme',saved);
  function isDark(){var a=root.getAttribute('data-theme'); return a? a==='dark' : matchMedia('(prefers-color-scheme: dark)').matches}
  var SUN='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>', MOON='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z"/></svg>';
  function label(){var d=isDark(); t.innerHTML=d?SUN:MOON; t.setAttribute('aria-label',d?'Switch to light mode':'Switch to dark mode'); t.title=d?'Light mode':'Dark mode'}
  label(); t.addEventListener('click',function(){var n=isDark()?'light':'dark'; root.setAttribute('data-theme',n); set(n); label()});

  var m=document.getElementById('menu'), b=document.getElementById('menu-btn');
  b.addEventListener('click',function(){var o=m.classList.toggle('open'); b.setAttribute('aria-expanded',String(o)); b.textContent=o?'Close':'Menu'});
  var links=[].slice.call(m.querySelectorAll('a')), secs=links.map(function(a){return document.querySelector(a.getAttribute('href'))});
  links.forEach(function(a){a.addEventListener('click',function(){m.classList.remove('open'); b.setAttribute('aria-expanded','false'); b.textContent='Menu'})});
  function spy(){var y=scrollY+140,c=-1; secs.forEach(function(s,i){if(s&&s.offsetTop<=y)c=i}); links.forEach(function(a,i){a.classList.toggle('on',i===c)})}
  addEventListener('scroll',spy,{passive:true}); spy();

  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FX_DEFAULT='slide', FX_LIST=['cascade','curtain','focus','slide','wipe'];
  document.querySelectorAll('.sec-head, #skills .split > div:first-child').forEach(function(n){n.classList.add('rv')});
  [].forEach.call(document.querySelectorAll('section'),function(s){ [].forEach.call(s.querySelectorAll('.rv'),function(n,i){ n.style.setProperty('--i', Math.min(i,6)); n.setAttribute('data-side', i%2?'r':'l'); }); });
  var fx=FX_DEFAULT; try{ if(window.FX_PICKER){ var sv=localStorage.getItem('pt-fx'); if(sv && FX_LIST.indexOf(sv)>-1) fx=sv; } }catch(e){}
  root.setAttribute('data-fx',fx);
  var rvs=document.querySelectorAll('.rv');
  if(reduce || !('IntersectionObserver' in window)){ rvs.forEach(function(n){n.classList.add('in')}); }
  else{
    var ticking=false, list=[].slice.call(rvs);
    function check(){ ticking=false; var vh=innerHeight;
      list.forEach(function(n){ var r=n.getBoundingClientRect();
        if(r.top < vh*0.9 && r.bottom > vh*0.04){ n.classList.add('in'); }
        else if(r.bottom < 0 || r.top > vh){ n.classList.remove('in'); } }); }
    function req(){ if(!ticking){ ticking=true; requestAnimationFrame(check); } }
    addEventListener('scroll',req,{passive:true}); addEventListener('resize',req); check();
    window.__replayFx=function(){ list.forEach(function(n){n.classList.remove('in')}); void document.body.offsetHeight; requestAnimationFrame(function(){ requestAnimationFrame(check) }); };
    var io=new IntersectionObserver(function(es){es.forEach(function(e){ if(!e.isIntersecting) return; io.unobserve(e.target);
      var el=e.target,to=+el.dataset.to,pre=el.dataset.pre||'',suf=el.dataset.suf||'',t0=null;
      function step(ts){if(!t0)t0=ts; var k=Math.min(1,(ts-t0)/1200); el.textContent=pre+Math.round(to*(1-Math.pow(1-k,3)))+suf; if(k<1)requestAnimationFrame(step)}
      requestAnimationFrame(step)})},{threshold:.6});
    document.querySelectorAll('[data-to]').forEach(function(n){io.observe(n)});
  }

  /* mission profile */
  var route=document.getElementById('route'), trail=document.getElementById('trail'), zip=document.getElementById('zip'),
      pkg=document.getElementById('pkg'), wire=document.getElementById('wire'),
      legend=[].slice.call(document.querySelectorAll('#phase-legend li'));
  if(route && zip){
    var L=route.getTotalLength(), DROPX=738, GROUND=306;
    var railA={x:72,y:311}, railB=route.getPointAtLength(0), railAng=Math.atan2(railB.y-railA.y,railB.x-railA.x)*180/Math.PI;
    function place(x,y,a){zip.setAttribute('transform','translate('+x.toFixed(1)+' '+y.toFixed(1)+') rotate('+a.toFixed(1)+')')}
    function angAt(l){var p=route.getPointAtLength(Math.max(0,l-1)), q=route.getPointAtLength(Math.min(L,l+1)); return Math.atan2(q.y-p.y,q.x-p.x)*180/Math.PI}
    function phaseFor(x){return x<380?0 : x<650?1 : x<800?2 : x<1040?3 : 4}
    var cur=-1; function setPhase(i){ if(i===cur) return; cur=i; legend.forEach(function(li,k){li.classList.toggle('on',k===i)}) }
    function trailTo(f){trail.style.strokeDashoffset=String(1000*(1-f))}

    var running=false, raf=0;
    function stopFlight(){running=false; cancelAnimationFrame(raf)}
    function startFlight(){
    if(reduce){
      var l0=L*0.32, p0=route.getPointAtLength(l0); place(p0.x,p0.y,angAt(l0)); trailTo(0.32); setPhase(phaseFor(p0.x));
    } else {
      running=true;
      var IDLE=0.6, RAIL=0.45, FLY=8.2, HOLD=1.3, FADE=0.5, T=IDLE+RAIL+FLY+HOLD+FADE, start=null, dropT=null;
      function frame(ts){
        if(start===null) start=ts;
        var s=((ts-start)/1000)%T, x, y;
        zip.style.opacity='1'; wire.setAttribute('d','M1096 214 L1176 214');
        if(s<IDLE){ place(railA.x,railA.y,railAng); trailTo(0); setPhase(0); dropT=null; pkg.setAttribute('opacity','0'); }
        else if(s<IDLE+RAIL){ var k=(s-IDLE)/RAIL; k=k*k; place(railA.x+(railB.x-railA.x)*k, railA.y+(railB.y-railA.y)*k, railAng); trailTo(0); setPhase(0); }
        else if(s<IDLE+RAIL+FLY){
          var f=(s-IDLE-RAIL)/FLY, l=f*L, p=route.getPointAtLength(l); place(p.x,p.y,angAt(l)); trailTo(f); setPhase(phaseFor(p.x)); x=p.x;
          if(dropT===null && x>=DROPX){ dropT=s; }
        } else {
          var h=s-IDLE-RAIL-FLY, e=route.getPointAtLength(L), sag=Math.min(1,h/0.35)*14;
          place(e.x+Math.min(1,h/0.35)*8, e.y+sag, angAt(L)*(1-Math.min(1,h/0.35))+8*Math.min(1,h/0.35));
          wire.setAttribute('d','M1096 214 Q'+(1136+Math.min(1,h/0.35)*8)+' '+(214+sag*2)+' 1176 214');
          trailTo(1); setPhase(4);
          if(h>HOLD) zip.style.opacity=String(Math.max(0,1-(h-HOLD)/FADE));
        }
        if(dropT!==null){
          var d=s-dropT, FALL=2.4;
          if(d>=0 && d<FALL+1.2){
            var k2=Math.min(1,d/FALL), py=176+16+(GROUND-192)*(1-Math.pow(1-k2,1.6)), px=DROPX+Math.sin(d*3.2)*4*(1-k2)+ (k2*2);
            pkg.setAttribute('transform','translate('+px.toFixed(1)+' '+py.toFixed(1)+') rotate('+(Math.sin(d*3.2)*8*(1-k2)).toFixed(1)+')');
            pkg.setAttribute('opacity', d<FALL? '1' : String(Math.max(0,1-(d-FALL)/1.2)));
          } else pkg.setAttribute('opacity','0');
        }
        if(running) raf=requestAnimationFrame(frame);
      }
      raf=requestAnimationFrame(frame);
    }
    }
    var dlg=document.getElementById('flight'), closeBtn=document.getElementById('flight-close'), lastFocus=null;
    function open(){ if(dlg.open) return; lastFocus=document.activeElement; if(dlg.showModal) dlg.showModal(); else dlg.setAttribute('open',''); startFlight(); }
    function close(){ if(dlg.open){ dlg.close ? dlg.close() : dlg.removeAttribute('open'); } }
    dlg.addEventListener('close',function(){ stopFlight(); if(lastFocus&&lastFocus.focus) lastFocus.focus(); });
    dlg.addEventListener('click',function(ev){ if(ev.target===dlg) close(); });
    closeBtn.addEventListener('click',close);
    [].forEach.call(document.querySelectorAll('[data-launch]'),function(btn){btn.addEventListener('click',open)});
    addEventListener('keydown',function(ev){
      var tg=ev.target, typing=tg&&(/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName)||tg.isContentEditable);
      if(!typing && !document.querySelector('dialog.cv[open]') && !ev.metaKey && !ev.ctrlKey && !ev.altKey && (ev.key==='l'||ev.key==='L')) { ev.preventDefault(); dlg.open? close() : open(); }
    });
    window.__launch=open;
  }

  var rot=document.querySelector('.rot');
  if(rot && !reduce){
    var ph=[].slice.call(rot.children), i=0;
    setInterval(function(){
      var cur=ph[i]; i=(i+1)%ph.length; var nx=ph[i];
      cur.classList.remove('on'); cur.classList.add('off');
      nx.classList.remove('off'); nx.classList.add('on');
      setTimeout(function(){cur.classList.remove('off')},600);
    },3200);
  }
  /* scroll progress */
  var prog=document.createElement('div'); prog.className='progress'; prog.setAttribute('aria-hidden','true'); document.body.appendChild(prog);
  function pr(){ var h=document.documentElement.scrollHeight-innerHeight; prog.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0)+')'; }
  addEventListener('scroll',pr,{passive:true}); addEventListener('resize',pr); pr();
  /* transition picker (preview only) */
  if(window.FX_PICKER){
    var names={cascade:'Cascade',curtain:'Curtain',focus:'Focus',slide:'Slide',wipe:'Wipe'};
    var pk=document.createElement('div'); pk.className='fx-picker'; pk.setAttribute('role','group'); pk.setAttribute('aria-label','Section transition preview');
    pk.innerHTML='<span class="fx-lbl">Transition</span>'+FX_LIST.map(function(k){return '<button type="button" data-fx-btn="'+k+'"'+(k===fx?' aria-pressed="true"':' aria-pressed="false"')+'>'+names[k]+(k===FX_DEFAULT?'<i>default</i>':'')+'</button>'}).join('')+'<button type="button" class="fx-x" aria-label="Hide transition picker">×</button>';
    document.body.appendChild(pk);
    pk.addEventListener('click',function(ev){
      var b=ev.target.closest('button'); if(!b) return;
      if(b.classList.contains('fx-x')){ pk.remove(); return; }
      var k=b.getAttribute('data-fx-btn'); root.setAttribute('data-fx',k);
      [].forEach.call(pk.querySelectorAll('[data-fx-btn]'),function(x){x.setAttribute('aria-pressed',String(x===b))});
      try{localStorage.setItem('pt-fx',k)}catch(e){}
      if(window.__replayFx) window.__replayFx();
    });
  }
  /* resume preview */
  (function(){
    var cv=document.getElementById('cv'); if(!cv) return;
    var files={data:{pdf:'assets/Prince_Tawiah_Resume_Data.pdf',img:'assets/resume_data.webp',name:'Prince_Tawiah_Resume_Data.pdf',label:'data'},
               engineering:{pdf:'assets/Prince_Tawiah_Resume_Engineering.pdf',img:'assets/resume_engineering.webp',name:'Prince_Tawiah_Resume_Engineering.pdf',label:'engineering'}};
    var img=document.getElementById('cv-img'), open_=document.getElementById('cv-open'), dl=document.getElementById('cv-dl'), msg=document.getElementById('cv-msg'), cur='data', last=null;
    var tabs=[].slice.call(cv.querySelectorAll('[data-cv-tab]'));
    var dlNs=null, inViewer=!!(window.claude && window.claude.use);
    var dlP=null; if(inViewer){ open_.hidden=true; try{ dlP=Promise.resolve(window.claude.use('downloads')).catch(function(){return null}); }catch(e){ dlP=Promise.resolve(null); } }
    function say(t){ msg.textContent=t; msg.hidden=!t; }
    function show(k){ cur=k; var f=files[k]; img.src=f.img; img.alt='Prince Tawiah, '+f.label+' resume, page 1'; open_.href=f.pdf;
      tabs.forEach(function(t){t.setAttribute('aria-selected',String(t.getAttribute('data-cv-tab')===k))}); say(''); var pgEl=cv.querySelector('.cv-page'); pgEl.classList.remove('zoom'); pgEl.scrollTop=0; }
    function openCv(k){ last=document.activeElement; show(k); if(cv.showModal) cv.showModal(); else cv.setAttribute('open',''); }
    [].forEach.call(document.querySelectorAll('[data-cv]'),function(a){ a.addEventListener('click',function(ev){ ev.preventDefault(); openCv(a.getAttribute('data-cv')); }); });
    tabs.forEach(function(t){ t.addEventListener('click',function(){ show(t.getAttribute('data-cv-tab')) }); });
    img.addEventListener('click',function(){ cv.querySelector('.cv-page').classList.toggle('zoom'); });
    document.getElementById('cv-close').addEventListener('click',function(){ cv.close() });
    cv.addEventListener('click',function(ev){ if(ev.target===cv) cv.close(); });
    cv.addEventListener('close',function(){ if(last&&last.focus) last.focus(); });
    function plain(f){ var a=document.createElement('a'); a.href=f.pdf; a.download=f.name; document.body.appendChild(a); a.click(); a.remove(); }
    dl.addEventListener('click',function(){
      var f=files[cur];
      if(dlP){
        dl.disabled=true; say('Preparing download…');
        dlP.then(function(ns){ if(!ns) throw {code:'unavailable'}; dlNs=ns; return fetch(f.pdf); })
          .then(function(r){ if(!r.ok) throw new Error('fetch'); return r.blob(); })
          .then(function(blob){ return dlNs.save({filename:f.name,data:blob}); })
          .then(function(){ say('Saved.'); })
          .catch(function(err){ var c=err&&err.code; say(c==='declined'?'Download cancelled.':c==='rate_limited'?'A download prompt is already open.':'Download isn’t available here.'); })
          .then(function(){ dl.disabled=false; });
      } else plain(f);
    });
  })();
  var yr=document.getElementById('yr'); if(yr) yr.textContent=new Date().getFullYear();
})();
