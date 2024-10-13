import { fetchUserData } from "./user_info.js";

const usernameDiv = document.getElementById('username');
const emailDiv = document.getElementById('email');
const winsDiv = document.getElementById('wins');
const lossesDiv = document.getElementById('losses');

document.addEventListener('DOMContentLoaded', function()
{
	fetchUserData().then(data =>
	{
		usernameDiv.textContent = data.username;
		emailDiv.textContent = data.email;
		winsDiv.textContent = "Wins : " + data.wins;
		lossesDiv.textContent = "Losses : " + data.losses;
	})
	.catch(error =>
	{
		console.error('Failed to fetch user data:', error);
	})

});


