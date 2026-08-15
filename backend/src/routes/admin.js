const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const Skin = require('../models/Skin');
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');

router.use(adminAuth);

router.get('/verify', (req, res) => res.json({ ok: true }));

// --- USERS MANAGEMENT ---
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/ban', async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: !!isBlocked },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/balance', async (req, res) => {
  try {
    const { balance } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { balance },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CASES CRUD ---
router.get('/cases', async (req, res) => {
  try {
    const cases = await Case.find();
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/cases', async (req, res) => {
  try {
    const cs = await Case.create(req.body);
    res.json(cs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/cases/:id', async (req, res) => {
  try {
    const updatedCase = await Case.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/cases/:id', async (req, res) => {
  try {
    await Case.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SKINS CRUD ---
router.get('/skins', async (req, res) => {
  try {
    const skins = await Skin.find();
    res.json(skins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/skins', async (req, res) => {
  try {
    const s = await Skin.create(req.body);
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/skins/:id', async (req, res) => {
  try {
    const updatedSkin = await Skin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedSkin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/skins/:id', async (req, res) => {
  try {
    await Skin.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;