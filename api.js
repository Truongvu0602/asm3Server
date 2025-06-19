const mongoose = require("mongoose");
const app = require("./app");
require("dotenv").config();

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await mongoose.connect(process.env.DB_CONNECT, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("Connected to MongoDB (Vercel)");
  }

  return app(req, res);
};
