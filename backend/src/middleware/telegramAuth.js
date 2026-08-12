const crypto = require('crypto');
const User = require('../models/User');

function checkTelegramAuth(initData, botToken) {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');

  const dataCheckArr = [];
  for (const [key, value] of urlParams.entries()) {
    dataCheckArr.push(`${key}=${value}`);
  }
  dataCheckArr.sort();
  const dataCheckString = dataCheckArr.join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  return computedHash === hash;
}

async function telegramAuth(req, res, next) {
  try {
    const initData = req.headers['x-telegram-init-data'];

    // DEV REJIM: localhost'da test qilish uchun (production'da olib tashlanadi)
    if (process.env.NODE_ENV !== 'production' && initData === 'mock_init_data') {
      let user = await User.findOne({ telegramId: 'dev_test_user' });
      if (!user) {
        user = await User.create({
          telegramId: 'dev_test_user',
          username: 'test_user',
          firstName: 'Test',
          balance: 50,
          referralCode: 'devtest',
        });
      }
      req.user = user;
      return next();
    }

    if (!initData) return res.status(401).json({ error: 'initData yo‘q' });

    const isValid = checkTelegramAuth(initData, process.env.BOT_TOKEN);
    if (!isValid) return res.status(401).json({ error: 'Noto‘g‘ri initData' });

    const urlParams = new URLSearchParams(initData);
    const userJson = urlParams.get('user');
    if (!userJson) return res.status(401).json({ error: 'User topilmadi' });
    const tgUser = JSON.parse(userJson);

    let user = await User.findOne({ telegramId: String(tgUser.id) });
    if (!user) {
      user = await User.create({
        telegramId: String(tgUser.id),
        username: tgUser.username || '',
        firstName: tgUser.first_name || '',
        avatar: tgUser.photo_url || '',
        referralCode: 'u' + tgUser.id,
      });
    }
    if (user.isBlocked) return res.status(403).json({ error: 'Bloklangan' });

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Auth xatosi', details: err.message });
  }
}

module.exports = telegramAuth;