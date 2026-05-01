if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const user = require("./models/user.js");


const cors = require('cors');
app.use(cors()); 

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

 // const dburl = "mongodb://127.0.0.1:27017/WonderLust";  (local DB)
 const dburl = process.env.ATLASDB_URL;

main().then(() =>{
    console.log("connected to db");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dburl);
}
app.set("view engine" , "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: {
        secret: "mySecret"
    },
    touchAfter: 24 * 3600,
});

store.on("error",()=>{
    console.log("session store error",err);
});

const sessionOptions = {
    store,
    secret: "mySecret",
    resave: false,
    saveUninitialized: true,
    cookie : {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true // 7 days
    },
};


// app.get("/",(req,res) => {
//     res.send("root");
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});
passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

// app.get("/register", async (req, res) => {
//     let fakeuser = new user ({
//         email: "goutham@gmail",
//         username: "goutham"
//     })

//     let registereduser = await user.register(fakeuser,"goutham");
//     res.send(registereduser);
// });

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

//page not found
// Note: No quotes. This is a pure Regular Expression.
app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// middleware for price server error
app.use((err, req, res, next)=>{
    let {statusCode = 500, message = "somenthing went wrong"} = err;
    //console.log(err);
    res.status(statusCode).render("error.ejs",{ message })
    // res.status(statusCode).send(message);
});

app.listen(3000, () =>{
    console.log("working");
});