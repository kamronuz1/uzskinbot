const crypto = require('crypto');
const User = require('../models/User');
const Referral = require('../models/Referral');

function checkTelegramAuth(initData, botToken) {
  if (!initData) return false;

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return false;

    // Hash parametrini o'chirib tashlaymiz
    urlParams.delete('hash');

    // Parametrlarni saralaymiz va decodeURIComponent orqali to'g'ri ko'rinishga keltiramiz
    const dataCheckArr = [];
    for (const [key, value] of urlParams.entries()) {
      dataCheckArr.push(`${key}=${value}`);
    }
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    // HMAC SHA256 orqali secret key va hash hisoblaymiz
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    return computedHash === hash;
  } catch (err) {
    console.error('CheckAuth Error:', err);
    return false;
  }
}

async function telegramAuth(req, res, next) {
  try {
    const initData = req.headers['x-telegram-init-data'];

    if (!initData) return res.status(401).json({ error: 'initData yo‘q' });

    // Validatsiya
    const isValid = checkTelegramAuth(initData, process.env.BOT_TOKEN);
    if (!isValid) {
      console.log('Xato initData keldi:', initData); // Backend konsolida ko'rinadi
      return res.status(401).json({ error: 'Noto‘g‘ri initData' });
    }

    const urlParams = new URLSearchParams(initData);
    const userJson = urlParams.get('user');
    if (!userJson) return res.status(401).json({ error: 'User topilmadi' });
    const tgUser = JSON.parse(userJson);

    const refCode = urlParams.get('start_param') || req.query.ref || req.body.ref;

    let user = await User.findOne({ telegramId: String(tgUser.id) });

    if (!user) {
      let referrerUser = null;

      if (refCode) {
        referrerUser = await User.findOne({
          $or: [{ referralCode: refCode }, { telegramId: String(refCode) }]
        });
      }

      const isValidReferrer = referrerUser && referrerUser.telegramId !== String(tgUser.id);
      const referrerId = isValidReferrer ? referrerUser._id : null;

      user = await User.create({
        telegramId: String(tgUser.id),
        username: tgUser.username || '',
        firstName: tgUser.first_name || '',
        avatar: tgUser.photo_url || '',
        referralCode: 'u' + tgUser.id,
        referredBy: referrerId
      });

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