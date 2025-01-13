// app.js
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ip-reverse', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// IP Schema
const ipSchema = new mongoose.Schema({
  originalIp: String,
  reversedIp: String,
  timestamp: { type: Date, default: Date.now }
});

const IpRecord = mongoose.model('IpRecord', ipSchema);

// Middleware to get client IP
app.use((req, res, next) => {
  req.clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  next();
});

// Main route
app.get('/', async (req, res) => {
  const originalIp = req.clientIp.replace(/^::ffff:/, ''); // Remove IPv6 prefix if present
  const reversedIp = originalIp.split('.').reverse().join('.');
  
  // Save to database
  const ipRecord = new IpRecord({
    originalIp: originalIp,
    reversedIp: reversedIp
  });
  
  await ipRecord.save();
  
  res.json({
    originalIp: originalIp,
    reversedIp: reversedIp
  });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
