const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Receive superuser status from server
socket.on('superuserStatus', ({ isSuperuser }) => {
  localStorage.setItem('isSuperuser', isSuperuser.toString());
  if (isSuperuser) {
    console.log('🔐 Superuser privileges enabled');
  }
});

// Message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Handle emoji reaction
socket.on('emojiReaction', ({ messageId, emoji, users, action }) => {
  console.log(`📨 Received reaction update: ${emoji} on message ${messageId}`, { users, action });
  updateReaction(messageId, emoji, users);
});

// Handle message deletion
socket.on('messageDeleted', ({ messageId }) => {
  const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
  if (messageEl) {
    messageEl.remove();
  }
});

// Handle blocked message (AI moderation)
socket.on('messageBlocked', ({ reason, confidence }) => {
  showNotification(`Message blocked: ${reason}`, 'error', confidence);
});

// Handle delete failure (authorization)
socket.on('deleteFailed', ({ reason }) => {
  showNotification(`Delete failed: ${reason}`, 'error');
});

// Load message history
socket.on('messageHistory', (messages) => {
  messages.forEach(message => {
    outputMessage(message);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Check if we have an image to send
  const imagePreviewContainer = document.getElementById('image-preview-container');
  if (imagePreviewContainer && imagePreviewContainer.style.display !== 'none') {
    // Send image message
    sendImageMessage();
    return;
  }

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Image upload functionality
const imageBtn = document.getElementById('image-btn');
const imageInput = document.getElementById('image-input');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const imageCaption = document.getElementById('image-caption');
const cancelImageBtn = document.getElementById('cancel-image');
const msgInput = document.getElementById('msg');

let selectedImageFile = null;

// Click image button to select file
imageBtn?.addEventListener('click', () => {
  imageInput.click();
});

// Handle file selection
imageInput?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    handleImageFile(file);
  }
});

// Handle image file
function handleImageFile(file) {
  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size must be less than 5MB');
    return;
  }

  selectedImageFile = file;
  const reader = new FileReader();
  
  reader.onload = (e) => {
    imagePreview.src = e.target.result;
    imagePreviewContainer.style.display = 'block';
    msgInput.placeholder = 'Add a caption...';
    msgInput.removeAttribute('required');
  };
  
  reader.readAsDataURL(file);
}

// Cancel image selection
cancelImageBtn?.addEventListener('click', () => {
  cancelImageSelection();
});

function cancelImageSelection() {
  selectedImageFile = null;
  imagePreview.src = '';
  imageCaption.value = '';
  imagePreviewContainer.style.display = 'none';
  imageInput.value = '';
  msgInput.placeholder = 'Enter Message or paste image...';
  msgInput.setAttribute('required', '');
}

// Send image message
async function sendImageMessage() {
  if (!selectedImageFile) return;

  try {
    // Show uploading state
    imageBtn.disabled = true;
    imageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    // Upload image
    const formData = new FormData();
    formData.append('image', selectedImageFile);

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();

    // Get caption from either caption input or message input
    const caption = imageCaption.value.trim() || msgInput.value.trim();

    // Emit image message to server
    socket.emit('imageMessage', {
      imageUrl: data.imageUrl,
      caption: caption
    });

    // Clear inputs
    msgInput.value = '';
    cancelImageSelection();

  } catch (error) {
    console.error('Image upload error:', error);
    alert('Failed to upload image. Please try again.');
  } finally {
    imageBtn.disabled = false;
    imageBtn.innerHTML = '<i class="fas fa-image"></i>';
  }
}

// Drag and drop support
const chatFormContainer = document.querySelector('.chat-form-container');

chatFormContainer?.addEventListener('dragover', (e) => {
  e.preventDefault();
  chatFormContainer.style.background = 'rgba(96, 165, 250, 0.1)';
});

chatFormContainer?.addEventListener('dragleave', (e) => {
  chatFormContainer.style.background = '';
});

chatFormContainer?.addEventListener('drop', (e) => {
  e.preventDefault();
  chatFormContainer.style.background = '';

  const files = e.dataTransfer.files;
  if (files.length > 0 && files[0].type.startsWith('image/')) {
    handleImageFile(files[0]);
  }
});

// Paste image from clipboard
msgInput?.addEventListener('paste', (e) => {
  const items = e.clipboardData.items;
  
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      e.preventDefault();
      const file = items[i].getAsFile();
      handleImageFile(file);
      break;
    }
  }
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  
  // Add flagged class if message was flagged by AI
  if (message.flagged) {
    div.classList.add('flagged-message');
  }
  
  div.setAttribute('data-message-id', message.id || Date.now());
  
  const p = document.createElement('p');
  p.classList.add('meta');
  
  const usernameSpan = document.createElement('span');
  usernameSpan.className = 'username';
  usernameSpan.innerText = message.username;
  
  // Add superuser badge if applicable
  if (message.isSuperuser) {
    const badge = document.createElement('span');
    badge.className = 'superuser-badge';
    badge.innerText = 'ADMIN';
    usernameSpan.appendChild(badge);
  }
  
  const timeSpan = document.createElement('span');
  timeSpan.className = 'time';
  timeSpan.innerText = message.time;
  
  p.appendChild(usernameSpan);
  p.appendChild(timeSpan);
  div.appendChild(p);
  
  // Handle image messages
  if (message.imageUrl) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'message-image-container';
    
    const img = document.createElement('img');
    img.src = message.imageUrl;
    img.alt = 'Shared image';
    img.className = 'message-image';
    img.style.maxWidth = '100%';
    img.style.borderRadius = '8px';
    img.style.marginTop = '10px';
    img.style.cursor = 'pointer';
    
    // Click to view full size
    img.addEventListener('click', () => {
      window.open(message.imageUrl, '_blank');
    });
    
    imageContainer.appendChild(img);
    div.appendChild(imageContainer);
    
    // Add caption if exists
    if (message.text) {
      const caption = document.createElement('p');
      caption.classList.add('text');
      caption.innerText = message.text;
      div.appendChild(caption);
    }
  } else {
    // Regular text message
    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = message.text;
    div.appendChild(para);
  }
  
  // Add message actions (emoji reactions, delete)
  const actions = createMessageActions(message);
  div.appendChild(actions);
  
  // Add reactions container
  const reactionsDiv = document.createElement('div');
  reactionsDiv.className = 'message-reactions';
  if (message.reactions && Object.keys(message.reactions).length > 0) {
    Object.entries(message.reactions).forEach(([emoji, users]) => {
      const reaction = createReactionElement(emoji, users, message.id);
      reactionsDiv.appendChild(reaction);
    });
  }
  div.appendChild(reactionsDiv);
  
  document.querySelector('.chat-messages').appendChild(div);
}

function createMessageActions(message) {
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'message-actions';
  
  // Emoji reaction button
  const emojiBtn = document.createElement('button');
  emojiBtn.className = 'message-action-btn emoji-btn';
  emojiBtn.innerHTML = '😊';
  emojiBtn.title = 'Add reaction';
  emojiBtn.onclick = (e) => {
    e.stopPropagation();
    toggleEmojiPicker(message.id || e.target.closest('.message').dataset.messageId);
  };
  
  // Delete button (only for superusers or own messages)
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'message-action-btn delete-btn';
  deleteBtn.innerHTML = '🗑️';
  deleteBtn.title = 'Delete message';
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    deleteMessage(message.id || e.target.closest('.message').dataset.messageId);
  };
  
  actionsDiv.appendChild(emojiBtn);
  
  // Only show delete for own messages or superuser
  if (message.username === username || checkIfSuperuser()) {
    actionsDiv.appendChild(deleteBtn);
  }
  
  // Create emoji picker
  const picker = createEmojiPicker(message.id || Date.now());
  actionsDiv.appendChild(picker);
  
  return actionsDiv;
}

function createEmojiPicker(messageId) {
  const picker = document.createElement('div');
  picker.className = 'emoji-picker';
  picker.setAttribute('data-message-id', messageId);
  
  const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '👏', '💯', '✅', '⭐'];
  
  emojis.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'emoji-option';
    btn.innerText = emoji;
    btn.onclick = (e) => {
      e.stopPropagation();
      addReaction(messageId, emoji);
      picker.classList.remove('active');
    };
    picker.appendChild(btn);
  });
  
  return picker;
}

function toggleEmojiPicker(messageId) {
  // Close all other pickers
  document.querySelectorAll('.emoji-picker').forEach(p => {
    if (p.dataset.messageId !== messageId.toString()) {
      p.classList.remove('active');
    }
  });
  
  const picker = document.querySelector(`[data-message-id="${messageId}"] .emoji-picker`);
  if (picker) {
    picker.classList.toggle('active');
  }
}

function addReaction(messageId, emoji) {
  console.log(`👆 Adding reaction ${emoji} to message ${messageId} by ${username}`);
  socket.emit('addReaction', { messageId, emoji, username });
}

function createReactionElement(emoji, users, messageId) {
  const reaction = document.createElement('div');
  reaction.className = 'reaction';
  
  // Highlight if current user reacted
  if (users.includes(username)) {
    reaction.classList.add('user-reacted');
  }
  
  const emojiSpan = document.createElement('span');
  emojiSpan.className = 'emoji';
  emojiSpan.innerText = emoji;
  
  const count = document.createElement('span');
  count.className = 'count';
  count.innerText = users.length;
  
  reaction.appendChild(emojiSpan);
  reaction.appendChild(count);
  
  // Add tooltip showing who reacted
  reaction.title = users.join(', ');
  
  // Click to toggle reaction
  reaction.onclick = () => {
    addReaction(messageId, emoji);
  };
  
  return reaction;
}

function updateReaction(messageId, emoji, users) {
  const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
  if (!messageEl) {
    console.log(`Message ${messageId} not found for reaction update`);
    return;
  }
  
  const reactionsDiv = messageEl.querySelector('.message-reactions');
  if (!reactionsDiv) {
    console.log(`Reactions div not found for message ${messageId}`);
    return;
  }
  
  // Find existing reaction element for this emoji
  let reactionEl = Array.from(reactionsDiv.children).find(r => 
    r.querySelector('.emoji') && r.querySelector('.emoji').innerText === emoji
  );
  
  // If no users, remove the reaction element
  if (!users || users.length === 0) {
    if (reactionEl) {
      reactionEl.remove();
    }
    return;
  }
  
  // Create new reaction element if it doesn't exist
  if (!reactionEl) {
    reactionEl = createReactionElement(emoji, users, messageId);
    reactionsDiv.appendChild(reactionEl);
  } else {
    // Update existing reaction element
    const countEl = reactionEl.querySelector('.count');
    if (countEl) {
      countEl.innerText = users.length;
    }
    
    // Update user-reacted class
    if (users.includes(username)) {
      reactionEl.classList.add('user-reacted');
    } else {
      reactionEl.classList.remove('user-reacted');
    }
    
    // Update the onclick to use current users
    reactionEl.onclick = () => {
      addReaction(messageId, emoji);
    };
  }
}

function deleteMessage(messageId) {
  if (confirm('Are you sure you want to delete this message?')) {
    socket.emit('deleteMessage', { messageId });
  }
}

function checkIfSuperuser() {
  // Check if current user is superuser (will be set from server)
  return localStorage.getItem('isSuperuser') === 'true';
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});

// Close emoji picker when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.message-actions')) {
    document.querySelectorAll('.emoji-picker').forEach(p => {
      p.classList.remove('active');
    });
  }
});

/* Theme switcher: apply theme, persist to localStorage, smooth transitions */
(function () {
  const THEME_KEY = 'chatcordTheme';

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      /* ignore storage errors */
    }
  }

  function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    // On load, read saved preference or respect prefers-color-scheme
    const saved = (function () {
      try {
        return localStorage.getItem(THEME_KEY);
      } catch (e) {
        return null;
      }
    })();

    const defaultTheme = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(defaultTheme);

    if (!toggle) return;

    // set icon
    toggle.innerText = document.body.classList.contains('dark') ? '🌙' : '🌗';

    toggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark');
      applyTheme(isDark ? 'dark' : 'light');
      // subtle delay for transition feel
      toggle.innerText = isDark ? '🌙' : '🌗';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
  } else {
    initThemeToggle();
  }
})();

// Show notification for blocked messages or errors
function showNotification(message, type = 'info', confidence = null) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  let content = message;
  if (confidence !== null) {
    content += ` (Confidence: ${(confidence * 100).toFixed(0)}%)`;
  }
  
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${content}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Remove after 5 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}
