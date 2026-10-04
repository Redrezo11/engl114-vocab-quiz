/* Course picker (index.html). Lists the courses registered in courses/index.json,
   reading each course's courses/<id>/course.json for its card. Also owns the QR modal. */
(function(){
  "use strict";
  var $ = EC.$, el = EC.el, isStr = EC.isStr;

  function courseCard(id, c){
    var card = el("div", "modcard course-card");
    var main = el("div", "modmain");
    var title = el("div", "modtitle", c.code || c.title_en);
    if(c.status === "draft") title.appendChild(el("span", "tag-soon", "Coming soon · قريباً"));
    main.appendChild(title);
    if(isStr(c.title_ar)){ var ar = el("div", "course-ar", c.title_ar); ar.setAttribute("dir","rtl"); ar.setAttribute("lang","ar"); main.appendChild(ar); }
    if(isStr(c.description_en)) main.appendChild(el("div", "moddesc", c.description_en));
    if(isStr(c.level)) main.appendChild(el("div", "modmeta", c.level));
    card.appendChild(main);
    var actions = el("div", "modactions");
    var open = el("a", "btn btn-primary", "Open →"); open.href = EC.courseUrl("course.html", id);
    actions.appendChild(open); card.appendChild(actions);
    return card;
  }

  async function init(){
    // a course page redirects here with ?missing=<id> when the course is unknown or disabled
    var params = new URLSearchParams(location.search);
    if(params.has("missing")){
      var m = (params.get("missing") || "").trim();
      EC.toast(EC.COURSE_ID_RE.test(m) ? "Course \""+m+"\" not found — choose a course below." : "Choose a course to continue.", 3000);
      try{ history.replaceState(null, "", location.pathname); }catch(e){}
    }
    var box = $("course-list"), reg;
    try{ reg = await EC.fetchJson("courses/index.json"); }
    catch(e){
      EC.emptyState(box, "Couldn't load the course list. If you're opening this file directly, run a local server (e.g. python -m http.server) or view it on GitHub Pages.");
      return;
    }
    var entries = (reg && Array.isArray(reg.courses) ? reg.courses : []).filter(function(c){
      return c && EC.COURSE_ID_RE.test(c.id) && c.enabled !== false; });
    var results = await Promise.allSettled(entries.map(function(c){ return EC.fetchJson("courses/"+c.id+"/course.json"); }));
    box.innerHTML = "";
    results.forEach(function(r, i){
      var id = entries[i].id;
      if(r.status !== "fulfilled" || !r.value || r.value.id !== id || !isStr(r.value.title_en)){
        console.warn("Course skipped (missing or invalid course.json): "+id); return; }
      box.appendChild(courseCard(id, r.value));
    });
    if(!box.children.length) EC.emptyState(box, "No courses yet · لا توجد مقررات بعد");
  }

  /* ---- QR modal ---- */
  var qrModal=$("qr-modal");
  function openQR(){ qrModal.classList.remove("hide"); $("qr-close").focus(); }
  function closeQR(){ qrModal.classList.add("hide"); $("qr-open").focus(); }
  $("qr-open").onclick=openQR;
  $("qr-close").onclick=closeQR;
  qrModal.addEventListener("click", function(e){ if(e.target.hasAttribute("data-close")) closeQR(); });
  document.addEventListener("keydown", function(e){
    if(!qrModal.classList.contains("hide") && e.key==="Escape") closeQR();
  });

  init();
})();
