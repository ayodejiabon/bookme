import '@babel/polyfill'
import { displayMap } from './mapbox';
import { login, logout, updateUser, updatePssword } from './login';
import { bookTour } from './stripe';


const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form-login');
const updateForm = document.getElementById('jones');
const Upass = document.getElementById('updatepass');
const books = document.getElementById('book-tour');
const logoutBtn = document.querySelector('.nav__el--logout');


if (mapBox) {
	const locations = JSON.parse(document.getElementById('map').dataset.locations);
	displayMap(locations);
}

if (loginForm) {
	loginForm.addEventListener('submit', e => {
		e.preventDefault();
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;
		login(email, password);
	})
}

if (updateForm) {
	updateForm.addEventListener('submit', e => {
		e.preventDefault();
		const form = new FormData();
		form.append('name', document.getElementById('name').value);
		form.append('email', document.getElementById('email').value);
		form.append('photo', document.getElementById('photo').files[0]);
		updateUser(form);
	})
}


if (Upass) {
	Upass.addEventListener('submit', e => {
		e.preventDefault();
		const current = document.querySelector('.current').value;
		const password = document.querySelector('.password').value;
		const passwordConfirm = document.querySelector('.confirmPassword').value;
		updatePssword(current, password, passwordConfirm);
	});
}

if (books) {
	books.addEventListener('click', e => { 
		const tour = e.target.dataset.tourid;
		bookTour(tour);
	})
}

if (logoutBtn) {
	logoutBtn.addEventListener('click',logout)
}