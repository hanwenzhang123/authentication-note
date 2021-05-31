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
    const hash = await bcrypt.hash(password, 12);
    const user = new User({
        username,
        password: hash
    })
    await user.save();  //save to our database in mongodb
    req.session.user_id = user._id;  //when it works, we will add your id to the session as well
    res.redirect('/') //redirect back to home after signup
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async(req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username })     //{ username: username }
    const validPassword = await bcrypt.compare(password, user.password);    //compare through database
    if (validPassword) {
        req.session.user_id = user._id;     //if successfully login, we will store the user id into the session
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
  



//models/user.js - database schema

const mongoose = require('mongoose');

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

module.exports = mongoose.model('User', userSchema);

  
