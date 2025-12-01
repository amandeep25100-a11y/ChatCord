// Theme management
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('codexTheme') || 'dark';
document.body.classList.toggle('dark', savedTheme === 'dark');

themeToggle?.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('codexTheme', currentTheme);
});

// DOM Elements
const aiForm = document.getElementById('ai-form');
const aiInput = document.getElementById('ai-input');
const messagesContainer = document.getElementById('ai-messages');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const quickQuestionBtns = document.querySelectorAll('.quick-question-btn');

// Auto-scroll to bottom
function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Add message to chat
function addMessage(text, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message-bubble ${isUser ? 'user' : 'bot'}`;
  
  if (!isUser) {
    const avatar = document.createElement('div');
    avatar.className = 'bot-avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i><span>AI Assistant</span>';
    messageDiv.appendChild(avatar);
  }
  
  // Parse markdown-style code blocks
  const formattedText = formatMessage(text);
  const content = document.createElement('div');
  content.innerHTML = formattedText;
  messageDiv.appendChild(content);
  
  // Insert before typing indicator
  messagesContainer.insertBefore(messageDiv, typingIndicator);
  
  // Highlight code blocks
  if (!isUser) {
    messageDiv.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block);
    });
  }
  
  scrollToBottom();
}

// Format message with code blocks and markdown
function formatMessage(text) {
  // Convert code blocks (```language\ncode\n```)
  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'javascript';
    return `<pre><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>`;
  });
  
  // Convert inline code (`code`)
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Convert bold (**text**)
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convert lists
  text = text.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // Convert line breaks
  text = text.replace(/\n\n/g, '</p><p>');
  text = text.replace(/\n/g, '<br>');
  
  // Wrap in paragraph if not already wrapped
  if (!text.startsWith('<')) {
    text = `<p>${text}</p>`;
  }
  
  return text;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show typing indicator
function showTyping() {
  typingIndicator.classList.add('active');
  scrollToBottom();
}

// Hide typing indicator
function hideTyping() {
  typingIndicator.classList.remove('active');
}

// Send message to AI
async function sendMessage(message) {
  if (!message.trim()) return;
  
  // Add user message
  addMessage(message, true);
  aiInput.value = '';
  
  // Disable input
  sendBtn.disabled = true;
  aiInput.disabled = true;
  showTyping();
  
  try {
    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get response from AI');
    }
    
    const data = await response.json();
    
    hideTyping();
    addMessage(data.response, false);
    
  } catch (error) {
    console.error('Error:', error);
    hideTyping();
    addMessage('Sorry, I encountered an error. Please try again later. 😔', false);
  } finally {
    // Re-enable input
    sendBtn.disabled = false;
    aiInput.disabled = false;
    aiInput.focus();
  }
}

// Handle form submission
aiForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = aiInput.value.trim();
  if (message) {
    sendMessage(message);
  }
});

// Handle quick questions
quickQuestionBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const question = btn.getAttribute('data-question');
    aiInput.value = question;
    sendMessage(question);
  });
});

// Focus input on load
window.addEventListener('load', () => {
  aiInput.focus();
  scrollToBottom();
});

// Handle Enter key (without Shift)
aiInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    aiForm.dispatchEvent(new Event('submit'));
  }
});
