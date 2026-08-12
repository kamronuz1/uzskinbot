const mongoose = require('mongoose');

const dailyBonusSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  claimedAt: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('DailyBonus', dailyBonusSchema);