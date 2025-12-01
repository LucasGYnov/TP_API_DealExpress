const { validationResult } = require("express-validator");
const Deal = require("../models/Deal");
const User = require("../models/User");

// Liste tous les deals en attente
exports.getPendingDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .populate("authorId", "username role");

    res.json(deals);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des deals pending",
    });
  }
};

// Approuver/rejeter deal
exports.moderateDeal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: "Deal non trouvé" });

    deal.status = req.body.status;
    await deal.save();

    res.json({ message: `Deal ${req.body.status}`, deal });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la modération du deal" });
  }
};

// Liste des utilisateurs avec pagination
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const users = await User.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-password")
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.json({ users, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des utilisateurs",
    });
  }
};

// Modifier le rôle d’un utilisateur
exports.updateUserRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    user.role = req.body.role;
    await user.save();

    res.json({ message: `Rôle mis à jour : ${req.body.role}`, user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la mise à jour du rôle" });
  }
};
