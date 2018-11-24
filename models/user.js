const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  email: String,
  imageURL: String,
  authID: String
});

module.exports = mongoose.model('User', userSchema);
