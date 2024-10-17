import { fetchUserData } from "./fetchFunctions.js";

const profilePicture = document.getElementById('profilePicture');
const logoutButton = document.getElementById('logoutBtn');

document.addEventListener('DOMContentLoaded', function()
{
	fetchUserData().then(profileData =>
	{
		if (profileData === "")
		{
			window.location.href = '/Login';
			return;
		}	
		if (profileData.profile_pic !== null)
			profilePicture.src = `http://localhost:8000${profileData.profile_pic}`;
		else
			profilePicture.src = 'https://cdn-icons-png.flaticon.com/512/9203/9203764.png';
		document.getElementById('username').textContent = profileData.username;
		document.getElementById('email').textContent = profileData.email;
		document.getElementById('wins').textContent = `Wins : ${profileData.wins}`;
		document.getElementById('losses').textContent = `Losses : ${profileData.losses}`;
		document.getElementById('friends').textContent = `Friends : ${profileData.friends.length}`;
	})
	.catch(error =>
	{
		console.error('Failed to fetch user data:', error);
	});

});

logoutButton.addEventListener('click', function()
{
	localStorage.clear();
	window.location.href = '/';
});