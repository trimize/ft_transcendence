import { fetchUserData, getUser, sendFriendRequest, getFriendNotifications, addFriend, refuseFriendRequest, getPendingRequest, getFriends} from "./fetchFunctions.js";
import { getWebSocket, sendMessage } from "./singletonSocket.js"

let data;
let socket;
let connected = false;
let searchedUser;
let friend_found = false;
let errorFound = false;
let allMessages = [];
let currentChatUserId = 0;
let currentChatUsername;
let friendId = 0;
let senderUserId = 0;

const searchFriendButton = document.getElementById('searchFriendBtn');
const friendsList = document.getElementById('friendsListDiv');
const sendFriendButton = document.getElementById('confirmAddFriend');
const cancelModal = document.getElementById('cancelModal');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const chatDiv = document.getElementById('chatDiv');

function addChatMessages()
{
	chatMessages.innerHTML = '';
	//console.log(allMessages);
	for (let i = 0; i < allMessages.length; i++)
	{
		if ((allMessages[i].receiverId == data.id && allMessages[i].senderId == friendId) || (allMessages[i].senderId == data.id && allMessages[i].receiverId == friendId))
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
	const redDotComponent = document.getElementById('dot' + String(id));
	if (chatDiv.style.display == "none" || currentChatUserId != id)
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

function addNewDropdownItem(text, href, matchId, inviteeId, tournamentBool, playerNumber)
{
	const dropdownMenu = document.getElementById('notifications');
	
	const newItem = document.createElement('a');
	newItem.classList.add('dropdown-item');
	newItem.textContent = text;

	// Create the first button
	const button1 = document.createElement('button');
	button1.classList.add('btn', 'btn-primary', 'btn-sm');
	button1.textContent = 'Accept';
	button1.onclick = async () =>
	{
		if (!tournamentBool)
		{
			const notifData =
			{
				type: "accept_invite",
				inviteeId: inviteeId,
				matchId: matchId
			};
			await sendMessage(notifData);
			window.location.href = href + "/" + matchId + "/";
		}
		else
		{
			const notifData =
			{
				type: "accept_invite",
				inviteeId: inviteeId,
				tournamentId: matchId,
				player_number: playerNumber
			};
			console.log('yes');
			await sendMessage(notifData);
			//window.location.href = href + "/" + matchId + "/";
		}
	};

	// Create the second button
	const button2 = document.createElement('button');
	button2.classList.add('btn', 'btn-secondary', 'btn-sm', 'ml-2');
	button2.textContent = 'Refuse';
	button2.onclick = async () =>
	{
		if (!tournamentBool)
		{
			const notifData =
			{
				type: "refuse_invite",
				inviteeId: inviteeId,
				matchId: matchId
			};
			await sendMessage(notifData);
		}
		else
		{
			const notifData =
			{
				type: "refuse_invite",
				inviteeId: inviteeId,
				tournamentId: matchId,
			};
			await sendMessage(notifData);
		}
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
		currentChatUserId = id;
		friendId = currentChatUserId;
		document.getElementById('dot' + String(id)).style.display = 'none';
		addChatMessages();
		currentChatUsername = friendName;
		chatDiv.style.display = 'block';
		chatInput.addEventListener('keydown', async function (event)
		{
			if (event.key === 'Enter' && chatInput.value.trim() !== '')
			{
				//addNewMessageJSON(data.id, id, chatInput.value);
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
	// socket = await getWebSocket();
	socket.addEventListener('message', function(event)
	{
		const message = JSON.parse(event.data);
		console.log('Parsed message:', message);
		if (message.type == "send_invite")
		{
			console.log(message.tournament);
			if (!message.tournament)
				addNewDropdownItem(message.game, '/' + message.game, message.matchId, data.id, message.tournament, 0);
			else
				addNewDropdownItem(message.game, '/tournament', message.tournamentId, data.id, message.tournament, message.player_number);
		}
		if (message.type == "chat_message" && message.senderId == data.id)
		{
			//console.log('user is sender');
			senderUserId = message.senderId;
			friendId = message.receiverId;
			addNewMessageJSON(message.senderId, message.receiverId, message.message);
			addChatMessages();
		}
		if (message.type == "chat_message" && message.senderId != data.id)
		{
			friendId = message.senderId;
			addNewMessageJSON(message.senderId, message.receiverId, message.message);
			checkMessages(message.senderId);
			if (currentChatUserId == message.senderId)
				addChatMessages();
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
		addAcceptedFriends(friendsArray[i].username, friendsArray[i].id);
	searchAndAddFriend(friendPendingArray);
}

if (!connected)
	friendsList.style.display = 'none';