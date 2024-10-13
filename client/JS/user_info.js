function refreshAccessToken()
{
	const refreshToken = localStorage.getItem('refresh');

	return fetch('http://localhost:8000/api/token/refresh/',
	{
		method: 'POST',
		headers:
		{
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ refresh_token: refreshToken })
	})
	.then(response => response.json())
	.then(data =>
	{
		if (data.access_token)
			localStorage.setItem('access', data.access_token);
		else
		{
			console.error('Failed to refresh token:', data);
			//window.location.href = '/Login';
		}
	})
	.catch(error =>
	{
		console.error('Error refreshing token:', error);
		//window.location.href = '/Login';
	});
}



export function fetchUserData()
{
	const accessToken = localStorage.getItem('access');
	return fetch('http://localhost:8000/api/user_info/', {
	    method: 'GET',
	    headers: {
		'Authorization': `Bearer ${accessToken}`,
		'Content-Type': 'application/json'
	    }
	})
	.then(response => {
	    if (response.status === 401) {
		// If the token is expired or invalid, refresh it
		return refreshAccessToken().then(() => fetch('http://localhost:8000/api/user_info/', {
		    method: 'GET',
		    headers: {
			'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
			'Content-Type': 'application/json'
		    }
		}));
	    }
	    return response.json();
	})
	.then(data => {
	    if (data) {
		return data;
	    }
	    throw new Error('Failed to fetch user data');
	})
	.catch(error => {
	    console.error('Error fetching user data:', error);
	    throw error;
	});
}