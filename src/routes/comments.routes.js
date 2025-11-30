const express = require("express");
const { body, validationResult } = require("express-validator");
const { authenticate } = require("../middlewares/auth.middleware");
const Comment = require("../models/Comment");
const Deal = require("../models/Deal");

const router = express.Router();

// GET /api/deals/:dealId/comments
router.get("/deals/:dealId/comments", async (req, res) => {
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
});

// POST /api/deals/:dealId/comments
router.post(
  "/deals/:dealId/comments",
  authenticate,
  body("content").isLength({ min: 3, max: 500 }),
  async (req, res) => {
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
  }
);

// PUT /api/comments/:id
router.put(
  "/comments/:id",
  authenticate,
  body("content").isLength({ min: 3, max: 500 }),
  async (req, res) => {
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
  }
);

// DELETE /api/comments/:id
router.delete("/comments/:id", authenticate, async (req, res) => {
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
});

module.exports = router;
