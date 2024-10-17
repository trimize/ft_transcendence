import { getWebSocket } from "./singletonSocket.js";

document.getElementById('loginForm').addEventListener('submit', function(event)
{
	event.preventDefault(); // Prevent default form submission

	const credentials = {
		username: this.username.value,
		password: this.password.value
	};

	fetch('http://localhost:8000/api/login_user/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(credentials)
	})
	.then(response => response.json())
	.then(async data => {
		if (data.access && data.refresh) {
			localStorage.setItem('access', data.access);
			localStorage.setItem('refresh', data.refresh);
			localStorage.setItem('websocket_url', data.websocket_url);
			console.log(data.websocket_url);
			await getWebSocket();
			//window.location.href = '/landing';
		}
		else if (data.message === '2FA required')
		{
			document.getElementById('loginForm').style.display = 'none';
			document.getElementById('2faForm').style.display = 'block';
		}
		else
		{
			console.error('Login failed:', data);
			const errorDiv = document.getElementById('connectionStatus');
			errorDiv.textContent = "Incorrect username or password";
			errorDiv.style.display = "block";
			errorDiv.style.color = 'red';
		}
	})
	.catch(error => {
		console.error('Error:', error);
	});
});

document.getElementById('verify2FA').addEventListener('click', function()
{
	const username = document.querySelector('#loginForm input[name="username"]').value;
	const password = document.querySelector('#loginForm input[name="password"]').value;
	const otpToken = document.getElementById('otpToken').value;

	fetch('http://localhost:8000/api/verify_2fa/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ username: username, password: password, token: otpToken })
	})
	.then(response => response.json())
	.then(async data => {
		if (data.access && data.refresh)
		{
			localStorage.setItem('access', data.access);
			localStorage.setItem('refresh', data.refresh);
			localStorage.setItem('websocket_url', data.websocket_url);
			console.log(data.websocket_url);
			await getWebSocket();
			window.location.href = '/Landing';
		}
		else
		{
			console.error('2FA verification failed:', data);
		}
	})
	.catch(error => {
		console.error('Error:', error);
	});
});