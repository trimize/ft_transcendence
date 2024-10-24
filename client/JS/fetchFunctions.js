import { BACKEND_URL } from "./appconfig.js";

export const securelyGetAccessToken = async () => {
  let token = localStorage.getItem("access");
  if (!token) {
    console.log("No access token found");
    return null;
  }
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace("-", "+").replace("_", "/");
  const decodedData = JSON.parse(atob(base64));
  console.log("Decoded token data:", decodedData);

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
    formData.append('username', username);
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
    // const data = await response.json();
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

export async function addFriend(user) {
  const accessToken = await securelyGetAccessToken();
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/add_friend/${user}/`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.ok) {
      alert("Friend added successfully");
      location.reload();
    } else {
      alert("Failed to add friend");
    }
  } catch (error) {
    console.error("Error adding friend:", error);
    alert("Error adding friend");
  }
}

export async function fetchMatches(userId) {
  const accessToken = await securelyGetAccessToken();
  try {
    let response = await fetch(
      `${BACKEND_URL}/api/matches/player/${userId}/`,
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
	  const user = await response.json();
	  return user;
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
	  const user = await response.json();
	  return user;
	} catch (error) {
	  console.error(error.message);
	  return "";
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
	  const user = await response.json();
	  return user;
	} catch (error) {
	  console.error(error.message);
	  return "";
	}
}

export async function refuseFriendRequest(friend_id) {
	const accessToken = await securelyGetAccessToken();
	try {
	  let response = await fetch(
	    `${BACKEND_URL}/api/refuse_friend_request/${friend_id}`,
	    {
	      method: "PUT",
	      headers: {
		Authorization: `Bearer ${accessToken}`,
		"Content-Type": "application/json",
	      },
	    }
	  );
	  if (!response.ok) throw new Error("Failed to fetch user data");
	  const user = await response.json();
	  return user;
	} catch (error) {
	  console.error(error.message);
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
	  const user = await response.json();
	  return user;
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
	  const user = await response.json();
	  return user;
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
	  const user = await response.json();
	  return user;
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
	  const user = await response.json();
	  return user;
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
	  const user = await response.json();
	  return user;
	} catch (error) {
	  console.error(error.message);
	}
}