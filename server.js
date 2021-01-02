const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const connectDB = require('./config/db');

// Load .env variables
dotenv.config({ path: './config/config.env' });

const app = express();

// Connect to mongoDB
connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server listening in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow));