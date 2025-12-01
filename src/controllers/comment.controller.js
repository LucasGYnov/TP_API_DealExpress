const { validationResult } = require("express-validator");
const Comment = require("../models/Comment");
const Deal = require("../models/Deal");

// Liste commentaires d'un deal
exports.getCommentsByDeal = async (req, res) => {
  try {
    const comments = await Comment.find({ dealId: req.params.dealId })
      .sort({ createdAt: -1 })
      .populate("authorId", "username");

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des commentaires",
    });
  }
};

// Créer commentaire
exports.createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const deal = await Deal.findById(req.params.dealId);
    if (!deal) return res.status(404).json({ message: "Deal non trouvé" });

    const comment = await Comment.create({
      content: req.body.content,
      dealId: deal._id,
      authorId: req.user._id,
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la création du commentaire" });
  }
};

// Modif son propre commentaire
exports.updateComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const comment = await Comment.findById(req.params.id);
    if (!comment)
      return res.status(404).json({ message: "Commentaire non trouvé" });

    if (
      comment.authorId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    comment.content = req.body.content;
    await comment.save();

    res.json({ message: "Commentaire mis à jour", comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la modification du commentaire",
    });
  }
};

// Supprimer son propre commentaire ou par admin
exports.deleteComment = async (req, res) => {
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

    await comment.deleteOne();
    res.json({ message: "Commentaire supprimé" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la suppression du commentaire",
    });
  }
};
