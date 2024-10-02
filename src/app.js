const express = require('express');
const globalError = require('../controllers/errorController');
const AppError = require('../utils/AppError');
const serverStats = require('../routes/stats');

const app = express();

app.use(express.json());

// * Routes
app.use('/', serverStats);

// Handling undefined Routes
app.use('*', (req, res, next) => {
  next(new AppError(`Route Not Found ${req.url}`, 404));
});

// Handler for Errors
app.use(globalError);

module.exports = app;
