const express = require("express");
const router = express.Router();
const user = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js")
const userController = require("../controllers/users.js");

router.route("/signup")
    .get(userController.renderSignup)
    .post( wrapAsync(userController.signup))

router
    .route("/login")
    .get(userController.renderlogin)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login"
    }),
    userController.login
);

router.get("/logout", userController.logout);

module.exports = router;