/**
 * VESPER PHOTO CREATION STUDIO CONTROLLER (js/create.js)
 * Manages photo file drag-and-drop, FileReader base64 encoding, live CSS filter previews,
 * metadata tagging, and publishing to VesperDB.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCreateTheme();
  initCreatorSession();
  initImageUpload();
  initFilterStudio();
  initCaptionHelpers();
  initPostSubmission();
});

function initCreateTheme() {
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
let currentImageData = '';
let activeFilter = 'filter-normal';

function initCreatorSession() {
  activeUser = window.VesperDB.getCurrentUser();
  if (!activeUser) {
    // Check if usr_1 exists or redirect to auth
    activeUser = window.VesperDB.getUserById('usr_1');
    if (activeUser) {
      window.VesperDB.setCurrentUserId('usr_1');
    } else {
      window.location.href = 'auth.html';
      return;
    }
  }

  const avatar = document.getElementById('creatorAvatar');
  const userText = document.getElementById('creatorUsername');
  if (avatar) avatar.src = activeUser.avatar;
  if (userText) userText.textContent = `@${activeUser.username}`;
}

function showCreateAlert(msg, type = 'error') {
  const box = document.getElementById('createAlert');
  if (!box) return;
  box.style.display = 'flex';
  box.style.alignItems = 'center';
  box.style.gap = '8px';
  box.style.borderRadius = 'var(--radius-sm)';
  if (type === 'error') {
    box.style.background = 'rgba(217, 83, 40, 0.12)';
    box.style.border = '1px solid rgba(217, 83, 40, 0.3)';
    box.style.color = 'var(--accent-primary)';
    box.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>${msg}</span>
    `;
  } else {
    box.style.background = 'rgba(39, 174, 96, 0.12)';
    box.style.border = '1px solid rgba(39, 174, 96, 0.3)';
    box.style.color = 'var(--color-success)';
    box.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>${msg}</span>
    `;
  }
}

function initImageUpload() {
  const dropzone = document.getElementById('dropzoneArea');
  const fileInput = document.getElementById('photoFileInput');
  const browseBtn = document.getElementById('browseFilesBtn');
  const preview = document.getElementById('imagePreview');
  const prompt = document.getElementById('dropzonePrompt');
  const urlInput = document.getElementById('photoUrlInput');
  const loadUrlBtn = document.getElementById('loadUrlBtn');

  if (!dropzone || !fileInput) return;

  // Browse button
  if (browseBtn) {
    browseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  dropzone.addEventListener('click', () => {
    fileInput.click();
  });

  // Drag and drop events
  ['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      processFile(fileInput.files[0]);
    }
  });

  function processFile(file) {
    if (!file.type.startsWith('image/')) {
      showCreateAlert('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      currentImageData = e.target.result;
      preview.src = currentImageData;
      preview.className = `dropzone-preview-img active ${activeFilter}`;
      prompt.style.display = 'none';
      showCreateAlert('Image loaded successfully! Apply a filter or write your caption.', 'success');
    };
    reader.onerror = () => {
      showCreateAlert('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  }

  // URL fallback loader
  if (loadUrlBtn && urlInput) {
    loadUrlBtn.addEventListener('click', () => {
      const url = urlInput.value.trim();
      if (!url) return;

      const img = new Image();
      img.onload = () => {
        currentImageData = url;
        preview.src = currentImageData;
        preview.className = `dropzone-preview-img active ${activeFilter}`;
        prompt.style.display = 'none';
        showCreateAlert('Image URL loaded successfully!', 'success');
      };
      img.onerror = () => {
        showCreateAlert('Could not load image from that URL. Please try a different link or upload from disk.');
      };
      img.src = url;
    });
  }
}

function initFilterStudio() {
  const buttons = document.querySelectorAll('.filter-preset-btn');
  const preview = document.getElementById('imagePreview');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter') || 'filter-normal';

      if (preview && currentImageData) {
        preview.className = `dropzone-preview-img active ${activeFilter}`;
      }
    });
  });
}

function initCaptionHelpers() {
  const textarea = document.getElementById('postCaption');
  const counter = document.getElementById('captionCharCount');
  const chips = document.querySelectorAll('.tag-chip');

  if (textarea && counter) {
    textarea.addEventListener('input', () => {
      counter.textContent = `${textarea.value.length} / 500`;
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const tag = chip.getAttribute('data-tag');
      if (textarea) {
        if (!textarea.value.includes(tag)) {
          textarea.value = textarea.value.trim() ? `${textarea.value.trim()} ${tag}` : tag;
          if (counter) counter.textContent = `${textarea.value.length} / 500`;
          textarea.focus();
        }
      }
    });
  });
}

function initPostSubmission() {
  const form = document.getElementById('createPostForm');
  const submitBtn = document.getElementById('submitPostBtn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!currentImageData) {
      showCreateAlert('Please select or upload a photo before publishing.');
      return;
    }

    const caption = document.getElementById('postCaption').value.trim();
    const circle = document.getElementById('postCircle').value;
    const location = document.getElementById('postLocation').value.trim();

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Publishing to Relay...</span>`;

      const newPost = window.VesperDB.createPost({
        image_url: currentImageData,
        caption,
        filter: activeFilter,
        location,
        circle
      });

      showCreateAlert('Photo published successfully! Redirecting to feed...', 'success');

      setTimeout(() => {
        window.location.href = 'feed.html';
      }, 700);

    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span>Share Post to Feed</span>
        <svg class="arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      `;
      showCreateAlert(err.message || 'Failed to publish post.');
    }
  });
}
