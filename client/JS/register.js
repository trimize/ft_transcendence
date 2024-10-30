import { BACKEND_URL } from "./appconfig.js";

const renderRegisterForm = () => {
    return `<a id="backButtonRegister" href="/"></a>
            <div class="container-fluid">
                <div class="connect-form">
                    <h2 class="text-center" id="registerTitle">Register</h2>
                    <div id="registerStatus" style="display: none;""></div>
                    <form id="registerForm" class="needs-validation" novalidate>
                        <div id="registerUsername">
                            <input type="text" name="username" class="inputEditProfile" placeholder="Username" required>
                            <div class="invalid-feedback">
                                Please enter your username.
                            </div>
                        </div>
                        <div id="registerEmail">
                            <input type="email" name="email" class="inputEditProfile" placeholder="Email" required>
                            <div class="invalid-feedback">
                                Please enter your email.
                            </div>
                        </div>
                        <div id="registerPassword">
                            <input type="password" name="password" class="inputEditProfile" placeholder="Password" required>
                            <div class="invalid-feedback">
                                Please enter your password.
                            </div>
                        </div>
                        <button type="submit" id="registerButton">register</button>
                        <div class="text-center" id="registerRegister">
                            <a href="/login" class="btn btn-link">Already have an account ? Login</a>
                        </div>
                        
                    </form>
                </div>
            </div>
            <div id="registerBg"></div>
            <div id="bg"></div>`;
}

const attachEventListeners = () => {
    document.getElementById('registerForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = {
            username: this.username.value,
            email: this.email.value,
            password: this.password.value
        };

        fetch(`${BACKEND_URL}/api/create_user/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                const errDiv = document.getElementById('registerStatus');
                errDiv.style.display = 'block';
                return response.json().then(data => {
                    if (data.username)
                        errDiv.textContent = data.username[0];
                    else if (data.email)
                        errDiv.textContent = data.email[0];
                    else if (data.password)
                        errDiv.textContent = data.password[0];
                    throw new Error(`HTTP error! Status: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            window.location.href = '/login';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
};

export const renderRegister = () => {
    document.getElementById('content').innerHTML = renderRegisterForm();
    attachEventListeners();
}