/* Shared core for every page: helpers, storage, and the course loader.
   Exposes one global, window.EC. Page scripts stay IIFEs and read EC.*.
   A course is picked by ?course=<id>; its content lives in courses/<id>/ (see courses/index.json).
   All paths are relative — the site is served under a project subpath on GitHub Pages. */
(function(){
  "use strict";
  var $ = function(id){ return document.getElementById(id); };
  function isStr(x){ return typeof x === "string" && x.trim().length>0; }
  function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.random()*(i+1)|0; var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
  function toast(msg, ms){ var t=$("toast"); if(!t) return; t.textContent=msg; t.classList.add("show"); clearTimeout(t._t); t._t=setTimeout(function(){ t.classList.remove("show"); }, ms||2000); }
  function show(screens, active){ screens.forEach(function(s){ $(s).classList.toggle("hide", s!==active); }); }
  function el(tag, cls, text){ var e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e; }
  function emptyState(container, text){ container.innerHTML=""; container.appendChild(el("div","modempty",text)); }

  /* ---- storage: localStorage with in-memory fallback ---- */
  var mem = {};
  var LS = (function(){ try{ var k="__t"; localStorage.setItem(k,"1"); localStorage.removeItem(k); return true; }catch(e){ return false; } })();
  function load(key, def){ if(!LS){ return (key in mem) ? mem[key] : def; }
    try{ var v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }catch(e){ return def; } }
  function save(key, val){ mem[key] = val; if(!LS) return;
    try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }
  // ec:<courseId>:<part>:<part>…  e.g. ec:engl114:wb:miss, ec:engl114:mod:<moduleId>:stat
  function key(courseId){ return "ec:" + Array.prototype.slice.call(arguments).join(":"); }

  async function fetchJson(path){
    var res = await fetch(path, { cache: "no-cache" });
    if(!res.ok) throw new Error("HTTP "+res.status+" for "+path);
    var text = await res.text();
    try{ return JSON.parse(text); }
    catch(e){ throw new Error("Invalid JSON in "+path+" — "+e.message); }
  }

  /* ---- courses ---- */
  var COURSE_ID_RE = /^[a-z0-9][a-z0-9-]{1,31}$/;
  function getCourseId(){
    var id = new URLSearchParams(location.search).get("course");
    id = id ? id.trim() : "";
    return COURSE_ID_RE.test(id) ? id : null;
  }
  function courseUrl(page, courseId, hash){
    return page + "?course=" + encodeURIComponent(courseId) + (hash ? "#"+encodeURIComponent(hash) : "");
  }
  // a relative path inside a course folder; rejects anything that could escape it
  function safeRel(p){ return isStr(p) && p.charAt(0)!=="/" && p.indexOf("..")===-1 && p.indexOf(":")===-1 ? p.trim() : null; }
  function paths(id, course){
    var base = "courses/"+id+"/", s = (course && course.sections) || {};
    var wb = s.wordbank || {}, md = s.modules || {}, gr = s.grammar || {};
    return {
      base: base,
      wordbank: base + (safeRel(wb.file) || "wordbank.json"),
      manifest: base + (safeRel(md.manifest) || "modules.json"),
      grammarRef: base + (safeRel(gr.reference) || "grammar/reference.json"),
      grammarManifest: safeRel(gr.manifest) ? base + safeRel(gr.manifest) : null   // future: per-topic slides / CCQs
    };
  }
  function goPicker(id){ location.replace("index.html?missing=" + encodeURIComponent(id || "")); }
  // Resolves { id, course, paths }, or null after redirecting to the picker (replace → no Back-button loop).
  async function loadCourse(){
    var id = getCourseId();
    if(!id){ goPicker(""); return null; }
    try{
      var res = await Promise.all([ fetchJson("courses/index.json"), fetchJson("courses/"+id+"/course.json") ]);
      var reg = res[0], course = res[1];
      var entry = (reg && Array.isArray(reg.courses) ? reg.courses : []).filter(function(c){ return c && c.id===id; })[0];
      if(!entry || entry.enabled===false || !course || course.id!==id || !isStr(course.title_en))
        throw new Error("Course \""+id+"\" is not registered or its course.json is invalid.");
      return { id: id, course: course, paths: paths(id, course) };
    }catch(e){ console.warn(e.message); goPicker(id); return null; }
  }

  /* ---- page chrome driven by course.json ---- */
  function setTicker(words){
    var tk = document.querySelector(".ticker"); if(!tk) return;
    var list = Array.isArray(words) ? words.filter(isStr) : [];
    if(!list.length){ tk.classList.add("hide"); return; }
    var txt = list.join(" · ") + " · ";
    var strips = tk.querySelectorAll(".strip");
    for(var i=0;i<strips.length;i++) strips[i].textContent = txt;
    tk.classList.remove("hide");
  }
  function applyChrome(ctx, opts){
    var c = ctx.course, label = opts.label;
    document.title = (c.code || c.title_en) + " — " + label;
    var eb = document.querySelectorAll('[data-ec="eyebrow"]');
    for(var i=0;i<eb.length;i++) eb[i].textContent = c.title_en + " · " + label;
    var t = c.ticker || {};
    if(opts.tickerKey) setTicker(t[opts.tickerKey] || t.home);
    // every <a data-course-link href="page.html[#hash]"> gets ?course=<id>
    var links = document.querySelectorAll("a[data-course-link]");
    for(var j=0;j<links.length;j++){
      var href = links[j].getAttribute("href") || "", h = href.indexOf("#");
      var page = h>-1 ? href.slice(0,h) : href, hash = h>-1 ? href.slice(h+1) : "";
      links[j].setAttribute("href", courseUrl(page, ctx.id, hash));
    }
  }

  window.EC = {
    $: $, isStr: isStr, shuffle: shuffle, toast: toast, show: show, el: el, emptyState: emptyState,
    load: load, save: save, key: key, fetchJson: fetchJson,
    COURSE_ID_RE: COURSE_ID_RE, getCourseId: getCourseId, courseUrl: courseUrl, paths: paths,
    loadCourse: loadCourse, setTicker: setTicker, applyChrome: applyChrome
  };
})();
