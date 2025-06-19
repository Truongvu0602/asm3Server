// index.js
const mongoose = require("mongoose");
const app = require("./app");
const port = 5000;
require("dotenv").config();

const MONGODB_URL = process.env.DB_CONNECT;

mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .then(() => {
    const server = app.listen(port, () =>
      console.log(`Server running on port ${port}`)
    );
    require("./socket").init(server);
  })
  .catch((err) => console.error("Could not connect to MongoDB", err));
