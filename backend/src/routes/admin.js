const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const Skin = require('../models/Skin');
const adminAuth = require('../middleware/adminAuth');

router.use(adminAuth); // BU QATOR MUHIM — barcha pastdagi route'larni himoyalaydi

router.get('/verify', (req, res) => res.json({ ok: true }));

router.post('/cases', async (req, res) => {
  const cs = await Case.create(req.body);
  res.json(cs);
});
router.delete('/cases/:id', async (req, res) => {
  await Case.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.post('/skins', async (req, res) => {
  const s = await Skin.create(req.body);
  res.json(s);
});
router.delete('/skins/:id', async (req, res) => {
  await Skin.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;