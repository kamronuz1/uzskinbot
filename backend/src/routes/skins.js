const express = require('express');
const router = express.Router();
const Skin = require('../models/Skin');

router.get('/', async (req, res) => {
  const skins = await Skin.find();
  res.json(skins);
});

module.exports = router;