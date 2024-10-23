import { fetchMatches, fetchUserData } from './fetchFunctions.js';
import { createNavbar } from './utils.js';

document.addEventListener('DOMContentLoaded', async function()
{
	try {
        await createNavbar();
        const userData = await fetchUserData();
        const matches = await fetchMatches(userData.id);
        populateMatchesHistory(matches, userData);
    } catch (error) {
        // window.location.href = '/Login';
        console.error('Failed to fetch user data:', error);
    }
});

function populateMatchesHistory(matches, userData) {
    const tbody = document.getElementById('matchHistoryTable');
    tbody.innerHTML = '';
    if (matches.length === 0) {
        showEmptyLine();
        return;
    }
    let i = 1;
    matches.forEach((match) => {
        const tr = document.createElement('tr');
        const date = new Date(match.start_time);
        const opponent = getOpponent(match, userData);
        const result = getMatchResult(match, userData);
        tr.innerHTML = `
            <td>${i}</td>
            <td>${date.toDateString()}</td>
            <td>${match.game}</td>
            <td>${match.match_type}</td>
            <td>${opponent}</td>
            <td>${result}</td>
        `;
        tbody.appendChild(tr);
        i++;
    });
}

function getOpponent(match, userData) {
    let opponent = match.player1 === userData.id ? match.player2 : match.player1;
    if (opponent === null && match.type === 'singleplayer') {
        return "AI Agent";
    else if (opponent === null && match.type === 'local_multiplayer') {
        return "Local player";
    else if (opponent === null && match.type === 'online_multiplayer') {
            return "Anonymous user";
    } else {
        return opponent;
    }
}

function getMatchResult(match, userData) {
    if ((match.player1_score > match.player2_score && match.player1 === userData.id) || (match.player2_score > match.player1_score && match.player2 === userData.id)) {
        return "Victory";
    } else {
        return "Defeat";
    }
}

function showEmptyLine() {
    const tbody = document.getElementById('matchHistoryTable');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td colspan="6">No data available</td>
    `;
    tbody.appendChild(tr);
}