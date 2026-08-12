const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  color: { type: String, default: '#7C5CFC' },
  image: { type: String, default: '' },
  odds: {
    common: { type: Number, default: 0 },
    rare: { type: Number, default: 0 },
    epic: { type: Number, default: 0 },
    legend: { type: Number, default: 0 },
    myth: { type: Number, default: 0 },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);