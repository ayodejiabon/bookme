import axios from 'axios';
import {showAlert} from './alerts';

export const login = async (email, password) => {

	try {
		const res = await axios({
			method: 'POST',
			url: 'http://localhost:3000/api/v1/users/login',
			data:{
				email,
				password
			}
		});
		if (res.data.status === "success") {
			showAlert('success', 'Log in successfull');
			window.setTimeout(() => {
				location.assign('/')
			}, 1500);
		}
	} catch (err) {
		showAlert('error', err.response.data.message);
	}
}

export const logout = async () => {
	try {
		const res = await axios({
			method: 'GET',
			url: 'http://localhost:3000/api/v1/users/logout',
		});

		//reload from server not browser cache
		if (res.data.status === "success") location.reload(true);
	} catch (err) {
		console.log(err.response);
		showAlert('error', 'Error logging out try again');
	}
}

export const updateUser = async (data) => {
	try {
		const res = await axios({
			method: 'PATCH',
			url: 'http://localhost:3000/api/v1/users/updateme',
			data
		});

		//reload from server not browser cache
		if (res.data.status === "success") {
			showAlert('success', 'Data updated successfully');
			window.setTimeout(() => {
				location.reload(true);
			}, 500);
		}
	} catch (err) {
		console.log(err.response);
		showAlert('error', 'Error logging out try again');
	}
}

export const updatePssword = async (current, password, passwordConfirm) => {
	try {
		const res = await axios({
			method: 'PATCH',
			url: 'http://localhost:3000/api/v1/users/updatepassword',
			data:{
				current,
				password, 
				passwordConfirm
			}
		});

		//reload from server not browser cache
		if (res.data.status === "success") {
			showAlert('success', 'Password updated successfully');
			window.setTimeout(() => {
				location.reload(true);
			}, 500);
		}
	} catch (err) {
		console.log(err.response);
		showAlert('error', 'Error logging out try again');
	}
}