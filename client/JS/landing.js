const logdiv = document.getElementById('logdiv');
const accessToken = localStorage.getItem('access');

async function getUserInfo() {
    const url = "http://localhost:8080/api/user_info";
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        console.log(json);
        return json;
    } catch (error) {
        console.error(error.message);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('refresh')) {
        logdiv.textContent = "Profile";
        logdiv.href = '/Profile';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    getUserInfo().then(notifications => {
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