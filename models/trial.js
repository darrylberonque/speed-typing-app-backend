const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const trialSchema = new Schema({
  paragraph: String,
  userID: String,
  metrics: {
    time: Number,
    wpm: Number,
    cpm: Number,
    accuracy: Number,
    results: [Boolean]
  }
});

module.exports = mongoose.model('Trial', trialSchema);
