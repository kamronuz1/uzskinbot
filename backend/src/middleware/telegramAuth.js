const crypto = require('crypto');
const User = require('../models/User');
const Referral = require('../models/Referral'); // Referral modelini chaqirib olamiz

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

    // DEV REJIM
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

    // URL parametrlaridan yoki so'rov tanasidan (body) ref kodini olamiz
    const refCode = req.query.ref || req.body.ref;

    let user = await User.findOne({ telegramId: String(tgUser.id) });

    // YANGI FOYDALANUVCHI YARATILAYOTGANDA:
    if (!user) {
      let referrerUser = null;

      if (refCode) {
        // Referral kodi (referralCode) yoki Telegram ID bo'yicha taklif qilganni izlaymiz
        referrerUser = await User.findOne({
          $or: [{ referralCode: refCode }, { telegramId: String(refCode) }]
        });
      }

      // O'z-o'ziga referal bo'lishini oldini olish
      const isValidReferrer = referrerUser && referrerUser.telegramId !== String(tgUser.id);
      const referrerId = isValidReferrer ? referrerUser._id : null;

      user = await User.create({
        telegramId: String(tgUser.id),
        username: tgUser.username || '',
        firstName: tgUser.first_name || '',
        avatar: tgUser.photo_url || '',
        referralCode: 'u' + tgUser.id,
        referredBy: referrerId // referredBy maydoniga ID joylaymiz
      });

      // Referral modeliga ham yozib qo'yamiz
      if (isValidReferrer) {
        await Referral.create({
          referrer: referrerUser._id,
          referred: user._id
        });
      }
    }

    if (user.isBlocked) return res.status(403).json({ error: 'Bloklangan' });

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Auth xatosi', details: err.message });
  }
}

module.exports = telegramAuth;