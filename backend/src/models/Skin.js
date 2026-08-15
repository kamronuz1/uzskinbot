const mongoose = require('mongoose');

const skinSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: String,
  rarity: { type: String, enum: ['common','rare','epic','legend','myth'], required: true },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true } // Yangi qo'shildi
}, { timestamps: true });

module.exports = mongoose.model('Skin', skinSchema);