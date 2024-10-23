import { hideNavButtons } from "./utlis.js";

// };
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
            singleplayerMenu.addEventListener('click', function()
            {
                if (singleClicked == false && multiClicked == false)
                {
                    singleplayerMenu.style.textShadow = "0 0 15px rgb(255, 255, 255)";
                    singleClicked = true;
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

            const multiplayerMenu = document.getElementById('multiplayer')
            multiplayerMenu.addEventListener('click', function()
            {
                if (multiClicked == false && singleClicked == false)
                {
                    multiplayerMenu.style.textShadow = "0 0 15px rgb(255, 255, 255)";
                    multiClicked = true;
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

addEventListeners();

showChat();

function showChat()
{
    let showFriendBool = false;
    const friendItems = document.querySelectorAll('friendItem');
    friendItems.forEach((friendItem) => 
    {
        friendItem.addEventListener('click', function()
        {
            
        });
    });
    const showFriends = document.getElementById('showFriends');
    showFriends.addEventListener('click', function()
    {
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

function renderConnected()
{
    
}

function renderBaseHomeBlock()
{
    return ` <div id="content" class="vh-100">
            <div class="half left">
                <span id="backButtonGameMenu">&lt;</span>
                <div id="gameTitle">
                    <span class="text" id="gameTitletext"></span>
                </div>
                <div id="gamePicture"></div>
                <text id="gameText"></text>
            </div>
            <div class="half right">
                <span class= "gameMenuText" id="singleplayer">Singleplayer</span>
                <span class= "gameMenuText" id="singleplayer">Multiplayer</span>
                <span class= "gameMenuText" id="CustomizeGameText">Customize the game</span>
                <div class="align-items-center justify-content-between" id="inputRangeDiv">
                    <label for="ballSpeed" id="ballSpeedText" class="customizeGameTitles">Ball Speed</label>
                    <input type="range" id="ballSpeed" class="form-control w-50" min="5" max="40">
                </div>
                <span id="inputRangeText"></span>
                <div class="align-items-center justify-content-between" id="powersDiv">
                    <label class="customizeGameTitles" for="powers">Enable powers</label>
                    <input id="powers" type="checkbox">
                </div>
                <div class="align-items-center justify-content-between" id="ballAccDiv">
                    <label class="customizeGameTitles" for="ballAcc">Enable ball acceleration</label>
                    <input id="ballAcc" type="checkbox">
                </div>
            </div>
            <a id="loginBtn">Login</a>
            <div id="bg"></div>
            <div class="Cube">
                <a class="Face pongFace" front>PONG</a>
                <a class="Face pongFace" back>PONG</a>
                <a class="Face tttFace" right>TTT</a>
                <a class="Face tttFace" left>TTT</a>
                <a class="Face tttFace" top>TTT</a>
                <a class="Face pongFace" bottom>PONG</a>
            </div>
        </div>`;
}

export const renderBaseHomePage = () => {
    document.getElementById('content').innerHTML = renderBaseHomeBlock();
    addEventListeners();
    hideNavButtons();
}