// Builds the GitHub-activity cards in assets/ from live API data.
//
//   GH_TOKEN=... node scripts/build-stats.mjs
//
// Everything is all-time. Calendar numbers (contributions, streaks, active
// days, monthly activity) come from the public contribution calendar, which
// already counts private work, so the default Actions token is enough.
// Commits are counted from history-only clones of every accessible repo,
// across all branches and every author email in AUTHOR_EMAILS, de-duplicated
// by SHA. Commits, pull requests, repositories and languages need a token that
// can read the private repos; without one, the last values in
// assets/data/stats.json are reused instead of being overwritten with
// public-only numbers. Only totals are written, never repo names.

import { readFileSync, writeFileSync, mkdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const USER = process.env.GH_USER || 'Walidd22';
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const AUTHOR_EMAILS = (process.env.AUTHOR_EMAILS || 'walid92.adra@gmail.com,w22a.work@gmail.com,219841728+walidd22@users.noreply.github.com')
  .split(',').map((e) => e.trim().toLowerCase());
if (!TOKEN) throw new Error('GH_TOKEN is required');

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = join(ROOT, 'assets');
const CACHE = join(ASSETS, 'data', 'stats.json');

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': `${USER}-profile-stats`,
};

async function gh(path, { raw = false } = {}) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (raw) return res;
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

async function graphql(query, variables = {}) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (body.errors) throw new Error(JSON.stringify(body.errors));
  return body.data;
}

// ---------------------------------------------------------------- calendar

async function calendarDays() {
  const { user } = await graphql(
    `query($login:String!){ user(login:$login){ contributionsCollection{ contributionYears } } }`,
    { login: USER },
  );
  const days = [];
  for (const year of user.contributionsCollection.contributionYears.sort()) {
    const data = await graphql(
      `query($login:String!,$from:DateTime!,$to:DateTime!){ user(login:$login){
         contributionsCollection(from:$from,to:$to){ contributionCalendar{ weeks{ contributionDays{ date contributionCount } } } }
       } }`,
      { login: USER, from: `${year}-01-01T00:00:00Z`, to: `${year}-12-31T23:59:59Z` },
    );
    days.push(...data.user.contributionsCollection.contributionCalendar.weeks.flatMap((w) => w.contributionDays));
  }
  const today = new Date().toISOString().slice(0, 10);
  const seen = new Set();
  return days
    .filter((d) => d.date <= today && !seen.has(d.date) && seen.add(d.date))
    .sort((x, y) => x.date.localeCompare(y.date));
}

async function calendarStats() {
  const all = await calendarDays();
  const first = all.findIndex((d) => d.contributionCount > 0);
  const days = all.slice(Math.max(0, first));

  let total = 0, peak = 0, active = 0, best = 0, run = 0, bestEnd = null;
  for (const d of days) {
    total += d.contributionCount;
    peak = Math.max(peak, d.contributionCount);
    if (d.contributionCount > 0) {
      active++;
      run++;
      if (run > best) { best = run; bestEnd = d.date; }
    } else run = 0;
  }

  // Today still counts as part of the streak while it has no contributions yet.
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) current++;
    else if (i !== days.length - 1) break;
  }

  const months = new Map();
  for (const d of all) {
    const key = d.date.slice(0, 7);
    months.set(key, (months.get(key) || 0) + d.contributionCount);
  }
  const monthly = [...months.entries()].slice(-12).map(([month, count]) => ({ month, count }));

  const bestStart = bestEnd ? shiftDays(bestEnd, -(best - 1)) : null;
  return {
    contributions: total,
    peak, active, best, current, bestStart, bestEnd,
    from: days[0].date, to: days.at(-1).date,
    monthly,
  };
}

function shiftDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// ------------------------------------------------- private-repo statistics

// Unique commit SHAs authored by AUTHOR_EMAILS on any branch of a history-only clone.
function authoredShas(repo, dir) {
  const target = join(dir, repo.replace('/', '__'));
  try {
    // Token goes in a header with credential helpers disabled, so no OS credential
    // manager ever sees it or pops up an account picker.
    const basic = Buffer.from(`x-access-token:${TOKEN}`).toString('base64');
    execFileSync('git', ['-c', 'credential.helper=', '-c', `http.extraHeader=Authorization: Basic ${basic}`,
      'clone', '--quiet', '--bare', '--filter=blob:none', `https://github.com/${repo}.git`, target], {
      stdio: 'ignore',
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' },
    });
    const out = execFileSync('git', ['-C', target, 'log', '--all', '--format=%H %ae'], { encoding: 'utf8', maxBuffer: 1 << 28 });
    return out.split('\n').filter(Boolean)
      .map((line) => line.split(' '))
      .filter(([, email]) => AUTHOR_EMAILS.includes((email || '').toLowerCase()))
      .map(([sha]) => sha);
  } catch {
    return []; // empty repository
  }
}

async function searchCount(q) {
  const r = await gh(`/search/issues?q=${encodeURIComponent(`author:${USER} ${q}`)}&per_page=1`);
  return r.total_count;
}

async function repoStats() {
  const res = await gh('/user/repos?per_page=100&affiliation=owner,collaborator,organization_member', { raw: true });
  if (!res.ok) return null; // token cannot see private repos
  const all = await res.json();
  const repos = all.filter((r) => !r.fork);

  // Forks are cloned too (work merged upstream lives there); SHAs de-duplicate.
  const dir = mkdtempSync(join(tmpdir(), 'profile-stats-'));
  const shas = new Set();
  const bytes = {};
  try {
    for (const r of all) for (const sha of authoredShas(r.full_name, dir)) shas.add(sha);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  for (const r of repos) {
    const langs = await gh(`/repos/${r.full_name}/languages`).catch(() => ({}));
    for (const [lang, n] of Object.entries(langs)) bytes[lang] = (bytes[lang] || 0) + n;
  }

  const total = Object.values(bytes).reduce((a, b) => a + b, 0) || 1;
  const languages = Object.entries(bytes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, n]) => ({ name, pct: (n / total) * 100 }));

  return {
    repos: repos.length,
    commits: shas.size,
    prs: await searchCount('type:pr'),
    prsMerged: await searchCount('type:pr is:merged'),
    languages,
  };
}

// ----------------------------------------------------------------- render

const THEMES = {
  dark: {
    bg: '#0A0A0E', border: '#1E2838', text: '#E8EDF4', muted: '#8994A6', faint: '#1A2230',
    blue: '#4D94FF', green: '#34D399', cyan: '#22D3EE', amber: '#FBBF24',
  },
  light: {
    bg: '#FFFFFF', border: '#D9DFE8', text: '#0E1624', muted: '#5A6678', faint: '#EEF2F7',
    blue: '#0055FF', green: '#059669', cyan: '#0891B2', amber: '#B45309',
  },
};

const LANG_COLORS = {
  TypeScript: '#3178C6', JavaScript: '#F1E05A', Python: '#3572A5', HTML: '#E34C26',
  CSS: '#663399', PLpgSQL: '#336790', Shell: '#89E051', HCL: '#844FBA', Dockerfile: '#384D54',
  SCSS: '#C6538C', Go: '#00ADD8', Rust: '#DEA584', Java: '#B07219', 'Jupyter Notebook': '#DA5B0B',
  Kotlin: '#A97BFF', Swift: '#F05138', PowerShell: '#012456', Batchfile: '#C1F12E',
};

const W = 400, H = 210;
const SANS = `'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif`;
const fmt = (n) => Number(n).toLocaleString('en-US');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function card(t, title, subtitle, body, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${SANS}" role="img" aria-label="${esc(label)}">
<title>${esc(label)}</title>
<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="${t.blue}"/><stop offset="1" stop-color="${t.green}"/></linearGradient>
</defs>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="${t.bg}" stroke="${t.border}"/>
<rect x="16" y="0.5" width="${W - 32}" height="2" rx="1" fill="url(#g)"/>
<text x="20" y="34" fill="${t.text}" font-size="15" font-weight="600">${esc(title)}</text>
<text x="${W - 20}" y="34" fill="${t.muted}" font-size="12" text-anchor="end">${esc(subtitle)}</text>
${body}
</svg>
`;
}

function statsCard(t, s) {
  const tiles = [
    [fmt(s.contributions), 'Contributions', t.blue],
    [fmt(s.commits), 'Commits', t.green],
    [fmt(s.prs), 'Pull requests', t.cyan],
    [fmt(s.active), 'Active days', t.blue],
    [fmt(s.peak), 'Peak day', t.green],
    [fmt(s.repos), 'Repositories', t.cyan],
  ];
  const body = tiles.map(([value, label, color], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 20 + col * 124, y = 52 + row * 74;
    return `<g>
<rect x="${x}" y="${y}" width="112" height="64" rx="8" fill="${t.faint}"/>
<text x="${x + 12}" y="${y + 32}" fill="${color}" font-size="24" font-weight="700">${value}</text>
<text x="${x + 12}" y="${y + 52}" fill="${t.muted}" font-size="12">${label}</text>
</g>`;
  }).join('\n');
  return card(t, 'GitHub activity', 'all time · incl. private', body,
    `${fmt(s.contributions)} contributions, ${fmt(s.commits)} commits, ${fmt(s.prs)} pull requests, ${s.active} active days, peak day ${s.peak}, ${s.repos} repositories`);
}

function languagesCard(t, s) {
  const langs = s.languages;
  let x = 20;
  const barW = W - 40;
  const segments = langs.map((l, i) => {
    const w = Math.max(2, (l.pct / 100) * barW);
    const seg = `<rect x="${x.toFixed(1)}" y="52" width="${w.toFixed(1)}" height="10" fill="${LANG_COLORS[l.name] || t.muted}"/>`;
    x += w;
    return seg;
  }).join('');
  const rows = langs.map((l, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const lx = 20 + col * 184, ly = 98 + row * 34;
    return `<g>
<circle cx="${lx + 6}" cy="${ly - 5}" r="6" fill="${LANG_COLORS[l.name] || t.muted}"/>
<text x="${lx + 20}" y="${ly}" fill="${t.text}" font-size="14">${esc(l.name)}</text>
<text x="${lx + 172}" y="${ly}" fill="${t.muted}" font-size="13" text-anchor="end">${l.pct.toFixed(1)}%</text>
</g>`;
  }).join('\n');
  const body = `<clipPath id="bar"><rect x="20" y="52" width="${barW}" height="10" rx="5"/></clipPath>
<g clip-path="url(#bar)">${segments}</g>
${rows}`;
  return card(t, 'Languages', `across ${s.repos} repositories`, body,
    `Top languages: ${langs.map((l) => `${l.name} ${l.pct.toFixed(1)}%`).join(', ')}`);
}

function activityCard(t, s) {
  const max = Math.max(...s.monthly.map((m) => m.count), 1);
  const n = s.monthly.length, gap = 8;
  const bw = (W - 40 - gap * (n - 1)) / n;
  const top = 58, base = 172;
  const bars = s.monthly.map((m, i) => {
    const h = Math.max(3, (m.count / max) * (base - top));
    const x = 20 + i * (bw + gap);
    const name = new Date(`${m.month}-01T00:00:00Z`).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const isMax = m.count === max;
    return `<g>
<rect x="${x.toFixed(1)}" y="${(base - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="url(#bars)"/>
${isMax ? `<text x="${(x + bw / 2).toFixed(1)}" y="${(base - h - 6).toFixed(1)}" fill="${t.text}" font-size="12" font-weight="600" text-anchor="middle">${fmt(m.count)}</text>` : ''}
<text x="${(x + bw / 2).toFixed(1)}" y="${base + 18}" fill="${t.muted}" font-size="11" text-anchor="middle">${name.slice(0, 3)}</text>
</g>`;
  }).join('\n');
  const body = `<linearGradient id="bars" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${t.blue}"/><stop offset="1" stop-color="${t.green}"/></linearGradient>
<line x1="20" y1="${base + 0.5}" x2="${W - 20}" y2="${base + 0.5}" stroke="${t.border}"/>
${bars}`;
  return card(t, 'Monthly contributions', 'last 12 months', body,
    `Monthly contributions over the last 12 months, peaking at ${fmt(max)}`);
}

function streakCard(t, s) {
  const d = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const r = 40, c = 2 * Math.PI * r;
  const filled = Math.min(1, s.current / Math.max(s.best, 1));
  const cols = [
    { x: 70, value: fmt(s.active), label: 'Active days', sub: `${Math.round((s.active / (1 + (Date.parse(s.to) - Date.parse(s.from)) / 864e5)) * 100)}% of days`, color: t.blue },
    { x: 330, value: `${s.best}d`, label: 'Best streak', sub: s.bestStart ? `${d(s.bestStart)} – ${d(s.bestEnd)}` : '', color: t.green },
  ];
  const side = cols.map((k) => `<g>
<text x="${k.x}" y="112" fill="${k.color}" font-size="28" font-weight="700" text-anchor="middle">${k.value}</text>
<text x="${k.x}" y="138" fill="${t.text}" font-size="13" font-weight="600" text-anchor="middle">${k.label}</text>
<text x="${k.x}" y="158" fill="${t.muted}" font-size="11.5" text-anchor="middle">${k.sub}</text>
</g>`).join('\n');
  const body = `<line x1="140" y1="70" x2="140" y2="170" stroke="${t.border}"/>
<line x1="260" y1="70" x2="260" y2="170" stroke="${t.border}"/>
<circle cx="200" cy="118" r="${r}" fill="none" stroke="${t.faint}" stroke-width="7"/>
<circle cx="200" cy="118" r="${r}" fill="none" stroke="url(#g)" stroke-width="7" stroke-linecap="round"
  stroke-dasharray="${(c * filled).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 200 118)"/>
<text x="200" y="126" fill="${t.text}" font-size="26" font-weight="700" text-anchor="middle">${s.current}</text>
<text x="200" y="186" fill="${t.text}" font-size="13" font-weight="600" text-anchor="middle">Current streak</text>
${side}`;
  const dy = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  return card(t, 'Streaks', `${dy(s.from)} – ${dy(s.to)}`, body,
    `Current streak ${s.current} days, best streak ${s.best} days, ${s.active} active days`);
}

// ------------------------------------------------------------------- main

const cached = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {};
let calendar = await calendarStats();
// The calendar only counts private work while "Private contributions" is enabled on
// the profile. If it suddenly drops by more than half, keep the last good numbers.
if (cached.contributions && calendar.contributions < cached.contributions * 0.5) {
  console.warn(`Calendar dropped from ${cached.contributions} to ${calendar.contributions} — is "Private contributions" off? Keeping cached calendar stats.`);
  calendar = {};
}
const repo = await repoStats();
if (!repo) console.log('No private-repo access: reusing cached commits / PRs / languages.');

const stats = { ...cached, ...calendar, ...(repo || {}), updated: new Date().toISOString() };
delete stats.commitsYear;
for (const k of ['repos', 'commits', 'prs', 'languages']) {
  if (stats[k] === undefined) throw new Error(`Missing "${k}": run once with a token that can read private repos.`);
}

mkdirSync(dirname(CACHE), { recursive: true });
writeFileSync(CACHE, `${JSON.stringify(stats, null, 2)}\n`);

for (const [name, t] of Object.entries(THEMES)) {
  writeFileSync(join(ASSETS, `stats-${name}.svg`), statsCard(t, stats));
  writeFileSync(join(ASSETS, `languages-${name}.svg`), languagesCard(t, stats));
  writeFileSync(join(ASSETS, `activity-${name}.svg`), activityCard(t, stats));
  writeFileSync(join(ASSETS, `streak-${name}.svg`), streakCard(t, stats));
}

console.log(JSON.stringify({ ...stats, monthly: undefined }, null, 2));
