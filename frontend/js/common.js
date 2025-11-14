const API_BASE = 'http://localhost:3004/api';

const getToken = () => localStorage.getItem('travel_token');
const getUserId = () => localStorage.getItem('travel_userId');
const getUserData = () => {
  const data = localStorage.getItem('travel_user');
  return data ? JSON.parse(data) : null;
};

const setAuth = (token, userId, userData) => {
  localStorage.setItem('travel_token', token);
  localStorage.setItem('travel_userId', userId);
  localStorage.setItem('travel_user', JSON.stringify(userData));
};

const clearAuth = () => {
  localStorage.removeItem('travel_token');
  localStorage.removeItem('travel_userId');
  localStorage.removeItem('travel_user');
};

const isAuthenticated = () => !!getToken();

const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    clearAuth();
    window.location.href = '/app/login.html';
    throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

const showToast = (message, type = 'info') => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full ${
    type === 'success' ? 'bg-green-500' :
    type === 'error' ? 'bg-red-500' :
    type === 'warning' ? 'bg-yellow-500' :
    'bg-blue-500'
  } text-white`;
  toast.textContent = message;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-x-full');
  }, 100);

  setTimeout(() => {
    toast.classList.add('translate-x-full');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

const showLoading = () => {
  const loading = document.createElement('div');
  loading.id = 'global-loading';
  loading.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  loading.innerHTML = `
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-gray-700 dark:text-gray-300">Loading...</p>
    </div>
  `;
  document.body.appendChild(loading);
};

const hideLoading = () => {
  const loading = document.getElementById('global-loading');
  if (loading) loading.remove();
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff + 1;
};

const initDarkMode = () => {
  const isDark = localStorage.getItem('theme') === 'dark';
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
};

const toggleDarkMode = () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

initDarkMode();

const loadTranslations = (lang) => {
  const translations = {
    en: {
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      trips: 'Trips',
      budget: 'Budget',
      settings: 'Settings'
    },
    es: {
      welcome: 'Bienvenido',
      dashboard: 'Panel',
      trips: 'Viajes',
      budget: 'Presupuesto',
      settings: 'Configuración'
    }
  };
  return translations[lang] || translations.en;
};

const getCurrentLanguage = () => localStorage.getItem('language') || 'en';

const setLanguage = (lang) => {
  localStorage.setItem('language', lang);
  window.location.reload();
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
