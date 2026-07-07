/* ENGL114 grammar reference — bilingual study pane.
   Reads grammar-reference.json and renders a jump index + an accordion of topics.
   Each topic's accordion item has id="<slug>" so it is deep-linkable
   (e.g. grammar-reference.html#tag-questions); opening a topic updates the URL hash.
   Forward-looking: future grammar hints link to these #slug anchors. */
(function(){
  "use strict";
  var $ = function(id){ return document.getElementById(id); };
  function isStr(x){ return typeof x === "string" && x.trim().length>0; }

  async function fetchJson(path){
    var res = await fetch(path, { cache: "no-cache" });
    if(!res.ok) throw new Error("HTTP "+res.status+" for "+path);
    var text = await res.text();
    try{ return JSON.parse(text); }
    catch(e){ throw new Error("Invalid JSON in "+path+" — "+e.message); }
  }

  var TOPICS = [], items = {};   // slug -> {head, body} for expand/collapse

  function bilingualRow(en, ar, cls){
    var row = document.createElement("div"); row.className = cls || "gref-bi";
    if(isStr(en)){ var e=document.createElement("div"); e.className="en"; e.setAttribute("dir","auto"); e.textContent=en; row.appendChild(e); }
    if(isStr(ar)){ var a=document.createElement("div"); a.className="ar"; a.setAttribute("dir","auto"); a.textContent=ar; row.appendChild(a); }
    return row;
  }

  function open(slug, scroll){
    var it = items[slug]; if(!it) return;
    it.body.classList.add("open");
    it.head.setAttribute("aria-expanded","true");
    if(location.hash.slice(1) !== slug){
      try{ history.replaceState(null, "", "#"+slug); }catch(e){ location.hash = slug; }
    }
    if(scroll) it.head.scrollIntoView({ behavior:"smooth", block:"start" });
  }
  function toggle(slug){
    var it = items[slug]; if(!it) return;
    if(it.body.classList.contains("open")){
      it.body.classList.remove("open"); it.head.setAttribute("aria-expanded","false");
    } else { open(slug, false); }
  }

  function labelRow(text){ var d=document.createElement("div"); d.className="gref-label"; d.textContent=text; return d; }

  function render(){
    var jump = $("gref-jump"); jump.innerHTML="";
    var list = $("gref-list"); list.innerHTML="";
    items = {};

    TOPICS.forEach(function(t){
      if(!isStr(t.slug)) return;

      // jump chip
      var chip = document.createElement("button");
      chip.type="button"; chip.className="gref-chip";
      chip.textContent = t.id + ". " + (t.title_en || t.slug);
      chip.onclick = function(){ open(t.slug, true); };
      jump.appendChild(chip);

      // accordion item
      var item = document.createElement("div"); item.className="acc-item"; item.id = t.slug;
      var head = document.createElement("button"); head.type="button"; head.className="acc-head";
      head.setAttribute("aria-expanded","false");
      var htxt = document.createElement("span"); htxt.className="acc-htxt";
      var en = document.createElement("span"); en.className="acc-en"; en.textContent = t.id + ". " + (t.title_en||"");
      var ar = document.createElement("span"); ar.className="acc-ar"; ar.setAttribute("dir","rtl"); ar.setAttribute("lang","ar"); ar.textContent = t.title_ar||"";
      htxt.appendChild(en); htxt.appendChild(ar);
      var caret = document.createElement("span"); caret.className="acc-caret"; caret.setAttribute("aria-hidden","true"); caret.textContent="▸";
      head.appendChild(htxt); head.appendChild(caret);
      head.onclick = function(){ toggle(t.slug); };

      var body = document.createElement("div"); body.className="acc-body";

      // explanation (en + ar)
      body.appendChild(bilingualRow(t.explanation_en, t.explanation_ar, "gref-explain"));

      // structure
      if(isStr(t.structure)){
        body.appendChild(labelRow("Structure"));
        var st=document.createElement("div"); st.className="gref-structure"; st.setAttribute("dir","auto"); st.textContent=t.structure;
        body.appendChild(st);
      }

      // examples
      if(Array.isArray(t.examples) && t.examples.length){
        body.appendChild(labelRow("Examples · أمثلة"));
        var ex=document.createElement("div"); ex.className="gref-examples";
        t.examples.forEach(function(p){ ex.appendChild(bilingualRow(p.en, p.ar, "gref-ex")); });
        body.appendChild(ex);
      }

      // common mistakes
      if(Array.isArray(t.common_mistakes) && t.common_mistakes.length){
        body.appendChild(labelRow("Common mistakes · أخطاء شائعة"));
        var cm=document.createElement("div"); cm.className="gref-mistakes";
        t.common_mistakes.forEach(function(p){ cm.appendChild(bilingualRow(p.en, p.ar, "gref-mis")); });
        body.appendChild(cm);
      }

      item.appendChild(head); item.appendChild(body);
      list.appendChild(item);
      items[t.slug] = { head:head, body:body };
    });

    // open a deep-linked topic on load
    var slug = decodeURIComponent(location.hash.slice(1));
    if(slug && items[slug]) open(slug, true);
  }

  // support back/forward navigation between topics
  window.addEventListener("hashchange", function(){
    var slug = decodeURIComponent(location.hash.slice(1));
    if(slug && items[slug]) open(slug, true);
  });

  async function init(){
    var list = $("gref-list");
    var data;
    try{ data = await fetchJson("grammar-reference.json"); }
    catch(e){
      list.innerHTML="";
      var err=document.createElement("div"); err.className="modempty";
      err.textContent = "Couldn't load the grammar reference. If you're opening this file directly, run a local server (e.g. python -m http.server) or view it on GitHub Pages.";
      list.appendChild(err); return;
    }
    TOPICS = (data && Array.isArray(data.topics)) ? data.topics : [];
    if(!TOPICS.length){
      list.innerHTML=""; var em=document.createElement("div"); em.className="modempty";
      em.textContent="No grammar topics found."; list.appendChild(em); return;
    }
    render();
  }

  init();
})();
