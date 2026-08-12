const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const WEBAPP_URL = process.env.WEBAPP_URL || 'https://example.com';

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'SkinBot botiga xush kelibsiz! 🎮\nCase\'lar ochib, noyob skinlarga ega bo‘ling.', {
    reply_markup: {
      inline_keyboard: [[
        { text: '🎁 WebApp ochish', web_app: { url: WEBAPP_URL } }
      ]]
    }
  });
});

console.log('Telegram bot ishga tushdi');

module.exports = bot;