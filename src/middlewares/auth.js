const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    next();
  } catch (error) {
    console.log(error);
    res.status(200).json({
      message: "Not authenticated!",
      status: 401
    });
  }
};
module.exports = auth;