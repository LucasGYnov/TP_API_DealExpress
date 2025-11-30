const express = require("express");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  registerValidator,
  loginValidator,
} = require("../validators/auth.validator");

const router = express.Router();

// POST /api/auth/register
router.post("/register", registerValidator, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email)
        return res.status(400).json({ message: "Email déjà utilisé" });
      if (existingUser.username === username)
        return res.status(400).json({ message: "Username déjà pris" });
    }

    const user = new User({ username, email, password, role: "user" });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE,
      }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
  }
});

// POST /api/auth/login
router.post("/login", loginValidator, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE,
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Erreur serveur lors de la connexion" });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération du profil" });
  }
});

module.exports = router;
