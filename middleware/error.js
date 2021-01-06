const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  // Log to console for dev
  console.log(`${err.name}:`.red, err.message);
  
  let error = { ...err };

  error.message = err.message;


  // Mongoose CastErrors
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ErrorResponse(message, 404);
  }

  // Mongoose ValidationErrors
  if (err.name === 'ValidationError') {
    let message = Object.values(err.errors).map(val => ' ' + val.message ).toString().trim();
    error = new ErrorResponse(message, 400);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.getOwnPropertyNames(err.keyValue)[0];
    const message = `Duplicate field value entered for ${field}: ${err.keyValue[field]}`;
    error = new ErrorResponse(message, 400);
  }

  // JWT errors (malformed, invalid signature, invalid token) || other jwt errors
  if (err.name === 'JsonWebTokenError' || err.name === 'SyntaxError') {
    const message = 'Invalid token.';
    error = new ErrorResponse(message, 403);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server error',
  });
};

module.exports = errorHandler;
