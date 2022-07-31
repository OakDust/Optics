// IMPORTING
const express = require('express');
const app = express();
const path = require('path');
const favicon = require('serve-favicon');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const Post = require('./models/Post');
require('dotenv').config();


// CONSTS
const PORT = process.env.PORT;

// APP SET
app.set('view engine', 'ejs');

// MIDDLEWARE
// Declaring the staric folder
app.use(express.static(path.join(__dirname, 'public')));
// Getting favicon
app.use(favicon(path.join(__dirname, 'favicon-32x32.png')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
mongoose.set('useCreateIndex', true);


// GETTING THE INDEX PAGE
app.get('/', (req, res) => {
  // Configuring the connection
  const client = new MongoClient(process.env.MONGO_CONNECT, { useUnifiedTopology: true });

  // ALL CONNECTIONS AND SHIT(***)
  async function run() {
    let dbName = process.env.DB_NAME;

    try {
      // Creating the connection
      await client.connect();
      console.log("Log: Client Connection established successfully...");
      const db = client.db(dbName);

      // Select the collection and define all post from current user
      const colStores = await db.collection('Stores').findOne({ id: '602ebc555426c1be2ea498d6' });
      
      // Select the collecton of all CLIENTS reviews***
      // I choose the db then the collection
      // find() returns all the collection in raw
      // toArray() sets info into structered json
      const colReviews = await client.db('Clients').collection('Reviews').find().toArray();

      // PAGEDATA OBJECT
      var pageData = {
        title: process.env.PAGE_TITLE,
        stores: colStores.stores,
        reviews: colReviews
      };

      // Sending index page
      res.status(200).render('pages/main', pageData, (err, data) => {
        if (err) { console.error(err); };
        res.send(data);
      });

    } catch (err) { 
      console.log(err.stack); 
    } finally { await client.close(); }
  };

  // Calling connections
  run().catch(console.dir);
});

// POSTING REVIEWS
app.post('/', async (req, res) => {
  const userReview = new Post({
    email: req.body.email,
    review: req.body.review,
    name: req.body.name
  });

  const client = new MongoClient(process.env.MONGO_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true });

  // Trying to save post
  try {
    let dbName = 'Clients';

    // Configuring new db for clients side
    await client.connect();
    const db = client.db(dbName);

    // Saving review
    const savedReview = await db.collection('Reviews').insertOne(userReview);

    if (!savedReview) {
      res.status(400).send('failed to save post');
    }
    res.status(200).redirect('/');
    await client.close();

  } catch (err) {
    console.error(err);
  };

});

// ABOUT PAGE
app.get('/about', (req, res) => {
  res.status(200).render('pages/about', { title: process.env.PAGE_TITLE }, (err, data) => {
    if (err) {
      console.error(err);
      res.status(404).render('pages/404');
    }

    res.send(data);
  });
})

// CONNECTING TO DB
mongoose.connect(process.env.MONGO_CONNECT, { useUnifiedTopology: true, useNewUrlParser: true }, (err) => {
  if (err) {
    console.error(err);
  }
  console.log('Log: connected to DB');

  // MONGOOSE MIDDLEWARE
  mongoose.set('useCreateIndex', true);


  // Listening the server
  app.listen(PORT, (err) => {
    if (err) {
      console.error(err);
  };
    console.log('Log: server is listening on http://localhost:' + PORT);
  });
  
});


