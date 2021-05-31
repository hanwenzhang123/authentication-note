https://github.com/kelektiv/node.bcrypt.js

To hash a password:
Technique 1 (generate a salt and hash on separate function calls):

const salt = bcrypt.genSaltSync(saltRounds);
const hash = bcrypt.hashSync(myPlaintextPassword, salt);
// Store hash in your password DB.
Technique 2 (auto-gen a salt and hash):

const hash = bcrypt.hashSync(myPlaintextPassword, saltRounds);
// Store hash in your password DB.


To check a password:
// Load hash from your password DB.
bcrypt.compareSync(myPlaintextPassword, hash); // true
bcrypt.compareSync(someOtherPlaintextPassword, hash); // false



//app.js
const bcrypt = require('bcrypt');

//technique 1
const hashPassword = async(pw) => {
  const salt = await bcrypt.genSalt(10);  //take more time if number is big, salt changes everytime to increase randomness
  const hash = await bcrypt.hash(pw, salt);
}

//technique 2
const hashPassword = async (pw) => {
    //Pass in the plain text password and the number of rounds:
    const hash = await bcrypt.hash(pw, 12); //saltRounds
}

const login = async (pw, hashedPw) => {
    const result = await bcrypt.compare(pw, hashedPw);
    if (result) {
        console.log("LOGGED YOU IN! SUCCESSFUL MATCH!")
    } else {
        console.log("INCORRECT!")
    }
}

hashPassword('monkey');
login('monkey', '$2b$12$YS9GdWUznoM7r1522knuY.1dq1taWra5zgG7N1WzHs4j.fridopWS')
  
