const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user.js");
const {saveRedirectUrl} = require("../middleware.js");

const userController = require("../controllers/users.js");

router.route("/signup")
 .get( userController.renderSignupForm)
 .post(wrapAsync(userController.signup));


router.route("/login")
.get( userController.renderLoginForm)
.post( 
    saveRedirectUrl,
    passport.authenticate("local", {failureRedirect: "/login", 
    failureFlash: true
}),
    userController.Login)


router.get("/logout", userController.Logout);

module.exports = router;
