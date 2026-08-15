import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://uzskinbot-backend.onrender.com/api';

function getInitData() {
  if (window.Telegram?.WebApp?.initData) {
    return window.Telegram.WebApp.initData;
  }

  return 'mock_init_data';
}

// URL manzilidan ?ref=... parametrini o'qib olish
function getRefCode() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref') || null;
}

const client = axios.create({
  baseURL: API_URL
});

client.interceptors.request.use((config) => {
  // Telegram initData sarlavhasini qo'shish
  config.headers['x-telegram-init-data'] = getInitData();

  // Agar URL'da ref parametri bo'lsa, har bir so'rov query'siga ref=... qo'shib yuborish
  const refCode = getRefCode();
  if (refCode) {
    config.params = {
      ...config.params,
      ref: refCode
    };
  }

  return config;
});

export default client;