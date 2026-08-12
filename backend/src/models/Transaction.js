const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit','withdraw','case_open','sell','buy','daily_bonus','referral_bonus'], required: true },
  amount: { type: Number, required: true },
  meta: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);