/**
 * VESPER SOVEREIGN CIRCLES CONTROLLER (js/circles.js)
 * Manages circles directory rendering, join/leave membership toggles,
 * and direct links into filtered feeds.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCirclesTheme();
  initCirclesGrid();
});

function initCirclesTheme() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('vesper-theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('vesper-theme', next);
    });
  }
}

function initCirclesGrid() {
  const grid = document.getElementById('circlesGrid');
  if (!grid) return;

  const circles = window.VesperDB.getCircles();
  grid.innerHTML = '';

  circles.forEach(circle => {
    const card = document.createElement('article');
    card.className = 'circle-card';

    card.innerHTML = `
      <img src="${circle.cover}" alt="${circle.name}" class="circle-cover-img" loading="lazy">
      <div class="circle-body">
        <h2 class="circle-title">${escapeHTML(circle.name)}</h2>
        <p class="circle-desc">${escapeHTML(circle.description)}</p>

        <div class="circle-stats">
          <span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:text-bottom; margin-right:3px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><strong id="memberCount_${circle.id}">${(circle.members_count || 0).toLocaleString()}</strong> members</span>
          <span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:text-bottom; margin-right:3px;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg><strong>${circle.posts_count || 0}</strong> media posts</span>
        </div>

        <div style="display:flex; gap:var(--space-3); margin-top:auto;">
          <a href="feed.html?tag=${encodeURIComponent(circle.slug)}" class="btn btn-outline btn-sm" style="flex:1; text-align:center;">
            View Stream
          </a>
          <button type="button" class="btn ${circle.joined ? 'btn-outline' : 'btn-primary'} btn-sm join-circle-btn" data-circle-id="${circle.id}" style="flex:1;">
            ${circle.joined ? 'Joined' : 'Join Circle'}
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  // Attach join toggles
  grid.querySelectorAll('.join-circle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-circle-id');
      const nowJoined = window.VesperDB.toggleJoinCircle(id);
      btn.className = `btn ${nowJoined ? 'btn-outline' : 'btn-primary'} btn-sm join-circle-btn`;
      btn.textContent = nowJoined ? 'Joined' : 'Join Circle';

      const circle = window.VesperDB.getCircles().find(c => c.id === id);
      const countEl = document.getElementById(`memberCount_${id}`);
      if (countEl && circle) {
        countEl.textContent = (circle.members_count || 0).toLocaleString();
      }
    });
  });
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}
