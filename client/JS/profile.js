import { fetchUserData, updateUserData, fetchMatches } from "./fetchFunctions.js";
import { deleteUser, anonymiseUser } from "./fetchFunctionsUsers.js";
import { hideNavButtons } from "./utlis.js";
import { populateMatchesHistory } from "./matchHistory.js";

const renderProfilePage = () => {
    return `<div class="container-fluid">
        <div class="container mt-5" id="profileArea">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card" style="border: none;">
                        <div class="row no-gutters">
                            <div class="col-md-4 text-center">
                                <img alt="Profile Picture" class="img-fluid" id="profilePicture" style="width: 200px; height: 200px;">
                            </div>
                            <div class="col-md-8">
                                <div class="card-body">
                                    <h2 class="card-title" id="username"></h2>
                                    <p class="card-text" id="email"></p>
                                    <p class="card-text" id="wins">Wins: </p>
                                    <p class="card-text" id="losses">Losses: </p>
                                    <p class="card-text" id="friends">Friends: </p>
                                    <button type="button" class="btn btn-primary" id="matchBtn">View Match History</button>
                                    <button type="button" class="btn btn-primary" id="editBtn">Edit Profile</button>
                                    <button type="button" class="btn btn-primary" id="anonymizeBtn">Anonymize</button>
                                    <button type="button" class="btn btn-danger" id="deleteBtn">Delete Account</button>
                                    <button type="button" class="btn btn-danger" id="logoutBtn">Log out</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

const renderEditProfileForm = () => {
    return `
    <div class="container-fluid">
    <button type="button" class="btn btn-secondary btn-block" id="goBackBtn">Go back</button>
        <div class="container mt-5" id="profileArea">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card" style="border: none;">
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
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

const renderMatchHistory = () => {
    return `<div class="container-fluid">
     <button type="button" class="btn btn-secondary btn-block" id="goBackBtn">Go back</button>
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
			</div>`;
}

const attachEventListeners = () => {
    const profilePicture = document.getElementById('profilePicture');
    const logoutButton = document.getElementById('logoutBtn');
    const editButton = document.getElementById('editBtn');
    const anonymiseButton = document.getElementById('anonymizeBtn');
    const deleteButton = document.getElementById('deleteBtn');
    const matchButton = document.getElementById('matchBtn');
    fetchUserData().then(profileData => {
        if (profileData.profile_pic !== null)
            profilePicture.src = `http://localhost:8000${profileData.profile_pic}`;
        else
            profilePicture.src = 'https://cdn-icons-png.flaticon.com/512/9203/9203764.png';
        let friendsNum = 0;
        if (profileData.friends != null)
            friendsNum = profileData.friends.length;
        document.getElementById('username').textContent = profileData.username.toUpperCase();
        document.getElementById('email').textContent = profileData.email;
        document.getElementById('wins').textContent = `Wins : ${profileData.wins}`;
        document.getElementById('losses').textContent = `Losses : ${profileData.losses}`;
        document.getElementById('friends').textContent = `Friends : ${friendsNum}`;
    })
    .catch(error => {
        console.error('Failed to fetch user data:', error);
        // window.location.href = '/login';
    });

    editButton.addEventListener('click', function() {
        // Replace profile info with the edit form
        document.getElementById('profileArea').innerHTML = renderEditProfileForm();
        attachEditFormEventListeners();
    });

    logoutButton.addEventListener('click', function() {
        localStorage.clear();
        window.location.href = '/';
    });

    deleteButton.addEventListener('click', async function () {
        try {
            await deleteUser();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    });

    anonymiseButton.addEventListener('click', async function () {
        try {
            await anonymiseUser();
        } catch (error) {
            console.error('Error anonymising user:', error);
        }
    });

    matchButton.addEventListener('click', async function() {
        document.getElementById('profileArea').innerHTML = renderMatchHistory();
        attachMatchHistoryEventListeners();
        try {
            const userData = await fetchUserData();
            const matches = await fetchMatches(userData.id);
            populateMatchesHistory(matches, userData);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    })
}

const attachMatchHistoryEventListeners = () => {
    document.getElementById('goBackBtn').addEventListener('click', function() {
        document.getElementById('profileArea').innerHTML = renderProfilePage();
        attachEventListeners(); 
    });
}

const attachEditFormEventListeners = () => {
    document.getElementById('editProfileForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const profilePicture = document.getElementById("formFile").files[0];
        console.log(profilePicture);

        try {
            await updateUserData(username, email, profilePicture);
            window.location.href = '/profile';
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    });

    document.getElementById('goBackBtn').addEventListener('click', function() {
        document.getElementById('profileArea').innerHTML = renderProfilePage();
        attachEventListeners(); 
    });

    document.getElementById('formFile').addEventListener('change', function (event) {
        var fileName = event.target.files[0].name;
        var nextSibling = event.target.nextElementSibling;
        nextSibling.innerText = fileName;
    });
}

export const renderProfile = () => {
    document.getElementById('content').innerHTML = renderProfilePage();
    hideNavButtons();
    attachEventListeners();
}