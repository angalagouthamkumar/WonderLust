const express = require('express');
const app=express();
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
app.set("view engine" , "ejs");
app.set("views",path.join(__dirname,"views"));


const sessionOptions = {
    secret: "mySecret",
    resave: false,
    saveUninitialized: true
};

app.use(session(sessionOptions));
app.use(flash());

app.get("/register", (req, res) => {
    let  {name} = req.query;
    req.session.name = name;
    req.flash("success", "You have successfully registered!");
    res.redirect("/greet");
});

app.get("/greet", (req, res) => {
    res.locals.messages = req.flash("success");
    res.render("page.ejs", { name: req.session.name });
});

app.listen(4000, () => {
    console.log("server is running");
})