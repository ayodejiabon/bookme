const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

// app.use(cors({
// 	origin: 'url'
// }));

app.options('*', cors());
//app.options('/api/v1/tours/:id', cors());

//secure http headers
app.use(helmet({
	contentSecurityPolicy: false,
}));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//IP limit
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: 'Too many requests from this IP, please try again in an hour'
});

app.use('/api', limiter);


app.post('/payments', express.raw({type:'application/json'}), bookingController.webhookCheckout);

app.use(express.json({limit: '10Kb'}));
app.use(express.urlencoded({extended: true, limit:'10kb'}));
app.use(cookieParser());

//Data sanitization against NOSQL query injection
app.use(mongoSanitize());

//Data sanitization again XSS
app.use(xss());

//parameter pollution
app.use(hpp({
	whitelist:[
		'duration'
	]
}));

app.use(compression());

//route handlers
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
	next(new AppError(`Can't get ${req.originalUrl} on this server`, 404));
})

app.use(globalErrorHandler);


module.exports = app;