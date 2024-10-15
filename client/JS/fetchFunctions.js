export async function refreshAccessToken()
{
	const refreshToken = localStorage.getItem('refresh');
	try
	{
		let response = await fetch('http://10.31.1.3:8000/api/token/refresh/',
		{
			method: 'POST',
			headers:
			{
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ refresh: refreshToken })
		})
		data = await response.json();
		console.log(data.access);
		if (data.access)
			localStorage.setItem('access', data.access);
		else
		{
			console.error('Failed to refresh token:', data);
			throw new Error('No access token fetched');
			//window.location.href = '/Login';
		}
	}
	catch (error)
	{
		//window.location.href = '/Login';
		throw new Error('Error refreshing token:' + error);
	};
}

export async function fetchUserData()
{
	const accessToken = localStorage.getItem('access');
	try {
		let response = await fetch('http://10.31.1.3:8000/api/user_info/', {
		    method: 'GET',
		    headers: {
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		    }
		})
		if (response.status == 401) {
			await refreshAccessToken();
			const data = await fetchUserData();
			return data;
		}
		else if (!response.ok)
			throw new Error('Failed to fetch user data');
		const userData = await response.json();
		return userData;
	}
	catch (error) {
		console.error(error.message);
		return "";
	}
}

export async function updateGame(body)
{
	const accessToken = localStorage.getItem('access');
	try {
		let response = await fetch('http://10.31.1.3:8000/api/update_match/', {
		    method: 'PUT',
		    headers: {
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		    },
		    body: JSON.stringify(body)
		})
		if (response.status == 401) {
			await refreshAccessToken();
			await updateGame(body);
		}
		else if (!response.ok)
			throw new Error('Failed to fetch user data');
	}
	catch (error) {
		console.error(error.message);
		return "";
	}
}

export async function createGame(body)
{
	const accessToken = localStorage.getItem('access');
	try {
		let response = await fetch('http://10.31.1.3:8000/api/create_match/', {
		    method: 'POST',
		    headers: {
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		    },
		    body: JSON.stringify(body)
		})
		if (response.status == 401) {
			await refreshAccessToken();
			const gameData = await updateGame(body);
			return gameData.id;
		}
		else if (!response.ok)
			throw new Error('Failed to fetch user data');
		const gameData = await response.json();
		return gameData.id;
	}
	catch (error) {
		console.error(error.message);
		return "";
	}
}

export async function getUser(username)
{
	const accessToken = localStorage.getItem('access');
	try {
		let response = await fetch('http://10.31.1.3:8000/api/get_user/' + username + '/', {
		    method: 'GET',
		    headers: {
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		    }
		})
		if (response.status == 401) {
			await refreshAccessToken();
			const data = await fetchUserData();
			return data;
		}
		else if (!response.ok)
			throw new Error('Failed to fetch user data');
		const userData = await response.json();
		return userData;
	}
	catch (error) {
		console.error(error.message);
		return "";
	}
}
