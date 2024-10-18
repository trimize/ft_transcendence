import { fetchUsers, fetchUserData, addFriend } from "./fetchFunctions.js";
import { createNavbar } from "./utils.js";

document.addEventListener('DOMContentLoaded', async function()
{
	try {
        await createNavbar(); 
        const leaderboardData = await fetchUsers();
        const userData = await fetchUserData();
        populateLeaderboard(leaderboardData, userData);
    } catch (error) {
        window.location.href = '/Login';
    }
});

function populateLeaderboard(leaderboardData, userData) {
    const tbody = document.getElementById('leaderboard');
    tbody.innerHTML = '';
    if (leaderboardData.length === 0) {
        showEmptyLine();
        return;
    }
    const userList = leaderboardData.map(player => ({...player}));
    userList.sort((a, b) => b.wins - a.wins);
    let i = 1;
    userList.forEach((player) => {
        const tr = document.createElement('tr');
        const isFriend = userData.friends.includes(player.id);
        const isCurrentUser = userData.id === player.id;
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
        <td colspan="4">No data available</td>
    `;
    tbody.appendChild(tr);
}

window.addFriend = addFriend;