const beautify_js = require("js-beautify");

export default class ToolBar {
  constructor() {
    this.initElements();
    this.populateScriptSelector();
    this.attachEventListeners();
  }

  initElements() {
    this.element = document.createElement("div");
    this.element.className = "toolbar";

    this.scriptSelector = document.createElement("select");
    this.scriptSelector.id = "scriptSelector";
    this.scriptSelector.style.marginRight = "4px";

    this.loadScriptButton = document.createElement("button");
    this.loadScriptButton.innerHTML =
      '<i class="fas fa-download" title="Load script"></i>';
    this.loadScriptButton.className = "button";

    this.clearConsoleButton = document.createElement("button");
    this.clearConsoleButton.innerHTML =
      '<i class="fas fa-broom" title="Clear console"></i>';
    this.clearConsoleButton.className = "button";

    this.filterSelector = document.createElement("select");
    this.filterSelector.innerHTML = `
        <option value="all">All</option>
        <option value="log">Logs</option>
        <option value="warn">Warnings</option>
        <option value="error">Errors</option>
      `;
    this.filterSelector.className = "filter-selector";

    this.searchInput = document.createElement("input");
    this.searchInput.type = "text";
    this.searchInput.placeholder = "Search...";
    this.searchInput.className = "search-input";

    this.element.appendChild(this.scriptSelector);
    this.element.appendChild(this.loadScriptButton);
    this.element.appendChild(this.clearConsoleButton);
    this.element.appendChild(this.filterSelector);
    this.element.appendChild(this.searchInput);
  }

  async prettyPrint(jsCode) {
    return beautify_js(jsCode);
  }

  async fetchAndDisplayScript() {
    const scriptURL = this.scriptSelector.value;
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
        this.scriptSelector.appendChild(option);
      });
  }

  attachEventListeners() {
    this.loadScriptButton.addEventListener(
      "click",
      this.fetchAndDisplayScript.bind(this)
    );
  }
}
