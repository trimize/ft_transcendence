// import { refreshAccessToken } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
	const accessToken = localStorage.getItem('access');

	if (!accessToken) {
		alert('Access token is missing. Please log in.');
		window.location.href = '/Login';
		return;
	}

	fetch('http://localhost:8000/api/user_info/', {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${accessToken}`
		}
	})
	.then(response => response.json())
	.then(data => {
		document.getElementById('username').value = data.username;
		document.getElementById('email').value = data.email;
		document.getElementById('profilePicture').value = data.profile_picture;
	})
	.catch(error => {
		console.error('Error fetching user info:', error);
		alert('Failed to fetch user info. Please try again.');
	});
});

document.getElementById('setup2FA').addEventListener('click', function() {
	const accessToken = localStorage.getItem('access');

	fetch('http://localhost:8000/api/setup_2fa/', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${accessToken}`
		}
	})
	.then(response => response.json())
	.then(data => {
		const base64Image = data.qr_code_img.trim();
		if (base64Image) {
			document.getElementById('qrCode').src = `data:image/png;base64,${base64Image}`;
			document.getElementById('2faSetupContainer').style.display = 'block';
		} else {
			console.error('QR code image data is missing or invalid.');
		}
	})
	.catch(error => {
		console.error('Error setting up 2FA:', error);
		alert('Failed to setup 2FA. Please try again.');
	});
});

document.getElementById('verify2FA').addEventListener('click', function() {
	const accessToken = localStorage.getItem('access');
	const otpToken = document.getElementById('otpToken').value;

	fetch('http://localhost:8000/api/setup_2fa/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${accessToken}`
		},
		body: JSON.stringify({ otp_token: otpToken })
	})
	.then(response => response.json())
	.then(data => {
		if (data.message === '2FA setup complete') {
			alert(data.message);
			document.getElementById('2faSetupContainer').style.display = 'none';
		} else {
			alert('2FA setup failed: ' + data.message);
		}
	})
	.catch(error => {
		console.error('Error verifying 2FA:', error);
		alert('Failed to verify 2FA. Please try again.');
	});
});

document.getElementById('editProfileForm').addEventListener('submit', function(event) {
	event.preventDefault();

	const accessToken = localStorage.getItem('access');
	const username = document.getElementById('username').value;
	const email = document.getElementById('email').value;
	const profilePicture = document.getElementById('profilePicture').value;
	// refreshAccessToken();
	fetch('http://localhost:8000/api/update_user/', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${accessToken}`
		},
		body: JSON.stringify({
			username: username,
			email: email,
			profile_pic: profilePicture
		})
	})
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			alert('Profile updated successfully!');
		} else {
			alert('Failed to update profile. Please try again.');
		}
	})
	.catch(error => {
		console.error('Error updating profile:', error);
		alert('Failed to update profile. Please try again.');
	});
});