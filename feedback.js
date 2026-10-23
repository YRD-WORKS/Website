/* Feedback-Knopf fuer die Testrunde (Ruben 23.10.): Lasche am rechten Rand, oeffnet ein Formular,
   "Mail schreiben" oeffnet eine fertig ausgefuellte Mail. Seite, Ansicht, Geraet, System, Browser und
   Bildschirm werden vorbelegt. Abschalten fuer den Release: FEEDBACK=False in build.py (dann ist diese Datei leer). */
(function(){
  if(window.__yrdFb) return; window.__yrdFb=1;
  var MAIL='info@yrd.works';
  var ua=navigator.userAgent||'', touch=('ontouchstart' in window)||navigator.maxTouchPoints>0;
  var w=screen.width||innerWidth, h=screen.height||innerHeight, kurz=Math.min(w,h);
  function sys(){ if(/iPhone|iPod/.test(ua)) return 'iOS'; if(/iPad/.test(ua)||(/Macintosh/.test(ua)&&touch)) return 'iPadOS';
    if(/Android/.test(ua)) return 'Android'; if(/Mac OS X|Macintosh/.test(ua)) return 'macOS'; if(/Windows/.test(ua)) return 'Windows'; return 'anderes'; }
  function brw(){ if(/Edg\//.test(ua)) return 'Edge'; if(/Firefox|FxiOS/.test(ua)) return 'Firefox'; if(/CriOS|Chrome/.test(ua)) return 'Chrome'; if(/Safari/.test(ua)) return 'Safari'; return 'anderer'; }
  function ger(){ var s=sys(); if(s==='iPadOS'||(touch&&kurz>=600&&s!=='macOS'&&s!=='Windows')) return 'Tablet'; if(touch&&kurz<600) return 'Handy'; return 'Computer'; }
  function ansicht(){ var p=location.pathname, hs=location.hash||'';
    if(/\/3d\//.test(p)) return /^#[a-z0-9-]+$/.test(hs)&&!/^#r\d+$/.test(hs)?'3D Projektraum':'3D';
    if(/\/index\/index\.html$|\/index\/$/.test(p)) return 'Index';
    if(/\/portfolio\//.test(p)) return 'Download Portfolio';
    return '2D'; }
  function seite(){ var r=document.getElementById('rtop-t'); if(r&&r.offsetParent!==null&&r.textContent.trim()) return r.textContent.trim();   /* 3D-Projektraum: Titel oben */
    var t=(document.title||'').replace(/,\s*YRD\.Works.*$/,'').replace(/^YRD\.Works,\s*/,''); return t||location.pathname; }
  function opts(name,list,sel){ return list.map(function(v){ return '<label class="fb-o"><input type="radio" name="'+name+'" value="'+v+'"'+(v===sel?' checked':'')+'><span>'+v+'</span></label>'; }).join(''); }
  var css='.fb-tab{position:fixed;right:0;top:50%;transform:translateY(-50%) rotate(180deg);writing-mode:vertical-rl;z-index:2147483000;font:inherit;font-size:13px;line-height:1;letter-spacing:.02em;color:#fff;background:var(--ink,#0000ff);border:0;border-radius:0 8px 8px 0;padding:14px 8px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,255,.25)}'+
    '.fb-ov{position:fixed;inset:0;z-index:2147483001;background:rgba(255,255,255,.75);display:flex;align-items:center;justify-content:center;padding:16px}'+
    '.fb-ov[hidden]{display:none}'+
    '.fb-p{font:inherit;font-size:14px;line-height:1.35;color:var(--ink,#0000ff);background:#fff;width:min(30rem,100%);max-height:calc(100dvh - 32px);overflow:auto;-webkit-overflow-scrolling:touch;border-radius:14px;box-shadow:0 0 0 1px var(--ink,#0000ff),0 12px 40px rgba(0,0,255,.18);padding:18px 18px 16px}'+
    '.fb-p h2{font:inherit;font-size:16px;margin:0 0 4px}.fb-p .fb-sub{margin:0 0 14px;color:var(--ink-4,rgba(0,0,255,.45))}'+
    '.fb-f{margin:0 0 12px}.fb-l{display:block;margin:0 0 5px;color:var(--ink-4,rgba(0,0,255,.45))}'+
    '.fb-r{display:flex;flex-wrap:wrap;gap:6px}'+
    '.fb-o{position:relative;cursor:pointer}.fb-o input{position:absolute;opacity:0;pointer-events:none}'+
    '.fb-o span{display:inline-block;padding:.32em .8em .28em;border-radius:999px;box-shadow:inset 0 0 0 1px var(--ink-4,rgba(0,0,255,.45))}'+
    '.fb-o input:checked+span{background:var(--ink,#0000ff);color:#fff;box-shadow:none}.fb-o input:focus-visible+span{outline:2px solid var(--ink,#0000ff);outline-offset:2px}'+
    '.fb-p input[type=text],.fb-p textarea{font:inherit;font-size:16px;color:var(--ink,#0000ff);width:100%;border:0;border-radius:8px;box-shadow:inset 0 0 0 1px var(--ink-4,rgba(0,0,255,.45));padding:.5em .65em;background:#fff;resize:vertical}'+
    '.fb-p input[type=text]:focus,.fb-p textarea:focus{outline:0;box-shadow:inset 0 0 0 2px var(--ink,#0000ff)}'+
    '.fb-p textarea{min-height:5.5em}.fb-tech{font-size:12px;color:var(--ink-4,rgba(0,0,255,.45));margin:4px 0 14px;word-break:break-word}'+
    '.fb-b{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;align-items:center}'+
    '.fb-btn{font:inherit;font-size:14px;cursor:pointer;border:0;border-radius:999px;padding:.45em 1em .4em;color:var(--ink,#0000ff);background:#fff;box-shadow:inset 0 0 0 1px var(--ink,#0000ff)}'+
    '.fb-btn.solid{background:var(--ink,#0000ff);color:#fff;box-shadow:none}.fb-msg{flex:1 1 100%;text-align:right;min-height:1.2em;font-size:12px}'+
    '.fb-x{float:right;font:inherit;font-size:20px;line-height:1;background:none;border:0;color:var(--ink,#0000ff);cursor:pointer;padding:0 2px}'+
    '.fb-only-bug[hidden]{display:none}'+
    '@media print{.fb-tab,.fb-ov{display:none!important}}';
  function build(){
    if(document.getElementById('fb-tab')) return;
    var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
    var tab=document.createElement('button'); tab.type='button'; tab.id='fb-tab'; tab.className='fb-tab'; tab.textContent='Feedback'; tab.setAttribute('aria-haspopup','dialog');
    var ov=document.createElement('div'); ov.className='fb-ov'; ov.hidden=true;
    var name=''; try{ name=localStorage.getItem('yrd-fb-name')||''; }catch(e){}
    ov.innerHTML='<form class="fb-p" role="dialog" aria-modal="true" aria-labelledby="fb-h" novalidate>'+
      '<button type="button" class="fb-x" aria-label="Schließen">×</button>'+
      '<h2 id="fb-h">Feedback zur neuen Website</h2><p class="fb-sub">Danke fürs Testen! Seite und Gerät sind schon eingetragen, bitte prüfen.</p>'+
      '<div class="fb-f"><span class="fb-l">Was möchtest du melden?</span><div class="fb-r">'+opts('art',['Fehler','Vorschlag'],'Fehler')+'</div></div>'+
      '<div class="fb-f"><label class="fb-l" for="fb-name">Dein Name</label><input type="text" id="fb-name" autocomplete="name" value=""></div>'+
      '<div class="fb-f"><label class="fb-l" for="fb-seite">Wo? (Seite oder Projekt)</label><input type="text" id="fb-seite" value=""></div>'+
      '<div class="fb-f"><span class="fb-l">Ansicht</span><div class="fb-r">'+opts('ansicht',['2D','3D','3D Projektraum','Index','Download Portfolio'],ansicht())+'</div></div>'+
      '<div class="fb-f"><span class="fb-l">Gerät</span><div class="fb-r">'+opts('geraet',['Handy','Tablet','Computer'],ger())+'</div></div>'+
      '<div class="fb-f"><span class="fb-l">System</span><div class="fb-r">'+opts('system',['iOS','iPadOS','Android','macOS','Windows','anderes'],sys())+'</div></div>'+
      '<div class="fb-f"><span class="fb-l">Browser</span><div class="fb-r">'+opts('browser',['Safari','Chrome','Firefox','Edge','anderer'],brw())+'</div></div>'+
      '<div class="fb-f"><label class="fb-l" for="fb-was" id="fb-was-l">Was ist passiert?</label><textarea id="fb-was" rows="4"></textarea></div>'+
      '<div class="fb-f fb-only-bug"><label class="fb-l" for="fb-erw">Was hättest du erwartet? (optional)</label><textarea id="fb-erw" rows="2"></textarea></div>'+
      '<div class="fb-f fb-only-bug"><span class="fb-l">Wie schlimm?</span><div class="fb-r">'+opts('prio',['kaputt, geht nicht','sieht falsch aus','Kleinigkeit'],'sieht falsch aus')+'</div></div>'+
      '<div class="fb-f fb-only-bug"><span class="fb-l">Wie oft?</span><div class="fb-r">'+opts('oft',['immer','manchmal','einmal'],'immer')+'</div></div>'+
      '<p class="fb-tech" id="fb-tech"></p>'+
      '<div class="fb-b"><button type="button" class="fb-btn" id="fb-copy">Text kopieren</button><button type="submit" class="fb-btn solid">Mail schreiben</button><span class="fb-msg" id="fb-msg" aria-live="polite"></span></div>'+
      '<p class="fb-tech">Screenshot oder Bildschirmaufnahme gern an die Mail anhängen. Klappt die Mail nicht, mit „Text kopieren“ in eine Nachricht an Ruben einfügen.</p>'+
      '</form>';
    document.body.appendChild(tab); document.body.appendChild(ov);
    var f=ov.querySelector('form'), $=function(s){ return f.querySelector(s); };
    $('#fb-name').value=name;
    function val(n){ var r=f.querySelector('input[name="'+n+'"]:checked'); return r?r.value:''; }
    function tech(){ return 'Bildschirm '+w+' × '+h+', Fenster '+innerWidth+' × '+innerHeight+' · '+location.href+' · '+new Date().toLocaleString('de-DE')+' · '+ua; }
    function upd(){ var bug=val('art')==='Fehler'; f.querySelectorAll('.fb-only-bug').forEach(function(e){ e.hidden=!bug; }); $('#fb-was-l').textContent=bug?'Was ist passiert?':'Was schlägst du vor?'; }
    function text(){ var bug=val('art')==='Fehler', P={'kaputt, geht nicht':'P1','sieht falsch aus':'P2','Kleinigkeit':'P3'};
      var L=['Art: '+val('art'),'Name: '+$('#fb-name').value.trim(),'Seite: '+$('#fb-seite').value.trim(),'Ansicht: '+val('ansicht'),'Gerät: '+val('geraet'),'System: '+val('system'),'Browser: '+val('browser')];
      if(bug){ L.push('Passiert: '+$('#fb-was').value.trim()); L.push('Erwartet: '+$('#fb-erw').value.trim()); L.push('Wie schlimm: '+val('prio')+' ('+P[val('prio')]+')'); L.push('Wie oft: '+val('oft')); }
      else L.push('Vorschlag: '+$('#fb-was').value.trim());
      L.push('','Technik: '+tech()); return L.join('\n'); }
    function subj(){ var n=$('#fb-name').value.trim(); return '[Testrunde] '+val('art')+(n?' ('+n+')':'')+' · '+($('#fb-seite').value.trim()||val('ansicht')); }
    function open(){ $('#fb-seite').value=seite(); var a=f.querySelector('input[name="ansicht"][value="'+ansicht()+'"]'); if(a) a.checked=true; $('#fb-tech').textContent=tech(); $('#fb-msg').textContent=''; upd(); ov.hidden=false; tab.setAttribute('aria-expanded','true'); setTimeout(function(){ ($('#fb-name').value?$('#fb-was'):$('#fb-name')).focus(); },30); }
    function shut(){ ov.hidden=true; tab.setAttribute('aria-expanded','false'); tab.focus(); }
    function keep(){ try{ localStorage.setItem('yrd-fb-name',$('#fb-name').value.trim()); }catch(e){} }
    function ok(){ if(!$('#fb-was').value.trim()){ $('#fb-msg').textContent='Bitte kurz beschreiben, was du melden möchtest.'; $('#fb-was').focus(); return false; } return true; }
    tab.addEventListener('click',open);
    $('.fb-x').addEventListener('click',shut);
    ov.addEventListener('click',function(e){ if(e.target===ov) shut(); });
    f.addEventListener('change',upd);
    f.addEventListener('submit',function(e){ e.preventDefault(); if(!ok()) return; keep();
      location.href='mailto:'+MAIL+'?subject='+encodeURIComponent(subj())+'&body='+encodeURIComponent(text());
      $('#fb-msg').textContent='Dein Mailprogramm sollte sich jetzt öffnen. Danke!'; });
    $('#fb-copy').addEventListener('click',function(){ if(!ok()) return; keep(); var t=subj()+'\n\n'+text();
      function done(){ $('#fb-msg').textContent='Kopiert. Jetzt in eine Mail oder Nachricht einfügen.'; }
      if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done,function(){ fallback(t); done(); }); else { fallback(t); done(); } });
    function fallback(t){ var a=document.createElement('textarea'); a.value=t; a.style.position='fixed'; a.style.opacity='0'; document.body.appendChild(a); a.select(); try{ document.execCommand('copy'); }catch(e){} a.remove(); }
    /* Eingaben nicht an die Seite durchreichen (3D: Tasten bewegen sonst die Kamera, Wischen dreht den Raum) */
    ['keydown','keyup','keypress','wheel','pointerdown','pointermove','pointerup','touchstart','touchmove','touchend','mousedown','gesturestart'].forEach(function(t){
      ov.addEventListener(t,function(e){ e.stopPropagation(); if(t==='keydown'&&e.key==='Escape') shut(); },{passive:t!=='keydown'});
      tab.addEventListener(t,function(e){ e.stopPropagation(); },{passive:true}); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build); else build();
})();
