const express = require('express');
const globalError = require('../controllers/errorController');
const AppError = require('../utils/AppError');
const serverStats = require('../routes/stats');
const userRouter = require("../routes/userRoute");
const empRoute = require("../routes/employerRoute");
const jobRoute = require("../routes/jobsRoute");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// * Routes
app.use('/api/v1/status', serverStats);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/employer', empRoute);
app.use('/api/v1/job', jobRoute);

// Handling undefined Routes
app.use('*', (req, res, next) => {
  next(new AppError(`Route Not Found ${req.originalUrl}`, 404));
});

// Handler for Errors
app.use(globalError);

module.exports = app;
