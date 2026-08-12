const express = require('express');
const router = express.Router();
const telegramAuth = require('../middleware/telegramAuth');

router.get('/me', telegramAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;