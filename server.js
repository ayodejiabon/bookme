const mongoose = require('mongoose');
const dotenv = require('dotenv');
const appError = require('./utils/appError');
dotenv.config({path: './config.env'});

process.on('uncaughtException', err => {
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

const server = app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode");
});

process.on('unhandledRejection', err => {
	 console.log("banger");
	server.close(() => {
		process.exit(1);
	})
});
