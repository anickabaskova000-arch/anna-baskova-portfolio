/*
 * content.js — naplní web daty z /content/*.json (spravováno přes /admin).
 * Když se JSON nepodaří načíst, na stránce zůstane obsah napsaný natvrdo v index.html.
 */
(function () {
  const PLAY_SVG =
    '<svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="26" fill="rgba(0,0,0,0.35)"/><path d="M21 16.5v19l16-9.5z" fill="#fff"/></svg>';

  const esc = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  async function getJSON(path) {
    try {
      const r = await fetch(path, { cache: "no-cache" });
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } catch (e) {
      console.warn("[content] nenačteno:", path, e);
      return null;
    }
  }

  /* ---------- GALLERY ---------- */
  function buildGallery(data) {
    const grid = document.getElementById("gallery-grid");
    if (!grid || !data || !Array.isArray(data.items)) return;
    grid.innerHTML = data.items
      .map((it) => {
        const cat = esc(it.category || "media");
        const cs = esc(it.label_cs || "");
        const en = esc(it.label_en || it.label_cs || "");
        const file = esc(it.file || "");
        const tag = `<span class="tag" data-cs="${cs}" data-en="${en}">${cs}</span>`;
        if ((it.media || "").toLowerCase() === "video") {
          return (
            `<div class="gallery-item is-video" data-cat="${cat}">` +
            `<video src="${file}" preload="metadata" playsinline loop></video>` +
            tag +
            `<span class="play-icon" aria-hidden="true">${PLAY_SVG}</span>` +
            `</div>`
          );
        }
        return (
          `<div class="gallery-item" data-cat="${cat}">` +
          `<img src="${file}" alt="${cs}" loading="lazy">` +
          tag +
          `</div>`
        );
      })
      .join("");
  }

  /* ---------- PRICING ---------- */
  function buildPricing(data) {
    if (!data) return;
    const note = document.querySelector(".pricing-note");
    if (note && data.note_cs) {
      note.dataset.cs = data.note_cs;
      note.dataset.en = data.note_en || data.note_cs;
      note.textContent = data.note_cs;
    }
    const list = document.querySelector(".price-list");
    if (list && Array.isArray(data.blocks)) {
      list.innerHTML = data.blocks
        .map((b, i) => {
          const n = String(i + 1).padStart(2, "0");
          const pts = (b.points_cs || [])
            .map((p, j) => {
              const en = (b.points_en || [])[j] || p;
              return `<li data-cs="${esc(p)}" data-en="${esc(en)}">${esc(p)}</li>`;
            })
            .join("");
          return (
            `<div class="price-block"><div class="price-head">` +
            `<span class="price-num">${n}</span>` +
            `<h3 class="price-name" data-cs="${esc(b.name_cs)}" data-en="${esc(b.name_en || b.name_cs)}">${esc(b.name_cs)}</h3>` +
            `<div class="price-tag" data-cs="${esc(b.price_cs)}" data-en="${esc(b.price_en || b.price_cs)}">${esc(b.price_cs)}</div>` +
            `</div><ul class="price-sub">${pts}</ul></div>`
          );
        })
        .join("");
    }
    const ft = document.querySelector(".pricing-factors-title");
    if (ft && data.factors_title_cs) {
      ft.dataset.cs = data.factors_title_cs;
      ft.dataset.en = data.factors_title_en || data.factors_title_cs;
      ft.textContent = data.factors_title_cs;
    }
    const fl = document.querySelector(".pricing-factors-list");
    if (fl && Array.isArray(data.factors_cs)) {
      fl.innerHTML = data.factors_cs
        .map((f, j) => {
          const en = (data.factors_en || [])[j] || f;
          return `<li data-html="1" data-cs="${esc(f)}" data-en="${esc(en)}">${f}</li>`;
        })
        .join("");
    }
  }

  /* ---------- STATS ("V ČÍSLECH") ---------- */
  function buildStats(data) {
    const grid = document.querySelector(".stats-grid");
    if (!grid || !data || !Array.isArray(data.items)) return;
    grid.innerHTML = data.items
      .map(
        (s) =>
          `<div><div class="num">${esc(s.num)}</div>` +
          `<div class="lbl" data-cs="${esc(s.label_cs)}" data-en="${esc(s.label_en || s.label_cs)}">${esc(s.label_cs)}</div></div>`
      )
      .join("");
  }

  /* ---------- PROFILES (Instagram mockup) ---------- */
  function buildProfiles(data) {
    if (!data || !Array.isArray(data.profiles) || !data.profiles.length) return;

    const note = document.querySelector(".profiles-note");
    if (note && data.note_cs) {
      note.dataset.cs = data.note_cs;
      note.dataset.en = data.note_en || data.note_cs;
      note.textContent = data.note_cs;
    }
    const disc = document.querySelector(".profiles-disclaimer");
    if (disc && data.disclaimer_cs) {
      disc.dataset.cs = data.disclaimer_cs;
      disc.dataset.en = data.disclaimer_en || data.disclaimer_cs;
      disc.textContent = data.disclaimer_cs;
    }

    const sw = document.getElementById("profileSwitch");
    if (sw) {
      sw.innerHTML = data.profiles
        .map(
          (p, i) =>
            `<button${i === 0 ? ' class="active"' : ""} data-profile="${esc(p.id)}">@${esc(p.handle)}</button>`
        )
        .join("");
    }

    // struktura, kterou čeká app.js
    window.PROFILES = {};
    data.profiles.forEach((p) => {
      window.PROFILES[p.id] = {
        user: p.handle,
        avatar: p.avatar,
        posts: p.posts,
        followers: p.followers,
        following: p.following,
        name: { cs: p.name, en: p.name },
        bio: { cs: p.bio_cs, en: p.bio_en || p.bio_cs },
        highlights: {
          cs: p.highlights_cs || [],
          en: p.highlights_en || p.highlights_cs || [],
        },
        feed: p.feed,
      };
    });
    window.PROFILE_ORDER = data.profiles.map((p) => p.id);
  }

  /* ---------- TEXTY ---------- */
  function applyTexts(t) {
    if (!t) return;
    const set = (sel, cs, en, html) => {
      const el = document.querySelector(sel);
      if (!el || cs == null) return;
      el.dataset.cs = cs;
      el.dataset.en = en == null ? cs : en;
      if (html) el.innerHTML = cs;
      else el.textContent = cs;
    };
    set(".hero-tagline", t.hero_tagline_cs, t.hero_tagline_en);
    if (t.hero_badge) {
      const b = document.querySelector(".hero-badge");
      if (b) b.textContent = t.hero_badge;
    }
    set(".about-para", t.about_para_cs, t.about_para_en);
    set(".about-closing", t.about_closing_cs, t.about_closing_en);

    const cards = document.querySelectorAll(".about .stat-card");
    if (cards[0] && t.about_stat1_num != null) {
      cards[0].querySelector(".num").textContent = t.about_stat1_num;
      const l = cards[0].querySelector(".lbl");
      l.dataset.cs = t.about_stat1_cs;
      l.dataset.en = t.about_stat1_en || t.about_stat1_cs;
      l.textContent = t.about_stat1_cs;
    }
    if (cards[1] && t.about_stat2_num != null) {
      cards[1].querySelector(".num").textContent = t.about_stat2_num;
      const l = cards[1].querySelector(".lbl");
      l.dataset.cs = t.about_stat2_cs;
      l.dataset.en = t.about_stat2_en || t.about_stat2_cs;
      l.textContent = t.about_stat2_cs;
    }

    if (t.contact_email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
        a.href = "mailto:" + t.contact_email;
        a.textContent = t.contact_email;
      });
      const ld = document.getElementById("ldjson");
      if (ld) {
        try {
          const j = JSON.parse(ld.textContent);
          j.email = t.contact_email;
          ld.textContent = JSON.stringify(j, null, 2);
        } catch (e) {}
      }
    }
    if (t.contact_instagram_handle) {
      document
        .querySelectorAll('a[href*="instagram.com/"]')
        .forEach((a) => {
          a.href = "https://instagram.com/" + t.contact_instagram_handle;
          if (a.closest(".contact-links"))
            a.textContent = "@" + t.contact_instagram_handle;
        });
    }
  }

  window.contentReady = (async function () {
    const [gallery, pricing, stats, profiles, texts] = await Promise.all([
      getJSON("content/gallery.json"),
      getJSON("content/pricing.json"),
      getJSON("content/stats.json"),
      getJSON("content/profiles.json"),
      getJSON("content/texts.json"),
    ]);
    try { buildGallery(gallery); } catch (e) { console.warn(e); }
    try { buildPricing(pricing); } catch (e) { console.warn(e); }
    try { buildStats(stats); } catch (e) { console.warn(e); }
    try { buildProfiles(profiles); } catch (e) { console.warn(e); }
    try { applyTexts(texts); } catch (e) { console.warn(e); }
  })();
})();
