const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const multer = require("multer");
require("dotenv").config();

const app = express();

// ✅ 1. CORS nên đặt NGAY sau khi tạo app
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:3001",
  "https://stalwart-sunburst-1721e0.netlify.app",
  "https://asm3adnodejs.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép request không có origin (như Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("🚫 Blocked CORS for:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },

    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ 2. Middleware cơ bản
app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
// ✅ 3. Static folder
app.use("/images", express.static(path.join(__dirname, "images")));

// ✅ 4. Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "images"),
  filename: (req, file, cb) =>
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    ),
});
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  cb(null, allowed.includes(file.mimetype));
};
app.use(multer({ storage, fileFilter }).array("images", 10));

// ✅ 5. Import routes
const productRoutes = require("./src/routes/client/product");
const userRoutes = require("./src/routes/client/user");
const cartRoutes = require("./src/routes/client/cart");
const orderRoutes = require("./src/routes/client/order");
const adminRoutes = require("./src/routes/admin/index");

// ✅ 6. Use routes
app.use("/admin", adminRoutes);
app.use("/product", productRoutes);
app.use("/user", userRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);

// ✅ 7. Home
app.get("/", (req, res) => res.send("ExpressJS on Deploy!"));

// ✅ 8. 404 Handler
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);

  // ✅ Phải thêm Access-Control-Allow-Origin nếu lỗi xảy ra
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ status, message });
});

module.exports = app;
