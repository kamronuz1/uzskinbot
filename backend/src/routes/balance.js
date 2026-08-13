const express = require('express');
const router = express.Router();
const telegramAuth = require('../middleware/telegramAuth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// DEMO deposit — real to'lov tizimi hali ulanmagan.
// Haqiqiy pul bilan ishga tushirishdan oldin bu yerga to'lov
// provayderi tasdiqlovi (webhook orqali) SHART qo'shilishi kerak,
// aks holda har kim o'ziga xohlagancha balans qo'sha oladi.
router.post('/deposit', telegramAuth, async (req, res) => {
  const amount = parseFloat(req.body.amount);
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Noto'g'ri summa" });
  }

  const user = await User.findById(req.user._id);
  user.balance += amount;
  await user.save();

  await Transaction.create({ user: user._id, type: 'deposit', amount });

  res.json({ balance: user.balance });
});

module.exports = router;