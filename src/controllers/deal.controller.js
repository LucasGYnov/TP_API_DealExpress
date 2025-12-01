const { validationResult } = require("express-validator");
const Deal = require("../models/Deal");
const Vote = require("../models/Vote");
const Comment = require("../models/Comment");

// Liste publique des deals approuvés avec pagination
exports.getDeals = async (req, res) => {
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
};

// Détails d’un deal avec auteur, commentaires et votes
exports.getDealById = async (req, res) => {
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
};

// Création d’un deal
exports.createDeal = async (req, res) => {
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
};

// Modification d’un deal (ownership requis si pending)
exports.updateDeal = async (req, res) => {
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
};

// Suppression d’un deal (ownership requis ou admin)
exports.deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: "Deal non trouvé" });

    if (
      deal.authorId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    await deal.remove();
    res.json({ message: "Deal supprimé" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la suppression du deal" });
  }
};

// Voter hot/cold
exports.voteDeal = async (req, res) => {
  try {
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

    const votesHot = await Vote.countDocuments({ dealId, type: "hot" });
    const votesCold = await Vote.countDocuments({ dealId, type: "cold" });

    await Deal.findByIdAndUpdate(dealId, { temperature: votesHot - votesCold });

    res.json({ message: "Vote enregistré", temperature: votesHot - votesCold });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors du vote" });
  }
};

// Retirer son vote
exports.removeVote = async (req, res) => {
  try {
    const vote = await Vote.findOne({
      dealId: req.params.id,
      userId: req.user._id,
    });
    if (!vote) return res.status(404).json({ message: "Vote non trouvé" });

    await vote.remove();

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
};
