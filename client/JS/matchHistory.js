import { fetchUserData, fetchMatches, fetchUserById, fetchTournaments } from './fetchFunctions.js';
import { getWebSocket } from './singletonSocket.js';

let userData;
let socket;

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month} ${hours}:${minutes}`;
}

async function populateTournamentsHistory(userData, userId) {
    const tournaments = await fetchTournaments('finished', userId);
    const table = document.getElementById('finishedTournaments');
    if (tournaments.length === 0) {
        table.textContent = 'No tournaments found';
        return;
    }
    tournaments.forEach(async (tournament) => {
        const date = new Date(tournament.start_time);
        const element = document.createElement('div');
        element.classList.add('finishedTournament');
        const game = tournament.game == 'tic-tac-toe' ? 'Tic Tac Toe' : 'Pong';
        let result;
        if (tournament.first_place == userData.id) {
            result = "🏅 1st place 🏅";
        } else if (tournament.second_place == userData.id) {
            result = "🥈 2nd place 🥈";
        } else if (tournament.third_place == userData.id) {
            result = "🥉 3rd place 🥉";
        } else {
            result = "💣 You lost 💣";
        }
        element.innerHTML = `
            <p>${formatDate(date)}</p>
            <p>${game}</p>
            <p>${result}</p>
        `;
        table.appendChild(element);
    });
}

async function populateUnfinishedTournamentsHistory(userId) {
    const tournaments = await fetchTournaments('unfinished', userId);
    console.log(tournaments);
    const table = document.getElementById('unfinishedTournaments');
    if (tournaments.length === 0) {
        table.textContent = 'No unfinished tournaments found';
        return;
    }
    tournaments.forEach(async (tournament) => {
        const date = new Date(tournament.start_time);
        const element = document.createElement('div');
        element.classList.add('unfinishedTournament');
        const game = tournament.game == 'tic-tac-toe' ? 'Tic Tac Toe' : 'Pong';
        const result = "🏆 In progress 🏆";
        const gameUrl = `tournament?tournamentId=${tournament.id}`;
        element.innerHTML = `
            <p>${formatDate(date)}</p>
            <p>${game}</p>
            <p>${result}</p>
            <button class="profileButtons historyBtn" onclick="window.location.href='/${gameUrl}'">Continue</button>
        `;
        table.appendChild(element);
    });
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
        const result = getMatchResult(match, userData) === "Victory" ? "../Assets/victory.svg" : "../Assets/loss.png";
        // const params = new URLSearchParams();
        // params.append('matchId', match.id);
        // params.append('game', match.game);
        // params.append('match_type', match.match_type);
        // params.append('host', match.player1);
        // params.append('invitee', match.player2);
        // let gameUrl = 'lobby?' + params;
        // if (opponent === "AI Agent" || opponent === "Local player" || opponent === "Anonymous user") {
        //     gameUrl = match.game + '?' + params;
        // }
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
                  <div class=grid-item>
                        <h2>Unfinished Matches</h2>
                        <div class="unfinishedMatches" id="unfinishedMatches">
                        </div>
                        </div>
                         <div class=grid-item>
                        <h2>Unfinished Tournaments</h2>
                        <div class="unfinishedTournaments" id="unfinishedTournaments">
                        </div>
                        </div>
                         <div class=grid-item>
                        <h2>Finished Matches</h2>
                        <div class="finishedMatches" id="finishedMatches">
                        </div>
                        </div>
                         <div class=grid-item>
                        <h2>Finished Tournaments</h2>
                        <div class="finishedTournaments" id="finishedTournaments">
                        </div>
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
    socket = await getWebSocket();
    userData = await fetchUserData();
    if (userData) {
        const userId = userData.id;
        populateUnfinishedMatches(userData);
        populateMatchesHistory(userData);
        populateTournamentsHistory(userData, userId);
        populateUnfinishedTournamentsHistory(userId);
        attachMatchHistoryEventListeners();
    }
}