import { renderBaseHomePage } from "./home.js"
import { renderLogin } from "./login.js"
import { renderRegister } from "./register.js"
import { renderProfile } from "./profile.js"
import { renderLobby } from "./lobby.js"
import { getWebSocket } from "./singletonSocket.js";

const router = () => {
    const path = window.location.pathname.replace('/', '');
    // if (window.location.pathname.includes("lobby"))
    // {
    //     renderLobby();
    //     return ;
    // }
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
        case 'lobby':
            renderLobby();
            break;
        case '/':
            renderBaseHomePage();
            break;
        default:
            renderBaseHomePage();
            break;
    }
};

// Function to handle button clicks and update history
const navigate = (page) => {
    history.pushState(null, '', `/${page}`); // Update the URL without a hash
    console.log('Going here');
    router();                                // Call the router to render the page
};

// Event listeners for button clicks
document.getElementById('homeBtn').addEventListener('click', () => navigate(''));
document.getElementById('loginBtn').addEventListener('click', () => navigate('login'));
document.getElementById('profileBtn').addEventListener('click', () => navigate('profile'));

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

// document.addEventListener("DOMContentLoaded", function()
// {
//     console.log("yes");
//     navigate('');
// });
