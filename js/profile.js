/**
 * VESPER PROFILE CONTROLLER (js/profile.js)
 * Manages user profile metadata, stats, 3-column Instagram-style photo grid,
 * tab switching (Posts, Saved, Liked), and photo detail lightbox.
 */

document.addEventListener('DOMContentLoaded', () => {
  initProfileTheme();
  initProfileView();
  initProfileTabs();
  initEditProfileModal();
  initLightboxModal();
});

function initProfileTheme() {
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
let profileUser = null;
let currentTab = 'posts';

function initProfileView() {
  activeUser = window.VesperDB.getCurrentUser();
  if (!activeUser) {
    activeUser = window.VesperDB.getUserById('usr_1');
    if (activeUser) window.VesperDB.setCurrentUserId('usr_1');
  }

  // Check URL query param ?user=...
  const params = new URLSearchParams(window.location.search);
  const requestedUser = params.get('user');

  if (requestedUser) {
    profileUser = window.VesperDB.getUserByUsername(requestedUser);
  }

  if (!profileUser) {
    profileUser = activeUser;
  }

  if (!profileUser) {
    window.location.href = 'auth.html';
    return;
  }

  renderProfileHeader();
  renderGridPosts(currentTab);
}

function renderProfileHeader() {
  const avatar = document.getElementById('profAvatar');
  const handle = document.getElementById('profHandle');
  const name = document.getElementById('profFullName');
  const bio = document.getElementById('profBio');
  const website = document.getElementById('profWebsite');
  const websiteText = document.getElementById('profWebsiteText');
  const actions = document.getElementById('profActionContainer');

  const postCount = document.getElementById('profPostCount');
  const followerCount = document.getElementById('profFollowerCount');
  const followingCount = document.getElementById('profFollowingCount');

  if (avatar) avatar.src = profileUser.avatar;
  if (handle) handle.textContent = `@${profileUser.username}`;
  if (name) name.textContent = profileUser.name;
  if (bio) bio.textContent = profileUser.bio || 'Vesper member';

  if (website && websiteText) {
    if (profileUser.website) {
      website.href = profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`;
      websiteText.textContent = profileUser.website.replace(/^https?:\/\//, '');
      website.style.display = 'inline-flex';
    } else {
      website.style.display = 'none';
    }
  }

  // Stats
  const userPosts = window.VesperDB.getPosts().filter(p => p.user_id === profileUser.id);
  if (postCount) postCount.textContent = userPosts.length.toLocaleString();
  if (followerCount) followerCount.textContent = (profileUser.followers || []).length.toLocaleString();
  if (followingCount) followingCount.textContent = (profileUser.following || []).length.toLocaleString();

  // Action Buttons
  if (actions) {
    actions.innerHTML = '';
    const isOwnProfile = activeUser && activeUser.id === profileUser.id;

    if (isOwnProfile) {
      actions.innerHTML = `
        <button type="button" class="btn btn-outline btn-sm" id="openEditModalBtn">Edit Profile</button>
        <a href="create.html" class="btn btn-primary btn-sm">+ Post</a>
        <button type="button" class="btn btn-outline btn-sm" id="logoutBtn" style="color:#EB4B26;">Sign Out</button>
      `;

      document.getElementById('openEditModalBtn').addEventListener('click', openEditModal);
      document.getElementById('logoutBtn').addEventListener('click', () => {
        window.VesperDB.logout();
        window.location.href = 'auth.html';
      });
    } else {
      const isFollowing = activeUser && activeUser.following ? activeUser.following.includes(profileUser.id) : false;
      actions.innerHTML = `
        <button type="button" class="btn ${isFollowing ? 'btn-outline' : 'btn-accent'} btn-sm" id="followProfileBtn">
          ${isFollowing ? 'Following' : 'Follow'}
        </button>
      `;

      document.getElementById('followProfileBtn').addEventListener('click', () => {
        const btn = document.getElementById('followProfileBtn');
        const nowFollowing = window.VesperDB.toggleFollow(profileUser.id);
        btn.textContent = nowFollowing ? 'Following' : 'Follow';
        btn.className = `btn ${nowFollowing ? 'btn-outline' : 'btn-accent'} btn-sm`;

        // Refresh counts
        profileUser = window.VesperDB.getUserById(profileUser.id);
        if (followerCount) followerCount.textContent = (profileUser.followers || []).length.toLocaleString();
      });
    }
  }
}

function initProfileTabs() {
  const tabPosts = document.getElementById('tabPostsBtn');
  const tabSaved = document.getElementById('tabSavedBtn');
  const tabLiked = document.getElementById('tabLikedBtn');

  if (!tabPosts || !tabSaved || !tabLiked) return;

  tabPosts.addEventListener('click', () => {
    setActiveTab(tabPosts, 'posts');
  });

  tabSaved.addEventListener('click', () => {
    setActiveTab(tabSaved, 'saved');
  });

  tabLiked.addEventListener('click', () => {
    setActiveTab(tabLiked, 'liked');
  });

  function setActiveTab(btn, tab) {
    [tabPosts, tabSaved, tabLiked].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = tab;
    renderGridPosts(tab);
  }
}

function renderGridPosts(tab) {
  const grid = document.getElementById('profileMediaGrid');
  if (!grid) return;

  grid.innerHTML = '';
  let posts = [];

  if (tab === 'posts') {
    posts = window.VesperDB.getPosts().filter(p => p.user_id === profileUser.id);
  } else if (tab === 'saved') {
    posts = window.VesperDB.getSavedPosts(profileUser.id);
  } else if (tab === 'liked') {
    posts = window.VesperDB.getLikedPosts(profileUser.id);
  }

  if (posts.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:var(--space-12) 0; color:var(--text-muted);">
        <p style="font-size:1.1rem; margin-bottom:var(--space-2);">No ${tab} to display yet.</p>
        ${profileUser.id === (activeUser ? activeUser.id : '') && tab === 'posts' ? '<a href="create.html" class="btn btn-primary btn-sm">Upload Photo</a>' : ''}
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

/* ==========================================================================
   EDIT PROFILE MODAL
   ========================================================================== */
function initEditProfileModal() {
  const modal = document.getElementById('editProfileModal');
  const closeBtn = document.getElementById('closeEditModalBtn');
  const form = document.getElementById('editProfileForm');

  if (!modal || !form) return;

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('editName').value.trim();
    const bio = document.getElementById('editBio').value.trim();
    const website = document.getElementById('editWebsite').value.trim();
    const avatar = document.getElementById('editAvatar').value.trim();

    window.VesperDB.updateUser(activeUser.id, { name, bio, website, avatar: avatar || undefined });
    modal.classList.remove('open');

    // Reload view
    initProfileView();
  });
}

function openEditModal() {
  const modal = document.getElementById('editProfileModal');
  if (!modal) return;

  document.getElementById('editName').value = activeUser.name || '';
  document.getElementById('editBio').value = activeUser.bio || '';
  document.getElementById('editWebsite').value = activeUser.website || '';
  document.getElementById('editAvatar').value = activeUser.avatar || '';

  modal.classList.add('open');
}

/* ==========================================================================
   PHOTO LIGHTBOX MODAL
   ========================================================================== */
let activeLightboxPostId = null;

function initLightboxModal() {
  const modal = document.getElementById('photoLightboxModal');
  const closeBtn = document.getElementById('closeLightboxBtn');
  const commentForm = document.getElementById('lightboxCommentForm');

  if (!modal) return;

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('lightboxCommentInput');
      const text = input.value.trim();
      if (!text || !activeLightboxPostId) return;

      try {
        window.VesperDB.addComment(activeLightboxPostId, text);
        input.value = '';
        const updated = window.VesperDB.getPostById(activeLightboxPostId);
        if (updated) openLightbox(updated);
      } catch (err) {
        alert(err.message);
      }
    });
  }
}

function openLightbox(post) {
  activeLightboxPostId = post.id;
  const modal = document.getElementById('photoLightboxModal');
  const img = document.getElementById('lightboxImg');
  const avatar = document.getElementById('lightboxAuthorAvatar');
  const authorUser = document.getElementById('lightboxAuthorUsername');
  const caption = document.getElementById('lightboxCaption');
  const commentsList = document.getElementById('lightboxCommentsList');

  if (!modal) return;

  img.src = post.image_url;
  img.className = post.filter || '';
  avatar.src = post.author_avatar;
  authorUser.textContent = `@${post.author_username}`;
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
