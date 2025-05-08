if(process.env.NODE_ENV != "production") {
require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");   // helps to create templates
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

const listingRouter = require("./router/listing.js");
const reviewRouter = require("./router/review.js");
const userRouter = require("./router/user.js");

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);  
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
})

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE");   
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 *1000,
        maxAge: 7 * 24 * 60 * 60 *1000,
        httpOnly: true
    }
}

app.use(session(sessionOptions));
app.use(flash());

// authentication
app.use(passport.initialize());  // Passport.js ko Express app ke middleware ke roop me initialize karta hai.Socho: Ye batata hai ki “Passport ko chalu kar do, taaki wo authentication ka kaam kar sake.”

app.use(passport.session());    // Passport ko sessions ka use karne deta hai — taaki ek baar login karne ke baad user ko baar-baar login na karna pade.

passport.use(new LocalStrategy(User.authenticate()));   //Ye batata hai ki Passport username-password based authentication (local strategy) use karega.User. authenticate() method passport-local-mongoose plugin se aata hai — ye username-password ko verify karta hai.

passport.serializeUser(User.serializeUser());   // Jab user login karta hai, to Passport user ki info ko session me save karta hai.serializeUser ye batata hai ki: “Kaunsi info (usually user.id) ko session me save karna hai.”

passport.deserializeUser(User.deserializeUser());   // Jab session se data nikala jata hai (browser se aane wale har request ke liye), to Passport poore user ko DB se dhoondhne ka kaam karta hai.deserializeUser use karta hai: “Session me jo ID thi, usse DB me actual user object lao.”

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;    // iska use kr rhe h ejs me login aur signup ko show kr ne ke liye kyuki wha pr ham direct req.user ko nhi use skte h isliye locals use krna pad rha h
    next();
})

// app.get("/demouser", (req,res) => {
//     const fakeUser = newUser({
//         email: "rk123@gamil.com",
//         username: "delta-student"
//     })

//     let registerUser = User.register(fakeUser,"helloworld");
//     res.send()
// })

app.use("/listings", listingRouter); // Listings routes
app.use("/listings/:id/reviews", reviewRouter); // Reviews routes, passing the `:id` parameter
app.use("/", userRouter)
// Catch-all route for 404
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// Error handler middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listings/error.ejs", { message });
});

app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});