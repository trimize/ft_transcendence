// export const renderHome = () => {
//     document.getElementById('content').innerHTML = '<h1>Home Page</h1><p>Welcome to the Home page!</p>';
// };

const faces = document.querySelectorAll('.Face');

// Iterate over the NodeList and add an event listener to each element
faces.forEach((face) =>
{
    face.addEventListener('click', (event) =>
    {
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
    });
});

function renderBaseHomePage()
{
    return ``;
}
