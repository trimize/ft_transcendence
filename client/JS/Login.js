document.getElementById('loginForm').addEventListener('submit', function(event)
{
	event.preventDefault(); // Prevent default form submission

	const credentials = {
		username: this.username.value,
		password: this.password.value
	};

	fetch('http://localhost:8000/api/login_user/',
	{
		method: 'POST',
		headers:
		{
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(credentials)
	})
	.then(response => response.json())
	.then(data =>
	{
		if (data.access && data.refresh)
		{
			localStorage.setItem('access', data.access);
			localStorage.setItem('refresh', data.refresh);
			window.location.href = '/Landing';
		}
		else
			console.error('Login failed:', data);
	})
	.catch(error =>
	{
		console.error('Error:', error);
	});
});
    