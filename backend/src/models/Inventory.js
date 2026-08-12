const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skin: { type: mongoose.Schema.Types.ObjectId, ref: 'Skin', required: true },
  source: { type: String, enum: ['case','market','admin'], default: 'case' },
  status: { type: String, enum: ['owned','listed','sold'], default: 'owned' },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);