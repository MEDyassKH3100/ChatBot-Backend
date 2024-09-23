const jwt = require('jsonwebtoken');

function auth(role = null) {
  return (req, res, next) => {
    const token = req.headers['x-auth-token'];
    if (!token) {
      return res.status(400).json({ message: "Accès refusé. Aucun token fourni." });
    }

    try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      req.user = decoded;
      
      // Si un rôle est spécifié, vérifier ce rôle
      if (role && req.user.role !== role) {
        console.log("Role required:", role, "User role:", req.user.role);  // Ajouter pour déboguer
        return res.status(400).json({ message: "Accès refusé. Rôle insuffisant." });
      }


      next();
    } catch (ex) {
      res.status(400).send('Token invalide.');
    }
  };
}

module.exports = auth; // Assurez-vous que c'est ajouté
