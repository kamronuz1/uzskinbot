const express = require('express');
const router = express.Router();
const telegramAuth = require('../middleware/telegramAuth');
const DailyBonus = require('../models/DailyBonus');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const BONUS_AMOUNT = 0.10;

router.get('/status', telegramAuth, async (req, res) => {
  const last = await DailyBonus.findOne({ user: req.user._id }).sort({ claimedAt: -1 });
  const available = !last || (Date.now() - new Date(last.claimedAt).getTime()) > 24 * 60 * 60 * 1000;
  res.json({ available });
});

router.post('/claim', telegramAuth, async (req, res) => {
  const last = await DailyBonus.findOne({ user: req.user._id }).sort({ claimedAt: -1 });
  const available = !last || (Date.now() - new Date(last.claimedAt).getTime()) > 24 * 60 * 60 * 1000;
  if (!available) return res.status(400).json({ error: 'Bugun allaqachon olingan' });

  const user = await User.findById(req.user._id);
  user.balance += BONUS_AMOUNT;
  await user.save();

  await DailyBonus.create({ user: user._id, amount: BONUS_AMOUNT });
  await Transaction.create({ user: user._id, type: 'daily_bonus', amount: BONUS_AMOUNT });

  res.json({ balance: user.balance });
});

module.exports = router;