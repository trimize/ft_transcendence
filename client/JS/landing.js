import { fetchUserData, getUser } from "./fetchFunctions.js";
import { getWebSocket } from "./singletonSocket.js"

let data;
let socket;
let connected = false;

const searchFriendButton = document.getElementById('searchFriendBtn');
const friendsList = document.getElementById('friendsListDiv');
const sendFriendButton = document.getElementById('confirmAddFriend');
const cancelModal = document.getElementById('cancelModal');

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

function addFriendToList(friendName)
{
	const friendsListItems = document.getElementById('friendsListItems');

	const listItem = document.createElement('li');
	listItem.className = 'list-group-item';
	listItem.textContent = friendName;

	friendsListItems.appendChild(listItem);
}

async function searchAndAddFriend(params)
{
	let friend_found = false;
	searchedUser = document.getElementById('inputFriend').value
	const userData = getUser(searchedUser);
	if (userData == "")
	{
		searchedUser = "No user found!"
		sendFriendButton.style.display = "none";
		cancelModal.textContent = "Close";
	}
	else
	{
		searchedUser = userData.username;
		sendFriendButton.style.display = "block";
		cancelModal.textContent = "Cancel";
		friend_found = true;
	}
	searchFriendButton.addEventListener('click', function() 
	{
		$("#addFriendModal").modal("show");
		if (friend_found)
		{
			document.getElementById('addFriendModalLabel').textContent = searchedUser;
			sendFriendButton.addEventListener('click', function()
			{
				$("#addFriendModal").modal("hide");
				addFriendToList(searchedUser);
			});
		}
	});
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
		//if (message.type)
		//	;
	});
	document.getElementById('logdiv').textContent = 'Profile';
	document.getElementById('logdiv').href = '/profile';

	searchAndAddFriend();
}

if (!connected)
	friendsList.style.display = 'none';