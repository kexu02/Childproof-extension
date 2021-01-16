require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.set('view engine', 'ejs');

app.use(express.static("Public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//session initial configuration
app.use(session({
    secret: "ssss",
    resave: false,
    saveUninitialized: false
}));

//set up session with passport
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv:admin-Ke:password123!@cluster0.qi4ub.mongodb.net/childproof-extension", {
    useNewUrlParser: true
}, {
    useUnifiedTopology: true
});
mongoose.set('useUnifiedTopology', true);
mongoose.set("useCreateIndex", true);

// create user schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    googleId: String,
    blacklist: [String]
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// homepage
app.get("/", function(req, res) {
    if (req.isAuthenticated()) {
    } else {
        res.render("signIn");
    }
});

// Google oauth
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://localhost:3000/auth/google/childproof",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function(accessToken, refsreshToken, profile, done) {
        User.findOrCreate({
            googleId: profile.id,
            username: profile.emails[0].value
        }, function(err, user) {
            return done(err, user);
        });
    }
));

// Google Sign in
app.get("/auth/google",
    passport.authenticate('google', {
        scope: ["profile", "email"]
    })
);

app.get("/auth/google/childproof",
    passport.authenticate('google', {
        failureRedirect: "/"
    }),
    function(req, res) {
        res.redirect("/:userId");
    });

// connects to webpage
app.listen(process.env.PORT || 3000, function() {

});