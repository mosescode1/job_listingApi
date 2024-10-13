const AppError = require("../utils/AppError");

const errProd = (err, res) => {
  // Operational errors we want to display to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Log the error (can be sent to a monitoring service here)
    console.error('ERROR 💥:', err);

    // Send a generic error message to the client
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

const errDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const handleJsonWebTokenError = () => {
  return new AppError("Please provide a valid json token", 401)
}

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    errDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // Create a copy of the error object to handle properties safely
    let error = { ...err };
    error.message = err.message || 'An unknown error occurred';

    if (err.name === 'JsonWebTokenError')
      error = handleJsonWebTokenError()

    errProd(error, res);
  }

  next();
};

module.exports = globalError;
