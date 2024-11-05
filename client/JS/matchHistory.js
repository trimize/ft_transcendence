import { fetchUserData, fetchMatches, fetchUserById } from './fetchFunctions.js';

let userData;

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month} ${hours}:${minutes}`;
}

async function populateMatchesHistory(userData) {
    const matches = await fetchMatches('finished');
    const table = document.getElementById('finishedMatches');
    if (matches.length === 0) {
        table.textContent = 'No matches found';
        return;
    }
    matches.forEach(async (match) => {
        const element = document.createElement('div');
        element.classList.add('finishedMatch');
        const date = new Date(match.end_time);
        const myUsername = userData.username;
        const game = match.game == 'tic-tac-toe' ? 'Tic Tac Toe' : 'Pong';
        const myScore = match.player1 === userData.id ? match.player1_score : match.player2_score;
        const opponentScore = match.player1 === userData.id ? match.player2_score : match.player1_score;
        const opponent = await getOpponent(match, userData);
        const params = new URLSearchParams();
        const result = getMatchResult(match, userData) === "Victory" ? "../Assets/victory.svg" : "../Assets/loss.png";
        params.append('matchId', match.id);
        params.append('game', match.game);
        params.append('match_type', match.match_type);
        params.append('host', match.player1);
        params.append('invitee', match.player2);
        let gameUrl = 'lobby?' + params;
        if (opponent === "AI Agent" || opponent === "Local player" || opponent === "Anonymous user") {
            gameUrl = match.game + '?' + params;
        }
        element.innerHTML = `
            <p>${formatDate(date)}</p>
            <p>${game}</p>
            <p>${myUsername}</p>
            <p>${myScore} - ${opponentScore}</p>
            <p>${opponent}</p>
            <img src="${result}" alt="Result" class="resultImage">
        `;
        table.appendChild(element);
    });
}

async function populateUnfinishedMatches(userData) {
    const matches = await fetchMatches('unfinished');
    const table = document.getElementById('unfinishedMatches');
    if (matches.length === 0) {
        table.textContent = 'No unfinished matches found';
        return;
    }
    matches.forEach(async (match) => {
        const element = document.createElement('div');
        element.classList.add('unfinishedMatch');
        const date = new Date(match.start_time);
        const myUsername = userData.username;
        const game = match.game == 'tic-tac-toe' ? 'Tic Tac Toe' : 'Pong';
        const myScore = match.player1 === userData.id ? match.player1_score : match.player2_score;
        const opponentScore = match.player1 === userData.id ? match.player2_score : match.player1_score;
        const opponent = await getOpponent(match, userData);
        const params = new URLSearchParams();
        params.append('matchId', match.id);
        params.append('game', match.game);
        params.append('match_type', match.match_type);
        params.append('host', match.player1);
        params.append('invitee', match.player2);
        let gameUrl = 'lobby?' + params;
        if (opponent === "AI Agent" || opponent === "Local player" || opponent === "Anonymous user") {
            gameUrl = match.game + '?' + params;
        }
        element.innerHTML = `
            <p>${formatDate(date)}</p>
            <p>${game}</p>
            <p>${myUsername}</p>
            <p>${myScore} - ${opponentScore}</p>
            <p>${opponent}</p>
            <button class="profileButtons historyBtn" onclick="window.location.href='/${gameUrl}'">Continue</button>
        `;
        table.appendChild(element);
    });
}

async function getOpponent(match, userData) {
    let opponent = match.player1 == userData.id ? match.player2 : match.player1;
    console.log("Opponent ID:");
    console.log(opponent);
    if (opponent === null && match.match_type == 'singleplayer') {
        return "AI Agent";
    }
    else if (opponent === null && match.match_type == 'local_multiplayer') {
        return "Local player";}
        else if (opponent === null && match.match_type == 'online_multiplayer') {
            return "Anonymous user";
        } else {
        opponent = await fetchUserById(opponent);
        return opponent.username;
    }
}

function getMatchResult(match, userData) {
    if ((match.player1_score > match.player2_score && match.player1 === userData.id) || (match.player2_score > match.player1_score && match.player2 === userData.id)) {
        return "Victory";
    } else {
        return "Defeat";
    }
}

export const showEmptyLine = () => {
    const tbody = document.getElementById('matchHistoryTable');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td colspan="6">No data available</td>
    `;
    tbody.appendChild(tr);
}

const matchHistoryHTML = () => {
    return `<div class="container-fluidMH">
      <a id="backButtonEdit" href="/profile"></a>
                  <h1 class="text-center mt-5">Match History</h1>
                  <div class="allMatches">
                        <div class="unfinishedMatches" id="unfinishedMatches">
                            <h2>Unfinished Matches</h2>
                        </div>
                        <div class="finishedMatches" id="finishedMatches">
                            <h2>Finished Matches</h2>
                        </div>
                  </div>
              </div><div id="bg"></div>`;
};


const attachMatchHistoryEventListeners = () => {
    document
      .getElementById("backButtonEdit")
      .addEventListener("click", function () {
        document.getElementById("content").innerHTML = renderProfilePage();
        attachEventListeners();
      });
  };

export async function renderMatchHistory() {
    document.getElementById('content').innerHTML = matchHistoryHTML();
    userData = await fetchUserData();
    populateUnfinishedMatches(userData);
    populateMatchesHistory(userData);
    attachMatchHistoryEventListeners();
}