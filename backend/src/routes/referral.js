const express = require('express');
const router = express.Router();
const telegramAuth = require('../middleware/telegramAuth');
const Referral = require('../models/Referral');
const User = require('../models/User');

const REF_BONUS = 0.50;

router.post('/bind', telegramAuth, async (req, res) => {
  const { refCode } = req.body;
  if (!refCode) return res.status(400).json({ error: 'refCode yo‘q' });

  const referrer = await User.findOne({ referralCode: refCode });
  if (!referrer) return res.status(404).json({ error: 'Referrer topilmadi' });
  if (String(referrer._id) === String(req.user._id)) return res.status(400).json({ error: 'O‘z-o‘zini referral qila olmaydi' });

  const user = await User.findById(req.user._id);
  if (user.referredBy) return res.status(400).json({ error: 'Allaqachon bog‘langan' });

  user.referredBy = referrer._id;
  await user.save();

  const ref = await Referral.create({ referrer: referrer._id, referred: user._id });

  referrer.balance += REF_BONUS;
  await referrer.save();
  ref.bonusPaid = true;
  await ref.save();

  res.json({ ok: true });
});

router.get('/stats', telegramAuth, async (req, res) => {
  const refs = await Referral.find({ referrer: req.user._id });
  res.json({
    count: refs.length,
    earned: refs.filter(r => r.bonusPaid).length * REF_BONUS,
    code: req.user.referralCode,
  });
});

module.exports = router;