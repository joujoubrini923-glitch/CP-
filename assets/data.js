/* ============================================================
   Abdelmajid CP — data layer
   All content lives in localStorage under STORAGE_KEY.
   On first load, SEED is copied in. Admin page edits it.
   Export/Import buttons on the admin page let the coach back
   up or move data between browsers/devices (localStorage is
   per-browser, there is no server).
   ============================================================ */

const STORAGE_KEY = 'apexjudge_data_v1';

/* ---- Rating tiers (mirrors how judges like Codeforces color
   handles) — used everywhere a score becomes a badge colour. ---- */
const TIERS = [
  { name: 'Newcomer',    min: 0,    color: '#8A8F98' },
  { name: 'Apprentice',  min: 800,  color: '#3DA35D' },
  { name: 'Specialist',  min: 1200, color: '#23A6B5' },
  { name: 'Expert',      min: 1600, color: '#3B6FD6' },
  { name: 'Master',      min: 2000, color: '#9457E0' },
  { name: 'Grandmaster', min: 2400, color: '#E8892C' },
  { name: 'Legend',      min: 2800, color: '#E1483D' },
];

function tierFor(score) {
  let t = TIERS[0];
  for (const tier of TIERS) if (score >= tier.min) t = tier;
  return t;
}

const SEED = {
  coach: {
    name: 'Coach Name',
    title: 'Head Coach, Abdelmajid CP',
    bio: "I train students for ICPC, IOI and rated online judges — from first for-loop to red-handle. Replace this bio from the Admin page with your own background, achievements and coaching philosophy.",
    photo: '',
    email: 'coach@example.com',
    stats: { years: 6, alumni: 54, medals: 12 },
  },
  groups: [
    { id: 'g1', name: 'Foundations', description: 'New members — syntax, loops, arrays, basic math.' },
    { id: 'g2', name: 'Intermediate', description: 'Data structures, greedy, graphs, DP fundamentals.' },
    { id: 'g3', name: 'Advanced', description: 'ICPC / IOI track — advanced DP, flows, geometry, number theory.' },
  ],
  students: [
    { id: 's1', name: 'Aiden Cole', photo: '', groupId: 'g3', score: 2450, solved: 812, handle: 'aidenc' },
    { id: 's2', name: 'Maya Torres', photo: '', groupId: 'g3', score: 2180, solved: 640, handle: 'maya_t' },
    { id: 's3', name: 'Liam Chen', photo: '', groupId: 'g2', score: 1540, solved: 322, handle: 'liamc' },
    { id: 's4', name: 'Sofia Reyes', photo: '', groupId: 'g2', score: 1310, solved: 260, handle: 'sofiar' },
    { id: 's5', name: 'Noah Park', photo: '', groupId: 'g1', score: 640, solved: 58, handle: 'noahp' },
    { id: 's6', name: 'Zara Ahmed', photo: '', groupId: 'g1', score: 720, solved: 71, handle: 'zaraa' },
  ],
  contests: [
    {
      id: 'c1', name: 'Winter Qualifier 2026', date: '2026-01-18',
      leaderboard: [
        { studentId: 's1', rank: 1, score: 2450 },
        { studentId: 's2', rank: 2, score: 2210 },
        { studentId: 's3', rank: 3, score: 1580 },
      ],
    },
    {
      id: 'c2', name: 'Spring Invitational 2026', date: '2026-04-05',
      leaderboard: [
        { studentId: 's2', rank: 1, score: 2260 },
        { studentId: 's1', rank: 2, score: 2200 },
        { studentId: 's4', rank: 3, score: 1330 },
      ],
    },
  ],
  problems: [
    { id: 'p1', title: 'Two Pointers Warm-up', link: 'https://codeforces.com/problemset', difficulty: 'Easy', category: 'Arrays', groupId: 'g1' },
    { id: 'p2', title: 'Binary Search on Answer', link: 'https://codeforces.com/problemset', difficulty: 'Medium', category: 'Binary Search', groupId: 'g2' },
    { id: 'p3', title: 'Shortest Path Variants', link: 'https://codeforces.com/problemset', difficulty: 'Medium', category: 'Graphs', groupId: 'g2' },
    { id: 'p4', title: 'Digit DP Practice', link: 'https://codeforces.com/problemset', difficulty: 'Hard', category: 'Dynamic Programming', groupId: 'g3' },
    { id: 'p5', title: 'Max-Flow Min-Cut Set', link: 'https://codeforces.com/problemset', difficulty: 'Hard', category: 'Flows', groupId: 'g3' },
  ],
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { saveDataLocal(SEED); return structuredClone(SEED); }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Data load failed, falling back to seed', e);
    return structuredClone(SEED);
  }
}

function saveDataLocal(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ---------------------------------------------------------------
   Cloud sync (optional). If assets/config.js has a BIN_ID and
   API_KEY set, every page reads/writes a shared JSONBin instead
   of (or in addition to) this browser's own local storage. If the
   cloud isn't configured, or a request fails (offline, typo in
   the key, etc.), everything falls back to the local-only copy
   above so the site never breaks.
--------------------------------------------------------------- */

function cloudConfigured() {
  return typeof CLOUD_CONFIG !== 'undefined' &&
    !!CLOUD_CONFIG.BIN_ID && !!CLOUD_CONFIG.API_KEY;
}

async function fetchCloudData() {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${CLOUD_CONFIG.BIN_ID}/latest`, {
    headers: { 'X-Master-Key': CLOUD_CONFIG.API_KEY },
  });
  if (!res.ok) throw new Error('Cloud read failed: ' + res.status);
  const json = await res.json();
  return json.record;
}

async function pushCloudData(data) {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${CLOUD_CONFIG.BIN_ID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': CLOUD_CONFIG.API_KEY,
      'X-Bin-Versioning': 'false',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Cloud save failed: ' + res.status);
}

/* loadAppData(): the function every page should call.
   Returns { data, source: 'cloud' | 'local-cache' | 'seed', cloudError } */
async function loadAppData() {
  if (!cloudConfigured()) {
    return { data: loadData(), source: 'local-only', cloudError: null };
  }
  try {
    const remote = await fetchCloudData();
    saveDataLocal(remote); // keep an offline cache in sync
    return { data: remote, source: 'cloud', cloudError: null };
  } catch (e) {
    console.warn('Cloud fetch failed, using local cache instead:', e);
    return { data: loadData(), source: 'local-cache', cloudError: e.message };
  }
}

/* saveAppData(): the function Admin should call after every change.
   Always saves locally first (instant, never fails), then tries to
   push to the cloud so everyone else sees it too. */
async function saveAppData(data) {
  saveDataLocal(data);
  if (!cloudConfigured()) return { synced: false, reason: 'not-configured' };
  try {
    await pushCloudData(data);
    return { synced: true };
  } catch (e) {
    console.error('Cloud save failed:', e);
    return { synced: false, reason: e.message };
  }
}

function uid(prefix) {
  return prefix + '_' + Math.random().toString(36).slice(2, 9);
}

function groupName(data, groupId) {
  const g = data.groups.find(g => g.id === groupId);
  return g ? g.name : 'Unassigned';
}

function studentById(data, id) {
  return data.students.find(s => s.id === id);
}

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}
