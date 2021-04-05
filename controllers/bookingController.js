const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel');
const Bookings = require('./../models/bookingsModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getCheckout = catchAsync (async (req, res, next) => {
	const tour = await Tour.findById(req.params.tourID);

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
		cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
		customer_email: req.user.email,
		client_reference_id: req.params.tourID,
		line_items: [
			{
				name: `${tour.name} Tour`,
				description: tour.summary,
				images: ['http://natours.dev/assets/hv_logo_retina-6a2ba8350907d4a17bfc7863c2f1378e38a53bd22b790c69c14143b0f9ce45ca.png'],
				amount: tour.price*100,
				currency: 'usd',
				quantity: 1
			}
		]
	});

	res.status(200).json({
		status:"success",
		session
	})
})


exports.createBookingCheckout = catchAsync ( async (req, res, next) => {
	
	const {tour, user, price} = req.query;
	
	if(!tour || !user || !price) return next();

	console.log(tour, user, price);

	await Bookings.create({tour, user, price});

	//req.originalUrl.split('?')[0];

	res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Bookings);
exports.getBooking = factory.getOne(Bookings);
exports.getAllBookings = factory.getAll(Bookings);
exports.updateBooking = factory.updateOne(Bookings);
exports.deleteBooking = factory.deleteOne(Bookings);