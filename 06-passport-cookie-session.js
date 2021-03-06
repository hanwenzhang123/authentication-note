Using Passport.js to Add Cookies and Sessions

$ npm i passport passport-local passport-local-mongoose express-session

//https://www.npmjs.com/package/express-session

//https://www.passportjs.org/docs/
//https://www.npmjs.com/package/passport-local-mongoose

//https://github.com/jaredhanson/passport-local
//https://github.com/saintedlama/passport-local-mongoose


//jshint esversion:6

require('dotenv').config();

const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static('public')); 
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');  
app.use(session({
    secret:'Our little secret.',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex',true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
  });

userSchema.plugin(passportLocalMongoose);   //pass and salt to user
  
const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function(req, res){ 
    res.render('home');
});  

app.get('/login', function(req, res){ 
    res.render('login');
});  

app.get('/register', function(req, res){ 
    res.render('register');
});  

app.get("/logout", function(req, res){
    req.logout();       //cookie gets deleted when we restart our server, we have to login again.
    res.redirect("/");
});

app.post('/register', function(req, res){ 
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, function(){
                res.redirect('/secrets');       //send cookie
            })
        }
    })
});  

app.get('/secrets', function(req, res){     //cookie remembers the username and password
    if (req.isAuthenticated()) {
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
});

app.post("/login", function(req, res){

    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
  
    req.login(user, function(err){
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/secrets");
        });
      }
    });
  
  });

app.listen(3000, function(){
    console.log("Server is running on port 3000");
});
