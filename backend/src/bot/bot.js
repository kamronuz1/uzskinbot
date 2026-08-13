const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://example.com';

// /start CODE — referral kodi bilan kirgan bo'lsa, uni WebApp linkiga qo'shib yuboramiz
bot.onText(/\/start(?:\s+(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const refCode = match && match[1] ? match[1].trim() : null;

  const webAppUrl = refCode
    ? `${WEBAPP_URL}?ref=${encodeURIComponent(refCode)}`
    : WEBAPP_URL;

  bot.sendMessage(chatId, 'SkinBot botiga xush kelibsiz! 🎮\nCase\'lar ochib, noyob skinlarga ega bo‘ling.', {
    reply_markup: {
      inline_keyboard: [[
        { text: '🎁 WebApp ochish', web_app: { url: webAppUrl } }
      ]]
    }
  });
});

console.log('Telegram bot ishga tushdi');

module.exports = bot;