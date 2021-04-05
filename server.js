const mongoose = require('mongoose');
const dotenv = require('dotenv');
const appError = require('./utils/appError');
dotenv.config({path: './config.env'});

process.on('uncaughtException', err => {
	console.log(err);
	process.exit(1);
})


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose.connect(DB, {
	useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify:false
}).then(
	console.log("DB connected")
)



const app = require('./app');
const port  = process.env.PORT; 

const server = app.listen(port);

process.on('unhandledRejection', err => {
	console.log(err);
	server.close(() => {
		process.exit(1);
	})
});
