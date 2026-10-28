/* Mewamax — behaviour ported 1:1 from joshgrafik.com's bundle (GSAP 3.15 + ScrollTrigger + ScrollToPlugin + Lenis 1.3.26).
   Every duration, ease and threshold below is the template's own value. Content-driven differences are marked MEWAMAX. */
(() => {
const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger, window.ScrollToPlugin);
const onReady = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- smooth scroll ---------- */
let lenis = null;
if (!reduced) {
  lenis = new window.Lenis({ anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => { lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);
}

/* ---------- logo loader ---------- */
function logoLoader() {
  const root = document.querySelector('[data-logo-loader-init]');
  if (!root) return () => {};
  const echoes = 5,
    bg = root.querySelector('[data-logo-loader-bg]'),
    stack = root.querySelector('[data-logo-loader-stack]'),
    logo = root.querySelector('[data-logo-loader-logo]'),
    bar = root.querySelector('[data-logo-loader-bar]'),
    track = root.querySelector('[data-logo-loader-track]') || bar;
  if (!bg || !stack || !logo) return () => {};
  const resets = [...root.querySelectorAll('[data-logo-loader-reset]')].filter(el => el !== stack),
    rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    clones = [];
  for (let i = 0; i < echoes; i += 1) {
    const c = logo.cloneNode(true);
    c.setAttribute('aria-hidden', 'true'); stack.appendChild(c); clones.push(c);
  }
  const em = parseFloat(getComputedStyle(stack).fontSize),
    tl = gsap.timeline({ defaults: { duration: .4, ease: 'power2.out' } });
  gsap.set(clones, { opacity: 0, z: 0 });
  if (resets.length) tl.set(resets, { autoAlpha: 1 }, 0);
  tl.to(stack, { autoAlpha: 1, duration: .5 });
  if (rm) {
    tl.addLabel('impact', '+=0.6').to(root, { autoAlpha: 0, duration: .5, ease: 'power2.inOut' }, 'impact+=0.5');
  } else {
    tl.addLabel('tilt', '-=0.1')
      .to(stack, { rotationY: -40, rotationX: 20, xPercent: -15, duration: .6, ease: 'power4.out' }, 'tilt')
      .to(clones, { z: i => -(i + 1) * 2.5 * em, opacity: i => Math.pow(.5, i + 1), duration: .55, ease: 'power4.out',
        stagger: { each: .05, ease: 'power1.out' } }, 'tilt+=0.1')
      .addLabel('smash', '+=0.4')
      .to(stack, { rotationY: 0, rotationX: 0, xPercent: 0, ease: 'power4.in' }, 'smash')
      .to(clones, { z: 0, ease: 'power4.in' }, 'smash')
      .addLabel('impact')
      .set(clones, { opacity: 0 }, 'impact')
      .to(stack, { scale: 1.05, duration: .1 }, 'impact')
      .to(stack, { scale: 1, duration: .6, ease: 'elastic.out(1, 0.5)' })
      .to(stack, { autoAlpha: 0 }, 'impact+=0.5')
      .to(bg, { scaleY: 0, duration: .5, ease: 'expo.inOut' }, 'impact+=0.6');
  }
  if (bar) tl.to(bar, { scaleX: 1, duration: tl.labels.impact, ease: 'power2.inOut' }, 0).to(track, { autoAlpha: 0 }, 'impact+=0.5');
  tl.call(() => document.documentElement.classList.remove('is-loading'), null, 'impact+=0.6');
  tl.set(root, { display: 'none' });
  return () => {
    tl.kill(); clones.forEach(c => c.remove());
    gsap.set([root, bg, stack, logo, bar, track].filter(Boolean), { clearProps: 'all' });
  };
}
onReady(logoLoader);

/* ---------- logo wall cycle ---------- */
function logoWall() {
  document.querySelectorAll('[data-logo-wall-cycle-init]').forEach(root => {
    const list = root.querySelector('[data-logo-wall-list]'),
      items = Array.from(list.querySelectorAll('[data-logo-wall-item]')),
      shuffleOn = root.getAttribute('data-logo-wall-shuffle') !== 'false',
      originals = items.map(it => it.querySelector('[data-logo-wall-target]')).filter(Boolean);
    let visible = [], count = 0, pool = [], order = [], step = 0, tl;
    const isShown = el => window.getComputedStyle(el).display !== 'none';
    const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    function setup() {
      tl && tl.kill();
      visible = items.filter(isShown); count = visible.length;
      order = shuffle(Array.from({ length: count }, (_, i) => i)); step = 0;
      items.forEach(it => it.querySelectorAll('[data-logo-wall-target]').forEach(t => t.remove()));
      pool = originals.map(t => t.cloneNode(true));
      let first, rest;
      if (shuffleOn) { const s = shuffle(pool); first = s.slice(0, count); rest = shuffle(s.slice(count)); }
      else { first = pool.slice(0, count); rest = shuffle(pool.slice(count)); }
      pool = first.concat(rest);
      for (let i = 0; i < count; i++) (visible[i].querySelector('[data-logo-wall-target-parent]') || visible[i]).appendChild(pool.shift());
      tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 }); tl.call(swap); tl.play();
    }
    function swap() {
      if (items.filter(isShown).length !== count) { setup(); return; }
      if (!pool.length) return;
      const idx = order[step % count]; step++;
      const item = visible[idx],
        parent = item.querySelector('[data-logo-wall-target-parent]') || item.querySelector('*:has(> [data-logo-wall-target])') || item;
      if (parent.querySelectorAll('[data-logo-wall-target]').length > 1) return;
      const out = parent.querySelector('[data-logo-wall-target]'), next = pool.shift();
      gsap.set(next, { yPercent: 50, autoAlpha: 0 }); parent.appendChild(next);
      if (out) gsap.to(out, { yPercent: -50, autoAlpha: 0, duration: .9, ease: 'expo.inOut', onComplete: () => { out.remove(); pool.push(out); } });
      gsap.to(next, { yPercent: 0, autoAlpha: 1, duration: .9, delay: .1, ease: 'expo.inOut' });
    }
    setup();
    ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top',
      onEnter: () => tl.play(), onLeave: () => tl.pause(), onEnterBack: () => tl.play(), onLeaveBack: () => tl.pause() });
    document.addEventListener('visibilitychange', () => document.hidden ? tl.pause() : tl.play());
  });
}
onReady(logoWall);

/* ---------- index: hover preview ---------- */
(function indexPreview() {
  const section = document.querySelector('#index');
  if (!section) return;
  const list = section.querySelector('[data-index]'), rows = list.querySelectorAll('.index-row'),
    box = section.querySelector('[data-index-media]'), srcs = [];
  section.querySelectorAll('[data-index-medias] img').forEach(img => srcs.push(img.getAttribute('src')));
  list.addEventListener('mouseenter', () => box.classList.add('on'));
  list.addEventListener('mouseleave', () => { box.classList.remove('on'); Array.from(box.children).forEach(c => c.remove()); });
  gsap.set(box, { yPercent: -50 });
  const yTo = gsap.quickTo(box, 'y', { duration: .5, ease: 'power4' });
  list.addEventListener('mousemove', ev => yTo(ev.clientY - section.getBoundingClientRect().top));
  rows.forEach((row, i) => row.addEventListener('mouseenter', () => show(i)));
  function show(i) {
    const frame = document.createElement('div'), img = document.createElement('img');
    frame.className = 'index-media-frame'; img.className = 'index-media-img'; img.alt = ''; img.src = srcs[i];
    frame.appendChild(img); box.appendChild(frame);
    gsap.to([frame, img], { y: 0, duration: .6, ease: 'expo.inOut' });
    if (box.children.length > 20) box.children[0].remove();
  }
})();

/* ---------- index: load more / show less ---------- */
(function indexMore() {
  const btn = document.querySelector('[data-index-more]');
  if (!btn) return;
  const list = btn.closest('[data-index]'), section = list.closest('section'),
    countEl = list.querySelector('[data-index-count]'), label = btn.querySelector('span'),
    arrow = btn.querySelector('.arrow'), glyph = btn.querySelector('.arrow-glyph'),
    extra = [...list.querySelectorAll('.index-row.is-extra')],
    total = list.querySelectorAll('.index-row').length, base = total - extra.length,
    rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let open = false;
  function sync() {
    label.textContent = open ? 'Show less' : `Load more (${extra.length})`;
    arrow?.setAttribute('data-dir', open ? 'up' : 'down');
    if (glyph) glyph.textContent = open ? '↑' : '↓';
    if (countEl) countEl.textContent = `Showing ${open ? total : base} of ${total}`;
  }
  function expand() {
    open = true; extra.forEach(r => r.classList.remove('is-extra')); sync();
    if (!rm) gsap.from(extra, { autoAlpha: 0, y: 24, duration: .6, ease: 'power3.out', stagger: .02 });
    ScrollTrigger.refresh();
  }
  function collapse() {
    open = false;
    const done = () => {
      gsap.killTweensOf(extra); gsap.set(extra, { clearProps: 'opacity,visibility,transform' });
      extra.forEach(r => r.classList.add('is-extra')); sync(); ScrollTrigger.refresh();
    };
    const top = section.getBoundingClientRect().top + window.scrollY;
    if (Math.abs(window.scrollY - top) < 2) done();
    else if (lenis && !rm) lenis.scrollTo(top, { duration: 1, onComplete: done });
    else { window.scrollTo(0, top); done(); }
  }
  btn.addEventListener('click', () => open ? collapse() : expand());
})();

/* ---------- pixelated scroll transition ---------- */
function pixelTransitions() {
  const MODE = 'cover', START = { cover: 'bottom bottom', reveal: 'top bottom' }, END = { cover: 'bottom top', reveal: 'top center' },
    SCRUB = .3, PIXEL_DUR = .1, STAGGER = 1.5,
    PANEL = 'pixelated-scroll-transition__panel', COL = 'pixelated-scroll-transition__col', PIX = 'pixelated-scroll-transition__pixel',
    MQ = { mobile: '(max-width: 478px)', landscape: '(max-width: 767px)', tablet: '(max-width: 991px)' },
    built = [];
  let mm = null;
  const cols = el => {
    const d = parseInt(el.dataset.columns, 10) || 12;
    return window.matchMedia(MQ.mobile).matches ? parseInt(el.dataset.columnsMobile, 10) || Math.max(4, Math.round(d * .4))
      : window.matchMedia(MQ.landscape).matches ? parseInt(el.dataset.columnsLandscape, 10) || Math.max(6, Math.round(d * .6))
      : window.matchMedia(MQ.tablet).matches ? parseInt(el.dataset.columnsTablet, 10) || Math.max(8, Math.round(d * .75)) : d;
  };
  const modeOf = el => el.dataset.mode === 'reveal' ? 'reveal' : MODE;
  const rows = el => {
    const d = parseInt(el.dataset.rows, 10) || 6;
    return window.matchMedia(MQ.mobile).matches ? parseInt(el.dataset.rowsMobile, 10) || d
      : window.matchMedia(MQ.landscape).matches ? parseInt(el.dataset.rowsLandscape, 10) || d
      : window.matchMedia(MQ.tablet).matches && parseInt(el.dataset.rowsTablet, 10) || d;
  };
  const start = (el, m) => el.dataset.scrollStart || START[m], end = (el, m) => el.dataset.scrollEnd || END[m];
  function grid(el, nc, nr) {
    const panel = document.createElement('div'); panel.classList.add(PANEL); panel.setAttribute('data-pixelated-scroll-panel', '');
    const frag = document.createDocumentFragment();
    for (let c = 0; c < nc; c++) {
      const col = document.createElement('div'); col.classList.add(COL); col.setAttribute('data-pixelated-scroll-column', '');
      for (let r = 0; r < nr; r++) { const p = document.createElement('div'); p.classList.add(PIX); p.setAttribute('data-pixelated-scroll-pixel', ''); col.appendChild(p); }
      frag.appendChild(col);
    }
    panel.appendChild(frag); el.appendChild(panel);
    return { panel };
  }
  function ordered(panel, nc, nr) {
    const colsEls = panel.querySelectorAll('[data-pixelated-scroll-column]'), list = [];
    for (let r = 0; r < nr; r++) colsEls.forEach((col, ci) => {
      const px = col.children[r]; if (!px) return;
      list.push({ element: px, priority: (nr - 1 - r) * 50 + Math.random() * 300 + Math.sin(ci * .3) * 30 });
    });
    list.sort((a, b) => a.priority - b.priority);
    return list.map(x => x.element);
  }
  function timeline(el, pixels, trigger, m) {
    const tl = gsap.timeline({ scrollTrigger: { trigger, start: start(el, m), end: end(el, m), scrub: SCRUB, invalidateOnRefresh: true } });
    const from = m === 'cover' ? 0 : 1, to = m === 'cover' ? 1 : 0;
    gsap.set(pixels, { autoAlpha: from });
    tl.to(pixels, { autoAlpha: to, duration: PIXEL_DUR, stagger: { amount: STAGGER, from: 'start' }, ease: 'none' });
    return tl;
  }
  function build(el) {
    const trigger = el.closest('section') || el.parentElement, nc = cols(el), nr = rows(el), m = modeOf(el),
      { panel } = grid(el, nc, nr), pixels = ordered(panel, nc, nr);
    return { wrapper: el, tl: timeline(el, pixels, trigger, m) };
  }
  function destroy(b) {
    if (b.tl) { b.tl.scrollTrigger?.kill(); b.tl.kill(); }
    const p = b.wrapper.querySelector('[data-pixelated-scroll-panel]'); p && p.remove();
  }
  if (document.querySelectorAll('[data-pixelated-scroll-transition]').length) {
    mm = gsap.matchMedia();
    mm.add({ isDesktop: '(min-width: 992px)', isTablet: '(min-width: 768px) and (max-width: 991px)',
      isLandscape: '(min-width: 479px) and (max-width: 767px)', isMobile: '(max-width: 478px)', reduceMotion: '(prefers-reduced-motion: reduce)' }, ctx => {
      if (!ctx.conditions.reduceMotion) {
        document.querySelectorAll('[data-pixelated-scroll-transition]').forEach(el => built.push(build(el)));
        ScrollTrigger.refresh();
        return () => { built.forEach(destroy); built.length = 0; };
      }
    });
  }
}
onReady(pixelTransitions);

/* ---------- cursor coordinates ---------- */
onReady(() => {
  const x = document.querySelector('[data-coordinates-x]'), y = document.querySelector('[data-coordinates-y]');
  if (!x || !y) return;
  document.addEventListener('mousemove', ev => { x.textContent = Math.round(ev.pageX); y.textContent = Math.round(ev.pageY); });
});

/* ---------- scroll progress bar ---------- */
onReady(() => {
  const bar = document.querySelector('.progress-bar'), wrap = document.querySelector('.progress-bar-wrap');
  gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: .5 } });
  wrap.addEventListener('click', ev => {
    const target = ev.clientX / wrap.offsetWidth * (document.body.scrollHeight - window.innerHeight);
    if (lenis) { lenis.scrollTo(target, { duration: .725, easing: gsap.parseEase('power3.out') }); return; }
    gsap.to(window, { scrollTo: target, duration: .725, ease: 'power3.out' });
  });
});

onReady(() => document.querySelectorAll('[data-current-year]').forEach(el => { el.textContent = new Date().getFullYear(); }));

/* ---------- footer link letter roll ---------- */
onReady(() => {
  document.querySelectorAll('[data-button-animate-chars]').forEach(el => {
    const text = el.textContent; el.innerHTML = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span'); s.textContent = ch; s.style.transitionDelay = `${i * .01}s`;
      if (ch === ' ') s.style.whiteSpace = 'pre';
      el.appendChild(s);
    });
  });
});

/* ---------- scroll-speed skew (portrait) ---------- */
(function velocitySkew() {
  const MAX = 10, FACTOR = .25, EASE = .12;
  /* MEWAMAX: the template also skews the work cards; removed from the package cards at the client's request. */
  const els = document.querySelectorAll('.about-portrait');
  if (!els.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const setSkew = gsap.quickSetter(els, 'skewY', 'deg'), clamp = gsap.utils.clamp(-MAX, MAX);
  gsap.set(els, { transformOrigin: 'right center', force3D: true });
  let v = 0;
  if (!lenis) ScrollTrigger.create({ onUpdate: s => { v = s.getVelocity(); } });
  let cur = 0;
  gsap.ticker.add(() => {
    const vel = lenis ? lenis.velocity : v / 60;
    if (!lenis) v *= .9;
    const target = clamp(-vel * FACTOR), next = cur + (target - cur) * EASE;
    if (Math.abs(next) < .01 && Math.abs(target) < .01) { if (cur !== 0) { cur = 0; setSkew(0); } return; }
    cur = next; setSkew(cur);
  });
})();

/* ---------- footer logo rise ---------- */
(function footerLogo() {
  const footer = document.querySelector('[data-footer]'), logo = footer?.querySelector('.footer-logo');
  if (!logo || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.fromTo(logo, { y: () => logo.getBoundingClientRect().height * .5 + parseFloat(getComputedStyle(logo.closest('.footer-inner')).paddingBottom) },
    { y: 0, ease: 'none', scrollTrigger: { trigger: footer, start: () => `bottom bottom+=${logo.getBoundingClientRect().height + 150}`, end: 'bottom bottom', scrub: .6, invalidateOnRefresh: true } });
})();

/* ---------- hero letter wave (hover, desktop) ---------- */
function splitLetters(el) {
  const t = el.textContent;
  el.innerHTML = t.split('').map(ch => ch === ' ' ? '<span>&nbsp;</span>' : `<span class="letter">${ch}</span>`).join('');
}
const indexInParent = el => Array.from(el.parentNode.children).indexOf(el);
(function heroWave() {
  const ok = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 861px)').matches;
  if (!ok || reduced) return;
  document.querySelectorAll('[data-hero-wave]').forEach(root => {
    splitLetters(root.querySelector('.hero-wave-hidden')); splitLetters(root.querySelector('.hero-wave-visible'));
    root.addEventListener('mouseover', ev => {
      if (!gsap.isTweening(root.querySelectorAll('.hero-wave-visible span')) && root.classList.contains('hovered')) root.classList.remove('hovered');
      if (!ev.target.classList.contains('letter')) return;
      root.classList.add('hovered');
      const from = indexInParent(ev.target);
      gsap.to(root.querySelectorAll('.hero-wave-visible span'), { yPercent: 100, ease: 'back.out(2)', duration: .6, stagger: { each: .023, from } });
      gsap.to(root.querySelectorAll('.hero-wave-hidden span'), { yPercent: 100, ease: 'back.out(2)', duration: .6, stagger: { each: .023, from },
        onComplete: () => {
          gsap.set(root.querySelectorAll('.hero-wave-visible span'), { clearProps: 'all' });
          gsap.set(root.querySelectorAll('.hero-wave-hidden span'), { clearProps: 'all' });
        } });
    });
  });
})();

/* ---------- about headline letter wave (hover, desktop) ---------- */
(function letterWave() {
  const ok = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 861px)').matches;
  if (!ok || reduced) return;
  document.querySelectorAll('[data-letter-wave]').forEach(line => {
    line.querySelectorAll('.word').forEach(w => { w.innerHTML = [...w.textContent].map(ch => `<span class="wave-letter">${ch}</span>`).join(''); });
    const clone = line.cloneNode(true);
    clone.removeAttribute('data-letter-wave'); clone.className = 'letter-wave-clone'; clone.setAttribute('aria-hidden', 'true');
    line.prepend(clone); line.classList.add('has-letter-wave');
    const live = [...line.querySelectorAll(':scope > .word-mask .wave-letter')], ghost = [...clone.querySelectorAll('.wave-letter')];
    line.addEventListener('mouseover', ev => {
      if (!gsap.isTweening(live) && line.classList.contains('hovered')) line.classList.remove('hovered');
      const i = live.indexOf(ev.target);
      if (i === -1) return;
      line.classList.add('hovered');
      const v = { yPercent: 100, ease: 'back.out(2)', duration: .6, stagger: { each: .023, from: i } };
      gsap.to(live, v);
      gsap.to(ghost, { ...v, onComplete: () => gsap.set([...live, ...ghost], { clearProps: 'all' }) });
    });
  });
})();

/* ---------- WebGL ripple + RGB split (intro tile, lightbox image) ---------- */
function rippleGL(canvas) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: true });
  if (!gl) return null;
  const vs = `
    attribute vec2 aPos;
    varying vec2 vUv;
    void main() {
      vUv = aPos * 0.5 + 0.5;
      gl_Position = vec4(aPos, 0.0, 1.0);
    }`,
    fs = `
    precision mediump float;
    uniform sampler2D uTex;
    uniform vec2 uRes;
    uniform vec2 uImg;
    uniform vec2 uMouse;
    uniform float uHover;
    uniform float uTime;
    varying vec2 vUv;

    vec2 cover(vec2 uv) {
      float rs = uRes.x / uRes.y;
      float ri = uImg.x / uImg.y;
      vec2 s = vec2(min(rs / ri, 1.0), min(ri / rs, 1.0));
      return (uv - 0.5) * s + 0.5;
    }

    void main() {
      vec2 d = vUv - uMouse;
      d.x *= uRes.x / uRes.y;
      float dist = length(d);
      vec2 dir = d / (dist + 0.0001);
      float falloff = smoothstep(0.45, 0.0, dist) * uHover;
      float wave = sin(dist * 28.0 - uTime * 5.0) * 0.012 * falloff;
      vec2 uv = vUv + vec2(dir.x * uRes.y / uRes.x, dir.y) * wave;
      uv = mix(uv, uMouse, 0.04 * falloff);
      vec2 shift = dir * 0.006 * falloff;
      float r = texture2D(uTex, cover(uv + shift)).r;
      float g = texture2D(uTex, cover(uv)).g;
      float b = texture2D(uTex, cover(uv - shift)).b;
      float a = texture2D(uTex, cover(uv)).a;
      gl_FragColor = vec4(r, g, b, a);
    }`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  const u = n => gl.getUniformLocation(prog, n),
    uRes = u('uRes'), uImg = u('uImg'), uMouse = u('uMouse'), uHover = u('uHover'), uTime = u('uTime'),
    tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  const state = { mouseX: .5, mouseY: .5, hover: 0 };
  let size = [1, 1], ready = false, token = 0, video = null;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (w && h && (canvas.width !== w || canvas.height !== h)) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  function setImage(src) {
    ready = false; canvas.classList.remove('is-ready');
    const t = ++token, img = new Image();
    img.onload = () => {
      if (t !== token) return;
      const w = img.naturalWidth || 1280, h = img.naturalHeight || 800, c = document.createElement('canvas');
      c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h);
      gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
      size = [w, h]; ready = true; render(0); canvas.classList.add('is-ready');
    };
    img.src = src;
  }
  function setVideo(el) { video = el; ready = false; }
  function render(t) {
    if (video) {
      if (video.readyState < 2) return;
      try { gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video); } catch { return; }
      size = [video.videoWidth, video.videoHeight]; ready = true;
    }
    if (!ready) return;
    resize();
    gl.uniform2f(uRes, canvas.width, canvas.height); gl.uniform2f(uImg, size[0], size[1]);
    gl.uniform2f(uMouse, state.mouseX, state.mouseY); gl.uniform1f(uHover, state.hover); gl.uniform1f(uTime, t);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  return { state, setImage, setVideo, render };
}

/* ---------- lightbox ---------- */
const lightbox = document.querySelector('[data-lightbox]'), dataEl = document.getElementById('project-data');
if (lightbox && dataEl) {
  const data = JSON.parse(dataEl.textContent),
    panel = lightbox.querySelector('[data-lightbox-panel]'), info = lightbox.querySelector('[data-lightbox-info]'),
    media = lightbox.querySelector('[data-lightbox-media]'), img = lightbox.querySelector('[data-lb-img]'),
    canvas = lightbox.querySelector('[data-lb-canvas]'), link = lightbox.querySelector('[data-lb-link]'),
    closeBtn = lightbox.querySelector('.lightbox-close'), fields = lightbox.querySelectorAll('[data-lb]'),
    gl = rippleGL(canvas);
  let opener = null, isOpen = false, afterClose = null;
  const spin = () => { if (!reduced) gsap.fromTo(media, { rotationX: 360 }, { rotationX: 0, duration: 1.4, ease: 'power3.out', transformPerspective: 1400 }); };
  function openBox(key, from) {
    const p = data[key];
    if (!p) return false;
    opener = from;
    fields.forEach(f => { f.textContent = p[f.dataset.lb] ?? ''; });
    link.href = p.url; img.alt = p.alt ?? `${p.name}`; img.src = p.image; gl?.setImage(p.image);
    lightbox.hidden = false; isOpen = true; lenis?.stop(); document.documentElement.classList.add('lightbox-open');
    gsap.killTweensOf([lightbox, panel, info.children, media]);
    if (reduced) gsap.set([lightbox, panel, info.children, media], { clearProps: 'all' });
    else {
      gsap.fromTo(lightbox, { autoAlpha: 0 }, { autoAlpha: 1, duration: .3 });
      gsap.fromTo(panel, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .8, ease: 'power4.inOut' });
      gsap.fromTo(info.children, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out', stagger: .06, delay: .35 });
      gsap.delayedCall(.2, spin);
    }
    gsap.delayedCall(reduced ? 0 : .05, () => closeBtn.focus({ preventScroll: true }));
    return true;
  }
  function closeBox() {
    if (!isOpen) return;
    isOpen = false;
    const done = () => {
      lightbox.hidden = true; lenis?.start(); document.documentElement.classList.remove('lightbox-open');
      opener?.focus({ preventScroll: true });
      if (afterClose) { const fn = afterClose; afterClose = null; fn(); }
    };
    if (reduced) return done();
    gsap.to(panel, { clipPath: 'inset(0% 0% 100% 0%)', duration: .6, ease: 'power4.inOut' });
    gsap.to(lightbox, { autoAlpha: 0, duration: .3, delay: .4, onComplete: done });
  }
  document.addEventListener('click', ev => {
    const el = ev.target.closest('[data-project]');
    if (!el || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    if (openBox(el.dataset.project, el)) ev.preventDefault();
  });
  lightbox.querySelectorAll('[data-lightbox-close]').forEach(b => b.addEventListener('click', closeBox));
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && isOpen) closeBox(); });
  media.addEventListener('click', spin);
  /* MEWAMAX: the template's button opens the project's own site in a new tab; here it points at #contact,
     so close the box first and then scroll there. */
  link.addEventListener('click', ev => {
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('#')) return;
    ev.preventDefault();
    afterClose = () => { const t = document.querySelector(href); if (!t) return; lenis ? lenis.scrollTo(t) : t.scrollIntoView(); };
    closeBox();
  });
  if (gl && finePointer && !reduced) {
    const st = gl.state,
      xTo = gsap.quickTo(st, 'mouseX', { duration: .6, ease: 'power3' }), yTo = gsap.quickTo(st, 'mouseY', { duration: .6, ease: 'power3' });
    media.addEventListener('pointerenter', () => gsap.to(st, { hover: 1, duration: .8, ease: 'power2.out' }));
    media.addEventListener('pointerleave', () => gsap.to(st, { hover: 0, duration: .8, ease: 'power2.out' }));
    media.addEventListener('pointermove', ev => {
      const r = canvas.getBoundingClientRect();
      xTo((ev.clientX - r.left) / r.width); yTo(1 - (ev.clientY - r.top) / r.height);
    });
    gsap.ticker.add(t => { if (isOpen) gl.render(t); });
  }
}

/* ---------- intro tile ripple (MEWAMAX: no client video, so the shader runs on the still image) ---------- */
finePointer && !reduced && document.querySelectorAll('[data-media-still]').forEach(still => {
  const canvas = still.parentElement.querySelector('[data-hls-canvas]'), gl = canvas && rippleGL(canvas);
  if (!gl) return;
  gl.setImage(still.currentSrc || still.src);
  const st = gl.state, wrap = still.parentElement,
    xTo = gsap.quickTo(st, 'mouseX', { duration: .6, ease: 'power3' }), yTo = gsap.quickTo(st, 'mouseY', { duration: .6, ease: 'power3' });
  let live = false;
  wrap.addEventListener('pointerenter', ev => {
    const r = wrap.getBoundingClientRect();
    gsap.set(st, { mouseX: (ev.clientX - r.left) / r.width, mouseY: 1 - (ev.clientY - r.top) / r.height });
    live = true; gl.render(gsap.ticker.time); canvas.classList.add('is-on');
    gsap.to(st, { hover: 1, duration: .8, ease: 'power2.out', overwrite: 'auto' });
  });
  wrap.addEventListener('pointerleave', () => {
    gsap.to(st, { hover: 0, duration: .8, ease: 'power2.out', overwrite: 'auto', onComplete: () => { live = false; canvas.classList.remove('is-on'); } });
  });
  wrap.addEventListener('pointermove', ev => {
    const r = wrap.getBoundingClientRect();
    xTo((ev.clientX - r.left) / r.width); yTo(1 - (ev.clientY - r.top) / r.height);
  });
  gsap.ticker.add(t => { if (live) gl.render(t); });
});

/* ---------- text-wrap: pretty fallback ---------- */
if (!CSS.supports('text-wrap', 'pretty')) {
  const glue = n => { n.nodeValue = n.nodeValue.replace(/\s+(\S+\s*)$/, ' $1'); };
  document.querySelectorAll('main p, main h2, footer p').forEach(el => {
    const sw = el.querySelectorAll('.statement-word');
    if (sw.length > 1) { const n = sw[sw.length - 2].firstChild; if (n) n.nodeValue = n.nodeValue.replace(/\s+$/, ' '); return; }
    if (el.querySelector('.word')) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let last = null;
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) last = walker.currentNode;
    if (last && /\S\s+\S/.test(last.nodeValue.trim())) glue(last);
  });
}

/* ---------- local time (MEWAMAX: Kuala Lumpur) ---------- */
const timeEl = document.querySelector('[data-local-time]'), hourHand = document.querySelector('[data-clock-hour]'), minHand = document.querySelector('[data-clock-minute]');
function tick() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()),
    h = Number(parts.find(p => p.type === 'hour').value), m = Number(parts.find(p => p.type === 'minute').value);
  if (timeEl) timeEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  hourHand && hourHand.setAttribute('transform', `rotate(${h % 12 * 30 + m * .5} 9 9)`);
  minHand && minHand.setAttribute('transform', `rotate(${m * 6 - 112} 9 9)`);
}
tick(); setInterval(tick, 15e3);

/* ---------- header hide on scroll + mobile menu ---------- */
const header = document.querySelector('[data-header]');
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY, menuOpen = document.querySelector('[data-menu]')?.classList.contains('is-open');
  header?.classList.toggle('is-hidden', y > lastY && y > 120 && !menuOpen);
  lastY = y;
}, { passive: true });
const menuBtn = document.querySelector('[data-menu-toggle]'), menu = document.querySelector('[data-menu]');
function setMenu(open) {
  menu?.classList.toggle('is-open', open);
  menuBtn?.setAttribute('aria-expanded', String(open));
  if (menuBtn) menuBtn.textContent = open ? 'Close' : 'Menu';
}
menuBtn?.addEventListener('click', () => setMenu(!menu?.classList.contains('is-open')));
menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

/* ---------- reveals ---------- */
document.querySelectorAll('[data-words]').forEach(h => h.querySelectorAll('.word').forEach((w, i) => w.style.setProperty('--i', String(i))));
const revealEls = document.querySelectorAll('[data-reveal], [data-words]');
if (reduced || !('IntersectionObserver' in window)) revealEls.forEach(el => el.classList.add('is-visible'));
else {
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -12% 0px' });
  revealEls.forEach(el => io.observe(el));
}

/* ---------- statement highlight + footer columns parallax ---------- */
const statement = document.querySelector('[data-highlight]'),
  statementWords = statement ? [...statement.querySelectorAll('.statement-word')] : [],
  footer = document.querySelector('[data-footer]'), footerCols = document.querySelector('[data-footer-inner]');
function onScrollFrame() {
  const vh = window.innerHeight;
  if (statementWords.length) {
    const r = statement.getBoundingClientRect(), from = vh * .85, to = vh * .45,
      p = Math.min(1, Math.max(0, (from - r.top) / (from - to + r.height))), lit = Math.round(p * statementWords.length);
    statementWords.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
  }
  if (footer && footerCols) {
    const r = footer.getBoundingClientRect(), p = Math.min(1, Math.max(0, (vh - r.top) / r.height));
    footerCols.style.transform = `translateY(${(1 - p) * -30}%)`;
  }
}
if (reduced) statementWords.forEach(w => w.classList.add('is-lit'));
else {
  let queued = false;
  const q = () => { if (!queued) { queued = true; requestAnimationFrame(() => { onScrollFrame(); queued = false; }); } };
  window.addEventListener('scroll', q, { passive: true }); window.addEventListener('resize', q); onScrollFrame();
}

/* ---------- services: auto-cycle with image wipe ---------- */
const serviceRows = document.querySelectorAll('[data-services] .service-row'), servicePics = document.querySelectorAll('[data-service-image]');
let activeService = 0;
servicePics.forEach((p, i) => gsap.set(p, { autoAlpha: i === 0 ? 1 : 0, zIndex: i === 0 ? 1 : 0 }));
function showService(i) {
  if (i === activeService) return;
  serviceRows.forEach((r, j) => { r.classList.toggle('is-active', j === i); r.setAttribute('aria-pressed', String(j === i)); });
  const next = servicePics[i], prev = servicePics[activeService];
  activeService = i;
  if (!next) return;
  servicePics.forEach(p => { p.classList.toggle('is-active', p === next); if (p !== next) gsap.set(p, { zIndex: p === prev ? 1 : 0 }); });
  const img = next.querySelector('.service-img'), d = reduced ? 0 : 1.1;
  gsap.killTweensOf([next, img]);
  gsap.set(next, { zIndex: 2, autoAlpha: 1 });
  gsap.fromTo(next, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: d, ease: 'power4.inOut',
    onComplete: () => { if (next === servicePics[activeService]) servicePics.forEach(p => { if (p !== next) gsap.set(p, { autoAlpha: 0 }); }); } });
  gsap.fromTo(img, { scale: 1.15, yPercent: -4 }, { scale: 1, yPercent: 0, duration: d * 1.2, ease: 'power3.out' });
  if (prev && prev !== next) gsap.to(prev.querySelector('.service-img'), { scale: 1.05, duration: d, ease: 'power2.inOut' });
}
const SERVICE_SECONDS = 3, serviceBars = [...serviceRows].map(r => r.querySelector('.service-progress')), servicesList = document.querySelector('[data-services]');
let serviceTween = null, servicesHover = false, servicesInView = false;
const stopServices = () => { serviceTween?.kill(); serviceTween = null; };
function runServices(i) {
  stopServices();
  if (reduced || servicesHover || !servicesInView || !serviceBars[i]) return;
  gsap.set(serviceBars, { scaleX: 0 });
  serviceTween = gsap.fromTo(serviceBars[i], { scaleX: 0 }, { scaleX: 1, duration: SERVICE_SECONDS, ease: 'none',
    onComplete: () => { const n = (i + 1) % serviceRows.length; showService(n); runServices(n); } });
}
function pinService(i) { stopServices(); showService(i); gsap.set(serviceBars, { scaleX: 0 }); serviceBars[i] && gsap.set(serviceBars[i], { scaleX: 1 }); }
serviceRows.forEach((r, i) => {
  r.addEventListener('pointerenter', ev => { if (ev.pointerType === 'mouse') { servicesHover = true; pinService(i); } });
  r.addEventListener('focus', () => pinService(i));
  r.addEventListener('blur', () => runServices(activeService));
  r.addEventListener('click', () => { showService(i); if (!servicesHover) runServices(i); });
});
servicesList?.addEventListener('pointerleave', ev => { if (ev.pointerType === 'mouse') { servicesHover = false; runServices(activeService); } });
if (servicesList && !reduced && 'IntersectionObserver' in window) new IntersectionObserver(([en]) => {
  servicesInView = en.isIntersecting; servicesInView ? runServices(activeService) : stopServices();
}, { threshold: .35 }).observe(servicesList.closest('section'));

/* ---------- work cards: following cursor label ---------- */
finePointer && document.querySelectorAll('[data-work-grid] .work-image').forEach(box => {
  const label = box.querySelector('.work-cursor');
  if (!label) return;
  gsap.set(label, { xPercent: -50, yPercent: -50 });
  const xTo = gsap.quickTo(label, 'x', { duration: .45, ease: 'power3' }), yTo = gsap.quickTo(label, 'y', { duration: .45, ease: 'power3' });
  const move = (ev, jump) => {
    const r = box.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
    jump ? gsap.set(label, { x, y }) : (xTo(x), yTo(y));
  };
  box.addEventListener('pointerenter', ev => move(ev, true));
  box.addEventListener('pointermove', ev => move(ev, false));
});

/* ---------- work filters + see all ---------- */
const filterBtns = document.querySelectorAll('[data-filter]'), cards = document.querySelectorAll('[data-work-grid] .work-card'),
  moreBtn = document.querySelector('[data-work-more]'), initial = Number(moreBtn?.dataset.initial ?? Infinity);
let filter = 'all', showAll = !moreBtn;
function layoutCards() {
  let shown = 0, matched = 0;
  cards.forEach(c => {
    const match = filter === 'all' || c.dataset.category === filter;
    if (match) matched += 1;
    const vis = match && (showAll || shown < initial);
    c.classList.toggle('is-hidden', !vis); /* MEWAMAX: no is-offset stagger, the packages sit in one aligned row */
    if (vis) shown += 1;
  });
  moreBtn?.closest('.work-more')?.classList.toggle('is-hidden', showAll || matched <= initial);
  const label = moreBtn?.querySelector('span');
  if (label) label.textContent = `See all (${matched})`;
  ScrollTrigger.refresh();
}
filterBtns.forEach(b => b.addEventListener('click', () => {
  filter = b.dataset.filter; filterBtns.forEach(x => x.classList.toggle('is-active', x === b)); layoutCards();
}));
moreBtn?.addEventListener('click', () => {
  const before = [...cards].filter(c => !c.classList.contains('is-hidden'));
  showAll = true; layoutCards();
  const added = [...cards].filter(c => !c.classList.contains('is-hidden') && !before.includes(c));
  if (!reduced) gsap.from(added, { autoAlpha: 0, y: 40, duration: .8, ease: 'power3.out', stagger: .08 });
});

/* ---------- accordion (close siblings) ---------- */
document.querySelectorAll('[data-accordion-css-init]').forEach(root => {
  const closeSiblings = root.getAttribute('data-accordion-close-siblings') === 'true';
  root.addEventListener('click', ev => {
    const toggle = ev.target.closest('[data-accordion-toggle]'); if (!toggle) return;
    const item = toggle.closest('[data-accordion-status]'); if (!item) return;
    const active = item.getAttribute('data-accordion-status') === 'active';
    item.setAttribute('data-accordion-status', active ? 'not-active' : 'active');
    if (closeSiblings && !active) root.querySelectorAll('[data-accordion-status="active"]').forEach(o => { if (o !== item) o.setAttribute('data-accordion-status', 'not-active'); });
  });
});

/* ---------- process: auto-cycle ---------- */
const STEP_SECONDS = 5, processList = document.querySelector('.process [data-accordion-css-init]'),
  steps = processList ? [...processList.querySelectorAll('[data-accordion-status]')] : [],
  stepBars = steps.map(s => s.querySelector('.process-progress'));
let stepTween = null, processHover = false, processInView = false;
const activeStep = () => steps.findIndex(s => s.dataset.accordionStatus === 'active');
const setStep = i => steps.forEach((s, j) => s.setAttribute('data-accordion-status', j === i ? 'active' : 'not-active'));
const stopSteps = () => { stepTween?.kill(); stepTween = null; };
function runSteps(i) {
  stopSteps(); gsap.set(stepBars, { scaleX: 0 });
  if (reduced || processHover || !processInView || i < 0) return;
  stepTween = gsap.fromTo(stepBars[i], { scaleX: 0 }, { scaleX: 1, duration: STEP_SECONDS, ease: 'none',
    onComplete: () => { const n = (i + 1) % steps.length; setStep(n); runSteps(n); } });
}
function resumeSteps() { if (activeStep() < 0) setStep(0); runSteps(activeStep()); }
function holdSteps() { stopSteps(); gsap.set(stepBars, { scaleX: 0 }); const i = activeStep(); if (i >= 0) gsap.set(stepBars[i], { scaleX: 1 }); }
if (processList) {
  processList.addEventListener('pointerenter', ev => { if (ev.pointerType === 'mouse') { processHover = true; holdSteps(); } });
  processList.addEventListener('pointerleave', ev => { if (ev.pointerType === 'mouse') { processHover = false; resumeSteps(); } });
  processList.addEventListener('click', ev => { if (ev.target.closest('[data-accordion-toggle]')) processHover ? holdSteps() : runSteps(activeStep()); });
  if (!reduced && 'IntersectionObserver' in window) new IntersectionObserver(([en]) => {
    processInView = en.isIntersecting; processInView ? resumeSteps() : stopSteps();
  }, { threshold: .3 }).observe(processList);
}

/* ---------- contact email: fit to width + copy ---------- */
const email = document.querySelector('[data-copy]'), hint = document.querySelector('[data-copy-hint]');
function fitEmail() {
  if (!email) return;
  const w = email.parentElement.clientWidth;
  email.style.fontSize = '100px';
  email.style.fontSize = `${Math.min(134, 100 * w / email.scrollWidth)}px`;
}
fitEmail(); document.fonts?.ready.then(fitEmail); window.addEventListener('resize', fitEmail);
/* MEWAMAX fix: the template's fonts load from an async stylesheet, so fonts.ready can resolve before Inter Tight
   arrives and the address stays sized for the fallback font (10px of sideways scroll at 834). Refit when it lands. */
document.fonts?.addEventListener('loadingdone', fitEmail);
email?.addEventListener('click', async () => {
  const addr = email.dataset.copy;
  try { await navigator.clipboard.writeText(addr); if (hint) hint.textContent = 'Copied to clipboard.'; }
  catch { window.location.href = `mailto:${addr}`; return; }
  setTimeout(() => { if (hint) hint.textContent = 'Click the address to copy it.'; }, 2200);
});

/* ---------- Shift+G grid overlay ---------- */
const gridOverlay = document.querySelector('[data-grid-overlay]');
if (new URLSearchParams(window.location.search).has('grid')) gridOverlay?.classList.add('is-visible');
window.addEventListener('keydown', ev => {
  if (!ev.shiftKey || ev.key.toLowerCase() !== 'g' || (ev.target instanceof HTMLElement && ev.target.closest('input, textarea, [contenteditable]'))) return;
  gridOverlay?.classList.toggle('is-visible');
});
})();
