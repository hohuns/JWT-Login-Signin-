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
