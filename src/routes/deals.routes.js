const express = require("express");
const { body, query } = require("express-validator");
const { validationResult } = require("express-validator");
const { authenticate, requireRole } = require("../middlewares/auth.middleware");
const Deal = require("../models/Deal");
const Vote = require("../models/Vote");
//const Comment = require("../models/Comment");

const router = express.Router();

// GET /api/deals
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = { status: "approved" };

    const deals = await Deal.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("authorId", "username role");

    const total = await Deal.countDocuments(filter);

    res.json({ deals, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération des deals" });
  }
});

// GET /api/deals/search?q=mot
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Query manquante" });

    const regex = new RegExp(q, "i");
    const deals = await Deal.find({
      status: "approved",
      $or: [{ title: regex }, { description: regex }],
    }).populate("authorId", "username");

    res.json(deals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la recherche" });
  }
});

// GET /api/deals/:id
router.get("/:id", async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id).populate(
      "authorId",
      "username role"
    );
    if (!deal) return res.status(404).json({ message: "Deal non trouvé" });

    const comments = await Comment.find({ dealId: deal._id })
      .sort({ createdAt: -1 })
      .populate("authorId", "username");

    const votesHot = await Vote.countDocuments({
      dealId: deal._id,
      type: "hot",
    });
    const votesCold = await Vote.countDocuments({
      dealId: deal._id,
      type: "cold",
    });

    res.json({ deal, comments, temperature: votesHot - votesCold });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération du deal" });
  }
});

// POST /api/deals
router.post(
  "/",
  authenticate,
  [
    body("title").isLength({ min: 5, max: 100 }),
    body("description").isLength({ min: 10, max: 500 }),
    body("price").isFloat({ min: 0 }),
    body("originalPrice").optional().isFloat({ min: 0 }),
    body("url").optional().isURL(),
    body("category").isIn(["High-Tech", "Maison", "Mode", "Loisirs", "Autre"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { title, description, price, originalPrice, url, category } =
        req.body;

      const deal = await Deal.create({
        title,
        description,
        price,
        originalPrice,
        url,
        category,
        status: "pending",
        authorId: req.user._id,
      });

      res.status(201).json(deal);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Erreur serveur lors de la création du deal" });
    }
  }
);

// PUT /api/deals/:id
router.put("/:id", authenticate, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: "Deal non trouvé" });

    if (
      deal.authorId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    if (deal.status !== "pending" && req.user.role === "user") {
      return res.status(403).json({
        message: "Impossible de modifier un deal déjà approuvé/rejeté",
      });
    }

    const updates = req.body;
    Object.assign(deal, updates);
    await deal.save();

    res.json(deal);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la modification du deal" });
  }
});

// DELETE /api/deals/:id
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: "Deal non trouvé" });

    if (
      deal.authorId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    await Deal.deleteOne({ _id: deal._id });

    res.json({ message: "Deal supprimé" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la suppression du deal" });
  }
});

// POST /api/deals/:id/vote
router.post(
  "/:id/vote",
  authenticate,
  [body("type").isIn(["hot", "cold"])],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { type } = req.body;
      const dealId = req.params.id;
      const userId = req.user._id;

      let vote = await Vote.findOne({ dealId, userId });

      if (vote) {
        vote.type = type;
        await vote.save();
      } else {
        vote = await Vote.create({ dealId, userId, type });
      }

      // Recalcul temp
      const votesHot = await Vote.countDocuments({ dealId, type: "hot" });
      const votesCold = await Vote.countDocuments({ dealId, type: "cold" });

      await Deal.findByIdAndUpdate(dealId, {
        temperature: votesHot - votesCold,
      });

      res.json({
        message: "Vote enregistré",
        temperature: votesHot - votesCold,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur lors du vote" });
    }
  }
);

// DELETE /api/deals/:id/vote
router.delete("/:id/vote", authenticate, async (req, res) => {
  try {
    const vote = await Vote.findOne({
      dealId: req.params.id,
      userId: req.user._id,
    });
    if (!vote) return res.status(404).json({ message: "Vote non trouvé" });

    await Vote.deleteOne({ _id: vote._id });

    const votesHot = await Vote.countDocuments({
      dealId: req.params.id,
      type: "hot",
    });
    const votesCold = await Vote.countDocuments({
      dealId: req.params.id,
      type: "cold",
    });

    await Deal.findByIdAndUpdate(req.params.id, {
      temperature: votesHot - votesCold,
    });

    res.json({ message: "Vote retiré", temperature: votesHot - votesCold });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors du retrait du vote" });
  }
});

module.exports = router;
