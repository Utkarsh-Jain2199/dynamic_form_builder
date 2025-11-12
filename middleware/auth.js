const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || 
                req.headers['x-admin-token'] ||
                req.query.token;
  const adminToken = process.env.ADMIN_TOKEN || 'admin-secret-token-change-this';

  if (!token) return res.status(401).json({ error: 'No token provided' });
  if (token !== adminToken) return res.status(403).json({ error: 'Invalid token' });

  req.admin = true;
  next();
};

module.exports = { authenticateAdmin };

