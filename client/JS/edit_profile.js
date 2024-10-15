import { updateUserData } from "./fetchFunctions.js";

document.addEventListener('DOMContentLoaded', function() {
	const accessToken = localStorage.getItem('access');
	const fileInput = document.getElementById('file');

    fileInput.addEventListener('change', (event) => {
        let file = event.target.files[0];
		console.log(file);
        if (file) {
            console.log('File name:', file.name);
            console.log('File size:', file.size);
            console.log('File type:', file.type);
            // You can also read the file content if needed
            const reader = new FileReader();
            reader.onload = function(e) {
                console.log('File content:', e.target.result);
            };
            reader.readAsText(file); // or readAsDataURL(file) for images, etc.
        }
    });
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

document.getElementById('fileUploadForm').addEventListener('submit', function(event) {

	event.preventDefault();

	// const formData = new FormData();
	const fileInput = document.getElementById('file');
	const file = fileInput.files[0];
	// formData.append('file', file);

	fetch('http://localhost:8080/upload', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('access')}`
		},
		body: file
	})
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			alert('Profile picture uploaded successfully!');
			document.getElementById('profilePicture').value = data.profile_picture;
		} else {
			alert('Failed to upload profile picture. Please try again.');
		}
	})
	.catch(error => {
		console.error('Error uploading profile picture:', error);
		alert('Failed to upload profile picture. Please try again.');
	});
});

document.getElementById('editProfileForm').addEventListener('submit', async function(event) {
	event.preventDefault();

	const username = document.getElementById('username').value;
	const email = document.getElementById('email').value;
	// const profilePicture = document.getElementById('profilePicture').value;
	// const fileInput = document.getElementById('profilePic');
	// const profilePicture = "../Assets/ProfilePictures/" + document.getElementById('profilePicture').value;
	// console.log(profilePicture);
	await updateUserData(username, email, profilePicture)
	// .then(response => response.json())
	// .then(data => {
	// 	if (data.success) {
	// 		alert('Profile updated successfully!');
	// 	} else {
	// 		alert('Failed to update profile. Please try again.');
	// 	}
	// })
	// .catch(error => {
	// 	console.error('Error updating profile:', error);
	// 	alert('Failed to update profile. Please try again.');
	// });
});

