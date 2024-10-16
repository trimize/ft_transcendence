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
      const response = await fetch("http://localhost:8000/api/token/refresh/", {
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
      console.error("Error refreshing token:", error);
      throw new Error("Error refreshing token:" + error);
    }
  }
  // Accesss token is still valid
  return token;
};

// export async function refreshAccessToken() {
//   const refreshToken = localStorage.getItem("refresh");
//   try {
//     let response = await fetch("http://localhost:8000/api/token/refresh/", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ refresh: refreshToken }),
//     });
//     data = await response.json();
//     console.log(data.access);
//     if (data.access) localStorage.setItem("access", data.access);
//     else {
//       console.error("Failed to refresh token:", data);
//       throw new Error("No access token fetched");
//       //window.location.href = '/Login';
//     }
//   } catch (error) {
//     //window.location.href = '/Login';
//     throw new Error("Error refreshing token:" + error);
//   }
// }

export async function fetchUserData() {
  const accessToken = await securelyGetAccessToken();
  try {
    let response = await fetch("http://localhost:8000/api/user_info/", {
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
    let response = await fetch("http://localhost:8000/api/update_user/", {
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
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to update user data:", errorData);
      throw new Error("Failed to update user data");
    }

    const data = await response.json();
    console.log("User data updated successfully:", data);
    alert("User data updated");
  } catch (error) {
    console.error("Error updating user data:", error);
    alert("Failed to update user data. Please try again.");
  }
}

export async function updateGame(body) {
  const accessToken = await securelyGetAccessToken();
  try {
    let response = await fetch("http://localhost:8000/api/update_match/", {
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
    let response = await fetch("http://localhost:8000/api/create_match/", {
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
      "http://localhost:8000/api/get_user/" + username + "/",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch user data by id");
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error(error.message);
    return "";
  }
}

export async function fetchUsers() {
  const accessToken = await securelyGetAccessToken();
  try {
    let response = await fetch("http://localhost:8000/api/users/", {
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
      `http://localhost:8000/api/add_friend/${user}/`,
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
      `http://localhost:8000/api/matches/player/${userId}/`,
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
