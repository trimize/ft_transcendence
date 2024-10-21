import { fetchUserData } from "./fetchFunctions.js";
import { deleteUser, anonymiseUser } from "./fetchFunctionsUsers.js";

const profilePicture = document.getElementById('profilePicture');
const logoutButton = document.getElementById('logoutBtn');
const deleteButton = document.getElementById('deleteBtn');
const anonymiseButton = document.getElementById('anonymiseBtn');

document.addEventListener('DOMContentLoaded', async function () {
	try {
		const profileData = await fetchUserData();
		// if (profileData.profile_pic !== null)
		// 	profilePicture.src = `http://localhost:8000${profileData.profile_pic}`;
		// else
		// 	profilePicture.src = 'https://cdn-icons-png.flaticon.com/512/9203/9203764.png';
		// document.getElementById('username').textContent = profileData.username;
		// document.getElementById('email').textContent = profileData.email;
		// document.getElementById('wins').textContent = `Wins : ${profileData.wins}`;
		// document.getElementById('losses').textContent = `Losses : ${profileData.losses}`;
		// document.getElementById('friends').textContent = `Friends : ${profileData.friends.length}`;
	} catch (error) {
		// window.location.href = '/login';
		console.error('Failed to fetch user data:', error);
	};
});

logoutButton.addEventListener('click', function () {
	localStorage.clear();
	window.location.href = '/';
});

deleteButton.addEventListener('click', async function () {
	try {
		await deleteUser();
	} catch (error) {
		console.error('Error deleting user:', error);
	}
})

anonymiseButton.addEventListener('click', async function () {
	try {
		await anonymiseUser();
	} catch (error) {
		console.error('Error anonymising user:', error);
	}
})