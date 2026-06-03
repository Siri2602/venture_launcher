'use strict';
/* =====================================================
   VENTURE LAUNCHER — script.js
   Senior Frontend Engineer build
   ===================================================== */

/* ── 1. INJECT AVATAR IMAGES ─────────────────────── */
function injectAvatars() {
  const map = {
    'img-hero-investor':     AV.hero_investor,
    'img-hero-founder':      AV.hero_founder,
    'img-hero-manufacturer': AV.hero_manufacturer,
    'img-eco-founder':       AV.eco_founder,
    'img-eco-investor':      AV.eco_investor,
    'img-eco-manufacturer':  AV.eco_manufacturer,
    'img-demo-founder':      AV.demo_founder,
    'img-demo-investor':     AV.demo_investor,
    'img-chat-inv':          AV.chat_inv,
    'img-match-founder':     AV.match_founder,
    'img-match-investor':    AV.match_investor,
    'img-room-founder':      AV.room_founder,
    'img-room-investor1':    AV.room_investor1,
    'img-room-manufacturer': AV.room_manufacturer,
    'img-room-investor2':    AV.room_investor2,
    'img-cta-founder':       AV.cta_founder,
    'img-cta-investor':      AV.cta_investor,
    'img-cta-manufacturer':  AV.cta_manufacturer,
    'img-ml-inv1':           AV.ml_inv1,
    'img-ml-inv2':           AV.ml_inv2,
    'img-ml-inv3':           AV.ml_inv3,
  };
  for (const [id, src] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) el.src = src;
  }
}

/* ── 2. CURSOR ───────────────────────────────────── */
function initCursor() {
  const dot  = document.getElementById('cDot');
  const ring = document.getElementById('cRing');
  if (!dot || !ring) return;
  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    dot.style.display = ring.style.display = 'none';
    return;
  }
  let mx = -999, my = -999, rx = -999, ry = -999;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  (function loop() {
    dot.style.transform  = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
  const SEL = 'a,button,[role="button"],.av-node,.eco-card,.mlr-btn,.role-tab,.rc';
  document.addEventListener('mouseover', e => { if (e.target.closest(SEL)) ring.classList.add('hov'); });
  document.addEventListener('mouseout',  e => { if (e.target.closest(SEL)) ring.classList.remove('hov'); });
  document.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = ring.style.opacity = '1'; });
}

/* ── 3. BACKGROUND CANVAS ───────────────────────── */
function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Build static layers once
  const gridC = document.createElement('canvas');
  const glowC = document.createElement('canvas');

  function buildStatic() {
    gridC.width = glowC.width = W;
    gridC.height = glowC.height = H;

    // Grid
    const gc = gridC.getContext('2d');
    gc.clearRect(0,0,W,H);
    gc.strokeStyle = 'rgba(255,255,255,0.022)';
    gc.lineWidth = 0.5;
    for (let x = 0; x < W; x += 80) { gc.beginPath(); gc.moveTo(x,0); gc.lineTo(x,H); gc.stroke(); }
    for (let y = 0; y < H; y += 80) { gc.beginPath(); gc.moveTo(0,y); gc.lineTo(W,y); gc.stroke(); }

    // Glows
    const lc = glowC.getContext('2d');
    lc.clearRect(0,0,W,H);
    [[W*.15,H*.2,360,'rgba(0,255,209,0.04)'],[W*.85,H*.3,300,'rgba(255,209,102,0.03)'],[W*.5,H*.75,420,'rgba(74,222,128,0.03)']].forEach(([x,y,r,c]) => {
      const g = lc.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,c); g.addColorStop(1,'transparent');
      lc.fillStyle = g; lc.fillRect(0,0,W,H);
    });
  }
  buildStatic();
  window.addEventListener('resize', buildStatic, { passive: true });

  // Particles
  const P = Array.from({length:55}, () => ({
    x: Math.random()*1920, y: Math.random()*1080,
    vx: (Math.random()-.5)*.14, vy: (Math.random()-.5)*.14,
    r: Math.random()*1.4+.3,
    a: Math.random()*.4+.1,
    c: ['#00FFD1','#FFD166','#4ADE80'][Math.floor(Math.random()*3)],
    ph: Math.random()*Math.PI*2
  }));

  let f = 0;
  function draw() {
    ctx.clearRect(0,0,W,H);
    ctx.drawImage(gridC,0,0);
    ctx.drawImage(glowC,0,0);
    for (const p of P) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -5) p.x = W+5; if (p.x > W+5) p.x = -5;
      if (p.y < -5) p.y = H+5; if (p.y > H+5) p.y = -5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = p.a * (.6 + .4*Math.sin(f*.012 + p.ph));
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    f++;
    requestAnimationFrame(draw);
  }
  draw();
}

/* ── 4. NAVIGATION ───────────────────────────────── */
function initNav() {
  const nav  = document.getElementById('mainNav');
  const hbg  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('solid', window.scrollY > 20);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  if (hbg && menu) {
    hbg.addEventListener('click', () => {
      const open = hbg.getAttribute('aria-expanded') === 'true';
      hbg.setAttribute('aria-expanded', String(!open));
      open ? menu.setAttribute('hidden','') : menu.removeAttribute('hidden');
    });
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hbg.setAttribute('aria-expanded','false');
        menu.setAttribute('hidden','');
      });
    });
    document.addEventListener('click', e => {
      if (!hbg.contains(e.target) && !menu.contains(e.target)) {
        hbg.setAttribute('aria-expanded','false');
        menu.setAttribute('hidden','');
      }
    });
  }
}

/* ── 5. SCROLL REVEAL ────────────────────────────── */
function initReveal() {
  const els = document.querySelectorAll('[data-rev]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = parseInt(e.target.dataset.delay || 0);
      setTimeout(() => e.target.classList.add('in'), delay);
      io.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
  els.forEach(el => io.observe(el));
}

/* ── 6. COUNTERS ─────────────────────────────────── */
function initCounters() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.target);
      const dur = 1800, t0 = performance.now();
      const tick = now => {
        const p = Math.min((now-t0)/dur, 1);
        const ep = 1 - Math.pow(1-p, 3);
        el.textContent = Math.floor(ep*target).toLocaleString('en-IN');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-target]').forEach(el => io.observe(el));
}

/* ── 7. AVATAR INTERACTIONS ──────────────────────── */
function initAvatars() {
  document.querySelectorAll('.av-node').forEach(node => {
    node.addEventListener('click', () => {
      const role = node.dataset.role;
      toast({ founder:'🚀 Opening Founder dashboard…', investor:'💰 Loading Investor portal…', manufacturer:'⚙️ Launching Manufacturer suite…' }[role] || 'Welcome!');
      document.querySelectorAll('.av-node').forEach(n => { n.style.opacity = n===node ? '1' : '.45'; });
      setTimeout(() => document.querySelectorAll('.av-node').forEach(n => n.style.opacity = ''), 1800);
    });
    node.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); node.click(); } });
  });
}

/* ── 8. HERO STAGE PARALLAX ──────────────────────── */
function initParallax() {
  const stage = document.getElementById('heroStage');
  if (!stage) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const sy = window.scrollY;
        if (sy < window.innerHeight) stage.style.transform = `translateY(${sy*.055}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ── 9. MATCH BARS ───────────────────────────────── */
function initMatchBars() {
  const arena = document.querySelector('.match-arena');
  if (!arena) return;
  const io = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    document.querySelectorAll('.mb-fill').forEach((f,i) => setTimeout(() => f.classList.add('go'), i*90));
    io.unobserve(arena);
  }, { threshold: 0.3 });
  io.observe(arena);
}

/* ── 10. ORB COUNTER ─────────────────────────────── */
function initOrb() {
  const orb = document.getElementById('scoreOrb');
  const num = document.querySelector('.orb-num');
  if (!orb || !num) return;
  const io = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    const target = 96, dur = 1500, t0 = performance.now();
    const tick = now => {
      const p = Math.min((now-t0)/dur, 1);
      num.textContent = Math.floor((1-Math.pow(1-p,3))*target);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    io.unobserve(orb);
  }, { threshold: 0.4 });
  io.observe(orb);
}

/* ── 11. CHAT SIMULATION ─────────────────────────── */
function initChat() {
  const msgs = document.getElementById('chatMsgs');
  if (!msgs) return;
  const script = [
    { who:'inv', text:"What's NexusAI's current MRR and growth trajectory?", t:1400 },
    { who:'av',  text:"MRR is ₹12.4L, growing 34% month-over-month for 4 consecutive months. Cohort retention sits at 89%.", t:3200 },
    { who:'inv', text:"Impressive. What's your primary customer acquisition channel?", t:5400 },
    { who:'av',  text:"70% via referral through existing fintech partnerships. CAC ₹1,200 vs LTV ₹38,000 — 31× ratio.", t:7000 },
    { who:'inv', text:"Unit economics look strong. Are you open to a term sheet conversation?", t:9400 },
    { who:'av',  text:"Absolutely — scheduling link sent to your inbox. Looking forward to connecting! 🚀", t:11200 },
  ];
  script.forEach(({ who, text, t }) => {
    setTimeout(() => {
      const b = document.createElement('div');
      b.className = `bubble bubble-${who==='inv'?'inv':'av'}`;
      const lbl = document.createElement('div');
      lbl.className = 'bubble-lbl';
      lbl.style.color = who==='inv' ? '#FFD166' : '#00FFD1';
      lbl.textContent = who==='inv' ? 'INVESTOR' : 'AI AVATAR';
      const p = document.createElement('p');
      p.style.margin = '0';
      p.textContent = text;
      b.appendChild(lbl); b.appendChild(p);
      msgs.appendChild(b);
      msgs.scrollTop = msgs.scrollHeight;
    }, t);
  });
}

/* ── 12. MAGNETIC BUTTONS ────────────────────────── */
function initMagnetic() {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width/2) * .16;
      const dy = (e.clientY - r.top  - r.height/2) * .16;
      btn.style.transform = `translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform .4s cubic-bezier(.34,1.56,.64,1)';
      btn.style.transform = '';
      setTimeout(() => btn.style.transition = '', 400);
    });
  });
}

/* ── 13. ROLE TABS ───────────────────────────────── */
function initRoleTabs() {
  const tabs = document.querySelectorAll('.role-tab');
  const btnTxt = document.getElementById('ctaBtnTxt');
  const labels = { founder:'Launch as Founder', investor:'Join as Investor', manufacturer:'Join as Manufacturer' };
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected','true');
      if (btnTxt) btnTxt.textContent = labels[tab.dataset.role] || 'Get Started';
    });
  });
}

/* ── 14. CONNECT BUTTONS ─────────────────────────── */
function initConnect() {
  document.querySelectorAll('.connect-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.closest('.ml-row')?.querySelector('.mlr-info strong')?.textContent || 'Investor';
      btn.textContent = 'Sent ✓';
      btn.disabled = true;
      toast(`Request sent to ${name}!`);
    });
  });
}

/* ── 15. ROOM CONTROLS ───────────────────────────── */
function initRoomCtrls() {
  document.querySelectorAll('.rc').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.style.background = 'rgba(0,255,209,.15)';
      btn.style.borderColor = 'rgba(0,255,209,.4)';
      setTimeout(() => { btn.style.background = btn.style.borderColor = ''; }, 700);
    });
  });
}

/* ── 16. SMOOTH SCROLL ───────────────────────────── */
function initScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const t = document.getElementById(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    });
  });
}

/* ── 17. TOAST ───────────────────────────────────── */
function toast(msg, dur=3000) {
  const slot = document.getElementById('toastSlot');
  if (!slot) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  slot.appendChild(el);
  setTimeout(() => {
    el.style.cssText = 'opacity:0;transform:translateY(8px);transition:opacity .3s,transform .3s';
    setTimeout(() => el.remove(), 300);
  }, dur);
}

/* ── BOOT ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  injectAvatars();
  initCursor();
  initCanvas();
  initNav();
  initReveal();
  initCounters();
  initAvatars();
  initParallax();
  initMatchBars();
  initOrb();
  initChat();
  initMagnetic();
  initRoleTabs();
  initConnect();
  initRoomCtrls();
  initScroll();
  document.body.dataset.ready = 'true';
});
