const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    if (req.userData.role == "user") {
      res.status(401).json({
        message: "Not authenticated!",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({
      message: "Not authenticated!",
      status: 401,
    });
  }
};
module.exports = auth;
