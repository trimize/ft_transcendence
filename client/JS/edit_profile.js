import { updateUserData, fetchUserData } from "./fetchFunctions.js";
import { setup2FA, verify2FA } from "./fetchFunctionsUsers.js";

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
