const express = require("express");
const Router = express.Router();

const cartController = require("../../controllers/client/cart");
const auth = require("../../middlewares/auth");

// GET
// POST
Router.post("/edit", auth, cartController.editCartItem);
Router.post("/remove", auth, cartController.removeCartItem);
Router.post("/get-cart", auth, cartController.getCartByUser);

module.exports = Router;
