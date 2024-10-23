export const populateMatchesHistory = (matches, userData) => {
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

export const  getOpponent = (match, userData) => {
    let opponent = match.player1 === userData.id ? match.player2 : match.player1;
    if (opponent === null && match.type === 'singleplayer') {
        return "AI Agent";
    }
    else if (opponent === null && match.type === 'local_multiplayer') {
        return "Local player";}
    else if (opponent === null && match.type === 'online_multiplayer') {
            return "Anonymous user";
    } else {
        return opponent;
    }
}

export const getMatchResult = (match, userData) => {
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