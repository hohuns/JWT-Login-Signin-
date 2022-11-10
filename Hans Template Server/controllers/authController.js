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
      console.log("hi2");
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

// exports.protect = catchAsync(async (req, res, next) => {
//   // 1) Getting token check it's there
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   if (!token) {
//     return next(
//       new AppError("You are not logged in! Please log in to get access.", 401)
//     );
//   }

//   // 2) Verification token
//   // both are the same
//   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//   // const decoded = jwt.verify(token, process.env.JWT_SECRET);

//   // 3) Check if user still exits
//   const currentUser = await User.findById(decoded.id);
//   if (!currentUser) {
//     return next(
//       new AppError(
//         "The user belonging to this token does no longer exist.",
//         401
//       )
//     );
//   }

//   // 4) Check if user changed password after the token was issued
//   // freshUser.changedPasswordAfter(decoded.iat);
//   if (currentUser.changedPasswordAfter(decoded.iat)) {
//     return next(
//       new AppError("User recently changed Password! Please log in again", 401)
//     );
//   }

//   // Grant access to protected route
//   //Assinging new property to req
//   req.user = currentUser;
//   next();
// });

// //Cannot pass argument in middleware, but we return funtions to manage it
// exports.restrictTo = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new AppError("You do not have permission to perform this action.", 403)
//       );
//     }
//     next();
//   };
// };

// exports.forgotPassword = catchAsync(async (req, res, next) => {
//   // 1) Get user based on POSTed email
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     return next(new AppError("There is no user with email address.", 404));
//   }

//   // 2) Generate the random reset token
//   const resetToken = user.createPasswordResetToken();
//   await user.save({ validateBeforeSave: false });

//   // 3) Send it to user's email
//   const resetURL = `${req.protocol}://${req.get(
//     "host"
//   )}/api/v1/users/resetPassword/${resetToken}`;

//   const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: "Your password reset token (valid for 10 min)",
//       message,
//     });

//     res.status(200).json({
//       status: "success",
//       message: "Token sent to email!",
//     });
//   } catch (err) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });

//     return next(
//       new AppError("There was an error sending the email. Try again later!"),
//       500
//     );
//   }
// });

// exports.resetPassword = catchAsync(async (req, res, next) => {
//   //1) Get user based on the token
//   const hashedToken = crypto
//     .createHash("sha256")
//     .update(req.params.token)
//     .digest("hex");

//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() },
//   });

//   //2) If token has not expired, and there is user, set the new password
//   if (!user) {
//     return next(new AppError("Token is invalid or has expired", 400));
//   }

//   // Check if password is the same or not
//   if (!passwordsMatch(req.body.password, req.body.passwordConfirm)) {
//     return next(
//       new AppError(
//         "The password and confirmation password don't match. Please provide both and check they are the same",
//         401
//       )
//     );
//   }

//   user.password = req.body.password;
//   user.passwordConfirm = req.body.password;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;
//   await user.save();

//   //3) Update chagedPasswordAt property for the current user
//   //using middleware in model schema

//   //4) Log the user in, send the jwt to client
//   createSendToken(user, 200, res);
// });

// exports.updatePassword = catchAsync(async (req, res, next) => {
//   //1) Get user from collection
//   const user = await User.findById(req.user.id).select("+password");

//   //2) Check if posted current password is correct
//   if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
//     return next(new AppError("Your current password is wrong.", 400));
//   }

//   //3) If so, update password
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   await user.save();
//   //User.findByIdAndUpdate will not work

//   //4)Log user in, send JWT
//   createSendToken(user, 200, res);
// });
