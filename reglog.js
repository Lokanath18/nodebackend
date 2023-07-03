const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const cors = require('cors');
const { connectToDatabase, User, Product } = require('./database.js');
const { getUserIdforStorage } = require('./server.js');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors({credentials:true, origin:['http://localhost:4200','http://localhost:3000']}));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));

// Connect to MongoDB
connectToDatabase();


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

passport.deserializeUser((id, done) => {
  User.findById(id) 
  .then((user) =>{
    done(null, user);
  })
  .catch(err=> done(err))
});


app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next)=> {
  console.log(req.user)
  console.log(req.session)
  console.log(req.session.passport)
  return next();
})

//Routes
app.get('/',(req,res)=>{
  console.log(req.user.id)
  res.json({uid:req.user.id})
});


//register route
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
    res.status(200).json({redirect:"/login"});
  }
  catch {
    res.status(500).send('Error registering new user.');
  }
});


//login route
app.post('/login', passport.authenticate('local'), (req, res) => {
  try {
    console.log("EMAIL",req.body.email)
    req.session.user = {
      uid : req.user.id,
      emailId: req.body.email,
    }
    req.session.uid = req.user.id; 
    getUserIdforStorage(req.session);
    res.status(200).json({redirect:"/dashboard"});
  }
  catch {
    res.status(500).send('Error in login');
  }
});

// dashboard route
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.send('Dashboard');
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({redirect:'/login'})
});


// Start the server
const reglog_port = process.env.PORT_REGLOG;
app.listen(reglog_port, function() {
  console.log('Server started on port 3000');
});