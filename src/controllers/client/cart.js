const { default: mongoose } = require("mongoose");
const Cart = require("../../models/cart");
const User = require("../../models/user");
const Product = require("../../models/product");

exports.editCartItem = async (req, res, next) => {
  const productId = req.body.productId;
  const userId = req.userData._id;
  const quantity = req.body.quantity;

  try {
    // Get user's order
    let userCart = await Cart.findOne({ user: userId })
      .populate("products.product")
      .exec();
    // If not existed, create new Cart.
    if (!userCart) {
      if (quantity > 0) {
        userCart = new Cart({
          user: new mongoose.Types.ObjectId(userId),
          products: [
            {
              product: productId,
              quantity: quantity,
            },
          ],
          total: quantity,
        });
        await userCart.save();
      } else {
        res
          .status(400)
          .json({ status: 400, message: "Quantity must be greater than 0" });
      }
    } else {
      // If order is existed, check if that product is existed
      const existedProduct = userCart.products.findIndex((product) => {
        return product.product._id.toString() === productId;
      });
      // console.log(existedProduct);
      // Product is existed => increase quantity
      if (existedProduct > -1) {
        userCart.products[existedProduct].quantity += quantity;
        if (userCart.products[existedProduct].quantity <= 0) {
          userCart.products.splice(existedProduct, 1);
        } else if (
          userCart.products[existedProduct].quantity > 0 &&
          quantity > 1
        ) {
          userCart.products[existedProduct].quantity = quantity;
        } else if (quantity === 0) {
          userCart.products.splice(existedProduct, 1);
        }
      } else {
        // check if quantity is greater than 0
        if (quantity > 0) {
          // New product => add new product
          userCart.products.push({
            product: productId,
            quantity: quantity,
          });
          userCart.total += quantity;
        } else {
          res.status(400).json({
            status: 400,
            message: "Quantity must be greater than 0",
          });
        }
      }
      // Updated total after changes
      userCart.total = userCart.products.reduce(
        (sum, product) => sum + product.quantity,
        0
      );
      await userCart.save();
    }
    await userCart.save();
    userCart = await Cart.findOne({ user: userId })
      .populate("products.product")
      .exec();
    res.status(200).json({ userCart: userCart, status: 200 });
  } catch (error) {
    console.log(error);
    const err = new Error("Error while editing order item");
    err.status = 500;
    next(err);
  }
};

exports.getCartByUser = async (req, res, next) => {
  const userId = req.body.userId || req.userData._id;
  try {
    // check if user existed
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    let userCart = await Cart.findOne({ user: userId })
      .populate("products.product")
      .exec();
    if (!userCart) {
      res.status(200).json({
        userCart: {
          user: user._id,
          products: [],
          total: 0,
        },
      });
    }
    res.status(200).json({ userCart: userCart });
  } catch (error) {
    console.log(error);
    const err = new Error("Can not get user's order!");
    err.status = 500;
    next(err);
  }
};

exports.removeCartItem = async (req, res, next) => {
  const productId = req.body.productId;
  const userId = req.userData._id;
  try {
    // Get user's order
    const userCart = await Cart.findOne({ user: userId })
      .populate("products.product")
      .exec();
    if (!userCart) {
      return res
        .status(404)
        .json({ status: 404, message: "Cant find user's order !" });
    }

    const itemToRemove = userCart.products.findIndex((product) => {
      return product.product._id.toString() === productId;
    });

    console.log(itemToRemove);

    if (itemToRemove > -1) {
      userCart.products.splice(itemToRemove, 1);
      userCart.total -= userCart.products[itemToRemove].quantity;
      await userCart.save();
      res.status(200).json({ userCart: userCart, status: 200 });
    } else {
      res.status(404).json({ status: 404, message: "Cant find item" });
    }
  } catch (error) {}
};
