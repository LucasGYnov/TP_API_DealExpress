// src/validators/deal.validator.js
const { body } = require("express-validator");

const createDealValidator = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Le titre doit contenir entre 5 et 100 caractères"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("La description doit contenir entre 10 et 500 caractères"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Le prix doit être un nombre positif ou zéro"),
  body("originalPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Le prix original doit être un nombre positif ou zéro"),
  body("category")
    .isIn(["High-Tech", "Maison", "Mode", "Loisirs", "Autre"])
    .withMessage("Catégorie invalide"),
];

const updateDealValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Le titre doit contenir entre 5 et 100 caractères"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("La description doit contenir entre 10 et 500 caractères"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Le prix doit être un nombre positif ou zéro"),
  body("originalPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Le prix original doit être un nombre positif ou zéro"),
  body("category")
    .optional()
    .isIn(["High-Tech", "Maison", "Mode", "Loisirs", "Autre"])
    .withMessage("Catégorie invalide"),
];

module.exports = {
  createDealValidator,
  updateDealValidator,
};
