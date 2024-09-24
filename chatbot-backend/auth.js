// auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Extraction du token de l'en-tête Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer Token

    if (!token) {
        return res.status(400).json({ message: "Accès refusé. Aucun token fourni." });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).json({ message: 'Token invalide.' });
    }
};
