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

const client = axios.create({
  baseURL: API_URL
});

client.interceptors.request.use((config) => {
  config.headers['x-telegram-init-data'] = getInitData();
  return config;
});

export default client;