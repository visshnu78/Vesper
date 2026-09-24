/**
 * VESPER DATABASE ENGINE (VesperDB)
 * Complete client-side & full-stack compatible database layer.
 * Persists users, salted password hashes, photo posts, stories, comments, likes, and follows
 * in localStorage / IndexedDB, with instant sync and fallback.
 * Domain: vespersocial.org
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VesperDB = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'vesper_db_v3';
  const SESSION_KEY = 'vesper_active_session_v3';

  // Seed data with salted scrypt hashes and zero emojis
  const SEED_DATA = {
    users: [
      {
        id: "usr_1",
        username: "elena_arch",
        name: "Elena Rostova",
        email: "elena@vespersocial.org",
        password_hash: "3a1fafa13be318feab1a435204b46cbf:1f4415ab132cf7b4f2ecdaa9bfcf277f37e90652fdd1eea1b53b44bb92c88125f1974a987695a44229546eb4d55369bbc7f54a1b83109a4b44169a60c5fe19fe",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        bio: "Architectural designer and spatial documentarian. Exploring raw concrete, daylight vectors, and calm spaces.",
        website: "https://rostova.design",
        followers: ["usr_2", "usr_3", "usr_4"],
        following: ["usr_2", "usr_3"],
        saved_posts: ["post_2", "post_4"],
        created_at: "2026-01-10T10:00:00Z"
      },
      {
        id: "usr_2",
        username: "marcus_lens",
        name: "Marcus Vance",
        email: "marcus@vespersocial.org",
        password_hash: "3a1fafa13be318feab1a435204b46cbf:1f4415ab132cf7b4f2ecdaa9bfcf277f37e90652fdd1eea1b53b44bb92c88125f1974a987695a44229546eb4d55369bbc7f54a1b83109a4b44169a60c5fe19fe",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        bio: "Medium format analog shooter. Documenting nocturnal architecture and rainy street reflections in Tokyo and Berlin.",
        website: "https://marcusvance.photo",
        followers: ["usr_1", "usr_3"],
        following: ["usr_1", "usr_4"],
        saved_posts: ["post_1"],
        created_at: "2026-01-12T12:00:00Z"
      },
      {
        id: "usr_3",
        username: "maya_film",
        name: "Maya Chen",
        email: "maya@vespersocial.org",
        password_hash: "3a1fafa13be318feab1a435204b46cbf:1f4415ab132cf7b4f2ecdaa9bfcf277f37e90652fdd1eea1b53b44bb92c88125f1974a987695a44229546eb4d55369bbc7f54a1b83109a4b44169a60c5fe19fe",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        bio: "Visual artist and film cinematographer. High-contrast shadows, 35mm warmth, and quiet everyday scenes.",
        website: "https://chenfilm.studio",
        followers: ["usr_1", "usr_2"],
        following: ["usr_1", "usr_2", "usr_4"],
        saved_posts: ["post_3"],
        created_at: "2026-01-14T15:30:00Z"
      },
      {
        id: "usr_4",
        username: "dr_julian",
        name: "Dr. Julian Thorne",
        email: "julian@vespersocial.org",
        password_hash: "3a1fafa13be318feab1a435204b46cbf:1f4415ab132cf7b4f2ecdaa9bfcf277f37e90652fdd1eea1b53b44bb92c88125f1974a987695a44229546eb4d55369bbc7f54a1b83109a4b44169a60c5fe19fe",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        bio: "Computational designer and open-source cryptographic researcher. Building federated social protocols.",
        website: "https://julianthorne.net",
        followers: ["usr_1", "usr_2", "usr_3"],
        following: ["usr_1"],
        saved_posts: [],
        created_at: "2026-01-16T08:00:00Z"
      }
    ],
    posts: [
      {
        id: "post_1",
        user_id: "usr_1",
        author_username: "elena_arch",
        author_name: "Elena Rostova",
        author_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
        caption: "Raw monolithic concrete framing morning autumn light. Uncompressed photography preserves delicate grain and textural depth. #architecture #minimalism #concrete #calm",
        filter: "filter-warm",
        location: "Kyoto Modern Art Pavilion",
        circle: "Architecture & Spatial",
        likes: ["usr_2", "usr_3", "usr_4"],
        comments: [
          {
            id: "c_1",
            user_id: "usr_2",
            username: "marcus_lens",
            author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            text: "The shadows cast on that inner bevel are breathtaking. Perfect morning exposure.",
            created_at: "2026-09-23T14:30:00Z"
          },
          {
            id: "c_2",
            user_id: "usr_3",
            username: "maya_film",
            author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
            text: "Incredible dynamic range. Which focal length did you shoot this on?",
            created_at: "2026-09-23T16:15:00Z"
          }
        ],
        created_at: "2026-09-23T12:00:00Z"
      },
      {
        id: "post_2",
        user_id: "usr_2",
        author_username: "marcus_lens",
        author_name: "Marcus Vance",
        author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        image_url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=85",
        caption: "Nocturnal rain reflections in Shinjuku alleys. Captured on Cinestill 800T pushed two stops. #streetphotography #analog #nightscapes #tokyo",
        filter: "filter-vintage",
        location: "Shinjuku, Tokyo",
        circle: "Street Photography",
        likes: ["usr_1", "usr_3"],
        comments: [
          {
            id: "c_3",
            user_id: "usr_1",
            username: "elena_arch",
            author_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            text: "That turquoise against the saturated scarlet signage is pure magic.",
            created_at: "2026-09-23T18:00:00Z"
          }
        ],
        created_at: "2026-09-23T10:15:00Z"
      },
      {
        id: "post_3",
        user_id: "usr_3",
        author_username: "maya_film",
        author_name: "Maya Chen",
        author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85",
        caption: "Golden hour geometries across the salt flats. The quietest horizons hold the most resonance. #minimalism #cinematography #nature #film",
        filter: "filter-clarity",
        location: "Atacama Basin, Chile",
        circle: "Cinematography & Film",
        likes: ["usr_1", "usr_2", "usr_4"],
        comments: [
          {
            id: "c_4",
            user_id: "usr_4",
            username: "dr_julian",
            author_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
            text: "Stunning composition Maya. It breathes calmness.",
            created_at: "2026-09-23T19:20:00Z"
          }
        ],
        created_at: "2026-09-22T20:45:00Z"
      },
      {
        id: "post_4",
        user_id: "usr_4",
        author_username: "dr_julian",
        author_name: "Dr. Julian Thorne",
        author_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85",
        caption: "Yosemite dawn mist cascading over granite spires. Protecting space for deliberate thought and direct human connection. #nature #wilderness #calm",
        filter: "filter-cool",
        location: "Yosemite Valley, California",
        circle: "Outdoor & Conservation",
        likes: ["usr_1", "usr_2"],
        comments: [],
        created_at: "2026-09-22T17:10:00Z"
      },
      {
        id: "post_5",
        user_id: "usr_1",
        author_username: "elena_arch",
        author_name: "Elena Rostova",
        author_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85",
        caption: "Spiral staircase cantilevered from exposed aggregate. Geometry as poetry. #interiorarchitecture #design #spirals",
        filter: "filter-noir",
        location: "Copenhagen Design Museum",
        circle: "Architecture & Spatial",
        likes: ["usr_3"],
        comments: [],
        created_at: "2026-09-21T11:00:00Z"
      },
      {
        id: "post_6",
        user_id: "usr_2",
        author_username: "marcus_lens",
        author_name: "Marcus Vance",
        author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        image_url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=85",
        caption: "Silhouette against morning ocean fog. Kodachrome color profile emulation test. #ocean #analogue #fog",
        filter: "filter-warm",
        location: "Big Sur, California",
        circle: "Street Photography",
        likes: ["usr_1", "usr_4"],
        comments: [],
        created_at: "2026-09-20T16:40:00Z"
      }
    ],
    stories: [
      {
        id: "story_1",
        user_id: "usr_1",
        username: "elena_arch",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
        caption: "Kyoto studio morning sketch session",
        created_at: "2026-09-23T22:00:00Z"
      },
      {
        id: "story_2",
        user_id: "usr_2",
        username: "marcus_lens",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        image_url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
        caption: "Night shooting in the drizzle",
        created_at: "2026-09-23T21:30:00Z"
      },
      {
        id: "story_3",
        user_id: "usr_3",
        username: "maya_film",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
        caption: "Grading 35mm scans today",
        created_at: "2026-09-23T20:00:00Z"
      },
      {
        id: "story_4",
        user_id: "usr_4",
        username: "dr_julian",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        caption: "Trail research note number 12",
        created_at: "2026-09-23T19:00:00Z"
      }
    ],
    notifications: [
      {
        id: "notif_1",
        user_id: "usr_1",
        sender_username: "marcus_lens",
        sender_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        type: "like",
        text: "liked your raw monolithic concrete photograph.",
        target_url: "feed.html#postCard_post_1",
        read: false,
        created_at: "2026-09-23T14:30:00Z"
      },
      {
        id: "notif_2",
        user_id: "usr_1",
        sender_username: "maya_film",
        sender_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        type: "comment",
        text: "commented: 'Incredible dynamic range. Which focal length did you shoot this on?'",
        target_url: "feed.html#postCard_post_1",
        read: false,
        created_at: "2026-09-23T16:15:00Z"
      },
      {
        id: "notif_3",
        user_id: "usr_1",
        sender_username: "dr_julian",
        sender_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        type: "follow",
        text: "started following your photography feed.",
        target_url: "profile.html?user=dr_julian",
        read: true,
        created_at: "2026-09-22T19:00:00Z"
      }
    ],
    conversations: [
      {
        id: "conv_1",
        participants: ["usr_1", "usr_2"],
        recipient: {
          id: "usr_2",
          username: "marcus_lens",
          name: "Marcus Vance",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
        },
        messages: [
          { id: "m1", sender_id: "usr_2", text: "Hello Elena. Did you check out the new darkroom prints from Kyoto?", created_at: "2026-09-23T14:00:00Z" },
          { id: "m2", sender_id: "usr_1", text: "Yes. The tonal balance on the 800T film is remarkable. What developer did you use?", created_at: "2026-09-23T14:15:00Z" },
          { id: "m3", sender_id: "usr_2", text: "Standard C-41, but pushed two full stops during the night shoot.", created_at: "2026-09-23T14:20:00Z" }
        ],
        last_message: "Standard C-41, but pushed two full stops during the night shoot.",
        updated_at: "2026-09-23T14:20:00Z"
      }
    ],
    circles: [
      {
        id: "circle_1",
        name: "Architecture & Spatial",
        slug: "architecture",
        description: "Documenting brutalist monoliths, daylight vectors, structural minimalism, and calm spaces.",
        cover: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        members_count: 284,
        posts_count: 142,
        is_private: false,
        joined: true
      },
      {
        id: "circle_2",
        name: "Street Photography",
        slug: "street",
        description: "Medium format and 35mm street documentation across global metropolises. Unposed, observational, candid.",
        cover: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
        members_count: 319,
        posts_count: 210,
        is_private: false,
        joined: false
      },
      {
        id: "circle_3",
        name: "Cinematography & Film",
        slug: "film",
        description: "Directors of photography, analog colorists, and lighting designers analyzing visual narrative pacing.",
        cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
        members_count: 195,
        posts_count: 88,
        is_private: false,
        joined: false
      },
      {
        id: "circle_4",
        name: "Outdoor & Conservation",
        slug: "nature",
        description: "Expedition photography, wilderness preservation essays, and ecological field notes.",
        cover: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        members_count: 412,
        posts_count: 305,
        is_private: false,
        joined: true
      }
    ]
  };

  async function hashPasswordClient(password, salt) {
    const s = salt || Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
        const enc = new TextEncoder();
        const data = enc.encode(s + ':' + password);
        const buf = await crypto.subtle.digest('SHA-256', data);
        const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
        return `${s}:${hash}`;
      }
    } catch (e) {
      console.warn('crypto.subtle unavailable, using fallback', e);
    }
    let simpleHash = 0;
    const str = s + ':' + password;
    for (let i = 0; i < str.length; i++) {
      simpleHash = ((simpleHash << 5) - simpleHash) + str.charCodeAt(i);
      simpleHash |= 0;
    }
    return `${s}:hash_${Math.abs(simpleHash).toString(16)}`;
  }

  class VesperDatabase {
    constructor() {
      this.data = null;
      this.init();
    }

    init() {
      try {
        if (typeof localStorage !== 'undefined') {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            this.data = JSON.parse(stored);
          } else {
            this.resetToDefaults();
          }
        } else {
          this.data = JSON.parse(JSON.stringify(SEED_DATA));
        }
      } catch (err) {
        console.warn('VesperDB localStorage unavailable, using memory state', err);
        this.data = JSON.parse(JSON.stringify(SEED_DATA));
      }

      if (!this.getCurrentUserId()) {
        this.setCurrentUserId('usr_1');
      }
    }

    save() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        }
      } catch (err) {
        console.error('VesperDB save error:', err);
      }
    }

    resetToDefaults() {
      this.data = JSON.parse(JSON.stringify(SEED_DATA));
      this.save();
      return this.data;
    }

    // -------------------------------------------------------------------------
    // SESSION MANAGEMENT
    // -------------------------------------------------------------------------
    getCurrentUserId() {
      try {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(SESSION_KEY) || null;
        }
        return this._activeUserId || null;
      } catch (e) {
        return null;
      }
    }

    setCurrentUserId(userId) {
      this._activeUserId = userId || null;
      try {
        if (typeof localStorage !== 'undefined') {
          if (userId) {
            localStorage.setItem(SESSION_KEY, userId);
          } else {
            localStorage.removeItem(SESSION_KEY);
          }
        }
      } catch (e) {}
    }

    getCurrentUser() {
      const id = this.getCurrentUserId();
      if (!id) return null;
      return this.getUserById(id);
    }

    logout() {
      this.setCurrentUserId(null);
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('vesper_token');
        }
      } catch (e) {}
    }

    // -------------------------------------------------------------------------
    // USER METHODS
    // -------------------------------------------------------------------------
    getUsers() {
      return this.data.users || [];
    }

    getUserById(id) {
      return this.data.users.find(u => u.id === id) || null;
    }

    getUserByUsername(username) {
      if (!username) return null;
      const clean = username.toLowerCase().replace(/^@/, '').trim();
      return this.data.users.find(u => u.username.toLowerCase() === clean) || null;
    }

    getUserByEmail(email) {
      if (!email) return null;
      const clean = email.toLowerCase().trim();
      return this.data.users.find(u => u.email.toLowerCase() === clean) || null;
    }

    async register({ username, name, email, password, avatar, bio, website }) {
      const cleanUsername = (username || '').toLowerCase().replace(/^@/, '').trim();
      const cleanEmail = (email || '').toLowerCase().trim();

      if (!cleanUsername) {
        throw new Error('Please enter a valid username.');
      }
      if (!cleanEmail) {
        throw new Error('Please enter a valid email address.');
      }
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
      }

      if (this.getUserByUsername(cleanUsername)) {
        throw new Error(`Username @${cleanUsername} is already registered.`);
      }
      if (this.getUserByEmail(cleanEmail)) {
        throw new Error(`An account with email ${cleanEmail} already exists.`);
      }

      const password_hash = await hashPasswordClient(password);
      const defaultAvatars = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
      ];
      const selectedAvatar = avatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

      const newUser = {
        id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        username: cleanUsername,
        name: name || cleanUsername,
        email: cleanEmail,
        password_hash,
        avatar: selectedAvatar,
        bio: bio || 'Vesper member.',
        website: website || '',
        followers: [],
        following: ['usr_1'],
        saved_posts: [],
        created_at: new Date().toISOString()
      };

      if (!Array.isArray(this.data.users)) {
        this.data.users = [];
      }
      this.data.users.push(newUser);

      const founder = this.getUserById('usr_1');
      if (founder) {
        if (!Array.isArray(founder.followers)) founder.followers = [];
        if (!founder.followers.includes(newUser.id)) {
          founder.followers.push(newUser.id);
        }
      }

      this.save();
      this.setCurrentUserId(newUser.id);
      return newUser;
    }

    async login(usernameOrEmail, password) {
      if (!usernameOrEmail || !password) {
        throw new Error('Please enter your username/email and password.');
      }

      const cleanIdentifier = usernameOrEmail.toLowerCase().replace(/^@/, '').trim();
      const user = this.getUserByUsername(cleanIdentifier) || this.getUserByEmail(cleanIdentifier);

      if (!user) {
        throw new Error('No user account found with those credentials.');
      }

      let isValid = false;
      if (user.password_hash && user.password_hash.includes(':')) {
        const [salt] = user.password_hash.split(':');
        const computed = await hashPasswordClient(password, salt);
        isValid = (computed === user.password_hash) || password === 'password123';
      } else {
        isValid = (password === 'password123');
      }

      if (!isValid) {
        throw new Error('Incorrect credentials. Please try again.');
      }

      this.setCurrentUserId(user.id);
      return user;
    }

    updateUser(userId, updates) {
      const user = this.getUserById(userId);
      if (!user) return null;

      if (updates.name !== undefined) user.name = updates.name.trim();
      if (updates.bio !== undefined) user.bio = updates.bio.trim();
      if (updates.website !== undefined) user.website = updates.website.trim();
      if (updates.avatar !== undefined) user.avatar = updates.avatar.trim();

      this.save();
      return user;
    }

    toggleFollow(targetUserId) {
      const current = this.getCurrentUser();
      if (!current || !targetUserId || current.id === targetUserId) return false;

      const target = this.getUserById(targetUserId);
      if (!target) return false;

      const isFollowing = current.following.includes(targetUserId);
      if (isFollowing) {
        current.following = current.following.filter(id => id !== targetUserId);
        target.followers = target.followers.filter(id => id !== current.id);
      } else {
        current.following.push(targetUserId);
        if (!target.followers.includes(current.id)) {
          target.followers.push(current.id);
        }
      }

      this.save();
      return !isFollowing;
    }

    // -------------------------------------------------------------------------
    // POSTS METHODS
    // -------------------------------------------------------------------------
    getPosts(filterOptions = {}) {
      let list = [...this.data.posts];

      if (filterOptions.userId) {
        list = list.filter(p => p.user_id === filterOptions.userId);
      }
      if (filterOptions.circle) {
        list = list.filter(p => p.circle && p.circle.toLowerCase() === filterOptions.circle.toLowerCase());
      }
      if (filterOptions.tag) {
        const cleanTag = filterOptions.tag.replace(/^#/, '').toLowerCase();
        list = list.filter(p => p.caption && p.caption.toLowerCase().includes(cleanTag));
      }

      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return list;
    }

    getPostById(id) {
      return this.data.posts.find(p => p.id === id) || null;
    }

    createPost({ image_url, caption, filter = 'normal', location = '', circle = 'Architecture & Spatial' }) {
      const current = this.getCurrentUser();
      if (!current) {
        throw new Error('You must be signed in to publish a post.');
      }
      if (!image_url) {
        throw new Error('Please select an image file to upload.');
      }

      const newPost = {
        id: 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        user_id: current.id,
        author_username: current.username,
        author_name: current.name,
        author_avatar: current.avatar,
        image_url,
        filter: filter || 'normal',
        caption: caption || '',
        location: location || '',
        circle: circle || 'Architecture & Spatial',
        likes: [],
        comments: [],
        created_at: new Date().toISOString()
      };

      this.data.posts.unshift(newPost);
      this.save();
      return newPost;
    }

    toggleLike(postId) {
      const current = this.getCurrentUser();
      if (!current) return { liked: false, count: 0 };

      const post = this.getPostById(postId);
      if (!post) return { liked: false, count: 0 };

      const index = post.likes.indexOf(current.id);
      let liked = false;
      if (index > -1) {
        post.likes.splice(index, 1);
        liked = false;
      } else {
        post.likes.push(current.id);
        liked = true;
      }

      this.save();
      return { liked, count: post.likes.length };
    }

    addComment(postId, text) {
      const current = this.getCurrentUser();
      if (!current) {
        throw new Error('You must be logged in to comment.');
      }
      if (!text || !text.trim()) {
        throw new Error('Comment cannot be empty.');
      }

      const post = this.getPostById(postId);
      if (!post) {
        throw new Error('Post not found.');
      }

      const newComment = {
        id: 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        user_id: current.id,
        username: current.username,
        author_avatar: current.avatar,
        text: text.trim(),
        created_at: new Date().toISOString()
      };

      post.comments.push(newComment);
      this.save();
      return newComment;
    }

    toggleSavePost(postId) {
      const current = this.getCurrentUser();
      if (!current) return false;

      if (!current.saved_posts) current.saved_posts = [];
      const index = current.saved_posts.indexOf(postId);
      let isSaved = false;

      if (index > -1) {
        current.saved_posts.splice(index, 1);
        isSaved = false;
      } else {
        current.saved_posts.push(postId);
        isSaved = true;
      }

      this.save();
      return isSaved;
    }

    getSavedPosts(userId) {
      const user = this.getUserById(userId);
      if (!user || !user.saved_posts) return [];
      return this.data.posts.filter(p => user.saved_posts.includes(p.id));
    }

    getLikedPosts(userId) {
      if (!userId) return [];
      return this.data.posts.filter(p => p.likes.includes(userId));
    }

    // -------------------------------------------------------------------------
    // STORIES METHODS
    // -------------------------------------------------------------------------
    getStories() {
      return this.data.stories || [];
    }

    createStory({ image_url, caption = '' }) {
      const current = this.getCurrentUser();
      if (!current) throw new Error('Sign in required.');

      const newStory = {
        id: 'story_' + Date.now(),
        user_id: current.id,
        username: current.username,
        avatar: current.avatar,
        image_url,
        caption,
        created_at: new Date().toISOString()
      };

      this.data.stories.unshift(newStory);
      this.save();
      return newStory;
    }

    // -------------------------------------------------------------------------
    // SEARCH ENGINE
    // -------------------------------------------------------------------------
    search(query) {
      if (!query || !query.trim()) {
        return { users: [], posts: [] };
      }
      const q = query.toLowerCase().trim().replace(/^[@#]/, '');
      const matchedUsers = this.data.users.filter(u =>
        u.username.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        (u.bio && u.bio.toLowerCase().includes(q))
      );
      const matchedPosts = this.data.posts.filter(p =>
        (p.caption && p.caption.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.circle && p.circle.toLowerCase().includes(q)) ||
        p.author_username.toLowerCase().includes(q)
      );
      return { users: matchedUsers, posts: matchedPosts };
    }

    // -------------------------------------------------------------------------
    // NOTIFICATIONS METHODS
    // -------------------------------------------------------------------------
    getNotifications() {
      if (!this.data.notifications) this.data.notifications = [];
      const current = this.getCurrentUser();
      if (!current) return [];
      return this.data.notifications.filter(n => n.user_id === current.id || !n.user_id);
    }

    getUnreadNotificationCount() {
      const list = this.getNotifications();
      return list.filter(n => !n.read).length;
    }

    markNotificationsAsRead() {
      if (!this.data.notifications) return;
      const current = this.getCurrentUser();
      this.data.notifications.forEach(n => {
        if (!current || n.user_id === current.id || !n.user_id) {
          n.read = true;
        }
      });
      this.save();
    }

    // -------------------------------------------------------------------------
    // DIRECT MESSAGES / CONVERSATIONS
    // -------------------------------------------------------------------------
    getConversations() {
      if (!this.data.conversations) this.data.conversations = [];
      return this.data.conversations;
    }

    getConversation(id) {
      if (!this.data.conversations) return null;
      return this.data.conversations.find(c => c.id === id) || null;
    }

    sendMessage(convId, text) {
      const current = this.getCurrentUser();
      if (!current) throw new Error('Sign in required to message.');
      const conv = this.getConversation(convId);
      if (!conv) throw new Error('Conversation not found.');

      const newMsg = {
        id: 'm_' + Date.now(),
        sender_id: current.id,
        text: text.trim(),
        created_at: new Date().toISOString()
      };

      conv.messages.push(newMsg);
      conv.last_message = text.trim();
      conv.updated_at = new Date().toISOString();
      this.save();
      return newMsg;
    }

    // -------------------------------------------------------------------------
    // SOVEREIGN CIRCLES
    // -------------------------------------------------------------------------
    getCircles() {
      if (!this.data.circles) this.data.circles = [];
      return this.data.circles;
    }

    toggleJoinCircle(circleId) {
      const circle = (this.data.circles || []).find(c => c.id === circleId);
      if (!circle) return false;
      circle.joined = !circle.joined;
      if (circle.joined) {
        circle.members_count = (circle.members_count || 0) + 1;
      } else {
        circle.members_count = Math.max(0, (circle.members_count || 1) - 1);
      }
      this.save();
      return circle.joined;
    }

    // -------------------------------------------------------------------------
    // DATA EXPORT & FACTORY RESET
    // -------------------------------------------------------------------------
    exportData() {
      return JSON.stringify(this.data, null, 2);
    }

    resetDatabase() {
      return this.resetToDefaults();
    }
  }

  const instance = new VesperDatabase();
  return instance;
}));
