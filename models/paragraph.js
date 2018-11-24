const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paragraphSchema = new Schema({
  content: String
});

module.exports = mongoose.model('Paragraph', paragraphSchema);
