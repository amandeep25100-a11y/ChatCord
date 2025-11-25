// Dashboard JavaScript
const socket = io();

// Get user info from URL or localStorage
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username') || localStorage.getItem('username') || 'Guest';
const userAvatar = localStorage.getItem('userAvatar') || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=60a5fa&color=fff`;

// Store username
localStorage.setItem('username', username);

// Update user profile
document.getElementById('user-name').textContent = username;
document.getElementById('user-avatar').src = userAvatar;
document.getElementById('create-avatar').src = userAvatar;

// Check if superuser
const isSuperuser = localStorage.getItem('isSuperuser') === 'true';
if (isSuperuser) {
  document.getElementById('admin-link').style.display = 'flex';
}

// Logout functionality
document.getElementById('logout-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  if (confirm('Are you sure you want to logout?')) {
    localStorage.clear();
    window.location.href = '/auth/logout';
  }
});

// ============== Filter Dropdown ==============
const filterBtn = document.getElementById('filter-btn');
const dropdownMenu = document.getElementById('dropdown-menu');
const currentFilterText = document.getElementById('current-filter');
let currentFilter = 'all';

filterBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isActive = dropdownMenu.classList.contains('active');
  
  if (!isActive) {
    // Calculate position relative to button
    const rect = filterBtn.getBoundingClientRect();
    dropdownMenu.style.top = `${rect.bottom + 8}px`;
    dropdownMenu.style.left = `${rect.right - 200}px`; // 200px is min-width of dropdown
  }
  
  dropdownMenu.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!filterBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
    dropdownMenu.classList.remove('active');
  }
});

// Prevent dropdown from closing when clicking inside it
dropdownMenu.addEventListener('click', (e) => {
  e.stopPropagation();
});

// Filter selection
document.querySelectorAll('.dropdown-item').forEach(item => {
  item.addEventListener('click', () => {
    // Update active state
    document.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    // Update current filter
    currentFilter = item.dataset.filter;
    currentFilterText.textContent = item.querySelector('span').textContent;
    
    // Close dropdown
    dropdownMenu.classList.remove('active');
    
    // Filter posts
    filterPosts(currentFilter);
    
    console.log(`Filter changed to: ${currentFilter}`);
  });
});

// ============== Post Modal ==============
const postModal = document.getElementById('post-modal');
const openModalBtn = document.getElementById('open-post-modal');
const closeModalBtn = document.getElementById('close-modal');
const postCategorySelect = document.getElementById('post-category');
const postContentTextarea = document.getElementById('post-content');
const submitPostBtn = document.getElementById('submit-post-btn');

// Open modal
openModalBtn.addEventListener('click', () => {
  postModal.classList.add('active');
  postContentTextarea.focus();
});

// Open modal from action buttons
document.querySelectorAll('.post-action-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    postModal.classList.add('active');
    const type = btn.dataset.type;
    
    // Pre-fill based on type
    if (type === 'achievement') {
      postContentTextarea.placeholder = 'Share your achievement, certification, or milestone...';
    } else if (type === 'code') {
      postContentTextarea.placeholder = 'Share your code snippet or project...';
    }
  });
});

// Close modal
closeModalBtn.addEventListener('click', () => {
  postModal.classList.remove('active');
});

// Close modal on backdrop click
postModal.addEventListener('click', (e) => {
  if (e.target === postModal) {
    postModal.classList.remove('active');
  }
});

// ============== File Upload ==============
const fileUploadArea = document.getElementById('file-upload-area');
const fileInput = document.getElementById('file-input');
const filePreview = document.getElementById('file-preview');
let selectedFiles = [];

fileUploadArea.addEventListener('click', () => {
  fileInput.click();
});

// Drag and drop
fileUploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  fileUploadArea.style.borderColor = 'var(--neon-cyan)';
  fileUploadArea.style.background = 'rgba(96, 165, 250, 0.1)';
});

fileUploadArea.addEventListener('dragleave', () => {
  fileUploadArea.style.borderColor = 'rgba(96, 165, 250, 0.3)';
  fileUploadArea.style.background = 'transparent';
});

fileUploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  fileUploadArea.style.borderColor = 'rgba(96, 165, 250, 0.3)';
  fileUploadArea.style.background = 'transparent';
  
  const files = Array.from(e.dataTransfer.files);
  handleFiles(files);
});

fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  handleFiles(files);
});

function handleFiles(files) {
  files.forEach(file => {
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      selectedFiles.push(file);
      displayFilePreview(file);
    }
  });
}

function displayFilePreview(file) {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    
    if (file.type.startsWith('image/')) {
      previewItem.innerHTML = `
        <img src="${e.target.result}" alt="Preview">
        <button class="remove-preview" onclick="removeFile('${file.name}')">×</button>
      `;
    } else if (file.type.startsWith('video/')) {
      previewItem.innerHTML = `
        <video src="${e.target.result}"></video>
        <button class="remove-preview" onclick="removeFile('${file.name}')">×</button>
      `;
    }
    
    filePreview.appendChild(previewItem);
  };
  
  reader.readAsDataURL(file);
}

function removeFile(fileName) {
  selectedFiles = selectedFiles.filter(f => f.name !== fileName);
  // Re-render preview
  filePreview.innerHTML = '';
  selectedFiles.forEach(displayFilePreview);
}

// ============== Submit Post ==============
submitPostBtn.addEventListener('click', async () => {
  const content = postContentTextarea.value.trim();
  const category = postCategorySelect.value;
  
  if (!content) {
    alert('Please write something to post!');
    return;
  }
  
  if (category === 'all') {
    alert('Please select a category!');
    return;
  }
  
  submitPostBtn.disabled = true;
  submitPostBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
  
  // Create post object
  const post = {
    id: Date.now(),
    author: username,
    avatar: userAvatar,
    content: content,
    category: category,
    timestamp: new Date().toISOString(),
    likes: 0,
    comments: 0,
    shares: 0,
    media: []
  };
  
  // Handle file uploads (in real app, upload to server)
  if (selectedFiles.length > 0) {
    // For demo, we'll use data URLs
    for (const file of selectedFiles) {
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onload = (e) => {
          post.media.push({
            type: file.type.startsWith('image/') ? 'image' : 'video',
            url: e.target.result
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
  }
  
  // Emit to server
  socket.emit('createPost', post);
  
  // Don't add to local feed - let the server broadcast handle it
  // This prevents duplicate posts
  
  // Reset form
  postContentTextarea.value = '';
  postCategorySelect.value = 'all';
  selectedFiles = [];
  filePreview.innerHTML = '';
  
  // Close modal
  setTimeout(() => {
    postModal.classList.remove('active');
    submitPostBtn.disabled = false;
    submitPostBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publish Post';
  }, 500);
  
  console.log('Post created:', post);
});

// ============== Posts Feed ==============
const postsFeed = document.getElementById('posts-feed');
let allPosts = [];

// Listen for new posts from server
socket.on('newPost', (post) => {
  // Check if post already exists to prevent duplicates
  const exists = allPosts.find(p => p.id === post.id);
  if (exists) return;
  
  allPosts.unshift(post);
  if (currentFilter === 'all' || currentFilter === post.category) {
    addPostToFeed(post, true);
  }
});

// Listen for post updates
socket.on('postUpdated', (updatedPost) => {
  const index = allPosts.findIndex(p => p.id === updatedPost.id);
  if (index !== -1) {
    allPosts[index] = updatedPost;
    updatePostInFeed(updatedPost);
  }
});

function addPostToFeed(post, prepend = true) {
  const postCard = createPostCard(post);
  
  if (prepend) {
    postsFeed.insertBefore(postCard, postsFeed.firstChild);
    // Animate in
    postCard.style.animation = 'slideIn 0.5s ease';
  } else {
    postsFeed.appendChild(postCard);
  }
}

function createPostCard(post) {
  const postCard = document.createElement('div');
  postCard.className = 'post-card';
  postCard.dataset.postId = post.id;
  postCard.dataset.category = post.category;
  
  const timeAgo = getTimeAgo(new Date(post.timestamp));
  
  // Media HTML
  let mediaHTML = '';
  if (post.media && post.media.length > 0) {
    const media = post.media[0]; // Show first media item
    if (media.type === 'image') {
      mediaHTML = `<div class="post-media"><img src="${media.url}" alt="Post image"></div>`;
    } else if (media.type === 'video') {
      mediaHTML = `<div class="post-media"><video src="${media.url}" controls></video></div>`;
    }
  }
  
  postCard.innerHTML = `
    <div class="post-header">
      <img src="${post.avatar}" alt="${post.author}" class="post-avatar">
      <div class="post-author-info">
        <div class="post-author">${post.author}</div>
        <div class="post-meta">
          <span>${timeAgo}</span>
          <span class="post-category">${getCategoryName(post.category)}</span>
        </div>
      </div>
    </div>
    <div class="post-content">${escapeHtml(post.content)}</div>
    ${mediaHTML}
    <div class="post-engagement">
      <button class="engagement-btn like-btn" data-post-id="${post.id}">
        <i class="fas fa-thumbs-up"></i>
        <span>${post.likes || 0}</span>
      </button>
      <button class="engagement-btn comment-btn" data-post-id="${post.id}">
        <i class="fas fa-comment"></i>
        <span>${post.comments || 0}</span>
      </button>
      <button class="engagement-btn share-btn" data-post-id="${post.id}">
        <i class="fas fa-share"></i>
        <span>${post.shares || 0}</span>
      </button>
    </div>
  `;
  
  // Add engagement listeners
  const likeBtn = postCard.querySelector('.like-btn');
  likeBtn.addEventListener('click', () => toggleLike(post.id, likeBtn));
  
  return postCard;
}

function updatePostInFeed(post) {
  const postCard = document.querySelector(`[data-post-id="${post.id}"]`);
  if (postCard) {
    const likeBtn = postCard.querySelector('.like-btn span');
    const commentBtn = postCard.querySelector('.comment-btn span');
    const shareBtn = postCard.querySelector('.share-btn span');
    
    if (likeBtn) likeBtn.textContent = post.likes || 0;
    if (commentBtn) commentBtn.textContent = post.comments || 0;
    if (shareBtn) shareBtn.textContent = post.shares || 0;
  }
}

function toggleLike(postId, btn) {
  const post = allPosts.find(p => p.id === postId);
  if (!post) return;
  
  btn.classList.toggle('active');
  
  if (btn.classList.contains('active')) {
    post.likes = (post.likes || 0) + 1;
  } else {
    post.likes = Math.max(0, (post.likes || 0) - 1);
  }
  
  btn.querySelector('span').textContent = post.likes;
  
  // Emit to server
  socket.emit('updatePost', post);
}

function filterPosts(category) {
  const postCards = document.querySelectorAll('.post-card');
  
  postCards.forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.style.display = 'block';
      card.style.animation = 'fadeIn 0.5s ease';
    } else {
      card.style.display = 'none';
    }
  });
}

// ============== Helper Functions ==============
function getCategoryName(category) {
  const names = {
    javascript: 'JavaScript',
    python: 'Python',
    ruby: 'Ruby',
    php: 'PHP',
    csharp: 'C#',
    java: 'Java',
    general: 'General'
  };
  return names[category] || category;
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + ' years ago';
  
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + ' months ago';
  
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + ' days ago';
  
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + ' hours ago';
  
  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + ' minutes ago';
  
  return 'Just now';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML.replace(/\n/g, '<br>');
}

// ============== Load Sample Posts ==============
function loadSamplePosts() {
  const samplePosts = [
    {
      id: Date.now() - 1000000,
      author: 'Sarah Chen',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=ec4899&color=fff',
      content: 'Just completed my first full-stack MERN project! 🎉 Built a real-time task management app with Socket.IO integration. The learning curve was steep but so worth it!',
      category: 'javascript',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      likes: 42,
      comments: 8,
      shares: 3,
      media: []
    },
    {
      id: Date.now() - 2000000,
      author: 'Mike Johnson',
      avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=10b981&color=fff',
      content: 'Python tip of the day: Use list comprehensions for cleaner code!\n\n# Instead of this:\nsquares = []\nfor i in range(10):\n    squares.append(i**2)\n\n# Do this:\nsquares = [i**2 for i in range(10)]',
      category: 'python',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      likes: 67,
      comments: 12,
      shares: 15,
      media: []
    },
    {
      id: Date.now() - 3000000,
      author: 'Emily Rodriguez',
      avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=f59e0b&color=fff',
      content: 'Looking for feedback on my portfolio website redesign! Would love to hear your thoughts on the UI/UX. Link in comments 👇',
      category: 'general',
      timestamp: new Date(Date.now() - 21600000).toISOString(),
      likes: 34,
      comments: 18,
      shares: 5,
      media: []
    },
    {
      id: Date.now() - 4000000,
      author: 'David Kim',
      avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=8b5cf6&color=fff',
      content: 'Just passed my AWS Solutions Architect certification! 🏆 Studied for 3 months using practice exams and hands-on labs. Happy to answer any questions!',
      category: 'general',
      timestamp: new Date(Date.now() - 28800000).toISOString(),
      likes: 128,
      comments: 24,
      shares: 8,
      media: []
    },
    {
      id: Date.now() - 5000000,
      author: 'Lisa Anderson',
      avatar: 'https://ui-avatars.com/api/?name=Lisa+Anderson&background=ef4444&color=fff',
      content: 'Anyone else working with Java Spring Boot? I\'m building a RESTful API and would love to connect with other Java developers for best practices.',
      category: 'java',
      timestamp: new Date(Date.now() - 43200000).toISOString(),
      likes: 23,
      comments: 15,
      shares: 2,
      media: []
    }
  ];
  
  allPosts = samplePosts;
  samplePosts.forEach(post => addPostToFeed(post, false));
}

// Load sample posts on page load
setTimeout(loadSamplePosts, 1000);

// ============== Animations ==============
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

console.log('🚀 Dashboard loaded for user:', username);
