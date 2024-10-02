const errProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // ! programming error : dont leak to client
  } else {
    // ! log error to console
    console.error(err);
    // ! send a generic  messageS
    res.status(500).json({
      status: 'error',
      message: 'Something went error',
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

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    errDev(err, res);
  } else {
    console.log(err.message);
    let error = { ...err };
    error.message = err.message || "";
    errProd(error, res);
  }

  next();
};

module.exports = globalError;
