(function(){
  /* Echte Adressen pro Seite (yrd.works/soups/). Alle Pfade sind relativ zur Wurzel; <base href> in jeder Seite
     zeigt dorthin und bleibt beim Seitenwechsel ohne Neuladen stehen */
  var R='';
  /* Doppelklick (file://): dort gibt es keine Ordner-Adressen. Die Vorschau laeuft dann wie frueher als eine Seite
     mit #-Adressen (index.html#soups), damit Ueberblenden und Hochschieben genauso funktionieren wie online */
  var FILE=location.protocol==='file:';
  var ROOT=new URL('./',document.baseURI);
  var HOME=new URL('index.html',document.baseURI);
  if(FILE&&location.pathname!==HOME.pathname){   /* Unterseite direkt geoeffnet: auf die Startseite mit # umlenken */
    var k0=decodeURIComponent(location.pathname.slice(ROOT.pathname.length).replace(/index\.html$/,'').replace(/\/$/,''));
    location.replace(HOME.href+(k0?'#'+k0:'')); return;
  }
  function href(k){ return FILE?'index.html'+(k?'#'+k:''):(k?k+'/':'./'); }
  if(FILE) document.querySelectorAll('a[href]').forEach(function(a){
    var h=a.getAttribute('href');
    if(h==='./') a.setAttribute('href','index.html');
    else if(a.hasAttribute('data-pf')) a.setAttribute('href',h+'index.html');   /* Download Portfolio: eigene Seite, kein #-Ziel */
    else if(/^[a-z0-9-]+\/$/i.test(h)&&!a.hasAttribute('data-raum')) a.setAttribute('href','index.html#'+h.slice(0,-1));
  });
  function abs(k){ return new URL(href(k),document.baseURI).href; }
  /* ---------- Wechsel in die 3D-Ansicht: mit dem aktuellen Projekt, der offenen Ebene oder der Rasterreihe, bei der man gerade ist ---------- */
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('[data-raum]'); if(!a) return;
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
    e.preventDefault(); e.stopPropagation();
    var h='';
    if(a.getAttribute('data-raum')==='intro') h='start';
    else {
      var k=curKey(); if(/^r\d+(\.\d+)?$/.test(k)||ROUTES.hasOwnProperty(k)||AWK.hasOwnProperty(k)) k='';   /* #r3 aus der 3D-Rueckfahrt und offene Ebenen (About, News, Contact ...): Ziel ist die Uebersicht, die Reihe wird neu bestimmt */
      if(k) h=k;
      else {
        /* Reihe und Bruchteil an der Leiste oben (z. B. r3.420), damit 3D genau die Scrollposition uebernimmt; Handy nur die Reihe (dort anderes Raster) */
        var ts=document.querySelectorAll('#grid .tile'), cols=Math.max(1,getComputedStyle(document.getElementById('grid')).gridTemplateColumns.split(' ').length), r=0, f=0;
        var rem=Math.min(22,Math.max(10,innerWidth*0.0088)), nav=(innerWidth>700?(.9+4.4)*rem:(.9+4.4)*15), rows=Math.ceil(ts.length/cols);
        if(innerWidth>700){
          for(var j=0;j<rows;j++){ if(ts[j*cols].getBoundingClientRect().top<=nav+0.5) r=j; else break; }
          if(r+1<rows){ var ya=ts[r*cols].getBoundingClientRect().top, yb=ts[(r+1)*cols].getBoundingClientRect().top; f=Math.max(0,Math.min(0.999,(nav-ya)/(yb-ya))); }   /* nicht a/b: a ist der geklickte Link */
        } else {
          for(var j=0;j<ts.length;j++){ if(ts[j].getBoundingClientRect().bottom>90){ r=Math.floor(j/3); break; }   /* 3D hat immer drei Spalten */ }
        }
        h='r'+(f>0.005?(r+f).toFixed(3):r);
      }
    }
    var u=new URL('3d/'+(FILE?'index.html':''),ROOT).href+'#'+h;
    /* Handy (22.10.): aus der Uebersicht das Raster erst von einer Spalte in drei gleiten lassen, so wie 3D beginnt; dann wechseln */
    if(window.YRD_M3GRID&&innerWidth<=700&&/^r\d+$/.test(h)&&!document.body.getAttribute('data-aw')&&!(document.body.getAttribute('data-ov')||'')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      if(a.closest('.vsw')) knobTo(a.closest('.vsw'),a); to3(+h.slice(1),function(){ location.href=u; }); return; }
    if(a.closest('.vsw')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){ knobTo(a.closest('.vsw'),a); setTimeout(function(){ location.href=u; },320); }
    else location.href=u;
  },true);
  /* Handy (22.10.): Schalter List | Overview in der Leiste: eine Spalte oder drei (html.g3), mit derselben Gleitbewegung wie beim Start; die oberste Kachel bleibt oben */
  function cols(three){
    var R=document.documentElement, g=document.getElementById('grid'); if(R.classList.contains('g3')===three) return;
    var ts=[].slice.call(g.querySelectorAll('.tile:not([hidden])')), vh=innerHeight, nav=(.9+4.4)*15, k=0;
    for(var j=0;j<ts.length;j++){ if(ts[j].getBoundingClientRect().bottom>nav+10){ k=j; break; } }
    if(three) cols.k=k; else if(cols.k!=null&&cols.k-cols.k%3===k) k=cols.k;   /* zurueck in die Liste: wieder an derselben Kachel */
    function go(){
      var a=ts.map(function(t){ return t.getBoundingClientRect(); });
      R.classList.toggle('g3',three); if(!three) R.classList.add('g3m');
      window.scrollTo(0,Math.max(0,ts[three?k-k%3:k].getBoundingClientRect().top+scrollY-nav));
      var b=ts.map(function(t){ return t.getBoundingClientRect(); }), on=[];
      ts.forEach(function(t,i){ if((a[i].bottom<0||a[i].top>vh)&&(b[i].bottom<0||b[i].top>vh)) return; on.push(t);
        t.style.transformOrigin='0 0'; t.style.transition='none';
        t.style.transform='translate('+(a[i].left-b[i].left)+'px,'+(a[i].top-b[i].top)+'px) scale('+(a[i].width/b[i].width)+')'; });
      g.offsetWidth;
      requestAnimationFrame(function(){ on.forEach(function(t){ t.style.transition='transform .9s cubic-bezier(.55,0,.15,1)'; t.style.transform=''; }); });
      setTimeout(function(){ R.classList.remove('g3m'); },three?0:750);
      setTimeout(function(){ on.forEach(function(t){ t.style.transition=''; t.style.transformOrigin=''; }); },1100); }
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){ R.classList.toggle('g3',three); return; }
    if(three){ R.classList.add('g3m'); setTimeout(go,180); } else go();
  }
  /* Desktop (22.10.): rechts in der Leiste Project | Overview: Project oeffnet das oberste sichtbare Projekt, Overview fuehrt zurueck */
  document.addEventListener('click',function(e){ var bt=e.target.closest&&e.target.closest('.pmode button'); if(!bt) return; e.preventDefault();
    var ov=document.body.getAttribute('data-ov')||'';
    if(bt.getAttribute('data-p')==='ov'){ if(ov==='project') close(); return; }
    if(ov) return; var nav=(.9+4.4)*Math.min(22,Math.max(10,innerWidth*0.0088)), ts=[].slice.call(document.querySelectorAll('#grid .tile:not([hidden])'));
    for(var j=0;j<ts.length;j++){ if(ts[j].getBoundingClientRect().bottom>nav+20){ ts[j].click(); return; } } });
  document.addEventListener('click',function(e){ var bt=e.target.closest&&e.target.closest('.lmode button'); if(!bt) return; e.preventDefault(); cols(bt.getAttribute('data-l')==='ov'); });
  window.yrdCube=yrdCube;   /* Testrunde 24.10., Ruben: Wuerfel auch fuer das Intro (intro.html) */
  /* Testrunde 24.10., Ruben: am Rechner die 3D-Daten (rund 33 MB) gleich beim Aufruf vorladen: waehrend der Intro-Woerter und des Wuerfels (intro.html zeigt den Fortschritt), danach weiter leise in 2D,
     damit der Wechsel nach 3D ohne Wuerfel auskommt. Nicht auf dem Handy, nicht im Datensparmodus, nicht per Doppelklick (file://). Die Daten landen nur im Browser-Cache, 3d/index.html holt sie von dort.
     window.YRD_PRE = {got, tot, done}; ungepackte Groessen aus projects.js (YRD_3DSZ, setzt build.py nach dem 3D-Bau). */
  (function(){
    if(location.protocol==='file:'||!window.fetch||innerWidth<=700) return;
    var cn=navigator.connection; if(cn&&(cn.saveData||/2g/.test(cn.effectiveType||''))) return;
    if(matchMedia('(pointer:coarse)').matches&&Math.min(screen.width,screen.height)<=500) return;
    var a=document.querySelector('a[href*="3d/"]'); if(!a) return;
    var b3=new URL(a.getAttribute('href'),location.href), SZ=window.YRD_3DSZ||{}, fs=['assets','daten'];
    var pre=window.YRD_PRE={got:0,tot:(SZ.assets||0)+(SZ.daten||0),done:false};
    fs.reduce(function(pr,f){ return pr.then(function(){ return fetch(new URL(f+'.js',b3).href,{priority:'low'}).then(function(r){ if(!r.ok||!r.body) return; var rd=r.body.getReader();
      return (function lies(){ return rd.read().then(function(x){ if(x.done) return; pre.got+=x.value.length; return lies(); }); })(); }); }); },Promise.resolve())
    .then(function(){ pre.done=true; try{ sessionStorage.setItem('yrd3dpre','1'); }catch(e){} },function(){ pre.done=true; });   /* yrd3dpre: 3D zeigt den Wuerfel dann erst spaet (vorlage.html) */
  })();
  function yrdCube(box){ /* Wuerfel als SVG: zwolf Kanten gleich stark, sichtbare durchgezogen, verdeckte gestrichelt; dreht ohne Pause von Vorderansicht (2D) ueber Isometrie (3D) in die naechste Vorderansicht, 0,8 s je Vierteldrehung (22.10.: schneller, mehr Drehung) */
    var NS='http://www.w3.org/2000/svg', sv=document.createElementNS(NS,'svg'), gH=document.createElementNS(NS,'g'), gV=document.createElementNS(NS,'g'), V=[], E=[], L=[], S=13, t0=performance.now(), i, k;
    sv.setAttribute('viewBox','-24 -24 48 48'); sv.setAttribute('width','48'); sv.setAttribute('height','48'); sv.appendChild(gH); sv.appendChild(gV); box.appendChild(sv);
    gH.setAttribute('stroke-dasharray','2.2 2.2');
    for(i=0;i<8;i++) V.push([i&1?1:-1,i&2?1:-1,i&4?1:-1]);
    for(i=0;i<8;i++) for(k=0;k<3;k++){ var j=i|(1<<k); if(j!==i) E.push([i,j,k]); }
    E.forEach(function(){ var l=document.createElementNS(NS,'line'); l.setAttribute('stroke','#0000ff'); l.setAttribute('stroke-width','1.5'); l.setAttribute('fill','none'); gV.appendChild(l); L.push(l); });
    function ez(u){ return u<=0?0:u>=1?1:u*u*(3-2*u); }
    function fr(now){ if(!sv.isConnected) return;
      var t=((now-t0)/800)%1, e=ez(t), ax=-35.26*Math.sin(Math.PI*e), ay=90*e;
      
      var a=ax*Math.PI/180, b=ay*Math.PI/180, ca=Math.cos(a), sa=Math.sin(a), cb=Math.cos(b), sb=Math.sin(b);
      function R(p){ var x=p[0]*cb+p[2]*sb, z=-p[0]*sb+p[2]*cb, y=p[1]; return [x, y*ca-z*sa, y*sa+z*ca]; }
      var P=V.map(R);
      E.forEach(function(ed,n){ var p=V[ed[0]], vis=false, m;
        for(m=0;m<3;m++){ if(m===ed[2]) continue; var nv=[0,0,0]; nv[m]=p[m]; if(R(nv)[2]>1e-3) vis=true; }
        var A=P[ed[0]], B=P[ed[1]], l=L[n], g=vis?gV:gH;
        l.setAttribute('x1',(A[0]*S).toFixed(2)); l.setAttribute('y1',(A[1]*S).toFixed(2)); l.setAttribute('x2',(B[0]*S).toFixed(2)); l.setAttribute('y2',(B[1]*S).toFixed(2));
        if(l.parentNode!==g) g.appendChild(l); });
      requestAnimationFrame(fr); }
    requestAnimationFrame(fr);
  }
  function to3(row,cb){
    var R=document.documentElement, g=document.getElementById('grid'), ts=[].slice.call(g.querySelectorAll('.tile')), vh=innerHeight;
    var need=ts.slice(Math.max(0,row*3-3),row*3+30), done=false;
    need.forEach(function(t){ var im=t.querySelector('img'); if(im) im.loading='eager'; });
    R.classList.add('g3m');
    function go(){ if(done) return; done=true;
      var a=ts.map(function(t){ return t.getBoundingClientRect(); });
      R.classList.add('g3'); var top=parseFloat(getComputedStyle(document.querySelector('main')).paddingTop)||0, r0=ts[Math.min(ts.length-1,row*3)];
      window.scrollTo(0,Math.max(0,r0.getBoundingClientRect().top+scrollY-top));
      var b=ts.map(function(t){ return t.getBoundingClientRect(); }), on=[];
      ts.forEach(function(t,i){ if((a[i].bottom<0||a[i].top>vh)&&(b[i].bottom<0||b[i].top>vh)) return; on.push(t);
        t.style.transformOrigin='0 0'; t.style.transition='none';
        t.style.transform='translate('+(a[i].left-b[i].left)+'px,'+(a[i].top-b[i].top)+'px) scale('+(a[i].width/b[i].width)+')'; });
      g.offsetWidth;
      requestAnimationFrame(function(){ on.forEach(function(t){ t.style.transition='transform .75s cubic-bezier(.55,0,.15,1)'; t.style.transform=''; }); });
      setTimeout(cb,820); }
    Promise.all(need.map(function(t){ var im=t.querySelector('img'); return im&&im.decode?im.decode().catch(function(){}):0; })).then(function(){ setTimeout(go,120); });
    setTimeout(go,900);
  }
  window.addEventListener('pageshow',function(e){ if(e.persisted){ var R=document.documentElement; R.classList.remove('g3','g3m'); document.querySelectorAll('#grid .tile').forEach(function(t){ t.style.transform=t.style.transition=t.style.transformOrigin=''; }); } });
  /* View-Schalter: beim Wechsel erscheint der Knopf auf der aktiven Ansicht und gleitet zur neuen */
  function knobTo(v,el){ var k=v.querySelector('.knob'), on=v.querySelector('.on'); if(!k||!el||!on) return;
    k.style.transition='none'; k.style.width=on.offsetWidth+'px'; k.style.transform='translateX('+on.offsetLeft+'px)';
    v.classList.add('moving'); k.offsetWidth; k.style.transition='';
    k.style.width=el.offsetWidth+'px'; k.style.transform='translateX('+el.offsetLeft+'px)'; }
  window.addEventListener('pageshow',function(){ document.querySelectorAll('.vsw.moving').forEach(function(v){ v.classList.remove('moving'); }); });
  /* Browser-Uebergang beim Verlassen von 2D nur in die 3D-Uebersicht (#r3, dort steht zuerst dasselbe Raster); sonst ueberspringen (3D-Projektraum, Download Portfolio) */
  window.addEventListener('pageswap',function(e){ if(!e.viewTransition) return; var u=''; try{ u=e.activation&&e.activation.entry?e.activation.entry.url:''; }catch(err){} if(!/\/3d\/(index\.html)?#r\d+(\.\d+)?$/.test(u)) e.viewTransition.skipTransition(); });
  /* aktive Ansicht im Schalter: aus About, News, Contact usw. zurueck in die Uebersicht */
  document.addEventListener('click',function(e){ var o=e.target.closest&&e.target.closest('.vsw .on'); if(!o) return; if(ROUTES.hasOwnProperty(curKey())){ e.preventDefault(); close(); } });
  /* ---------- Projekte aus dem Archiv (04 Archives/22- Projekte Archiv) ---------- */
  

  /* ---------- Thumbnails: Heroshot, sonst Pastellflaeche; einheitlich 3:2 ---------- */
  var PASTEL=['#f6c9c4','#f9dcb8','#f7eeb0','#d6ecc0','#bfe3d6','#c3e0ef','#c9d3f3','#dccbf0','#f0c8df','#efd9cc','#e3e8c4','#cfe7e3','#f4d2b0','#d9d4ec','#bcd9c8','#f3e1e8'];
  function esc(t){ return String(t||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function thumb(p,i){
    if(p.img) return '<img class="ph"'+(i>=6?' loading="lazy"':'')+' alt="'+esc(p.title)+'" src="'+R+encodeURI(p.img)+'" style="aspect-ratio:3 / 2;object-fit:cover">';
    if(p.gallery&&p.gallery.length) return '<img class="ph" loading="lazy" alt="'+esc(p.title)+'" src="'+R+encodeURI(p.gallery[0][0])+'" style="aspect-ratio:3 / 2;object-fit:cover">';
    return '<div class="ph" style="aspect-ratio:3 / 2;background:'+(i<0?PASTEL[7]:PASTEL[(i*7+Math.floor(i/8)*3)%PASTEL.length])+'"></div>';
  }
  /* Eigene Adresse pro Projekt, z. B. #soups */
  function slug(t){ return String(t).toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
  var SLUG_IDX={}, RESERVED=['about','information','cv','contact-form','example-project','impressum','datenschutz','contact','news'];
  PROJECTS.forEach(function(p,i){ var b=slug(p.title)||('projekt-'+i), s=b, n=2; while(SLUG_IDX.hasOwnProperty(s)||RESERVED.indexOf(s)>=0) s=b+'-'+(n++); p.slug=s; SLUG_IDX[s]=i; });
  /* Kuratierte Auswahlen (Themen): eigene Adresse, dasselbe Raster gefiltert; wer aus einer Auswahl ein Projekt oeffnet,
     blaettert mit Next / Previous innerhalb der Auswahl und kommt beim Schliessen dorthin zurueck */
  var AWK={}; (window.AUSWAHL||[]).forEach(function(a){ AWK[a.key]=a; });
  var awCur=null;
  /* Geteilte Auswahl aus dem Index: ?sel=<slug>,<slug> zeigt nur diese Arbeiten im Raster, mit Next / Previous innerhalb;
     bleibt beim Oeffnen und Schliessen von Projekten erhalten, All oder YRD.Works fuehren zu allen */
  var SHQ=new URLSearchParams(location.search).get('sel'), SHARED=null;
  if(SHQ){ var _ix=SHQ.split(',').map(function(k){ return SLUG_IDX.hasOwnProperty(k)?SLUG_IDX[k]:-1; }).filter(function(i){ return i>=0; }).sort(function(a,b){ return a-b; });
    if(_ix.length){ SHARED={key:'',shared:true,titel:'Selection',text:'',idx:_ix,id:null}; awCur=SHARED; } }
  /* Besuchszaehler (z.php): je Seitenwechsel eine Zeile, ohne Cookies und ohne IP; bei file:// und lokal nicht */
  var lastT=null;
  function track(h){ if(!window.YRD_Z||FILE||/^(localhost|127\.)/.test(location.hostname)) return; var k=(h||'start')+'|'+(awCur&&awCur.shared?SHQ:''); if(k===lastT) return; lastT=k;
    try{ var f=new FormData(); f.append('v','2d'); f.append('p',/^r\d/.test(h)?'start':(h||'start')); if(awCur&&awCur.shared) f.append('s',SHQ); navigator.sendBeacon(new URL('z.php',ROOT).href,f); }catch(e){} }
  function pdfKey(i){ var g=PROJECTS[i].gallery||[]; return (g[0]&&g[0][0].split('/')[1])||''; }
  function nb(i,d){
    var L=awCur&&awCur.idx, N=PROJECTS.length;
    if(L&&L.length){ var k=L.indexOf(i); if(k<0) return d>0?L[0]:L[L.length-1]; return L[(k+d+L.length)%L.length]; }
    if(i<0) return d>0?0:N-1;
    return (i+d+N)%N;
  }
  function applyAw(){
    var a=awCur, n=0;
    document.querySelectorAll('#grid .tile').forEach(function(t){ var v=(!a||a.idx.indexOf(+t.dataset.i)>=0)&&(!window.YRDSearch||YRDSearch.match(PROJECTS[+t.dataset.i])); t.hidden=!v; n+=v; });   /* Suche (suche.js) blendet zusaetzlich aus */
    document.querySelectorAll('.aw-list a').forEach(function(l){ var h=l.getAttribute('href')||'', on=a?(!a.shared&&h.indexOf(a.key)>=0&&!l.classList.contains('aw-all')):l.classList.contains('aw-all'); if(on) l.setAttribute('aria-current','page'); else l.removeAttribute('aria-current'); });
    var hd=document.getElementById('aw-head'); if(!hd) return;
    hd.hidden=!a; document.body.setAttribute('data-aw',a?a.key:'');
    if(!a) return;
    document.getElementById('aw-t').textContent=a.titel;
    document.getElementById('aw-n').textContent=n+(n===1?' Project':' Projects');
    document.getElementById('aw-pdf').setAttribute('href',a.shared?'portfolio/index.html?p='+a.idx.map(pdfKey).join(','):'portfolio/index.html?mappe='+encodeURIComponent(a.id));
    var tx=document.getElementById('aw-text'); tx.textContent=a.text||''; tx.hidden=!a.text;
    /* [nur Repo 23.10.] Geteilte Auswahl (Ruben): Einleitung DE/EN und ein deutlicher Knopf zu allen Arbeiten */
    var sh=document.getElementById('aw-sh');
    if(!sh){ sh=document.createElement('div'); sh.id='aw-sh'; sh.className='aw-sh';
      sh.innerHTML='<p class="aw-sh-de">Diese Auswahl der Projekte von YRD.Works wurde extra für dich zusammengestellt. Das gesamte Portfolio findest du unter „Alle Arbeiten“.</p>'
        +'<p class="aw-sh-en" lang="en">This selection of YRD.Works projects was put together especially for you. You will find the full portfolio under “All works”.</p>'
        +'<a class="aw-sh-b" href="./" data-home>Alle Arbeiten / All works →</a>';
      sh.querySelector('a').addEventListener('click',function(){ try{ history.replaceState(null,'',location.pathname+location.hash); }catch(e){} });   /* Adresse ohne ?sel=, sonst kaeme beim Neuladen wieder die Auswahl */
      hd.appendChild(sh); }
    sh.hidden=!a.shared;
    var on=document.querySelector('.aw-list a[aria-current]'), li=on&&on.parentNode; if(li&&li.scrollWidth>li.clientWidth) li.scrollLeft=Math.max(0,on.offsetLeft-li.clientWidth/2+on.offsetWidth/2);   /* Handy: gewaehlte Auswahl in der Zeile sichtbar */
  }
  var grid=document.getElementById('grid'), frag=document.createDocumentFragment();
  if(!grid.children.length) PROJECTS.forEach(function(p,i){
    var a=document.createElement('a');
    a.className='tile'; a.href=href(p.slug); a.dataset.i=i;
    a.innerHTML='<div class="phw">'+thumb(p,i)+'</div><div class="caption"><span class="wiggle">'+esc(p.title)+'</span><span class="n">'+esc(p.year)+'</span></div>';
    frag.appendChild(a);
  });
  grid.appendChild(frag);
  if(window.YRDSearch) YRDSearch.register(function(){ applyAw(); return grid.querySelectorAll('.tile:not([hidden])').length; });   /* Suche in der Leiste, nur Desktop (22.10.) */
  /* Aus der 3D-Ansicht zurueck (#r3): an der Rasterreihe oeffnen, bei der die 3D-Rueckfahrt endet; Reihenoberkante wie dort unter der Leiste */
  (function(){
    var m=location.hash.match(/^#r(\d+)$/); if(!m) return;
    function toRow(){
      var cols=Math.max(1,getComputedStyle(grid).gridTemplateColumns.split(' ').length), t=grid.children[Math.min(grid.children.length-1,(+m[1])*cols)]; if(!t) return;
      var rem=Math.min(22,Math.max(10,innerWidth*0.0088)), nav=(innerWidth>700?(.9+4.4)*rem:(.9+4.4)*15);
      if('scrollRestoration' in history) history.scrollRestoration='manual';
      window.scrollTo(0, Math.max(0, t.getBoundingClientRect().top+window.scrollY-nav));
    }
    /* Kacheln um die Zielreihe sofort laden statt bei Bedarf; die 3D-Rueckfahrt hat sie vorgeladen, so erscheint 2D ohne leere Kacheln */
    var r0=+m[1];
    var ps=[];
    for(var j=Math.max(0,(r0-1)*4);j<Math.min(grid.children.length,(r0+3)*4);j++){
      var im=grid.children[j].querySelector('img'); if(!im) continue;
      im.removeAttribute('loading'); im.decoding='sync';
      if(!im.complete) ps.push(new Promise(function(res){ im.addEventListener('load',res); im.addEventListener('error',res); }));
    }
    /* Standbild aus 3D (Klasse r3db, gesetzt im Kopf von template.html): in 0,6 s weich ueberblenden, sobald die Kacheln geladen sind, hoechstens nach 1,5 s */
    var H=document.documentElement;
    if(H.classList.contains('r3db')){
      var off=false; function weg(){ if(off) return; off=true; toRow(); requestAnimationFrame(function(){ H.classList.add('weg'); setTimeout(function(){ H.classList.remove('r3db','weg'); },650); }); }
      Promise.all(ps).then(weg); setTimeout(weg,1500);
    }
    /* Handy (22.10.): aus 3D in drei Spalten an der Reihe ankommen, dann in die eine Spalte gleiten wie beim Start (html.g3, gesetzt im Kopf von template.html) */
    if(H.classList.contains('g3')){
      var ld=document.createElement('div'); ld.id='ld2'; ld.setAttribute('aria-hidden','true'); ld.innerHTML='<div class="ld3"></div>'; document.body.appendChild(ld); yrdCube(ld.firstChild); H.classList.remove('ld2pre');   /* Handy (22.10.): Wuerfel, bis die Kacheln da sind */
      for(var j2=r0*3;j2<Math.min(grid.children.length,(r0+8)*3);j2++){ var im2=grid.children[j2].querySelector('img'); if(!im2) continue; im2.removeAttribute('loading'); if(!im2.complete) ps.push(new Promise(function(res){ im2.addEventListener('load',res); im2.addEventListener('error',res); })); }
      toRow(); var gone=false;
      function to1(){ if(gone) return; gone=true;
        var ts=[].slice.call(grid.querySelectorAll('.tile:not([hidden])')), vh=innerHeight, a=ts.map(function(t){ return t.getBoundingClientRect(); });
        H.classList.remove('g3'); H.classList.add('g3m');
        var nav=(.9+4.4)*15, t0=grid.children[Math.min(grid.children.length-1,r0*3)]; window.scrollTo(0,Math.max(0,t0.getBoundingClientRect().top+scrollY-nav));
        var b=ts.map(function(t){ return t.getBoundingClientRect(); }), on=[];
        ts.forEach(function(t,i){ if((a[i].bottom<0||a[i].top>vh)&&(b[i].bottom<0||b[i].top>vh)) return; on.push(t);
          t.style.transformOrigin='0 0'; t.style.transition='none';
          t.style.transform='translate('+(a[i].left-b[i].left)+'px,'+(a[i].top-b[i].top)+'px) scale('+(a[i].width/b[i].width)+')'; });
        grid.offsetWidth;
        requestAnimationFrame(function(){ on.forEach(function(t){ t.style.transition='transform 1.1s cubic-bezier(.55,0,.15,1)'; t.style.transform=''; }); });
        setTimeout(function(){ H.classList.remove('g3m'); },900);
        setTimeout(function(){ on.forEach(function(t){ t.style.transition=''; t.style.transformOrigin=''; }); },1300); }
      var lw=false; function ldWeg(){ if(lw) return; if(performance.now()<2000){ setTimeout(ldWeg,2000-performance.now()); return; } lw=true; ld.classList.add('weg'); setTimeout(function(){ ld.remove(); },500); setTimeout(to1,650); }
      Promise.all(ps).then(ldWeg); setTimeout(ldWeg,4000);
      return; }
    toRow(); window.addEventListener('load',toRow);
  })();


  var current=0, LANG='de';
  /* Bildzaehler unter der Galerie */
  function setCount(){
    var g=document.getElementById('proj-gal'), c=document.getElementById('proj-count'), im=g.children, n=im.length;
    if(n<2){ c.textContent=''; return; }
    var gl=g.getBoundingClientRect().left, k=0;
    for(var j=0;j<n;j++){ var r=im[j].getBoundingClientRect(); if(r.left-gl<=r.width/2) k=j; }
    if(g.scrollLeft>=g.scrollWidth-g.clientWidth-2) k=n-1;
    c.textContent=(k+1)+' / '+n;
  }
  var cntRaf=0;
  document.getElementById('proj-gal').addEventListener('scroll',function(){ if(!cntRaf) cntRaf=requestAnimationFrame(function(){ cntRaf=0; setCount(); }); },{passive:true});
  /* Sprachumschalter (nur Handy sichtbar), Wahl bleibt ueber Projekte hinweg */
  document.getElementById('proj-bi').addEventListener('click',function(e){
    var b=e.target.closest('.lang-sw button'); if(!b) return;
    LANG=b.dataset.l; this.classList.toggle('show-en',LANG==='en');
  });
  /* News: ein Sprachumschalter fuer alle Beitraege */
  (function(){ var n=document.getElementById('news'), g=n&&n.querySelector('.news-lang'); if(!g) return;
    g.addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return; var en=b.dataset.l==='en';
      n.classList.toggle('show-en',en); g.querySelectorAll('button').forEach(function(x){ x.setAttribute('aria-pressed',String(x===b)); }); }); })();
  /* About: nutzt dieselbe Unterseite wie die Projekte. Portrait in Bilder/about/. */
  
  function fillProject(i){
    var p=i<0?ABOUT:PROJECTS[i]; current=i;
    document.getElementById('proj-name').textContent=p.title;
    var specs=(p.specs||[['Year',p.jahr||p.year],['Location',p.ort],['Type',p.art]]).filter(function(r){return r[1];});
    document.getElementById('proj-specs').innerHTML=specs.map(function(r){return '<div><dt>'+r[0]+'</dt><dd>'+esc(r[1]).replace(/ \/ /g,'\u00a0/ ')+'</dd></div>';}).join('');
    var g=document.getElementById('proj-gal');
    if(p.gallery&&p.gallery.length){
      g.innerHTML=p.gallery.map(function(im,k){
        return '<img'+((k===0&&!p.nocrop&&im[2]<=im[1])?' class="first"':(k===0?'':' loading="lazy"'))+' alt="'+esc(p.title)+' – Bild '+(k+1)+'" src="'+R+encodeURI(im[0])+'" width="'+im[1]+'" height="'+im[2]+'">';
      }).join('');
    } else {
      g.innerHTML=thumb(p,i).replace('class="ph"','class="ph first"');
    }
    g.style.scrollSnapType=p.nocrop?'none':'';
    g.scrollLeft=0;
    var txt=(p.text&&p.text.length)?p.text:(p.desc?[p.desc]:[]);
    var en=p.text_en||[], rows=[];
    /* DE und EN als zwei unabhaengige Spalten: keine Luecken mehr, wenn ein Absatz in einer Sprache laenger ist */
    function paras(a){ return a.filter(function(x){return String(x||'').trim();}).map(function(x){return '<p>'+esc(x)+'</p>';}).join(''); }
    if(txt.length&&en.length) rows.push('<div class="lang-sw caption"><button type="button" data-l="de">DE</button> / <button type="button" data-l="en">EN</button></div>');
    /* Testrunde 23.10., Ruben: Fotocredits klein am Ende des Werktexts (Feld fotos aus werkverzeichnis.json, build.py) */
    var cf=String((i>=0&&p.fotos)||'').trim().replace(/ · /g,', ');
    if(txt.length) rows.push('<div class="de">'+paras(txt)+'</div>');
    if(en.length) rows.push('<div class="en" lang="en">'+paras(en)+'</div>');
    if(cf&&rows.length) rows.push('<p class="credit">'+esc(cf.indexOf(':')>=0?cf:'Fotos / Photos: '+cf)+'</p>');   /* eine Zeile fuer beide Sprachen, mittig */
    if(i<0) rows.push('<div class="legal-row caption"><a href="'+href('impressum')+'">Impressum</a><a href="'+href('datenschutz')+'">Datenschutz</a></div>');
    var bi=document.getElementById('proj-bi'); bi.innerHTML=rows.join(''); bi.hidden=!rows.length; bi.classList.toggle('show-en',LANG==='en');
    document.getElementById('project').classList.toggle('is-proj',i>=0);
    var nx=document.getElementById('proj-next');
    /* Pfeil nach unten: naechstes Projekt, von About aus das erste */
    var q=PROJECTS[nb(i,1)]; nx.href=href(q.slug); document.getElementById('proj-next-t').textContent=q.title;
    setCount();
    if(i>=0) preNb(i);
  }
  /* erste Bilder des vorigen und naechsten Projekts vorladen, damit beim Wechsel das Foto schon da ist */
  function preNb(i){ [1,-1].forEach(function(d){ var q=PROJECTS[nb(i,d)]; (q.gallery||[]).slice(0,2).forEach(function(im){ var x=new Image(); x.src=R+encodeURI(im[0]); }); }); }
  /* beim Laden nicht ueberschreiben: die Seite kommt schon fertig vom Server */


  /* ---------- clocks ---------- */
  var D=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var M=['January','February','March','April','May','June','July','August','September','October','November','December'];
  function tick(){
    var t=new Date(), h=t.getHours(), per=h<12?'AM':'PM', h12=h%12||12;
    document.querySelectorAll('[data-clock]').forEach(function(e){
      e.textContent=D[t.getDay()]+', '+M[t.getMonth()]+' '+t.getDate()+', '+t.getFullYear()+' '+h12+':'+String(t.getMinutes()).padStart(2,'0')+' '+per;
    });
    document.querySelectorAll('[data-year]').forEach(function(e){ e.textContent=t.getFullYear(); });
    document.querySelectorAll('[data-date]').forEach(function(e){
      e.textContent=(t.getMonth()+1)+'.'+String(t.getDate()).padStart(2,'0')+'.'+String(t.getFullYear()).slice(2);
    });
  }
  tick(); setInterval(tick,15000);

  /* ---------- overlay routing ---------- */
  var ROUTES={'example-project':'project','about':'project','information':'project','impressum':'impressum','contact':'contact','news':'news','datenschutz':'datenschutz'};
    function show(id){
    document.querySelectorAll('.overlay').forEach(function(o){
      var on=o.id===id; o.classList.toggle('open',on); o.setAttribute('aria-hidden',on?'false':'true');
      if(on){ o.scrollTop=0; o.style.setProperty('--va','.95'); o.style.setProperty('--np','0'); leaving=false; }
    });
    document.documentElement.style.overflow=id?'hidden':'';
    document.body.setAttribute('data-ov',id||'');   /* steuert die feste untere Leiste (naechstes Projekt, Impressum) */
  }
  var TITLE0=document.documentElement.getAttribute('data-title0')||document.title;
  var TITLES={about:'About',news:'News',contact:'Contact',impressum:'Impressum',datenschutz:'Datenschutz'};
  function curKey(){
    if(FILE) return decodeURIComponent(location.hash.slice(1));
    var p=location.pathname, r=ROOT.pathname;
    if(p.indexOf(r)===0) p=p.slice(r.length);
    return decodeURIComponent(p.replace(/index\.html$/,'').replace(/\/$/,''));
  }
  function known(k){ return k===''||ROUTES.hasOwnProperty(k)||SLUG_IDX.hasOwnProperty(k)||AWK.hasOwnProperty(k); }
  /* Seite wechseln ohne Neuladen; bei file:// (Doppelklick) klassisch weiterblaettern */
  function go(k,replace){
    var u=abs(k); if(k===''&&awCur&&awCur.shared){ var uu=new URL(u); uu.search='?sel='+SHQ; u=uu.href; }
    try{ history[replace?'replaceState':'pushState'](null,'',u); }
    catch(err){ location.href=u; return; }
    route();
  }
  var first=true;
  function route(){
    var h=curKey();
    /* alte Links mit # (yrd.works/#soups) auf die neue Adresse umleiten */
    if(!FILE&&!h&&location.hash.length>1){ var lh=decodeURIComponent(location.hash.slice(1)); if(known(lh)&&lh){ go(lh,true); return; } }
    var id=ROUTES[h]||null;
    if(AWK.hasOwnProperty(h)){ var ch=awCur!==AWK[h]; awCur=AWK[h]; applyAw(); if(ch&&!first) scrollTo(0,0); }
    else if(h===''||/^r\d+(\.\d+)?$/.test(h)){ if(awCur&&!awCur.shared){ awCur=null; applyAw(); } else if(awCur&&first) applyAw(); }
    if(h==='about'||h==='information'){ if(!first||current!==-1) fillProject(-1); }
    else if(SLUG_IDX.hasOwnProperty(h)){ if(!first||current!==SLUG_IDX[h]||!document.getElementById('proj-gal').children.length) fillProject(SLUG_IDX[h]); id='project'; }
    first=false;
    show(id);
    /* About laeuft ueber dieselbe Ebene wie die Projekte: fuer die untere Leiste zaehlt, was geoeffnet ist, nicht die Ebene */
    document.body.setAttribute('data-ov', !id?'':(SLUG_IDX.hasOwnProperty(h)?'project':(h==='information'?'about':h)));
    if(/^r\d+(\.\d+)?$/.test(h)) h='';
    document.title=h?'YRD.Works, '+(SLUG_IDX.hasOwnProperty(h)?PROJECTS[SLUG_IDX[h]].title:(AWK.hasOwnProperty(h)?AWK[h].titel:(TITLES[h]||h))):TITLE0;   /* Testrunde 23.10., Ruben: im Tab zuerst YRD.Works, dann der Projektname */
    track(h);
  }
  grid.addEventListener('click',function(e){ var t=e.target.closest('.tile'); if(t) fillProject(+t.dataset.i); });
  function close(){ var ov=document.body.getAttribute('data-ov'), t=(awCur&&ov)?awCur.key:''; if(!t&&awCur&&!(awCur.shared&&ov)){ awCur=null; SHQ=null; applyAw(); } if(curKey()!==t||(!t&&location.hash)) go(t); else route(); }   /* aus einem Projekt zurueck in die Auswahl, aus der Auswahl (All Projects, Esc) zu allen */
  document.addEventListener('click',function(e){
    if(e.target.closest('[data-home]')){ e.preventDefault(); awCur=null; SHQ=null; applyAw(); if(curKey()||location.hash) go(''); else route(); return; }   /* YRD.Works: immer alle Projekte */
    if(e.target.closest('[data-close]')){ e.preventDefault(); close(); return; }
    // click-out: a click on the veil itself (outside the white panel) closes the project overlay
    if(e.target.id==='project') close();
  });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') close(); });
  /* interne Links abfangen: kein Neuladen, nur die Ebene wechselt */
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
    var a=e.target.closest('a[href]'); if(!a||a.target||a.closest('[data-close],[data-home]')) return;
    var u=new URL(a.href); if(u.protocol!==ROOT.protocol||u.host!==ROOT.host||u.pathname.indexOf(ROOT.pathname)!==0) return;
    var k=FILE?(u.pathname===HOME.pathname?decodeURIComponent(u.hash.slice(1)):null):decodeURIComponent(u.pathname.slice(ROOT.pathname.length).replace(/index\.html$/,'').replace(/\/$/,''));
    if(k===null) return;
    if(!known(k)) return;
    e.preventDefault(); if(a.classList.contains('aw-all')&&awCur){ awCur=null; SHQ=null; applyAw(); } go(k);
  });

  /* ---------- Pfeiltasten auf der Projektseite: Bild fuer Bild, am Ende der Strecke weiter zum naechsten Projekt ---------- */
  var kIdx=0, kTime=0, RM=window.matchMedia('(prefers-reduced-motion: reduce)');
  function galImgs(){ return Array.prototype.slice.call(document.getElementById('proj-gal').children); }
  function galIndex(g,imgs){
    if(Date.now()-kTime<450) return kIdx;              /* waehrend laufender Animation vom Ziel aus weiterzaehlen */
    var gl=g.getBoundingClientRect().left, best=0;
    imgs.forEach(function(im,k){ if(im.getBoundingClientRect().left-gl<=4) best=k; });
    return best;
  }
  function galTo(g,imgs,k){
    var x=g.scrollLeft+imgs[k].getBoundingClientRect().left-g.getBoundingClientRect().left;
    g.scrollTo({left:x, behavior:RM.matches?'auto':'smooth'});
    kIdx=k; kTime=Date.now();
  }
  function stepProject(d){
    if(current<0) return;                               /* About: kein Blaettern */
    var n=nb(current,d);
    if(d>0){ kIdx=0; kTime=0; pushTo(n,0); return; }
    fillProject(n); pov.scrollTop=0; kIdx=0; kTime=0; try{ history.replaceState(null,'',abs(PROJECTS[n].slug)); }catch(err){} document.title='YRD.Works, '+PROJECTS[n].title;
    if(d<0){ var g=document.getElementById('proj-gal'); g.scrollLeft=g.scrollWidth; kIdx=galImgs().length-1; }
  }
  document.addEventListener('keydown',function(e){
    if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft') return;
    if(e.metaKey||e.ctrlKey||e.altKey||e.shiftKey) return;
    if(!document.getElementById('project').classList.contains('open')) return;
    if(e.target.closest&&e.target.closest('input,textarea,select,[contenteditable]')) return;
    e.preventDefault();
    var g=document.getElementById('proj-gal'), imgs=galImgs(), i=galIndex(g,imgs);
    var atEnd=g.scrollLeft>=g.scrollWidth-g.clientWidth-2;
    if(e.key==='ArrowRight'){
      if(i<imgs.length-1&&!(atEnd&&Date.now()-kTime>=450)) galTo(g,imgs,i+1); else stepProject(1);
    } else {
      if(i>0&&g.scrollLeft>2||Date.now()-kTime<450&&kIdx>0) galTo(g,imgs,Math.max(0,i-1)); else stepProject(-1);
    }
  });

  /* ---------- Weiterziehen: unten am Seitenende ins naechste Projekt (About: zur Startseite), oben zur Gesamtansicht ---------- */
  var leaving=false, pov=document.getElementById('project'), panel=pov.querySelector('.panel');
  var lastAbs=0, rises=0, lockUntil=0, lockStart=0, PULL=260, pull=0, pdir=0, pulling=false, lastW=0, pullT=0, ty=null, tx=0, tdir=0;
  function atTop(){ return pov.scrollTop<=0; }
  function atBottom(){ return pov.scrollTop>=pov.scrollHeight-pov.clientHeight-1; }
  function applyPull(){
    var r=Math.min(1,pull/PULL);
    pov.style.transition='none'; panel.style.transition='none';
    panel.style.transform='translateY('+Math.round(pdir*r*90)+'px)';
    panel.style.opacity=''; pov.style.opacity='';   /* oben wie unten: die Seite wird nur angeschoben */
  }
  function clearPull(t){
    clearTimeout(pullT); pull=0; pulling=false;
    pov.style.transition=''; pov.style.opacity=''; panel.style.opacity='';
    panel.style.transition=t||'transform .3s ease, opacity .3s ease'; panel.style.transform='';
  }
  function firePull(){
    var d=pdir; clearPull('none');
    lockUntil=Date.now()+700; lockStart=Date.now();
    if(d>0){ pushTo(nb(current,-1),90,-1); return; }   /* oben: voriges Projekt kommt von oben */
    pushTo(nb(current,1),-90);
  }
  /* Landen bei den Bildern: nach dem Wechsel ist die Seite gesperrt, bis Animation und Nachschwung vorbei sind,
     dann steht sie oben bei der Bildstrecke (auch bei starkem Scrollen, Trackpad und Handy) */
  function holdTop(minMs){
    var t0=Date.now(); pov.style.overflowY='hidden';
    (function wait(){
      var now=Date.now();
      if(now-t0<minMs||(now-lastW<250&&now-t0<4000)){ pov.scrollTop=0; setTimeout(wait,60); return; }
      pov.scrollTop=0; pov.style.overflowY='';
    })();
  }
  /* Projektwechsel (Next, Previous, Scrollen am Rand): alte Seite wird weggeschoben, die neue kommt nach, 1,2 s.
     Am 21.10. kurz durch ein Ueberblenden ersetzt (Missverstaendnis, die Korrektur galt dem 3D-Raumwechsel), wiederhergestellt */
  var DUR=1200;   /* Dauer des Hochschiebens in ms */
  function pushTo(n,off,dir){
    off=off||0; dir=dir||1; var sl=PROJECTS[n].slug;   /* dir 1: neue Seite von unten (naechstes), -1: von oben (voriges) */
    var st=pov.scrollTop, vh=pov.clientHeight, cs=getComputedStyle(pov);   /* Scrollposition VOR dem Sperren merken, sonst zeigt die Momentaufnahme den Seitenanfang */
    holdTop(RM.matches||!panel.animate?0:DUR);
    if(RM.matches||!panel.animate){ go(sl,true); return; }
    var old=document.createElement('div'); old.className='overlay open swap-old'; old.setAttribute('aria-hidden','true');
    ['--gh','--hw','--exit'].forEach(function(v){ old.style.setProperty(v,cs.getPropertyValue(v)); });
    var cl=panel.cloneNode(true); cl.querySelectorAll('[id]').forEach(function(x){ x.removeAttribute('id'); });
    cl.style.transition='none'; cl.style.opacity=''; cl.style.transform='translateY('+(-st)+'px)';
    old.appendChild(cl); document.body.appendChild(old);
    fillProject(n); pov.scrollTop=0; try{ history.replaceState(null,'',abs(sl)); }catch(err){} document.title='YRD.Works, '+PROJECTS[n].title;   /* (22.10.) ersetzt statt neuer Eintrag: Zurueck (auch Safaris Wischgeste) fuehrt zur Uebersicht, nicht zum vorigen Projekt */
    var ease='cubic-bezier(.65,0,.35,1)', dur=DUR;   /* gleichmaessig an- und auslaufend */
    old.animate([{transform:'translateY('+off+'px)'},{transform:'translateY('+(-dir*vh)+'px)'}],{duration:dur,easing:ease,fill:'forwards'}).onfinish=function(){ old.remove(); };
    panel.animate([{transform:'translateY('+(dir*vh+off)+'px)'},{transform:'translateY(0)'}],{duration:dur,easing:ease});
  }
  document.getElementById('proj-next').addEventListener('click',function(e){
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
    e.preventDefault(); pushTo(nb(current,1),0);
  });
  document.getElementById('fnext').addEventListener('click',function(e){
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
    e.preventDefault(); pushTo(nb(current,1),0);
  });
  document.getElementById('fprev').addEventListener('click',function(e){   /* voriges Projekt, kommt von oben wie beim Scrollen am oberen Rand */
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
    e.preventDefault(); pushTo(nb(current,-1),0,-1);
  });
  pov.addEventListener('wheel',function(e){
    var now=Date.now(), gap=now-lastW; lastW=now;
    if(!pov.classList.contains('open')) return;
    /* nach dem Wechsel: Nachschwung abfangen, damit man oben ankommt (hoechstens 1,5 s) */
    if(pov.style.overflowY==='hidden'){ e.preventDefault(); return; }   /* waehrend des Landens: nichts scrollt, nichts loest aus */
    var dy=e.deltaY*(e.deltaMode===1?16:1), dir=dy<0?1:-1, ad=Math.abs(dy);
    /* neue Geste: Pause im Event-Strom ODER zweimal hintereinander steigender Ausschlag (Nachschwung klingt nur ab) */
    rises=(ad>lastAbs*1.15&&ad-lastAbs>=1.5)?rises+1:0; lastAbs=ad;
    var fresh=gap>=180||rises>=2;
    var edge=dir>0?atTop():atBottom();   /* oben am Rand: zum vorigen Projekt, unten: zum naechsten */
    if(!dy||!edge||(pulling&&dir!==pdir)){ if(pulling) clearPull(); return; }
    if(!pulling){ if(!fresh) return; pulling=true; pdir=dir; }   /* nur eine neue Geste am Rand zaehlt, kein Nachschwung */
    pull+=Math.abs(dy); applyPull();
    clearTimeout(pullT); pullT=setTimeout(function(){ clearPull(); },400);
    if(pull>=PULL) firePull();
  },{passive:false});
  pov.addEventListener('touchstart',function(e){
    if(pov.style.overflowY==='hidden'){ ty=null; return; }
    ty=e.touches[0].clientY; tx=e.touches[0].clientX; pull=0;
    tdir=atTop()?1:(atBottom()?-1:0); if(!tdir) ty=null;
  },{passive:true});
  pov.addEventListener('touchmove',function(e){
    if(ty===null||pov.style.overflowY==='hidden') return;
    var dy=e.touches[0].clientY-ty, dx=e.touches[0].clientX-tx;
    if(Math.abs(dx)>Math.abs(dy)){ if(pull) clearPull(); ty=null; return; }
    var dir=dy>0?1:-1, edge=dir>0?atTop():atBottom();
    if(!edge){ if(pull) clearPull(); return; }
    if(tdir!==dir&&!(atTop()&&atBottom())){ if(pull) clearPull(); return; }
    pdir=dir; pull=Math.abs(dy)*2.2; applyPull();
  },{passive:true});
  pov.addEventListener('touchend',function(){ if(ty!==null&&pull>=PULL) firePull(); else if(pull) clearPull(); ty=null; },{passive:true});
  /* Handy (22.10.): im Projekt von links nach rechts wischen fuehrt zurueck zur Uebersicht; nicht in der Bildstrecke und nicht am linken Rand (dort zieht Safari selbst zurueck).
     Das Projekt folgt dem Finger 1:1, der Schleier loest sich dabei auf und die Uebersicht kommt darunter hervor; beim Loslassen gleitet es mit Schwung hinaus oder federt zurueck */
  (function(){ var pan=pov.querySelector('.panel'), sx=null, sy=0, dx=0, on=false, lx=0, lt=0, v=0, W=1, EZ='cubic-bezier(.2,.7,.2,1)';
    function setX(x){ pan.style.transform=x?'translate3d('+x+'px,0,0)':''; pov.style.setProperty('--va',(.95*(1-Math.min(1,x/W))).toFixed(3)); }
    pov.addEventListener('touchstart',function(e){ sx=null; on=false; dx=0; v=0;
      if(e.touches.length!==1||document.body.getAttribute('data-ov')!=='project'||e.target.closest('.proj-gal')||pov.style.overflowY==='hidden') return;
      var t=e.touches[0]; if(t.clientX<24) return; sx=t.clientX; sy=t.clientY; lx=sx; lt=e.timeStamp; W=innerWidth; },{passive:true});
    pov.addEventListener('touchmove',function(e){ if(sx===null) return;
      var t=e.touches[0], x=t.clientX-sx, y=t.clientY-sy;
      if(!on){ if(Math.abs(x)<8&&Math.abs(y)<8) return; if(x>0&&x>Math.abs(y)*1.2){ on=true; sx=t.clientX; x=0; pan.style.transition='none'; pan.style.willChange='transform'; } else { sx=null; return; } }
      if(e.cancelable) e.preventDefault();   /* waehrend des Wischens scrollt die Seite nicht mit */
      var dt=Math.max(1,e.timeStamp-lt); v=.7*v+.3*((t.clientX-lx)/dt); lx=t.clientX; lt=e.timeStamp;
      dx=Math.max(0,x); setX(dx); },{passive:false});
    function end(){ if(sx===null) return; sx=null; if(!on) return; on=false;
      if(dx>W*.33||(v>.45&&dx>30)){
        var ms=Math.round(Math.max(160,Math.min(320,(W-dx)/Math.max(v,1.2)*1.6)));
        pan.style.transition='transform '+ms+'ms '+EZ; pov.style.transition='background-color '+ms+'ms ease'; setX(W);
        setTimeout(function(){ pov.style.transition='none'; close(); requestAnimationFrame(function(){ requestAnimationFrame(function(){
          pan.style.transition='none'; setX(0); pov.style.removeProperty('--va'); pan.style.willChange='';
          requestAnimationFrame(function(){ pan.style.transition=''; pov.style.transition=''; }); }); }); },ms);
      } else {
        pan.style.transition='transform .3s '+EZ; setX(0); pov.style.removeProperty('--va');
        setTimeout(function(){ pan.style.transition=''; pan.style.willChange=''; },320); } }
    pov.addEventListener('touchend',end,{passive:true}); pov.addEventListener('touchcancel',end,{passive:true});
  })();
  window.addEventListener('popstate',route);
  route();

})();
