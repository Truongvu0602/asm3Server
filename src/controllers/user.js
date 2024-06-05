const { validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res, next) => {
  const { username, password, email, phone, role } = req.body;

  try {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      validationErrors.message = validationErrors.array()[0].msg;
      validationErrors.status = 422;
      throw validationErrors;
    }

    const hasedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      username,
      password: hasedPassword,
      email,
      phone,
      role,
    });
    await newUser.save();
    res
      .status(200)
      .json({ user: newUser, message: "Create user successfully" });
  } catch (error) {
    console.log(error);
    if (!error.status) {
      error.status = 500;
      error.message = "Something went wrong!";
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      validationErrors.message = validationErrors.array()[0].msg;
      validationErrors.status = 422;
      throw validationErrors;
    }
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("Email or Password is not correct");
      error.status = 422;
      throw error;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Email or Password is not correct");
      error.status = 422;
      throw error;
    }

    const jwt_secret = process.env.JWT_SECRET;
    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      jwt_secret,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, { httpOnly: true, sameSite: "Strict", secure: false });
    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
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

// Check user logged in
exports.checkauth = async (req, res, next) => {
  const token = req.cookies.token;
  try {
    if (!token) {
      const error = new Error("Not authenticated");
      error.status = 401;
      throw error;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    res.status(200).json({ user: req.userData });
  } catch (error) {
    console.log(error);
    if (!error.status) {
      error.status = 500;
      error.message = "Something went wrong!";
    }
    next(error);
  }
}

exports.logOut = (req, res, next) => {
  return res.clearCookie("token").json({status: 200, message: "Logout successfully" });
}
