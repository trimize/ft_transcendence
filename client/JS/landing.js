import { fetchUserData } from "./fetchFunctions.js";
import { getWebSocket } from "./singletonSocket.js"

let data;
let socket;
let connected = false;

async function sendMessage(message)
{
	if (socket.readyState === WebSocket.OPEN)
	{
		let json_message = JSON.stringify(message);
		socket.send(json_message);
	}
	else
	{
	    console.log('WebSocket is not open.');
	}
}

function addNewDropdownItem(text, href, matchId)
{
	const dropdownMenu = document.getElementById('notifications');
	
	const newItem = document.createElement('a');
	newItem.classList.add('dropdown-item');
	newItem.textContent = text;

	// Create the first button
	const button1 = document.createElement('button');
	button1.classList.add('btn', 'btn-primary', 'btn-sm');
	button1.textContent = 'Button 1';
	button1.onclick = async () => {
		const notifData =
		{
			type: "accept_invite",
			matchId: matchId
		};
		await sendMessage(notifData);
		window.location.href = href;
	};

	// Create the second button
	const button2 = document.createElement('button');
	button2.classList.add('btn', 'btn-secondary', 'btn-sm', 'ml-2');
	button2.textContent = 'Button 2';
	button2.onclick = async () => {
		const notifData =
		{
			type: "refuse_invite",
			matchId: matchId
		};
		await sendMessage(notifData);
	};

	// Append the buttons to the <a> element
	newItem.appendChild(button1);
	newItem.appendChild(button2);

	// Append the new item to the dropdown menu
	dropdownMenu.appendChild(newItem);
	
	// Append the new item to the dropdown menu
	dropdownMenu.appendChild(newItem);
}

//document.addEventListener('DOMContentLoaded', async function ()
//{
//	data = await fetchUserData();
//	console.log('trying to connect');
//	if (data === "")
//		connected = true;
//	if (connected)
//	{
//		console.log('connected');
//		socket = await getWebSocket();
//		socket.addEventListener('message', function(event)
//		{
//			const message = JSON.parse(event.data);
//			console.log('Parsed message:', message);
//			if (message.type == "receive_invite")
//				addNewDropdownItem(message.game, '/' + message.game, message.matchId);
				
//		});
//	}
//});


// data = await fetchUserData();
// console.log('trying to connect');
// if (data !== "")
// 	connected = true;
// if (connected)
// {
// 	console.log('connected');
// 	socket = await getWebSocket();
// 	socket.addEventListener('message', function(event)
// 	{
// 		const message = JSON.parse(event.data);
// 		console.log('Parsed message:', message);
// 		if (message.type == "send_invite")
// 			addNewDropdownItem(message.game, '/' + message.game, message.matchId);
			
// 	});
// 	document.getElementById('logdiv').textContent = 'Profile';
// 	document.getElementById('logdiv').href = '/profile';
// }

document.addEventListener('DOMContentLoaded', async function () {
    const navbarContent = document.getElementById('navbarContent');

    try {
        const data = await fetchUserData();
		console.log(data);
        if (!data) {
            // User not logged in, show only login link
            navbarContent.innerHTML = `
                
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
            `;
        } else {
            // User logged in, show dropdown menu
            navbarContent.innerHTML = `
                    <div class="container-fluid">
        <!-- Dropdown for the "H" -->
        <div class="dropdown">
            <a class="navbar-brand dropdown-toggle" href="#" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                H
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
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link nav-item-hover" href="/pong">PONG</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link nav-item-hover" href="/tic-tac-toe">TIC-TAC-TOE</a>
                </li>
            </ul>
        </div>
    </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        // In case of error, show only login link
        navbarContent.innerHTML = `
            
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
        `;
    }
});