// middlewares/auth.js

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(400).json({ message: 'Accès refusé. Aucun token fourni.' });

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Token invalide.' });
  }
};
