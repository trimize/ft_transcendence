import { fetchUserData, getUser, sendFriendRequest, getFriendNotifications, refuseFriendRequest, addFriend, getFriends, getPendingRequest, createGame } from "./fetchFunctions.js";
import { BACKEND_URL, DEFAULT_PROFILE_PIC /* getUserInfo */ } from "./appconfig.js";
import { getWebSocket } from "./singletonSocket.js";

let currentChatUser;
let socket;
let actualUser;
let messages = {};
let gameChosen;
let isPowerEnabled;
let offline = true;

function closeInviteListener(inviteDiv, inviteInput)
{
    const cancelInviteButton = document.getElementById('cancelInviteButton');
    cancelInviteButton.addEventListener('click', function()
    {
        inviteDiv.style.display = 'none';
        inviteInput.value = '';
    });
}

const addEventListeners = () => {
    let singleClicked = false;
    let multiClicked = false;
    let onlineClicked = false;
    const faces = document.querySelectorAll('.Face');
    const ballSlider = document.getElementById('ballSpeed');
    const ballSpeedComment = document.getElementById('inputRangeText');
    const ballSpeedDiv = document.getElementById('inputRangeDiv');
    const AITitle = document.getElementById('ballSpeedText');
    const ballAccDiv = document.getElementById('ballAccDiv');
    AITitle.style.display = "none";
    ballSlider.style.display = "none";
    let invitee;

    document.getElementById('powers').addEventListener('change', function() {
        isPowerEnabled = this.checked;
    });
    

    // Iterate over the NodeList and add an event listener to each element
    faces.forEach((face) =>
    {
        face.addEventListener('click', (event) =>
        {
            const singleplayerMenu = document.getElementById('singleplayer');
            const multiplayerMenu = document.getElementById('multiplayer');
            const onlineMultiplayerMenu = document.getElementById('online_multiplayer');
            const buttonPlay = document.getElementById('buttonPlay');
            buttonPlay.classList.add('hide-before');
            buttonPlay.classList.add('hide-after');
            buttonPlay.classList.add('hide-hover');
            buttonPlay.style.color = "rgb(94, 93, 93)";

            singleplayerMenu.addEventListener('click', function()
            {
                if (singleClicked == false)
                {
                    if (onlineClicked == true) {
                        inviteInput.value = '';
                        inviteContainer.style.display = 'none';
                    }
                    singleplayerMenu.style.textShadow = "0 0 15px rgb(255, 255, 255)";
                    singleClicked = true;
                    onlineClicked = false;
                    multiplayerMenu.style.textShadow = "0 0 0px rgb(255, 255, 255)";
                    multiClicked = false;
                    buttonPlay.classList.remove('hide-before');
                    buttonPlay.classList.remove('hide-after');
                    buttonPlay.classList.remove('hide-hover');
                    buttonPlay.style.color = "rgb(0, 0, 0)";
                    ballSlider.style.display = "block";
                    AITitle.style.display = "block";
                }
                else if (singleClicked == true)
                {
                    singleplayerMenu.style.textShadow = "0 0 0px rgb(255, 255, 255)";
                    singleClicked = false;
                }
            });

            multiplayerMenu.addEventListener('click', function()
            {
                if (multiClicked == false)
                {
                    if (onlineClicked == true) {
                        inviteInput.value = '';
                        inviteContainer.style.display = 'none';
                    }
                    multiplayerMenu.style.textShadow = "0 0 15px rgb(255, 255, 255)";
                    multiClicked = true;
                    onlineClicked = false;
                    singleplayerMenu.style.textShadow = "0 0 0px rgb(255, 255, 255)";
                    singleClicked = false;
                    buttonPlay.classList.remove('hide-before');
                    buttonPlay.classList.remove('hide-after');
                    buttonPlay.classList.remove('hide-hover');
                    buttonPlay.style.color = "rgb(0, 0, 0)";
                    if (AITitle.textContent == "AI Difficulty")
                    {
                        AITitle.style.display = "none";
                        ballSlider.style.display = "none";
                        ballSpeedComment.textContent = " ";
                    }
                }
                else if (multiClicked == true)
                {
                    multiplayerMenu.style.textShadow = "0 0 0px rgb(255, 255, 255)";
                    multiClicked = false;
                }
            });
            console.log(offline);
            if (!offline)
            {
                onlineMultiplayerMenu.addEventListener('click', function()
                {
                    if (onlineClicked == false)
                    {
                        inviteContainer.style.display = 'block';
                        onlineMultiplayerMenu.style.textShadow = "0 0 15px rgb(255, 255, 255)";
                        onlineClicked = true;
                        multiClicked = false;
                        singleplayerMenu.style.textShadow = "0 0 0px rgb(255, 255, 255)";
                        singleClicked = false;
                        if (AITitle.textContent == "AI Difficulty")
                        {
                            AITitle.style.display = "none";
                            ballSlider.style.display = "none";
                            ballSpeedComment.textContent = " ";
                        }
                    }
                    else if (onlineClicked == true)
                    {
                        onlineMultiplayerMenu.style.textShadow = "0 0 0px rgb(255, 255, 255)";
                        onlineClicked = false;
                    }
                });
            }


            const backButtonGameMenu = document.getElementById('backButtonGameMenu');
            const leftDiv = document.getElementsByClassName('left')[0];
            const rightDiv = document.getElementsByClassName('right')[0];
            leftDiv.style.display = 'flex';
            rightDiv.style.display = 'flex';
            setTimeout(() => {
                rightDiv.style.right = '0';
                leftDiv.style.left = '0';
            }, 10);
            if (face.classList.contains('pongFace'))
            {
                ballAccDiv.style.display = "block";
                ballSpeedComment.textContent = " ";
                const gameTitle = document.getElementById('gameTitletext');
                gameTitle.textContent = "PONG";
                const gamePicture = document.getElementById('gamePicture');
                gamePicture.style.backgroundImage = 'url(../Assets/Pong.gif)';
                const gameText = document.getElementById('gameText');
                gameText.textContent = 'Pong game is cool';
                ballSpeedDiv.style.display = "flex";
                AITitle.textContent = "Ball speed";
                ballSlider.style.display = "block";
                AITitle.style.display = "block";
                gameChosen = "pong";
                ballSlider.addEventListener('input', function()
                {
                    if (ballSlider.value < 10)
                        ballSpeedComment.textContent = "Very Slow!";
                    else if (ballSlider.value < 20)
                        ballSpeedComment.textContent = "Slow!";
                    else if (ballSlider.value >= 20 && ballSlider.value < 30)
                        ballSpeedComment.textContent = "Normal Speed!";
                    else if (ballSlider.value > 30 && ballSlider.value <= 35)
                        ballSpeedComment.textContent = "Fast!";
                    else if (ballSlider.value > 35)
                        ballSpeedComment.textContent = "Very fast!";
                });
            }
            else if (face.classList.contains('tttFace')) 
            {
                ballAccDiv.style.display = "none";
                ballSpeedComment.textContent = " ";
                const gameTitle = document.getElementById('gameTitletext');
                gameTitle.textContent = "Tic-Tac-Toe";
                gameTitle.style.background = 'none';
                gameTitle.style.color = 'white';
                const gamePicture = document.getElementById('gamePicture');
                gamePicture.style.backgroundImage = 'url(../Assets/tic-tac-toe.gif)';
                const gameText = document.getElementById('gameText');
                gameText.textContent = 'Tic-tac-toe game is cool';
                AITitle.textContent = "AI Difficulty";
                gameChosen = "ttt";
                if (multiClicked == true)
                {
                    ballSlider.style.display = "none";
                    AITitle.style.display = "none";
                }
                else
                {
                    ballSlider.style.display = "block";
                    AITitle.style.display = "block";
                }
            
                ballSlider.addEventListener('input', function()
                {
                    if (ballSlider.value < 19)
                        ballSpeedComment.textContent = "Easy AI";
                    else if (ballSlider.value >= 19)
                        ballSpeedComment.textContent = "Hard AI!";
                });
            }

            document.getElementById('buttonPlay').addEventListener('click', async () => {
                console.log('Button clicked');
                if (face.classList.contains('tttFace') && (multiClicked == true || singleClicked == true)) {
                    const params = new URLSearchParams();
                    params.append('offline', offline);
                    let matchId = null;
                    if (!offline) {
                        matchId = await createGame(actualUser.id, null, 'tic-tac-toe', isPowerEnabled);
                        params.append('matchId', matchId);
                    }
                    params.append('powers', isPowerEnabled);
                    params.append('host', actualUser.id);
                    params.append('type', (multiClicked == true ? 'multi' : 'single'));
                    if (singleClicked == true) {
                        params.append('ai', (ballSlider.value < 19 ? 'easy' : 'hard'));
                    }
                    window.location.href = `/tic-tac-toe?${params.toString()}`;
                }
            });

            backButtonGameMenu.addEventListener('click', function()
            {
                setTimeout(() => {
                    rightDiv.style.right = '-60vw';
                    leftDiv.style.left = '-40vw';
                }, 10);
                if (rightDiv.style.right == '-60vw')
                {
                    leftDiv.style.display = 'none';
                    rightDiv.style.display = 'none';
                }
            });
        });
    });
    return ;
};

function renderBaseHomeBlock()
{
    return `
            <div id="content" class="vh-100">
            <div class="half left">
                <div id="backButtonGameMenu"></div>
                <div id="gameTitle">
                    <span class="text" id="gameTitletext"></span>
                </div>
                <div id="gamePicture"></div>
                <text id="gameText"></text>
            </div>
            <div class="half right">
                <span class= "gameMenuText" id="singleplayer">Singleplayer</span>
                <span class= "gameMenuText" id="multiplayer">Multiplayer</span>
                <div class="align-items-center justify-content-between" id="inputRangeDiv">
                    <label for="ballSpeed" id="ballSpeedText" class="customizeGameTitles">Ball Speed</label>
                    <input type="range" id="ballSpeed" class="form-control w-50" min="5" max="40">
                </div>
                <span id="inputRangeText">&nbsp;</span>
                <div class="align-items-center justify-content-between" id="powersDiv">
                    <label class="customizeGameTitles" for="powers">Enable powers</label>
                    <label class="switch">
                        <input type="checkbox" id="powers">
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="align-items-center justify-content-between" id="ballAccDiv">
                    <label class="customizeGameTitles" for="ballAcc">Enable ball acceleration</label>
                    <label class="switch">
                        <input type="checkbox" id="ballAcc">
                        <span class="slider round"></span>
                    </label>
                </div>
                <button class="button-85" role="button" id="buttonPlay">Play</button>
            </div>
            <a id="loginBtn" href="/login">Login</a>
            <div id="bg"></div>
            <div class="Cube">
                <a class="Face pongFace" front>PONG</a>
                <a class="Face pongFace" back>PONG</a>
                <a class="Face tttFace" right>TTT</a>
                <a class="Face tttFace" left>TTT</a>
                <a class="Face tttFace" top>TTT</a>
                <a class="Face pongFace" bottom>PONG</a>
            </div>`;
}

// addEventListeners();
//        showChat();

function renderBaseHomeConnected()
{
    return `<div class="half left">
                <span id="backButtonGameMenu"></span>
                <div id="gameTitle">
                    <span class="text" id="gameTitletext"></span>
                </div>
                <div id="gamePicture"></div>
                <text id="gameText"></text>
            </div>
            <div class="half right">
                <span class= "gameMenuText" id="singleplayer">Singleplayer</span>
                <span class= "gameMenuText" id="multiplayer">Local Multiplayer</span>
                <span class= "gameMenuText" id="online_multiplayer">Online Multiplayer</span>
                <div id="inviteContainer">
                    <input type="text" id="inviteInput" placeholder="Enter username" />
                    <button id="inviteButton">Go to lobby</button>
                    <button id="cancelInviteButton">Cancel</button>
                </div>
                <div class="align-items-center justify-content-between" id="inputRangeDiv">
                    <label for="ballSpeed" id="ballSpeedText" class="customizeGameTitles">Ball Speed</label>
                    <input type="range" id="ballSpeed" class="form-control w-50" min="5" max="40">
                </div>
                <span id="inputRangeText">&nbsp;</span>
                <div class="align-items-center justify-content-between" id="powersDiv">
                    <label class="customizeGameTitles" for="powers">Enable powers</label>
                    <label class="switch">
                        <input type="checkbox" id="powers">
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="align-items-center justify-content-between" id="ballAccDiv">
                    <label class="customizeGameTitles" for="ballAcc">Enable ball acceleration</label>
                    <label class="switch">
                        <input type="checkbox" id="ballAcc">
                        <span class="slider round"></span>
                    </label>
                </div>
                <button class="button-85" role="button" id="buttonPlay">Play</button>
            </div>
            <a id="profileDiv" href="/profile">
                <div id="profilePicture"></div>
                <text id="profileUsername"></text>
            </a>
            <div id="showFriends"></div>
            <div id="friendsListDiv">
                <div id="friendsTitle"></div>

                <textarea type="text" id="searchContact" placeholder="John Doe"></textarea>
                <div id="plusButton">+</div>
                <ul id="friendsList">
                </ul>
            </div>
            <div id="showChatRoom"></div>
            <div id="chatRoom">
                <div id="notFriendMessage">This user is not your friend</div>
                <div id="invitationDiv">
                    <ul id="invitationList">
                        <!--<il class="invitationElement">Tic-Tac-Toe
                            <div class="correctDiv"></div>
                            <div class="crossDiv"></div>
                        </il>-->
                    </ul>
                </div>
                <div id="conversation">
                    
                </div>
                <textarea type="text" id="chatInput" placeholder="Type away .."></textarea>
                <div id="sendButton"></div>
            </div>
            <div id="bg"></div>
            <div class="Cube">
                <a class="Face pongFace" front>PONG</a>
                <a class="Face pongFace" back>PONG</a>
                <a class="Face tttFace" right>TTT</a>
                <a class="Face tttFace" left>TTT</a>
                <a class="Face tttFace" top>TTT</a>
                <a class="Face pongFace" bottom>PONG</a>
            </div>`
}

function renderConversationBalloon(message, isSender) {
    const conversationDiv = document.getElementById('conversation');
    const balloon = document.createElement('div');
    balloon.classList.add('balloon');
    balloon.classList.add(isSender ? 'sender' : 'receiver');
    balloon.textContent = message;
    conversationDiv.prepend(balloon);
}

async function showChat() {
    let showFriendBool = false;
    let isFriendClicked = false;
    const friendNotifications = await getFriendNotifications();
    const chatRoom = document.getElementById('chatRoom');
    const conversationDiv = document.getElementById('conversation');
    const showChatRoom = document.getElementById('showChatRoom');
    const friendItems = document.querySelectorAll('.friendItem');
    console.log(friendItems);
    const cube = document.getElementsByClassName('Cube');
    const chatInput = document.getElementById('chatInput');
    const faces = document.querySelectorAll('.Face');
    const showFriends = document.getElementById('showFriends');
    const notFriendMessage = document.getElementById('notFriendMessage');
    const inviteInput = document.getElementById('inviteInput');
    const inviteButton = document.getElementById('inviteButton');
    const inviteContainer = document.getElementById('inviteContainer');

    inviteButton.addEventListener('click', async () => {

        console.log('Invite button clicked');
        const username = inviteInput.value.trim();
        let invitee = await getUser(username);
        if (invitee && invitee.id !== actualUser.id) {
            console.log('Invitee already set:', invitee);
            const params = new URLSearchParams();
            if (gameChosen == "ttt")
                params.append('game', 'ttt');
            else
                params.append('game', 'pong');
            params.append('powers', isPowerEnabled);
            params.append('host', actualUser.id);
            params.append('invitee', invitee.id);
            window.location.href = `/lobby?${params.toString()}`;
        } else {
            console.log('User not found');
            const alert = document.createElement('p').textContent = 'User not found';
            alert.style.color = 'red';
            inviteContainer.appendChild(alert);
        }
    });

    addFriendButton();

    closeInviteListener(inviteContainer, inviteInput);

    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto'; // Reset the height
        chatInput.style.height = chatInput.scrollHeight + 'px'; // Set the new height based on content
    });

    chatInput.addEventListener('keypress', async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const message = chatInput.value;
            if (message.trim() === '') {
                return;
            }
            renderConversationBalloon(message, true);
            chatInput.value = '';
            chatInput.style.height = 'auto';
            chatInput.style.height = chatInput.scrollHeight + 'px';
            if (currentChatUser) {
                console.log('Current chat user:', currentChatUser);
                const messageData = {
                    type: "chat_message",
                    senderId: actualUser.id,
                    receiverId: currentChatUser.id,
                    message: message
                };
                if (!messages[currentChatUser.id]) {
                    messages[currentChatUser.id] = [];
                }
                messages[currentChatUser.id].push(messageData);
                console.log('Sending message:', messageData);
                socket.send(JSON.stringify(messageData));
            }
        }
    });

    friendItems.forEach((friendItem) => {
        friendItem.addEventListener('click', async function() {
            if (friendItem.classList.contains('friend'))
                notFriendMessage.style.display = 'none';
            else
            {
                chatInput.disabled = true;
                chatInput.placeholder = "You need to be friends";
                notFriendMessage.style.display = 'block';
            }
            const friendrequests = await getFriendNotifications();
            renderFriendRequestNotif(friendrequests);
            console.log('Clicked!');
            document.documentElement.style.setProperty('--cube-size', '10vmax');
            showFriends.style.display = 'none';
            cube[0].style.top = "50px";
            cube[0].style.left = "90px";
            faces.forEach((face) => {
                face.style.fontSize = "50px";
            });
            showChatRoom.style.bottom = "calc(100% - 300px - 40px)";
            chatRoom.style.bottom = "0";
            friendItems.forEach((friendItem) => {
                friendItem.style.backgroundColor = "";
            });
            friendItem.style.backgroundColor = "rgba(130, 132, 134, 0.356)";

            // Check if the friend is in the list of friend notifications
            const friendUsername = friendItem.textContent.trim();
            currentChatUser = await getUser(friendUsername); //May cause issues with async
            const friendNotification = friendNotifications.find(notification => notification.sender.username === friendUsername);
            if (friendNotification) {
                renderFriendRequestNotification(friendNotification.sender.id, false, null);
            }
            if (messages[friendUsername]) {
                messages[friendUsername].forEach(msg => {
                    renderConversationBalloon(msg.message, msg.sender === actualUser.username);
                });
            }
        });
    });

    showChatRoom.addEventListener('click', function() {
        showFriends.style.display = 'block';
        document.documentElement.style.setProperty('--cube-size', '20vmax');
        cube[0].style.top = "40vh";
        cube[0].style.left = "40vw";
        faces.forEach((face) => {
            face.style.fontSize = "100px";
        });
        chatRoom.style.bottom = "calc(-1 * (100% - 300px))";
        showChatRoom.style.bottom = "-20px";
        friendItems.forEach((friendItem) => {
            friendItem.style.backgroundColor = "";
        });
    });

    showFriends.addEventListener('click', function() {
        showFriends.classList.toggle('flipped');
        if (showFriendBool == false) {
            document.getElementById('friendsListDiv').style.right = "0px";
            showFriends.style.right = "248px";
            showFriendBool = true;
        } else {
            document.getElementById('friendsListDiv').style.right = "-250px";
            showFriends.style.right = "0px";
            showFriendBool = false;
        }
    });
}

async function renderFriendRequestNotification(friendId, isGameInvite, gameInfo) {
    const friendData = await getUser(friendId);
    const friendUsername = friendData.username;
    const conversationDiv = document.getElementById('conversation');
    const notificationDiv = document.createElement('div');
    notificationDiv.classList.add('friend-request-notification');

    const message = document.createElement('p');

    if (isGameInvite) {
        message.textContent = `${friendUsername} invited you to play ${gameInfo.game}.`;
    } else {
        message.textContent = `${friendUsername} sent you a friend request.`;
    }

    const acceptButton = document.createElement('button');
    acceptButton.textContent = 'Accept';
    acceptButton.style.backgroundColor = 'green';

    acceptButton.addEventListener('click', () => {
        // Handle accept friend request
        console.log(`Accepted request from ${friendUsername}`);
        if (isGameInvite) {

        } else {
            addFriend(friendId);
        }
        notificationDiv.remove();
    });
    
    const declineButton = document.createElement('button');
    declineButton.textContent = 'Decline';
    declineButton.style.backgroundColor = 'red';
    declineButton.addEventListener('click', () => {
        // Handle decline friend request
        console.log(`Declined request from ${friendUsername}`);
        if (isGameInvite) {

        } else {
            refuseFriendRequest(friendId);
        }
        notificationDiv.remove();
    });

    notificationDiv.appendChild(message);
    notificationDiv.appendChild(acceptButton);
    notificationDiv.appendChild(declineButton);
    conversationDiv.appendChild(notificationDiv);
}

async function addFriendButton()
{
    const addFriendButton = document.getElementById('plusButton');
    const textInput = document.getElementById('searchContact');
    const user = await fetchUserData();
    addFriendButton.addEventListener('click', async function ()
    {
        const friendName = textInput.value;
        const friendInfo = await getUser(friendName);
        console.log(friendInfo);
        if (friendName == user.username) {
            alert('You cannot add yourself as a friend');
            return;
        } else if (friendName == '') {
            alert('Please enter a username');
            return;
        } else if (friendInfo == null) {
            alert('User does not exist');
            return;
        } /* else if (user.friends.includes(friendName)) {
            alert('User is already your friend');
            return;
        } */

        sendFriendRequest(friendName);
    });
}

async function addFriendNotif()
{

}

async function renderPendingRequest(pendingRequests)
{
    const friendsList = document.getElementById('friendsList');
    for(let i = 0; i < pendingRequests.length; i++)
    {
        console.log(pendingRequests[i]);
        const pendingRequest = document.createElement('li');
        pendingRequest.classList.add('friendItem');
        pendingRequest.textContent = pendingRequests[i].receiver.username;
        pendingRequest.style.color = "blue";
        pendingRequest.classList.add('pending');
        friendsList.appendChild(pendingRequest);
    };
    // showChat();
}

async function renderFriendRequest(friendNotifications)
{
    const friendsList = document.getElementById('friendsList');
    // console.log(friendNotifications);
    for(let i = 0; i < friendNotifications.length; i++)
    {
        console.log(friendNotifications[i]);
        const friendRequest = document.createElement('li');
        friendRequest.classList.add('friendItem');
        friendRequest.textContent = friendNotifications[i].sender.username;
        friendRequest.style.color = "grey";
        friendRequest.classList.add('friendRequest')
        friendsList.appendChild(friendRequest);
    };
    // showChat();
}

async function renderFriendRequestNotif(friendNotifications)
{
    const invitationList = document.getElementById('invitationList');
    // console.log(friendNotifications);
    for(let i = 0; i < friendNotifications.length; i++)
    {
        const friendRequest = document.createElement('li');
        friendRequest.classList.add('friendItem');
        friendRequest.textContent = friendNotifications[i].sender.username;
        friendRequest.style.color = "aliceblue";
        friendRequest.classList.add('invitationElement');
        const correct = document.createElement('div');
        correct.classList.add('correctDiv');
        friendRequest.appendChild(correct);
        const cross = document.createElement('div');
        cross.classList.add('crossDiv');
        friendRequest.appendChild(cross);
        invitationList.appendChild(friendRequest);
    };
    // showChat();
}

async function renderFriendsList(friends, friendNotifications, pendingRequests)
{
    renderFriendRequest(friendNotifications);
    renderPendingRequest(pendingRequests)
    const friendsList = document.getElementById('friendsList');
    // console.log(friendNotifications);
    for(let i = 0; i < friends.length; i++)
    {
        console.log(friends[i]);
        const friendElement = document.createElement('li');
        friendElement.classList.add('friendItem');
        friendElement.textContent = friends[i].username;
        friendElement.style.color = "cyan";
        friendElement.classList.add('friend');
        friendsList.appendChild(friendElement);
    };
    showChat();
}

const getProfileInfo = async () => {
    try {
        const profilePic = document.getElementById('profilePicture');
        const usernameElement = document.getElementById('profileUsername');
        const friendsListElement = document.getElementById('friendsList');
        friendsListElement.innerHTML = '';
        // const noFriendsMessageElement = document.getElementById('noFriendsMessage');
        const profileData = await fetchUserData();
        
        if (profileData.profile_pic !== null) {
            profilePic.style.backgroundImage = `url(${BACKEND_URL}${profileData.profile_pic})`;
        } else {
            profilePic.style.backgroundImage = `url(${DEFAULT_PROFILE_PIC})`;
        }
        if (profileData.username) {
            usernameElement.textContent = profileData.username;
        }
        if (profileData.friends && profileData.friends.length > 0) {
            profileData.friends.forEach(friend => {
                const li = document.createElement('li');
                li.className = 'friendItem';
                li.textContent = friend;
                friendsListElement.appendChild(li);
            });
            // noFriendsMessageElement.style.display = 'none';
        } else {
            // noFriendsMessageElement.style.display = 'block';
        }
    } catch (error) {
        console.error('Failed to fetch user data:', error);
    }

}

export const renderBaseHomePage = async () =>
{
    let token = localStorage.getItem('access');
    if (token)
    {
        offline = false;
        document.getElementById('content').innerHTML = renderBaseHomeConnected();
        socket = await getWebSocket();
        actualUser = await fetchUserData();
        const friends = await getFriends();
        const friendNotifications = await getFriendNotifications();
        const pendingRequests = await getPendingRequest();
        getProfileInfo();
        // renderFriendRequest();
        addEventListeners();
        renderFriendsList(friends, friendNotifications, pendingRequests);

        // showChat();
        socket.addEventListener('message', function(event)
        {
            const message = JSON.parse(event.data);
            if (message.type === 'chat_message')
            {
                if (!messages[message.senderId]) {
                    messages[message.senderId] = [];
                }
                console.log('Parsed message:', message);
                console.log('Current chat user:', currentChatUser);
                messages[message.senderId].push(message);
                if (currentChatUser && message.senderId === currentChatUser.id)
                {
                    renderConversationBalloon(message.message, false);
                }
            } else if (message.type === 'send_invite') {
                console.log('Received game invite:', message);
                if (!messages[message.hostId]) {
                    messages[message.hostId] = [];
                }
                messages[message.hostId].push(message);
                if (currentChatUser && message.hostId === currentChatUser.id) {
                    renderFriendRequestNotification(message.hostId, true, message.game);
                }
            }
        });
    }
    else
    {
        offline = true;
        document.getElementById('content').innerHTML = renderBaseHomeBlock();
        addEventListeners();
    }
    
}
