// server/apiServer.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple root route for health check
app.get('/', (req, res) => {
  res.send('Aussie Grub Share API is running!');
});

// MongoDB connection with retry logic
async function connectDB(retries = 5, delay = 5000) {
  try {
    await mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected to:', mongoose.connection.name);
});;
    console.log("Connected to MongoDB Atlas\n");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);

    if (retries > 0) {
      console.log(`Retrying to connect in ${delay / 1000} seconds... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1, delay), delay);
    } else {
      console.error("Failed to connect to MongoDB after multiple attempts.");
      process.exit(1); // Exit process with failure
    }
  }
}

connectDB();

// API Routes
const authRoutes = require('./routes/auth.js');
const foodRoutes = require('./routes/fooditem.js');
const claimRoutes = require('./routes/claim.js');
const notificationRoutes = require('./routes/notification.js');
const reportRoutes = require('./routes/report.js');

app.use('/api/auth', authRoutes);
app.use('/api/fooditem', foodRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global error handling middleware (last middleware)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error'
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
