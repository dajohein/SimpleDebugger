class SimpleDebugger {
  constructor() {
    this.commandHistory = [];
    this.messages = [];
    this.historyIndex = -1;

    this.loadFontAwesome();
    this.initElements();
    this.attachEventListeners();
    this.populateScriptSelector();
    this.overrideConsoleLog();
  }

  initElements() {
    this.devConsole = document.createElement("div");
    this.consoleOutput = document.createElement("div");
    this.consoleInput = document.createElement("input");
    this.clearConsoleButton = document.createElement("button");
    this.filterSelector = document.createElement("select");
    this.searchInput = document.createElement("input");
    this.resizeHandle = document.createElement("div");
    this.scriptSelector = document.createElement("select");
    this.loadScriptButton = document.createElement("button");
    this.titleBar = document.createElement("div");

    this.devConsole.style.cssText = `
        position: fixed !important;
        bottom: 0 !important;
        right: 0 !important;
        width: 50% !important;
        height: 50% !important;
        background-color: #1e1e1e !important;
        color: #dcdcdc !important;
        font-family: monospace !important;
        font-size: 14px !important;
        padding: 4px !important;
        overflow: hidden !important;
        border: 1px solid #1c1c1c !important;
        display: flex !important;
        flex-direction: column !important;
    `;
    this.consoleOutput.style.cssText = `
        background-color: #242424 !important;
        color: #ffffff !important;
        font-family: monospace !important;
        font-size: 14px !important;
        overflow-y: scroll !important;
        flex-grow: 1 !important;
        padding: 4px !important;
        border-bottom: 1px solid #1c1c1c !important;
      `;
    this.consoleInput.style.cssText = `
        font-family: monospace !important;
        font-size: 14px !important;
        background-color: #3c3c3c !important;
        border: none !important;
        color: #ffffff !important;
        outline: none !important;
        width: 100% !important;
        padding: 4px !important;
        box-sizing: border-box !important;
      `;
    this.clearConsoleButton.innerHTML = '<i class="fas fa-broom" title="Clear console"></i>';
    this.clearConsoleButton.style.cssText = `
        font-family: monospace;
        font-size: 14px;
        background-color: #3c3c3c !important;
        border: none !important;
        color: #ffffff !important;
        cursor: pointer !important;
        outline: none !important;
        padding: 4px !important;
      `;
    this.loadScriptButton.innerHTML = '<i class="fas fa-download" title="Load script"></i>';
    this.loadScriptButton.style.cssText = this.clearConsoleButton.style.cssText;

    this.filterSelector.innerHTML = `
        <option value="all">All</option>
        <option value="log">Logs</option>
        <option value="warn">Warnings</option>
        <option value="error">Errors</option>
      `;
    this.filterSelector.style.cssText = `
        font-family: monospace !important;
        font-size: 14px !important;
        background-color: #3c3c3c !important;
        border: none !important;
        color: #ffffff !important;
        outline: none !important;
        padding: 4px !important;
      `;
    this.searchInput.type = "text";
    this.searchInput.placeholder = "Search...";
    this.searchInput.style.cssText = this.filterSelector.style.cssText;
    this.resizeHandle.style.cssText = `
        position: absolute !important;
        top: 0 !important;
        right: 0 !important;
        width: 10px !important;
        height: 10px !important;
        cursor: nwse-resize !important;
      `;

    this.titleBar.textContent = "Simple Debugger";
    this.titleBar.style.cssText = `
        background-color: #1c1c1c !important;
        color: #ffffff !important;
        font-family: monospace !important;
        font-size: 14px !important;
        padding: 4px !important;
        cursor: move !important;
      `;

    this.scriptSelector.id = "scriptSelector";
    this.scriptSelector.style.marginRight = "4px";

    this.resizeHandle.innerHTML = "&#x2923;";

    this.resizeHandle.style.cssText = `
        position: absolute !important;
        bottom: 0 !important;
        right: 0 !important;
        width: 20px !important;
        height: 20px !important;
        cursor: nwse-resize !important;
        text-align: center !important;
        font-size: 14px !important;
        line-height: 20px !important;
    `;

    const toolbar = document.createElement("div");
    toolbar.style.cssText = `
  display: flex !important;
  align-items: center !important;
  padding: 4px !important;
  border-bottom: 1px solid #3c3c3c !important;
`;

    toolbar.appendChild(this.scriptSelector);
    toolbar.appendChild(this.loadScriptButton);
    toolbar.appendChild(this.clearConsoleButton);
    toolbar.appendChild(this.filterSelector);
    toolbar.appendChild(this.searchInput);

    // Style title bar for a better layout
    this.titleBar.style.cssText = `
display: flex !important;
align-items: center !important;
justify-content: space-between !important;
background-color: #1c1c1c !important;
color: #ffffff !important;
font-family: monospace !important;
font-size: 14px !important;
padding: 4px !important;
cursor: move !important;
user-select: none !important;
`;

    this.devConsole.appendChild(this.titleBar);
    this.devConsole.appendChild(toolbar);
    this.devConsole.appendChild(this.consoleOutput);
    this.devConsole.appendChild(this.consoleInput);
    this.devConsole.appendChild(this.resizeHandle);
    document.body.appendChild(this.devConsole);
  }

  loadFontAwesome() {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.integrity = "sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==";
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }

  attachEventListeners() {
    this.consoleInput.addEventListener("keydown",this.handleConsoleInput.bind(this));
    this.clearConsoleButton.addEventListener("click",this.clearConsole.bind(this));
    this.filterSelector.addEventListener("change",this.updateFilteredMessages.bind(this));
    this.searchInput.addEventListener("input",this.debounce(this.searchConsoleOutput.bind(this), 300));
    this.loadScriptButton.addEventListener("click",this.fetchAndDisplayScript.bind(this));
    this.resizeHandle.addEventListener("mousedown",this.startResize.bind(this));
    this.titleBar.addEventListener("mousedown", this.startDrag.bind(this));
    document.addEventListener("mousemove", this.dragResizeConsole.bind(this));
    document.addEventListener("mouseup", this.stopDragResize.bind(this));
  }

  async loadJSBeautify() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.0/beautify.min.js";
      script.onload = () => resolve(window.js_beautify);
      script.onerror = (error) => reject(error);
      document.body.appendChild(script);
    });
  }

  async prettyPrint(jsCode) {
    const js_beautify = await this.loadJSBeautify();
    return js_beautify(jsCode);
  }

  displayValue(value) {
    const element = document.createElement("span");

    if (typeof value === "object" && value !== null) {
      element.textContent = "{...}";
      element.style.color = "rgb(138, 212, 241)";
      element.style.cursor = "pointer";

      const objectDetails = document.createElement("div");
      objectDetails.style.display = "none";
      objectDetails.style.marginLeft = "20px";

      for (const key in value) {
        const keyElement = document.createElement("div");
        keyElement.textContent = `${key}:`;
        keyElement.style.display = "inline";

        const valueElement = this.displayValue(value[key]);
        valueElement.style.marginLeft = "5px";
        valueElement.style.display = "inline";

        objectDetails.appendChild(keyElement);
        objectDetails.appendChild(valueElement);
        objectDetails.appendChild(document.createElement("br"));
      }

      element.addEventListener("click", () => {
        objectDetails.style.display =
          objectDetails.style.display === "none" ? "" : "none";
      });

      const container = document.createElement("div");
      container.appendChild(element);
      container.appendChild(objectDetails);
      return container;
    } else {
      element.textContent = String(value);
      return element;
    }
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
        const resultElement = this.displayValue(result);
        message.appendChild(resultElement);
      } catch (error) {
        message.innerHTML += `<br><span style="color: rgb(242, 139, 130)">${error}</span>`;
      }

      this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    } else {
      this.navigateHistory(e);
    }
  }

  async fetchAndDisplayScript() {
    const scriptURL = scriptSelector.value;
    if (!scriptURL) return;

    const response = await fetch(scriptURL);
    const scriptContent = await response.text();
    const prettyScript = await this.prettyPrint(scriptContent);

    const scriptWindow = window.open("", "_blank");
    scriptWindow.document.write("<pre>" + prettyScript + "</pre>");
    scriptWindow.document.close();
  }

  populateScriptSelector() {
    const scripts = Array.from(document.getElementsByTagName("script"));
    scripts
      .filter((script) => script.src)
      .forEach((script) => {
        const option = document.createElement("option");
        option.value = script.src;
        option.innerText = script.src.split("/").pop();
        scriptSelector.appendChild(option);
      });
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

  debounce(func, wait) {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  updateFilteredMessages() {
    this.consoleOutput.innerHTML = "";

    for (const messageObj of this.messages) {
      if (
        this.filterSelector.value === "all" ||
        this.filterSelector.value === messageObj.type
      ) {
        this.addMessage(messageObj.type, messageObj.message, false);
      }
    }
  }

  addMessage(type, message, store = true) {
    const messageElement = document.createElement("div");
    messageElement.classList.add(type);

    const typeIndicator = document.createElement("span");
    typeIndicator.classList.add("type-indicator");
    typeIndicator.textContent = type.toUpperCase() + ": ";
    messageElement.appendChild(typeIndicator);

    const messageContent = document.createElement("span");
    messageContent.classList.add("message-content");
    messageContent.textContent = message;
    messageElement.appendChild(messageContent);

    this.consoleOutput.appendChild(messageElement);

    if (store) {
      this.messages.push({ type, message });
    }
  }

  overrideConsoleLog() {
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    const self = this;

    console.log = function (message) {
      if (
        self.filterSelector.value === "all" ||
        self.filterSelector.value === "log"
      ) {
        self.addMessage("log", message);
      }
      originalConsoleLog.apply(console, arguments);
    };

    console.warn = function (message) {
      if (
        self.filterSelector.value === "all" ||
        self.filterSelector.value === "warn"
      ) {
        self.addMessage("warn", message);
      }
      originalConsoleWarn.apply(console, arguments);
    };

    console.error = function (message) {
      if (
        self.filterSelector.value === "all" ||
        self.filterSelector.value === "error"
      ) {
        self.addMessage("error", message);
      }
      originalConsoleError.apply(console, arguments);
    };
  }

  searchConsoleOutput() {
    const searchValue = this.searchInput.value;
    const lines = this.consoleOutput.querySelectorAll("div");

    const clearHighlights = (element) => {
      element.querySelectorAll("mark").forEach((mark) => {
        const textNode = document.createTextNode(mark.textContent);
        mark.parentNode.replaceChild(textNode, mark);
      });
    };

    const searchAndHighlight = (element) => {
      element.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          clearHighlights(element);

          if (searchValue) {
            const regex = new RegExp(searchValue, "gi");
            const highlightedContent = child.textContent.replace(
              regex,
              (match) => `<mark>${match}</mark>`
            );
            const newSpan = document.createElement("span");
            newSpan.innerHTML = highlightedContent;
            child.parentNode.replaceChild(newSpan, child);
          }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          searchAndHighlight(child);
        }
      });
    };

    let firstMark = null;
    lines.forEach((line) => {
      searchAndHighlight(line);
      if (!firstMark) {
        firstMark = line.querySelector("mark");
      }
    });

    if (firstMark) {
      firstMark.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }

  highlightMatches(text, search) {
    const regex = new RegExp(search, "gi");
    return text.replace(regex, (match) => `<mark>${match}</mark>`);
  }

  startResize = (e) => {
    e.preventDefault();
    this.resizing = true;
  };

  stopDragResize = () => {
    this.resizing = false;
    this.dragging = false;
  };

  dragResizeConsole(e) {
    if (this.resizing) {
      const rect = this.devConsole.getBoundingClientRect();
      const minWidth = 400;
      const minHeight = 200;

      const newWidth = e.clientX - rect.left;
      const newHeight = e.clientY - rect.top;

      this.devConsole.style.width = Math.max(newWidth, minWidth) + "px";
      this.devConsole.style.height = Math.max(newHeight, minHeight) + "px";
    } else if (this.dragging) {
      this.devConsole.style.left = e.clientX - this.initialX + "px";
      this.devConsole.style.top = e.clientY - this.initialY + "px";
    }
  }

  startDrag = (e) => {
    e.preventDefault();
    this.dragging = true;
    this.initialX = e.clientX - this.devConsole.offsetLeft;
    this.initialY = e.clientY - this.devConsole.offsetTop;
  };
}
new SimpleDebugger();