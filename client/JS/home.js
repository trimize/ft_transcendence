import { fetchUserData } from "./fetchFunctions.js";
import { BACKEND_URL, DEFAULT_PROFILE_PIC } from "./appconfig.js";

const addEventListeners = () => {
    let singleClicked = false;
    let multiClicked = false;
    const faces = document.querySelectorAll('.Face');
    const ballSlider = document.getElementById('ballSpeed');
    const ballSpeedComment = document.getElementById('inputRangeText');
    const ballSpeedDiv = document.getElementById('inputRangeDiv');
    // Iterate over the NodeList and add an event listener to each element
    faces.forEach((face) =>
    {
        face.addEventListener('click', (event) =>
        {
            const singleplayerMenu = document.getElementById('singleplayer');
            const buttonPlay = document.getElementById('buttonPlay');
            buttonPlay.classList.add('hide-before');
            buttonPlay.classList.add('hide-after');
            buttonPlay.classList.add('hide-hover');
            buttonPlay.style.color = "rgb(94, 93, 93)";
            const multiplayerMenu = document.getElementById('multiplayer')
            singleplayerMenu.addEventListener('click', function()
            {
                if (singleClicked == false)
                {
                    singleplayerMenu.style.textShadow = "0 0 15px rgb(255, 255, 255)";
                    singleClicked = true;
                    multiplayerMenu.style.textShadow = "0 0 0px rgb(255, 255, 255)";
                    multiClicked = false;
                    buttonPlay.classList.remove('hide-before');
                    buttonPlay.classList.remove('hide-after');
                    buttonPlay.classList.remove('hide-hover');
                    buttonPlay.style.color = "rgb(0, 0, 0)";
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
                    multiplayerMenu.style.textShadow = "0 0 15px rgb(255, 255, 255)";
                    multiClicked = true;
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
                const gameTitle = document.getElementById('gameTitletext');
                gameTitle.textContent = "PONG";
                const gamePicture = document.getElementById('gamePicture');
                gamePicture.style.backgroundImage = 'url(../Assets/Pong.gif)';
                const gameText = document.getElementById('gameText');
                gameText.textContent = 'Pong game is cool';
                ballSpeedDiv.style.display = "flex";
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
                const gameTitle = document.getElementById('gameTitletext');
                gameTitle.textContent = "Tic-Tac-Toe";
                gameTitle.style.background = 'none';
                gameTitle.style.color = 'white';
                const gamePicture = document.getElementById('gamePicture');
                gamePicture.style.backgroundImage = 'url(../Assets/tic-tac-toe.gif)';
                const gameText = document.getElementById('gameText');
                gameText.textContent = 'Tic-tac-toe game is cool';
            }
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

function renderBaseHomeConnected()
{
    return `<div class="half left">
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
            <a id="profileDiv" href="/profile">
                <div id="profilePicture"></div>
                <span id="username"></span>
            </a>
            <div id="showFriends"></div>
            <div id="friendsListDiv">
                <div id="friendsTitle"></div>
                <div id="friendsListBg"></div>
                <ul id="friendsList"></ul>
                <div id="noFriendsMessage" style="display: none; color: white;">No friends yet</div>
            </div>
            <div id="showChatRoom"></div>
            <div id="chatRoom">
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

function showChat()
{
    let showFriendBool = false;
    let isfriencClicked = false;
    const chatRoom = document.getElementById('chatRoom');
    const showChatRoom = document.getElementById('showChatRoom')
    const friendItems = document.querySelectorAll('.friendItem');
    const cube = document.getElementsByClassName('Cube');
    //console.log(friendItems);
    const chatInput = document.getElementById('chatInput');
    const faces = document.querySelectorAll('.Face');
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto'; // Reset the height
        chatInput.style.height = chatInput.scrollHeight + 'px'; // Set the new height based on content
    });
    friendItems.forEach((friendItem) => 
    {
        friendItem.addEventListener('click', function()
        {
            document.documentElement.style.setProperty('--cube-size', '10vmax');
            cube[0].style.top = "50px";
            cube[0].style.left = "90px";
            faces.forEach((face) =>
            {
                face.style.fontSize = "50px";
            });
            showChatRoom.style.bottom = "calc(100% - 300px - 40px)";
            chatRoom.style.bottom = "0";
            friendItems.forEach((friendItem) =>
            {
                friendItem.style.backgroundColor = "";
            });
            friendItem.style.backgroundColor = "rgba(130, 132, 134, 0.356)";
        });
    });
    showChatRoom.addEventListener('click', function()
    {
        document.documentElement.style.setProperty('--cube-size', '20vmax');
        cube[0].style.top = "40vh";
        cube[0].style.left = "40vw";
        faces.forEach((face) =>
        {
            face.style.fontSize = "100px";
        });
        chatRoom.style.bottom = "calc(-1 * (100% - 300px))";
        showChatRoom.style.bottom = "-20px";
        friendItems.forEach((friendItem) =>
        {
            friendItem.style.backgroundColor = "";
        });
    });
    const showFriends = document.getElementById('showFriends');
    showFriends.addEventListener('click', function()
    {
        showFriends.classList.toggle('flipped');
        if (showFriendBool == false)
        {
            document.getElementById('friendsListBg').style.right = "0px";
            document.getElementById('friendsListDiv').style.right = "0px";
            showFriends.style.right = "248px";
            showFriendBool = true;
        }
        else
        {
            document.getElementById('friendsListBg').style.right = "-250px";
            document.getElementById('friendsListDiv').style.right = "-250px";
            showFriends.style.right = "0px";
            showFriendBool = false;
        }
    });
}

const getProfileInfo = async () => {
    try {
        const profilePic = document.getElementById('profilePicture');
        const usernameElement = document.getElementById('username');
        const friendsListElement = document.getElementById('friendsList');
        friendsListElement.innerHTML = '';
        const noFriendsMessageElement = document.getElementById('noFriendsMessage');
        const profileData = await fetchUserData();
        
        if (profileData.profile_pic) {
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
            noFriendsMessageElement.style.display = 'none';
        } else {
            noFriendsMessageElement.style.display = 'block';
        }
    } catch (error) {
        console.error('Failed to fetch user data:', error);
    }

}

export const renderBaseHomePage = () =>
    {
        let token = localStorage.getItem('access');
        if (token)
        {
            document.getElementById('content').innerHTML = renderBaseHomeConnected();
            addEventListeners();
            getProfileInfo();
            showChat();
        }
        else
        {
            document.getElementById('content').innerHTML = renderBaseHomeBlock();
            addEventListeners();
        }
        
    }