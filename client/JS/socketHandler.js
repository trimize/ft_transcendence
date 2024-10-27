export const getSocket = () => {
    let token = localStorage.getItem('access');
    if (token)
    {
        return new WebSocket('ws://localhost:8000/ws/api/');

    }
    return null;
}

export const sendMessage = (socket, message) => {
    if (socket.readyState === WebSocket.OPEN)
    {
        let json_message = JSON.stringify(message);
        socket.send(json_message);
        console.log("message sent " + json_message);
    }
    else
    {
        console.log('WebSocket is not open.');
    }
}

export const receiveInfoFromSocket = (socket) => {
    socket.onmessage = (event) => {
        const f = document.getElementById("chatbox").contentDocument;
        let text = "";
        const msg = JSON.parse(event.data);
        console.log(msg);
        const time = new Date(msg.date);
  const timeStr = time.toLocaleTimeString();

  switch (msg.type) {
    case "id":
      clientID = msg.id;
      setUsername();
      break;
    case "username":
      text = `User <em>${msg.name}</em> signed in at ${timeStr}<br>`;
      break;
    case "message":
      text = `(${timeStr}) ${msg.name} : ${msg.text} <br>`;
      break;
    case "rejectusername":
      text = `Your username has been set to <em>${msg.name}</em> because the name you chose is in use.<br>`;
      break;
    case "userlist":
      document.getElementById("userlistbox").innerText = msg.users.join("\n");
      break;
  }

  if (text.length) {
    f.write(text);
    document.getElementById("chatbox").contentWindow.scrollByPages(1);
  }
    }
}