import { fetchUserData, fetchMatches, fetchUserById } from './fetchFunctions.js';

async function populateMatchesHistory(userData) {
    const matches = await fetchMatches('finished');
    const tbody = document.getElementById('matchHistoryTable');
    tbody.innerHTML = '';
    if (matches.length === 0) {
        showEmptyLine();
        return;
    }
    let i = 1;
    matches.forEach(async (match) => {
        const tr = document.createElement('tr');
        const date = new Date(match.start_time);
        const opponent = await getOpponent(match, userData);
        const result = getMatchResult(match, userData);
        tr.innerHTML = `
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

async function populateUnfinishedMatches(userData) {
    const matches = await fetchMatches('unfinished');
    const tbody = document.getElementById('unfinishedMatchesTable');
    tbody.innerHTML = '';
    if (matches.length === 0) {
        showEmptyLine();
        return;
    }
    let i = 1;
    matches.forEach(async (match) => {
        const tr = document.createElement('tr');
        const date = new Date(match.start_time);
        const opponent = await getOpponent(match, userData);
        const params = new URLSearchParams();
        params.append('matchId', match.id);
        params.append('game', match.game);
        params.append('match_type', match.match_type);
        params.append('player1', match.player1);
        params.append('player2', match.player2);
        params.append('powers', match.powers);
        tr.innerHTML = `
            <td>${date.toDateString()}</td>
            <td>${match.game}</td>
            <td>${match.match_type}</td>
            <td>${opponent}</td>
            <td><a href="/lobby?${params}">Play</a></td>
        `;
        tbody.appendChild(tr);
        i++;
    });
}

async function getOpponent(match, userData) {
    let opponent = match.player1 == userData.id ? match.player2 : match.player1;
    if (opponent === null && match.type == 'singleplayer') {
        return "AI Agent";
    }
    else if (opponent === null && match.type == 'local_multiplayer') {
        return "Local player";}
        else if (opponent === null && match.type == 'online_multiplayer') {
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
    return `<div class="container-fluid">
      <a id="backButtonEdit" href="/profile"></a>
                  <h1 class="text-center mt-5">Match History</h1>
                  <div class="container mt-5">
                      <table class="table table-dark table-striped">
                          <thead>
                              <tr>
                                  <th scope="col">Date</th>
                                  <th scope="col">Game</th>
                                  <th scope="col">Game type</th>
                                  <th scope="col">Opponent</th>
                                  <th scope="col">Play</th>
                              </tr>
                          </thead>
                          <tbody id="unfinishedMatchesTable">
                          </tbody>
                      </table>
                      <table class="table table-dark table-striped">
                          <thead>
                              <tr>
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
    const userData = await fetchUserData();
    populateUnfinishedMatches(userData);
    populateMatchesHistory(userData);
    attachMatchHistoryEventListeners();
}