import { renderHome } from "./home.js"
import { renderLogin } from "./login.js"
import { renderRegister } from "./register.js"
import { renderProfile } from "./profile.js"

const router = () => {
    const path = window.location.pathname.replace('/', '') || 'home';

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
        case '/':
        default:
            renderHome();
            break;
    }
};

// Function to handle button clicks and update history
const navigate = (page) => {
    history.pushState(null, '', `/${page}`); // Update the URL without a hash
    router();                                // Call the router to render the page
};

// Event listeners for button clicks
document.getElementById('homeBtn').addEventListener('click', () => navigate('home'));
document.getElementById('loginBtn').addEventListener('click', () => navigate('login'));
document.getElementById('profileBtn').addEventListener('click', () => navigate('profile'));

// Event listener for popstate to handle back/forward navigation
window.addEventListener('popstate', router);

// Initial load
window.addEventListener('load', () => {
    const path = window.location.pathname.replace('/', '');
    if (!path) {
        navigate('/'); // Default to home if no path
    } else {
        router();
    }
});