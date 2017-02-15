class Session
{
  constructor(websocketConnection, sessionHandler)
  {
    this.websocket = websocketConnection;
    this.sessionHandler = sessionHandler;
    this.minecraftServer = sessionHandler.minecraftServer;

    this.websocket.on("message", (message) => this.messageReceived(message));
    this.websocket.on("close", () => this.disconnected());

    this.send({
      type: "status",
      status: this.minecraftServer.status
    });

    this.send({
      type: "shell",
      action: "output",
      data: this.minecraftServer._output
    });
  }

  send(message)
  {
    message = JSON.stringify(message);

    this.websocket.sendUTF(message);
  }

  messageReceived(message)
  {
    if(message.type == 'binary')
      return;
    
    try
    {
      message = JSON.parse(message.utf8Data);

      switch(message.type)
      {
      case "start":
        this.minecraftServer.start();
        break;
      case "stop":
        this.minecraftServer.stop();
        break;
      case "shellInput":
        this.minecraftServer.write(this, message.input);
        break;
      }
    }
    catch(e)
    {
      console.log(message);
      console.log(e);
    }
  }
  
  disconnected()
  {
    var index = this.sessionHandler.sessions.indexOf(this);
    this.sessionHandler.sessions.splice(index, 1);
  }
}

module.exports = Session;