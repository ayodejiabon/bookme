const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

dotenv.config({path: './config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose.connect(DB, {
	useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify:true
}).then(() => {
	console.log("DB connection succcessfull")
})

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'UTF-8'));
// const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'UTF-8'));
// const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'UTF-8'));

// const importData = async () => {
// 	try{
// 		await Tour.create(tours);
// 		await User.create(users, {validateBeforeSave:false});
// 		await Review.create(reviews);
// 		console.log("Nice one g");
// 	}catch (err){
// 		console.log(err);
// 	}
// }
// const deletdata = async () => {
// 	try{
// 		await Tour.deleteMany();
// 		await User.deleteMany();
// 		await Review.deleteMany();
// 		console.log("Deleted");
// 	}catch (err){
// 		console.log(err);
// 	}
// }
// importData();
// if (process.env[2] === '--import') {
// 	importData()
// }
// if (process.env[2] === '--delete') {
// 	deletdata()
// }