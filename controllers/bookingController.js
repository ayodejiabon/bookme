const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Bookings = require('./../models/bookingsModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getCheckout = catchAsync (async (req, res, next) => {
	const tour = await Tour.findById(req.params.tourID);

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		//success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
		success_url: `${req.protocol}://${req.get('host')}/bookings`,
		cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
		customer_email: req.user.email,
		client_reference_id: req.params.tourID,
		line_items: [
			{
				name: `${tour.name} Tour`,
				description: tour.summary,
				images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
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


// exports.createBookingCheckout = catchAsync ( async (req, res, next) => {
	
// 	const {tour, user, price} = req.query;
	
// 	if(!tour || !user || !price) return next();

// 	await Bookings.create({tour, user, price});

// 	res.redirect(req.originalUrl.split('?')[0]);
// });

const createBookingCheckout = catchAsync ( async session => {

	const tour = session.client_reference_id;
	const user = (await User.findOne({email:session.customer_email})).id;
	const price = session.display_items[0].amount / 100;
	await Bookings.create({tour, user, price});
});

exports.webhookCheckout = catchAsync ( async (req, res, next) => {

	const signature = req.headers['stripe-signature'];

	let event;

	try {
		event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
	} catch (err){
		return res.status(400).send('Webhook error: '+err.message);
	}

	if (event.type === 'checkout.session.completed') {

		createBookingCheckout(event.data.object);

		return res.status(400).json({recieved: true});
	}

});

exports.createBooking = factory.createOne(Bookings);
exports.getBooking = factory.getOne(Bookings);
exports.getAllBookings = factory.getAll(Bookings);
exports.updateBooking = factory.updateOne(Bookings);
exports.deleteBooking = factory.deleteOne(Bookings);