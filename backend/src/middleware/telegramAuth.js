const crypto = require('crypto');
const User = require('../models/User');
const Referral = require('../models/Referral');

function checkTelegramAuth(initData, botToken) {
  if (!initData) return false;

  // 1. initData'ni '&' belgisi bo'yicha bo'lib olamiz (decode qilmasdan)
  const parts = initData.split('&');
  let hash = '';
  const dataCheckArr = [];

  for (const part of parts) {
    const [key, ...valueParts] = part.split('=');
    const value = valueParts.join('=');

    if (key === 'hash') {
      hash = value;
    } else {
      // Decode qilinmagan asl key va value'ni saqlaymiz
      dataCheckArr.push(`${key}=${decodeURIComponent(value)}`);
    }
  }

  if (!hash) return false;

  // 2. Alifbo bo'yicha tartiblaymiz va '\n' bilan biriktiramiz
  dataCheckArr.sort();
  const dataCheckString = dataCheckArr.join('\n');

  // 3. HMAC hisoblash
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  return computedHash === hash;
}

async function telegramAuth(req, res, next) {
  try {
    const initData = req.headers['x-telegram-init-data'];

    if (!initData) return res.status(401).json({ error: 'initData yo‘q' });

    // Telegram InitData Validatsiya
    const isValid = checkTelegramAuth(initData, process.env.BOT_TOKEN);
    if (!isValid) return res.status(401).json({ error: 'Noto‘g‘ri initData' });

    const urlParams = new URLSearchParams(initData);
    const userJson = urlParams.get('user');
    if (!userJson) return res.status(401).json({ error: 'User topilmadi' });
    const tgUser = JSON.parse(userJson);

    // Telegram referal kodni 'start_param' ko'rinishida beradi
    const refCode = urlParams.get('start_param') || req.query.ref || req.body.ref;

    let user = await User.findOne({ telegramId: String(tgUser.id) });

    // Yangi foydalanuvchi kirgan bo'lsa
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