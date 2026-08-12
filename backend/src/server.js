const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  process.env.FRONTEND_URL, // production'da Vercel domeni shu yerdan keladi
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB ulandi'))
  .catch((err) => console.log('MongoDB xato:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/skins', require('./routes/skins'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/marketplace', require('./routes/marketplace'));
app.use('/api/daily', require('./routes/daily'));
app.use('/api/referral', require('./routes/referral'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => res.send('SkinBot backend ishlayapti'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${PORT} portda ishlayapti`));

require('./bot/bot');