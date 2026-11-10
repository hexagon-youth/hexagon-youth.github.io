/* Hexagon of Youth – final report website. Shared behaviour for the five pages. No dependencies. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const SHOT = location.search.includes('shot');
  if (SHOT) document.documentElement.classList.add('shot');
  const reduce = SHOT || matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- top bar + phone menu ---------- */
  const top = $('#top'), sheet = $('#sheet');
  const onScroll = () => top.classList.toggle('solid', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#burger').addEventListener('click', () => sheet.classList.add('open'));
  $('#sheetx').addEventListener('click', () => sheet.classList.remove('open'));

  /* ---------- reveal on scroll + counting numbers ---------- */
  const AR = (s) => String(s).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
  const fmt = (n, dec) => AR(n.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, '٬'));
  function count(el) {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
    if (reduce) { el.textContent = fmt(to, dec); return; }
    const t0 = performance.now(), dur = 1700;
    const step = (t) => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4); el.textContent = fmt(to * e, dec); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target); }), { threshold: .12, rootMargin: '0px 0px -7% 0px' });
  $$('.rv').forEach((e) => io.observe(e));
  const cio = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; count(e.target); cio.unobserve(e.target); }), { threshold: .5 });
  $$('[data-count]').forEach((e) => cio.observe(e));

  /* ---------- switches (day 1 / day 2, tabs) ---------- */
  const press = (box, btn) => $$('button', box).forEach((b) => b.setAttribute('aria-pressed', b === btn));
  $$('[data-sw]').forEach((box) => box.addEventListener('click', (ev) => {
    const b = ev.target.closest('button'); if (!b) return; press(box, b);
    $$(`[data-pane="${box.dataset.sw}"]`).forEach((p) => { p.hidden = p.dataset.t !== b.dataset.t; if (!p.hidden) { p.classList.remove('fade'); void p.offsetWidth; p.classList.add('fade', 'in'); } });
  }));

  /* ---------- six pillars ---------- */
  const comb = $('.comb');
  if (comb) comb.addEventListener('click', (ev) => {
    const b = ev.target.closest('.pz'); if (!b) return; press(comb, b);
    $$('.pd > div, .pdph > div').forEach((p) => { p.hidden = p.dataset.i !== b.dataset.i; if (!p.hidden) { p.classList.remove('fade'); void p.offsetWidth; p.classList.add('fade'); } });
  });

  /* ---------- flags ---------- */
  const flags = $('.flagrow'), fd = $('#fdetail');
  if (flags) flags.addEventListener('click', (ev) => {
    const b = ev.target.closest('.flag'); if (!b) return; press(flags, b);
    fd.innerHTML = `<div class="fade"><h4>${b.dataset.n}</h4><p>${b.dataset.r} <span>${b.dataset.m}</span></p></div>`;
  });

  /* ---------- photo strip: drag to scroll ---------- */
  $$('.strip').forEach((s) => {
    let down = false, x0 = 0, l0 = 0, moved = 0;
    s.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; x0 = e.clientX; l0 = s.scrollLeft; });
    addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - x0; moved = Math.max(moved, Math.abs(dx)); if (moved > 4) s.classList.add('drag'); s.scrollLeft = l0 - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = false; setTimeout(() => s.classList.remove('drag'), 0); });
    s.addEventListener('click', (e) => { if (moved > 6) { e.stopPropagation(); e.preventDefault(); } }, true);
  });

  /* ---------- lightbox ---------- */
  const zooms = () => $$('.ph.zoom').filter((f) => f.offsetParent !== null);
  let lb = null, list = [], at = 0;
  const A = (d) => `<svg class="ic" viewBox="0 0 24 24" style="width:22px;height:22px">${d}</svg>`;
  function show(i) {
    at = (i + list.length) % list.length; const f = list[at];
    $('img', lb).src = $('img', f).src; $('figcaption', lb).textContent = f.dataset.cap || '';
  }
  function open(fig) {
    list = zooms(); lb = document.createElement('div'); lb.className = 'lb';
    lb.innerHTML = `<figure><img alt=""><figcaption></figcaption></figure><button class="cl" aria-label="إغلاق">${A('<path d="M6 6l12 12M18 6 6 18"/>')}</button><button class="pv" aria-label="السابق">${A('<path d="M5 12h14M13 6l6 6-6 6"/>')}</button><button class="nx" aria-label="التالي">${A('<path d="M19 12H5M11 6l-6 6 6 6"/>')}</button>`;
    document.body.append(lb); show(list.indexOf(fig));
    lb.addEventListener('click', (e) => { if (e.target.closest('.pv')) show(at - 1); else if (e.target.closest('.nx')) show(at + 1); else if (!e.target.closest('img')) close(); });
  }
  const close = () => { if (lb) { lb.remove(); lb = null; } };
  document.addEventListener('click', (e) => { const f = e.target.closest('.ph.zoom'); if (f && !lb) open(f); });
  document.addEventListener('keydown', (e) => {
    if (lb) { if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(at + 1); if (e.key === 'ArrowRight') show(at - 1); return; }
    if (e.key === 'Enter') { const f = document.activeElement && document.activeElement.closest('.ph.zoom'); if (f) open(f); }
  });
})();
