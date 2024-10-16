import { fetchUsers, fetchUserData, addFriend } from "./fetchFunctions.js";

document.addEventListener('DOMContentLoaded', async function()
{
	try {
        const leaderboardData = await fetchUsers();
        const userData = await fetchUserData();
        const friendsStatus = checkFriend(userData, leaderboardData);
        populateLeaderboard(leaderboardData, userData);
    } catch (error) {
        console.error('Failed to populate leaderboard:', error);
        showEmptyLine();
    }

});

function populateLeaderboard(leaderboardData, friendsStatus ) {
    const tbody = document.getElementById('leaderboard');
    tbody.innerHTML = '';
    console.log(leaderboardData);
    friendsStatus.forEach(player => {
        const tr = document.createElement('tr');
        console.log("player: " , player);
        console.log("player friend status: " , player.isFriend);
        tr.innerHTML = `
            <td>${player.rank}</td>
            <td>${player.username}</td>
            <td>${player.wins}</td>
            <td>${player.isFriend ? 'Friends' : `<button type="button" class="btn btn-primary" onclick="addFriend('${player.id}')">Add Friend</button>`}</td>
        `;
        tbody.appendChild(tr);
    });
}

function showEmptyLine() {
    const tbody = document.getElementById('leaderboard');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td colspan="3">No data available</td>
    `;
    tbody.appendChild(tr);
}

function checkFriend(userData, leaderboardData) {
    const friendsList = userData.friends;
    console.log(friendsList);
    return leaderboardData.map(player => ({
        ...player,
        isFriend: friendsList.includes(player.username)
    }));
}

window.addFriend = addFriend;