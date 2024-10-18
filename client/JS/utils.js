import { fetchUserData } from './fetchFunctions.js';
import { securelyGetAccessToken } from './fetchFunctions.js';

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

export const tokenIsValid = async () => {
	try {
		await securelyGetAccessToken();
		return true;
	} catch (error) {
	return false;
	}
}

export const createNavbar = async () => {
	document.addEventListener('DOMContentLoaded', async function () {
		const navbarContent = document.createElement('nav');
	
		try {
			const data = await tokenIsValid();
			navbarContent.innerHTML = `
				<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
						<div class="container-fluid">
			<!-- Dropdown for the "H" -->
			<div class="dropdown">
				<a class="navbar-brand dropdown-toggle" href="#" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					MENU
				</a>
				<div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
					<a class="dropdown-item" href="/landing">Landing</a>
					<a class="dropdown-item" id="logdiv" href="/profile">Profile</a>
					<a class="dropdown-item" href="/leaderboard">Leaderboard</a>
					<a class="dropdown-item" href="/history">Match History</a>
					<a class="dropdown-item" href="/customize">Customize</a>
				</div>
			</div>
	
			<!-- Dropdown for notifications -->
			<div class="dropdown ml-3">
				<a class="navbar-brand dropdown-toggle" href="#" id="newDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					≡
				</a>
				<div class="dropdown-menu" id="notifications" aria-labelledby="newDropdownMenuLink">
				</div>
			</div>
	
			<!-- Navbar items -->
			<div class="collapse navbar-collapse d-flex align-items-center justify-content-end">
				<ul class="navbar-nav w-100 flex-grow-1">
					<li class="nav-item flex-fill">
						<a class="nav-link nav-item-hover" href="/pong">PONG</a>
					</li>
					<li class="nav-item flex-fill">
						<a class="nav-link nav-item-hover" href="/tic-tac-toe">TIC-TAC-TOE</a>
					</li>
				</ul>
			</div>
		</div>
		</nav>
				`;
		} catch (error) {
			console.error('Error:', error);
			// In case of error, show only login link
			navbarContent.innerHTML = `
				<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
					<div class="collapse navbar-collapse d-flex align-items-stretch">
				<ul class="navbar-nav w-100 flex-grow-1">
				 <a class="nav-link" href="/login">Login</a>
					<li class="nav-item flex-fill">
						<a class="nav-link nav-item-hover" href="/pong">PONG</a>
					</li>
					<li class="nav-item flex-fill">
						<a class="nav-link nav-item-hover" href="/tic-tac-toe">TIC-TAC-TOE</a>
					</li>
				</ul>
			</div>
			</nav>
			`;
		}
		const targetDiv = document.getElementById('navbarContent');
		targetDiv.appendChild(navbarContent);
	})
	};
	

