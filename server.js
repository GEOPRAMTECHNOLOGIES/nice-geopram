require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const basicAuth = require('basic-auth');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/nice-geopram';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Mongo connected'))
  .catch(err => console.error('Mongo error', err));

const Service = require('./models/Service');
const Order = require('./models/Order');
const Transaction = require('./models/Transaction');

// API: list services
app.get('/api/services', async (req, res) => {
  const services = await Service.find().lean();
  res.json(services);
});

// API: create order
app.post('/api/orders', async (req, res) => {
  try {
    const { serviceId, name, email, phone } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(400).json({ error: 'Service not found' });
    const order = await Order.create({ service: service._id, name, email, phone, price: service.price, status: 'pending' });
    res.json({ ok: true, orderId: order._id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Simulate payment (client hits this to simulate MPESA STK push)
app.post('/api/payments/simulate', async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('service');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    // Mark as paid and create transaction
    order.status = 'paid';
    await order.save();
    const tx = await Transaction.create({ order: order._id, amount: order.price, phone: order.phone, email: order.email, status: 'SUCCESS', mpesaData: { simulated: true }, timestamp: new Date() });

    // Call internal callback handler to emulate MPESA callback
    await emulateCallback(order, tx);

    res.json({ ok: true, txId: tx._id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

async function emulateCallback(order, tx) {
  // Simple internal handler that records the callback — in real setup MPESA will post to MPESA_CALLBACK_URL
  try {
    // Update transaction with callback info (already created above)
    tx.callbackHandled = true;
    await tx.save();
  } catch (e) {
    console.error('Callback emulate error', e);
  }
}

// Public callback endpoint (for real MPESA integration)
app.post('/api/payments/callback', async (req, res) => {
  // store callback payload to a Transaction record or update existing one
  const payload = req.body;
  await Transaction.create({ amount: payload.amount || 0, phone: payload.msisdn || payload.phone, email: payload.email || '', status: payload.status || 'UNKNOWN', mpesaData: payload, timestamp: new Date() });
  res.json({ received: true });
});

// Admin middleware (Basic Auth using ADMIN_EMAIL/ADMIN_PASSWORD)
function requireAdmin(req, res, next) {
  const user = basicAuth(req);
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPass) return res.status(500).json({ error: 'Admin not configured' });
  if (!user || user.name !== adminEmail || user.pass !== adminPass) {
    res.set('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.get('/api/admin/transactions', requireAdmin, async (req, res) => {
  const txs = await Transaction.find().populate({ path: 'order', populate: { path: 'service' } }).sort({ timestamp: -1 }).lean();
  res.json(txs);
});

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  const orders = await Order.find().populate('service').sort({ createdAt: -1 }).lean();
  res.json(orders);
});

// Boot
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port', PORT));
