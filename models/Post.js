const mongoose = require('mongoose');


// POST SCHEMA
const PostSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    maxlength: 127,
    required: true
  },
  review: {
    type: String,
    minlength: 63,
    maxlength: 2048,
    required: true
  },
  name: {
    type: String,
    minlength: 3,
    maxlength: 31,
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

// Creating the model then exporting
const Posts = mongoose.model('Posts', PostSchema);
module.exports = Posts;