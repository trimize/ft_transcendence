import { getWebSocket } from "./singletonSocket.js";
import { BACKEND_URL, /*updateUserDataGlobal*/ } from "./appconfig.js";

const renderLoginForm = () => {
    return `<div class="container-fluid">
    <div class="connect-form">
        <h2 class="text-center mb-4">LOGIN</h2>
        <form id="loginForm" class="needs-validation" novalidate>
            <div class="mb-3">
                <input type="text" name="username" class="form-control" placeholder="Username" required>
                <div class="invalid-feedback">
                    Please enter your username.
                </div>
            </div>
            <div class="mb-3">
                <input type="password" name="password" class="form-control" placeholder="Password" required>
                <div class="invalid-feedback">
                    Please enter your password.
                </div>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Login</button>
            <div class="text-center mt-3">
                <a href="/register" class="btn btn-link">Register</a>
            </div>
            <div id="connectionStatus" style="display: none;" class="mt-3 text-center"></div>
        </form>
        <div id="2faForm" style="display: none;" class="mt-3">
            <input type="text" id="otpToken" class="form-control mb-3" placeholder="Enter OTP Token" required>
            <button id="verify2FA" class="btn btn-primary btn-block">Verify 2FA</button>
        </div>
    </div>
</div>

<script>
    // Enable Bootstrap validation styles
    (function () {
        'use strict';
        var forms = document.querySelectorAll('.needs-validation');
        Array.prototype.slice.call(forms).forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    })();
</script>

<style>
    .connect-form {
        max-width: 400px;
        margin: auto;
        padding: 2rem;
        border: 1px solid #ced4da;
        border-radius: 0.5rem;
        background-color: #fff;
    }
</style>`;
};

const attachEventListeners = () => {
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const data = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        fetch(`${BACKEND_URL}/api/login_user/`, {
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
                // await getWebSocket();
                // updateUserDataGlobal();
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

        fetch(`${BACKEND_URL}/api/verify_2fa/`, {
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
                // await getWebSocket();
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
    attachEventListeners();
};
