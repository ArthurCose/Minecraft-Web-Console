const MinecraftServer = require("./MinecraftServer");
const Session = require("./Session");

class SessionHandler
{
  constructor()
  {
    this.sessions = [];
    this.minecraftServer = new MinecraftServer(this);
  }

  connectSession(connection)
  {
    var session = new Session(connection, this);

    this.sessions.push(session);
  }

  broadcast(message, ignore)
  {
    for(var session of this.sessions)
      if(session != ignore)
        session.send(message);
  }
}

module.exports = SessionHandler;