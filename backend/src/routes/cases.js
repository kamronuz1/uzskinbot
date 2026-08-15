const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const telegramAuth = require('../middleware/telegramAuth');
const Case = require('../models/Case');
const Skin = require('../models/Skin');
const Inventory = require('../models/Inventory');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

router.get('/', async (req, res) => {
  const cases = await Case.find({ isActive: true });
  res.json(cases);
});

function pickWeighted(odds) {
  const entries = Object.entries(odds);
  const total = entries.reduce((a, [, v]) => a + (v || 0), 0) || 1;
  const r = Math.random() * total;
  let acc = 0;
  for (const [rarity, pct] of entries) {
    acc += pct || 0;
    if (r <= acc) return rarity;
  }
  return 'common';
}

router.post('/:id/open', telegramAuth, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const cs = await Case.findById(req.params.id).session(session);
    if (!cs || !cs.isActive) throw new Error('Case topilmadi');

    const user = await User.findById(req.user._id).session(session);
    if (user.balance < cs.price) throw new Error('Balans yetarli emas');

    const rarity = pickWeighted(cs.odds);
    
    // O'ZGARISH: Faqat shu keysga tegishli (caseId) va chiqqan rarity'dagi skinlarni qidiramiz
    let pool = await Skin.find({ caseId: cs._id, rarity }).session(session);
    
    // Agar o'sha keysda aynan o'sha rarity'dagi skin topilmasa, shu keysning o'zidan istalgan boshqa skinni olamiz
    if (!pool.length) {
      pool = await Skin.find({ caseId: cs._id }).session(session);
    }
    
    // Agar umuman bu keysga skin biriktirilmagan bo'lsa
    if (!pool.length) throw new Error('Bu keysga skinlar qo‘shilmagan');

    const winner = pool[Math.floor(Math.random() * pool.length)];

    user.balance -= cs.price;
    user.casesOpened += 1;
    await user.save({ session });

    await Transaction.create([{ user: user._id, type: 'case_open', amount: -cs.price, meta: { case: cs.name } }], { session });

    const item = await Inventory.create([{ owner: user._id, skin: winner._id, source: 'case' }], { session });

    await session.commitTransaction();
    res.json({ skin: winner, inventoryItem: item[0], balance: user.balance });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;