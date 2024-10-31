export const getSocket = () => {
    let token = localStorage.getItem('access');
    let socket = null;
    if (token)
    {
        socket = new WebSocket('ws://localhost:8000/ws/api/');
        socket.onopen = () => {
          console.log('WebSocket connection opened');
          // You can send an initial message if needed
          // sendMessage(socket, { type: 'init', data: 'Hello, server!' });
      };

      socket.onclose = () => {
          console.log('WebSocket connection closed');
      };

      socket.onerror = (error) => {
          console.error('WebSocket error:', error);
      };

      // Use the receiveInfoFromSocket function to handle incoming messages
      receiveInfoFromSocket(socket);

    }
    return null;
}

export const sendMessage = (socket, message) => {
    if (socket.readyState === WebSocket.OPEN)
    {
        // let json_message = JSON.stringify(message);
        socket.send(message);
        // console.log("message sent " + json_message);
    }
    else
    {
        console.log('WebSocket is not open.');
    }
}

export const receiveInfoFromSocket = (socket) => {
  socket.onmessage = (event) => {
      console.log('Message received:', event.data);
      const f = document.getElementById("chatbox")?.contentDocument;
      let text = "";
      const msg = JSON.parse(event.data);
      console.log(`Parsed message: ${msg}`);
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

      if (text.length && f) {
          f.write(text);
          document.getElementById("chatbox").contentWindow.scrollByPages(1);
      }
  }
}