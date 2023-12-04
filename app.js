const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const { Template } = require("ejs");
const bodyParser = require("body-parser");
const User = require("./models/user.js");
const bcrypt = require("bcrypt");

mongoose.connect("mongodb://127.0.0.1:27017/webapp");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

// middleware to test if authenticated
function isAuthenticated (req, res, next) {
  if (req.session.signeduser) next()
  else next('route')
}

app.get("/home", isAuthenticated, (req, res) => {
  res.render('home')
})
app.get('/login', (req, res) => {
  if (req.session.signeduser) {
    res.render('home')
  } else {
  res.render('log')
}
})
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    // find the user based on the provided email
    const signeduser = await User.findOne({ email })
    if (!signeduser) {
      return res.status(404).json({ message: 'user not found' })
    }
    // compare the provided password with the hashed password in the db
    const passwordMatch = await bcrypt.compare(password, signeduser.password)
    if (!passwordMatch) {
      return res.status(401).json({ message: 'incorrect password' })
    }
    req.session.signeduser = {
      id: signeduser._id,
      firstName: signeduser.firstName,
      lastName: signeduser.lastName,
      email: signeduser.email
      // Add other user details to the session if needed
    }
    res.render('home')
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
app.get('/signup', (req, res) => {
  res.render('signup')
})
app.post('/signup', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword
    })
    console.log(newUser)
    res.render('log')
    res.status(201).json({ message: 'User created successfully', user: newUser });
    
    
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ error: 'Error creating user' });
  }
})

app.listen(3000, (req, res) => {
  console.log('listning to port 3000')
})
