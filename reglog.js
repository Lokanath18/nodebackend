const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const cors = require('cors');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect('mongodb+srv://lokanath:lokanath18@cluster0.vaykngi.mongodb.net/myreglogin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const User = mongoose.model('User', {
  name: { type: String, required: true },
  email: { type: String, required: true},
  dob: { type: Date, required: true },
  password: { type: String, required: true} 
});

// Configure Passport
const custField={
  usernameField:"email",
  passwordField:"password"
}

const verify = async (email, password, done) => {
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return done(null, false);
    }
    const isValid = await bcrypt.compare(password, user.password);
    console.log(password, user.password, isValid);
    if (isValid) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    console.log(error);
  }
};


const strategy= new LocalStrategy(custField, verify)

passport.use(strategy);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());
app.get((req,res, next)=> {
  console.log(req.user)
  console.log(req.session)
})

// Routes
app.post('/register', async (req, res) => {
  try {
    let hashedPassword= await bcrypt.hash(req.body.password, 10);
    const user = new User({
      name: req.body.name, 
      email: req.body.email,
      dob: req.body.dob,
      password: hashedPassword
    });
    user.save()
    res.status(200).json(message="Registration Successfull");
  }
  catch {
    res.status(500).send('Error registering new user.');
  }
});

app.post('/login', passport.authenticate('local'), (req, res) => {
  try {
    res.status(200).json(message="Login successful");
  }
  catch {
    res.status(500).send('Error in login');
  }
});

// Start the server
app.listen(3000, function() {
  console.log('Server started on port 3000');
});
