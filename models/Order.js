const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const OrderSchema = new Schema({
  service: { type: Schema.Types.ObjectId, ref: 'Service' },
  name: String,
  email: String,
  phone: String,
  price: Number,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Order', OrderSchema);
