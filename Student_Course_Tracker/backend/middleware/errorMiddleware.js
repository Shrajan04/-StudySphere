/**
 * Global error handling middleware
 * Must be registered AFTER all routes in server.js
 */

// 404 handler — catches requests that didn't match any route
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// General error handler — formats all errors into JSON response
const errorHandler = (err, req, res, next) => {
  // Some Express errors arrive with status 200 by default; fix that
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
