const mongoose = require("mongoose");
const Product = require("../../models/product");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      products: products,
    });
  } catch (err) {
    const error = new Error("Error while getting products!");
    error.status = 500;
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  const productID = req.params.id;

  try {
    const product = await Product.findById(productID);
    res.status(200).json({
      product: product,
    });
  } catch (error) {
    console.log(error);
    const err = new Error("Can not find product!");
    err.status = 404;
    next(err);
  }
};

exports.getProductsByCategory = async (req, res, next) => {
  const category = req.params.category;

  try {
    const products = await Product.find({ category: category });

    res.status(200).json({
      products: products,
      status: 200,
    });
  } catch (error) {
    console.log(error);
    const err = new Error("Can not find products or category!");
    err.status = 404;
    next(err);
  }
};
