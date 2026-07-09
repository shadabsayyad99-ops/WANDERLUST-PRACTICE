const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { isLoggedIn } = require("../middleware");
const ExpressError = require("../utils/ExpressError.js");
const { saveRedirectUrl } = require("../middleware.js");
// const LocalStrategy = require("passport-local").Strategy;
const userController = require("../controllers/users.js");

router.route("/singup")
.get( userController.renderSingUpForm)
.post( wrapAsync(userController.registerUser))


router.route("/login")
.get( userController.rederLoginForm)
.post(
  
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.loginUser,
);

router.get("/logout", userController.logoutUser);



module.exports = router;
