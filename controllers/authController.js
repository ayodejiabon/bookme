const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const APIFeatures = require('./../utils/APIFeatures');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const Email = require('./../utils/email');
const crypto = require('crypto');

const createSendToken = (user, statusCode, req, res) => {

	const token = signtoken(user._id);

	const cookieOptions = {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
		httpOnly: true,
		secure: req.secure || req.headers('x-forwarded-proto') === 'https'
	}

	//if(req.secure)


	res.cookie('jwt', token, cookieOptions);

	user.password = undefined;

	res.status(statusCode).json({
		status:"success",
		token: token,
		data:{
			user
		}
	})
}

exports.logout = (req, res) => {
	res.cookie('jwt', 'Logged Out', {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true
	});

	res.status(200).json({status:"success"});
} 

const signtoken = id => {
	return jwt.sign({id}, process.env.JWT_SECRET,{
		expiresIn: process.env.JWT_EXPIRES_IN
	});
}

exports.signup = catchAsync( async (req, res, next) => {
	
	if (req.body.password !== req.body.passwordConfirm) {
		return next(new appError('Passwords do not match', 400));
	}

	const newuser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password:req.body.password,
		passwordConfirm: req.body.passwordConfirm,
		role: req.body.role
	});
	const url = `${req.protocol}://${req.get('host')}/me`;
	await new Email(newuser, url).sendWelcome();
	createSendToken(newuser, 201, req, res);
});

exports.login = catchAsync ( async (req, res, next) => {

	const { email, password } = req.body;

	if (!email || !password) {
		return next(new appError('Please provide email and password', 400));
	}

	const user = await User.findOne({email}).select('+password');


	if (!user || !(await user.authenticate(password, user.password))) {
		return next(new appError('Invalid login credentials', 401));
	}

	createSendToken(user, 200, req, res);
});

exports.isLoggedIn = async (req, res, next) => {

	if (req.cookies.jwt) {
		try {
			const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)

			const validate = await User.findById(decoded.id);

			if (!validate) {
				return next();
			}

			if (validate.changedPassword(decoded.iat)) {
				return next();
			}

			//successfull check
			res.locals.user = validate;
			return next();

		} catch (err) {
			return next();
		}
	}
	next();
};

exports.protect = catchAsync ( async (req, res, next) => {
	let token;

	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	} else if (req.cookies.jwt) {
		token = req.cookies.jwt;
	}

	if (!token) {
		return next(new appError('You are not logged in', 401));
	}

	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

	const validate = await User.findById(decoded.id);

	if (!validate) {
		return next(new appError('Invalid authorization', 401));
	}

	if (validate.changedPassword(decoded.iat)) {
		return next(new appError('You are not logged in, please login again', 401));
	}
	req.user = validate;
	res.locals.user = validate;
	next();
});

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(new appError('no permission', 403));
		}
		next();
	}
}

exports.forgotPassword = catchAsync ( async (req, res, next) => {
	const user = await User.findOne({email: req.body.email});
	if (!user) {
		return next(new appError('User not found', 404));
	}
	const resetToken = user.createpasswordtoken();
	await user.save({validateBeforeSave: false});

	try {
		const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;
		await new Email(user, resetURL).sendPasswordReset();

		res.status(200).json({
			status: 'success',
			message: "Please check your email"
		})
	} catch (err) {
		user.passwordToken = undefined;
		user.passwordExpire = undefined;
		await user.save({validateBeforeSave: false});
		return next(new appError('Cannot send email to client', 500));
	}
	
})

exports.resetPassword = catchAsync ( async (req, res, next) => {

	const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

	const user = await User.findOne({
		passwordToken: hashedToken
	});

	if (!user) {
		return next(new appError('Invalid password token', 400));
	}

	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm
	user.passwordToken = undefined;
	user.passwordExpire = undefined;
	await user.save();


	createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync ( async (req, res, next) => {

	const user = await User.findById(req.user.id).select('+password');

	if (!user) {
		return next(new appError('Invalid authorization', 401));
	}

	if (!await user.authenticate(req.body.current, user.password)) {
		return next(new appError('Invalid current password', 401));
	}

	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	await user.save();

	createSendToken(user, 200, req,  res);

});