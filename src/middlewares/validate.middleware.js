const { validationResult } = require("express-validator");
const Deal = require("../models/Deal");
const Comment = require("../models/Comment");

// MiddleWare gestion erreurs de validation express-validator
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

//Middlewarz pour vérifier si l'user est propriétaire d'un deal ou admin
const checkDealOwnership = async (req, res, next) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: "Deal non trouvé" });

    if (
      deal.authorId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    req.deal = deal;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la vérification de l'ownership",
    });
  }
};

//Middleware => vérifier si l'user est propriétaire d'un commentaire ou est un admin
const checkCommentOwnership = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment)
      return res.status(404).json({ message: "Commentaire non trouvé" });

    if (
      comment.authorId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    req.comment = comment;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la vérification de l'ownership",
    });
  }
};

module.exports = {
  validate,
  checkDealOwnership,
  checkCommentOwnership,
};
