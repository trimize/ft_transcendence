import { fetchUsers, fetchUserData, addFriend } from "./fetchFunctions.js";

document.addEventListener('DOMContentLoaded', async function()
{
	try {
        const leaderboardData = await fetchUsers();
        const userData = await fetchUserData();
        populateLeaderboard(leaderboardData, userData);
    } catch (error) {
        console.error('Failed to populate leaderboard:', error);
        showEmptyLine();
    }
});

function populateLeaderboard(leaderboardData, userData) {
    const tbody = document.getElementById('leaderboard');
    tbody.innerHTML = '';
    console.log(leaderboardData);
    const userList = leaderboardData.map(player => ({...player}));
    userList.sort((a, b) => b.wins - a.wins);
    let i = 1;
    userList.forEach((player) => {
        const tr = document.createElement('tr');
        const isFriend = userData.friends.includes(player.id);
        const isCurrentUser = userData.id === player.id;
        console.log("player: " , player);
        console.log("player friend status: " , isFriend);
        tr.innerHTML = `
            <td>${i}</td>
            <td>${player.username}</td>
            <td>${player.wins}</td>
            <td>${isCurrentUser ? '' : (isFriend ? 'Friends' : `<button type="button" class="btn btn-primary" onclick="addFriend('${player.id}')">Add Friend</button>`)}</td>
        `;
        tbody.appendChild(tr);
        i++;
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

window.addFriend = addFriend;