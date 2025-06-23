const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../../models/user");
const jwt = require("jsonwebtoken");

exports.login = async (req, res, next) => {
  console.log(">>> BODY:", req.body);
  console.log("🟢 Login with:", email, password);

  const { email, password } = req.body;

  try {
    // check validation
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      validationErrors.message = validationErrors.array()[0].msg;
      validationErrors.status = 422;
      throw validationErrors;
    }
    // get user
    const user = await User.findOne({ email: email });
    // check if email is correct
    if (!user) {
      const error = new Error("Email or Password is not correct");
      error.status = 422;
      throw error;
    }
    // encrypt password and check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Email or Password is not correct");
      error.status = 422;
      throw error;
    }
    // Check if user is admin / staff
    if (user.role !== "admin" && user.role !== "staff") {
      const error = new Error("You don't have permission to login this site!");
      error.status = 401;
      throw error;
    }

    // create jwt token to send to client
    const jwt_secret = process.env.JWT_SECRET;
    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      jwt_secret,
      {
        expiresIn: "1h",
      }
    );
    // send token via cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 1000 * 60 * 60,
    });

    res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      message: "Login successfully",
    });
  } catch (error) {
    console.log(error);
    if (!error.status) {
      error.status = 500;
      error.message = "Something went wrong!";
    }
    next(error);
  }
};

exports.adminAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    const error = new Error("Not authenticated, please login1");
    error.status = 401;
    throw error;
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  res.status(200).json({ user: decodedData });
};

exports.logOut = (req, res, next) => {
  return res
    .clearCookie("token", { sameSite: "none", secure: true, httpOnly: true })
    .json({ status: 200, message: "Logout successfully" });
};
