/* ========================================
   OVERENGINEERED CHAT APP - CLIENT JS
   ======================================== */

const socket = io();

// DOM Elements
const clientsTotal = document.getElementById('client-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const feedbackElement = document.getElementById('feedback');
const themeSwitcher = document.getElementById('theme-switcher');
const emojiTrigger = document.getElementById('emoji-trigger');
const emojiPicker = document.getElementById('emoji-picker');
const emojiGrid = document.getElementById('emoji-grid');
const emojiClose = document.getElementById('emoji-close');
const confettiCanvas = document.getElementById('confetti-canvas');

let feedbackTimeout;
let replyingTo = null;

// ========================================
// THEME SYSTEM
// ========================================

const THEMES = ['dark', 'light', 'neon', 'aurora'];

function initTheme() {
  const savedTheme = localStorage.getItem('chatTheme') || 'dark';
  setTheme(savedTheme);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('chatTheme', theme);

  // Update active button
  document.querySelectorAll('.theme-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

themeSwitcher?.addEventListener('click', (e) => {
  const btn = e.target.closest('.theme-btn');
  if (btn) {
    setTheme(btn.dataset.theme);
    // Add celebration effect for neon theme
    if (btn.dataset.theme === 'neon') {
      triggerConfetti();
    }
  }
});

// ========================================
// EMOJI SYSTEM
// ========================================

const EMOJI_LIST = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😊',
  '🙂',
  '😎',
  '🤩',
  '😍',
  '🥳',
  '😂',
  '🤣',
  '😅',
  '😇',
  '🥰',
  '😘',
  '😋',
  '🤔',
  '🤨',
  '😐',
  '😏',
  '🙄',
  '😴',
  '🤯',
  '😱',
  '🥺',
  '😢',
  '😭',
  '😤',
  '🤬',
  '👍',
  '👎',
  '👏',
  '🙌',
  '🤝',
  '💪',
  '✌️',
  '🤞',
  '🤟',
  '🤘',
  '❤️',
  '🧡',
  '💛',
  '💚',
  '💙',
  '💜',
  '🖤',
  '🤍',
  '💔',
  '💕',
  '🔥',
  '⭐',
  '✨',
  '💫',
  '🎉',
  '🎊',
  '🎁',
  '🏆',
  '💎',
  '🚀',
];

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍'];

function initEmojiPicker() {
  if (!emojiGrid) return;

  emojiGrid.innerHTML = EMOJI_LIST.map(
    (emoji) => `<button type="button" class="emoji-item" data-emoji="${emoji}">${emoji}</button>`
  ).join('');

  emojiGrid.addEventListener('click', (e) => {
    const item = e.target.closest('.emoji-item');
    if (item) {
      insertEmoji(item.dataset.emoji);
      closeEmojiPicker();
    }
  });
}

function insertEmoji(emoji) {
  const cursorPos = messageInput.selectionStart;
  const textBefore = messageInput.value.substring(0, cursorPos);
  const textAfter = messageInput.value.substring(cursorPos);
  messageInput.value = textBefore + emoji + textAfter;
  messageInput.focus();
  messageInput.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
}

function toggleEmojiPicker() {
  emojiPicker?.classList.toggle('active');
}

function closeEmojiPicker() {
  emojiPicker?.classList.remove('active');
}

emojiTrigger?.addEventListener('click', toggleEmojiPicker);
emojiClose?.addEventListener('click', closeEmojiPicker);

// Close picker when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.emoji-picker') && !e.target.closest('.emoji-trigger')) {
    closeEmojiPicker();
  }
});

// ========================================
// USER ICONS
// ========================================

const USER_ICONS = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😊',
  '🙂',
  '😎',
  '🤓',
  '🧐',
  '🤩',
  '😇',
  '🥳',
  '🤗',
  '🤠',
  '👨',
  '👩',
  '🧑',
  '👦',
  '👧',
  '🧒',
  '👶',
  '🐶',
  '🐱',
  '🐭',
  '🐹',
  '🐰',
  '🦊',
  '🐻',
  '🐼',
  '🐨',
  '🐯',
  '🦁',
  '🐮',
  '🐷',
  '🐸',
  '🐵',
  '🐔',
  '🐧',
  '🐦',
  '🐤',
  '🦄',
  '🐴',
  '🦋',
  '🐝',
  '🐛',
  '🦀',
  '🐌',
  '🐠',
  '🐡',
  '🐬',
  '🌸',
  '🌺',
  '🌻',
  '🌷',
  '🌹',
  '🌼',
  '⭐',
  '✨',
  '🌟',
  '💫',
  '🔥',
  '💧',
  '🌈',
  '☀️',
  '🌙',
  '⚡',
  '☁️',
  '🌤️',
  '⛅',
  '🌊',
];

function getUserIcon(username) {
  const key = `userIcon_${username}`;
  let icon = localStorage.getItem(key);

  if (!icon) {
    icon = USER_ICONS[Math.floor(Math.random() * USER_ICONS.length)];
    localStorage.setItem(key, icon);
  }

  return icon;
}

// ========================================
// MESSAGES
// ========================================

async function loadPreviousMessages() {
  try {
    const response = await fetch('/api/messages');
    const result = await response.json();

    if (result.success && result.data) {
      const messages = result.data.reverse();

      messages.forEach((msg) => {
        const messageData = {
          name: msg.username,
          message: msg.message,
          dateTime: msg.timestamp,
          replyTo: msg.replyTo,
        };
        addMessageToUI(false, messageData, false);
      });

      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  } catch (error) {
    console.error('Error loading previous messages:', error);
  }
}

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

function sendMessage() {
  const message = messageInput.value.trim();
  const name = nameInput.value.trim();

  if (!message || !name) return;

  const data = {
    name: name,
    message: message,
  };

  if (replyingTo) {
    data.replyTo = {
      username: replyingTo.name,
      message: replyingTo.message,
    };
  }

  socket.emit('message', data);
  addMessageToUI(true, data);

  messageInput.value = '';
  messageInput.focus();
  clearReply();

  // Celebration for special messages
  if (
    message.includes('🎉') ||
    message.includes('party') ||
    message.toLowerCase() === '/confetti'
  ) {
    triggerConfetti();
  }
}

socket.on('clients-total', (data) => {
  clientsTotal.innerText = data;
  // Animate count change
  clientsTotal.style.transform = 'scale(1.2)';
  setTimeout(() => {
    clientsTotal.style.transform = 'scale(1)';
  }, 200);
});

socket.on('chat-message', (data) => {
  addMessageToUI(false, data);
});

function addMessageToUI(isOwnMessage, data, shouldScroll = true) {
  clearFeedback();

  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(isOwnMessage ? 'message-right' : 'message-left');
  messageElement.dataset.messageId = Date.now() + Math.random();

  const time = data.dateTime || new Date().toISOString();
  const formattedTime = formatTime(time);
  const userIcon = getUserIcon(data.name);

  // Build reply HTML
  let replyHTML = '';
  if (data.replyTo) {
    const replyIcon = getUserIcon(data.replyTo.username);
    replyHTML = `
        <div class="message-reply">
          <div class="reply-icon-emoji">${replyIcon}</div>
          <div class="reply-content">
            <div class="reply-name">${escapeHtml(data.replyTo.username)}</div>
            <div class="reply-text">${escapeHtml(data.replyTo.message)}</div>
          </div>
        </div>
      `;
  }

  // Format message content (basic markdown support)
  const formattedMessage = formatMessage(data.message);

  messageElement.innerHTML = `
    <div class="message-header">
      <div class="message-user-info">
        <span class="user-icon">${userIcon}</span>
        <span class="message-name">${escapeHtml(data.name)}</span>
      </div>
      <span class="message-time">${formattedTime}</span>
    </div>
    ${replyHTML}
    <div class="message-content">
      ${formattedMessage}
    </div>
    <div class="message-reactions" data-reactions="{}">
      <button type="button" class="add-reaction-btn" title="Add reaction">➕</button>
    </div>
    <button class="reply-button" type="button">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 14L4 9l5-5"></path>
        <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
      </svg>
      Reply
    </button>
  `;

  messageContainer.appendChild(messageElement);

  // Event listeners
  const replyButton = messageElement.querySelector('.reply-button');
  if (replyButton) {
    replyButton.addEventListener('click', () => {
      setReplyTo(data.name, data.message);
    });
  }

  const addReactionBtn = messageElement.querySelector('.add-reaction-btn');
  if (addReactionBtn) {
    addReactionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showReactionPicker(messageElement);
    });
  }

  if (shouldScroll) {
    scrollToBottom();
  }
}

// Basic markdown formatting
function formatMessage(text) {
  let formatted = escapeHtml(text);

  // Code blocks (```code```)
  formatted = formatted.replace(/```([^`]+)```/g, '<pre class="code-block"><code>$1</code></pre>');

  // Inline code (`code`)
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Bold (**text**)
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic (*text*)
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Links (auto-detect URLs)
  formatted = formatted.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="message-link">$1</a>'
  );

  return formatted;
}

// ========================================
// REACTIONS
// ========================================

function showReactionPicker(messageElement) {
  // Remove any existing reaction picker
  document.querySelectorAll('.reaction-picker-popup').forEach((el) => el.remove());

  const picker = document.createElement('div');
  picker.className = 'reaction-picker-popup';
  picker.style.cssText = `
        position: absolute;
        bottom: 100%;
        left: 0;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 1rem;
        padding: 0.5rem;
        display: flex;
        gap: 0.25rem;
        box-shadow: var(--shadow-md);
        z-index: 100;
        animation: picker-in 0.2s ease;
    `;

  REACTION_EMOJIS.forEach((emoji) => {
    const btn = document.createElement('button');
    btn.textContent = emoji;
    btn.style.cssText = `
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            border-radius: 0.5rem;
            font-size: 1.25rem;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'var(--bg-tertiary)';
      btn.style.transform = 'scale(1.2)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'transparent';
      btn.style.transform = 'scale(1)';
    });
    btn.addEventListener('click', () => {
      addReaction(messageElement, emoji);
      picker.remove();
    });
    picker.appendChild(btn);
  });

  const reactionsContainer = messageElement.querySelector('.message-reactions');
  reactionsContainer.style.position = 'relative';
  reactionsContainer.appendChild(picker);

  // Close when clicking outside
  setTimeout(() => {
    document.addEventListener('click', function closePicker(e) {
      if (!e.target.closest('.reaction-picker-popup')) {
        picker.remove();
        document.removeEventListener('click', closePicker);
      }
    });
  }, 10);
}

function addReaction(messageElement, emoji) {
  const reactionsContainer = messageElement.querySelector('.message-reactions');
  const addBtn = reactionsContainer.querySelector('.add-reaction-btn');

  // Check if reaction already exists
  let existingReaction = reactionsContainer.querySelector(`[data-emoji="${emoji}"]`);

  if (existingReaction) {
    // Toggle reaction
    const countEl = existingReaction.querySelector('.reaction-count');
    let count = parseInt(countEl.textContent);
    if (existingReaction.classList.contains('active')) {
      count--;
      existingReaction.classList.remove('active');
      if (count <= 0) {
        existingReaction.remove();
      } else {
        countEl.textContent = count;
      }
    } else {
      count++;
      countEl.textContent = count;
      existingReaction.classList.add('active');
    }
  } else {
    // Add new reaction
    const badge = document.createElement('button');
    badge.className = 'reaction-badge active';
    badge.dataset.emoji = emoji;
    badge.innerHTML = `${emoji}<span class="reaction-count">1</span>`;
    badge.addEventListener('click', () => addReaction(messageElement, emoji));
    reactionsContainer.insertBefore(badge, addBtn);
  }
}

// ========================================
// REPLY SYSTEM
// ========================================

function setReplyTo(name, message) {
  replyingTo = { name, message };

  let replyIndicator = document.getElementById('reply-indicator');

  if (!replyIndicator) {
    replyIndicator = createReplyIndicator();
  }

  const replyUserIcon = getUserIcon(name);

  replyIndicator.innerHTML = `
    <div class="replying-to">
      <div class="replying-to-content">
        <div class="replying-to-icon">${replyUserIcon}</div>
        <div>
          <div class="replying-to-name">Replying to ${escapeHtml(name)}</div>
          <div class="replying-to-message">${escapeHtml(message)}</div>
        </div>
      </div>
      <button class="cancel-reply" type="button">✕</button>
    </div>
  `;
  replyIndicator.style.display = 'block';

  const cancelButton = replyIndicator.querySelector('.cancel-reply');
  if (cancelButton) {
    cancelButton.addEventListener('click', clearReply);
  }

  messageInput.focus();
}

function createReplyIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'reply-indicator';
  indicator.className = 'reply-indicator';
  messageForm.insertBefore(indicator, messageForm.firstChild);
  return indicator;
}

function clearReply() {
  replyingTo = null;
  const replyIndicator = document.getElementById('reply-indicator');
  if (replyIndicator) {
    replyIndicator.style.display = 'none';
    replyIndicator.innerHTML = '';
  }
}

// ========================================
// TYPING FEEDBACK
// ========================================

messageInput.addEventListener('focus', () => {
  socket.emit('feedback', {
    feedback: `${nameInput.value || 'Someone'} is typing...`,
  });
});

messageInput.addEventListener('keypress', () => {
  socket.emit('feedback', {
    feedback: `${nameInput.value || 'Someone'} is typing...`,
  });
});

messageInput.addEventListener('blur', () => {
  socket.emit('feedback', { feedback: '' });
});

socket.on('feedback', (data) => {
  clearFeedback();

  if (data.feedback) {
    feedbackElement.classList.add('active');
    const typingText = feedbackElement.querySelector('.typing-text');
    if (typingText) {
      typingText.innerText = data.feedback;
    }

    feedbackTimeout = setTimeout(() => {
      feedbackElement.classList.remove('active');
    }, 3000);
  }
});

function clearFeedback() {
  if (feedbackTimeout) {
    clearTimeout(feedbackTimeout);
  }
  feedbackElement.classList.remove('active');
}

// ========================================
// UTILITIES
// ========================================

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTime(isoString) {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function scrollToBottom() {
  messageContainer.scrollTo({
    top: messageContainer.scrollHeight,
    behavior: 'smooth',
  });
}

// ========================================
// CONFETTI EFFECT
// ========================================

function triggerConfetti() {
  if (!confettiCanvas) return;

  const ctx = confettiCanvas.getContext('2d');
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const pieces = [];
  const colors = ['#6366f1', '#8b5cf6', '#00ff88', '#ff6b9d', '#ffcc00', '#00ccff'];

  // Create confetti pieces
  for (let i = 0; i < 150; i++) {
    pieces.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 5,
      speedX: Math.random() * 6 - 3,
      speedY: Math.random() * 3 + 2,
      rotationSpeed: Math.random() * 10 - 5,
    });
  }

  function animate() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    let stillVisible = false;

    pieces.forEach((piece) => {
      piece.y += piece.speedY;
      piece.x += piece.speedX;
      piece.rotation += piece.rotationSpeed;

      if (piece.y < confettiCanvas.height + 20) {
        stillVisible = true;

        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate((piece.rotation * Math.PI) / 180);
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size / 2);
        ctx.restore();
      }
    });

    if (stillVisible) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  animate();
}

// Handle window resize for confetti
window.addEventListener('resize', () => {
  if (confettiCanvas) {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
});

// ========================================
// KEYBOARD SHORTCUTS
// ========================================

document.addEventListener('keydown', (e) => {
  // Escape to close emoji picker
  if (e.key === 'Escape') {
    closeEmojiPicker();
    clearReply();
  }

  // Ctrl/Cmd + Enter to send
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    sendMessage();
  }
});

// Enter key in name input
nameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    messageInput.focus();
  }
});

// ========================================
// INITIALIZE
// ========================================

window.addEventListener('load', async () => {
  initTheme();
  initEmojiPicker();
  await loadPreviousMessages();
  nameInput.focus();
});

// Add inline code styles dynamically
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .code-block {
        background: var(--bg-tertiary);
        border: 1px solid var(--border-color);
        border-radius: 0.5rem;
        padding: 0.75rem 1rem;
        margin: 0.5rem 0;
        overflow-x: auto;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 0.85rem;
    }
    
    .inline-code {
        background: var(--bg-tertiary);
        border-radius: 0.25rem;
        padding: 0.15rem 0.4rem;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 0.85em;
    }
    
    .message-link {
        color: var(--accent-primary);
        text-decoration: none;
        word-break: break-all;
    }
    
    .message-link:hover {
        text-decoration: underline;
    }
`;
document.head.appendChild(styleSheet);
