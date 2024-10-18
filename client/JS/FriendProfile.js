import { fetchUserData } from "./fetchFunctions.js";

const profilePicture = document.getElementById('profilePicture');

document.addEventListener('DOMContentLoaded', async function () {
	try {
		const profileData = await fetchUserDataByName();
		if (profileData.profile_pic !== null)
			profilePicture.src = `http://localhost:8000${profileData.profile_pic}`;
		else
			profilePicture.src = 'https://cdn-icons-png.flaticon.com/512/9203/9203764.png';
		document.getElementById('username').textContent = profileData.username;
		document.getElementById('email').textContent = profileData.email;
		document.getElementById('wins').textContent = `Wins : ${profileData.wins}`;
		document.getElementById('losses').textContent = `Losses : ${profileData.losses}`;
		document.getElementById('friends').textContent = `Friends : ${profileData.friends.length}`;
	} catch (error) {
		window.location.href = '/Login';
		console.error('Failed to fetch user data:', error);
	};
});