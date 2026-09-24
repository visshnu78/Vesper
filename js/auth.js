/**
 * VESPER AUTHENTICATION CONTROLLER (js/auth.js)
 * Manages user login, registration with salted password hashing,
 * session token storage, and database synchronization.
 * Domain: vespersocial.org
 */

document.addEventListener('DOMContentLoaded', () => {
  initAuthTheme();
  initAuthTabs();
  initHandleValidation();
  initLoginForm();
  initRegisterForm();
  initDemoChips();
  initQueryParams();
});

function initAuthTheme() {
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

function initAuthTabs() {
  const tabLogin = document.getElementById('tabLoginBtn');
  const tabRegister = document.getElementById('tabRegisterBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const alertBox = document.getElementById('authAlert');

  if (!tabLogin || !tabRegister) return;

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    if (alertBox) alertBox.style.display = 'none';
  });

  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
    if (alertBox) alertBox.style.display = 'none';
  });
}

function initQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  const handle = params.get('handle');
  const email = params.get('email');

  if (mode === 'register') {
    const tabRegister = document.getElementById('tabRegisterBtn');
    if (tabRegister) tabRegister.click();
  }

  if (handle) {
    const handleInput = document.getElementById('regHandle');
    if (handleInput) {
      handleInput.value = handle;
      handleInput.dispatchEvent(new Event('input'));
    }
  }

  if (email) {
    const emailInput = document.getElementById('regEmail');
    if (emailInput) {
      emailInput.value = email;
    }
  }
}

function showAlert(message, type = 'error') {
  const alertBox = document.getElementById('authAlert');
  if (!alertBox) return;

  alertBox.style.display = 'flex';
  alertBox.style.alignItems = 'center';
  alertBox.style.gap = '8px';
  alertBox.style.borderRadius = 'var(--radius-sm)';

  if (type === 'error') {
    alertBox.style.background = 'rgba(217, 83, 40, 0.12)';
    alertBox.style.border = '1px solid rgba(217, 83, 40, 0.3)';
    alertBox.style.color = 'var(--accent-primary)';
    alertBox.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>${message}</span>
    `;
  } else {
    alertBox.style.background = 'rgba(39, 174, 96, 0.12)';
    alertBox.style.border = '1px solid rgba(39, 174, 96, 0.3)';
    alertBox.style.color = 'var(--color-success)';
    alertBox.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>${message}</span>
    `;
  }
}

function initHandleValidation() {
  const handleInput = document.getElementById('regHandle');
  const feedback = document.getElementById('regHandleFeedback');
  if (!handleInput || !feedback) return;

  let debounceTimer;
  handleInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const val = handleInput.value.trim().replace(/^@/, '');

    if (!val) {
      feedback.textContent = '';
      feedback.className = 'form-feedback';
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(val)) {
      feedback.className = 'form-feedback error';
      feedback.textContent = 'Use 3-30 alphanumeric characters and underscores.';
      return;
    }

    debounceTimer = setTimeout(() => {
      const existing = window.VesperDB.getUserByUsername(val);
      if (existing) {
        feedback.className = 'form-feedback error';
        feedback.textContent = `@${val} is already registered in the database.`;
      } else {
        feedback.className = 'form-feedback success';
        feedback.textContent = `@${val} is available on Vesper Protocol.`;
      }
    }, 200);
  });
}

function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!identifier || !password) {
      showAlert('Please enter your username or email and password.');
      return;
    }

    try {
      let authenticatedUser = null;
      let token = null;

      // 1. Attempt backend REST API if available and serving JSON
      try {
        const resp = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password })
        });
        const contentType = resp.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const resData = await resp.json();
          if (resp.ok && resData.success) {
            authenticatedUser = resData.user;
            token = resData.token;
            if (token) localStorage.setItem('vesper_token', token);
          } else if (resp.status === 401 || resp.status === 400) {
            throw new Error(resData.error || 'Invalid credentials');
          }
        }
      } catch (apiErr) {
        if (apiErr.message && (
          apiErr.message.includes('Invalid credentials') ||
          apiErr.message.includes('Please verify') ||
          apiErr.message.includes('Incorrect credentials')
        )) {
          throw apiErr;
        }
      }

      // 2. Client-side database login fallback (works everywhere, including static Vercel)
      if (!authenticatedUser) {
        authenticatedUser = await window.VesperDB.login(identifier, password);
      } else {
        window.VesperDB.setCurrentUserId(authenticatedUser.id);
      }

      showAlert(`Welcome back, @${authenticatedUser.username}. Opening feed...`, 'success');
      setTimeout(() => {
        window.location.href = 'feed.html';
      }, 400);
    } catch (err) {
      showAlert(err.message || 'Authentication failed. Please verify credentials.');
    }
  });
}

function initRegisterForm() {
  const form = document.getElementById('registerForm');
  const avatarButtons = document.querySelectorAll('.avatar-choice-btn');
  let selectedAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

  avatarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      avatarButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAvatar = btn.getAttribute('data-avatar');
    });
  });

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const username = document.getElementById('regHandle').value.trim().replace(/^@/, '');
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    if (!name) {
      showAlert('Please enter your display name.');
      return;
    }
    if (!username || username.length < 3) {
      showAlert('Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      showAlert('Username must use 3-30 letters, numbers, or underscores.');
      return;
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      showAlert('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 8) {
      showAlert('Password must be at least 8 characters long for security.');
      return;
    }

    try {
      let registeredUser = null;
      let token = null;

      // 1. Attempt backend REST API if available and serving JSON
      try {
        const resp = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            username,
            email,
            password,
            avatar: selectedAvatar
          })
        });

        const contentType = resp.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const resData = await resp.json();
          if (resp.ok && resData.success) {
            registeredUser = resData.user;
            token = resData.token;
            if (token) localStorage.setItem('vesper_token', token);
          } else if (resp.status === 400 || resp.status === 409) {
            throw new Error(resData.error || 'Registration failed');
          }
        }
      } catch (apiErr) {
        if (apiErr.message && (
          apiErr.message.includes('already taken') ||
          apiErr.message.includes('already exists') ||
          apiErr.message.includes('Username') ||
          apiErr.message.includes('Password')
        )) {
          throw apiErr;
        }
      }

      // 2. Client-side database registration (works 100% on Vercel static, localhost, and offline)
      if (!registeredUser) {
        registeredUser = await window.VesperDB.register({
          name,
          username,
          email,
          password,
          avatar: selectedAvatar
        });
      } else {
        if (!window.VesperDB.getUserById(registeredUser.id)) {
          if (!Array.isArray(window.VesperDB.data.users)) window.VesperDB.data.users = [];
          window.VesperDB.data.users.push(registeredUser);
        }
        window.VesperDB.save();
        window.VesperDB.setCurrentUserId(registeredUser.id);
      }

      showAlert(`Account @${registeredUser.username} created. Redirecting to feed...`, 'success');
      setTimeout(() => {
        window.location.href = 'feed.html';
      }, 500);
    } catch (err) {
      showAlert(err.message || 'Registration failed. Please check your inputs.');
    }
  });
}

function initDemoChips() {
  const chips = document.querySelectorAll('[data-demo-user]');
  chips.forEach(chip => {
    chip.addEventListener('click', async () => {
      const username = chip.getAttribute('data-demo-user');
      const user = window.VesperDB.getUserByUsername(username);
      if (user) {
        window.VesperDB.setCurrentUserId(user.id);
        showAlert(`Signed in as @${user.username}. Loading feed...`, 'success');
        setTimeout(() => {
          window.location.href = 'feed.html';
        }, 400);
      }
    });
  });
}
