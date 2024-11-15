import {
  fetchUserData,
  updateUserData,
  fetchUserById,
} from "./fetchFunctions.js";

import {
  deleteUser,
  anonymizeUser,
  setup2FA,
  verify2FA,
} from "./fetchFunctionsUsers.js";

import { DEFAULT_PROFILE_PIC, BACKEND_URL } from "./appconfig.js";
import { closeWebSocket, getWebSocket } from "./singletonSocket.js";

let socket;
let userData;

const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);

const getFriendProfile = () => {
  return `<a id="backButtonEdit"></a>
        <div id="pfpDiv">
                <img id="pfp">
            </div>
            <div id="pfDiv">
                <div id="pfBackground"></div>
                <div>
                    <div class="profileLogos" id="wins"></div>
                    <p id="winsText" class="profileNumbers"></p>
                    <div class="profileLogos" id="losses"></div>
                    <p id="lossesText" class="profileNumbers"></p>
                    <div id="matchDivProfile"></div>
                    <h2 id="username" class="text-pf"></h2>
                    <p id="email" class="text-pf text-info"></p>
                </div>
            </div>
            <div id="bg">
            </div>`
}

const renderFriendProfile = async (id) => {
  document.getElementById("content").innerHTML = getFriendProfile();
  try {
        const winsText = document.getElementById('winsText');
        const lossesText = document.getElementById('lossesText');
        const username = document.getElementById('username');
        const email = document.getElementById('email');
        const profilePicture = document.getElementById('pfp');
        userData = await fetchUserById(id);
        console.log(userData);
        winsText.textContent = userData.wins;
        lossesText.textContent = userData.losses;
        username.textContent = userData.username;
        email.textContent = userData.email;
        if (userData.profile_pic !== null)
          profilePicture.src = `${BACKEND_URL}${userData.profile_pic}`;
        else profilePicture.src = DEFAULT_PROFILE_PIC;
  } catch (error) {
    console.error("Failed to load profile data:", error);
  }
  document.getElementById("backButtonEdit").addEventListener("click", () => {
    window.location.href = "/home";
  })
};

const renderProfilePage = () => {
  return `
    <a id="backButtonEdit"></a>
        <div id="pfpDiv">
                <img id="pfp">
            </div>
            <div id="pfDiv">
                <div id="pfBackground"></div>
                <div id="notificationAnonym" class="alert alert-success d-none" role="alert">
                    Profile anonymized successfully!
                </div>
                <div>
                    <div class="profileLogos" id="wins"></div>
                    <p id="winsText" class="profileNumbers"></p>
                    <div class="profileLogos" id="losses"></div>
                    <p id="lossesText" class="profileNumbers"></p>
                    <button type="button" class="profileButtons" id="matchBtn">Match History</button>
                    <div id="matchDivProfile"></div>
                    <h2 id="username" class="text-pf"></h2>
                    <p id="email" class="text-pf text-info"></p>
                    <!--<div class="profileLogos" id="friends"></div>-->
                    <button type="button" class="profileButtons" id="editBtn">Edit profile</button>
                    <button type="button" class="profileButtons" id="customizeBtn">Customize games</button>
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
                <img id="pfp"></img>
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
                <div class="form-group" id="verify2fADiv">
                    <input type="text" class="inputEditProfile" id="otpToken">
                    <button type="button" id="setup2FAcheck">Verify 2FA</button>
                </div>
            </div>
            <div id="bg"></div>`;
};

const loadProfilePage = async () => {
  document.getElementById("content").innerHTML = renderProfilePage();
  try {
    const winsText = document.getElementById('winsText');
    const lossesText = document.getElementById('lossesText');
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    userData = await fetchUserData();
    winsText.textContent = userData.wins;
    lossesText.textContent = userData.losses;
    username.textContent = userData.username;
    email.textContent = userData.email;
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
  const customizeBtn = document.getElementById('customizeBtn');

  fetchUserData()
    .then((profileData) => {
      if (profileData.profile_pic !== null)
        profilePicture.src = `${BACKEND_URL}${profileData.profile_pic}`;
      else profilePicture.src = DEFAULT_PROFILE_PIC;
      document.getElementById("username").textContent = profileData.username;
      document.getElementById("email").textContent = profileData.email;
      document.getElementById("winsText").textContent = profileData.wins;
      document.getElementById("lossesText").textContent = profileData.losses;
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
    closeWebSocket();
    window.location.href = "/";
  });

  matchButton.addEventListener("click", async function () {
    window.location.href = "/match-history";
  });

  customizeBtn.addEventListener("click", async function () {
    window.location.href = "/customize";
  });
};

const attachEditFormEventListeners = () => {
  const anonymiseButton = document.getElementById("anonymizeBtn");
  const deleteButton = document.getElementById("deleteBtn");
  const notificationAnonym = document.getElementById("notificationAnonym");
  const profilePicture = document.getElementById("pfp");
  profilePicture.src = `${BACKEND_URL}${userData.profile_pic}`;
  document
    .getElementById("editProfileForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const username = document.getElementById("usernameEditInput").value;
      const email = document.getElementById("emailEditInput").value;
      const profilePicture = document.getElementById("formFile").files[0];
      const errorContainer = document.getElementById("editProfileErrorMessage");
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (username.length != 0 && (username.length < 3 || username.length > 12)) {
        errorContainer.textContent = "Invalid username";
        errorContainer.style.display = "block";
        return;
      }
      if (email.length !=0 && !emailPattern.test(email)) {
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
      localStorage.clear();
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

  document.getElementById("setup2FAcheck").addEventListener("click", async function () {
    console.log("setup2FAcheck clicked");
    const otpToken = document.getElementById("otpToken").value;
        if (!otpToken) {
          alert("Please enter the OTP token");
          return;
        }
        try {
          const data = await setup2FA(otpToken);
          if (data.message === "2FA setup complete") {
            alert("2FA setup successful");
            document.getElementById("twofaSetupContainer").style.display = "none";
            return;
          } else if (data.message === "Invalid token") {
            alert("2FA setup failed: Invalid 2FA token");
            return;
          }
        } catch (error) {
          console.error("Error verifying 2FA:", error);
        }
  });
};

export const renderProfile = async () => {
  socket = await getWebSocket();
  if (params.get("id")) {
    renderFriendProfile(params.get("id"));
  } else {
    loadProfilePage();
  }
};
