import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getInitData() {
  if (window.Telegram?.WebApp?.initData) {
    return window.Telegram.WebApp.initData;
  }
  return 'mock_init_data'; // localhost'da test uchun vaqtincha
}

const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use((config) => {
  config.headers['x-telegram-init-data'] = getInitData();
  return config;
});

export default client;