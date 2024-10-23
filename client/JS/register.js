import { hideNavButtons } from "./utlis.js";
import { BACKEND_URL } from "./appconfig.js";

const renderRegisterForm = () => {
	return `<div class="container-fluid">
    <div class="register-form">
        <h2 class="text-center mb-4" id="Register_text">Register</h2>
        <form id="registerForm" class="needs-validation" novalidate>
            <div class="mb-3">
                <input type="text" name="name" class="form-control" placeholder="Username" required>
                <div class="invalid-feedback">
                    Please enter your username.
                </div>
            </div>
            <div class="mb-3">
                <input type="email" name="email" class="form-control" placeholder="Email" required>
                <div class="invalid-feedback">
                    Please enter a valid email address.
                </div>
            </div>
            <div class="mb-3">
                <input type="password" name="password" class="form-control" placeholder="Password" required>
                <div class="invalid-feedback">
                    Please enter your password.
                </div>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Register</button>
            
            <!-- Link to Login page -->
            <div class="text-center mt-3">
                <a href="/login" class="btn btn-link">Already have an account? Login here</a>
            </div>
            <div id="registerStatus" style="display: none;" class="mt-3 text-center"></div>
        </form>
    </div>
</div>

<script>
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
    .register-form {
        max-width: 400px;
        margin: auto;
        padding: 2rem;
        border: 1px solid #ced4da;
        border-radius: 0.5rem;
        background-color: #fff;
    }
</style>`;
}

const attachEventListeners = () => {
document.getElementById('registerForm').addEventListener('submit', function(event)
{
	event.preventDefault();

	const formData =
	{
		username: this.name.value,
		email: this.email.value,
		password: this.password.value
	};

	fetch(`${BACKEND_URL}/api/create_user/`, 
	{
		method: 'POST',
		headers:
		{
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formData)
	})
	.then(response => {
		if (!response.ok)
		{
			const errDiv = document.getElementById('registerStatus');
			errDiv.style.color = 'red';
			errDiv.style.display = 'block';
			return response.json().then(data =>
			{
				if (data.username)
					errDiv.textContent = data.username[0];
				else if (data.email)
					errDiv.textContent = data.email[0];
				else if (data.password)
					errDiv.textContent = password[0];
				throw new Error(`HTTP error! Status: ${response.status}`);
			});
		}
		return response.json();
	})
	.then(data =>
	{
		console.log(data);
		//if (data.email == "Enter a valid email address.")
		window.location.href = '/login';
	})
	.catch(error =>
	{
		console.error('Error:', error);
	});
});
};

export const renderRegister = () => 
{
	document.getElementById('content').innerHTML = renderRegisterForm();
	hideNavButtons();
	attachEventListeners();
}