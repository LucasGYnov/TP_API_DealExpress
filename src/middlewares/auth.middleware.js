const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Vérifiation token JWT
const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Accès refusé. Token manquant." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Token invalide. Utilisateur non trouvé." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token invalide." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expiré." });
    }
    res
      .status(500)
      .json({ message: "Erreur serveur lors de l'authentification." });
  }
};

// Vérification du rôle
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Accès interdit. Rôle insuffisant." });
    }
    next();
  };
};

module.exports = {
  authenticate,
  requireRole,
};
