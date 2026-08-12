const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referred: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bonusPaid: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Referral', referralSchema);