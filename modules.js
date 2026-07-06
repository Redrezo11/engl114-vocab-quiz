/* ENGL114 English multiple-choice modules.
   Loads modules/manifest.json (a registry), then per-module JSON files on demand.
   Per-module review pile in localStorage (keys prefixed engl114mc_), in-memory fallback.
   Feedback + hints are bilingual (Arabic + English) to scaffold Saudi EFL learners. */
(function(){
  "use strict";
  var $ = function(id){ return document.getElementById(id); };

  /* ---- storage (mirrors app.js: localStorage with in-memory fallback) ---- */
  var mem = {};
  var LS = (function(){ try{ var k="__t"; localStorage.setItem(k,"1"); localStorage.removeItem(k); return true; }catch(e){ return false; } })();
  function load(key, def){ if(!LS){ return (key in mem) ? mem[key] : def; }
    try{ var v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }catch(e){ return def; } }
  function save(key, val){ mem[key] = val; if(!LS) return;
    try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }
  function missKey(id){ return "engl114mc_miss_" + id; }
  function statKey(id){ return "engl114mc_stat_" + id; }

  /* ---- helpers ---- */
  function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.random()*(i+1)|0; var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
  function toast(msg){ var t=$("toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(t._t); t._t=setTimeout(function(){ t.classList.remove("show"); },2200); }
  function show(screen){ ["list","quiz","results"].forEach(function(s){ $(s).classList.toggle("hide", s!==screen); }); }
  function isStr(x){ return typeof x === "string" && x.trim().length>0; }
  function accPct(stat){ return stat && stat.ans ? Math.round(stat.ok/stat.ans*100) : null; }
  function missCount(id){ var m = load(missKey(id), []); return Array.isArray(m) ? m.length : 0; }

  /* ---- validation: turn a raw module file into a clean, playable module ---- */
  function normHint(h){
    if(h==null) return [];
    var arr = Array.isArray(h) ? h : [h];
    return arr.filter(isStr).map(function(s){ return String(s); });
  }
  function validateModule(raw, fileName){
    if(!raw || typeof raw!=="object" || !Array.isArray(raw.questions))
      throw new Error("Module \""+fileName+"\" is missing a questions array.");
    if(raw.schemaVersion && raw.schemaVersion!==1)
      console.warn("Module "+fileName+": unknown schemaVersion "+raw.schemaVersion+" (app supports 1).");
    var questions=[], skipped=0, seen={};
    raw.questions.forEach(function(q, i){
      var ok = q && typeof q==="object"
        && isStr(q.prompt)
        && Array.isArray(q.options) && q.options.length>=2 && q.options.every(isStr)
        && typeof q.answerIndex==="number" && q.answerIndex%1===0
        && q.answerIndex>=0 && q.answerIndex<q.options.length
        && q.feedback && isStr(q.feedback.incorrect);
      if(!ok){ skipped++; return; }
      var id = isStr(q.id) ? q.id : ("q"+(i+1));
      if(seen[id]){ id = id+"-"+(i+1); } seen[id]=1;   // keep ids unique within a module
      questions.push({
        id: id,
        prompt: String(q.prompt),
        options: q.options.map(String),
        answerIndex: q.answerIndex,
        hint: normHint(q.hint),
        fbCorrect: (q.feedback && isStr(q.feedback.correct)) ? String(q.feedback.correct) : "Correct!",
        fbIncorrect: String(q.feedback.incorrect)
      });
    });
    return {
      id: raw.id,
      title: isStr(raw.title) ? raw.title : raw.id,
      shuffleQuestions: raw.shuffleQuestions !== false,
      shuffleOptions: raw.shuffleOptions !== false,
      questions: questions,
      skipped: skipped
    };
  }

  /* ---- manifest + module list ---- */
  var MANIFEST = [];
  async function fetchJson(path){
    var res = await fetch(path, { cache: "no-cache" });
    if(!res.ok) throw new Error("HTTP "+res.status+" for "+path);
    var text = await res.text();
    try{ return JSON.parse(text); }
    catch(e){ throw new Error("Invalid JSON in "+path+" — "+e.message); }
  }

  async function initList(){
    var box = $("modlist");
    var data;
    try{ data = await fetchJson("modules/manifest.json"); }
    catch(e){
      box.innerHTML = "";
      var err = document.createElement("div"); err.className="modempty";
      err.textContent = "Couldn't load the module list. If you're opening this file directly, run a local server (e.g. python -m http.server) or view it on GitHub Pages.";
      box.appendChild(err); return;
    }
    var mods = (data && Array.isArray(data.modules)) ? data.modules : [];
    var seen = {}; MANIFEST = [];
    mods.forEach(function(m){
      if(!m || !isStr(m.id) || !isStr(m.file)) return;
      if(seen[m.id]){ console.warn("Duplicate module id skipped: "+m.id); return; }
      seen[m.id]=1; MANIFEST.push(m);
    });
    renderList();
  }

  function renderList(){
    var box = $("modlist"); box.innerHTML = "";
    if(!MANIFEST.length){
      var empty = document.createElement("div"); empty.className="modempty";
      empty.textContent = "No modules yet. Add a JSON file to /modules and register it in modules/manifest.json.";
      box.appendChild(empty); return;
    }
    MANIFEST.forEach(function(m){
      var stat = load(statKey(m.id), null);
      var acc = accPct(stat), rev = missCount(m.id);
      var card = document.createElement("div"); card.className="modcard";

      var main = document.createElement("div"); main.className="modmain";
      var t = document.createElement("div"); t.className="modtitle"; t.textContent = m.title || m.id; main.appendChild(t);
      if(isStr(m.description)){ var d=document.createElement("div"); d.className="moddesc"; d.textContent=m.description; main.appendChild(d); }
      var meta = document.createElement("div"); meta.className="modmeta";
      var bits = [];
      if(m.count) bits.push(m.count + " questions");
      if(acc!=null) bits.push("accuracy " + acc + "%");
      if(rev) bits.push(rev + " to review");
      meta.textContent = bits.join(" · "); main.appendChild(meta);
      card.appendChild(main);

      var actions = document.createElement("div"); actions.className="modactions";
      var startBtn = document.createElement("button"); startBtn.className="btn btn-primary"; startBtn.type="button";
      startBtn.textContent = "Practice";
      startBtn.onclick = function(){ openModule(m, "practice"); };
      actions.appendChild(startBtn);
      if(rev){
        var revBtn = document.createElement("button"); revBtn.className="btn btn-ghost"; revBtn.type="button";
        revBtn.textContent = "Review ("+rev+")";
        revBtn.onclick = function(){ openModule(m, "review"); };
        actions.appendChild(revBtn);
      }
      card.appendChild(actions);
      box.appendChild(card);
    });
  }

  /* ---- quiz state ---- */
  var MOD=null, byId={}, misses=[], stats={ans:0,ok:0};
  var qs=[], idx=0, roundOk=0, roundMiss=[], answered=false, curMode="practice", lenChoice=0;

  async function openModule(entry, mode){
    var raw;
    try{ raw = await fetchJson("modules/"+entry.file); }
    catch(e){ toast("Couldn't open \""+(entry.title||entry.id)+"\": "+e.message); return; }
    var mod;
    try{ mod = validateModule(raw, entry.file); }
    catch(e){ toast(e.message); return; }
    if(!mod.questions.length){ toast("\""+(entry.title||entry.id)+"\" has no valid questions."); return; }
    if(mod.skipped) toast(mod.skipped+" question"+(mod.skipped===1?"":"s")+" skipped (invalid).");

    MOD = mod; MOD.entryId = entry.id;               // storage keyed by manifest id
    byId = {}; MOD.questions.forEach(function(q){ byId[q.id]=q; });
    misses = load(missKey(MOD.entryId), []); if(!Array.isArray(misses)) misses=[];
    stats  = load(statKey(MOD.entryId), {ans:0,ok:0});
    startRound(mode);
  }

  function buildQuestions(mode){
    var pool = mode==="review"
      ? misses.map(function(id){ return byId[id]; }).filter(Boolean)   // stale ids dropped
      : MOD.questions.slice();
    if(MOD.shuffleQuestions) pool = shuffle(pool);
    if(lenChoice>0) pool = pool.slice(0, lenChoice);
    return pool.map(function(q){
      var order = q.options.map(function(_,i){ return i; });
      if(MOD.shuffleOptions) order = shuffle(order);
      return {
        qid: q.id,
        prompt: q.prompt,
        options: order.map(function(i){ return q.options[i]; }),
        correctIdx: order.indexOf(q.answerIndex),
        hint: q.hint,
        fbCorrect: q.fbCorrect,
        fbIncorrect: q.fbIncorrect
      };
    });
  }

  function startRound(mode){
    curMode = mode;
    qs = buildQuestions(mode);
    if(!qs.length){ toast("Nothing to review in this module yet."); return; }
    idx=0; roundOk=0; roundMiss=[]; show("quiz"); renderQ();
  }

  function renderQ(){
    answered=false; var q=qs[idx];
    $("bar").style.width = (idx/qs.length*100)+"%";
    $("counter").textContent = (idx+1)+" / "+qs.length;
    $("score").innerHTML = '<span class="ok">'+roundOk+'</span> · <span class="bad">'+roundMiss.length+'</span>';
    $("mod-name").textContent = MOD.title + (curMode==="review" ? " · review" : "");
    $("prompt").textContent = q.prompt;

    // hint
    var hb=$("hint-btn"), hint=$("hint");
    hint.className="hint hide"; hint.innerHTML="";
    if(q.hint && q.hint.length){ hb.classList.remove("hide"); hb.disabled=false; }
    else { hb.classList.add("hide"); }

    $("verdict").className="verdict"; $("verdict").innerHTML="";
    $("next").classList.add("hide");
    var box=$("options"); box.innerHTML="";
    q.options.forEach(function(opt,i){
      var b=document.createElement("button");
      b.className="opt"; b.type="button"; b.dataset.i=i;
      var key=document.createElement("span"); key.className="key"; key.textContent=(i+1);
      var txt=document.createElement("span"); txt.className="txt"; txt.setAttribute("dir","auto"); txt.textContent=opt;
      b.appendChild(key); b.appendChild(txt);
      b.onclick=function(){ choose(i); }; box.appendChild(b);
    });
  }

  function revealHint(){
    var q=qs[idx], hint=$("hint");
    if(!q.hint || !q.hint.length) return;
    hint.innerHTML="";
    if(q.hint.length===1){ hint.textContent=q.hint[0]; }
    else {
      var ul=document.createElement("ul");
      q.hint.forEach(function(h){ var li=document.createElement("li"); li.setAttribute("dir","auto"); li.textContent=h; ul.appendChild(li); });
      hint.appendChild(ul);
    }
    hint.classList.remove("hide");
    $("hint-btn").disabled=true;
  }

  function choose(i){
    if(answered) return; answered=true;
    var q=qs[idx]; var correct = i===q.correctIdx;
    var opts=document.querySelectorAll(".opt");
    for(var k=0;k<opts.length;k++){ opts[k].disabled=true;
      var oi=parseInt(opts[k].dataset.i,10);
      if(oi===q.correctIdx) opts[k].classList.add("correct");
      else if(oi===i) opts[k].classList.add("wrong"); }
    $("hint-btn").disabled=true;
    stats.ans++; if(correct) stats.ok++;
    var v=$("verdict");
    if(correct){ roundOk++; v.className="verdict ok";
      v.innerHTML='<span class="badge">CORRECT</span> ';
      v.appendChild(document.createTextNode(q.fbCorrect));
      if(misses.indexOf(q.qid)>-1){ misses=misses.filter(function(id){ return id!==q.qid; }); save(missKey(MOD.entryId),misses); }
    } else { roundMiss.push(q.qid); v.className="verdict bad";
      v.innerHTML='<span class="badge">EXPLANATION</span> ';
      v.appendChild(document.createTextNode(q.fbIncorrect));
      if(misses.indexOf(q.qid)===-1){ misses.push(q.qid); save(missKey(MOD.entryId),misses); } }
    save(statKey(MOD.entryId),stats);
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
      note.innerHTML='Cleared <b>'+cleared+'</b> from review · <b>'+misses.length+'</b> still saved in this module.';
    } else { note.innerHTML='<b>'+roundMiss.length+'</b> added to review · <b>'+misses.length+'</b> saved in this module.'; }
    var wrap=$("res-misswrap"), list=$("res-misslist");
    if(roundMiss.length){ wrap.classList.remove("hide"); list.innerHTML="";
      roundMiss.forEach(function(id){ var q=byId[id]; if(!q) return;
        var row=document.createElement("div"); row.className="miss";
        var en=document.createElement("span"); en.className="en"; en.setAttribute("dir","auto");
        en.textContent = q.options[q.answerIndex];
        var pr=document.createElement("span"); pr.className="ar"; pr.setAttribute("dir","auto");
        pr.textContent = q.prompt.length>60 ? q.prompt.slice(0,60)+"…" : q.prompt;
        row.appendChild(en); row.appendChild(pr); list.appendChild(row); });
    } else { wrap.classList.add("hide"); }
    $("res-review").disabled = misses.length===0;
    show("results");
  }

  function backToList(){ renderList(); show("list"); }

  /* ---- events ---- */
  $("len-seg").addEventListener("click", function(e){
    var b=e.target.closest("button"); if(!b) return; var kids=$("len-seg").children;
    for(var i=0;i<kids.length;i++){ kids[i].setAttribute("aria-pressed", kids[i]===b); }
    lenChoice = parseInt(b.dataset.len,10); });
  $("hint-btn").onclick = revealHint;
  $("next").onclick = nextQ;
  $("again").onclick = function(){ startRound(curMode); };
  $("res-review").onclick = function(){ startRound("review"); };
  $("list-btn").onclick = backToList;
  $("exit").onclick = backToList;
  document.addEventListener("keydown", function(e){
    if(!$("quiz").classList.contains("hide")){
      if(!answered && /^[1-9]$/.test(e.key)){
        var b=$("options").children[parseInt(e.key,10)-1]; if(b) b.click();
      } else if(!answered && (e.key==="h"||e.key==="H")){
        if(!$("hint-btn").classList.contains("hide") && !$("hint-btn").disabled) revealHint();
      } else if((e.key==="Enter"||e.key===" ") && answered){ e.preventDefault(); nextQ(); } }
  });

  initList();
})();
