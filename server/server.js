const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();
const app = express();

// ✅ CORS Configuration
app.use(cors({
  origin: [
    'https://client-re-xchange.vercel.app',  // ← YOUR Vercel URL
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));

app.get('/', (req, res) => res.send('Library API running...'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected ✅');
    app.listen(PORT, () => console.log(`Server on port ${PORT}`));
  })
  .catch(err => console.error('DB error:', err.message));