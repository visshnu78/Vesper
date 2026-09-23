/**
 * VESPER DIRECT MESSENGER CONTROLLER (js/messages.js)
 * Manages conversation list, message bubble rendering, interactive messaging,
 * and conversational echo responses.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMessagesTheme();
  initConversations();
  initChatForm();
});

function initMessagesTheme() {
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

let activeConversationId = null;

function initConversations() {
  const listEl = document.getElementById('convList');
  if (!listEl) return;

  const convs = window.VesperDB.getConversations();
  listEl.innerHTML = '';

  if (convs.length === 0) {
    listEl.innerHTML = `<div style="padding:var(--space-4); color:var(--text-muted); font-size:0.85rem;">No active chats yet.</div>`;
    return;
  }

  convs.forEach((conv, index) => {
    const item = document.createElement('div');
    item.className = `conv-item ${index === 0 ? 'active' : ''}`;
    item.setAttribute('data-conv-id', conv.id);

    item.innerHTML = `
      <img src="${conv.recipient.avatar}" alt="${conv.recipient.username}" class="conv-avatar">
      <div class="conv-meta">
        <div class="conv-user">
          <span>${escapeHTML(conv.recipient.name)}</span>
          <span style="font-weight:400; font-size:0.75rem; color:var(--text-muted);">${formatTime(conv.updated_at)}</span>
        </div>
        <div class="conv-preview">${escapeHTML(conv.last_message || 'Start a conversation')}</div>
      </div>
    `;

    item.addEventListener('click', () => {
      document.querySelectorAll('.conv-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      selectConversation(conv.id);
    });

    listEl.appendChild(item);
  });

  // Select first conversation by default
  if (convs.length > 0) {
    selectConversation(convs[0].id);
  }
}

function selectConversation(convId) {
  activeConversationId = convId;
  const conv = window.VesperDB.getConversation(convId);
  if (!conv) return;

  const avatar = document.getElementById('chatRecipientAvatar');
  const name = document.getElementById('chatRecipientName');
  const handle = document.getElementById('chatRecipientHandle');
  const history = document.getElementById('chatHistory');

  if (avatar) avatar.src = conv.recipient.avatar;
  if (name) name.textContent = conv.recipient.name;
  if (handle) {
    handle.textContent = `@${conv.recipient.username}`;
    handle.href = `profile.html?user=${encodeURIComponent(conv.recipient.username)}`;
  }

  if (history) {
    history.innerHTML = '';
    const current = window.VesperDB.getCurrentUser();
    const currentUserId = current ? current.id : 'usr_1';

    (conv.messages || []).forEach(msg => {
      const bubble = document.createElement('div');
      const isSent = msg.sender_id === currentUserId;
      bubble.className = `chat-bubble ${isSent ? 'sent' : 'received'}`;
      bubble.textContent = msg.text;
      history.appendChild(bubble);
    });

    history.scrollTop = history.scrollHeight;
  }
}

function initChatForm() {
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatMessageInput');
  const history = document.getElementById('chatHistory');

  if (!form || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || !activeConversationId) return;

    // Send user message
    try {
      const msg = window.VesperDB.sendMessage(activeConversationId, text);
      input.value = '';

      // Append bubble
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble sent';
      bubble.textContent = msg.text;
      history.appendChild(bubble);
      history.scrollTop = history.scrollHeight;

      // Update sidebar preview
      const conv = window.VesperDB.getConversation(activeConversationId);
      const activeItem = document.querySelector(`.conv-item[data-conv-id="${activeConversationId}"] .conv-preview`);
      if (activeItem) activeItem.textContent = text;

    } catch (err) {
      alert(err.message);
    }
  });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diffSec = Math.floor((new Date() - d) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  return `${Math.floor(diffSec / 86400)}d`;
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
