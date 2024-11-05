import { renderBaseHomePage } from "./home.js"
import { renderLogin } from "./login.js"
import { renderRegister } from "./register.js"
import { renderProfile } from "./profile.js"
import { renderLobby } from "./lobby.js"
import { renderTTT } from "./tic-tac-toe.js"
import { renderPong } from "./pong.js"
import { getWebSocket } from "./singletonSocket.js";
import { renderTournament } from "./tournament.js";
import { renderMatchHistory } from "./matchHistory.js";

const router = () => {
    const path = window.location.pathname.replace('/', '');
    console.log(path);
    switch (path) {
        case 'register':
            renderRegister();
            break;
        case 'login':
            renderLogin();
            break;
        case 'profile':
            renderProfile();
            break;
        case 'match-history':
            renderMatchHistory();
            break;
        case 'lobby':
            renderLobby();
            break;
        case 'tic-tac-toe':
            renderTTT();
            break;
        case 'pong':
            renderPong();
            break;
        case '/':
            renderBaseHomePage();
            break;
        case 'tournament':
            renderTournament();
            break;
        default:
            renderBaseHomePage();
            break;
    }
};

// Function to handle button clicks and update history
const navigate = (page) => {
    history.pushState(null, '', `/${page}`); // Update the URL without a hash
    router();                                // Call the router to render the page
};

// Event listeners for button clicks
// document.getElementById('homeBtn').addEventListener('click', () => navigate(''));
// document.getElementById('loginBtn').addEventListener('click', () => navigate('login'));
// document.getElementById('profileBtn').addEventListener('click', () => navigate('profile'));

// export const socket = getWebSocket();
// console.log(socket);
// Event listener for popstate to handle back/forward navigation
window.addEventListener('popstate', router);

// Initial load
window.addEventListener('load', () => {
    const path = window.location.pathname.replace('/', '');
    if (!path) {
        navigate(''); // Default to home if no path
    } else {
        router();
    }
});
