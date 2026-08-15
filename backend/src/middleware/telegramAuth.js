async function telegramAuth(req, res, next) {
  try {
    const initData = req.headers['x-telegram-init-data'];
    
    // BACKEND KONSOLIDA KO'RISH UCHUN:
    console.log("----------------------------------------");
    console.log("Kelgan initData:", initData);
    console.log("BOT_TOKEN mavjudmi:", !!process.env.BOT_TOKEN);

    if (!initData) return res.status(401).json({ error: 'initData yo‘q' });

    const isValid = checkTelegramAuth(initData, process.env.BOT_TOKEN);
    console.log("Validatsiya natijasi (isValid):", isValid);
    console.log("----------------------------------------");

    if (!isValid) return res.status(401).json({ error: 'Noto‘g‘ri initData' });
    
    // ... qolgan kodlar o'zgarmasdan turadi