import { BACKEND_URL } from "./appconfig.js";
// import { user } from "./appconfig.js";

export const securelyGetAccessToken = async () => {
  let token = localStorage.getItem("access");
  if (!token) {
    console.log("No access token found");
    return null;
  }
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace("-", "+").replace("_", "/");
  const decodedData = JSON.parse(atob(base64));
//   console.log("Decoded token data:", decodedData);

  // Check if the token is expired
  if (Date.now() > decodedData.exp * 1000) {
    console.log("Token expired, refreshing...");
    try {
      const refreshToken = localStorage.getItem("refresh");
      const response = await fetch(`${BACKEND_URL}/api/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      const data = await response.json();
      console.log("New access token:", data.access);
      if (data.access) {
        localStorage.setItem("access", data.access);
        return data.access;
      } else {
        console.error("Failed to refresh token:", data);
        throw new Error("No access token fetched");
      }
    } catch (error) {
      localStorage.clear();
      console.error("Error refreshing token:", error);
      return "";
    }
  }
  // Accesss token is still valid
  return token;
};

export async function fetchUserData() {
  const accessToken = await securelyGetAccessToken();
  try {
    let response = await fetch(`${BACKEND_URL}/api/user_info/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch user data");
    const userData = await response.json();
	console.log(userData);
    return userData;
  } catch (error) {
    console.error(error.message);
    return "";
  }
}

export async function updateUserData(username, email, profilePicture) {
  const accessToken = await securelyGetAccessToken();
  try {
    const formData = new FormData();
	if (username)
    	formData.append('username', username);
	if (email)
    	formData.append('email', email);
    if (profilePicture) {
      formData.append('profile_pic', profilePicture);
    }

    let response = await fetch(`${BACKEND_URL}/api/update_user/`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });
  } catch (error) {
    console.error("Error updating user data:", error);
  }
}

export async function updateGame(body) {
  const accessToken = await securelyGetAccessToken();
  try {
    let response = await fetch(`${BACKEND_URL}/api/update_match/`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("Failed to update game");
  } catch (error) {
    console.error(error.message);
    return "";
  }
}

export async function createGame(body) {
  const accessToken = await securelyGetAccessToken();
  try {
    let response = await fetch(`${BACKEND_URL}/api/create_match/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("Failed to create game");
    const gameData = await response.json();
	console.log("Body is");
	console.log(JSON.stringify(body));
	console.log("Response is");
	console.log(gameData);
    return gameData.id;
  } catch (error) {
    console.error(error.message);
    return "";
  }
}

export async function getUser(username) {
  const accessToken = await securelyGetAccessToken();
  try {
    let response = await fetch(
      `${BACKEND_URL}/api/get_user/${username}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch user data by username");
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error(error.message);
	return null;
  }
}

export async function fetchUsers() {
  const accessToken = await securelyGetAccessToken();
  try {
    let response = await fetch(`${BACKEND_URL}/api/users/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch users data");
    const users = await response.json();
    return users;
  } catch (error) {
    console.error(error.message);
    return "";
  }
}

export async function addFriend(userId) {
  const accessToken = await securelyGetAccessToken();
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/add_friend/${userId}/`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.ok) {
      console.log("Friend added successfully");
    } else {
      alert("Failed to add friend");
    }
  } catch (error) {
    console.error("Error adding friend:", error);
    alert("Error adding friend");
  }
}

export async function fetchMatches(type, userId = null) {
  const accessToken = await securelyGetAccessToken();
  try {
	const params = new URLSearchParams();
	params.append("type", type);
	if (userId) {
		params.append("user_id", userId);
	}
    let response = await fetch(
      `${BACKEND_URL}/api/matches?${params}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch user data");
    const matches = await response.json();
    return matches;
  } catch (error) {
    console.error(error.message);
    return "";
  }
}

export async function fetchTournaments(type, userId) {
	const accessToken = await securelyGetAccessToken();
	try {
	  const params = new URLSearchParams();
	  params.append("type", type);
	  if (userId) {
		  params.append("user_id", userId);
	  }
	  let response = await fetch(
		`${BACKEND_URL}/api/get_tournaments_by_player?${params}`,
		{
		  method: "GET",
		  headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		  },
		}
	  );
	  if (!response.ok) throw new Error("Failed to fetch user data");
	  const tournaments = await response.json();
	  return tournaments;
	} catch (error) {
	  console.error(error.message);
	  return "";
	}
}

export async function fetchMatch(matchId) {
	const accessToken = await securelyGetAccessToken();
	try {
	  let response = await fetch(
	    `${BACKEND_URL}/api/matches/${matchId}/`,
	    {
	      method: "GET",
	      headers: {
		Authorization: `Bearer ${accessToken}`,
		"Content-Type": "application/json",
	      },
	    }
	  );
	  if (!response.ok) throw new Error("Failed to fetch user data");
	  const matches = await response.json();
	  return matches;
	} catch (error) {
	  console.error(error.message);
	  return "";
	}
}

export async function fetchUserById(userId) {
	const accessToken = await securelyGetAccessToken();
	try {
	  let response = await fetch(
	    `${BACKEND_URL}/api/users/${userId}/`,
	    {
	      method: "GET",
	      headers: {
		Authorization: `Bearer ${accessToken}`,
		"Content-Type": "application/json",
	      },
	    }
	  );
	  if (!response.ok) throw new Error("Failed to fetch user data");
	  const userData = await response.json();
	  return userData;
	} catch (error) {
	  console.error(error.message);
	  return "";
	}
}

export async function sendFriendRequest(username) {
	const accessToken = await securelyGetAccessToken();
	try {
	  let response = await fetch(
	    `${BACKEND_URL}/api/send_friend_request/${username}/`,
	    {
	      method: "POST",
	      headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
	      },
	    }
	  );
	  if (!response.ok) throw new Error("Failed to fetch user data");
	} catch (error) {
	  console.error(error.message);
	  return;
	}
}

export async function getFriendNotifications() {
	const accessToken = await securelyGetAccessToken();
	try {
	  let response = await fetch(
	    `${BACKEND_URL}/api/get_friend_invitations_received/`,
	    {
	      method: "GET",
	      headers: {
		Authorization: `Bearer ${accessToken}`,
		"Content-Type": "application/json",
	      },
	    }
	  );
	  if (!response.ok) throw new Error("Failed to fetch user data");
	  const userData = await response.json();
	  return userData;
	} catch (error) {
	  console.error(error.message);
	  return "";
	}
}

export async function refuseFriendRequest(friend_id) {
	const accessToken = await securelyGetAccessToken();
	try {
	  let response = await fetch(
	    `${BACKEND_URL}/api/refuse_friend_request/${friend_id}/`,
	    {
	      method: "PUT",
	      headers: {
		Authorization: `Bearer ${accessToken}`,
		"Content-Type": "application/json",
	      },
	    }
	  );
	  if (!response.ok) throw new Error("Failed to fetch user data");
	  const userData = await response.json();
	  return userData;
	} catch (error) {
	//  console.error(error.message);
	}
}

export async function getPendingRequest() {
	const accessToken = await securelyGetAccessToken();
	try {
	  let response = await fetch(
	    `${BACKEND_URL}/api/get_friend_invitations_sent/`,
	    {
	      method: "GET",
	      headers: {
		Authorization: `Bearer ${accessToken}`,
		"Content-Type": "application/json",
	      },
	    }
	  );
	  if (!response.ok) throw new Error("Failed to fetch user data");
	  const userData = await response.json();
	  return userData;
	} catch (error) {
	  console.error(error.message);
	}
}

export async function getFriends() {
	const accessToken = await securelyGetAccessToken();
	try {
	  let response = await fetch(
	    `${BACKEND_URL}/api/get_friends/`,
	    {
	      method: "GET",
	      headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
	      },
	    }
	  );
	  if (!response.ok) throw new Error("Failed to fetch user data");
	  const userData = await response.json();
	  return userData;
	} catch (error) {
	  console.error(error.message);
	}
}

export async function createTournament(body) {
	const accessToken = await securelyGetAccessToken();
	try {
	  let response = await fetch(
	    `${BACKEND_URL}/api/create_tournament/`,
	    {
	      method: "POST",
	      headers: {
		Authorization: `Bearer ${accessToken}`,
		"Content-Type": "application/json",
	      },
	      body: JSON.stringify(body),
	    }
	  );
	  if (!response.ok) throw new Error("Failed to fetch user data");
	  const userData = await response.json();
	  return userData;
	} catch (error) {
	  console.error(error.message);
	}
}

export async function getTournaments() {
	const accessToken = await securelyGetAccessToken();
	try {
	  let response = await fetch(
	    `${BACKEND_URL}/api/get_tournaments/`,
	    {
	      method: "GET",
	      headers: {
		Authorization: `Bearer ${accessToken}`,
		"Content-Type": "application/json",
	      },
	    }
	  );
	  if (!response.ok) throw new Error("Failed to fetch user data");
	  const userData = await response.json();
	  return userData;
	} catch (error) {
	  console.error(error.message);
	}
}

export async function updateTournament(body) {
	const accessToken = await securelyGetAccessToken();
	try {
	  let response = await fetch(
	    `${BACKEND_URL}/api/update_tournament/`,
	    {
	      method: "PUT",
	      headers: {
		Authorization: `Bearer ${accessToken}`,
		"Content-Type": "application/json",
	      },
	      body: JSON.stringify(body),
	    }
	  );
	  if (!response.ok) throw new Error("Failed to fetch user data");
	  const userData = await response.json();
	  return userData;
	} catch (error) {
	  console.error(error.message);
	}
}

export async function getTournamentById(tournamentId) {
	const accessToken = await securelyGetAccessToken();
	try {
	  let response = await fetch(
	    `${BACKEND_URL}/api/get_tournament/${tournamentId}/`,
	    {
	      method: "GET",
	      headers: {
		Authorization: `Bearer ${accessToken}`,
		"Content-Type": "application/json",
	      },
	    }
	  );
	  if (!response.ok) throw new Error("Failed to fetch tournament data");
	  return await response.json();
	} catch (error) {
	  console.error(error.message);
	}
}

export async function updateSliderSkin(slider) {
	const accessToken = await securelyGetAccessToken();
	try {
	  let response = await fetch(`${BACKEND_URL}/api/update_pong_slider/${slider}`, {
		method: "PUT",
		headers: {
		  Authorization: `Bearer ${accessToken}`,
		},
		//body: formData,
	  });
	} catch (error) {
	  console.error("Error updating user data:", error);
	}
}

export async function updateBallSkin(ball) {
	const accessToken = await securelyGetAccessToken();
	try {
	  let response = await fetch(`${BACKEND_URL}/api/update_pong_ball/${ball}`, {
		method: "PUT",
		headers: {
		  Authorization: `Bearer ${accessToken}`,
		},
		//body: formData,
	  });
	} catch (error) {
	  console.error("Error updating user data:", error);
	}
}

export async function updateSignSkin(sign) {
	const accessToken = await securelyGetAccessToken();
	try {
	  let response = await fetch(`${BACKEND_URL}/api/update_tic_tac_toe_sign/${sign}`, {
		method: "PUT",
		headers: {
		  Authorization: `Bearer ${accessToken}`,
		},
		//body: formData,
	  });
	} catch (error) {
	  console.error("Error updating user data:", error);
	}
}

export async function updateVictorySkin(victory) {
	const accessToken = await securelyGetAccessToken();
	try {
	  let response = await fetch(`${BACKEND_URL}/api/update_tic_tac_toe_background/${victory}`, {
		method: "PUT",
		headers: {
		  Authorization: `Bearer ${accessToken}`,
		},
		//body: formData,
	  });
	} catch (error) {
	  console.error("Error updating user data:", error);
	}
}

export async function get_tournament_from_match(matchId)
{
	const accessToken = await securelyGetAccessToken();
	try {
	  let response = await fetch(
	    `${BACKEND_URL}/api/get_tournament_from_match/${matchId}/`,
	    {
	      method: "GET",
	      headers: {
		Authorization: `Bearer ${accessToken}`,
		"Content-Type": "application/json",
	      },
	    }
	  );
	  if (!response.ok) throw new Error("Failed to fetch tournament data");
	  return await response.json();
	} catch (error) {
	  console.error(error.message);
	  return null;
	}
}

export async function blockFriend(id) {
	const accessToken = await securelyGetAccessToken();
	try {
	  let response = await fetch(
	    `${BACKEND_URL}/api/block_friend/${id}/`,
	    {
	      method: "PUT",
	      headers: {
		Authorization: `Bearer ${accessToken}`,
		"Content-Type": "application/json",
	      },
	    }
	  );
	  if (!response.ok) throw new Error("Failed block friend");
	  return await response.json();
	} catch (error) {
	  console.error(error.message);
	  return null;
	}
}

export async function getBlockedFriends() {
	const accessToken = await securelyGetAccessToken();
	try {
	  let response = await fetch(
	    `${BACKEND_URL}/api/get_blocked_friends/`,
	    {
	      method: "GET",
	      headers: {
		Authorization: `Bearer ${accessToken}`,
		"Content-Type": "application/json",
	      },
	    }
	  );
	  if (!response.ok) throw new Error("Failed to fetch tournament data");
	  return await response.json();
	} catch (error) {
	  console.error(error.message);
	  return null;
	}
}