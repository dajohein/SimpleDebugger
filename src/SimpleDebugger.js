import TitleBar from "./elements/titleBar";
import ToolBar from "./elements/toolBar";

export default class SimpleDebugger {
  constructor() {
    this.commandHistory = [];
    this.messages = [];
    this.historyIndex = -1;

    this.initElements();
    this.attachEventListeners();
    this.overrideConsoleLog();
  }

  attachEventListeners() {
    this.consoleInput.addEventListener(
      "keydown",
      this.handleConsoleInput.bind(this)
    );
    this.toolBar.clearConsoleButton.addEventListener(
      "click",
      this.clearConsole.bind(this)
    );
    this.toolBar.filterSelector.addEventListener(
      "change",
      this.updateFilteredMessages.bind(this)
    );
    this.toolBar.searchInput.addEventListener(
      "input",
      this.debounce(this.searchConsoleOutput.bind(this), 300)
    );
    this.resizeHandle.addEventListener(
      "mousedown",
      this.startResize.bind(this)
    );
    this.titleBar.closeButton.addEventListener(
      "click",
      this.closeDebugger.bind(this)
    );
    this.titleBar.element.addEventListener(
      "mousedown",
      this.startDrag.bind(this)
    );
    document.addEventListener("mousemove", this.dragResizeConsole.bind(this));
    document.addEventListener("mouseup", this.stopDragResize.bind(this));
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
        this.toolBar.filterSelector.value === "all" ||
        this.toolBar.filterSelector.value === messageObj.type
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

  restoreConsoleLog() {
    console.log = this.originalConsoleLog;
    console.warn = this.originalConsoleWarn;
    console.error = this.originalConsoleError;
  }

  overrideConsoleLog() {
    const self = this;
    self.originalConsoleLog = console.log;
    self.originalConsoleWarn = console.warn;
    self.originalConsoleError = console.error;

    console.log = function (message) {
      if (
        self.toolBar.filterSelector.value === "all" ||
        self.toolBar.filterSelector.value === "log"
      ) {
        self.addMessage("log", message);
      }
      self.originalConsoleLog.apply(console, arguments);
    };

    console.warn = function (message) {
      if (
        self.toolBar.filterSelector.value === "all" ||
        self.toolBar.filterSelector.value === "warn"
      ) {
        self.addMessage("warn", message);
      }
      self.originalConsoleWarn.apply(console, arguments);
    };

    console.error = function (message) {
      if (
        self.toolBar.filterSelector.value === "all" ||
        self.toolBar.filterSelector.value === "error"
      ) {
        self.addMessage("error", message);
      }
      self.originalConsoleError.apply(console, arguments);
    };
  }

  searchConsoleOutput() {
    const searchValue = this.toolBar.searchInput.value;
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

  closeDebugger() {
    this.devConsole.remove();
    restoreConsoleLog();
  }

  initElements() {
    this.titleBar = new TitleBar();
    this.toolBar = new ToolBar();

    this.devConsole = document.createElement("div");
    this.consoleOutput = document.createElement("div");
    this.consoleInput = document.createElement("input");
    this.resizeHandle = document.createElement("div");

    this.devConsole.className = "simple-debugger";
    this.consoleOutput.className = "console-output";
    this.consoleInput.className = "console-input";
    this.resizeHandle.className = "resize-handle";
    this.resizeHandle.innerHTML = "&#x2923;";

    this.devConsole.appendChild(this.titleBar.element);
    this.devConsole.appendChild(this.toolBar.element);
    this.devConsole.appendChild(this.consoleOutput);
    this.devConsole.appendChild(this.consoleInput);
    this.devConsole.appendChild(this.resizeHandle);
    document.body.appendChild(this.devConsole);
  }
}
