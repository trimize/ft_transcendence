
import { fetchUserData, updateUserData } from "./fetchFunctions.js";
import { setup2FA, verify2FA } from "./fetchFunctionsUsers.js";
import { hideNavButtons } from "./utlis.js";

const renderEditProfileForm = () => {
    return `<div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h2 class="card-title text-center">Edit Profile</h2>
                            <form id="editProfileForm" enctype="multipart/form-data">
                                <div class="form-group">
                                    <label for="username">Username</label>
                                    <input type="text" class="form-control" id="username" value="">
                                </div>
                                <div class="form-group">
                                    <label for="email">Email</label>
                                    <input type="email" class="form-control" id="email" value="">
                                </div>
                                <div class="form-group">
                                    <label for="formFile" class="form-label">Profile picture</label>
                                    <div class="custom-file">
                                        <input type="file" class="custom-file-input" id="formFile" accept="image/*">
                                        <label class="custom-file-label" for="formFile">Choose file</label>
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary btn-block">Save Changes</button>
                                <button type="button" class="btn btn-secondary btn-block" id="setup2FA">Setup 2-Factor
                                    Authentication</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="col-md-6" id="2faSetupContainer" style="display: none;">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title text-center">Setup 2-Factor Authentication</h3>
                            <div id="2faSetup">
                                <img id="qrCode" src="" alt="QR Code" class="img-fluid mb-3">
                                <div class="form-group">
                                    <label for="otpToken">Enter OTP Token</label>
                                    <input type="text" class="form-control" id="otpToken">
                                </div>
                                <button type="button" class="btn btn-primary btn-block" id="verify2FA">Verify
                                    2FA</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script>
        document.getElementById('formFile').addEventListener('change', function (event) {
            var fileName = event.target.files[0].name;
            var nextSibling = event.target.nextElementSibling;
            nextSibling.innerText = fileName;
        });
    </script>`;
}


const attachEventListeners = () => {
	document.addEventListener("DOMContentLoaded", async function () {
		try {
		  const userData = await fetchUserData();
		  document.getElementById("username").value = userData.username;
		  document.getElementById("email").value = userData.email;
		} catch (error) {
		  console.error("Failed to fetch user data:", error);
		}
	  });
	  
	  document.getElementById("setup2FA").addEventListener("click", async function () {
		try {
		  const data = await setup2FA();
		  const base64Image = data.qr_code_img.trim();
		  if (base64Image) {
			document.getElementById(
			  "qrCode"
			).src = `data:image/png;base64,${base64Image}`;
			document.getElementById("2faSetupContainer").style.display = "block";
		  } else {
			console.error("QR code image data is missing or invalid.");
		  }
		} catch (error) {
		  console.error("Error setting up 2FA:", error);
		};
	  })
	  
	  document.getElementById("verify2FA").addEventListener("click", async function () {
		const otpToken = document.getElementById("otpToken").value;
		try {
		  const data = await verify2FA(otpToken);
		  if (data) {
			alert("2FA setup successful");
			document.getElementById("2faSetupContainer").style.display = "none";
		  } else {
			alert("2FA setup failed: " + data.message);
		  }
		} catch (error) {
			console.error("Error verifying 2FA:", error);
		  }
	  })
	  
	  document
		.getElementById("editProfileForm")
		.addEventListener("submit", async function (event) {
		  event.preventDefault();
	  
		  const username = document.getElementById("username").value;
		  const email = document.getElementById("email").value;
		  const profilePicture = document.getElementById("formFile").files[0];
		  try {
			await updateUserData(username, email, profilePicture);
		  } catch (error) {
			console.error("Error in updating profile:", error);
			alert("Failed to update profile. Please try again.");
		  }
		});
}

export const renderProfileSettings = () => {
	document.getElementById('content').innerHTML = renderEditProfileForm();
    hideNavButtons();
    attachEventListeners();
}

