// Marketplace JavaScript
const socket = io();

// Get user info
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username') || localStorage.getItem('username') || 'Guest';

// User balance and premium status
let userBalance = parseInt(localStorage.getItem('diamondBalance')) || 0;
let isPremium = localStorage.getItem('isPremium') === 'true';
let premiumExpiry = localStorage.getItem('premiumExpiry');

// Update UI
document.getElementById('diamond-balance').textContent = userBalance;

// Check premium status
if (isPremium && premiumExpiry) {
  const expiryDate = new Date(premiumExpiry);
  if (expiryDate > new Date()) {
    showPremiumBadge();
  } else {
    // Premium expired
    isPremium = false;
    localStorage.removeItem('isPremium');
    localStorage.removeItem('premiumExpiry');
  }
}

function showPremiumBadge() {
  document.getElementById('premium-status').innerHTML = `
    <div class="premium-badge">
      <i class="fas fa-crown"></i>
      Premium
    </div>
  `;
}

// Sample resources data
const resources = [
  // Courses
  {
    id: 1,
    type: 'courses',
    title: 'Complete JavaScript Masterclass 2024',
    author: 'John Anderson',
    description: 'Master JavaScript from basics to advanced concepts. Includes ES6+, async programming, and real-world projects.',
    rating: 4.8,
    students: 15234,
    price: 150,
    icon: 'fab fa-js-square',
    isPremium: true,
    thumbnail: '#f7df1e'
  },
  {
    id: 2,
    type: 'courses',
    title: 'Python for Data Science & ML',
    author: 'Sarah Chen',
    description: 'Learn Python, NumPy, Pandas, and machine learning algorithms with hands-on projects.',
    rating: 4.9,
    students: 23451,
    price: 200,
    icon: 'fab fa-python',
    isPremium: true,
    thumbnail: '#3776ab'
  },
  {
    id: 3,
    type: 'courses',
    title: 'React & Next.js - The Complete Guide',
    author: 'Mike Johnson',
    description: 'Build modern web applications with React 18, Next.js 14, and TypeScript.',
    rating: 4.7,
    students: 18932,
    price: 180,
    icon: 'fab fa-react',
    isPremium: true,
    thumbnail: '#61dafb'
  },
  
  // E-Books
  {
    id: 4,
    type: 'ebooks',
    title: 'Clean Code: A Handbook',
    author: 'Robert C. Martin',
    description: 'Essential reading for any developer who wants to write better code and build better applications.',
    rating: 4.9,
    students: 45678,
    price: 50,
    icon: 'fas fa-book-open',
    isPremium: false,
    thumbnail: '#10b981'
  },
  {
    id: 5,
    type: 'ebooks',
    title: 'Design Patterns Explained',
    author: 'Gang of Four',
    description: 'Comprehensive guide to software design patterns with real-world examples.',
    rating: 4.8,
    students: 32145,
    price: 60,
    icon: 'fas fa-book',
    isPremium: false,
    thumbnail: '#8b5cf6'
  },
  {
    id: 6,
    type: 'ebooks',
    title: 'Algorithm Design Manual',
    author: 'Steven Skiena',
    description: 'Master algorithms and data structures for coding interviews and competitive programming.',
    rating: 4.9,
    students: 28901,
    price: 70,
    icon: 'fas fa-book',
    isPremium: true,
    thumbnail: '#f59e0b'
  },

  // Videos
  {
    id: 7,
    type: 'videos',
    title: 'Docker & Kubernetes Crash Course',
    author: 'DevOps Academy',
    description: '5-hour comprehensive tutorial on containerization and orchestration.',
    rating: 4.7,
    students: 12456,
    price: 80,
    icon: 'fab fa-docker',
    isPremium: false,
    thumbnail: '#0db7ed'
  },
  {
    id: 8,
    type: 'videos',
    title: 'AWS Certified Solutions Architect',
    author: 'Cloud Masters',
    description: 'Complete video series to prepare for AWS certification exam.',
    rating: 4.8,
    students: 19823,
    price: 120,
    icon: 'fab fa-aws',
    isPremium: true,
    thumbnail: '#ff9900'
  },
  {
    id: 9,
    type: 'videos',
    title: 'GraphQL & Apollo Tutorial Series',
    author: 'Modern Web Dev',
    description: 'Learn GraphQL from scratch and build production-ready APIs.',
    rating: 4.6,
    students: 8934,
    price: 90,
    icon: 'fas fa-project-diagram',
    isPremium: false,
    thumbnail: '#e10098'
  },

  // Templates
  {
    id: 10,
    type: 'templates',
    title: 'React Admin Dashboard Template',
    author: 'UI Masters',
    description: 'Production-ready admin dashboard with 50+ components and dark mode.',
    rating: 4.8,
    students: 5643,
    price: 100,
    icon: 'fas fa-laptop-code',
    isPremium: false,
    thumbnail: '#60a5fa'
  },
  {
    id: 11,
    type: 'templates',
    title: 'E-commerce Store Starter Kit',
    author: 'WebDev Pro',
    description: 'Full-stack e-commerce template with payment integration and admin panel.',
    rating: 4.9,
    students: 7821,
    price: 150,
    icon: 'fas fa-shopping-cart',
    isPremium: true,
    thumbnail: '#8b5cf6'
  },
  {
    id: 12,
    type: 'templates',
    title: 'SaaS Landing Page Bundle',
    author: 'Design Studio',
    description: '10 modern landing page templates optimized for conversions.',
    rating: 4.7,
    students: 4532,
    price: 80,
    icon: 'fas fa-paint-brush',
    isPremium: false,
    thumbnail: '#f59e0b'
  },

  // Tools
  {
    id: 13,
    type: 'tools',
    title: 'Code Snippet Manager Pro',
    author: 'DevTools Inc',
    description: 'Organize and share code snippets across your team with cloud sync.',
    rating: 4.6,
    students: 3421,
    price: 40,
    icon: 'fas fa-code',
    isPremium: false,
    thumbnail: '#10b981'
  },
  {
    id: 14,
    type: 'tools',
    title: 'API Testing Suite',
    author: 'QA Masters',
    description: 'Comprehensive API testing tool with automated test generation.',
    rating: 4.8,
    students: 6789,
    price: 120,
    icon: 'fas fa-vial',
    isPremium: true,
    thumbnail: '#ef4444'
  },
  {
    id: 15,
    type: 'tools',
    title: 'Database Designer Visual Tool',
    author: 'DB Tools',
    description: 'Design and visualize database schemas with ER diagrams and SQL export.',
    rating: 4.7,
    students: 5234,
    price: 90,
    icon: 'fas fa-database',
    isPremium: false,
    thumbnail: '#0ea5e9'
  }
];

let currentCategory = 'all';

// Load resources
function loadResources(category = 'all') {
  const grid = document.getElementById('resources-grid');
  const filtered = category === 'all' 
    ? resources 
    : resources.filter(r => r.type === category);

  grid.innerHTML = filtered.map(resource => createResourceCard(resource)).join('');
}

function createResourceCard(resource) {
  const canAccess = isPremium || !resource.isPremium;
  
  return `
    <div class="resource-card" data-id="${resource.id}">
      <div class="resource-thumbnail" style="background: ${resource.thumbnail};">
        <i class="${resource.icon}"></i>
        ${resource.isPremium ? '<div class="resource-premium-badge"><i class="fas fa-crown"></i> Premium</div>' : ''}
      </div>
      <div class="resource-info">
        <div class="resource-title">${resource.title}</div>
        <div class="resource-author"><i class="fas fa-user"></i> ${resource.author}</div>
        <div class="resource-description">${resource.description}</div>
        
        <div class="resource-meta">
          <div class="resource-rating">
            <i class="fas fa-star"></i>
            <span>${resource.rating}</span>
          </div>
          <div class="resource-students">
            <i class="fas fa-users"></i> ${formatNumber(resource.students)} students
          </div>
        </div>

        <div class="resource-price">
          <div class="price-tag">
            <i class="fas fa-gem" style="color: #60a5fa;"></i>
            ${resource.price}
          </div>
          <button class="buy-btn" onclick="purchaseResource(${resource.id})" ${!canAccess ? 'disabled' : ''}>
            ${canAccess ? '<i class="fas fa-shopping-cart"></i> Buy' : '<i class="fas fa-lock"></i> Premium'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

// Category filtering
document.querySelectorAll('.category-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    currentCategory = tab.dataset.category;
    loadResources(currentCategory);
  });
});

// Purchase resource
function purchaseResource(resourceId) {
  const resource = resources.find(r => r.id === resourceId);
  if (!resource) return;

  if (isPremium) {
    alert(`✅ Success! You have access to "${resource.title}" with your Premium subscription.`);
    return;
  }

  if (userBalance >= resource.price) {
    const confirm = window.confirm(
      `Purchase "${resource.title}" for ${resource.price} diamonds?\n\nYour balance: ${userBalance} diamonds`
    );

    if (confirm) {
      userBalance -= resource.price;
      localStorage.setItem('diamondBalance', userBalance);
      document.getElementById('diamond-balance').textContent = userBalance;

      // Save purchased items
      const purchased = JSON.parse(localStorage.getItem('purchasedResources') || '[]');
      purchased.push(resourceId);
      localStorage.setItem('purchasedResources', JSON.stringify(purchased));

      alert(`🎉 Success! You now have access to "${resource.title}"!`);
    }
  } else {
    const needed = resource.price - userBalance;
    const confirm = window.confirm(
      `Insufficient diamonds!\n\nYou need ${needed} more diamonds.\n\nWould you like to buy more diamonds?`
    );
    
    if (confirm) {
      openBuyDiamondsModal();
    }
  }
}

// Buy Diamonds Modal
const buyDiamondsBtn = document.getElementById('buy-diamonds-btn');
const buyDiamondsModal = document.getElementById('buy-diamonds-modal');
const closeDiamondsModal = document.getElementById('close-diamonds-modal');
const confirmPurchaseBtn = document.getElementById('confirm-purchase-btn');

let selectedPackage = null;

buyDiamondsBtn.addEventListener('click', openBuyDiamondsModal);
closeDiamondsModal.addEventListener('click', closeBuyDiamondsModal);

function openBuyDiamondsModal() {
  buyDiamondsModal.classList.add('active');
}

function closeBuyDiamondsModal() {
  buyDiamondsModal.classList.remove('active');
  selectedPackage = null;
  document.querySelectorAll('.diamond-package').forEach(p => p.classList.remove('selected'));
  confirmPurchaseBtn.disabled = true;
  confirmPurchaseBtn.textContent = 'Select a Package';
}

buyDiamondsModal.addEventListener('click', (e) => {
  if (e.target === buyDiamondsModal) {
    closeBuyDiamondsModal();
  }
});

// Select diamond package
document.querySelectorAll('.diamond-package').forEach(pkg => {
  pkg.addEventListener('click', () => {
    document.querySelectorAll('.diamond-package').forEach(p => p.classList.remove('selected'));
    pkg.classList.add('selected');
    
    selectedPackage = {
      amount: parseInt(pkg.dataset.amount),
      price: parseFloat(pkg.dataset.price)
    };

    confirmPurchaseBtn.disabled = false;
    confirmPurchaseBtn.innerHTML = `<i class="fas fa-credit-card"></i> Pay $${selectedPackage.price}`;
  });
});

// Confirm diamond purchase
confirmPurchaseBtn.addEventListener('click', () => {
  if (!selectedPackage) return;

  // Simulate payment (in production, integrate with Stripe/PayPal)
  const confirm = window.confirm(
    `Purchase ${selectedPackage.amount} diamonds for $${selectedPackage.price}?\n\n(Demo: This will add diamonds to your account)`
  );

  if (confirm) {
    userBalance += selectedPackage.amount;
    localStorage.setItem('diamondBalance', userBalance);
    document.getElementById('diamond-balance').textContent = userBalance;

    alert(`🎉 Success! ${selectedPackage.amount} diamonds added to your account!`);
    closeBuyDiamondsModal();
  }
});

// Premium subscription
document.querySelectorAll('.premium-card').forEach(card => {
  const subscribeBtn = card.querySelector('button');
  const plan = card.dataset.plan;

  subscribeBtn.addEventListener('click', () => {
    const prices = {
      monthly: 9.99,
      yearly: 59.99
    };

    const confirm = window.confirm(
      `Subscribe to ChatCord Premium (${plan})?\n\nPrice: $${prices[plan]}${plan === 'monthly' ? '/month' : '/year'}\n\n(Demo: This will activate Premium for your account)`
    );

    if (confirm) {
      isPremium = true;
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + (plan === 'monthly' ? 1 : 12));

      localStorage.setItem('isPremium', 'true');
      localStorage.setItem('premiumExpiry', expiry.toISOString());

      showPremiumBadge();
      loadResources(currentCategory);

      alert(`🎉 Welcome to Premium!\n\nYou now have unlimited access to all resources until ${expiry.toLocaleDateString()}`);
    }
  });
});

// Initial load
loadResources();

console.log('💎 Marketplace loaded - Balance:', userBalance, 'Premium:', isPremium);
