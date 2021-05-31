Hashing functions are functions that map input data of some arbitrary size to fixed-size output values.
1. One-way function which is infeasible to invert
2. Small change in input yields large change in the output 3. Deterministic - same input yields same output
4. Unlikely to find 2 outputs with same value
5.Password Hash Functions are deliberately SLOW

//https://www.npmjs.com/package/md5
//npm install md5

//jshint esversion:6

require('dotenv').config();

const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const md5 = require('md5');

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
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
    })
    newUser.save(function(err){
        if (err) {
            console.log(err);
        } else {
            res.render('secrets');
        }
    })
});  

app.post('/login', function(req, res){ 
    const username = req.body.username;
    const password = md5(req.body.password);

    User.findOne({email: username}, function(err, foundUser){
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render('secrets');
                }
            }
        }
        })
    });

app.listen(3000, function(){
    console.log("Server is running on port 3000");
})
 
