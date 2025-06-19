const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const multer = require("multer");
require("dotenv").config();

const app = express();

// CORS setup
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
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

// Middleware
app.use(cookieParser());
app.use(morgan("short"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/images", express.static(path.join(__dirname, "images")));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "images"),
  filename: (req, file, cb) =>
    cb(
      null,
      new Date().toISOString().replace(/:./g, "-") + "-" + file.originalname
    ),
});
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  cb(null, allowed.includes(file.mimetype));
};
app.use(multer({ storage, fileFilter }).array("images", 10));

// Routes
const productRoutes = require("./src/routes/client/product");
const userRoutes = require("./src/routes/client/user");
const cartRoutes = require("./src/routes/client/cart");
const orderRoutes = require("./src/routes/client/order");
const adminRoutes = require("./src/routes/admin/index");

app.use("/admin", adminRoutes);
app.use("/product", productRoutes);
app.use("/user", userRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);

app.get("/", (req, res) => res.send("ExpressJS on Deploy!"));

// 404 handler
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

// Error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  console.error(err.stack);
  res.status(status).json({ status, message });
});

module.exports = app;
