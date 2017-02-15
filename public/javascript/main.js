var toggleButton, socket, shell;

window.addEventListener("load", () => {
  socket = new Socket();
  
  toggleButton = document.getElementById("toggleRunning");

  toggleButton.addEventListener("click", () => socket.send({
    type: toggleButton.innerText.toLowerCase()
  }));

  shell = new Shell(document.getElementById('terminal'));
  window.addEventListener("resize", () => shell.resized);

  socket.init();
});

function toggleStatus(status)
{
  var running = status == "running";
  
  toggleButton.innerText = running ? "Stop" : "Start";
  toggleButton.disabled = false;

  if(running)
    shell.clear();
}

class Socket
{
  constructor()
  {
  }

  init()
  {
    this.websocket = new WebSocket("ws://" + window.location.host);
    //this.websocket.onopen = (e) => console.log(e);
    this.websocket.onclose = (e) => console.error(e);

    this.websocket.onmessage = (e) => this.messageReceived(e.data);

    this.websocket.onerror = (e) => console.error(e.data);
  }

  send(message)
  {
    message = JSON.stringify(message);
    
    this.websocket.send(message);
  }

  messageReceived(message)
  {
    message = JSON.parse(message);
    
    switch(message.type)
    {
    case "status":
      toggleStatus(message.status);
      break;
    case "shell":
      shell.messageReceived(message);
      break;
    }
  }
}