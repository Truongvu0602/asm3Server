const Order = require("../../models/order");
const Cart = require("../../models/cart");
const Product = require("../../models/product");
const nodemailer = require("nodemailer");

// Price formatter for VND
const priceFormatter = (price) => {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });
  return formatter.format(price);
};

exports.createOrder = async (req, res, next) => {
  const userId = req.userData._id;
  const userCart = req.body.userCart;
  const orderTotalPrice = req.body.orderTotalPrice;
  const address = req.body.address;
  const name = req.body.name;
  const phone = req.body.phone;
  const email = req.body.email;
  // Validate phone and email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^0\d{9,10}$/;

  if (!name || !email || !phone || !address || !userCart || !orderTotalPrice) {
    return res.status(400).json({
      status: 400,
      message: "Thiếu thông tin đơn hàng (tên, email, sđt, địa chỉ...)",
    });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: 400,
      message: "Email không hợp lệ",
    });
  }

  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      status: 400,
      message: "Số điện thoại không hợp lệ (bắt đầu bằng 0, dài 10-11 số)",
    });
  }

  // // Check if all required fields exist
  // if (!userCart || !orderTotalPrice || !address) {
  //   res.status(400).json({
  //     status: 400,
  //     message: "Missing required fields to create order",
  //   });
  // }

  // Decrease stock of products in cart
  userCart.forEach(async (cartItem) => {
    // Check if product is out of stock
    const product = await Product.findById(cartItem.product._id);
    if (Number(product.stock) === 0) {
      res.status(400).json({
        status: 400,
        message: "Product is out of stock",
      });
    }

    if (!product) {
      res.status(404).json({ status: 404, message: "Product not found" });
    }

    // Check if stock is enough for order
    if (Number(product.stock) < cartItem.quantity) {
      res.status(400).json({
        status: 400,
        message: "Product is out of stock",
      });
    }

    if (Number(product.stock) >= cartItem.quantity) {
      product.stock = product.stock - cartItem.quantity;
      await product.save();
    }
  });

  const SENDER_EMAIL = process.env.SENDER_EMAIL;
  const SENDER_PASSWORD = process.env.SENDER_PASSWORD;
  // Create nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: SENDER_EMAIL,
      pass: SENDER_PASSWORD,
    },
  });

  try {
    const newOrder = new Order({
      user: userId,
      cart: userCart,
      totalPrice: orderTotalPrice,
      address: address,
      name,
      phone,
      email,
    });

    if (!newOrder) {
      res.status(400).json({ status: 400, message: "Failed to create order" });
    }
    const newOrderCreated = await newOrder.save();

    // Send email
    let cartRows = "";
    userCart.forEach((item) => {
      cartRows += `
      <tr>
        <td style="border: 1px solid black">${item.product.name}</td>
        <td style="border: 1px solid black">
          <img style="object-fit: contain; width: 80px; height: 80px" src="${
            item.product.images[0]
          }" />
        </td>
        <td style="border: 1px solid black">${priceFormatter(
          item.product.price
        )}</td>
        <td style="border: 1px solid black">${item.quantity}</td>
        <td style="border: 1px solid black">${priceFormatter(
          item.product.price * item.quantity
        )}</td>
      </tr>
    `;
    });

    transporter.sendMail(
      {
        from: SENDER_EMAIL,
        to: "nhocklam281@gmail.com",
        subject: `Order confirmation #${newOrderCreated._id}`,
        html: `<html>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">
        </head>
        <body style="font-family: Roboto;">
          <div>
            <p style=" font-weight: bold.">Xin chào <strong>${name}</strong>, cảm ơn bạn đã mua sắm tại của hàng của chúng tôi.</p>
            <div style="border: 1px solid gray; padding: 10px">
              <p>
                <strong>ID đơn hàng : #${newOrderCreated._id}</strong>
              </p>
              <hr>
              <p style="font-weight:bold; text-align: center">Thông tin người nhận</p>
              <p>Tên người nhận: ${name}</p>
              <p>SĐT: ${phone}</p>
              <p>Địa chỉ: ${address}</p>
              <p>Email: ${email}</p>
              <hr>
              <p style="font-weight:bold; text-align: center">Thông tin đơn hàng </p>
              <table style="min-width: 100%; text-align:center">
                <thead>
                  <tr>
                    <th style="border: 1px solid black">Tên sản phẩm</th>
                    <th style="border: 1px solid black">Hình ảnh</th>
                    <th style="border: 1px solid black">Giá</th>
                    <th style="border: 1px solid black">Số lượng</th>
                    <th style="border: 1px solid black">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${cartRows}
                </tbody>
              </table>
              <hr>
              <div style="text-align: right;margin: 30px">
                  <span><strong>Tổng thanh toán: </strong></span>
                  <span>${priceFormatter(orderTotalPrice)}</span>
              </div>
              <br>
              <strong>Cảm ơn bạn !</strong>
            </div>
          </div>
        </body>
      </html>`,
      },
      (error, info) => {
        if (error) {
          console.log("Error sending email: ", error);
        } else {
          console.log("Email sent: ", info.response);
        }
      }
    );

    // Clear user's cart
    const currentUserCart = await Cart.findOne({ user: userId });
    currentUserCart.products = [];
    currentUserCart.total = 0;
    await currentUserCart.save();

    // Send response
    res.status(200).json({
      status: 200,
      message: "Order created successfully",
      orders: newOrderCreated,
    });
  } catch (error) {
    console.log("createOrder: ", error);
    const resError = new Error("Failed to create order or server error");
    resError.status = 500;
    next(resError);
  }
};

exports.getUserOrders = async (req, res, next) => {
  const userId = req.userData._id;

  try {
    const Orders = await Order.find({ user: userId });
    if (!Orders) {
      return res.status(404).json({ status: 404, message: "Orders not found" });
    }

    res.status(200).json({ status: 200, orders: Orders });
  } catch (error) {
    console.log(error);
    if (!error.status) {
      error.status = 500;
      error.message = "Something went wrong";
    }
    next(error);
  }
};

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
};
