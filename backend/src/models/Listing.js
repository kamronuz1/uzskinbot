const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  skin: { type: mongoose.Schema.Types.ObjectId, ref: 'Skin', required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['active','sold','cancelled'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);