const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ServiceSchema = new Schema({
  title: String,
  description: String,
  price: Number,
  image: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Service', ServiceSchema);
