export function getCurrentTime()
{
	const now = new Date();

	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
	const day = String(now.getDate()).padStart(2, '0');
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const seconds = String(now.getSeconds()).padStart(2, '0');
	const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

	// Get the timezone offset in hours and minutes
	const offset = -now.getTimezoneOffset();
	const offsetSign = offset >= 0 ? '+' : '-';
	const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
	const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0');

	// Format the datetime string
	const currentTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
	return currentTime;
}

export function updateGame(body)
{
	const accessToken = localStorage.getItem('access');
	return fetch('http://localhost:8000/api/update_match/', {
		method: 'PUT',
		headers: {
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
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

export function createGame(body)
{
	const accessToken = localStorage.getItem('access');
	return fetch('http://localhost:8000/api/create_match/', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
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
		if (data && data.id)
			return data.id;
		else
			throw new Error('Failed to fetch user data');
	})
	.catch(error => {
		console.error('Error fetching user data:', error);
		throw error;
	});
}