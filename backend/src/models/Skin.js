const mongoose = require('mongoose');

const skinSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: String,
  rarity: { type: String, enum: ['common','rare','epic','legend','myth'], required: true },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Skin', skinSchema);