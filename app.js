/* ============================================================
   ApexJudge Academy — shared app helpers
   ============================================================ */

const NAV_LINKS = [
  { href: 'index.html', label: 'Home' },
  { href: 'groups.html', label: 'Groups' },
  { href: 'leaderboard.html', label: 'Leaderboard' },
  { href: 'hall-of-fame.html', label: 'Hall of Fame' },
  { href: 'problems.html', label: 'Problems' },
  { href: 'admin.html', label: 'Admin' },
];

function renderNav(activeHref) {
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  const linksHtml = NAV_LINKS.map(l =>
    `<a href="${l.href}" class="${l.href === activeHref ? 'active' : ''}">${l.label}</a>`
  ).join('');
  nav.innerHTML = `
    <div class="wrap">
      <a href="index.html" class="brand"><span class="prompt">&gt;</span> ApexJudge<span style="color:var(--dim)">.academy</span></a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu">&#9776;</button>
      <div class="nav-links" id="nav-links">${linksHtml}</div>
    </div>`;
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  toggle.addEventListener('click', () => links.classList.toggle('open'));
}

function renderFooter() {
  const f = document.getElementById('site-footer');
  if (!f) return;
  const note = (typeof cloudConfigured === 'function' && cloudConfigured())
    ? 'Live data — updates from Admin appear here automatically.'
    : 'Data stored locally in this browser. Use Admin → Backup to export.';
  f.innerHTML = `
    <div class="wrap">
      <span>&copy; ${new Date().getFullYear()} ApexJudge Academy — built for the grind.</span>
      <span>${note}</span>
    </div>`;
}

function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* renders an avatar: photo if present, else initials, ringed with tier color */
function avatarHtml(name, photo, score, sizeClass) {
  const tier = tierFor(score || 0);
  const style = `--tier-color:${tier.color}`;
  if (photo) {
    return `<img src="${photo}" alt="${name}" class="${sizeClass}" style="${style}">`;
  }
  return `<div class="${sizeClass}" style="${style}">${initials(name)}</div>`;
}

/* -------- admin session (client-side gate only) -------- */
const ADMIN_SESSION_KEY = 'apexjudge_admin_session';
const ADMIN_PASS_KEY = 'apexjudge_admin_pass';

function getAdminPass() {
  return localStorage.getItem(ADMIN_PASS_KEY) || 'coach123';
}
function isAdminUnlocked() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';
}
function unlockAdmin(pass) {
  if (pass === getAdminPass()) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
    return true;
  }
  return false;
}
function lockAdmin() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}
