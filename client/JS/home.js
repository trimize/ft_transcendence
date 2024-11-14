import { fetchUserData, blockFriend, getTournamentById, fetchMatch, getUser, sendFriendRequest, updateTournament, getFriendNotifications, refuseFriendRequest, addFriend, getFriends, getPendingRequest, createGame, createTournament, fetchUserById, getBlockedFriends } from "./fetchFunctions.js";
import { BACKEND_URL,  } from "./appconfig.js";
import { sendMessage, getWebSocket } from "./singletonSocket.js";
import { getCurrentTime } from "./utils.js";

let currentChatUser = null;
let actualUser;
let messages = {};
let gameChosen;
let matchmakingClicked = false;
let offline = true;
let theBallSpeed;
let socket;
let buttonBool = false;


function closeInviteListener(inviteDiv, inviteInput)
{
    const cancelInviteButton = document.getElementById('cancelInviteButton');
    cancelInviteButton.addEventListener('click', function()
    {
        inviteDiv.style.display = 'none';
        inviteInput.value = '';
        document.getElementById('inviteTextError').style.display = 'none';
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
    const ballAccDiv = document.getElementById('ballAccDiv');
    const ballAcc = document.getElementById('ballAcc');
    const powers = document.getElementById('powers');
    const AIHardMode = document.getElementById('aiDiv');
    ballSlider.style.display = "none";
    let invitee;
    

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
                    ballSlider.style.display = "flex";
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
                }
                else if (multiClicked == true)
                {
                    multiplayerMenu.style.textShadow = "0 0 0px rgb(255, 255, 255)";
                    multiClicked = false;
                }
            });

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
                        const matchmaking = document.getElementById('matchmaking');
                        const inviteInput = document.getElementById('inviteInput');
                        matchmaking.addEventListener('click', function()
                        {
                            if (matchmakingClicked == false)
                            {
                                inviteInput.value = "";
                                inviteInput.disabled = true;
                                inviteInput.placeholder = "Matchmaking chosen";
                                matchmaking.style.textShadow = "0 0 15px rgb(255, 255, 255)";
                                matchmakingClicked = true;
                            }
                            else
                            {
                                matchmaking.style.textShadow = "0 0 0px rgb(255, 255, 255)";
                                inviteInput.placeholder = "Enter a username";
                                inviteInput.disabled = false;
                                matchmakingClicked = false;
                            }
                        });
                    }
                    else if (onlineClicked == true)
                    {
                        onlineMultiplayerMenu.style.textShadow = "0 0 0px rgb(255, 255, 255)";
                        onlineClicked = false;
                    }
                });

                document.getElementById('tournament').addEventListener('click', async () => {
                    getBallSpeed();
                    let tournamentBody;
                    if (gameChosen == 'pong') {
                        tournamentBody = {
                            player1: actualUser.id,
                            powers: powers.checked,
                            ball_acc: ballAcc.checked,
                            ball_speed: theBallSpeed,
                            game: gameChosen,
                        };
                    }
                    else
                    {
                        tournamentBody = {
                            player1: actualUser.id,
                            powers: powers.checked,
                            game: gameChosen,
                        };
                    }
                    const newTournament = await createTournament(tournamentBody);
                    const params = new URLSearchParams();
                    params.append('tournamentId', newTournament.id);
                    window.location.href = `/tournament?${params.toString()}`;
                })
            }


            const backButtonGameMenu = document.getElementById('backButtonGameMenu');
            const leftDiv = document.getElementsByClassName('left')[0];
            const rightDiv = document.getElementsByClassName('right')[0];
            setTimeout(() => {
                rightDiv.style.right = '0';
                leftDiv.style.left = '0';
            }, 5);
            leftDiv.style.display = 'flex';
            rightDiv.style.display = 'flex';
            if (face.classList.contains('pongFace'))
            {
                AIHardMode.style.display = "none";
                ballAccDiv.style.display = "flex";
                ballSpeedComment.textContent = " ";
                const gameTitle = document.getElementById('gameTitletext');
                gameTitle.textContent = "PONG";
                const gamePicture = document.getElementById('gamePicture');
                gamePicture.style.backgroundImage = 'url(../Assets/Pong.gif)';
                const gameText = document.getElementById('gameText');
                gameText.innerHTML = 'Pong game is cool!<br>With powers is even cooler!<br>You can enable ball acceleration and movement speed to make the game more interesting!';
                ballSpeedDiv.style.display = "flex";
                ballSlider.style.display = "flex";
                gameChosen = "pong";
                ballSlider.addEventListener('input', function()
                {
                    if (ballSlider.value == 1)
                        ballSpeedComment.textContent = "Slow!";
                    else if (ballSlider.value == 2)
                        ballSpeedComment.textContent = "Normal!";
                    else if (ballSlider.value == 3)
                        ballSpeedComment.textContent = "Fast!";
                });
            }
            else if (face.classList.contains('tttFace')) 
            {
                document.getElementById('inputRangeDiv').style.display = "none";
                AIHardMode.style.display = "flex";
                ballAccDiv.style.display = "none";
                ballSlider.style.display = "none";
                ballSpeedComment.textContent = " ";
                const gameTitle = document.getElementById('gameTitletext');
                gameTitle.textContent = "Tic-Tac-Toe";
                gameTitle.style.background = 'none';
                gameTitle.style.color = 'white';
                const gamePicture = document.getElementById('gamePicture');
                gamePicture.style.backgroundImage = 'url(../Assets/tic-tac-toe.gif)';
                const gameText = document.getElementById('gameText');
                gameText.innerHTML = 'Reinvented Tic-tac-toe<br>In this version of tic-tac-toe, you can use powers to change the game!<br>Drag and drop a cell to switch positions with another cell. You can use this power once per game.';
                gameChosen = "tic-tac-toe";
                if (multiClicked == true)
                {
                    AIHardMode.style.display = "none";
                }
                else
                {
                    AIHardMode.style.display = "flex";
                }
            }

            document.getElementById('buttonPlay').addEventListener('click', async () => {
                if (face.classList.contains('tttFace') && (multiClicked == true || singleClicked == true)) {
                    const params = new URLSearchParams();
                    const aiHard = document.getElementById('aiHard');
                    params.append('offline', offline);
                    let matchId = null;
                    if (!offline) {
                        const requestBody = {
                            host: actualUser.id,
                            game: 'tic-tac-toe',
                            player1: actualUser.id,
                            player2: (invitee ? invitee.id : null),
                            match_type: (multiClicked == true ? 'local_multiplayer' : 'singleplayer'),
                            powers: powers.checked,
                            ai: (multiClicked ? null : (aiHard.checked ? 'hard' : 'easy')),
                            start_time: new Date()
                        };
                        matchId = await createGame(requestBody);
                        params.append('matchId', matchId);
                        params.append('host', actualUser.id);
                    }
                    params.append('powers', powers.checked);
                    params.append('type', (multiClicked == true ? 'local_multiplayer' : 'singleplayer'));
                    if (singleClicked == true) {
                        params.append('ai', aiHard.checked ? 'hard' : 'easy');
                    }
                    window.location.href = `/tic-tac-toe?${params.toString()}`;
                }
                else if (face.classList.contains('pongFace') && (multiClicked == true || singleClicked == true)) {
                    switch(ballSlider.value)
                    {
                        case 1:
                            theBallSpeed = 3;
                            break;
                        case 2:
                            theBallSpeed = 5;
                            break;
                        case 3:
                            theBallSpeed = 7;
                            break;
                        default:
                            theBallSpeed = 5;
                    }
                    const params = new URLSearchParams();
                    params.append('offline', offline);
                    let matchId = null;
                    if (!offline) {
                        const requestBody = {
                            host: actualUser.id,
                            game: 'pong',
                            player1: actualUser.id,
                            player2: (invitee ? invitee.id : null),
                            match_type: (multiClicked == true ? 'local_multiplayer' : 'singleplayer'),
                            powers: powers.checked,
                            ball_speed: theBallSpeed,
                            ball_acc: ballAcc.checked,
                            start_time: new Date().toISOString()
                        };
                        matchId = await createGame(requestBody);
                        params.append('matchId', matchId);
                        params.append('host', actualUser.id);
                    }
                    params.append('ballAcc', ballAcc.checked);
                    params.append('ballSpeed', theBallSpeed);
                    params.append('powers', powers.checked);
                    params.append('type', (multiClicked == true ? 'local_multiplayer' : 'singleplayer'));
                    window.location.href = `/pong?${params.toString()}`;
                }
            });

            backButtonGameMenu.addEventListener('click', function()
            {
                setTimeout(() => {
                    rightDiv.style.right = '-60vw';
                    leftDiv.style.left = '-40vw';
                }, 5);
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
                <button class="button-85" role="button" id="buttonPlay">Play</button>
            </div>
            <div class="half right">
                <span class= "gameMenuText" id="singleplayer">Singleplayer</span>
                <span class= "gameMenuText" id="multiplayer">Multiplayer</span>
                <div class="align-items-center justify-content-between" id="inputRangeDiv">
                    <label for="ballSpeed" id="ballSpeedText" class="customizeGameTitles">Ball Speed</label>
                    <input type="range" id="ballSpeed" class="form-control w-50" min="1" max="3">
                </div>
                <span id="inputRangeText">&nbsp;</span>
                <div class="align-items-center justify-content-between" id="aiDiv">
                    <label class="customizeGameTitles" for="aiHard">Enable powers</label>
                    <label class="switch">
                        <input type="checkbox" id="aiHard">
                        <span class="slider round"></span>
                    </label>
                </div>
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

function renderBaseHomeConnected()
{
    return `<div class="half left">
                <span id="backButtonGameMenu"></span>
                <div id="gameTitle">
                    <span class="text" id="gameTitletext"></span>
                </div>
                <div id="gamePicture"></div>
                <text id="gameText"></text>
                <button class="button-85" role="button" id="buttonPlay">Play</button>
                <a id="colorWheel"></a>
            </div>
            <div class="half right">
                <span class= "gameMenuText" id="singleplayer">Singleplayer</span>
                <span class= "gameMenuText" id="multiplayer">Local Multiplayer</span>
                <span class= "gameMenuText" id="online_multiplayer">Online Multiplayer</span>
                <span class= "gameMenuText" id="tournament">Tournament</span>
                <div id="inviteContainer">
                    <input type="text" id="inviteInput" placeholder="Enter username" />
                    <button id="inviteButton">Go to lobby</button>
                    <button id="matchmaking">Matchmaking</button>
                    <div id="pipe">||</div>
                    <div id="inviteTextError">Error</div>
                    <div id="inviteTextToLobby">Invite a friend</div>
                    <button id="cancelInviteButton">Cancel</button>
                </div>
                <div class="align-items-center justify-content-between" id="inputRangeDiv">
                    <label for="ballSpeed" id="ballSpeedText" class="customizeGameTitles">Ball Speed</label>
                    <input type="range" id="ballSpeed" class="form-control w-50" min="1" max="3">
                </div>
                <span id="inputRangeText">&nbsp;</span>
                <div class="align-items-center justify-content-between" id="aiDiv">
                    <label class="customizeGameTitles" for="aiHard">AI Hard mode</label>
                    <label class="switch">
                        <input type="checkbox" id="aiHard">
                        <span class="slider round"></span>
                    </label>
                </div>
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
            </div>
            <a id="profileDiv" href="/profile">
                <div id="profilePicture"></div>
                <text id="profileUsername"></text>
            </a>
            <div id="showFriends"></div>
            <div id="notifShowFriends"></div>
            <div id="friendsListDiv">
                <div id="friendsTitle"></div>
                <text id="friendAddStatus"></text>
                <textarea type="text" id="searchContact" placeholder="Search user"></textarea>
                <div id="plusButton">+</div>
                <ul id="friendsList">
                </ul>
            </div>
            <div id="showChatRoom"></div>
            <div id="chatRoom">
                <div id="notFriendMessage">This user is not your friend</div>
                <div id="invitationDiv">
                    <ul id="invitationList">
                    </ul>
                </div>
                <div id="conversation">
                
                </div>
                <textarea type="text" id="chatInput" placeholder="Type away .."></textarea>
                <div id="sendButton"></div>
                <div id="buttonContainer">
                    <button id="playPongButton">Play Pong</button>
                    <button id="playTicTacToeButton">Play Tic-Tac-Toe</button>
                    <button id="blockFriendButton">Block</button>
                    <button id="viewFriendButton">View Friend</button>
                </div>
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

async function renderConversationBalloon(message, isSender) {
    if (await checkBlocked(currentChatUser.id) == true) {
        return;
    }
    const conversationDiv = document.getElementById('conversation');
    const balloon = document.createElement('div');
    balloon.classList.add('balloon');
    balloon.classList.add(isSender ? 'sender' : 'receiver');
    balloon.textContent = message;
    conversationDiv.prepend(balloon);
}

async function friendsListenersFunction(friendItems, friendItem, type)
{
    const chatInput = document.getElementById('chatInput');
    const notFriendMessage = document.getElementById('notFriendMessage');
    const playPongButton = document.getElementById('playPongButton');
    const playTicTacToeButton = document.getElementById('playTicTacToeButton');
    const blockFriendButton = document.getElementById('blockFriendButton');
    const showFriends = document.getElementById('showFriends');
    const cube = document.getElementsByClassName('Cube');
    const faces = document.querySelectorAll('.Face');
    const showChatRoom = document.getElementById('showChatRoom');
    const chatRoom = document.getElementById('chatRoom');
    const conversationDiv = document.getElementById('conversation');
    const invitationList = document.getElementById('invitationList');
    const childsToRemove = invitationList.querySelectorAll('.friendInvitationElement');
    childsToRemove.forEach(child => child.remove());
    if (friendItem.classList.contains('friend'))
    {
        notFriendMessage.style.display = 'none';
        chatInput.disabled = false;
        chatInput.placeholder = "Type away..";
        playPongButton.style.display = 'block';
        playTicTacToeButton.style.display = 'block';
        blockFriendButton.style.display = 'block';
    }
    else
    {
        playPongButton.style.display = 'none';
        playTicTacToeButton.style.display = 'none';
        chatInput.disabled = true;
        chatInput.placeholder = "You need to be friends";
        notFriendMessage.style.display = 'block';
    }
    if (friendItem.querySelector('.redDot'))
        friendItem.querySelector('.redDot').style.display = 'none';
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
    conversationDiv.innerHTML = '';
    // Check if the friend is in the list of friend notifications

    if (type == "friendRequest")
    {
        const friendUsername = friendItem.textContent.trim();
        currentChatUser = await getUser(friendUsername);
        console.log("This is the current Chat user : ", currentChatUser);
        const friendrequests = await getFriendNotifications();
    
        for (let i = 0; i < friendrequests.length; i++) {
            if (friendrequests[i].sender.username == currentChatUser.username) {
                console.log("going to render");
                renderFriendRequestNotif(friendrequests[i], friendrequests[i].sender.id);
            }
        }
    }
    else if (type == "Notif")
    {
        if (messages[currentChatUser.id]) {
    }
        console.log("All the notifications : ", messages[currentChatUser.id])
        messages[currentChatUser.id].forEach(msg => {
            if (msg.type === 'chat_message') {
                renderConversationBalloon(msg.message, msg.senderId === actualUser.id);
            } else if (msg.type === 'send_invite' || msg.type === 'waiting_state' || msg.type === 'tournament_invite') {
                console.log("going in with ", msg);
                renderFriendRequestNotif(msg, currentChatUser.id);
            }
        });
    }
    let currentUserblocked = false;
    const blockedFriends = await getBlockedFriends();
    blockedFriends.forEach((friend) =>
    {
        if (currentChatUser.id == friend.id)
        {
            blockFriendButton.style.color = "green";
            blockFriendButton.style.border = "1px solid green";
            blockFriendButton.textContent = "Unblock";
            currentUserblocked = true;
        }
    });
    if (currentUserblocked == false)
    {
        blockFriendButton.style.color = "red";
        blockFriendButton.style.border = "1px solid red";
    }
}

function getBallSpeed()
{
    const ballSlider = document.getElementById('ballSpeed');
    switch(ballSlider.value)
    {
        case 1:
            theBallSpeed = 3;
            break;
        case 2:
            theBallSpeed = 5;
            break;
        case 3:
            theBallSpeed = 7;
            break;
        default:
            theBallSpeed = 5;
    }
}

async function showChat() {
    let showFriendBool = false;
    let isFriendClicked = false;
    const chatRoom = document.getElementById('chatRoom');
    const conversationDiv = document.getElementById('conversation');
    const showChatRoom = document.getElementById('showChatRoom');
    const friendItems = document.querySelectorAll('.friendItem');
    const cube = document.getElementsByClassName('Cube');
    const chatInput = document.getElementById('chatInput');
    const faces = document.querySelectorAll('.Face');
    const showFriends = document.getElementById('showFriends');
    const notFriendMessage = document.getElementById('notFriendMessage');
    const inviteInput = document.getElementById('inviteInput');
    const inviteButton = document.getElementById('inviteButton');
    const inviteContainer = document.getElementById('inviteContainer');
    const ballAcc = document.getElementById('ballAcc');
    const ballSlider = document.getElementById('ballSpeed');
    const powers = document.getElementById('powers');
    const sendButton = document.getElementById('sendButton');
    const blockFriendButton = document.getElementById('blockFriendButton');

    inviteButton.addEventListener('click', async () => {

        if (matchmakingClicked) {
            const params = new URLSearchParams();
            params.append('matchmaking', 'true');
            params.append('game', gameChosen);
            window.location.href = `/lobby?${params.toString()}`;
            return;
        }

        const username = inviteInput.value.trim();
        let invitee = await getUser(username);
        if (invitee && invitee.id !== actualUser.id) {
            const params = new URLSearchParams();
            params.append('game', gameChosen);
            let body;
            if (gameChosen == 'tic-tac-toe')
            {
                body =
                {
                    "game": gameChosen,
                    "player1": actualUser.id,
                    "player2": invitee.id,
                    "match_type": "online_multiplayer",
                    "powers": powers.checked
                }
            }
            else
            {
                getBallSpeed();
                body =
                {
                    "game": gameChosen,
                    "player1": actualUser.id,
                    "player2": invitee.id,
                    "match_type": "online_multiplayer",
                    "powers": powers.checked,
                    "ball_speed": theBallSpeed,
                    "ball_acc": ballAcc.checked
                }
            }
            const match_id = await createGame(body);
            const message = {
                "type": "send_invite",
                "game": gameChosen,
                "hostId": actualUser.id,
                "inviteeId": invitee.id,
                "matchId": match_id
            }
        
            sendMessage(message);
            params.append('matchId', match_id);
            params.append('firstInvite', 'true');
            window.location.href = `/lobby?${params.toString()}`;
        }
        else if (invitee && invitee.id == actualUser.id)
        {
            const errorText = document.getElementById('inviteTextError');
            errorText.textContent = "You cannot invite yourself!";
            errorText.style.display = "block";
        }
        else if (invitee === null)
        {
            const errorText = document.getElementById('inviteTextError');
            errorText.textContent = "User not found!";
            errorText.style.display = "block";
        }
    });

    if (buttonBool == false)
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
                sendMessage(messageData);
            }
        }
    });

    sendButton.addEventListener('click', async function()
    {
        const message = chatInput.value;
        if (message.trim() === '') {
            return;
        }
        renderConversationBalloon(message, true);
        chatInput.value = '';
        chatInput.style.height = 'auto';
        chatInput.style.height = chatInput.scrollHeight + 'px';
        if (currentChatUser) {
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
            sendMessage(messageData);
        }
    });

    showChatRoom.addEventListener('click', function() {
        currentChatUser = null;
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
        document.getElementById('notifShowFriends').style.display = 'none';
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

async function addFriendButton()
{
    buttonBool = true;
    const friendButton = document.getElementById('plusButton');
    const textInput = document.getElementById('searchContact');
    const user = await fetchUserData();
    friendButton.addEventListener('click', async function ()
    {
        const friendAddStatus = document.getElementById('friendAddStatus');
        const friendName = textInput.value;
        const friendInfo = await getUser(friendName);
        if (friendName == user.username) {
            friendAddStatus.textContent = 'You cannot add yourself as a friend';
            friendAddStatus.style.color = "red";
        } else if (friendName == '') {
            friendAddStatus.style.color = "red";
            friendAddStatus.textContent = 'Please enter a username';
        } else if (friendInfo == null) {
            friendAddStatus.style.color = "red";
            friendAddStatus.textContent = 'User does not exist';
        } /* else if (user.friends.includes(friendName)) {
            alert('User is already your friend');
            return;
        } */
        else
        {
            friendAddStatus.style.color = "green";
            friendAddStatus.textContent = 'Friend request sent!';
            await sendFriendRequest(friendName);
            const pendingRequests = await getPendingRequest();
            renderPendingRequest(pendingRequests);
            const friendRequestdata =
            {
                "type": "friendRequest",
                "receiverId": friendInfo.id,
                "senderId": user.id
            };
            sendMessage(friendRequestdata);
            //showChat();
        }
        friendAddStatus.style.display = "block";
        friendAddStatus.addEventListener('animationend', () => {
            friendAddStatus.style.display = "none";
        });
        textInput.value = '';
    });
}

async function acceptFriendNotif(friend, element)
{
    await addFriend(friend.id);
    const friendRequestdata =
    {
        "type": "friendRequestAccepted",
        "receiverId": friend.id,
        "senderId": actualUser.id
    };
    sendMessage(friendRequestdata);
    const friends = await getFriends();
    const friendNotifications = await getFriendNotifications();
    const pendingRequests = await getPendingRequest();
    const blockedFriends = await getBlockedFriends();
    element.remove();
    for (let i = 0; i < friendNotifications.length; i++) {
        if (friendNotifications[i].sender.username == currentChatUser.username) {
            renderFriendRequestNotif(friendNotifications[i], friendNotifications[i].sender.id);
        }
    }
    renderFriendRequest(friendNotifications);
    renderFriendsList(friends, friendNotifications, pendingRequests, blockedFriends);
    const chatInput = document.getElementById('chatInput');
    const notFriendMessage = document.getElementById('notFriendMessage');
    const playPongButton = document.getElementById('playPongButton');
    const playTicTacToeButton = document.getElementById('playTicTacToeButton');
    const blockFriendButton = document.getElementById('blockFriendButton');
    playPongButton.style.display = 'block';
    playTicTacToeButton.style.display = 'block';
    blockFriendButton.style.display = 'block';
    chatInput.disabled = false;
    chatInput.placeholder = "Type away..";
    notFriendMessage.style.display = 'none';
}

async function refuseFriendNotif(friend, element)
{
    await refuseFriendRequest(friend.id);
    const friendRequestdata =
    {
        "type": "friendRequestRefused",
        "receiverId": friend.id,
        "senderId": actualUser.id
    };
    sendMessage(friendRequestdata);
    const friends = await getFriends();
    const friendNotifications = await getFriendNotifications();
    const pendingRequests = await getPendingRequest();
    const blockedFriends = await getBlockedFriends();
    element.remove();
    for (let i = 0; i < friendNotifications.length; i++) {
        if (friendNotifications[i].sender.username == currentChatUser.username) {
            renderFriendRequestNotif(friendNotifications[i], friendNotifications[i].sender.id);
        }
    }
    renderFriendRequest(friendNotifications);
    renderFriendsList(friends, friendNotifications, pendingRequests, blockedFriends);
    const chatRoom = document.getElementById('chatRoom');
    const showChatRoom = document.getElementById('showChatRoom');
    const cube = document.getElementsByClassName('Cube');
    const showFriends = document.getElementById('showFriends');
    const faces = document.querySelectorAll('.Face');
    showFriends.style.display = 'block';
    document.documentElement.style.setProperty('--cube-size', '20vmax');
    cube[0].style.top = "40vh";
    cube[0].style.left = "40vw";
    chatRoom.style.bottom = "calc(-1 * (100% - 300px))";
    showChatRoom.style.bottom = "-20px";
    faces.forEach((face) => {
        face.style.fontSize = "100px";
    });
}

function renderPendingRequest(pendingRequests)
{
    const friendsList = document.getElementById('friendsList');
    const childsToRemove = friendsList.querySelectorAll('.pending');
    childsToRemove.forEach(child => child.remove());
    for(let i = 0; i < pendingRequests.length; i++)
    {
        const pendingRequest = document.createElement('li');
        pendingRequest.classList.add('friendItem');
        pendingRequest.textContent = pendingRequests[i].receiver.username;
        pendingRequest.style.color = "grey";
        pendingRequest.classList.add('pending');
        const pfp = document.createElement('div');
        pfp.classList.add('pfpFriends');
        pfp.style.backgroundImage = `url(${BACKEND_URL}${pendingRequests[i].receiver.profile_pic})`;
        pendingRequest.appendChild(pfp);
        pendingRequest.addEventListener('click', function()
        {
            const friendItems = document.querySelectorAll('.friendItem');
            friendsListenersFunction(friendItems, pendingRequest, "none");
        });
        friendsList.appendChild(pendingRequest);
    };
    // showChat();
}

function renderBlockedFriends(blockedFriends)
{
    const friendsList = document.getElementById('friendsList');
    const childsToRemove = friendsList.querySelectorAll('.blocked');
    childsToRemove.forEach(child => child.remove());
    for(let i = 0; i < blockedFriends.length; i++)
    {
        const blockedfriend = document.createElement('li');
        blockedfriend.classList.add('friendItem');
        blockedfriend.textContent = blockedFriends[i].username;
        blockedfriend.style.color = "red";
        blockedfriend.classList.add('blocked');
        blockedfriend.addEventListener('click', function()
        {
            const friendItems = document.querySelectorAll('.friendItem');
            friendsListenersFunction(friendItems, blockedfriend, "none");
        });
        friendsList.appendChild(blockedfriend);
    };
    // showChat();
}

function showRedDot(friendId)
{
    const friendsList = document.getElementById('friendsList');
    const allFriendsElements = friendsList.querySelectorAll('.friendItem');
    allFriendsElements.forEach(child => {
        if (child.classList.contains('friend' + friendId))
            child.querySelector('.redDot').style.display = 'block';
    });
}

function checkRedDot()
{
    const friendsList = document.getElementById('friendsList');
    const allFriendsElements = friendsList.querySelectorAll('.friendItem');
    allFriendsElements.forEach(child => {
        if (child.querySelector('.redDot').style.display == 'block' && document.getElementById('showFriends').style.right != "248px")
        {
            document.getElementById('notifShowFriends').style.display = 'block';
        }
    });
}

function changeBorderStatus(friendId, isOnline)
{
    const friendsList = document.getElementById('friendsList');
    const allFriendsElements = friendsList.querySelectorAll('.friendItem');
    allFriendsElements.forEach(child => {
        if (child.classList.contains('friend' + friendId))
        {
            if (!isOnline)
            {
                child.querySelector('.pfpFriends').style.border = "none";
                child.querySelector('.pfpFriends').classList.add('grey-filter');
            }
            else
            {
                child.querySelector('.pfpFriends').style.border = "3px solid #1ddf1d";
                child.querySelector('.pfpFriends').classList.remove('grey-filter');
            }
        }
    });
}

function renderFriendRequest(friendNotifications)
{
    const friendsList = document.getElementById('friendsList');
    const childsToRemove = friendsList.querySelectorAll('.friendRequest');
    childsToRemove.forEach(child => child.remove());
    for(let i = 0; i < friendNotifications.length; i++)
    {
        console.log("this is the friend notification " + i + " " + friendNotifications[i]);
        const friendRequest = document.createElement('li');
        friendRequest.classList.add('friendItem');
        friendRequest.textContent = friendNotifications[i].sender.username;
        friendRequest.style.color = "grey";
        friendRequest.classList.add('friendRequest');
        friendRequest.classList.add('friend' + friendNotifications[i].sender.id)
        const redDot = document.createElement('div');
        redDot.classList.add('redDot');
        redDot.style.display = 'block';
        const pfp = document.createElement('div');
        pfp.classList.add('pfpFriends');
        pfp.style.backgroundImage = `url(${BACKEND_URL}${friendNotifications[i].sender.profile_pic})`;
        friendRequest.appendChild(pfp);
        friendRequest.appendChild(redDot);
        friendRequest.addEventListener('click', function()
        {
            const friendItems = document.querySelectorAll('.friendItem');
            friendsListenersFunction(friendItems, friendRequest, "friendRequest");
        });
        friendsList.appendChild(friendRequest);
    };
    // showChat();
}

async function renderFriendRequestNotif(jsonMessage, chatUserId)
{
    console.log("here")

    if (await checkBlocked(chatUserId) == true) {
        console.log("it was true");
        return;
    }

    const invitationList = document.getElementById('invitationList');
    const chatUser = await fetchUserById(chatUserId);
    console.log(jsonMessage);

    const friendRequest = document.createElement('li');
    friendRequest.classList.add('friendItemNotif');
    friendRequest.style.color = "aliceblue";
    friendRequest.classList.add('friendInvitationElement');

    const requestUsername = document.createElement('div');
    requestUsername.classList.add('requestUsername');
    let username = chatUser.username;
    // if (chatUser.username.length > 8)
    //     username = chatUser.username.substring(0, 8) + "...";
    requestUsername.textContent = username;
    friendRequest.appendChild(requestUsername);

    const requestPfp = document.createElement('div');
    requestPfp.classList.add('requestPfp');
    requestPfp.style.backgroundImage = `url(${BACKEND_URL}${chatUser.profile_pic})`;
    friendRequest.appendChild(requestPfp);

    const messageText = document.createElement('div');
    messageText.classList.add('messageText');
    friendRequest.appendChild(messageText);

    const correct = document.createElement('div');
    correct.classList.add('correctDiv');
    friendRequest.appendChild(correct);

    const cross = document.createElement('div');
    cross.classList.add('crossDiv');
    friendRequest.appendChild(cross);

    invitationList.appendChild(friendRequest);

    if (!('type' in jsonMessage)) {
            console.log('No type');
        messageText.textContent = "New friend request!";
        correct.addEventListener('click', () => acceptFriendNotif(jsonMessage.sender, friendRequest));
        cross.addEventListener('click', () => refuseFriendNotif(jsonMessage.sender, friendRequest));
    } else if (jsonMessage.type == 'send_invite' || (jsonMessage.type == 'waiting_state' && jsonMessage.firstInvite == 'true')) {
        messageText.textContent = jsonMessage.game === 'tic-tac-toe' ? "New Tic-Tac-Toe invite!" : "New Pong invite!";
        correct.addEventListener('click', () => acceptGameInvite(jsonMessage, friendRequest));
        cross.addEventListener('click', () => refuseGameInvite(jsonMessage, friendRequest));
    } else if (jsonMessage.type == 'waiting_state') {
        // console.log('Waiting state being rendered:', jsonMessage);
        friendRequest.classList.add("gameRequestRendered");
        messageText.textContent = "Finish your " + (jsonMessage.game === 'tic-tac-toe' ? "Tic Tac Toe" : "Pong") + " game!";
        correct.addEventListener('click', () => acceptGameInvite(jsonMessage, friendRequest));
        cross.style.display = 'none';
    } else if (jsonMessage.type == 'tournament_invite') {
        messageText.textContent = "New " + (jsonMessage.game === 'tic-tac-toe' ? "Tic Tac Toe" : "Pong") + " tournament invite!"
        let params = new URLSearchParams();
        params.append('tournamentId', jsonMessage.tournamentId);
        correct.addEventListener('click', async () => {
            friendRequest.remove();
            messages[jsonMessage.hostId] = messages[jsonMessage.hostId].filter(
                msg => !(msg.type === 'tournament_invite' && msg.tournamentId == jsonMessage.tournamentId)
            );
            const tournamentData = await getTournamentById(jsonMessage.tournamentId);
            if (!tournamentData.player2) {
                sendMessage({type: 'tournament_invite_response', status: 'accepted', inviteeId: actualUser.id, hostId: jsonMessage.hostId});
                window.location.href = `/tournament?${params.toString()}`;
            }
            else if (!tournamentData.player3) {
                sendMessage({type: 'tournament_invite_response', status: 'accepted', inviteeId: actualUser.id, hostId: jsonMessage.hostId});
                window.location.href = `/tournament?${params.toString()}`;
            }
            else if (!tournamentData.player4) {
                sendMessage({type: 'tournament_invite_response', status: 'accepted', inviteeId: actualUser.id, hostId: jsonMessage.hostId});
                window.location.href = `/tournament?${params.toString()}`;
            }
        });
        cross.addEventListener('click', () => {
            friendRequest.remove();
            messages[jsonMessage.hostId] = messages[jsonMessage.hostId].filter(
                msg => !(msg.type === 'tournament_invite' && msg.tournamentId == jsonMessage.tournamentId)
            );
            sendMessage({type: 'tournament_invite_response', tournamentId: jsonMessage.tournamentId, status: 'declined', hostId: jsonMessage.hostId, inviteeId: actualUser.id, inviteeName: actualUser.username});
        });
    }
}

async function acceptGameInvite(jsonMessage, element) {
    const matchData = await fetchMatch(jsonMessage.matchId);
    if (!matchData) {
        console.error('Failed to fetch match data');
        return;
    }
    element.remove();
    const params = new URLSearchParams();
    if (gameChosen == "tic-tac-toe")
        params.append('game', 'tic-tac-toe');
    else
        params.append('game', 'pong');
    params.append('matchId', matchData.id);
    params.append('host', matchData.player1);
    params.append('invitee', matchData.player2);
    params.append('powers', matchData.powers);
    const sender = jsonMessage.type == 'send_invite' ? jsonMessage.hostId : jsonMessage.userId;
    messages[sender].forEach(msg => {
        if ((msg.type === 'send_invite' && msg.matchId === jsonMessage.matchId) || (msg.type === 'waiting_state' && msg.matchId === jsonMessage.matchId)) {
            messages[sender].splice(messages[sender].indexOf(msg), 1);
        }
    });
    window.location.href = `/lobby?${params.toString()}`;
}

function refuseGameInvite(jsonMessage, element) {
    const messageData = {
        type: 'refuse_invite',
        hostId: jsonMessage.hostId,
        inviteeId: jsonMessage.inviteeId,
        matchId: jsonMessage.matchId
    };
    socket.send(JSON.stringify(messageData));
    messages[jsonMessage.hostId].forEach(msg => {
        if ((msg.type === 'send_invite' && msg.matchId === jsonMessage.matchId)) {
            messages[jsonMessage.hostId].splice(messages[jsonMessage.hostId].indexOf(msg), 1);
        }
    });
    element.remove();
}

function renderFriendsList(friends, friendNotifications, pendingRequests, blockedFriends)
{
    renderFriendRequest(friendNotifications);
    renderPendingRequest(pendingRequests);
    renderBlockedFriends(blockedFriends);
    const friendsList = document.getElementById('friendsList');
    const childsToRemove = friendsList.querySelectorAll('.friend');
    childsToRemove.forEach(child => child.remove());
    for(let i = 0; i < friends.length; i++)
    {
        const friendElement = document.createElement('li');
        friendElement.classList.add('friendItem');
        let username = friends[i].username;
        // if (friends[i].username.length > 8)
        //     username = friends[i].username.substring(0, 8) + "...";
        friendElement.textContent = username;
        friendElement.style.color = "cyan";
        friendElement.classList.add('friend');
        friendElement.classList.add('friend' + friends[i].id);
        const redDot = document.createElement('div');
        redDot.classList.add('redDot');
        redDot.style.display = 'none';
        const pfp = document.createElement('div');
        pfp.classList.add('pfpFriends');
        pfp.style.backgroundImage = `url(${BACKEND_URL}${friends[i].profile_pic})`;
        friendElement.appendChild(pfp);
        friendElement.appendChild(redDot);
        friendsList.appendChild(friendElement);
        friendElement.addEventListener('click', function()
        {
            console.log("CLICKING");
            const friendItems = document.querySelectorAll('.friendItem');
            friendsListenersFunction(friendItems, friendElement, "Notif");
        });
    };
}

const getProfileInfo = async () => {
    try {
        const profilePic = document.getElementById('profilePicture');
        const usernameElement = document.getElementById('profileUsername');
        const friendsListElement = document.getElementById('friendsList');
        friendsListElement.innerHTML = '';
        const profileData = await fetchUserData();
        profilePic.style.backgroundImage = `url(${BACKEND_URL}${profileData.profile_pic})`;
        if (profileData.username) {
            usernameElement.textContent = profileData.username;
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
        renderError();
        colorSwitches();
        actualUser = await fetchUserData();
        const friends = await getFriends();
        const friendNotifications = await getFriendNotifications();
        const pendingRequests = await getPendingRequest();
        const blockedFriends = await getBlockedFriends();
        getProfileInfo();
        // renderFriendRequest();
        addEventListeners();
        renderFriendsList(friends, friendNotifications, pendingRequests, blockedFriends);

        const playPongButton = document.getElementById('playPongButton');
        const playTicTacToeButton = document.getElementById('playTicTacToeButton');
        const blockFriendButton = document.getElementById('blockFriendButton');
        const chatInput = document.getElementById('chatInput');
        const notFriendMessage = document.getElementById('notFriendMessage');
        const viewFriendButton = document.getElementById('viewFriendButton');

        playPongButton.addEventListener('click', async () => {
            // Logic to play Pong
            const params = new URLSearchParams();
            const body = {
                    "game": 'pong',
                    "player1": actualUser.id,
                    "player2": currentChatUser.id,
                    "match_type": "online_multiplayer",
                    "powers": 'true',
            }
            const match_id = await createGame(body);
            const message = {
                "type": "send_invite",
                "game": 'pong',
                "hostId": actualUser.id,
                "inviteeId": currentChatUser.id,
                "matchId": match_id
            }
            sendMessage(message);
            params.append('matchId', match_id);
            params.append('firstInvite', 'true');
            window.location.href = `/lobby?${params.toString()}`;
        });
    
        playTicTacToeButton.addEventListener('click', async () => {
            // Logic to play Tic-Tac-Toe
            const params = new URLSearchParams();
            const body = {
                    "game": 'tic-tac-toe',
                    "player1": actualUser.id,
                    "player2": currentChatUser.id,
                    "match_type": "online_multiplayer",
                    "powers": 'true',
            }
            const match_id = await createGame(body);
            const message = {
                "type": "send_invite",
                "game": 'tic-tac-toe',
                "hostId": actualUser.id,
                "inviteeId": currentChatUser.id,
                "matchId": match_id
            }
            sendMessage(message);
            params.append('matchId', match_id);
            params.append('firstInvite', 'true');
            window.location.href = `/lobby?${params.toString()}`;
        });
    
        blockFriendButton.addEventListener('click', async () => {
            if (blockFriendButton.style.color == "red")
            {
                const blocked_user = await blockFriend(currentChatUser.id);
                playPongButton.style.display = 'none';
                playTicTacToeButton.style.display = 'none';
                chatInput.disabled = true;
                chatInput.placeholder = "You need to be friends";
                notFriendMessage.style.display = 'block';
                blockFriendButton.style.color = "green";
                blockFriendButton.style.border = "1px solid green";
                blockFriendButton.textContent = "Unblock";
            }
            else
            {
                const blocked_user = await blockFriend(currentChatUser.id);
                notFriendMessage.style.display = 'none';
                chatInput.disabled = false;
                chatInput.placeholder = "Type away..";
                playPongButton.style.display = 'block';
                playTicTacToeButton.style.display = 'block';
                blockFriendButton.style.display = 'block';
                blockFriendButton.style.color = "red";
                blockFriendButton.style.border = "1px solid red";
                blockFriendButton.textContent = "Block";
            }
            const friends = await getFriends();
            const friendNotifications = await getFriendNotifications();
            const pendingRequests = await getPendingRequest();
            const blockedFriends = await getBlockedFriends();
            renderFriendsList(friends, friendNotifications, pendingRequests, blockedFriends);
        });

        viewFriendButton.addEventListener('click', async () => {
            if (currentChatUser)
                window.location.href = `/profile?id=${currentChatUser.id}`;
        });

        showChat();
        socket = await getWebSocket();
        socket.addEventListener('message', async function(event)
        {
            const message = JSON.parse(event.data);
            if (message.type === 'chat_message')
            {
                if (!messages[message.senderId]) {
                    messages[message.senderId] = [];
                }
                // console.log('Parsed message:', message);
                // console.log('Current chat user:', currentChatUser);
                messages[message.senderId].push(message);
                if (currentChatUser && message.senderId === currentChatUser.id)
                {
                    renderConversationBalloon(message.message, false);
                }
                else
                {
                    showRedDot(message.senderId);
                    checkRedDot();
                    //console.log('red dot should show now');
                }   
            } else if ((message.type === 'send_invite' || message.firstInvite == 'true')) {
                // console.log('Received game invite:', message);
                const sender = message.type == 'send_invite' ? message.hostId : message.userId;
                if (!messages[sender]) {
                    messages[sender] = [];
                }
                if (messages[sender].some(msg => (msg.type == 'waiting_state' && msg.matchId == message.matchId) || (msg.type == 'send_invite' && msg.matchId == message.matchId))) {
                    return;
                }
                showRedDot(sender);
                checkRedDot();
                messages[sender].push(message);
                if (currentChatUser != null && (message.type == 'send_invite' && message.hostId == currentChatUser.id) || (message.type == 'waiting_state' && message.userId == currentChatUser.id)) {
                    renderFriendRequestNotif(message, sender);
                }
            } else if (message.type === 'waiting_state') {
                // console.log('Received waiting state:', message);
                if (!messages[message.userId]) {
                    messages[message.userId] = [];
                }
                if (messages[message.userId].some(msg => (msg.type === 'waiting_state' && msg.matchId == message.matchId) || (msg.type === 'send_invite' && msg.matchId == message.matchId))) {
                    return;
                }
                messages[message.userId].push(message);
                showRedDot(message.userId);
                checkRedDot();
                if (currentChatUser && message.userId == currentChatUser.id) {
                    renderFriendRequestNotif(message, message.userId);
                }
            }
            else if (message.type === 'friendRequest')
            {
                const newfriendNotifications = await getFriendNotifications();
                renderFriendRequest(newfriendNotifications);
                showRedDot(message.senderId);
                checkRedDot();
            }
            else if (message.type === 'friendRequestAccepted' || message.type === 'friendRequestRefused')
            {
                const newfriends = await getFriends();
                const newfriendNotifications = await getFriendNotifications();
                const newpendingRequests = await getPendingRequest();
                const blockedFriends = await getBlockedFriends();
                console.log("This is the updated friends : " + newfriends);
                renderFriendsList(newfriends, newfriendNotifications, newpendingRequests, blockedFriends);
            }
            else if (message.type === 'tournament_invite') {
                if (!messages[message.hostId]) {
                    messages[message.hostId] = [];
                }
                if (messages[message.hostId].some(msg => (msg.type === 'tournament_invite' && msg.tournamentId == message.tournamentId))) {
                    return;
                }
                if (currentChatUser && message.hostId == currentChatUser.id) {
                    renderFriendRequestNotif(message, message.hostId, "friendRequest");
                }
                messages[message.hostId].push(message);
                showRedDot(message.hostId);
                checkRedDot();
                console.log("trying to render the tournament request");
            }
            else if (message.type === 'friend_disconnected')
                changeBorderStatus(message.userId, false);
            else if (message.type === 'friend_connected')
                changeBorderStatus(message.userId, true);
        });
    }
    else
    {
        document.getElementById('content').innerHTML = renderBaseHomeBlock();
        renderError();
        colorSwitches();
        offline = true;
        addEventListeners();
    }
}

async function checkBlocked(id) {
    const blockedFriends = await getBlockedFriends();
    return blockedFriends.some((friend) => friend.id == id);
}

function renderError()
{
    const urlParams = new URLSearchParams(window.location.search);
    // console.log(window.location.search);
    // console.log("trying to alert");
    if (urlParams.has('alert'))
    {
        if (urlParams.get('alert') == "match_finished")
        {
            // console.log("Found alert");
            // console.log("This is the correct alert message");
            const content = document.getElementById('content');
            const errorDiv = document.createElement('div');
            errorDiv.classList.add("errorMessage");
            if (urlParams.get('alert') == "match_finished")
                errorDiv.textContent = "Match has already ended"; 
            content.append(errorDiv);
            let opacity = 0;
            const interval = setInterval(() =>
            {
                opacity += 0.08;
                errorDiv.style.opacity = `${opacity}`;
                if (opacity >= 1)
                    clearInterval(interval);
            }, 50);
            setTimeout(() => {
                const interval = setInterval(() =>
                {
                    opacity -= 0.08;
                    errorDiv.style.opacity = `${opacity}`;
                    if (opacity <= 0)
                    {
                        errorDiv.style.display = "none"
                        clearInterval(interval);
                    }
                }, 50);
            }, 2000);
        } else if (urlParams.get('alert') == "match_rejected") {
            const content = document.getElementById('content');
            const errorDiv = document.createElement('div');
            errorDiv.classList.add("errorMessage");
            if (urlParams.get('alert') == "match_rejected")
                errorDiv.textContent = "Friend has rejected your invite"; 
            content.append(errorDiv);
            let opacity = 0;
            const interval = setInterval(() =>
            {
                opacity += 0.08;
                errorDiv.style.opacity = `${opacity}`;
                if (opacity >= 1)
                    clearInterval(interval);
            }, 50);
            setTimeout(() => {
                const interval = setInterval(() =>
                {
                    opacity -= 0.08;
                    errorDiv.style.opacity = `${opacity}`;
                    if (opacity <= 0)
                    {
                        errorDiv.style.display = "none"
                        clearInterval(interval);
                    }
                }, 50);
            }, 2000);
        }
    }
}

function colorSwitches() {
    const allSwitches = document.getElementsByClassName("switch");
    
    Array.from(allSwitches).forEach((switchElement) => {
        const input = switchElement.querySelector('input');
        
        input.addEventListener('click', () => {
            if (input.checked) {
                switchElement.style.backgroundColor = "green";
            } else {
                switchElement.style.backgroundColor = "red";
            }
        });
    });
}
