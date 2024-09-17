const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return res
      .status(400)
      .json({ message: "Accès refusé. Aucun token fourni." });
  }

  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    req.user = decoded; 
    console.log("Token décodé et utilisateur identifié :", req.user);  // Log important
    next();
  } catch (ex) {
    console.log("Token invalide :", ex.message);
    res.status(400).json({ message: "Token invalide." });
  }
};
