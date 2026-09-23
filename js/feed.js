/**
 * VESPER LIVE FEED CONTROLLER (js/feed.js)
 * Manages chronological feed rendering, double-tap heart bursts,
 * instant like toggles, comment submissions, story viewer, and follow relationships.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initUserSession();
  initStories();
  initFeedPosts();
  initSidebar();
  initSearch();
  initDropdownMenu();
  initNotifications();
});

/* ==========================================================================
   1. THEME CONTROLLER
   ========================================================================== */
function initTheme() {
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

/* ==========================================================================
   2. SESSION & USER DROPDOWN
   ========================================================================== */
let currentUser = null;

function initUserSession() {
  currentUser = window.VesperDB.getCurrentUser();
  if (!currentUser) {
    currentUser = window.VesperDB.getUserById('usr_1');
    if (currentUser) {
      window.VesperDB.setCurrentUserId('usr_1');
    }
  }

  if (currentUser) {
    // Top Nav Avatar
    const navAvatar = document.getElementById('navUserAvatar');
    if (navAvatar) navAvatar.src = currentUser.avatar;

    // Mobile Dock Avatar
    const mobileDockAvatar = document.getElementById('mobileDockAvatar');
    if (mobileDockAvatar) mobileDockAvatar.src = currentUser.avatar;

    // Dropdown details
    const dropName = document.getElementById('dropdownUserName');
    const dropHandle = document.getElementById('dropdownUserHandle');
    if (dropName) dropName.textContent = currentUser.name;
    if (dropHandle) dropHandle.textContent = `@${currentUser.username}`;
  }
}

function initDropdownMenu() {
  const btn = document.getElementById('userMenuBtn');
  const dropdown = document.getElementById('userDropdown');
  if (!btn || !dropdown) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
    btn.setAttribute('aria-expanded', dropdown.classList.contains('show'));
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
      dropdown.classList.remove('show');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ==========================================================================
   3. STORIES TRAY & VIEWER
   ========================================================================== */
function initStories() {
  const tray = document.getElementById('storiesTray');
  if (!tray) return;

  const stories = window.VesperDB.getStories();
  stories.forEach(story => {
    const item = document.createElement('div');
    item.className = 'story-circle-item';
    item.innerHTML = `
      <div class="story-avatar-wrap">
        <img src="${story.avatar}" alt="${story.username}">
      </div>
      <span class="story-circle-label">${story.username}</span>
    `;

    item.addEventListener('click', () => {
      openStoryViewer(story);
    });

    tray.appendChild(item);
  });
}

let storyTimer = null;
function openStoryViewer(story) {
  const modal = document.getElementById('storyViewerModal');
  const img = document.getElementById('storyModalImg');
  const avatar = document.getElementById('storyModalAvatar');
  const user = document.getElementById('storyModalUsername');
  const caption = document.getElementById('storyModalCaption');
  const bar = document.getElementById('storyProgressBar');
  const closeBtn = document.getElementById('storyCloseBtn');

  if (!modal) return;

  img.src = story.image_url;
  avatar.src = story.avatar;
  user.textContent = `@${story.username}`;
  caption.textContent = story.caption || '';

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');

  // Trigger progress bar animation
  bar.style.transition = 'none';
  bar.style.width = '0%';
  setTimeout(() => {
    bar.style.transition = 'width 5s linear';
    bar.style.width = '100%';
  }, 50);

  clearTimeout(storyTimer);
  storyTimer = setTimeout(() => {
    closeStoryViewer();
  }, 5100);

  function closeStoryViewer() {
    clearTimeout(storyTimer);
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    bar.style.width = '0%';
  }

  closeBtn.onclick = closeStoryViewer;
  modal.onclick = (e) => {
    if (e.target === modal) closeStoryViewer();
  };
}

/* ==========================================================================
   4. CHRONOLOGICAL FEED POSTS
   ========================================================================== */
function initFeedPosts() {
  const container = document.getElementById('feedPostsList');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const tagParam = urlParams.get('tag');

  const filterBanner = document.getElementById('feedFilterBanner');
  const filterText = document.getElementById('feedFilterText');
  const clearBtn = document.getElementById('clearFilterBtn');

  let filterOptions = {};
  if (tagParam) {
    filterOptions.tag = tagParam;
    if (filterBanner && filterText) {
      filterBanner.style.display = 'flex';
      filterText.textContent = `Showing posts tagged #${tagParam}`;
    }
    if (clearBtn) {
      clearBtn.onclick = () => {
        window.location.href = 'feed.html';
      };
    }
  }

  const posts = window.VesperDB.getPosts(filterOptions);
  renderPosts(posts, container);
}

function renderPosts(posts, container) {
  container.innerHTML = '';

  if (posts.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:var(--space-12) var(--space-4); background:var(--bg-glass); border-radius:var(--radius-lg); border:1px solid var(--glass-border);">
        <p style="font-size:1.1rem; color:var(--text-secondary); margin-bottom:var(--space-4);">No posts found matching this filter.</p>
        <a href="create.html" class="btn btn-primary">Share the First Photo</a>
      </div>
    `;
    return;
  }

  posts.forEach(post => {
    const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
    const isSaved = currentUser && currentUser.saved_posts ? currentUser.saved_posts.includes(post.id) : false;

    // Format hashtags into links
    const formattedCaption = escapeHTML(post.caption).replace(
      /#([a-zA-Z0-9_]+)/g,
      '<a href="feed.html?tag=$1" class="caption-tag">#$1</a>'
    );

    const postEl = document.createElement('article');
    postEl.className = 'feed-post';
    postEl.id = `postCard_${post.id}`;

    postEl.innerHTML = `
      <!-- Post Header -->
      <header class="feed-post-header">
        <a href="profile.html?user=${encodeURIComponent(post.author_username)}" class="post-author-info">
          <div class="post-author-avatar">
            <img src="${post.author_avatar}" alt="${post.author_username}">
          </div>
          <div class="post-author-meta">
            <span class="post-author-name">
              ${escapeHTML(post.author_username)}
              <svg viewBox="0 0 24 24" width="14" height="14" fill="#FF4800"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2V7h2v10z"/></svg>
            </span>
            ${post.location ? `<span class="post-location">${escapeHTML(post.location)}</span>` : ''}
          </div>
        </a>
        <span class="post-meta-circle">${escapeHTML(post.circle || 'Public')}</span>
      </header>

      <!-- Post Photo Frame with Double Tap Heart Pop -->
      <div class="feed-post-frame ${post.filter || ''}" data-post-id="${post.id}">
        <img src="${post.image_url}" alt="Post by ${escapeHTML(post.author_username)}" loading="lazy">
        <div class="heart-burst" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="80" height="80" fill="#ED4956" stroke="#fff" stroke-width="1.5">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="feed-post-actions">
        <div class="actions-left">
          <!-- Like Button -->
          <button type="button" class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}" aria-label="${isLiked ? 'Unlike' : 'Like'}">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
          <!-- Comment Focus Button -->
          <button type="button" class="action-btn comment-focus-btn" data-post-id="${post.id}" aria-label="Comment">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </button>
          <!-- Share Button -->
          <button type="button" class="action-btn share-btn" data-post-id="${post.id}" aria-label="Share">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        <!-- Bookmark / Save Button -->
        <button type="button" class="action-btn save-btn ${isSaved ? 'saved' : ''}" data-post-id="${post.id}" aria-label="${isSaved ? 'Unsave' : 'Save'}">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>

      <!-- Post Body / Details -->
      <div class="feed-post-body">
        <div class="likes-counter" id="likesCounter_${post.id}">
          <span>${post.likes.length.toLocaleString()} resonates</span>
        </div>

        <div class="post-caption-text">
          <strong><a href="profile.html?user=${encodeURIComponent(post.author_username)}" style="color:inherit; text-decoration:none;">${escapeHTML(post.author_username)}</a></strong>
          ${formattedCaption}
        </div>

        <div class="post-timestamp">${formatRelativeTime(post.created_at)}</div>

        <!-- Comments Container -->
        <div class="comments-section" id="commentsSection_${post.id}">
          ${post.comments && post.comments.length > 2 ? `
            <button type="button" class="comments-toggle-btn" data-post-id="${post.id}">
              View all ${post.comments.length} comments
            </button>
          ` : ''}
          <div class="comments-list" id="commentsList_${post.id}">
            ${renderCommentsList(post.comments || [])}
          </div>
        </div>

        <!-- Add Comment Input Box -->
        <form class="comment-input-form" data-post-id="${post.id}">
          <input type="text" class="comment-input" placeholder="Add a resonant thought..." required autocomplete="off">
          <button type="submit" class="comment-submit-btn">Post</button>
        </form>
      </div>
    `;

    container.appendChild(postEl);
  });

  attachPostEventListeners();
}

function renderCommentsList(comments, showAll = false) {
  const displayList = showAll ? comments : comments.slice(-2);
  return displayList.map(c => `
    <div class="comment-item">
      <strong><a href="profile.html?user=${encodeURIComponent(c.username)}" style="color:inherit; text-decoration:none;">${escapeHTML(c.username)}</a></strong>
      <span>${escapeHTML(c.text)}</span>
    </div>
  `).join('');
}

function attachPostEventListeners() {
  // 1. Double tap / double click on image frame
  const frames = document.querySelectorAll('.feed-post-frame');
  frames.forEach(frame => {
    let lastTap = 0;
    frame.addEventListener('click', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
        triggerHeartBurst(frame);
      }
      lastTap = currentTime;
    });

    frame.addEventListener('dblclick', () => {
      triggerHeartBurst(frame);
    });
  });

  // 2. Like button click
  const likeBtns = document.querySelectorAll('.like-btn');
  likeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const postId = btn.getAttribute('data-post-id');
      const result = window.VesperDB.toggleLike(postId);
      btn.classList.toggle('liked', result.liked);
      const counter = document.getElementById(`likesCounter_${postId}`);
      if (counter) {
        counter.innerHTML = `<span>${result.count.toLocaleString()} resonates</span>`;
      }
    });
  });

  // 3. Comment focus button
  const commentBtns = document.querySelectorAll('.comment-focus-btn');
  commentBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const postId = btn.getAttribute('data-post-id');
      const card = document.getElementById(`postCard_${postId}`);
      if (card) {
        const input = card.querySelector('.comment-input');
        if (input) input.focus();
      }
    });
  });

  // 4. Save bookmark button
  const saveBtns = document.querySelectorAll('.save-btn');
  saveBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const postId = btn.getAttribute('data-post-id');
      const isSaved = window.VesperDB.toggleSavePost(postId);
      btn.classList.toggle('saved', isSaved);
      showFeedToast(isSaved ? 'Saved to private collection' : 'Removed from collection');
    });
  });

  // 5. Share button
  const shareBtns = document.querySelectorAll('.share-btn');
  shareBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const postId = btn.getAttribute('data-post-id');
      const url = `${window.location.origin}${window.location.pathname}#postCard_${postId}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          showFeedToast('Post link copied to clipboard.');
        }).catch(() => {
          showFeedToast('Post link ready to share');
        });
      } else {
        showFeedToast('Post link ready to share');
      }
    });
  });

  // 6. Comment Form Submission
  const commentForms = document.querySelectorAll('.comment-input-form');
  commentForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const postId = form.getAttribute('data-post-id');
      const input = form.querySelector('.comment-input');
      const text = input.value.trim();
      if (!text) return;

      try {
        window.VesperDB.addComment(postId, text);
        input.value = '';

        // Re-render comments for this post
        const post = window.VesperDB.getPostById(postId);
        const list = document.getElementById(`commentsList_${postId}`);
        if (list && post) {
          list.innerHTML = renderCommentsList(post.comments, true);
        }
        showFeedToast('Comment shared!');
      } catch (err) {
        showFeedToast(err.message);
      }
    });
  });

  // 7. View all comments expand
  const toggleBtns = document.querySelectorAll('.comments-toggle-btn');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const postId = btn.getAttribute('data-post-id');
      const post = window.VesperDB.getPostById(postId);
      const list = document.getElementById(`commentsList_${postId}`);
      if (list && post) {
        list.innerHTML = renderCommentsList(post.comments, true);
        btn.style.display = 'none';
      }
    });
  });
}

function triggerHeartBurst(frame) {
  const postId = frame.getAttribute('data-post-id');
  const burst = frame.querySelector('.heart-burst');
  if (burst) {
    burst.classList.add('animate');
    setTimeout(() => {
      burst.classList.remove('animate');
    }, 450);
  }

  // Also trigger like in DB
  const result = window.VesperDB.toggleLike(postId);
  const card = document.getElementById(`postCard_${postId}`);
  if (card) {
    const likeBtn = card.querySelector('.like-btn');
    if (likeBtn) likeBtn.classList.toggle('liked', result.liked);
    const counter = document.getElementById(`likesCounter_${postId}`);
    if (counter) counter.innerHTML = `<span>${result.count.toLocaleString()} resonates</span>`;
  }
}

/* ==========================================================================
   5. SIDEBAR INITIALIZATION
   ========================================================================== */
function initSidebar() {
  if (currentUser) {
    const avatar = document.getElementById('sidebarUserAvatar');
    const username = document.getElementById('sidebarUsername');
    const fullname = document.getElementById('sidebarUserFullname');
    if (avatar) avatar.src = currentUser.avatar;
    if (username) username.textContent = `@${currentUser.username}`;
    if (fullname) fullname.textContent = currentUser.name;
  }

  const suggestedContainer = document.getElementById('suggestedUsersList');
  if (!suggestedContainer) return;

  const allUsers = window.VesperDB.getUsers();
  const others = allUsers.filter(u => !currentUser || u.id !== currentUser.id).slice(0, 4);

  suggestedContainer.innerHTML = '';
  others.forEach(user => {
    const isFollowing = currentUser && currentUser.following ? currentUser.following.includes(user.id) : false;

    const row = document.createElement('div');
    row.className = 'suggested-user-item';
    row.innerHTML = `
      <a href="profile.html?user=${encodeURIComponent(user.username)}" style="display:flex; align-items:center; gap:var(--space-3); text-decoration:none; color:inherit;">
        <img src="${user.avatar}" alt="${user.username}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;">
        <div style="display:flex; flex-direction:column;">
          <span style="font-weight:700; font-size:0.85rem;">@${escapeHTML(user.username)}</span>
          <span style="font-size:0.75rem; color:var(--text-muted); max-width:130px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHTML(user.name)}</span>
        </div>
      </a>
      <button type="button" class="follow-btn ${isFollowing ? 'following' : ''}" data-target-id="${user.id}">
        ${isFollowing ? 'Following' : 'Follow'}
      </button>
    `;

    suggestedContainer.appendChild(row);
  });

  // Attach follow clicks
  suggestedContainer.querySelectorAll('.follow-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target-id');
      const nowFollowing = window.VesperDB.toggleFollow(targetId);
      btn.classList.toggle('following', nowFollowing);
      btn.textContent = nowFollowing ? 'Following' : 'Follow';
      showFeedToast(nowFollowing ? 'Now following creator' : 'Unfollowed creator');
    });
  });
}

/* ==========================================================================
   6. QUICK SEARCH IN FEED
   ========================================================================== */
function initSearch() {
  const input = document.getElementById('feedSearchInput');
  if (!input) return;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (q) {
        window.location.href = `explore.html?q=${encodeURIComponent(q)}`;
      }
    }
  });
}

function initNotifications() {
  const bell = document.getElementById('notifBellBtn');
  const mobileNotif = document.getElementById('mobileNotifBtn');
  const handler = () => {
    window.location.href = 'notifications.html';
  };
  if (bell) bell.addEventListener('click', handler);
  if (mobileNotif) mobileNotif.addEventListener('click', handler);
}

/* ==========================================================================
   7. UTILITIES
   ========================================================================== */
function showFeedToast(msg) {
  let container = document.getElementById('feedToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'feedToastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${msg}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (container.contains(toast)) container.removeChild(toast);
    }, 300);
  }, 3000);
}

function formatRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

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
