/**
 * VESPER SOCIAL PLATFORM: APPLICATION LOGIC
 * High-craft interactions, accessible controls, smooth carousel, theme switching,
 * handle availability check, and interactive demo modal.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeader();
  initMobileMenu();
  initHeroSignup();
  initFeatureWidgets();
  initWalkthroughCarousel();
  initDemoModal();
  initScrollReveals();
  initNewsletterForm();
});

/* ==========================================================================
   1. THEME CONTROLLER (LIGHT / DARK / SYSTEM PREFERENCE)
   ========================================================================== */
function initTheme() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const sunIcon = document.getElementById('themeSunIcon');
  const moonIcon = document.getElementById('themeMoonIcon');

  // Check saved preference or system preference
  const savedTheme = localStorage.getItem('vesper-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  applyTheme(currentTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('vesper-theme', newTheme);
      showToast(`Switched to ${newTheme} mode`);
    });
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
      if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Switch to light mode');
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
      if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  // Listen for system changes if no manual preference stored
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('vesper-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/* ==========================================================================
   2. HEADER & STICKY SCROLL
   ========================================================================== */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 24) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   3. MOBILE DRAWER NAVIGATION
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  const closeLinks = drawer ? drawer.querySelectorAll('a') : [];

  if (!menuBtn || !drawer) return;

  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !drawer.classList.contains('open');
    drawer.classList.toggle('open', isOpen);
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  menuBtn.addEventListener('click', () => toggleMenu());

  closeLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      toggleMenu(false);
      menuBtn.focus();
    }
  });
}

/* ==========================================================================
   4. HERO SIGNUP & PROGRESSIVE DISCLOSURE
   ========================================================================== */
function initHeroSignup() {
  const handleInput = document.getElementById('heroHandleInput');
  const emailInput = document.getElementById('heroEmailInput');
  const feedbackEl = document.getElementById('handleFeedback');
  const progressiveFields = document.getElementById('progressiveFields');
  const signupForm = document.getElementById('heroSignupForm');

  if (!handleInput) return;

  // Handle availability checker simulation
  let debounceTimeout;
  handleInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    const value = handleInput.value.trim().replace(/^@/, '');
    
    // Auto-reveal password field on input
    if (progressiveFields && !progressiveFields.classList.contains('revealed')) {
      progressiveFields.classList.add('revealed');
    }

    if (!value) {
      feedbackEl.className = 'form-feedback';
      feedbackEl.textContent = '';
      return;
    }

    if (value.length < 3) {
      feedbackEl.className = 'form-feedback error';
      feedbackEl.textContent = 'Handle must be at least 3 characters.';
      return;
    }

    const validPattern = /^[a-zA-Z0-9_]+$/;
    if (!validPattern.test(value)) {
      feedbackEl.className = 'form-feedback error';
      feedbackEl.textContent = 'Only letters, numbers, and underscores allowed.';
      return;
    }

    feedbackEl.className = 'form-feedback';
    feedbackEl.textContent = 'Verifying handle across federated registry...';

    debounceTimeout = setTimeout(() => {
      // Simulate registry lookup
      const reserved = ['admin', 'vesper', 'root', 'support', 'system'];
      if (reserved.includes(value.toLowerCase())) {
        feedbackEl.className = 'form-feedback error';
        feedbackEl.textContent = `@${value} is a reserved system protocol handle.`;
      } else {
        feedbackEl.className = 'form-feedback success';
        feedbackEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> @${value} is available on Vesper Protocol`;
      }
    }, 280);
  });

  if (emailInput && progressiveFields) {
    emailInput.addEventListener('focus', () => {
      progressiveFields.classList.add('revealed');
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const handle = handleInput.value.trim().replace(/^@/, '') || '';
      const email = emailInput ? emailInput.value.trim() : '';
      if (handle || email) {
        window.location.href = `auth.html?mode=register&handle=${encodeURIComponent(handle)}&email=${encodeURIComponent(email)}`;
      } else {
        window.location.href = 'auth.html?mode=register';
      }
    });
  }
}

/* ==========================================================================
   5. INTERACTIVE FEATURE WIDGETS
   ========================================================================== */
function initFeatureWidgets() {
  // 1. Algorithm Dial Visualizer
  const algoSlider = document.getElementById('algoSlider');
  const sliderVal = document.getElementById('algoSliderVal');
  const feedHeaderVal = document.getElementById('algoFeedHeaderVal');
  const feedSnippet = document.getElementById('algoFeedSnippet');

  if (algoSlider && sliderVal && feedSnippet) {
    const states = [
      {
        val: 'Strict Chronological (100% Signal)',
        code: 'ORDER_BY: timestamp DESC',
        header: 'RAW REAL-TIME RELAY • ZERO SYNTHESIS',
        text: 'Post #4891 from @sarah_architect: "Just published the blueprints for open spatial audio studios..." (2m ago)'
      },
      {
        val: 'Topic Affinity & Longform (Balanced)',
        code: 'ORDER_BY: topic_affinity * citation_depth',
        header: 'BALANCED HEURISTIC • CITATIONS PRIORITIZED',
        text: 'Post #4120 from @research_guild: "Comprehensive review: Why peer-reviewed decentralization withstands censorship..." (14m ago)'
      },
      {
        val: 'Deep Synthesis & High Resonance',
        code: 'ORDER_BY: council_consensus * longform_ratio',
        header: 'HIGH VALUE DEEP DIVES • 0 CLICKBAIT',
        text: 'Essay #209 from @dr_elena: "Reconstructing the Public Sphere: Observations from 500 federated moderation councils."'
      }
    ];

    algoSlider.addEventListener('input', () => {
      const idx = parseInt(algoSlider.value, 10);
      const state = states[idx] || states[1];
      sliderVal.textContent = state.val;
      feedHeaderVal.textContent = state.header;
      feedSnippet.textContent = state.text;
    });
  }

  // 2. Instagram-Inspired Post & Story Interactions
  const postMediaFrame = document.getElementById('postMediaFrame');
  const heartPopAnim = document.getElementById('heartPopAnim');
  const postLikeBtn = document.getElementById('postLikeBtn');
  const postCommentBtn = document.getElementById('postCommentBtn');
  const postShareBtn = document.getElementById('postShareBtn');
  const postBookmarkBtn = document.getElementById('postBookmarkBtn');
  const likesCountText = document.getElementById('likesCountText');
  const commentsTrigger = document.getElementById('commentsTrigger');
  const storyItems = document.querySelectorAll('.story-item');

  let isLiked = false;
  let baseLikes = 3;

  function triggerHeartPop() {
    if (heartPopAnim) {
      heartPopAnim.classList.remove('animate');
      // Trigger reflow
      void heartPopAnim.offsetWidth;
      heartPopAnim.classList.add('animate');
      setTimeout(() => {
        heartPopAnim.classList.remove('animate');
      }, 600);
    }
  }

  function toggleLike(forceState) {
    isLiked = forceState !== undefined ? forceState : !isLiked;
    if (postLikeBtn) {
      postLikeBtn.classList.toggle('liked', isLiked);
    }
    if (likesCountText) {
      likesCountText.textContent = `${isLiked ? baseLikes + 1 : baseLikes} others`;
    }
    if (isLiked) {
      triggerHeartPop();
      showToast('Liked post by @elena_arch');
    }
  }

  // Media Frame double click/tap to like
  if (postMediaFrame) {
    let lastTap = 0;
    postMediaFrame.addEventListener('click', (e) => {
      const now = Date.now();
      if (now - lastTap < 350) {
        toggleLike(true);
      }
      lastTap = now;
    });
  }

  // Heart button
  if (postLikeBtn) {
    postLikeBtn.addEventListener('click', () => toggleLike());
  }

  // Comment button & link
  if (postCommentBtn) {
    postCommentBtn.addEventListener('click', () => {
      showToast('Opening comments...');
    });
  }
  if (commentsTrigger) {
    commentsTrigger.addEventListener('click', () => {
      showToast('Opening comments...');
    });
  }

  // Share (Paper Plane) button
  if (postShareBtn) {
    postShareBtn.addEventListener('click', () => {
      showToast('Post link copied to clipboard');
    });
  }

  // Bookmark button
  if (postBookmarkBtn) {
    postBookmarkBtn.addEventListener('click', () => {
      const isSaved = postBookmarkBtn.classList.toggle('saved');
      showToast(isSaved ? 'Saved to bookmarks' : 'Removed from bookmarks');
    });
  }

  // Stories Tray interaction
  storyItems.forEach(item => {
    item.addEventListener('click', () => {
      const storyId = item.getAttribute('data-story');
      const ring = item.querySelector('.story-ring');
      if (ring && !ring.classList.contains('your-story')) {
        ring.classList.add('seen');
      }
      const label = item.querySelector('.story-label')?.textContent || 'Story';
      showToast(`Viewing story by ${label}`);
    });
  });
}

/* ==========================================================================
   6. 3-STEP WALKTHROUGH CAROUSEL (SWIPE + KEYBOARD + TABS)
   ========================================================================== */
function initWalkthroughCarousel() {
  const track = document.getElementById('carouselTrack');
  const slides = document.querySelectorAll('.carousel-slide');
  const tabs = document.querySelectorAll('.step-tab-btn');
  const dots = document.querySelectorAll('.indicator-dot');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const viewport = document.querySelector('.carousel-viewport');

  if (!track || slides.length === 0) return;

  let currentStep = 0;
  const totalSlides = slides.length;

  function goToStep(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentStep = index;

    // Slide track
    track.style.transform = `translateX(-${currentStep * 100}%)`;

    // Update step tabs
    tabs.forEach((tab, i) => {
      tab.classList.toggle('active', i === currentStep);
      tab.setAttribute('aria-selected', String(i === currentStep));
    });

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentStep);
    });

    // Announce to screen readers
    const currentSlideHeading = slides[currentStep].querySelector('h3');
    if (currentSlideHeading) {
      announceSR(`Step ${currentStep + 1} of ${totalSlides}: ${currentSlideHeading.textContent}`);
    }
  }

  // Button clicks
  if (prevBtn) {
    prevBtn.addEventListener('click', () => goToStep(currentStep - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => goToStep(currentStep + 1));
  }

  // Tab clicks
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => goToStep(index));
  });

  // Indicator dot clicks
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToStep(index));
  });

  // Keyboard navigation
  if (viewport) {
    viewport.setAttribute('tabindex', '0');
    viewport.setAttribute('aria-label', 'Product walkthrough carousel. Use Left and Right arrow keys to navigate.');
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToStep(currentStep - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToStep(currentStep + 1);
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const threshold = 40;
      const diff = touchEndX - touchStartX;
      if (diff > threshold) {
        goToStep(currentStep - 1); // Swipe right -> Previous
      } else if (diff < -threshold) {
        goToStep(currentStep + 1); // Swipe left -> Next
      }
    }
  }
}


/* ==========================================================================
   8. INTERACTIVE DEMO MODAL
   ========================================================================== */
function initDemoModal() {
  const modalOverlay = document.getElementById('demoModal');
  const openBtns = document.querySelectorAll('[data-open-modal="demo"]');
  const closeBtn = document.getElementById('modalCloseBtn');
  const modalTabs = document.querySelectorAll('.modal-tab-btn');
  const tabPanels = document.querySelectorAll('.modal-tab-content');

  if (!modalOverlay) return;

  let lastFocusedElement = null;

  function openModal() {
    lastFocusedElement = document.activeElement;
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });

  // Modal subtabs
  modalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPanelId = tab.getAttribute('data-tab');
      modalTabs.forEach(t => t.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPanel = document.getElementById(targetPanelId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
}

/* ==========================================================================
   9. SCROLL REVEALS & INTERSECTION OBSERVER
   ========================================================================== */
function initScrollReveals() {
  const reveals = document.querySelectorAll('.reveal-fade-up');
  if (reveals.length === 0) return;

  // Check if prefers-reduced-motion is active
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.15
  });

  reveals.forEach(el => observer.observe(el));
}

/* ==========================================================================
   10. NEWSLETTER & CONVERSION FORMS
   ========================================================================== */
function initNewsletterForm() {
  const ctaForms = document.querySelectorAll('.cta-form-row');
  ctaForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        window.location.href = `auth.html?mode=register&email=${encodeURIComponent(input.value.trim())}`;
      } else {
        window.location.href = 'auth.html?mode=register';
      }
    });
  });

  const newsForms = document.querySelectorAll('.newsletter-form');
  newsForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast(`Subscribed: ${input.value} added to Vesper Journal.`);
        input.value = '';
      }
    });
  });
}

/* ==========================================================================
   11. ACCESSIBLE TOAST SYSTEM & SR ANNOUNCER
   ========================================================================== */
let toastTimeout;
function showToast(message) {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2ECC71" stroke-width="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
    }, 300);
  }, 3400);
}

function announceSR(message) {
  let announcer = document.getElementById('sr-announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    announcer.className = 'sr-only';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(announcer);
  }
  announcer.textContent = message;
}
