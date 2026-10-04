/* Word Bank — course home for ?course=<id>. English word → pick its Arabic meaning.
   Words come from courses/<id>/wordbank.json; review pile + stats in localStorage
   under ec:<course>:wb:miss / ec:<course>:wb:stat (in-memory fallback). */
(function(){
  "use strict";
  var $ = EC.$, el = EC.el, shuffle = EC.shuffle, load = EC.load, save = EC.save;
  var CTX = null, DATA = [], ARABS = [], K_MISS = "", K_STAT = "";
  var misses = [], stats = {ans:0, ok:0};
  var lenChoice = 20;

  function toast(msg){ EC.toast(msg, 1600); }
  function show(screen){ EC.show(["home","quiz","results"], screen); }

  // validate-and-skip: each word needs non-empty t (English) and a (Arabic); duplicate t skipped
  function validateWords(raw){
    var list = (raw && Array.isArray(raw.words)) ? raw.words : [], out = [], seen = {};
    list.forEach(function(w){
      if(!w || !EC.isStr(w.t) || !EC.isStr(w.a)) return;
      if(seen[w.t]){ console.warn("Duplicate word skipped: "+w.t); return; }
      seen[w.t] = 1; out.push({ t: String(w.t), a: String(w.a) });
    });
    return out;
  }

  function byTerm(t){ for(var i=0;i<DATA.length;i++){ if(DATA[i].t===t) return DATA[i]; } return null; }
  function buildQuestions(mode){
    var pool = mode==="review" ? misses.map(byTerm).filter(Boolean) : DATA.slice();
    pool = shuffle(pool); if(lenChoice>0) pool = pool.slice(0, lenChoice);
    var nDistract = Math.min(3, DATA.length-1);
    return pool.map(function(card){
      var distract = shuffle(ARABS.filter(function(a){ return a!==card.a; })).slice(0, nDistract);
      return { term:card.t, correct:card.a, options:shuffle([card.a].concat(distract)) };
    });
  }

  var qs=[], idx=0, roundOk=0, roundMiss=[], answered=false, curMode="practice";
  function refreshHome(){
    $("s-total").textContent = DATA.length;
    $("s-review").textContent = misses.length;
    $("s-acc").textContent = stats.ans ? Math.round(stats.ok/stats.ans*100)+"%" : "—";
    $("start").disabled = DATA.length < 2;
    var rb=$("review"), rs=$("review-sub");
    if(misses.length && DATA.length>=2){ rb.disabled=false; rs.textContent = misses.length+(misses.length===1?" word saved":" words saved"); }
    else{ rb.disabled=true; rs.textContent="nothing saved yet"; }
  }
  function startRound(mode){ curMode=mode; qs=buildQuestions(mode);
    if(!qs.length){ toast("No words to review yet"); return; }
    idx=0; roundOk=0; roundMiss=[]; show("quiz"); renderQ(); }
  function renderQ(){
    answered=false; var q=qs[idx];
    $("bar").style.width = (idx/qs.length*100)+"%";
    $("counter").textContent = (idx+1)+" / "+qs.length;
    $("score").innerHTML = '<span class="ok">'+roundOk+'</span> · <span class="bad">'+roundMiss.length+'</span>';
    $("term").textContent = q.term;
    $("mode-tag").textContent = curMode==="review" ? "review pile" : "";
    $("verdict").className="verdict"; $("verdict").innerHTML="";
    $("next").classList.add("hide");
    var box=$("options"); box.innerHTML="";
    q.options.forEach(function(opt,i){
      var b=document.createElement("button");
      b.className="opt"; b.type="button"; b.dataset.val=opt;
      var txt=el("span","txt",opt); txt.setAttribute("dir","rtl"); txt.setAttribute("lang","ar");
      b.appendChild(el("span","key",String(i+1))); b.appendChild(txt);
      b.onclick=function(){ choose(b,opt); }; box.appendChild(b);
    });
  }
  function choose(btn, val){
    if(answered) return; answered=true;
    var q=qs[idx]; var correct = val===q.correct;
    var opts=document.querySelectorAll(".opt");
    for(var i=0;i<opts.length;i++){ opts[i].disabled=true;
      if(opts[i].dataset.val===q.correct) opts[i].classList.add("correct");
      else if(opts[i]===btn) opts[i].classList.add("wrong"); }
    stats.ans++; if(correct) stats.ok++;
    var v=$("verdict");
    if(correct){ roundOk++; v.className="verdict ok";
      v.innerHTML='<span class="badge">CORRECT</span> Nice — locked in.';
      if(misses.indexOf(q.term)>-1){ misses=misses.filter(function(t){ return t!==q.term; }); save(K_MISS,misses); }
    } else { roundMiss.push(q.term); v.className="verdict bad";
      v.innerHTML='<span class="badge">SAVED</span> Added to your review pile.';
      if(misses.indexOf(q.term)===-1){ misses.push(q.term); save(K_MISS,misses); } }
    save(K_STAT,stats);
    var n=$("next"); n.classList.remove("hide");
    n.textContent = (idx+1>=qs.length) ? "See results" : "Next"; n.focus();
  }
  function nextQ(){ idx++; if(idx>=qs.length){ finish(); } else { renderQ(); } }
  function finish(){
    var total=qs.length, pct=Math.round(roundOk/total*100);
    $("bar").style.width="100%";
    $("res-pct").textContent=pct+"%"; $("res-frac").textContent=roundOk+" / "+total+" correct";
    $("res-eyebrow").textContent = curMode==="review" ? "Review round complete" : "Round complete";
    var note=$("res-note");
    if(curMode==="review"){ var cleared=total-roundMiss.length;
      note.innerHTML='Cleared <b>'+cleared+'</b> from your review pile. <b>'+misses.length+'</b> still saved.';
    } else { note.innerHTML='<b>'+roundMiss.length+'</b> added to your review pile · <b>'+misses.length+'</b> saved in total.'; }
    var wrap=$("res-misswrap"), list=$("res-misslist");
    if(roundMiss.length){ wrap.classList.remove("hide"); list.innerHTML="";
      roundMiss.forEach(function(t){ var c=byTerm(t); if(!c) return;
        var row=el("div","miss"), ar=el("span","ar",c.a);
        ar.setAttribute("dir","rtl"); ar.setAttribute("lang","ar");
        row.appendChild(el("span","en",c.t)); row.appendChild(ar);
        list.appendChild(row); });
    } else { wrap.classList.add("hide"); }
    $("res-review").disabled = misses.length===0; refreshHome(); show("results");
  }

  $("len-seg").addEventListener("click", function(e){
    var b=e.target.closest("button"); if(!b) return; var kids=$("len-seg").children;
    for(var i=0;i<kids.length;i++){ kids[i].setAttribute("aria-pressed", kids[i]===b); }
    lenChoice = parseInt(b.dataset.len,10); });
  $("start").onclick=function(){ startRound("practice"); };
  $("review").onclick=function(){ startRound("review"); };
  $("res-review").onclick=function(){ startRound("review"); };
  $("again").onclick=function(){ startRound(curMode); };
  $("home-btn").onclick=function(){ refreshHome(); show("home"); };
  $("exit").onclick=function(){ refreshHome(); show("home"); };
  $("next").onclick=nextQ;
  $("reset-misses").onclick=function(){ if(!misses.length){ toast("Review pile is already empty"); return; }
    misses=[]; save(K_MISS,misses); refreshHome(); toast("Review pile cleared"); };
  $("reset-all").onclick=function(){ misses=[]; stats={ans:0,ok:0};
    save(K_MISS,misses); save(K_STAT,stats); refreshHome(); toast("All progress reset"); };
  document.addEventListener("keydown", function(e){
    if(!$("quiz").classList.contains("hide")){
      if(["1","2","3","4"].indexOf(e.key)>-1 && !answered){
        var b=$("options").children[parseInt(e.key,10)-1]; if(b) b.click();
      } else if((e.key==="Enter"||e.key===" ") && answered){ e.preventDefault(); nextQ(); } }
  });

  async function init(){
    CTX = await EC.loadCourse(); if(!CTX) return;
    EC.applyChrome(CTX, { label: "Word Bank", tickerKey: "home" });
    K_MISS = EC.key(CTX.id, "wb", "miss"); K_STAT = EC.key(CTX.id, "wb", "stat");
    misses = load(K_MISS, []); if(!Array.isArray(misses)) misses = [];
    stats  = load(K_STAT, {ans:0, ok:0});
    var notice = $("wb-notice");
    try{
      DATA = validateWords(await EC.fetchJson(CTX.paths.wordbank));
      if(DATA.length < 2) EC.emptyState(notice, "Word bank coming soon · قائمة الكلمات قريباً");
    }catch(e){
      DATA = []; console.warn(e.message);
      EC.emptyState(notice, "Couldn't load the word list. If you're opening this file directly, run a local server (e.g. python -m http.server) or view it on GitHub Pages.");
    }
    if(DATA.length < 2) notice.classList.remove("hide");
    ARABS = DATA.map(function(d){ return d.a; });
    refreshHome();
  }
  init();
})();
