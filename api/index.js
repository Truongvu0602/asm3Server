// Server initialization
const express = require("express");
const app = express();
const port = 5000;
// Declare variables
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const multer = require("multer");
require("dotenv").config();
// Mongoose
const mongoose = require("mongoose");
// Routes imports
const productRoutes = require("../src/routes/client/product");
const userRoutes = require("../src/routes/client/user");
const cartRoutes = require("../src/routes/client/cart");
const adminRoutes = require("../src/routes/admin/index");
const orderRoutes = require("../src/routes/client/order");

// CONSTANTS
const MONGODB_URL = process.env.DB_CONNECT;

// Setting up server
const allowedOrigins = ['https://shop-client-nine.vercel.app', 'https://shopping-admin-five.vercel.app'];

app.use(
  cors({
    origin: function (origin, callback) {
      // Check if the origin is in the allowed list
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  })
);


// Allow cors headers

app.use(cookieParser());
app.use(morgan("short"));
app.use(express.json()); //For server to receive json data.
app.use(express.urlencoded({ extended: true })); //For server to receive form data.


// *** MULTER CONFIG & SETUP ***

// Serve static files /images
app.use("/images", express.static(path.join(__dirname, "images")));

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:./g, "-") + "-" + file.originalname
    );
  },
});
// Multer filter
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
// Multer uploader
const upload = multer({ storage: storage, fileFilter: fileFilter });

app.use(upload.array("images", 10));

// Routes
app.use("/admin", adminRoutes);
app.use("/product", productRoutes);
app.use("/user", userRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);

app.use("/", (req, res, next) => {
  res.send("ExpressJS on Vercel!");
});

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
  .then(() => {
    const server = app.listen(port, () =>
      console.log(`Server running on port ${port}`)
    );
    require("../socket").init(server);
  })
  .catch((err) => console.error("Could not connect to MongoDB", err));

module.exports = app;
