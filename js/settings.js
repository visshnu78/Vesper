/**
 * VESPER SETTINGS CONTROLLER (js/settings.js)
 * Manages user profile updates, data exports, factory resets, and session termination.
 */

document.addEventListener('DOMContentLoaded', () => {
  initSettingsTheme();
  initSettingsForm();
  initDataExport();
  initFactoryReset();
});

function initSettingsTheme() {
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

let activeUser = null;

function showSettingsAlert(msg, type = 'success') {
  const box = document.getElementById('settingsAlert');
  if (!box) return;
  box.style.display = 'block';
  if (type === 'error') {
    box.style.background = 'rgba(235, 75, 38, 0.15)';
    box.style.border = '1px solid rgba(235, 75, 38, 0.4)';
    box.style.color = '#EB4B26';
    box.innerHTML = `<span style="margin-right:6px; display:inline-flex; vertical-align:middle;"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span> ${msg}`;
  } else {
    box.style.background = 'rgba(46, 204, 113, 0.15)';
    box.style.border = '1px solid rgba(46, 204, 113, 0.4)';
    box.style.color = '#2ECC71';
    box.innerHTML = `<span style="margin-right:6px; display:inline-flex; vertical-align:middle;"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></span> ${msg}`;
  }

  setTimeout(() => {
    box.style.display = 'none';
  }, 3500);
}

function initSettingsForm() {
  activeUser = window.VesperDB.getCurrentUser();
  if (!activeUser) {
    activeUser = window.VesperDB.getUserById('usr_1');
    if (activeUser) window.VesperDB.setCurrentUserId('usr_1');
  }

  if (!activeUser) {
    window.location.href = 'auth.html';
    return;
  }

  const nameInput = document.getElementById('settName');
  const handleInput = document.getElementById('settHandle');
  const emailInput = document.getElementById('settEmail');
  const bioInput = document.getElementById('settBio');
  const websiteInput = document.getElementById('settWebsite');
  const avatarInput = document.getElementById('settAvatar');
  const form = document.getElementById('profileSettingsForm');

  if (nameInput) nameInput.value = activeUser.name || '';
  if (handleInput) handleInput.value = activeUser.username || '';
  if (emailInput) emailInput.value = activeUser.email || '';
  if (bioInput) bioInput.value = activeUser.bio || '';
  if (websiteInput) websiteInput.value = activeUser.website || '';
  if (avatarInput) avatarInput.value = activeUser.avatar || '';

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const updated = window.VesperDB.updateUser(activeUser.id, {
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          bio: bioInput.value.trim(),
          website: websiteInput.value.trim(),
          avatar: avatarInput.value.trim() || undefined
        });

        activeUser = updated;
        showSettingsAlert('Profile updated successfully and synchronized to database!');
      } catch (err) {
        showSettingsAlert(err.message, 'error');
      }
    });
  }
}

function initDataExport() {
  const exportBtn = document.getElementById('exportDataBtn');
  if (!exportBtn) return;

  exportBtn.addEventListener('click', () => {
    const jsonStr = window.VesperDB.exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vesper_export_${activeUser ? activeUser.username : 'data'}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSettingsAlert('All data successfully exported as JSON!');
  });
}

function initFactoryReset() {
  const resetBtn = document.getElementById('resetDbBtn');
  const logoutBtn = document.getElementById('logoutAllBtn');

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset the database to factory seed data? All custom posts and new user registrations will be restored to defaults.')) {
        window.VesperDB.resetDatabase();
        showSettingsAlert('Database reset to factory seed data! Reloading...');
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.VesperDB.logout();
      window.location.href = 'auth.html';
    });
  }
}
