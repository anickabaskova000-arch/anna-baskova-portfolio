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

  /* ---------- TOP SHOWCASE ---------- */
  const SHOWCASE_MAIN_COUNT = 5;

  function buildShowcase(data) {
    const grid = document.getElementById("showcaseGrid");
    const moreBtn = document.getElementById("showcaseMore");
    if (!grid || !data || !Array.isArray(data.items)) return;
    grid.innerHTML = data.items
      .map((it, i) => {
        const cs = esc(it.format_cs || "");
        const en = esc(it.format_en || it.format_cs || "");
        const brand = esc(it.brand || "");
        const extraClass = i >= SHOWCASE_MAIN_COUNT ? " hidden extra" : "";
        return (
          `<div class="showcase-item is-video${extraClass}">` +
          `<video src="${esc(it.file)}" preload="metadata" playsinline loop></video>` +
          `<span class="format-chip" data-cs="${cs}" data-en="${en}">${cs}</span>` +
          (brand ? `<span class="brand-tag">${brand}</span>` : "") +
          `<span class="play-icon" aria-hidden="true">${PLAY_SVG}</span>` +
          `</div>`
        );
      })
      .join("");

    if (moreBtn) {
      const extraCount = Math.max(0, data.items.length - SHOWCASE_MAIN_COUNT);
      if (extraCount <= 0) {
        moreBtn.style.display = "none";
      } else {
        moreBtn.style.display = "block";
        moreBtn.dataset.moreCs = `Zobrazit více videí (${extraCount})`;
        moreBtn.dataset.moreEn = `Show more videos (${extraCount})`;
        moreBtn.dataset.lessCs = "Zobrazit méně";
        moreBtn.dataset.lessEn = "Show less";
        moreBtn.dataset.cs = moreBtn.dataset.moreCs;
        moreBtn.dataset.en = moreBtn.dataset.moreEn;
        moreBtn.textContent = moreBtn.dataset.moreCs;
        moreBtn.dataset.expanded = "0";
      }
    }
  }

  /* ---------- BRANDS ---------- */
  function buildBrands(data) {
    const row = document.getElementById("brandsRow");
    if (!row || !data || !Array.isArray(data.items)) return;
    row.innerHTML = data.items
      .map((b) => `<img src="${esc(b.file)}" alt="${esc(b.name)}" loading="lazy">`)
      .join("");
  }

  /* ---------- HERO INTRO (kdo jsem + jaké typy videí dělám) ---------- */
  function buildHeroIntro(t) {
    if (!t) return;
    const tag = document.querySelector(".hero-tagline");
    if (tag && t.hero_tagline_cs) {
      tag.dataset.cs = t.hero_tagline_cs;
      tag.dataset.en = t.hero_tagline_en || t.hero_tagline_cs;
      tag.textContent = t.hero_tagline_cs;
    }
    const row = document.getElementById("heroFormats");
    if (row && Array.isArray(t.hero_formats)) {
      row.innerHTML = t.hero_formats
        .map((f) => {
          const cs = esc(f.label_cs || "");
          const en = esc(f.label_en || f.label_cs || "");
          return `<span data-cs="${cs}" data-en="${en}">${cs}</span>`;
        })
        .join("");
    }
  }

  /* ---------- TEXTY ---------- */
  function applyTexts(t) {
    if (!t) return;
    if (t.hero_badge) {
      const b = document.querySelector(".hero-badge");
      if (b) b.textContent = t.hero_badge;
    }
    const cta = document.querySelector(".hero-cta");
    if (cta && t.hero_cta_cs) {
      cta.dataset.cs = t.hero_cta_cs;
      cta.dataset.en = t.hero_cta_en || t.hero_cta_cs;
      cta.textContent = t.hero_cta_cs;
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
      document.querySelectorAll('a[href*="instagram.com/"]').forEach((a) => {
        a.href = "https://instagram.com/" + t.contact_instagram_handle;
        if (a.closest(".contact-links")) a.textContent = "@" + t.contact_instagram_handle;
      });
    }
  }

  window.contentReady = (async function () {
    const [showcase, brands, texts] = await Promise.all([
      getJSON("content/showcase.json"),
      getJSON("content/brands.json"),
      getJSON("content/texts.json"),
    ]);
    try { buildShowcase(showcase); } catch (e) { console.warn(e); }
    try { buildBrands(brands); } catch (e) { console.warn(e); }
    try { applyTexts(texts); } catch (e) { console.warn(e); }
    try { buildHeroIntro(texts); } catch (e) { console.warn(e); }
  })();
})();
