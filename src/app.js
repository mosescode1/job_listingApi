const express = require('express');
const globalError = require('../controllers/errorController');
const AppError = require('../utils/AppError');
const serverStats = require('../routes/stats');
const userRouter = require("../routes/userRoute");

const app = express();

app.use(express.json());

// * Routes
app.use('/api/v1/status', serverStats);
app.use('/api/v1/user', userRouter);

// Handling undefined Routes
app.use('*', (req, res, next) => {
  next(new AppError(`Route Not Found ${req.url}`, 404));
});

// Handler for Errors
app.use(globalError);

module.exports = app;
