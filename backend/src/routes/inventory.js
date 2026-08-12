const express = require('express');
const router = express.Router();
const telegramAuth = require('../middleware/telegramAuth');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

router.get('/', telegramAuth, async (req, res) => {
  const items = await Inventory.find({ owner: req.user._id, status: 'owned' }).populate('skin');
  res.json(items);
});

router.post('/:id/sell', telegramAuth, async (req, res) => {
  try {
    const item = await Inventory.findOne({ _id: req.params.id, owner: req.user._id, status: 'owned' }).populate('skin');
    if (!item) return res.status(404).json({ error: 'Topilmadi' });

    const sellPrice = +(item.skin.price * 0.9).toFixed(2);
    const user = await User.findById(req.user._id);
    user.balance += sellPrice;
    await user.save();

    item.status = 'sold';
    await item.save();

    await Transaction.create({ user: user._id, type: 'sell', amount: sellPrice, meta: { skin: item.skin.name } });

    res.json({ balance: user.balance });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;