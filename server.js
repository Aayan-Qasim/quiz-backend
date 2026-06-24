const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Initialize Middlewares
app.use(cors({
  origin: ['https://quiz-frontend-jet.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Root test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'QuizMaster Admin Portal API is running...' });
});

// Mount Routes
app.use('/api/profile', require('./routes/profile'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/results', require('./routes/results'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/analytics', require('./routes/analytics'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({
    message: 'An internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Define Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
