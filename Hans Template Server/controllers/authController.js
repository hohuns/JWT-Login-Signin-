/* eslint-disable arrow-body-style */
/* eslint-disable no-undef */
//import modules
const { promisify } = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const signToken = (id) => {
  // sign({ id }, 'SECRET', EXPIRY DATE), SECRET SHOULD BE 32 CHAR LONG
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

passwordsMatch = function (password, passwordConfirm) {
  return passwordConfirm === password;
};

const createSendToken = (user, statusCode, res) => {
  try {
    const token = signToken(user._id);
    const cookieOptions = {
      expires: new Date(
        //millisecond
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true, //cookie cannot be accessed in browser
    };

    //When production cookie only works on cookies
    if (process.env.NODE_ENV === "production") {
      cookieOptions.secure = true;
    }

    //remove password from response
    user.password = undefined;

    //Sending cookies to client
    res.cookie("jwt", token, cookieOptions);

    //Logged user in as long as user logged in
    res
      .status(statusCode)
      .json({ status: "success", token, data: { user: user } });
  } catch (err) {
    return res.status(404).json({ status: "fail", message: err });
  }
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
      role: req.body.role,
    });
    createSendToken(newUser, 201, res);
  } catch (err) {
    return res.status(400).json({ status: "fail", err: err });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    //1) Check if email and password exists
    console.log({ email, password });
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password!",
      });
    }

    //2) check if user exits && password is correctPassword
    // adding - means exclude, + include
    const user = await User.findOne({ email }).select("+password");
    console.log(user);

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Your Id and Password are wrong. Please check again.",
      });
    }

    //3) If everything ok, send the token to client
    createSendToken(user, 200, res);
  } catch (err) {
    return res.status(400).json({ status: "fail", err: err });
  }
};




