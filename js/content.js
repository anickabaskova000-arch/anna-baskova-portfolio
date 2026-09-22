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

  /* ---------- HERO STATS ---------- */
  function buildHeroStats(data) {
    const el = document.getElementById("heroStats");
    if (!el || !data || !Array.isArray(data.items)) return;
    el.innerHTML = data.items
      .map(
        (s) =>
          `<div><div class="num">${esc(s.num)}</div>` +
          `<div class="lbl" data-cs="${esc(s.label_cs)}" data-en="${esc(s.label_en || s.label_cs)}">${esc(s.label_cs)}</div></div>`
      )
      .join("");
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

  /* ---------- WHY WORK WITH ME ---------- */
  function buildWhy(texts) {
    if (!texts) return;
    const para = document.querySelector(".why-para");
    if (para && texts.why_para_cs) {
      para.dataset.cs = texts.why_para_cs;
      para.dataset.en = texts.why_para_en || texts.why_para_cs;
      para.textContent = texts.why_para_cs;
    }
    const grid = document.getElementById("whyGrid");
    if (grid && Array.isArray(texts.why_points)) {
      grid.innerHTML = texts.why_points
        .map((p, i) => {
          const n = String(i + 1) + ".";
          return (
            `<div class="why-point"><span class="fnum">${n}</span>` +
            `<h4 data-cs="${esc(p.title_cs)}" data-en="${esc(p.title_en || p.title_cs)}">${esc(p.title_cs)}</h4>` +
            `<p data-cs="${esc(p.desc_cs)}" data-en="${esc(p.desc_en || p.desc_cs)}">${esc(p.desc_cs)}</p></div>`
          );
        })
        .join("");
    }
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
    const list = document.getElementById("priceList");
    if (list && Array.isArray(data.blocks)) {
      list.innerHTML = data.blocks
        .map((b) => {
          const pts = (b.points_cs || [])
            .map((p, j) => {
              const en = (b.points_en || [])[j] || p;
              return `<li data-cs="${esc(p)}" data-en="${esc(en)}">${esc(p)}</li>`;
            })
            .join("");
          return (
            `<div class="price-block"><div class="price-head">` +
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
    const fl = document.getElementById("pricingFactors");
    if (fl && Array.isArray(data.factors_cs)) {
      fl.innerHTML = data.factors_cs
        .map((f, j) => {
          const en = (data.factors_en || [])[j] || f;
          return `<li data-html="1" data-cs="${esc(f)}" data-en="${esc(en)}">${f}</li>`;
        })
        .join("");
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

  /* ---------- TEXTY ---------- */
  function applyTexts(t) {
    if (!t) return;
    const set = (sel, cs, en) => {
      const el = document.querySelector(sel);
      if (!el || cs == null) return;
      el.dataset.cs = cs;
      el.dataset.en = en == null ? cs : en;
      el.textContent = cs;
    };
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
    const [stats, showcase, pricing, brands, texts] = await Promise.all([
      getJSON("content/stats.json"),
      getJSON("content/showcase.json"),
      getJSON("content/pricing.json"),
      getJSON("content/brands.json"),
      getJSON("content/texts.json"),
    ]);
    try { buildHeroStats(stats); } catch (e) { console.warn(e); }
    try { buildShowcase(showcase); } catch (e) { console.warn(e); }
    try { buildPricing(pricing); } catch (e) { console.warn(e); }
    try { buildBrands(brands); } catch (e) { console.warn(e); }
    try { applyTexts(texts); } catch (e) { console.warn(e); }
    try { buildWhy(texts); } catch (e) { console.warn(e); }
  })();
})();
