const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlText = require('html-to-text');


module.exports = class Email {
	constructor(user, url) {
		this. to = user.email;
		this.firstname = user.name.split(' ')[0];
		this.url = url;
		this.from = `Abon Ayodeji ${process.env.EMAIL_FROM}`
	}

	newTransport() {
		if (process.env.NODE_ENV === 'production') {
			return nodemailer.createTransport({
				service: 'SendGrid',
				auth:{
					user: process.env.SENDGRID_USERNAME,
					pass: process.env.SENDGRID_PASSWORD
				}
			})
		}
		return nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,
			auth:{
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD,
			}
		})
	}

	async send (template, subject) {

		//render html
		const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {name:this.firstname,url:this.url,subject})

		//define mail options
		const mailOptions = {
			from: this.from,
			to: this.to,
			subject,
			html,
			text: htmlText.fromString(html)
		}

		await this.newTransport().sendMail(mailOptions);

	}

	async sendWelcome() {
		await this.send('welcome', 'Wlecome to the Natours Family')
	}

	async sendPasswordReset() {
		await this.send('passwordreset', 'Your password reset token')
	}
}