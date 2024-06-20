const Router = require("express").Router();

const { check } = require("express-validator");

// Admin controllers

const authController = require("../../controllers/admin/authen");
const infoController = require("../../controllers/admin/info");
const orderController = require("../../controllers/admin/order");
const productController = require("../../controllers/admin/product");
const chatController = require("../../controllers/admin/chat");

// Middlewares
const adminAuth = require("../../middlewares/adminAuth");

// GET
Router.get("/authen", authController.adminAuth);
Router.get("/logout", adminAuth, authController.logOut);
Router.get("/info", adminAuth, infoController.getInfoBoardData);
// GET products
Router.get("/products/all", adminAuth, productController.getProducts);
Router.get("/products/byname", adminAuth, productController.getProductByNames);
Router.get("/products/:id", adminAuth, productController.getProductById);
// PATCH products
Router.patch("/products/:id", adminAuth, productController.updateProduct);
// DELETE products
Router.delete("/products/:id", adminAuth, productController.deleteProduct);
// GET order
Router.get("/orderlist", adminAuth, orderController.getOrderList);
Router.get("/orders/:id", adminAuth, orderController.getOrderById);
// GET chat
Router.get("/chat", adminAuth, chatController.getChatRooms);

// POST
Router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .notEmpty()
      .withMessage("Please enter a valid email"),
    check("password")
      .notEmpty()
      .isLength({ min: 6 })
      .withMessage(
        "Please enter your password, password must be at least 6 characters"
      ),
  ],
  authController.login
);
// POST products
Router.post("/products/add-new", adminAuth, productController.addNewProduct);


module.exports = Router;
