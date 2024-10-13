document.getElementById('registerForm').addEventListener('submit', function(event)
{
	event.preventDefault();

	const formData =
	{
		username: this.name.value,
		email: this.email.value,
		password: this.password.value
	};

	fetch('http://localhost:8000/api/create_user/', 
	{
		method: 'POST',
		headers:
		{
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formData)
	})
	.then(response => response.json())
	.then(data =>
	{
		console.log(data);
		window.location.href = '/Login';
	})
	.catch(error =>
	{
		console.error('Error:', error);
	});
});