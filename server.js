const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load .env variables
dotenv.config({ path: './config/config.env' });

const app = express();

// Connect to mongoDB
connectDB();

// Route files
const tickets = require('./routes/tickets');
const projects = require('./routes/projects');

// Dev loggin middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Parse JSON data
app.use(express.json());

// Mount routes
app.use('/api/v1/tickets', tickets);
app.use('/api/v1/projects', projects);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(
  PORT,
  console.log(
    `Server listening in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .bold
  )
);
