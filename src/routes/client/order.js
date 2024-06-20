const Router = require("express").Router();
const orderController = require("../../controllers/client/order");
const auth = require("../../middlewares/auth");

// POST
Router.post("/", auth, orderController.createOrder);

// GET
Router.get("/", auth, orderController.getUserOrders);
Router.get("/:id", auth, orderController.getOrderById);

module.exports = Router;
