/**
 * VESPER NOTIFICATIONS CONTROLLER (js/notifications.js)
 * Manages activity signals, filtering by interaction type, and mark-as-read state.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNotifTheme();
  initNotifList();
  initNotifTabs();
  initMarkAllRead();
});

function initNotifTheme() {
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

let activeFilter = 'all';

function initNotifList() {
  const listEl = document.getElementById('notifList');
  if (!listEl) return;

  const all = window.VesperDB.getNotifications();
  const filtered = activeFilter === 'all' ? all : all.filter(n => n.type === activeFilter);

  listEl.innerHTML = '';

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div style="text-align:center; padding:var(--space-12) 0; color:var(--text-muted);">
        <p style="font-size:1.05rem;">No notifications in this filter.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(notif => {
    const item = document.createElement('a');
    item.href = notif.target_url || '#';
    item.className = `notif-item ${notif.read ? '' : 'unread'}`;

    const badgeIcon = getBadgeIcon(notif.type);

    item.innerHTML = `
      <img src="${notif.sender_avatar}" alt="${notif.sender_username}" class="notif-avatar">
      <div class="notif-body">
        <strong>@${escapeHTML(notif.sender_username)}</strong> ${escapeHTML(notif.text)}
        <span class="notif-time">${formatTime(notif.created_at)}</span>
      </div>
      <div class="notif-badge-icon notif-badge-${notif.type}">
        ${badgeIcon}
      </div>
    `;

    item.addEventListener('click', () => {
      notif.read = true;
      window.VesperDB.save();
    });

    listEl.appendChild(item);
  });
}

function getBadgeIcon(type) {
  switch (type) {
    case 'like':
      return `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    case 'comment':
      return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
    case 'follow':
      return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`;
    case 'circle':
      return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="6"/></svg>`;
  }
}

function initNotifTabs() {
  const tabs = document.querySelectorAll('.notif-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.getAttribute('data-filter');
      initNotifList();
    });
  });
}

function initMarkAllRead() {
  const btn = document.getElementById('markAllReadBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.VesperDB.markNotificationsAsRead();
    initNotifList();
    btn.textContent = 'All Caught Up';
    setTimeout(() => {
      btn.textContent = 'Mark All Read';
    }, 2000);
  });
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const diffSec = Math.floor((new Date() - d) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
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
