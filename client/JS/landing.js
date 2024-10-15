import { fetchUserData } from "./fetchFunctions.js";

const logdiv = document.getElementById('logdiv');

document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('refresh')) {
        logdiv.textContent = "Profile";
        logdiv.href = '/Profile';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    fetchUserData().then(notifications => {
        const dropdownMenu = document.getElementById('notificationsDropdown');
        dropdownMenu.innerHTML = '';

        if (Array.isArray(notifications) && notifications.length > 0) {
            notifications.forEach(notification => {
                const a = document.createElement('a');
                a.className = 'dropdown-item';
                a.href = notification.href;
                a.textContent = notification.text;
                dropdownMenu.appendChild(a);
            });
        } else {
            const a = document.createElement('a');
            a.className = 'dropdown-item';
            a.href = "#";
            a.textContent = "No notifications";
            dropdownMenu.appendChild(a);
        }
    }).catch(error => {
        console.error('Failed to fetch notifications:', error);
        const dropdownMenu = document.getElementById('notificationsDropdown');
        dropdownMenu.innerHTML = '';
        const a = document.createElement('a');
        a.className = 'dropdown-item';
        a.href = "#";
        a.textContent = "Failed to load notifications";
        dropdownMenu.appendChild(a);
    });
});