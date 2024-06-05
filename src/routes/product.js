const express = require("express");
const Router = express.Router();
// Controller
const productController = require("../controllers/product");


// Get all products
Router.get("/all", productController.getProducts);
// Get products by id 
Router.get("/:id", productController.getProductById);
// Get products by category
Router.get("/category/:category", productController.getProductsByCategory);





module.exports = Router;