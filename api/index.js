// Server initialization
const express = require("express");
const app = express();
const port = 5000;
// Declare variables
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
// Mongoose
const mongoose = require("mongoose");
// Routes imports
const productRoutes = require("../src/routes/product");
const userRoutes = require("../src/routes/user");
const cartRoutes = require("../src/routes/cart");

// CONSTANTS
const MONGODB_URL = process.env.DB_CONNECT;


// Setting up server
app.use(cors({
  origin: 'https://shop-client-nine.vercel.app', // Địa chỉ frontend
  credentials: true, // Cho phép gửi cookie
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],

}));
// Allow cors headers

app.use(cookieParser());
app.use(morgan("short"));
app.use(express.json()); //For server to receive json data.
app.use(express.urlencoded({ extended: true })); //For server to receive form data.

// Routes
app.use("/product", productRoutes);
app.use("/user", userRoutes);
app.use("/cart", cartRoutes);

app.use("/", (req, res, next) => {
  res.send("ExpressJS on Vercel!")
})

// 404
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

// Error handling
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong";
  console.error(err.stack);
  console.log(errorStatus, errorMessage);
  res.status(errorStatus).json({
    status: errorStatus,
    message: errorMessage,
  });
});

// Connect to MongoDB + start server
mongoose
  .connect(`${MONGODB_URL}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .then(() =>
    app.listen(port, () => console.log(`Server running on port ${port}`))
  )
  .catch((err) => console.error("Could not connect to MongoDB", err));

module.exports = app;
