//  models/user.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    },
    password: {
        type: String,
        required: [true, 'Password cannot be blank']
    }
})

//statics - we can defind multiple methods that would be added to the model, not the particular instance
userSchema.statics.findAndValidate = async function (username, password) {    //on the userSchema, group the logic that has to do with user model
    const foundUser = await this.findOne({ username });   //find the user
    const isValid = await bcrypt.compare(password, foundUser.password);   //compare the passoword which returns true or false
    return isValid ? foundUser : false;   // if isValid true, we return foundUser, if false, we return false
}

userSchema.pre('save', async function (next) {  //add a middleware to presave
    if (!this.isModified('password')) return next();    //true or false, !this.isModified('password') means the password is the same
    this.password = await bcrypt.hash(this.password, 12);   //update/set the password, this refers to this specific user of his/her password
    next();     //12 salt run takes a while so async and await
})

module.exports = mongoose.model('User', userSchema);



//index.js
const express = require('express');
const app = express();
const User = require('./models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');    //$ npm i express-session

mongoose.connect('mongodb://localhost:27017/loginDemo', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    });

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'notagoodsecret'}));

const requireLogin = (req, res, next) => {      //middleware
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    next();     //call next if logged in
}

app.get('/', (req, res) => {
    res.send('THIS IS THE HOME PAGE')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async(req, res) => {
    const { password, username } = req.body;
    const user = new User({ username, password })   //it will come from req.body
    await user.save();  //save to our database in mongodb
    req.session.user_id = user._id;  //when it works, we will add your id to the session as well
    res.redirect('/') //redirect back to home after signup
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async(req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password);    //findAndValidate in user.js schema file defined
    if (foundUser) {
        req.session.user_id = foundUser._id;     //if successfully login, we will store the user id into the session
        res.redirect('/secret')
    } else {
        res.redirect('/login')
    }
})

app.post('/logout', (req, res) => {
    req.session.user_id = null;     //set it to null
    // req.session.destroy();   //get rid of everything in session
    res.redirect('/login');     //back to login page
})

app.get('/secret', requireLogin, (req, res) => {        //we have the middleware here to require login
    res.render('secret')
})

app.get('/topsecret', requireLogin, (req, res) => {
    res.send("TOP SECRET!!!")
})

app.listen(3000, () => {
    console.log("SERVING YOUR APP ON 3000!")
})
  
