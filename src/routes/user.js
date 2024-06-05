const express = require("express");
const Router = express.Router();
// Controller
const userController = require("../controllers/user");
// Validation
const { body } = require("express-validator");
const User = require("../models/user");
const auth = require("../middlewares/auth");

// POST

// User signup
Router.post(
  "/signup",
  [
    body("username").not().isEmpty().withMessage("Username is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Please provide a valid email")
      .custom(async (value) => {
        // body if email already exists
        const user = await User.findOne({ email: value });
        if (user) {
          throw new Error("Email already exists");
        }
      }),
    body("phone").isMobilePhone().withMessage("Please provide a valid phone number"),
  ],
  userController.signup
);

// User login
Router.post(
  "/login",
  [
    body("email").not().isEmpty().isEmail().withMessage("Email is not valid!"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
  ],
  userController.login
);

// Check user logged in
Router.get("/auth", userController.checkauth);

// User log out
Router.get("/logout",auth ,userController.logOut);

module.exports = Router;
