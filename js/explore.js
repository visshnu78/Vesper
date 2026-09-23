/**
 * VESPER EXPLORE & DISCOVERY CONTROLLER (js/explore.js)
 * Manages category filters, full-text search across tags and captions,
 * responsive media grid rendering, and detail modal.
 */

document.addEventListener('DOMContentLoaded', () => {
  initExploreTheme();
  initExploreGrid();
  initCategoryPills();
  initLiveSearch();
  initLightbox();
});

function initExploreTheme() {
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

let activeCategory = 'all';
let searchQuery = '';

function initExploreGrid() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  const searchInput = document.getElementById('exploreSearchInput');

  if (q) {
    searchQuery = q;
    if (searchInput) searchInput.value = q;
  }

  filterAndRender();
}

function initCategoryPills() {
  const pills = document.querySelectorAll('.category-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-category');
      filterAndRender();
    });
  });
}

function initLiveSearch() {
  const input = document.getElementById('exploreSearchInput');
  if (!input) return;

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery = input.value.trim();
      filterAndRender();
    }, 200);
  });
}

function filterAndRender() {
  const grid = document.getElementById('exploreGrid');
  if (!grid) return;

  let posts = window.VesperDB.getPosts();

  // Category filter
  if (activeCategory !== 'all') {
    posts = posts.filter(p => {
      const circleMatch = p.circle && p.circle.toLowerCase().includes(activeCategory.toLowerCase());
      const captionMatch = p.caption && p.caption.toLowerCase().includes(activeCategory.toLowerCase());
      return circleMatch || captionMatch;
    });
  }

  // Search query filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase().replace(/^[@#]/, '');
    posts = posts.filter(p =>
      p.author_username.toLowerCase().includes(q) ||
      (p.caption && p.caption.toLowerCase().includes(q)) ||
      (p.location && p.location.toLowerCase().includes(q)) ||
      (p.circle && p.circle.toLowerCase().includes(q))
    );
  }

  grid.innerHTML = '';

  if (posts.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:var(--space-12) 0; color:var(--text-muted);">
        <p style="font-size:1.1rem; margin-bottom:var(--space-2);">No photos found for "${searchQuery || activeCategory}".</p>
        <a href="create.html" class="btn btn-primary btn-sm">Post a Photo in this Vector</a>
      </div>
    `;
    return;
  }

  posts.forEach(post => {
    const item = document.createElement('div');
    item.className = 'grid-post-item';
    item.innerHTML = `
      <img src="${post.image_url}" alt="Post by ${post.author_username}" class="${post.filter || ''}" loading="lazy">
      <div class="grid-overlay">
        <div class="grid-stat">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span>${post.likes.length}</span>
        </div>
        <div class="grid-stat">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>${(post.comments || []).length}</span>
        </div>
      </div>
    `;

    item.addEventListener('click', () => {
      openLightbox(post);
    });

    grid.appendChild(item);
  });
}

let activePostId = null;

function initLightbox() {
  const modal = document.getElementById('exploreLightboxModal');
  const closeBtn = document.getElementById('closeExpLightboxBtn');
  const form = document.getElementById('expLightboxCommentForm');

  if (!modal) return;

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('expLightboxCommentInput');
      const text = input.value.trim();
      if (!text || !activePostId) return;

      try {
        window.VesperDB.addComment(activePostId, text);
        input.value = '';
        const updated = window.VesperDB.getPostById(activePostId);
        if (updated) openLightbox(updated);
      } catch (err) {
        alert(err.message);
      }
    });
  }
}

function openLightbox(post) {
  activePostId = post.id;
  const modal = document.getElementById('exploreLightboxModal');
  const img = document.getElementById('expLightboxImg');
  const avatar = document.getElementById('expLightboxAuthorAvatar');
  const author = document.getElementById('expLightboxAuthorUsername');
  const caption = document.getElementById('expLightboxCaption');
  const commentsList = document.getElementById('expLightboxCommentsList');

  if (!modal) return;

  img.src = post.image_url;
  img.className = post.filter || '';
  avatar.src = post.author_avatar;
  author.textContent = `@${post.author_username}`;
  caption.innerHTML = `<strong>@${escapeHTML(post.author_username)}</strong> ${escapeHTML(post.caption)}`;

  commentsList.innerHTML = '';
  (post.comments || []).forEach(c => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.gap = '8px';
    item.innerHTML = `<strong>@${escapeHTML(c.username)}</strong> <span>${escapeHTML(c.text)}</span>`;
    commentsList.appendChild(item);
  });

  modal.classList.add('open');
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
