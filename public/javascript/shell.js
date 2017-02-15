class Shell {
  constructor(element)
  {
    this.container = element;
    this.terminal = new Terminal();
    this.terminal.open(element);

    this.terminal.on('data', (input) => {
      socket.send({
        type: "shellInput",
        input: input
      });
    });

    this.resized();
  }

  resized()
  {
    this.terminal.fit();
  }

  clear()
  {
    this.terminal.clear();
  }

  messageReceived(message)
  {
    switch (message.action) {
      case "output":
        this.terminal.write(message.data);
        break;
    }
  }
}