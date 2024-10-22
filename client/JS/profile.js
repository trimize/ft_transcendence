import { fetchUserData } from "./fetchFunctions.js";
import { hideNavButtons } from "./utlis.js";

const renderProfilePage = () => {
    return `<div class="container-fluid">
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card" style="border: none;>
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
</div>

<style>
    .card {
        border: 1px solid #ced4da;
        border-radius: 0.5rem;
    }
</style>`;
}

const attachEventListeners = () => {
    const profilePicture = document.getElementById('profilePicture');
    const logoutButton = document.getElementById('logoutBtn');
    const editButton = document.getElementById('editBtn');
    const anonymiseButton = document.getElementById('anonymizeBtn');
    const deleteButton = document.getElementById('deleteBtn');
	
    fetchUserData().then(profileData => {
        if (profileData === "") {
            window.location.href = '/login';
            return;
        }    
        if (profileData.profile_pic !== null)
            profilePicture.src = profileData.profile_pic;
        else
            profilePicture.src = 'https://cdn-icons-png.flaticon.com/512/9203/9203764.png';
        document.getElementById('username').textContent = profileData.username;
        document.getElementById('email').textContent = profileData.email;
        document.getElementById('wins').textContent = `Wins : ${profileData.wins}`;
        document.getElementById('losses').textContent = `Losses : ${profileData.losses}`;
        document.getElementById('friends').textContent = `Friends : ${profileData.friends.length}`;
    })
    .catch(error => {
        console.error('Failed to fetch user data:', error);
    });

    logoutButton.addEventListener('click', function()
    {
	    localStorage.clear();
	    window.location.href = '/';
    });
    deleteButton.addEventListener('click', async function () {
        try {
            await deleteUser();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    })
    
    anonymiseButton.addEventListener('click', async function () {
        try {
            await anonymiseUser();
        } catch (error) {
            console.error('Error anonymising user:', error);
        }

});
};

export const renderProfile = () =>
{
    document.getElementById('content').innerHTML = renderProfilePage();
    hideNavButtons();
    attachEventListeners();
}