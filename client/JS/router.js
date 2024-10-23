import { renderBaseHomePage } from "./home.js"

// Function to render the Login page
const renderLogin = () => {
    document.getElementById('content').innerHTML = '<h1>Login Page</h1><p>Please log in.</p>';
};

// Function to render the Profile page
const renderProfile = () => {
    document.getElementById('content').innerHTML = '<h1>Profile Page</h1><p>This is your profile.</p>';
};

// Router function
const router = () => {
    const path = window.location.pathname.replace('/', '');

    switch (path) {
        case 'login':
            renderLogin();
            break;
        case 'profile':
            renderProfile();
            break;
        case '/':
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