import { fetchUserData } from "./fetchFunctions.js";
import { getWebSocket } from "./singletonSocket.js"
import { createNavbar } from "./utils.js";

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

document.addEventListener('DOMContentLoaded', async function ()
{
	await createNavbar();
	data = await fetchUserData();
	console.log('trying to connect');
	if (data === "")
		connected = true;
	if (connected)
	{
		console.log('connected');
		socket = await getWebSocket();
		socket.addEventListener('message', function(event)
		{
			const message = JSON.parse(event.data);
			console.log('Parsed message:', message);
			if (message.type == "receive_invite")
				addNewDropdownItem(message.game, '/' + message.game, message.matchId);
				
		});
	}
});


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



