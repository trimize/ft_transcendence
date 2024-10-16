export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh");
  try {
    let response = await fetch("http://localhost:8000/api/token/refresh/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    data = await response.json();
    console.log(data.access);
    if (data.access) localStorage.setItem("access", data.access);
    else {
      console.error("Failed to refresh token:", data);
      throw new Error("No access token fetched");
      //window.location.href = '/Login';
    }
  } catch (error) {
    //window.location.href = '/Login';
    throw new Error("Error refreshing token:" + error);
  }
}

export async function fetchUserData() {
  const accessToken = localStorage.getItem("access");
  try {
    let response = await fetch("http://localhost:8000/api/user_info/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    if (response.status == 401) {
      await refreshAccessToken();
      const data = await fetchUserData();
      return data;
    } else if (!response.ok) throw new Error("Failed to fetch user data");
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error(error.message);
    return "";
  }
}

export async function updateUserData(username, email, profilePicture) {
  const accessToken = localStorage.getItem("access");
  try {
    let response = fetch("http://localhost:8000/api/update_user/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        username: username,
        email: email,
        profile_pic: profilePicture,
      }),
    });
    if (response.status == 401) {
      await refreshAccessToken();
      await updateUserData();
      alert("User data updated and token refreshed");
    } else if (!response.ok) throw new Error("Failed to update user data");
    alert("User data updated");
  } catch (error) {
    console.error(error.message);
  }
}

export async function updateGame(body) {
  const accessToken = localStorage.getItem("access");
  try {
    let response = await fetch("http://localhost:8000/api/update_match/", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (response.status == 401) {
      await refreshAccessToken();
      await updateGame(body);
    } else if (!response.ok) throw new Error("Failed to fetch user data");
  } catch (error) {
    console.error(error.message);
    return "";
  }
}

export async function createGame(body) {
  const accessToken = localStorage.getItem("access");
  try {
    let response = await fetch("http://localhost:8000/api/create_match/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (response.status == 401) {
      await refreshAccessToken();
      const gameData = await updateGame(body);
      return gameData.id;
    } else if (!response.ok) throw new Error("Failed to fetch user data");
    const gameData = await response.json();
    return gameData.id;
  } catch (error) {
    console.error(error.message);
    return "";
  }
}

export async function getUser(username) {
  try {
    let response = await fetch(
      "http://localhost:8000/api/get_user/" + username + "/",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status == 401) {
      await refreshAccessToken();
      const data = await fetchUserData();
      return data;
    } else if (!response.ok) throw new Error("Failed to fetch user data");
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error(error.message);
    return "";
  }
}

export async function fetchUsers() {
  try {
    let response = await fetch("http://localhost:8000/api/users/", {
      method: "GET",
      // headers: {
      // 'Authorization': `Bearer ${accessToken}`,
      // 'Content-Type': 'application/json'
      // }
    });
    // if (response.status == 401) {
    // 	await refreshAccessToken();
    // 	const data = await fetchUserData();
    // 	return data;
    // }
    // else
    if (!response.ok) throw new Error("Failed to fetch users data");
    const users = await response.json();
    return users;
  } catch (error) {
    console.error(error.message);
    return "";
  }
}

export async function addFriend(user) {
  const accessToken = localStorage.getItem("access");
  try {
    const response = await fetch(`http://localhost:8000/api/add_friend/${user}/`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    if (response.status == 401) {
      await refreshAccessToken();
      await addFriend(user);
    }

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
  const accessToken = localStorage.getItem("access");
  try {
    let response = await fetch(`http://localhost:8000/api/matches/player/${userId}/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    if (response.status == 401) {
      await refreshAccessToken();
      const data = await fetchMatches(user);
      return data;
    } else if (!response.ok) throw new Error("Failed to fetch user data");
    const matches = await response.json();
    return matches;
  } catch (error) {
    console.error(error.message);
    return "";
  }
}
