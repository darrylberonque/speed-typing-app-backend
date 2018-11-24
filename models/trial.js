const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const trialSchema = new Schema({
  paragraph: String,
  userID: String,
  userInput: String,
  metrics: {
    time: Number,
    wpm: Number,
    cpm: Number,
    accuracy: Number
  }
});

module.exports = mongoose.model('Trial', trialSchema);
