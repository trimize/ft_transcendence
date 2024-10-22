import { hideNavButtons } from "./utlis.js";
import { getWebSocket } from "./singletonSocket.js";

const renderLoginForm = () => {
    return `<div class="container-fluid">
                <div class="connect-form">
                    <form id="loginForm">
                    <input type="text" name="username" placeholder="Username" required>
                    <input type="password" name="password" placeholder="Password" required>
                    <button type="submit" class="btn btn-primary">Login</button>
                    <div class="text-center mt-3">
                        <a href="/register" class="btn btn-link">Register</a>
                    </div>
                    <div id="connectionStatus" style="display: none;" class="mt-3 text-center">
                    </div>
                    </form>
                <div id="2faForm" style="display: none;">
                    <input type="text" id="otpToken" placeholder="Enter OTP Token" required>
                    <button id="verify2FA" class="btn btn-primary">Verify 2FA</button>
                </div>
                </div>
            </div>`;
};

const attachEventListeners = () => {
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const data = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        fetch('http://localhost:8000/api/login_user/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(async data => {
            console.log(data);
            if (data.access && data.refresh) {
                localStorage.setItem('access', data.access);
                localStorage.setItem('refresh', data.refresh);
                localStorage.setItem('websocket_url', data.websocket_url);
                console.log(data.websocket_url);
                await getWebSocket();
                window.location.href = '/profile';
            } else if (data.message === '2FA required') {
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('2faForm').style.display = 'block';
            } else {
                console.error('Login failed:', data);
                const errorDiv = document.getElementById('connectionStatus');
                errorDiv.textContent = "Incorrect username or password";
                errorDiv.style.display = "block";
                errorDiv.style.color = 'red';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    document.getElementById('verify2FA').addEventListener('click', function() {
        const username = document.querySelector('#loginForm input[name="username"]').value;
        const password = document.querySelector('#loginForm input[name="password"]').value;
        const otpToken = document.getElementById('otpToken').value;

        fetch('http://localhost:8000/api/verify_2fa/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username, password: password, token: otpToken })
        })
        .then(response => response.json())
        .then(async data => {
            if (data.access && data.refresh) {
                localStorage.setItem('access', data.access);
                localStorage.setItem('refresh', data.refresh);
                localStorage.setItem('websocket_url', data.websocket_url);
                console.log(data.websocket_url);
                await getWebSocket();
                window.location.href = '/profile';
            } else {
                console.error('2FA verification failed:', data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
};

export const renderLogin = () => {
    document.getElementById('content').innerHTML = renderLoginForm();
    hideNavButtons();
    attachEventListeners();
};
