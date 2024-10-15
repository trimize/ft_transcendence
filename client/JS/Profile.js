import { fetchUserData } from "./user_info.js";

// const usernameDiv = document.getElementById('username');
// const emailDiv = document.getElementById('email');
// const winsDiv = document.getElementById('wins');
// const lossesDiv = document.getElementById('losses');
// const profilePicture = document.getElementById('profilePicture');

document.addEventListener('DOMContentLoaded', function()
{
	fetchUserData().then(profileData =>
	{
		const profilePicture = document.getElementById('profilePicture');
        profilePicture.src = profileData.profile_picture || 'https://cdn-icons-png.flaticon.com/512/9203/9203764.png'; // Replace with your default URL if needed

        // Update other profile information
        document.getElementById('username').textContent = profileData.username;
        document.getElementById('email').textContent = profileData.email;
        document.getElementById('wins').textContent = `Wins : ${profileData.wins}`;
        document.getElementById('losses').textContent = `Losses : ${profileData.losses}`;
	})
	.catch(error =>
	{
		console.error('Failed to fetch user data:', error);
	})

});


