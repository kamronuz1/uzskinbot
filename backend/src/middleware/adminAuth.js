function adminAuth(req, res, next) {
  const secret = req.headers['x-admin-secret'];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Admin ruxsati yo‘q' });
  }
  next();
}

module.exports = adminAuth;