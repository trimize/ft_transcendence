document.getElementById('registerForm').addEventListener('submit', function(event)
{
	event.preventDefault();

	const formData =
	{
		username: this.name.value,
		email: this.email.value,
		password: this.password.value
	};

	fetch('http://10.31.1.3:8000/api/create_user/', 
	{
		method: 'POST',
		headers:
		{
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formData)
	})
	.then(response => {
		if (!response.ok)
		{
			const errDiv = document.getElementById('registerStatus');
			errDiv.style.color = 'red';
			errDiv.style.display = 'block';
			return response.json().then(data =>
			{
				if (data.username)
					errDiv.textContent = data.username[0];
				else if (data.email)
					errDiv.textContent = data.email[0];
				else if (data.password)
					errDiv.textContent = password[0];
				throw new Error(`HTTP error! Status: ${response.status}`);
			});
		}
		return response.json();
	})
	.then(data =>
	{
		console.log(data);
		//if (data.email == "Enter a valid email address.")
		window.location.href = '/login';
	})
	.catch(error =>
	{
		console.error('Error:', error);
	});
});