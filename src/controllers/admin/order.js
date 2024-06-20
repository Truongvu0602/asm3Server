const Order = require("../../models/order");

exports.getOrderList = async (req, res, next) => {
  const page = req.query.page || 1;
  const perPage = 5;
  try {
    const total = await Order.countDocuments();
    const orders = await Order.find().skip((page - 1) * perPage).limit(perPage);    
    if(!orders) {
      return res.status(404).json({ status: 404, message: "Orders not found" });
    }
    res.status(200).json({orders: orders, total: total});
  } catch (error) {
    console.log(error);
    next(error);
  }
}

exports.getOrderById = async (req, res, next) => {
  const orderId = req.params.id;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ status: 404, message: "Order not found" });
    }
    res.status(200).json({ status: 200, order: order });
  } catch (error) {
    console.log(error);
    if (!error.status) {
      error.status = 500;
      error.message = "Something went wrong";
    }
    next(error);
  }
}