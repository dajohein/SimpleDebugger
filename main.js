class SimpleDebugger {
  constructor() {
    this.commandHistory = [];
    this.historyIndex = -1;

    this.initElements();
    this.attachEventListeners();
  }

  initElements() {
    this.devConsole = document.createElement("div");
    this.consoleOutput = document.createElement("div");
    this.consoleInput = document.createElement("input");
    this.clearConsoleButton = document.createElement("button");
    this.filterSelector = document.createElement("select");
    this.searchInput = document.createElement("input");
    this.resizeHandle = document.createElement("div");

    this.devConsole.style.cssText = `
        position: fixed;
        bottom: 0;
        right: 0;
        width: 50%;
        height: 50%;
        background-color: #242424;
        color: #ffffff;
        font-family: monospace;
        font-size: 14px;
        padding: 4px;
        overflow: hidden;
        border: 1px solid #1c1c1c;
        display: flex;
        flex-direction: column;
      `;
    this.consoleOutput.style.cssText = `
        background-color: #242424;
        color: #ffffff;
        font-family: monospace;
        font-size: 14px;
        overflow-y: scroll;
        flex-grow: 1;
        padding: 4px;
        border-bottom: 1px solid #1c1c1c;
      `;
    this.consoleInput.style.cssText = `
        background-color: #3c3c3c;
        border: none;
        color: #ffffff;
        outline: none;
        width: 100%;
        padding: 4px;
        box-sizing: border-box;
      `;
    this.clearConsoleButton.textContent = "Clear Console";
    this.clearConsoleButton.style.cssText = `
        background-color: #3c3c3c;
        border: none;
        color: #ffffff;
        cursor: pointer;
        outline: none;
        padding: 4px;
      `;
    this.filterSelector.innerHTML = `
        <option value="all">All</option>
        <option value="log">Logs</option>
        <option value="warn">Warnings</option>
        <option value="error">Errors</option>
      `;
    this.filterSelector.style.cssText = `
        background-color: #3c3c3c;
        border: none;
        color: #ffffff;
        outline: none;
        padding: 4px;
      `;
    this.searchInput.type = "text";
    this.searchInput.placeholder = "Search...";
    this.searchInput.style.cssText = `
        background-color: #3c3c3c;
        border: none;
        color: #ffffff;
        outline: none;
        padding: 4px;
      `;
    this.resizeHandle.style.cssText = `
        position: absolute;
        top: 0;
        right: 0;
        width: 10px;
        height: 10px;
        cursor: nwse-resize;
      `;

    this.devConsole.appendChild(this.clearConsoleButton);
    this.devConsole.appendChild(this.filterSelector);
    this.devConsole.appendChild(this.searchInput);
    this.devConsole.appendChild(this.consoleOutput);
    this.devConsole.appendChild(this.consoleInput);
    this.devConsole.appendChild(this.resizeHandle);
    document.body.appendChild(this.devConsole);
  }

  attachEventListeners() {
    this.consoleInput.addEventListener(
      "keydown",
      this.handleConsoleInput.bind(this)
    );
    this.clearConsoleButton.addEventListener(
      "click",
      this.clearConsole.bind(this)
    );
    this.filterSelector.addEventListener("change", this.applyFilter.bind(this));
    this.searchInput.addEventListener(
      "input",
      this.searchConsoleOutput.bind(this)
    );
    this.resizeHandle.addEventListener(
      "mousedown",
      this.startResize.bind(this)
    );
    document.addEventListener("mouseup", this.stopResize.bind(this));
  }

  handleConsoleInput(e) {
    if (e.key === "Enter" || e.keyCode === 13) {
      e.preventDefault();
      const command = this.consoleInput.value;
      this.commandHistory.unshift(command);
      this.historyIndex = -1;
      this.consoleInput.value = "";

      const message = document.createElement("div");
      message.innerHTML = `<strong>&gt;</strong> ${command}`;
      this.consoleOutput.appendChild(message);

      try {
        const result = eval(command);
        message.innerHTML += `<br><span>${result}</span>`;
      } catch (error) {
        message.innerHTML += `<br><span style="color: rgb(242, 139, 130)">${error}</span>`;
      }

      this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    } else {
      this.navigateHistory(e);
    }
  }

  clearConsole() {
    this.consoleOutput.innerHTML = "";
  }

  navigateHistory(e) {
    if (e.key === "ArrowUp" || e.keyCode === 38) {
      e.preventDefault();
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        this.consoleInput.value = this.commandHistory[this.historyIndex];
      }
    } else if (e.key === "ArrowDown" || e.keyCode === 40) {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.consoleInput.value = this.commandHistory[this.historyIndex];
      } else {
        this.historyIndex = -1;
        this.consoleInput.value = "";
      }
    }
  }

  applyFilter() {
    const filter = this.filterSelector.value;
    const lines = this.consoleOutput.querySelectorAll("div");

    lines.forEach((line) => {
      const messageType = line.children[1];
      if (
        filter === "all" ||
        (filter === "log" && !messageType.style.color) ||
        (filter === "warn" &&
          messageType.style.color === "rgb(253, 214, 99)") ||
        (filter === "error" && messageType.style.color === "rgb(242, 139, 130)")
      ) {
        line.style.display = "";
      } else {
        line.style.display = "none";
      }
    });
  }

  searchConsoleOutput() {
    const searchValue = this.searchInput.value;
    const lines = this.consoleOutput.querySelectorAll("div");

    lines.forEach((line) => {
      const messageType = line.children[1];
      messageType.innerHTML = messageType.textContent; // Reset the innerHTML

      if (searchValue) {
        messageType.innerHTML = this.highlightMatches(
          messageType.innerHTML,
          searchValue
        );
      }
    });
  }

  highlightMatches(text, search) {
    const regex = new RegExp(search, "gi");
    return text.replace(regex, (match) => "<mark>${match}</mark>");
  }

  startResize(e) {
    e.preventDefault();
    document.addEventListener("mousemove", this.resizeConsole.bind(this));
  }

  stopResize() {
    document.removeEventListener("mousemove", this.resizeConsole.bind(this));
  }

  resizeConsole(e) {
    this.devConsole.style.width = e.clientX + "px";
    this.devConsole.style.height = e.clientY + "px";
  }
}

// Create an instance of the SimpleDebugger class
new SimpleDebugger();
