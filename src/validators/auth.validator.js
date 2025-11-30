const { body } = require("express-validator");

const registerValidator = [
  body("username")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username 3-30 chars")
    .isAlphanumeric()
    .withMessage("Username must be alphanumeric"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 chars"),
];

const loginValidator = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").exists().withMessage("Password is required"),
];

module.exports = {
  registerValidator,
  loginValidator,
};
