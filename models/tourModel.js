const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A tour must have a name'],
		unique: true,
		maxlength: [40, 'A tour name must not be more than 39 characters'],
		minlength: [10, 'A tour name must have more than 9 characters'],
		//validate: [validator.isAlpha, 'A tour name must only contain alphabets']
	},
	slug: String,
	duration: {
		type: Number,
		required: [true, 'A tour must have a duration']
	},
	maxGroupSize: {
		type: Number,
		required: [true, 'A tour must have a group size']
	},
	difficulty: {
		type: String,
		required: [true, 'A tour must have a difficulty'],
		enum: {
			values: ['easy', 'medium', 'difficult'],
			message: 'Wrong difficulty'
		}
	},
	ratingsAverage: {
		type: Number,
		default:4.5,
		min: [1, 'Rating must be above 1.0'],
		max: [5, 'Rating must be below 5.0'],
		set: val => Math.round(val * 10)/10
	},
	ratingsQuantity: {
		type: Number,
		default:0
	},
	price: {
		type: Number,
		required: [true, 'A tour must have a price']
	},
	priceDiscount: {
		type: Number,
		validate: {
			validator: function (val) {

				//this only points to current document on new document creation
				return val < this.price;
			},
			message: 'Invalid price ({VALUE})'
		}
	},
	summary:{
		type: String,
		trim: true,
		required: [true, 'A tour must have a description']
	},
	description: {
		type: String,
		trim: true
	},
	imageCover: {
		type: String,
		required: [true, 'A tour must have a cover image']
	},
	images: [String],
	created: {
		type: Date,
		default: Date.now(),
		select:false
	},
	startDates: [Date],
	secretTour: {
		type: Boolean,
		default: false
	},
	startLocation:{
		type:{
			type:String,
			default:'Point',
			enum:['Point' ]
		},
		coordinates:[Number],
		address: String,
		description: String,
	},
	locations: [
		{
			type:{
				type: String,
				default: 'Point',
				enum: ['Point']
			},
			coordinates:[Number],
			address: String,
			description: String,
			day: Number
		}
	],
	guides: [
		{
			type:mongoose.Schema.ObjectId,
			ref: 'User'
		}
	]
}, {
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

//tourSchema.index({price: 1});
//1 stands for storing index in ascending order, -1 descending order

tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});
tourSchema.index({startLocation: '2dsphere'});

tourSchema.virtual('durationWeeks').get(function() {
	return this.duration / 7;
})

//virtual populate
tourSchema.virtual('reviews', {
	ref:'Review',
	foreignField:'tour',
	localField: '_id'
})

// tourSchema.pre('save', function(next) {
// 	this.slug = slugify(this.name, {lower: true});
// 	next();
// }); 

//runs before save and create command but not an insertmany
tourSchema.pre('save', function(next) {
	this.slug = slugify(this.name, {lower: true});
	next();
});

// tourSchema.pre('save', async function(next) {
// 	const guidesPromises = this.guides.map(async id => await User.findById(id));
// 	this.guides = await Promise.all(guidesPromises);
// 	next();
// }); 

// tourSchema.post('save', function(doc, next) {
	
// 	next();
// }); 

tourSchema.pre(/^find/, function(next) {
	this.find({
		secretTour: {$ne: true}
	})
	next();
})


tourSchema.pre(/^find/, function(next){
	// this.populate({
 //        path:'tour',
 //        select:'name'
 //    }).populate({
 //        path:'user',
 //        select:'name photo'
 //    });
	this.populate({
        path:'guides',
        select:'-__v'
    });
    next();
})

tourSchema.post(/^find/, function(docs, next) {
	next();
})

//aggregation middleware
// tourSchema.pre('aggregate', function(next) {
// 	this.pipeline().unshift({
// 		$match: {secretTour: {$ne: true}}
// 	})
// 	next();
// })


const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;