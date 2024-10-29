import {
  fetchUserData,
  updateUserData,
  fetchMatches,
} from "./fetchFunctions.js";
import {
  deleteUser,
  anonymizeUser,
  setup2FA,
  verify2FA,
} from "./fetchFunctionsUsers.js";
import { populateMatchesHistory } from "./matchHistory.js";
import { DEFAULT_PROFILE_PIC, BACKEND_URL } from "./appconfig.js";

const renderProfilePage = (userData) => {
  return `
    <a id="backButtonEdit"></a>
        <div id="pfpDiv">
                <img alt="Profile picture" id="pfp" src="${DEFAULT_PROFILE_PIC}">
            </div>
            <div id="pfDiv">
                <div id="pfBackground"></div>
                <div id="notificationAnonym" class="alert alert-success d-none" role="alert">
                    Profile anonymized successfully!
                </div>
                <div>
                    <div class="profileLogos" id="wins">
                        <text class="profileNumbers">${
                          userData.wins || 0
                        }</text>
                    </div>
                    <div class="profileLogos" id="losses">
                        <text class="profileNumbers">${
                          userData.losses || 0
                        }</text>
                    </div>
                    <button type="button" class="profileButtons" id="matchBtn">Match History</button>
                    <div id="matchDivProfile"></div>
                    <h2 id="username" class="text-pf">${
                      userData.username || "username"
                    }</h2>
                    <p id="email" class="text-pf text-info">${
                      userData.email || "email"
                    }</p>
                    <!--<div class="profileLogos" id="friends"></div>-->
                    <button type="button" class="profileButtons" id="editBtn">Edit</button>
                    <!--<button type="button" class="profileButtons" id="anonymizeBtn">Anonymize</button>-->
                    <!--<button type="button" class="profileButtons" id="deleteBtn">Delete Account</button>-->
                    <button type="button" class="profileButtons" id="logoutBtn">Log out</button>
                </div>
            </div>
            <div id="bg"></div>`;
};

const renderEditProfileForm = (userData) => {
  return `
    <a id="backButtonEdit" href="/profile"></a>
            <div id="pfpDiv">
                <div id="pfp"></div>
            </div>
            <div id="pfDiv">
                <div id="pfBackground"></div>
                <form id="editProfileForm" enctype="multipart/form-data" class="needs-validation" novalidate>
                <div id="editUsername" class="text-editpf">Username</div>
                <textarea type="text" class="inputEditProfile" id="usernameEditInput" placeholder=${
                  userData.username || ""
                }></textarea>
                <div id="editEmail" class="text-editpf">Email</div>
                <textarea type="text" class="inputEditProfile" id="emailEditInput" placeholder=${
                  userData.email || ""
                }></textarea>
                <div id="editProfilePicture" class="text-editpf">Profile picture</div>
                <div class="custom-file" id="inputEditProfilePicture">
                    <input type="file" class="custom-file-input opacity-0 cursor-pointer zindex-2" id="formFile" accept="image/*">
                    <label class="custom-file-label" for="formFile" id="uploadLabel"></label>
                </div>
                 <div id="notificationAnonym" class="alert alert-success d-none" role="alert">
                                Profile anonymized successfully!
                            </div>
                <button type="button" id="anonymizeBtn">Anonymize</button>
                <button type="button" id="deleteBtn">Delete Account</button>
                <button type="submit" id="saveButton">Save Changes</button>
                <button type="button" id="setup2FA">Setup 2-Factor Authentication</button>
              </form>
                </div>
            <text id="editProfileErrorMessage"></text>
            <div id="twofaSetupContainer">
                <h3 class="text-center" id="twoFaTitle">Setup 2-Factor Authentication</h3>
                <img id="qrCode" src="" alt="QR Code" class="img-fluid mb-3">
                <div class="form-group" id="verify2fA">
                    <input type="text" class="inputEditProfile" id="otpToken">
                    <button type="button" id="verify2FA">Verify 2FA</button>
                </div>
            </div>
            <div id="bg"></div>`;
};

const renderMatchHistory = () => {
  return `<div class="container-fluid">
    <a id="backButtonEdit" href="/profile"></a>
				<h1 class="text-center mt-5">Match History</h1>
				<div class="container mt-5">
					<table class="table table-dark table-striped">
                        <thead>
                            <tr>
                                <th scope="col">N</th>
                                <th scope="col">Date</th>
                                <th scope="col">Game</th>
                                <th scope="col">Game type</th>
                                <th scope="col">Opponent</th>
                                <th scope="col">Result</th>
                            </tr>
                        </thead>
                        <tbody id="matchHistoryTable">
                        </tbody>
                    </table>
				</div>
			</div><div id="bg"></div>`;
};

const loadProfilePage = async () => {
  try {
    const userData = await fetchUserData();
    document.getElementById("content").innerHTML = renderProfilePage(userData);
    attachEventListeners();
  } catch (error) {
    console.error("Failed to load profile data:", error);
  }
};

const attachEventListeners = () => {
  const profilePicture = document.getElementById("pfp");
  const logoutButton = document.getElementById("logoutBtn");
  const editButton = document.getElementById("editBtn");
  const matchButton = document.getElementById("matchBtn");
  fetchUserData()
    .then((profileData) => {
      if (profileData.profile_pic !== null)
        profilePicture.src = `${BACKEND_URL}${profileData.profile_pic}`;
      else profilePicture.src = DEFAULT_PROFILE_PIC;
      document.getElementById("username").textContent = profileData.username;
      document.getElementById("email").textContent = profileData.email;
      document.getElementById("wins").textContent = profileData.wins;
      document.getElementById("losses").textContent = profileData.losses;
    })
    .catch((error) => {
      window.location.href = "/login";
    });

  document
    .getElementById("backButtonEdit")
    .addEventListener("click", function () {
      window.location.href = "/home";
    });

  editButton.addEventListener("click", async function () {
    const userData = await fetchUserData();
    document.getElementById("content").innerHTML =
      renderEditProfileForm(userData);
    attachEditFormEventListeners();
  });

  logoutButton.addEventListener("click", function () {
    localStorage.clear();
    window.location.href = "/";
  });

  matchButton.addEventListener("click", async function () {
    document.getElementById("content").innerHTML = renderMatchHistory();
    attachMatchHistoryEventListeners();
    try {
      const userData = await fetchUserData();
      const matches = await fetchMatches(userData.id);
      populateMatchesHistory(matches, userData);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  });
};

const attachMatchHistoryEventListeners = () => {
  document
    .getElementById("backButtonEdit")
    .addEventListener("click", function () {
      document.getElementById("content").innerHTML = renderProfilePage();
      attachEventListeners();
    });
};

const attachEditFormEventListeners = () => {
  const anonymiseButton = document.getElementById("anonymizeBtn");
  const deleteButton = document.getElementById("deleteBtn");
  const notificationAnonym = document.getElementById("notificationAnonym");
  document
    .getElementById("editProfileForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const username = document.getElementById("usernameEditInput").value;
      const email = document.getElementById("emailEditInput").value;
      const profilePicture = document.getElementById("formFile").files[0];
      const errorContainer = document.getElementById("editProfileErrorMessage");
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (username.length < 3) {
        errorContainer.textContent = "Invalid username";
        errorContainer.style.display = "block";
        return;
      }
      if (!emailPattern.test(email)) {
        errorContainer.textContent = "Invalid email";
        errorContainer.style.display = "block";
        return;
      }
      if (profilePicture) {
        const fileType = profilePicture.type;
        if (fileType !== "image/jpeg" && fileType !== "image/png") {
          errorContainer.textContent =
            "Profile picture must be a JPEG or PNG image";
          errorContainer.style.display = "block";
          return;
        }
      }
      try {
        await updateUserData(username, email, profilePicture);
        window.location.href = "/profile";
      } catch (error) {
        errorContainer.textContent = "Error updating user data";
        errorContainer.style.display = "block";
      }
    });

  deleteButton.addEventListener("click", async function () {
    try {
      await deleteUser();
      window.location.href = "/home";
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  });

  anonymiseButton.addEventListener("click", async function () {
    try {
      await anonymizeUser();
      notificationAnonym.classList.remove("d-none");
      setTimeout(() => {
        notificationAnonym.classList.add("d-none");
      }, 3000);
    } catch (error) {
      console.error("Error anonymising user:", error);
    }
  });

  document
    .getElementById("backButtonEdit")
    .addEventListener("click", function () {
      document.getElementById("content").innerHTML = renderProfilePage();
      attachEventListeners();
    });

  document
    .getElementById("formFile")
    .addEventListener("change", function (event) {
      var fileName = event.target.files[0].name;
      var nextSibling = event.target.nextElementSibling;
      nextSibling.innerText = fileName;
    });

  document
    .getElementById("setup2FA")
    .addEventListener("click", async function () {
      try {
        const data = await setup2FA();
        const base64Image = data.qr_code_img.trim();
        if (base64Image) {
          document.getElementById(
            "qrCode"
          ).src = `data:image/png;base64,${base64Image}`;
          document.getElementById("twofaSetupContainer").style.display =
            "block";
        } else {
          console.error("QR code image data is missing or invalid.");
        }
      } catch (error) {
        console.error("Error setting up 2FA:", error);
      }
    });

  document
    .getElementById("verify2FA")
    .addEventListener("click", async function () {
      const otpToken = document.getElementById("otpToken").value;
      try {
        const data = await verify2FA(otpToken);
        if (data) {
          alert("2FA setup successful");
          document.getElementById("twofaSetupContainer").style.display = "none";
        } else {
          alert("2FA setup failed: " + data.message);
        }
      } catch (error) {
        console.error("Error verifying 2FA:", error);
      }
    });
};

export const renderProfile = () => {
  document.getElementById("content").innerHTML = loadProfilePage();
  // attachEventListeners();
};
