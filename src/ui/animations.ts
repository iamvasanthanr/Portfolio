/**
 * ui/animations.ts
 * The four signature DOM/CSS animations shown inside a project panel.
 * Each returns a handle with stop() so the panel can tear it down.
 * Plain language, no internal jargon, no em-dashes.
 */

import type { AnimationKind } from '../data/projects';

export interface AnimationHandle { stop(): void; }

const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function mountAnimation(kind: AnimationKind, panel: HTMLElement): AnimationHandle | null {
  const mount = panel.querySelector<HTMLElement>('.anim-mount');
  if (!mount) return null;
  switch (kind) {
    case 'book': return book(mount);
    case 'tv': return tv(mount);
    case 'ads': return ads(mount);
    case 'agents': return agents(mount);
    default: return null;
  }
}

/* small timer helper that auto-collects for teardown */
function timers() {
  const ids: number[] = [];
  return {
    after(fn: () => void, ms: number) { const id = window.setTimeout(fn, ms); ids.push(id); return id; },
    clear() { ids.forEach(clearTimeout); ids.length = 0; },
  };
}

/* ============================================================ BOOK */
function book(mount: HTMLElement): AnimationHandle {
  mount.innerHTML = `
    <div class="anim-head"><span class="tag">Storybook</span> it turns on its own, or use the buttons.</div>
    <div class="stagebox"><div class="stage"><div class="book" id="aBook">
      <div class="book-base"></div>
      ${[
        ['The Book That Locks Itself', 'How I taught a computer to protect e-books all by itself.', 'Once upon a time', 'Books could be stolen', 'Every e-book needs a secret lock so people cannot copy it. A person invented each lock by hand, and if thieves picked one, many books were exposed.', '1 by 1', 'locks by hand'],
        ['', '', 'The big idea', 'Let the computer invent the locks', 'A helper dreams up a brand-new lock, then tests it on itself. If it is weak, it throws it away and tries again, no human needed.', '70,000+', 'locks invented'],
        ['', '', 'The clever part', 'One idea, two languages', 'Different Kindles speak different computer languages. The helper writes the lock once, translates it, and checks the translation still works.', 'Every', 'device understands it'],
        ['', '', 'Out in the world', 'Months of work, then weeks', 'What used to take about two months now takes under a month, on 500,000+ real devices, so a cracked lock can be replaced fast.', '2mo to <1', 'and never runs out'],
      ].map((p, i) => bookPage(i, p as string[])).join('')}
    </div></div>
      <div class="caption-strip"><span class="step" id="aBookStep">1</span><span class="txt" id="aBookCap"></span></div>
    </div>
    <div class="navrow"><button id="aBookPrev">Prev page</button><button id="aBookNext">Next page</button></div>`;

  const bookEl = mount.querySelector('#aBook') as HTMLElement;
  const pages = [...bookEl.querySelectorAll<HTMLElement>('.page')];
  const cap = mount.querySelector('#aBookCap') as HTMLElement;
  const step = mount.querySelector('#aBookStep') as HTMLElement;
  const CAPS = [
    'The problem: every e-book needs a <b>secret lock</b>, and they used to be made one at a time, by hand.',
    'The idea: let a computer <b>invent a lock and test itself</b>, keeping the strong ones.',
    'The clever part: write the lock once, then <b>translate it</b> for every kind of Kindle.',
    'The payoff: it is on <b>500,000+</b> real devices, and new locks take <b>weeks instead of months</b>.',
  ];
  let idx = 0;
  const render = () => {
    pages.forEach((p, i) => { p.classList.toggle('turned', i < idx); p.style.zIndex = String(i < idx ? i + 1 : pages.length - i + 10); });
    const c = Math.min(idx, CAPS.length - 1);
    cap.innerHTML = CAPS[c]; step.textContent = String(c + 1);
  };
  const go = (n: number) => { idx = Math.max(0, Math.min(pages.length, n)); render(); };
  (mount.querySelector('#aBookNext') as HTMLElement).onclick = () => go(idx + 1);
  (mount.querySelector('#aBookPrev') as HTMLElement).onclick = () => go(idx - 1);
  render();
  const t = timers();
  let auto = 0;
  if (!REDUCE) auto = window.setInterval(() => go(idx >= pages.length ? 0 : idx + 1), 3000);
  return { stop() { clearInterval(auto); t.clear(); } };
}

function bookPage(i: number, p: string[]): string {
  const [coverTitle, coverSub, backNum, backTitle, backBody, metricN, metricL] = p;
  const front = i === 0
    ? `<div class="face cover"><div><div class="brand">A Kindle Story</div><div class="cover-rule"></div><div class="pg-title">${coverTitle}</div><p class="pg-body">${coverSub}</p></div><div class="pg-body" style="opacity:.7">Turn the page</div></div>`
    : `<div class="face"><span class="pg-num">page</span><div class="fingerprint"></div></div>`;
  return `<div class="page" data-i="${i}">${front}
    <div class="face face--back"><span class="pg-num">${backNum}</span><h3 class="pg-title">${backTitle}</h3><p class="pg-body">${backBody}</p><div class="pg-metric"><b>${metricN}</b><span>${metricL}</span></div></div>
  </div>`;
}

/* ============================================================ TV */
function tv(mount: HTMLElement): AnimationHandle {
  mount.innerHTML = `
    <div class="anim-head"><span class="tag">On the TV</span> watch the checker catch bad subtitles before they reach you.</div>
    <div class="stagebox"><div class="tvp"><div class="screen on" id="aScreen">
      <div class="show"></div><div class="defect-flash" id="aFlash"></div>
      <div class="subs" id="aSubs"><span class="lang" id="aLang">English</span><div class="caption" id="aCap"></div><span class="verdict-badge" id="aBadge"></span></div>
    </div></div>
      <div class="verdicts" id="aChecks">
        <div class="verdict" data-k="sync"><span class="mark">&bull;</span>In sync with the speech?</div>
        <div class="verdict" data-k="present"><span class="mark">&bull;</span>Actually there (not missing)?</div>
        <div class="verdict" data-k="lang"><span class="mark">&bull;</span>The right language?</div>
      </div>
      <div class="caption-strip"><span class="step">&#128250;</span><span class="txt" id="aTvCap"></span></div>
    </div>`;

  const subs = mount.querySelector('#aSubs') as HTMLElement;
  const cap = mount.querySelector('#aCap') as HTMLElement;
  const lang = mount.querySelector('#aLang') as HTMLElement;
  const badge = mount.querySelector('#aBadge') as HTMLElement;
  const flash = mount.querySelector('#aFlash') as HTMLElement;
  const tvCap = mount.querySelector('#aTvCap') as HTMLElement;
  const screen = mount.querySelector('#aScreen') as HTMLElement;
  const checks: Record<string, HTMLElement> = {
    sync: mount.querySelector('#aChecks [data-k=sync]')!,
    present: mount.querySelector('#aChecks [data-k=present]')!,
    lang: mount.querySelector('#aChecks [data-k=lang]')!,
  };
  const SCENES = [
    { kind: 'good', l: 'English', txt: 'Looks like it is going to rain tonight.', say: 'A healthy subtitle, on time, present, right language. <b>PASS.</b>' },
    { kind: 'sync', l: 'English', txt: 'Looks like it is going to rain tonight.', say: 'This one shows up <b>late</b>, out of sync with the speech. <b>Caught.</b>' },
    { kind: 'missing', l: 'English', txt: 'and that is why the sky turns red.', say: 'The character is talking but there is <b>no subtitle</b>. <b>Caught.</b>' },
    { kind: 'wrong', l: 'Spanish track', txt: 'Es ist ein sch\u00f6ner Tag.', say: 'The track says Spanish but the text is <b>German</b>. <b>Caught.</b>' },
    { kind: 'fixed', l: 'English', txt: 'Looks like it is going to rain tonight.', say: 'The out-of-sync one gets <b>auto-corrected</b>, back in sync. <b>Fixed.</b>' },
  ];
  const t = timers();
  let stopped = false;
  const reset = () => Object.values(checks).forEach((c) => c.classList.remove('done', 'pass', 'fail'));
  const mark = (k: string, ok: boolean) => { const c = checks[k]; c.classList.add('done', ok ? 'pass' : 'fail'); c.querySelector('.mark')!.innerHTML = ok ? '&#10003;' : '&#10007;'; };
  const clearGlitch = () => { subs.classList.remove('glitch-sync', 'glitch-missing', 'glitch-wrong', 'v-good', 'v-bad', 'v-fixed'); screen.classList.remove('flag-bad'); };
  const flagBad = () => { screen.classList.add('flag-bad'); flash.classList.remove('on'); void flash.offsetWidth; flash.classList.add('on'); };

  const verdict = (scene: typeof SCENES[number]) => {
    if (scene.kind === 'good') {
      t.after(() => mark('sync', true), 200); t.after(() => mark('present', true), 550); t.after(() => mark('lang', true), 900);
      t.after(() => { subs.classList.add('v-good'); badge.textContent = '\u2713 PASS, looks good'; }, 1150);
    } else if (scene.kind === 'sync') {
      subs.classList.add('glitch-sync');
      t.after(() => { mark('sync', false); flagBad(); }, 300); t.after(() => mark('present', true), 650); t.after(() => mark('lang', true), 1000);
      t.after(() => { subs.classList.add('v-bad'); badge.textContent = '\u2717 OUT OF SYNC'; }, 1200);
    } else if (scene.kind === 'missing') {
      subs.classList.add('glitch-missing');
      t.after(() => mark('sync', true), 300); t.after(() => { mark('present', false); flagBad(); }, 650); t.after(() => mark('lang', true), 1000);
      t.after(() => { subs.classList.add('v-bad'); badge.textContent = '\u2717 MISSING SUBTITLE'; }, 1200);
    } else if (scene.kind === 'wrong') {
      subs.classList.add('glitch-wrong');
      t.after(() => mark('sync', true), 300); t.after(() => mark('present', true), 650); t.after(() => { mark('lang', false); flagBad(); }, 1000);
      t.after(() => { subs.classList.add('v-bad'); badge.textContent = '\u2717 WRONG LANGUAGE'; }, 1200);
    } else {
      t.after(() => mark('sync', true), 300); t.after(() => mark('present', true), 650); t.after(() => mark('lang', true), 1000);
      t.after(() => { subs.classList.add('v-fixed'); badge.textContent = '\u21ba AUTO-CORRECTED, now in sync'; }, 1200);
    }
  };
  const play = (scene: typeof SCENES[number], done: () => void) => {
    clearGlitch(); reset(); badge.textContent = ''; lang.textContent = scene.l; subs.classList.add('show-lang');
    tvCap.innerHTML = scene.say;
    let i = 0;
    const type = () => {
      if (stopped) return;
      if (i <= scene.txt.length) { cap.innerHTML = scene.txt.slice(0, i) + '<span class="cursor"></span>'; i++; t.after(type, 30); }
      else { cap.textContent = scene.txt; verdict(scene); t.after(done, 2600); }
    };
    type();
  };
  const loop = (n: number) => { if (stopped) return; play(SCENES[n % SCENES.length], () => loop(n + 1)); };
  if (REDUCE) { const s = SCENES[0]; lang.textContent = s.l; subs.classList.add('show-lang', 'v-good'); cap.textContent = s.txt; badge.textContent = '\u2713 PASS'; }
  else loop(0);
  return { stop() { stopped = true; t.clear(); } };
}

/* ============================================================ ADS */
function ads(mount: HTMLElement): AnimationHandle {
  mount.innerHTML = `
    <div class="anim-head"><span class="tag">Live ad matching</span> the right ad is picked for what the page is about, in any language.</div>
    <div class="stagebox"><div class="board2" id="aBoard">
      <div class="article2">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin-bottom:.4rem;">
          <div class="panel-label">The page they are reading</div>
          <div class="langpick" id="aLangPick"></div>
        </div>
        <h4 id="aArtTitle"></h4><p id="aArtBody"></p>
      </div>
      <div class="right2">
        <div class="target-zone"><div class="target" id="aTarget"><span class="ring2"></span><span class="ring2"></span><span class="bull"></span></div><div class="zone-label">reading the page</div></div>
        <div class="ads" id="aAds">
          <div class="ad" data-match="false"><div class="ad-img">&#127859;</div><div class="ad-tag">Kitchen</div><div class="ad-title">Nonstick Pan</div></div>
          <div class="ad" data-match="true"><div class="ad-img">&#129406;</div><div class="ad-tag">Outdoors</div><div class="ad-title">Hiking Boots</div></div>
          <div class="ad" data-match="false"><div class="ad-img">&#128241;</div><div class="ad-tag">Phones</div><div class="ad-title">Wireless Charger</div></div>
        </div>
      </div>
    </div>
      <div class="caption-strip"><span class="step">&#129409;</span><span class="txt" id="aAdsCap"></span></div>
    </div>
    <div class="meter2"><div class="top"><span class="panel-label">How often the ad actually fits the page</span><span class="val" id="aRate">40%</span></div><div class="bar"><i id="aRateFill"></i></div></div>`;

  const board = mount.querySelector('#aBoard') as HTMLElement;
  const target = mount.querySelector('#aTarget') as HTMLElement;
  const ads2 = [...board.querySelectorAll<HTMLElement>('.ad')];
  const rate = mount.querySelector('#aRate') as HTMLElement;
  const rfill = mount.querySelector('#aRateFill') as HTMLElement;
  const artTitle = mount.querySelector('#aArtTitle') as HTMLElement;
  const artBody = mount.querySelector('#aArtBody') as HTMLElement;
  const cap = mount.querySelector('#aAdsCap') as HTMLElement;
  const zoneLabel = target.parentElement!.querySelector('.zone-label') as HTMLElement;
  const langPick = mount.querySelector('#aLangPick') as HTMLElement;

  const PAGES = [
    { code: 'EN', title: 'Picking Your First Hiking Boots', kws: ['hiking', 'boots', 'trail'], body: 'A good <span class="kw" data-tag="hiking">hiking</span> trip needs the right <span class="kw" data-tag="boots">boots</span> for a muddy <span class="kw" data-tag="trail">trail</span>.' },
    { code: 'ES', title: 'Elegir tus primeras botas de senderismo', kws: ['senderismo', 'botas', 'sendero'], body: 'Una ruta de <span class="kw" data-tag="senderismo">senderismo</span> necesita las <span class="kw" data-tag="botas">botas</span> adecuadas para un <span class="kw" data-tag="sendero">sendero</span> con barro.' },
    { code: 'DE', title: 'Die ersten Wanderschuhe', kws: ['Wandern', 'Schuhe', 'Weg'], body: 'Eine <span class="kw" data-tag="Wandern">Wander</span>tour braucht die richtigen <span class="kw" data-tag="Schuhe">Schuhe</span> f\u00fcr einen matschigen <span class="kw" data-tag="Weg">Weg</span>.' },
  ];
  const t = timers();
  let stopped = false, pi = 0;

  langPick.innerHTML = PAGES.map((p, i) => `<button class="lchip${i === 0 ? ' on' : ''}" data-i="${i}">${p.code}</button>`).join('');
  langPick.querySelectorAll<HTMLElement>('.lchip').forEach((b) => (b.onclick = () => { pi = Number(b.dataset.i); t.clear(); run(); }));

  const fly = (kw: HTMLElement) => {
    const bR = board.getBoundingClientRect(), kR = kw.getBoundingClientRect(), tR = target.querySelector('.bull')!.getBoundingClientRect();
    const sx = kR.left - bR.left + kR.width / 2, sy = kR.top - bR.top + kR.height / 2;
    const ex = tR.left - bR.left + tR.width / 2, ey = tR.top - bR.top + tR.height / 2;
    const f = document.createElement('div'); f.className = 'flyer'; f.textContent = kw.dataset.tag || ''; board.appendChild(f);
    const mx = (sx + ex) / 2, my = Math.min(sy, ey) - 30;
    const a = f.animate([
      { transform: `translate(${sx}px,${sy}px)`, opacity: 0 },
      { transform: `translate(${mx}px,${my}px) scale(1.05)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${ex}px,${ey}px) scale(.4)`, opacity: 0 },
    ], { duration: 850, easing: 'cubic-bezier(.76,.01,.2,1)' });
    kw.classList.add('firing'); t.after(() => kw.classList.remove('firing'), 500);
    a.onfinish = () => { f.remove(); target.classList.add('hit'); t.after(() => target.classList.remove('hit'), 500); };
  };

  function run() {
    if (stopped) return;
    const page = PAGES[pi];
    langPick.querySelectorAll<HTMLElement>('.lchip').forEach((b) => b.classList.toggle('on', Number(b.dataset.i) === pi));
    artTitle.textContent = page.title; artBody.innerHTML = page.body;
    const kws = [...board.querySelectorAll<HTMLElement>('.kw')];
    rate.textContent = '40%'; rfill.style.width = '40%'; ads2.forEach((a) => a.classList.remove('match', 'dim'));
    zoneLabel.textContent = 'reading the page';
    cap.innerHTML = `Someone opens a page in <b>${page.code}</b>. First, read what it is about.`;
    if (REDUCE) { ads2.forEach((a) => a.classList.add(a.dataset.match === 'true' ? 'match' : 'dim')); rate.textContent = '70%'; rfill.style.width = '70%'; return; }
    t.after(() => { zoneLabel.textContent = 'found the key words'; cap.innerHTML = `Pull out the words that matter: <b>${page.kws.join(', ')}</b> (works in any language).`; kws.forEach((k, i) => t.after(() => fly(k), i * 240)); }, 1100);
    const afterKw = 1100 + kws.length * 240 + 500;
    t.after(() => { zoneLabel.textContent = 'best match found'; cap.innerHTML = 'Now pick the ad that truly fits: the <b>hiking boots</b> win; the others are set aside.'; ads2.forEach((a) => a.classList.add(a.dataset.match === 'true' ? 'match' : 'dim')); }, afterKw);
    t.after(() => { cap.innerHTML = 'Better matching means the right ad shows more often, up from <b>40% to 70%</b>.'; rfill.style.width = '70%'; const t0 = performance.now(); const tk = (now: number) => { if (stopped) return; const p = Math.min((now - t0) / 1600, 1), e = 1 - Math.pow(1 - p, 3); rate.textContent = Math.round(40 + 30 * e) + '%'; if (p < 1) requestAnimationFrame(tk); }; requestAnimationFrame(tk); }, afterKw + 900);
    t.after(() => { pi = (pi + 1) % PAGES.length; run(); }, afterKw + 4200);
  }
  run();
  return { stop() { stopped = true; t.clear(); } };
}

/* ============================================================ AGENTS */
function agents(mount: HTMLElement): AnimationHandle {
  mount.innerHTML = `
    <div class="anim-head"><span class="tag">Watch the helpers work</span> a boring hour-long chore, done in seconds.</div>
    <div class="stagebox"><div class="graph" id="aGraph">
      <canvas id="aCv"></canvas>
      ${[['orch', 'Boss', 'splits up the work', 50, 48], ['oncall', 'Alerts', 'what broke?', 15, 22], ['tickets', 'Tickets', 'open issues', 15, 74], ['sprint', 'Tasks', 'who is on what', 85, 22], ['wiki', 'Notes', 'team docs', 85, 74], ['report', 'Report', 'the summary', 50, 90]]
        .map(([id, name, role, x, y]) => `<div class="node${id === 'orch' ? ' orchestrator' : ''}" data-id="${id}" style="left:${x}%;top:${y}%;"><div class="orb">${orb(id as string)}</div><div class="name">${name}</div><div class="role">${role}</div></div>`).join('')}
    </div></div>
      <div class="caption-strip"><span class="step">&#129504;</span><span class="txt" id="aAgCap"></span></div>
      <div class="report-build"><div class="rb-title">&#128221; Handover report</div><ul id="aReportList"></ul></div>
    </div>`;

  const graph = mount.querySelector('#aGraph') as HTMLElement;
  const cv = mount.querySelector('#aCv') as HTMLCanvasElement;
  const ctx = cv.getContext('2d')!;
  const cap = mount.querySelector('#aAgCap') as HTMLElement;
  const reportList = mount.querySelector('#aReportList') as HTMLElement;
  const N: Record<string, { x: number; y: number }> = { orch: { x: .5, y: .48 }, oncall: { x: .15, y: .22 }, tickets: { x: .15, y: .74 }, sprint: { x: .85, y: .22 }, wiki: { x: .85, y: .74 }, report: { x: .5, y: .9 } };
  const els: Record<string, HTMLElement> = {};
  graph.querySelectorAll<HTMLElement>('.node').forEach((n) => (els[n.dataset.id!] = n));
  const E: [string, string][] = [['orch', 'oncall'], ['orch', 'tickets'], ['orch', 'sprint'], ['orch', 'wiki'], ['orch', 'report']];

  let W = 0, H = 0; const dpr = Math.min(devicePixelRatio || 1, 2);
  let pulses: { from: string; to: string; p: number; c: string; cb?: () => void }[] = [];
  let raf = 0; let stopped = false; const t = timers();
  const size = () => { const r = graph.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  const px = (id: string) => ({ x: N[id].x * W, y: N[id].y * H });
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (const [a, b] of E) { const p1 = px(a), p2 = px(b); ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.strokeStyle = 'rgba(120,140,170,.18)'; ctx.lineWidth = 1.3; ctx.stroke(); }
    for (const pl of pulses) { const p1 = px(pl.from), p2 = px(pl.to), x = p1.x + (p2.x - p1.x) * pl.p, y = p1.y + (p2.y - p1.y) * pl.p; const g = ctx.createLinearGradient(p1.x, p1.y, x, y); g.addColorStop(0, 'rgba(56,232,255,0)'); g.addColorStop(1, 'rgba(56,232,255,.9)'); ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(x, y); ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 7); ctx.fillStyle = pl.c; ctx.shadowColor = pl.c; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0; }
  };
  const step = () => { for (const p of pulses) p.p += 0.02; pulses = pulses.filter((p) => { if (p.p >= 1) { p.cb?.(); return false; } return true; }); draw(); raf = pulses.length && !stopped ? requestAnimationFrame(step) : 0; };
  const send = (a: string, b: string, c: string, cb?: () => void) => { pulses.push({ from: a, to: b, p: 0, c, cb }); if (!raf) raf = requestAnimationFrame(step); };
  const act = (id: string, ms = 900) => { const e = els[id]; if (!e) return; e.classList.add('active'); t.after(() => e.classList.remove('active'), ms); };
  const addReport = (txt: string) => { const li = document.createElement('li'); li.innerHTML = txt; reportList.appendChild(li); requestAnimationFrame(() => li.classList.add('in')); };

  const SEQ = [
    { tool: 'oncall', cap: 'The <b>Boss</b> asks <b>Alerts</b>: anything on fire right now?', line: '&#9989; No active alerts, systems healthy' },
    { tool: 'tickets', cap: 'Then <b>Tickets</b>: any open issues to hand over?', line: '&#128221; 3 open tickets (1 high priority)' },
    { tool: 'sprint', cap: 'The <b>Tasks</b> helper: what is everyone working on?', line: '&#128202; Sprint 72% done, 2 tasks at risk' },
    { tool: 'wiki', cap: 'And <b>Notes</b>: grab the latest team docs.', line: '&#128214; Latest runbook and notes attached' },
  ];
  function run() {
    if (stopped) return;
    pulses = []; draw(); reportList.innerHTML = '';
    cap.innerHTML = 'Normally a person spends about an hour gathering all this by hand. Watch the helpers do it.';
    let d = 800;
    for (const s of SEQ) {
      t.after(() => { if (stopped) return; act('orch'); cap.innerHTML = s.cap; send('orch', s.tool, '#8b5cf6', () => { act(s.tool); send(s.tool, 'orch', '#38e8ff', () => { act('orch'); addReport(s.line); }); }); }, d);
      d += 1500;
    }
    t.after(() => { if (stopped) return; act('orch'); cap.innerHTML = 'The <b>Boss</b> stitches it into one tidy <b>report</b>, done.'; send('orch', 'report', '#4ade80', () => { act('report', 1600); addReport('&#10004; <b>Handover ready, about 1 hour of work in under a minute</b>'); }); }, d);
    t.after(run, d + 4500);
  }
  size(); window.addEventListener('resize', size);
  if (REDUCE) { Object.values(els).forEach((e) => e.classList.add('active')); cap.textContent = 'Agents gather from 5 tools and write the summary in under a minute.'; }
  else run();
  return { stop() { stopped = true; t.clear(); if (raf) cancelAnimationFrame(raf); window.removeEventListener('resize', size); } };
}

function orb(id: string): string {
  return ({ orch: '\u{1F9E0}', oncall: '\u{1F4E2}', tickets: '\u{1F39F}\u{FE0F}', sprint: '\u{1F4CA}', wiki: '\u{1F4D6}', report: '\u{1F4DD}' } as Record<string, string>)[id] || '';
}
