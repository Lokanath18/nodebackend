const mongoose = require('mongoose');

async function connectToDatabase() {
  try {
    await mongoose.connect('mongodb+srv://lokanath:lokanath18@cluster0.vaykngi.mongodb.net/myproductapp', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to the database');
  } catch (error) {
    console.error('An error occurred while connecting to the MongoDB database:', error);
  }
}

//Database of register and login
const User = mongoose.model('User', {
  name: { type: String, required: true },
  email: { type: String, required: true },
  dob: { type: Date, required: true },
  password: { type: String, required: true }
});


//database of product 
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  uid: { type: String },
  flag: { type: Boolean, default: true }
});

const Product = mongoose.model('prds', ProductSchema);



module.exports = { connectToDatabase, User, Product };