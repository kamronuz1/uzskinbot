const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const WEBAPP_URL = process.env.WEBAPP_URL;

bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const refCode = match && match[1] ? match[1].trim() : null;

  let webAppUrl = WEBAPP_URL;
  if (refCode && WEBAPP_URL) {
    const separator = WEBAPP_URL.includes('?') ? '&' : '?';
    webAppUrl = `${WEBAPP_URL}${separator}ref=${encodeURIComponent(refCode)}`;
  }

  if (!WEBAPP_URL || WEBAPP_URL === 'https://example.com') {
    console.warn("DIQQAT: .env faylingizda WEBAPP_URL to'g'ri ko'rsatilmagan!");
  }

  const welcomeText = `SkinBot botiga xush kelibsiz! 🎮\nCase'lar ochib, noyob skinlarga ega bo'ling.${
    refCode ? '\n\nSiz referal havola orqali kirdingiz!' : ''
  }`;

  bot.sendMessage(chatId, welcomeText, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🎁 WebApp ochish',
            web_app: { url: webAppUrl }
          }
        ]
      ]
    }
  });
});

console.log('Telegram bot muvaffaqiyatli ishga tushdi');

module.exports = bot;