export default class TitleBar {
    constructor() {
      this.element = document.createElement("div");
      this.element.className = "title-bar";
      this.element.textContent = "Simple Debugger";
      
      this.closeButton = document.createElement("button");
      this.closeButton.innerHTML = '<i class="fas fa-times" title="Close debugger"></i>';
      this.closeButton.className = "button close-button";      

      this.element.appendChild(this.closeButton);
    }
  }
  