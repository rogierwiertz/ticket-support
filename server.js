const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const fileUpload = require('express-fileupload');
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
const users = require('./routes/users');
const auth = require('./routes/auth');
const comments = require('./routes/comments');
const ErrorResponse = require('./utils/errorResponse');

// Dev loggin middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Parse JSON data
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// File upload
app.use(
  fileUpload({
    limits: {
      fileSize: 2 * 1000 * 1000,
    },
    createParentPath: true,
    abortOnLimit: true,
    limitHandler: (req, res, next) => {
      return next(new ErrorResponse('Filesize must be under 2 mb', 413));
    },
    // debug: true,
  })
);

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet({ contentSecurityPolicy: false }));

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10 minutes
  max: 100,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use('/static', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/v1/tickets', tickets);
app.use('/api/v1/projects', projects);
app.use('/api/v1/users', users);
app.use('/api/v1/auth', auth);
app.use('/api/v1/comments', comments);

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
