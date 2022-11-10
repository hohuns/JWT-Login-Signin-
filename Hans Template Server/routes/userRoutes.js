/* eslint-disable import/no-unresolved */
/* eslint-disable node/no-missing-require */
//Module import
const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

//Creating subapp for resources
const router = express.Router();

//Route
router.post("/signup", authController.signup);
router.post("/login", authController.login);
// router.post("/forgotPassword", authController.forgotPassword);
// router.patch("/resetPassword/:token", authController.resetPassword);
// router.patch(
//   "/updateMyPassword",
//   authController.protect,
//   authController.updatePassword
// );
// router.patch("/updateMe", authController.protect, userController.updateMe);
// router.delete("/deleteMe", authController.protect, userController.deleteMe);

router.route("/").get(userController.getAllUser);
// .post(userController.createUser);
// router
//   .route(`/:id`)
//   .get(userController.getUser)
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser);

module.exports = router;
