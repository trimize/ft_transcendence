import { fetchUserData } from "./fetchFunctions.js";
import { createNavbar } from "./utils.js";

const profilePicture = document.getElementById('profilePicture');
const logoutButton = document.getElementById('logoutBtn');

document.addEventListener('DOMContentLoaded', async function () {
	try {
		await createNavbar();
		const data = await fetchUserData();
		if (data === "") {
			window.location.href = '/Login';
			return;
		}
		if (data.profile_pic !== null)
			profilePicture.src = `${BACKEND_URL}${data.profile_pic}`;
		else
			profilePicture.src = 'https://cdn-icons-png.flaticon.com/512/9203/9203764.png';
		document.getElementById('username').textContent = data.username;
		document.getElementById('email').textContent = data.email;
		document.getElementById('wins').textContent = `Wins : ${data.wins}`;
		document.getElementById('losses').textContent = `Losses : ${data.losses}`;
		document.getElementById('friends').textContent = `Friends : ${data.friends.length}`;
	} catch (error) {
		console.error(error);
	}
	});

logoutButton.addEventListener('click', function () {
	localStorage.clear();
	window.location.href = '/';
});