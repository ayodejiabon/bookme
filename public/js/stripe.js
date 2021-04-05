import axios from 'axios';
import {showAlert} from './alerts';
const stripe =  Stripe('pk_test_51IcfmMHseh8kuJW4a5jED3Vg6hLk8GaFzB2NMcX31CYwwtrOdsY0In5h1mNn4qClOGtff4xBN358c9e2BlzFSs1400sbqf6RqC')

export const bookTour = async tourId => {
	try {
		const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

		await stripe.redirectToCheckout({
			sessionId:session.data.session.id
		});

		
	} catch (err) {
		console.log(err.response);
		showAlert('error', 'Error cannot access payment platform');
	}
}