import { fetchUserData } from "./fetchFunctions.js";
import { getWebSocket } from "./singletonSocket.js"

let data;
let socket;
let connected = false;

async function sendMessage(message)
{
	console.log('trying to send message');
	if (socket.readyState === WebSocket.OPEN)
	{
		console.log('socket still opened')
		let json_message = JSON.stringify(message);
		socket.send(json_message);
	}
	else
	{
	    console.log('WebSocket is not open.');
	}
}

function addNewDropdownItem(text, href, matchId, inviteeId)
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
			inviteeId: inviteeId,
			matchId: matchId
		};
		console.log(notifData);
		await sendMessage(notifData);
		window.location.href = href + "/" + matchId + "/";
	};

	// Create the second button
	const button2 = document.createElement('button');
	button2.classList.add('btn', 'btn-secondary', 'btn-sm', 'ml-2');
	button2.textContent = 'Button 2';
	button2.onclick = async () => {
		const notifData =
		{
			type: "refuse_invite",
			inviteeId: inviteeId,
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

data = await fetchUserData();
if (data !== "")
	connected = true;
if (connected)
{
	socket = await getWebSocket();
	socket.addEventListener('message', function(event)
	{
		const message = JSON.parse(event.data);
		console.log('Parsed message:', message);
		if (message.type == "send_invite")
			addNewDropdownItem(message.game, '/' + message.game, message.matchId, data.id);
			
	});
	document.getElementById('logdiv').textContent = 'Profile';
	document.getElementById('logdiv').href = '/profile';
}