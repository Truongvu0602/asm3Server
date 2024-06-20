const Product = require("../../models/product");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({});
    if (!products) {
      return res
        .status(404)
        .json({ status: 404, message: "Products not found" });
    }
    res.status(200).json({ products: products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: "Something went wrong" });
  }
};

exports.getProductByNames = async (req, res, next) => {
  const name = req.query.name;
  // console.log(name)
  try {
    const products = await Product.find({
      name: new RegExp(name, "i"),
    });
    res.status(200).json({ products: products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: "Something went wrong" });
  }
};

exports.getProductById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ status: 404, message: "Product not found" });
    }
    res.status(200).json({ product: product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: "Something went wrong" });
  }
};

exports.updateProduct = async (req, res, next) => {
  const id = req.params.id;
  const data = req.body;
  try {
    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    res.status(200).json({ product: product });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Something went wrong, cant update product!",
    });
  }
};

exports.deleteProduct = async (req, res, next) => {
  const id = req.params.id;
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      res.status(404).json({ status: 404, message: "Product not found" });
    }
    res.status(200).json({ product: product });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Something went wrong, cant delete product!",
    });
  }
};

exports.addNewProduct = async (req, res, next) => {
  const data = req.body;
  const images = req.files;
  const serverHost = req.protocol + "://" + req.get("host");
  const imageUrls = images.map((image) => serverHost + "/" + image.path);


  const product = new Product({
    name: data.name,
    description: data.description,
    price: data.price,
    stock: data.stock,
    category: data.category,
    long_desc: data.long_desc,
    short_desc: data.short_desc,
    images: imageUrls,
  });

  try {
    await product.save();
    res.status(201).json({ product: product });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Something went wrong, cant add new product!",
    });
  }
};
