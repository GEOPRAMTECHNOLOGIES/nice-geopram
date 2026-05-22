const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TransactionSchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order' },
  amount: Number,
  phone: String,
  email: String,
  status: String,
  mpesaData: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
  callbackHandled: { type: Boolean, default: false }
});
module.exports = mongoose.model('Transaction', TransactionSchema);
