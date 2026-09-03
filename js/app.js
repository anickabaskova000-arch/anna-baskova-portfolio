/* app.js — interakce webu. Spouští se až po content.js (window.contentReady). */
(function () {
  var currentLang = "cs";

  var DEFAULT_PROFILES = {
    sebamed: {
      user: "sebamedcz", avatar: "assets/logos/sebamed.svg",
      posts: "460", followers: "13,2 tis.", following: "610",
      name: { cs: "sebamed Česko", en: "sebamed Česko" },
      bio: { cs: "Obsah & správa profilu: Anna Bašková", en: "Content & profile management: Anna Bašková" },
      highlights: { cs: ["Novinky", "Tipy"], en: ["News", "Tips"] },
      feed: "assets/instagram/feed-sebamed.jpg",
    },
  };

  function init() {
    var PROFILES = window.PROFILES && Object.keys(window.PROFILES).length ? window.PROFILES : DEFAULT_PROFILES;
    var PROFILE_ORDER = window.PROFILE_ORDER && window.PROFILE_ORDER.length ? window.PROFILE_ORDER : Object.keys(PROFILES);

    /* ---- video grid playback ---- */
    var videoItems = Array.prototype.slice.call(document.querySelectorAll(".gallery-item.is-video"));
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

    /* ---- gallery filter (media type + topic) ---- */
    var galleryItems = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
    var mediaBtns = Array.prototype.slice.call(document.querySelectorAll("#filters-media .filter-btn"));
    var topicBtns = Array.prototype.slice.call(document.querySelectorAll("#filters .filter-btn"));
    var galleryMore = document.getElementById("galleryMore");
    var galleryEmpty = document.getElementById("galleryEmpty");
    var COLLAPSE_COUNT = 8;
    var galState = { media: "all", topic: "all", expanded: false };

    galleryItems.forEach(function (item) {
      item.dataset.media = item.classList.contains("is-video") ? "video" : "foto";
    });

    function applyGallery() {
      var matches = galleryItems.filter(function (item) {
        return (
          (galState.media === "all" || item.dataset.media === galState.media) &&
          (galState.topic === "all" || item.dataset.cat === galState.topic)
        );
      });
      galleryItems.forEach(function (item) { item.classList.add("hidden"); });
      matches.forEach(function (item, i) {
        item.classList.remove("hidden");
        var over = !galState.expanded && i >= COLLAPSE_COUNT;
        item.classList.toggle("collapsed-hidden", over);
      });
      var hiddenCount = matches.length - (galState.expanded ? matches.length : Math.min(COLLAPSE_COUNT, matches.length));
      if (galleryMore) {
        galleryMore.style.display = hiddenCount > 0 ? "block" : "none";
        var lang = currentLang === "en" ? "en" : "cs";
        galleryMore.textContent = galState.expanded
          ? (lang === "en" ? "Show less" : "Zobrazit méně")
          : (lang === "en" ? "Show all" : "Zobrazit vše") + " (" + matches.length + ")";
      }
      if (galleryEmpty) galleryEmpty.style.display = matches.length === 0 ? "block" : "none";
    }

    mediaBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        mediaBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        galState.media = btn.dataset.media;
        galState.expanded = false;
        applyGallery();
      });
    });
    topicBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        topicBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        galState.topic = btn.dataset.filter;
        galState.expanded = false;
        applyGallery();
      });
    });
    if (galleryMore) {
      galleryMore.addEventListener("click", function () {
        galState.expanded = !galState.expanded;
        applyGallery();
        if (!galState.expanded) document.getElementById("work").scrollIntoView({ behavior: "smooth" });
      });
    }

    function jumpToWork(media) {
      var btn = mediaBtns.filter(function (b) { return b.dataset.media === media; })[0] || mediaBtns[0];
      if (btn) btn.click();
      document.getElementById("work").scrollIntoView({ behavior: "smooth" });
    }
    document.querySelectorAll("[data-jump]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        var t = el.dataset.jump;
        if (t === "video" || t === "foto") {
          e.preventDefault();
          jumpToWork(t);
        }
      });
    });

    applyGallery();

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
      renderProfile();
      applyGallery();
    }
    if (langToggle) {
      langToggle.addEventListener("click", function () {
        applyLang(currentLang === "cs" ? "en" : "cs");
      });
    }

    /* ---- managed profiles (Instagram mockup) ---- */
    var currentProfile = PROFILE_ORDER[0];
    var igEls = {
      user: document.getElementById("igUser"),
      avatar: document.getElementById("igAvatar"),
      posts: document.getElementById("igPosts"),
      followers: document.getElementById("igFollowers"),
      following: document.getElementById("igFollowing"),
      name: document.getElementById("igName"),
      bio: document.getElementById("igBio"),
      highlights: document.getElementById("igHighlights"),
      feed: document.getElementById("igFeed"),
    };
    function renderProfile() {
      var p = PROFILES[currentProfile];
      if (!p || !igEls.user) return;
      var lang = currentLang === "en" ? "en" : "cs";
      igEls.user.textContent = p.user;
      igEls.avatar.src = p.avatar;
      igEls.posts.textContent = p.posts;
      igEls.followers.textContent = p.followers;
      igEls.following.textContent = p.following;
      igEls.name.textContent = p.name[lang];
      igEls.bio.textContent = p.bio[lang];
      igEls.highlights.innerHTML = (p.highlights[lang] || [])
        .map(function (h) { return "<div><i></i>" + h + "</div>"; })
        .join("");
      igEls.feed.src = p.feed;
    }
    var sw = document.getElementById("profileSwitch");
    if (sw) {
      sw.addEventListener("click", function (e) {
        var btn = e.target.closest("button");
        if (!btn) return;
        sw.querySelectorAll("button").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        currentProfile = btn.dataset.profile;
        renderProfile();
      });
    }
    renderProfile();
  }

  if (window.contentReady && typeof window.contentReady.then === "function") {
    window.contentReady.then(init).catch(init);
  } else {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})();
