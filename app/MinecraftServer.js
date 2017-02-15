const pty = require("node-pty");

class MinecraftServer
{
  constructor(sessionHandler)
  {
    this._status = "stopped";
    this.minecraft = undefined;
    this.sessionHandler = sessionHandler;
    this._output = "";
  }

  get status()
  {
    return this._status;
  }

  set status(value)
  {
    this._status = value;

    this.sessionHandler.broadcast({
      type: "status",
      status: value
    });
  }
  
  get running()
  {
    return this._status == "running";
  }

  start()
  {
    if(this.running)
      return;
    
    this.status = "running";
    this._output = "";

    var args = process.env.START_COMMAND.split(" ");
    var command = args.shift();

    this.minecraft = pty.spawn(
      command,
      args,
      {
        name: 'xterm-color',
        cwd: process.env.CWD
      }
    );

    this.minecraft.on('data', (data) => this.output(data));
    //this.minecraft.on('error', (err) => this.output(err));

    this.minecraft.on(
      'close',
      (data) => {
        this.status = "stopped";
      }
    );
  }

  write(session, input)
  {
    if(this.minecraft)
      this.minecraft.write(input);
  }

  output(data, ignore)
  {
    this.sessionHandler.broadcast({
      type: "shell",
      action: "output",
      data: data
    }, ignore);
    
    this._output += data;
  }

  stop()
  {
    if(this.running)
      this.minecraft.kill();
  }
}

module.exports = MinecraftServer;
