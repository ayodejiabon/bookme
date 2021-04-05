const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'User name is required'],
		//validate: [validator.isAlpha, 'A tour name must only contain alphabets']
	},
	email: {
		type: String,
		required: [true, 'User email is required'],
		unique: true,
		lowerCase: true,
		validate: [validator.isEmail, 'Please provide a valid email']
	},
	password: {
		type: String,
		trim: true,
		required: [true, 'User password is required'],
		minlength: 8,
		select: false
	},
	photo: {
		type:String,
		default:'default.jpg'
	},
	role: {
		type: String,
		enum: ['user', 'guide', 'lead-guide', 'admin'],
		default: 'user'
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Confirm password'],
		validate: {
			//only works on save not create
			validator: function (el) {
				return el === this.password;
			}
		}
	},
	created: {
		type: Date,
		default: Date.now(),
		select:false
	},
	passwordChange: {
		type: Date,
		select: false
	},
	passwordToken: {
		type: String,
		select: false
	},
	passwordExpire: {
		type: Date,
		select: false
	},
	active:{
		type: Boolean,
		default: true,
		select: false
	}

}, {
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

userSchema.pre('save', async function(next) {

	//run this function is password was modified
	if (!this.isModified('password')) return next();

	this.password = await bcrypt.hash(this.password, 12);

	this.passwordConfirm = undefined;

	next();
});

userSchema.pre('save', async function(next) {

	//run this function if password was modified
	if (!this.isModified('password') || this.isNew) return next();

	this.passwordChange = Date.now() - 1000;

	next();
});

userSchema.pre(/^find/, async function(next) {

	//this points to current query
	this.find({active:{$ne:false}});

	next();
});


userSchema.methods = { 
	authenticate: async function (password, hash) {
		return await bcrypt.compare(password, hash);
	},
	changedPassword: function (timestamp) {
		if (this.passwordChange !== undefined) {
			const changedTimeStamp = parseInt(this.passwordChange.getTime() / 1000, 10);
			return timestamp < changedTimeStamp;
		}
		return false;
	},
	createpasswordtoken: function() {
		const token = crypto.randomBytes(32).toString('hex');

		this.passwordToken = crypto.createHash('sha256').update(token).digest('hex');


		this.passwordExpire = Date.now() + 10 + 64 + 1000;

		return token;
	}
}

const User = mongoose.model("User", userSchema);

module.exports = User;