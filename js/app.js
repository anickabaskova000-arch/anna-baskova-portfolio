/* app.js — interakce webu. Spouští se až po content.js (window.contentReady). */
(function () {
  var currentLang = "cs";

  function init() {
    /* ---- video card playback (Top showcase) ---- */
    var videoItems = Array.prototype.slice.call(document.querySelectorAll(".is-video"));
    videoItems.forEach(function (item) {
      var video = item.querySelector("video");
      if (!video) return;
      item.addEventListener("click", function () {
        if (video.paused) {
          videoItems.forEach(function (other) {
            var ov = other.querySelector("video");
            if (ov && ov !== video && !ov.paused) ov.pause();
          });
          video.play();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () { item.classList.add("playing"); });
      video.addEventListener("pause", function () { item.classList.remove("playing"); });
    });

    /* ---- language toggle (CS / EN) ---- */
    var langToggle = document.getElementById("langToggle");
    var translatable = document.querySelectorAll("[data-cs]");

    function applyLang(lang) {
      document.documentElement.lang = lang === "en" ? "en" : "cs";
      translatable.forEach(function (el) {
        var value = lang === "en" ? el.dataset.en : el.dataset.cs;
        if (value === undefined) return;
        if (el.dataset.html === "1") el.innerHTML = value;
        else el.textContent = value;
      });
      if (langToggle) langToggle.textContent = lang === "en" ? "CS" : "EN";
      currentLang = lang;
    }
    if (langToggle) {
      langToggle.addEventListener("click", function () {
        applyLang(currentLang === "cs" ? "en" : "cs");
      });
    }
  }

  if (window.contentReady && typeof window.contentReady.then === "function") {
    window.contentReady.then(init).catch(init);
  } else {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})();
