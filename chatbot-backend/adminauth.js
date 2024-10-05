// adminAuth.js
module.exports = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(400).json({ message: "Accès refusé. Requiert le rôle d'administrateur." });
    }
    next();
};
