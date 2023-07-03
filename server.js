const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const { connectToDatabase, User, Product } = require('./database.js');
require('dotenv').config();

app.use(cors());
app.use(express.json());

//getting user id 
let userId;
function getUserIdforStorage(sessionUser) {
  userId = sessionUser.uid; 
}

//connect to MongoDb
connectToDatabase();

// Get all products
app.get('/user/getAll', async (req, res) => {
  console.log('Server Requested')
  try {
    Product.find({flag: 'true', uid: userId})
    .then((products) => {
      res.status(201).json(products);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('An error occurred while querying the database.');
    });
  } 
  catch (error) {
  console.log(error)
}
});


// Create a new product
app.post('/user/create', (req, res) => {
  const product = new Product(req.body);
  product.uid = userId;
  product.save()
  .then((data) => {
    console.log('coming')
    res.status(201).json(data);
  }, (err) => {
      console.log(err);
      res.status(500).send('An error occurred while saving the product to the database.');
  })
});

//delete a product
// app.delete('/user/delete/:itemId', (req, res) => {
//   const itemId= req.params.itemId;
//   Product.findOneAndDelete({'_id':itemId})
//   .then((data) => {
//     console.log('deleted in server')
//     res.send(204)
//   }, (err) => {
//       console.log(err);
//       res.status(500).send('An error occurred while deleting the product to the database.');  
//   })
// })

//updating flag=false to indicate deleted from database(actually in database its not deleted)
app.put('/user/update/:itemId', (req, res) => {
  const itemId = req.params.itemId;
  Product.findByIdAndUpdate(itemId, {flag: 'false'})
    .then(() => {
      console.log('updated in server');
      res.sendStatus(204);
    }, (err) => {
      console.log(err);
      res.status(500).send('An error occurred while updating the product in the database.');
    })
})


// Start the server
const server_port = process.env.PORT_SERVER;
app.listen(server_port, () => {
  console.log('Server is running on port 8000');
});


//exporting to store user id in product details
module.exports = {
  getUserIdforStorage
};