import { fetchUserData, getUser, sendFriendRequest, getFriendNotifications, addFriend, refuseFriendRequest, getPendingRequest, getFriends} from "./fetchFunctions.js";
import { getWebSocket } from "./singletonSocket.js"

let data;
let socket;
let connected = false;
let searchedUser;
let friend_found = false;
let errorFound = false;
let allMessages = [];
let currentChatUserId = 0;
let friendId = 0;
let senderUserId = 0;

const searchFriendButton = document.getElementById('searchFriendBtn');
const friendsList = document.getElementById('friendsListDiv');
const sendFriendButton = document.getElementById('confirmAddFriend');
const cancelModal = document.getElementById('cancelModal');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const chatDiv = document.getElementById('chatDiv');

async function sendMessage(message)
{
	//console.log('trying to send message');
	if (socket.readyState === WebSocket.OPEN)
	{
		//console.log('socket still opened')
		let json_message = JSON.stringify(message);
		socket.send(json_message);
	}
	else
	{
	    console.log('WebSocket is not open.');
	}
}

function addChatMessages(userId, friendId)
{
	chatMessages.innerHTML = '';
	for (let i = 0; i < allMessages.length; i++)
	{
		if ((allMessages[i].receiverId == userId && allMessages[i].senderId == friendId) || (allMessages[i].senderId == userId && allMessages[i].receiverId == friendId))
		{
			const newMessage = document.createElement('span');
			newMessage.textContent = allMessages[i].message;
			chatMessages.appendChild(newMessage);

			chatMessages.scrollTop = chatMessages.scrollHeight;

			if (chatMessages.children.length > 6) {
				chatMessages.removeChild(chatMessages.firstChild);
			}
		}
	}
}

async function checkMessages(id)
{
	const friendComponent = document.getElementById(String(id));
	//console.log(friendComponent);
	const redDotComponent = document.getElementById('dot' + String(id));
	if (chatDiv.style.display == "none")
		redDotComponent.style.display = "block";
}

function addNewFriendNotif(username, id)
{
	const dropdownMenu = document.getElementById('notifications');
	
	const newItem = document.createElement('a');
	newItem.classList.add('dropdown-item');
	newItem.textContent = username;

	// Create the first button
	const button1 = document.createElement('button');
	button1.classList.add('btn', 'btn-primary', 'btn-sm');
	button1.textContent = 'Accept';
	button1.onclick = async () => {
		await addFriend(id);
		newItem.remove();
	};

	// Create the second button
	const button2 = document.createElement('button');
	button2.classList.add('btn', 'btn-secondary', 'btn-sm', 'ml-2');
	button2.textContent = 'Refuse';
	button2.onclick = async () => {
		await refuseFriendRequest(id);
		newItem.remove();
	};

	// Append the buttons to the <a> element
	newItem.appendChild(button1);
	newItem.appendChild(button2);

	// Append the new item to the dropdown menu
	dropdownMenu.appendChild(newItem);
	
	// Append the new item to the dropdown menu
	dropdownMenu.appendChild(newItem);
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
		//console.log(notifData);
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
	listItem.style.color = "grey";
	friendsListItems.appendChild(listItem);
}

function addAcceptedFriends(friendName, id)
{
	const acceptedFriendsItems = document.getElementById('acceptedFriendsItems');
	const listItem = document.createElement('li');
	listItem.setAttribute('id', id);
	const notificationDot = document.createElement('span');
	notificationDot.classList.add('notification-dot');
	notificationDot.setAttribute('id', 'dot' + id);
	listItem.className = 'list-group-item';
	listItem.textContent = friendName;
	acceptedFriendsItems.appendChild(listItem);
	listItem.appendChild(notificationDot);
	notificationDot.style.display = 'none';

	listItem.addEventListener('click', function()
	{
		addChatMessages(data.id, id);
		currentChatUserId = id;
		document.getElementById('dot' + String(id)).style.display = 'none';
		chatDiv.style.display = 'block';
		chatInput.addEventListener('keydown', async function (event)
		{
			if (event.key === 'Enter' && chatInput.value.trim() !== '')
			{
				addNewMessageJSON(data.id, id, chatInput.value);
				if (currentChatUserId == friendId || data.id == senderUserId)
					addChatMessages(data.id, id);
				const liveChatData =
				{
					type: "chat_message",
					senderId: data.id,
					receiverId: id,
					message: chatInput.value
				};
				await sendMessage(liveChatData);
				chatInput.value = '';
			}
		});
	});
}

async function searchAndAddFriend(friendPendingArray)
{
	searchFriendButton.addEventListener('click', async function() 
	{
		searchedUser = document.getElementById('inputFriend').value;
		const modalError = document.getElementById('modalError');
		modalError.style.display = 'none';
		modalError.style.color = "red";
		const userData = await getUser(searchedUser);
		//console.log(userData);
		if (userData == "")
		{
			searchedUser = "No user found!"
			sendFriendButton.style.display = "none";
			cancelModal.textContent = "Close";
		}
		else
		{
			for(let i = 0; i < friendPendingArray.length; i++)
			{
				if (searchedUser == friendPendingArray[i])
				{
					modalError.style.display = "block";
					modalError.style.textContent = "Already sent a friend request to " + friendPendingArray[i].slice(0, -3);
					errorFound = true;
				}
			}
			if (!errorFound)
			{
				searchedUser = userData.username;
				sendFriendButton.style.display = "block";
				cancelModal.textContent = "Cancel";
				friend_found = true;
			}
		}
		$("#addFriendModal").modal("show");
		if (friend_found)
		{
			document.getElementById('addFriendModalLabel').textContent = searchedUser;
			sendFriendButton.addEventListener('click', async function()
			{

				$("#addFriendModal").modal("hide");
				addFriendToList(searchedUser);
				await sendFriendRequest(searchedUser);
				clearInterval(sendFriendButton);
			});
		}
		clearInterval(searchFriendButton);
	});
}

function addNewMessageJSON(senderId, receiverId, messageData)
{
	const newObject = 
	{
		senderId: senderId,
		receiverId: receiverId,
		message: messageData
	}
	allMessages.push(newObject);
}

chatDiv.style.display = 'none';
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
		if (message.type == "chat_message")
			senderUserId = message.senderId;
		if (message.type == "chat_message" && message.senderId != data.id)
		{
			friendId = message.senderId;
			addNewMessageJSON(message.senderId, message.receiverId, message.message);
			checkMessages(message.senderId);
			//console.log(currentChatUserId);
			if (currentChatUserId == message.senderId);
				addChatMessages(data.id, message.senderId);
		}
	});


	document.getElementById('logdiv').textContent = 'Profile';
	document.getElementById('logdiv').href = '/profile';


	const friendNotifArray = await getFriendNotifications();
	for(let i = 0; i < friendNotifArray.length; i++)
		addNewFriendNotif(friendNotifArray[i].sender.username, friendNotifArray[i].sender.id);


	const friendPendingArray = await getPendingRequest();
	for(let i = 0; i < friendPendingArray.length; i++)
		addFriendToList(friendPendingArray[i].receiver.username);

	const friendsArray = await getFriends();

	for(let i = 0; i < friendsArray.length; i++)
	{
		addAcceptedFriends(friendsArray[i].username, friendsArray[i].id);
	}
	searchAndAddFriend(friendPendingArray);
}

if (!connected)
	friendsList.style.display = 'none';