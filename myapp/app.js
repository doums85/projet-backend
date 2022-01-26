const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const globalErrorHandler = require('./controllers/errorController');
// SECURITY
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

app.use(morgan('dev'));
app.use(express.json({
  limit: '10kb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10kb'
}));

app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());


app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'country',
      'slug'
    ]
  })
);


// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});


// Routes
const usersRouter = require('./routes/usersRoutes');
const travelRouter = require('./routes/travelRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/travels', travelRouter);
app.use('/api/v1/travels/reviews', reviewRouter);
app.use('/', viewRouter);

app.use(globalErrorHandler);

module.exports = app;