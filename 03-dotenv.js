//https://www.npmjs.com/package/dotenv
//$ npm i dotenv


As early as possible in your application, require and configure dotenv.
require('dotenv').config()


create a file
touch .env

you can check use
ls -a


//.env
SECRET=Thisisourlittlesecret.

//app.js - if use
process.env.SECRET


//do not for get to add a .gitignore file if upload to GitHub
//https://github.com/github/gitignore/blob/master/Node.gitignore
