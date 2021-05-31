A salt is a random value added to the password before we hash it.
It helps ensure unique hashes and mitigate common attacks

https://www.npmjs.com/package/bcrypt
npm i bcrypt

const bcrypt = require('bcrypt');
const saltRounds = 10;


To hash a password:
Technique 1 (generate a salt and hash on separate function calls):

bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
        // Store hash in your password DB.
    });
});


To check a password:
// Load hash from your password DB.
bcrypt.compare(myPlaintextPassword, hash, function(err, result) {
    // result == true
});


//jshint esversion:6

require('dotenv').config();

const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRound = 10;

const app = express();

app.use(express.static('public')); 
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');  

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
  });
  
const User = new mongoose.model('User', userSchema);

app.get('/', function(req, res){ 
    res.render('home');
});  

app.get('/login', function(req, res){ 
    res.render('login');
});  

app.get('/register', function(req, res){ 
    res.render('register');
});  

app.post('/register', function(req, res){ 

    bcrypt.hash(req.body.password, saltRound, function(err, hash) {
        const newUser = new User({
            email: req.body.username,
            password: hash
        })
        newUser.save(function(err){
            if (err) {
                console.log(err);
            } else {
                res.render('secrets');
            }
        });
    });
});  

app.post('/login', function(req, res){ 
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, function(err, foundUser){
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function(err, result){
                    if (result === true) {
                        res.render('secrets');
                    }
                });
            }
          }
        });
    });

app.listen(3000, function(){
    console.log("Server is running on port 3000");
})
