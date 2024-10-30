import { getWebSocket } from "./singletonSocket.js";
import { BACKEND_URL, /*updateUserDataGlobal*/ } from "./appconfig.js";

const renderLoginForm = () => {
    return `<a id="backButtonLogin" href="/"></a>
            <div class="container-fluid">
                <div class="connect-form">
                    <h2 class="text-center" id="loginTitle">LOGIN</h2>
                    <form id="loginForm" class="needs-validation" novalidate>
                        <div id="loginUsername">
                            <input type="text" name="username" class="inputEditProfile" placeholder="Username" required>
                            <div class="invalid-feedback">
                                Please enter your username.
                            </div>
                        </div>
                        <div id="loginPassword">
                            <input type="password" name="password" class="inputEditProfile" placeholder="Password" required>
                            <div class="invalid-feedback">
                                Please enter your password.
                            </div>
                        </div>
                        <button type="submit" id="loginButton">Login</button>
                        <div class="text-center" id="loginRegister">
                            <a href="/register" class="btn btn-link">Don't have an account ? Register</a>
                        </div>
                        <div id="connectionStatus" class="mt-3 text-center">Wrong username/password</div>
                    </form>
                    <div id="2faForm" class="mt-3" style="display: none;">
                        <input type="text" id="otpTokenLogin" class="inputEditProfile mb-3" placeholder="Enter OTP Token" required>
                        <button id="verify2FALogin" class="btn btn-primary btn-block">Verify 2FA</button>
                    </div>
                </div>
            </div>
            <div id="loginBg"></div>
            <div id="bg"></div>`;
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
                window.location.href = '/';
            } else if (data.message === '2FA required') {
                const loginForm = document.getElementById('loginForm');
                const twoFaForm = document.getElementById('2faForm');
                if (loginForm && twoFaForm) {
                    loginForm.style.display = 'none';
                    twoFaForm.style.display = 'block';
                    document.getElementById('verify2FALogin').addEventListener('click', function() {
                        const username = document.querySelector('#loginForm input[name="username"]').value;
                        const password = document.querySelector('#loginForm input[name="password"]').value;
                        const otpToken = document.getElementById('otpTokenLogin').value;
                
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
                                window.location.href = '/profile';
                            } else {
                                console.error('2FA verification failed:', data);
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                    });
                } else {
                    console.error('Login form or 2FA form not found');
                }
            } else {
                console.error('Login failed:', data);
                const errorDiv = document.getElementById('connectionStatus');
                if (errorDiv) {
                    errorDiv.textContent = "Incorrect username or password";
                    errorDiv.style.display = "block";
                    errorDiv.style.color = 'red';
                } else {
                    console.error('Error div not found');
                }
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