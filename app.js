if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use('/uploads', express.static('uploads'));



const dbUrl = process.env.ATLASDB_URL;
main()
.then(()=>{
    console.log("connected to DB");
})
.catch(err => console.log(err));

async function main(){
    await mongoose.connect(dbUrl);
  //  await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter : 24*3600,
});

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE", err)
})

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie:{
        expires: Date.now() + 7 *24 *60*60*1000,
        maxAge : 7*24*60*60*1000,
        httpOnly : true,
    }
}



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

//demo user in passport authemtication
// app.get("/demouser", async(req,res)=>{
//     let fakeUser = new User({
//         email : "demo@gmail.com",
//         username : "demouser",
//     });
//   let registeredUser =  await  User.register(fakeUser, "Helloworld");
//   res.send(registeredUser);
// });

//index route
app.use("/listings", listingsRouter);

//reviews
//post route
app.use("/listings/:id/reviews", reviewsRouter);

//user router
app.use("/", userRouter);

// app.get("/testListing", async (req,res)=>{
//     let sampleListing = new Listing({
//         title : "my new villa",
//         description :"By the beach",
//         price : 22000,
//         location : " Catinue,Goa ",
// country : "india",
//     });
//    await sampleListing.save();
//    console.log("sample was saved");
//    res.send("successful testing");
// });



app.all("*", (req,res,next)=>{
    next(new ExpressError(404, "Page not found"));
})

app.use((err,req,res,next) =>{
    let {statusCode = 500, message = "Something went wrong!"}= err;
    res.status(statusCode).render("Errors.ejs", {message});
  //  res.status(statusCode).send(message);
})

const PORT = process.env.PORT || 8088;
const server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please stop the process using it or set PORT to a different value.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
        process.exit(1);
    }
});