const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Bookings = require('./../models/bookingsModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getOverview =  catchAsync ( async (req, res, next) => {

	const tours = await Tour.find();

	res.status(200).render('overview', {
		title: 'All Tours',
		tours
	})
})

exports.getTour = catchAsync ( async (req, res, next) => {

    const tour = await Tour.findOne({slug:req.params.slug}).populate({
    	path: 'reviews',
    	fields: 'review rating user'
    });

    if (!tour){
    	return next(new appError(`There is a no ${req.params.slug}`));
    }

	res.status(200).render('tour', {
		title: tour.name,
		tour
	})
})

exports.getLoginForm = (req, res) => {
	res.status(200).render('login', {title:'Login'})
}

exports.getAccount = (req, res) => {
	res.status(200).render('account', {title:'Account page'})
}
exports.updateUserData = catchAsync( async (req, res, next) => {
	const updateduser = await User.findByIdAndUpdate(req.user.id, {
		name: req.body.name,
		email: req.body.email
	}, 
	{
		new: true,
		runValidators: true
	}
	);
	res.status(204).json({
		status: 'success',
	});
})

exports.getBookings = catchAsync( async (req, res, next) => {

	const bookings = await Bookings.find({user:req.user.id});

	const tourIDs = bookings.map(el => el.tour);

	const tours = await Tour.find({_id:{$in: tourIDs}});

	res.status(200).render('overview', {
		title: 'My bookings',
		tours
	});
});