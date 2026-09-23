# Vesper: Production Social Media Platform

A calm, decentralized, high-craft social application designed for photographers and creators. Engineered with working photo posting, cryptographically secure salted scrypt authentication for real user accounts, authentic glassmorphism, and multi-page navigation with 100% free access and zero pricing structures.

Location:
`d:\Antigravity IDE\Projects\My project`

Custom Domain: `https://vespersocial.org`

---

## Production & Anti-Vibe Design Standards

1. Zero Purple Gradients: Strictly vermilion, warm terracotta, and monochrome obsidian glass aesthetics.
2. Zero Pill-Shaped Buttons: Architectural 4px and 6px border radius corners; avatars maintain circular geometry.
3. Zero Fake Reviews or Fake Metrics: All post counts, member lists, and interaction tallies reflect actual database records.
4. Concrete Hero Copy: Direct, unambiguous value propositions tailored to creators and visual artists.
5. Zero Emojis: Replaced across all UI surfaces, alert dialogs, filter tabs, and metadata with clean SVG icons and clear typography.
6. Zero Em-Dashes: Clean punctuation using standard colons, hyphens, and dividers.
7. Zero Lagging Scroll or Cursor Animations: Static, predictable rendering with high-speed response.
8. Zero Simulated Typing Bots or Fake Encounters: Direct messaging and comments persist solely between authentic accounts.
9. Custom Domain Connected: Domain configured for `vespersocial.org` via root `CNAME` and canonical tags.
10. Favicon Included: Geometric architectural monogram in `favicon.svg`.
11. Zero "Made with AI" tags or badges.
12. Comprehensive Legal Pages: Dedicated Privacy Policy (`privacy.html`) and Terms and Conditions (`terms.html`).
13. Hardened Real-User Database: Cryptographic salted key derivation (`scrypt`) with constant-time equality checks and session management.

---

## Application Pages & Architecture

All buttons and navigation links across the platform lead to dedicated working pages:

1. `index.html` (Landing Page):
   - Welcome presentation with architectural warm editorial design.
   - Interactive live feed preview card with double-tap heart pop and story rings.
   - Dynamic algorithm tuning dial visualizer.
   - 3-step interactive product walkthrough carousel with swipe and keyboard controls.
   - Zero pricing structure (100% free for all readers and creators).
   - Navigation links to Feed, Explore, Create Studio, and Account Registration.

2. `feed.html` (Live Feed):
   - Sticky frosted glass top bar with search, notifications, and creator dropdown.
   - Stories Tray: Clickable stories with 5-second auto-advancing viewer.
   - Chronological Feed Posts: Author header with avatar, verified badge, camera metadata, and location.
   - Uncompressed photo canvas with double-tap heart burst.
   - Action bar: Like heart (persisted in DB with live counter), Comment focus, Share link to clipboard, and Save bookmark.
   - Live comment thread with instant comment submission and real-time display.
   - Desktop right sidebar: Active user profile, suggested accounts with working Follow toggles, and trending circle tags.
   - Mobile bottom navigation dock.

3. `create.html` (Photo Upload & Post Studio):
   - Drag-and-drop file upload zone or browse button (reads JPG/PNG/WEBP via `FileReader` as Base64 data URLs for instant offline persistence).
   - URL image loader fallback.
   - Instagram-style filter studio: Normal, Clarendon, Warmth, Vintage, Clarity, Cool Mist, Noir.
   - Caption editor with live character counter and clickable hashtag chips.
   - Location tag and Sovereign Circle category picker.
   - "Share Post to Feed" button: Saves the photo to the database under the logged-in user and redirects to `feed.html`.

4. `profile.html` (User Profile & 3-Column Media Grid):
   - Creator profile banner with avatar, handle (`@username`), bio, and external link.
   - Real-time counters: Total Posts, Followers, and Following.
   - "Edit Profile" modal to update display name, bio, and avatar.
   - Follow/Unfollow toggle when viewing other creators (`?user=username`).
   - 3-Column photo grid with tabs: Posts, Saved, and Liked.
   - Photo Detail Lightbox: Lightbox modal displaying high-res photo, author details, and comment submission.

5. `explore.html` (Discovery Grid & Search):
   - Live full-text search across creators, hashtags (`#photography`), locations, and circles.
   - Category filter tabs: All Media, Architecture, Street & Nocturnal, 35mm Analog Film, Wilderness & Nature, Minimalism.
   - Responsive photo grid with hover counters and lightbox detail view.

6. `messages.html` (Direct Peer Messaging):
   - Split-pane encrypted conversational layout.
   - Active conversation selection and message thread rendering.
   - Instant persistence of sent messages directly to the database.

7. `notifications.html` (Activity & Signals):
   - Direct chronological notifications for likes, comments, follows, and circle updates.
   - Category filter tabs with SVG badges.
   - "Mark All Read" synchronization.

8. `circles.html` (Sovereign Circles Directory):
   - Democratic community spaces with member rosters and stream filters.
   - Interactive "Join Circle" membership toggling with live counter updates.

9. `settings.html` (Settings & Data Sovereignty):
   - Full identity profile editor with real-time feedback.
   - Feed and resonance toggles (Strict Chronological, Lossless Media Rendering, Ad & Tracker Blocking).
   - Data sovereignty export: Download full account data and graph as a standalone JSON file.
   - Database restore to factory seed.
   - Session sign-out.

10. `about.html` (Manifesto & Protocol Pillars):
    - Comprehensive manifesto explaining chronological ordering, lossless media, democratic jury governance, and public-good financing.
    - Direct navigation to legal terms.

11. `auth.html` (Authentication & Security):
    - Glassmorphic card with Sign In and Create Account tabs.
    - Real-time handle uniqueness validation.
    - Password validation enforcing at least 8 characters.
    - Salted scrypt password hashing and session token generation.
    - Pre-seeded test creator accounts for testing (`@elena_arch`, `@marcus_lens`, `@maya_film`, `@dr_julian`).

12. `privacy.html` (Privacy Policy):
    - Legally structured document covering data minimization, salted scrypt password hashing, absence of surveillance cookies, GDPR/CCPA rights, and user data deletion.

13. `terms.html` (Terms of Service):
    - Legally structured document affirming 100% creator copyright ownership, no generative AI dataset ingestion licenses, DMCA procedure, and code of conduct.

---

## Database & Security Engine

- Persistent File Database (`data/database.json`):
  - Stores users, credentials, sessions, posts, comments, likes, conversations, notifications, and circles.
  - Salted Scrypt Key Derivation: Passwords are protected using `crypto.scryptSync(password, salt, 64)`.
  - Constant-Time Verification: Compares hashes using `crypto.timingSafeEqual` to eliminate timing side-channel attacks.
  - Session Tokens: Cryptographically random 32-byte hexadecimal bearer tokens issued upon login/registration with 30-day expiration.
  - Sanitized Responses: User models stripped of `password_hash` and `salt` before returning to any client.

- Client-Side Engine (`js/db.js`):
  - Automatically initializes and synchronizes state between browser `localStorage` and seed data.
  - Full client-side salted hashing fallback for offline capability.

---

## How to Run

### Option 1: Using the Node.js Server
```bash
node server.js
```
Then navigate to: `http://localhost:3000` or host with the custom domain `https://vespersocial.org`.

### Option 2: Direct Browser Launch
Open `index.html` or `feed.html` directly in any modern web browser.
