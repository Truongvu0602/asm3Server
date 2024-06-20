const User = require("../../models/user");
const Order = require("../../models/order");

exports.getInfoBoardData = async (req, res, next) => {
  try {
    // Get total users
    const totalUsers = await User.find().countDocuments();
    // Get total price of orders in month
    let totalEarned = 0;

    const currentMonth = new Date().getMonth() + 1;
    Order.find().then((orders) => {
      orders.forEach((order) => {
        if (new Date(order.createdAt).getMonth() + 1 === currentMonth) {
          totalEarned += Number(order.totalPrice);
        }
      });
    });
    // Get total nnumber of orders
    const totalOrders = await Order.find().countDocuments();

    // format price
    const priceFormatter = (price) => {
      const formatter = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      });
      return formatter.format(price);
    };

    res.status(200).json({totalUsers, totalOrders, totalEarned: priceFormatter(totalEarned)});
  } catch (error) {
    console.log(error);
    next(error);
  }
};

