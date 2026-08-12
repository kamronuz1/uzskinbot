const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const telegramAuth = require('../middleware/telegramAuth');
const Listing = require('../models/Listing');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

router.get('/', async (req, res) => {
  const listings = await Listing.find({ status: 'active' }).populate('skin').populate('seller', 'username firstName');
  res.json(listings);
});

router.post('/list', telegramAuth, async (req, res) => {
  const { inventoryItemId, price } = req.body;
  const item = await Inventory.findOne({ _id: inventoryItemId, owner: req.user._id, status: 'owned' });
  if (!item) return res.status(404).json({ error: 'Topilmadi' });

  item.status = 'listed';
  await item.save();

  const listing = await Listing.create({ seller: req.user._id, inventoryItem: item._id, skin: item.skin, price });
  res.json(listing);
});

router.post('/:id/buy', telegramAuth, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const listing = await Listing.findById(req.params.id).session(session);
    if (!listing || listing.status !== 'active') throw new Error('Listing topilmadi');
    if (String(listing.seller) === String(req.user._id)) throw new Error('O‘zingizniki');

    const buyer = await User.findById(req.user._id).session(session);
    if (buyer.balance < listing.price) throw new Error('Balans yetarli emas');

    const seller = await User.findById(listing.seller).session(session);

    buyer.balance -= listing.price;
    seller.balance += listing.price;
    await buyer.save({ session });
    await seller.save({ session });

    const item = await Inventory.findById(listing.inventoryItem).session(session);
    item.owner = buyer._id;
    item.status = 'owned';
    await item.save({ session });

    listing.status = 'sold';
    await listing.save({ session });

    await Transaction.create([
      { user: buyer._id, type: 'buy', amount: -listing.price, meta: { skin: String(listing.skin) } },
      { user: seller._id, type: 'sell', amount: listing.price, meta: { skin: String(listing.skin) } },
    ], { session });

    await session.commitTransaction();
    res.json({ ok: true, balance: buyer.balance });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;