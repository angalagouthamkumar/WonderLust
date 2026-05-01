const user = require("../models/user.js");

module.exports.renderSignup = (req,res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
    try{
        const { email, username, password } = req.body;
        const newUser = new user({ email, username });
        registeredUser = await user.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                console.error(err);
                req.flash("error", "Something went wrong");
                return res.redirect("/signup");
            }
            req.flash("success", "Welcome to WonderLust!");
            res.redirect("/listings");
        });
    } catch (error) {
        console.error(error);
        req.flash("error", error.message);
        return res.redirect("/signup");
    }
};

module.exports.renderlogin = (req,res) => {
    res.render("users/login.ejs");
};

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect(res.locals.redirectUrl || "/listings");
};

module.exports.logout = (req, res, next) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
    });
    req.flash("success", "logged out successfully!");
    res.redirect("/listings");
};
