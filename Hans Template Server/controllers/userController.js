//Importing modules
const User = require("../models/userModel");

//Suppliment function
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

//Callback functions
exports.getAllUser = async (req, res, next) => {
  try {
    console.log(req.user);
    const users = await User.find();

    //Send response
    res.status(200).json({
      status: "success",
      result: users.length,
      data: { users },
    });
  } catch (err) {
    return res.status(400).json({ status: "fail", err: err });
  }
};

// exports.updateMe = catchAsync(async (req, res, next) => {
//   // 1) Create error if user POST password data
//   if (req.body.password || req.body.passwordConfirm) {
//     return next(
//       new AppError(
//         "This route is not for password update. plase use /updateMyPassword"
//       ),
//       400
//     );
//   }

//   // 2) Filter out unwanted fields
//   const filterBody = filterObj(req.body, "name", "email");

//   // 3) Update user document
//   const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
//     new: true,
//     runValidators: true,
//   });
//   res.status(200).json({ status: "success", data: { user: updatedUser } });
// });

// exports.deleteMe = catchAsync(async (req, res, next) => {
//   await User.findByIdAndUpdate(req.user.id, { active: false });
//   res.status(204).json({ status: "success", data: null });
// });

// exports.getUser = (req, res) => {
//   res
//     .status(500)
//     .json({ status: "error", message: "This route is not yet defined" });
// };

// exports.createUser = (req, res) => {
//   res
//     .status(500)
//     .json({ status: "error", message: "This route is not yet defined" });
// };

// exports.updateUser = (req, res) => {
//   res
//     .status(500)
//     .json({ status: "error", message: "This route is not yet defined" });
// };

// exports.deleteUser = (req, res) => {
//   res
//     .status(500)
//     .json({ status: "error", message: "This route is not yet defined" });
// };
