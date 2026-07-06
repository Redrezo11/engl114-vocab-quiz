/* Word Bank — ENGL114 vocab quiz. localStorage persistence (per browser), in-memory fallback. */
(function(){
  "use strict";
  var $ = function(id){ return document.getElementById(id); };
  var ARABS = DATA.map(function(d){ return d.a; });
  var K_MISS = "engl114_misses_v1", K_STAT = "engl114_stats_v1";
  var mem = {};
  var LS = (function(){ try{ var k="__t"; localStorage.setItem(k,"1"); localStorage.removeItem(k); return true; }catch(e){ return false; } })();
  function load(key, def){ if(!LS){ return (key in mem) ? mem[key] : def; }
    try{ var v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }catch(e){ return def; } }
  function save(key, val){ mem[key] = val; if(!LS) return;
    try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }

  var misses = load(K_MISS, []);
  var stats  = load(K_STAT, {ans:0, ok:0});
  var lenChoice = 20;

  function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.random()*(i+1)|0; var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
  function byTerm(t){ for(var i=0;i<DATA.length;i++){ if(DATA[i].t===t) return DATA[i]; } return null; }
  function buildQuestions(mode){
    var pool = mode==="review" ? misses.map(byTerm).filter(Boolean) : DATA.slice();
    pool = shuffle(pool); if(lenChoice>0) pool = pool.slice(0, lenChoice);
    return pool.map(function(card){
      var distract = shuffle(ARABS.filter(function(a){ return a!==card.a; })).slice(0,3);
      return { term:card.t, correct:card.a, options:shuffle([card.a].concat(distract)) };
    });
  }

  var qs=[], idx=0, roundOk=0, roundMiss=[], answered=false, curMode="practice";
  function toast(msg){ var t=$("toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(t._t); t._t=setTimeout(function(){ t.classList.remove("show"); },1600); }
  function show(screen){ ["home","quiz","results"].forEach(function(s){ $(s).classList.toggle("hide", s!==screen); }); }
  function refreshHome(){
    $("s-total").textContent = DATA.length;
    $("s-review").textContent = misses.length;
    $("s-acc").textContent = stats.ans ? Math.round(stats.ok/stats.ans*100)+"%" : "—";
    var rb=$("review"), rs=$("review-sub");
    if(misses.length){ rb.disabled=false; rs.textContent = misses.length+(misses.length===1?" word saved":" words saved"); }
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
      b.innerHTML='<span class="key">'+(i+1)+'</span><span class="txt" dir="rtl" lang="ar">'+opt+'</span>';
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
      roundMiss.forEach(function(t){ var c=byTerm(t);
        var row=document.createElement("div"); row.className="miss";
        row.innerHTML='<span class="en">'+c.t+'</span><span class="ar" dir="rtl" lang="ar">'+c.a+'</span>';
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
  var qrModal=$("qr-modal");
  function openQR(){ qrModal.classList.remove("hide"); $("qr-close").focus(); }
  function closeQR(){ qrModal.classList.add("hide"); $("qr-open").focus(); }
  $("qr-open").onclick=openQR;
  $("qr-close").onclick=closeQR;
  qrModal.addEventListener("click", function(e){ if(e.target.hasAttribute("data-close")) closeQR(); });
  document.addEventListener("keydown", function(e){
    if(!qrModal.classList.contains("hide")){ if(e.key==="Escape") closeQR(); return; }
    if(!$("quiz").classList.contains("hide")){
      if(["1","2","3","4"].indexOf(e.key)>-1 && !answered){
        var b=$("options").children[parseInt(e.key,10)-1]; if(b) b.click();
      } else if((e.key==="Enter"||e.key===" ") && answered){ e.preventDefault(); nextQ(); } }
  });
  refreshHome();
})();
