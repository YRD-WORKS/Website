/* Suche in der unteren Leiste (Ruben 22.10.): Lupe rechts neben dem Schalter 2D | 3D | Index, nur am Desktop.
   Filtert die Arbeiten der jeweiligen Ansicht: 2D blendet aus, 3D graut aus, Index blendet aus.
   Der Begriff bleibt beim Wechsel der Ansicht stehen (sessionStorage). Jede Ansicht meldet sich mit YRDSearch.register(fn) an;
   fn(q, match) bekommt den Begriff und eine Pruefung match(projekt) -> true/false. */
(function(){
  var KEY='yrd-q', DESK=window.matchMedia('(min-width:701px)');
  var POS='unten';   /* 'oben': als Wort Search vor About im Kopf, wird beim Suchen zur weissen Pille (Ruben 22.10.); 'unten': Lupe neben dem Ansichtsschalter */
  var fns=[], q='';
  try{ q=sessionStorage.getItem(KEY)||''; }catch(e){}
  function norm(s){ return String(s||'').toLocaleLowerCase('de'); }
  function hay(p){
    if(p.__hay) return p.__hay;
    /* Ruben 22.10.: gesucht wird nur in Titel, Jahr, Ort, Art, Tags und Suchwoertern (Werkzeug Projekt-Tags, aus den Werktexten gezogen),
       nicht mehr in den Werktexten. Treffer nur am Wortanfang: Boot findet Bootsfahrt, aber nicht Re:boot Africa */
    var a=[p.title,p.year,p.ort,p.art];
    var T=window.TAGS, g=p.gallery||[], k=(g[0]&&g[0][0]&&g[0][0].split('/')[1])||'';
    if(T&&T.titel&&(!T.projekte||!T.projekte[k])) k=T.titel[p.title]||k;   /* 3D: Bildordner ueber den Titel (dort andere Bildpfade) */
    if(T&&T.projekte&&T.projekte[k]){ a=a.concat(T.projekte[k].tags||[],T.projekte[k].such||[]); }
    var h={kern:' '+wnorm(a.join(' '))};
    try{ Object.defineProperty(p,'__hay',{value:h,enumerable:false}); }catch(e){}
    return h;
  }
  function wnorm(s){ return String(s||'').toLocaleLowerCase('de').replace(/[\u201e\u201c\u201d\u201a\u2018\u2019"'\u00ab\u00bb()\[\]\/\u2013\u2014-]/g,' ').replace(/\s+/g,' '); }
  function hit(h,x){ return h.kern.indexOf(' '+x)>=0; }
  function words(){ return DESK.matches?wnorm(q).split(' ').filter(Boolean):[]; }
  function match(p){ var w=words(); if(!w.length) return true; var h=hay(p); return w.every(function(x){ return hit(h,x); }); }
  function active(){ return words().length>0; }
  var cnt=null;
  function run(){ var n=fns.reduce(function(m,f){ var r=f(active()?q:'',match); return typeof r==='number'?r:m; },null);
    if(cnt) cnt.textContent=(active()&&n!=null)?String(n):''; if(box) box.classList.toggle('active',active()); }
  var box=null, inp=null, btn=null;
  function build(){
    if(document.getElementById('srch')) return;
    var top=POS==='oben'&&document.querySelector('header.nav .links'), v=!top&&document.querySelector('#fbar .vsw, #vswbar .vsw'); if(!top&&!v) return;
    box=document.createElement(top?'span':'div'); box.className='srch'+(top?' srch-top':''); box.id='srch';
    box.innerHTML='<button type="button" class="sb" aria-expanded="false" aria-controls="srch-f" aria-label="Search" title="Search">'+(top?'Search':'<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6.6" cy="6.6" r="4.6"/><path d="M10 10l4.2 4.2"/></svg>')+'</button>'+
      '<span class="sf" id="srch-f" hidden><input type="search" placeholder="Search" autocomplete="off" spellcheck="false" aria-label="Search works"><span class="sn n" aria-live="polite"></span><button type="button" class="qx" aria-label="Clear search">×</button></span>';
    if(top){ top.insertBefore(box,top.firstChild); top.insertBefore(document.createTextNode('    '),box.nextSibling); } else v.parentNode.insertBefore(box,v.nextSibling);
    btn=box.querySelector('.sb'); inp=box.querySelector('input'); cnt=box.querySelector('.sn');
    var f=box.querySelector('.sf');
    function open(){ f.hidden=false; btn.setAttribute('aria-expanded','true'); box.classList.add('open'); }
    function shut(){ if(q.trim()) return; f.hidden=true; btn.setAttribute('aria-expanded','false'); box.classList.remove('open'); }
    function set(v){ q=v; try{ if(q) sessionStorage.setItem(KEY,q); else sessionStorage.removeItem(KEY); }catch(e){} run(); }
    btn.addEventListener('click',function(){ open(); inp.focus(); });
    inp.addEventListener('input',function(){ set(inp.value); });
    box.querySelector('.qx').addEventListener('click',function(){ inp.value=''; set(''); shut(); btn.focus(); });
    ['keydown','keyup','keypress'].forEach(function(t){ inp.addEventListener(t,function(e){ e.stopPropagation();
      if(t==='keydown'&&e.key==='Escape'){ inp.value=''; set(''); shut(); btn.focus(); }
      if(t==='keydown'&&e.key==='Enter'){ inp.blur(); var c=document.body.getAttribute('data-ov'); if(c){ var a=document.querySelector('#fall[data-close], [data-close]'); if(a) a.click(); } } }); });   /* Enter in einem Projekt oder About: zurueck zur Uebersicht mit dem Filter */
    inp.addEventListener('blur',function(){ setTimeout(shut,150); });
    ['pointerdown','mousedown','touchstart','wheel'].forEach(function(t){ box.addEventListener(t,function(e){ e.stopPropagation(); },{passive:true}); });
    if(q){ inp.value=q; open(); }
  }
  window.YRDSearch={ register:function(fn){ fns.push(fn); run(); }, match:match, active:active, term:function(){ return active()?q:''; } };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ build(); run(); }); else { build(); run(); }
  if(DESK.addEventListener) DESK.addEventListener('change',run);
})();
