class Tooltip {
  static singleton;

  constructor() {
    if (Tooltip.singleton) {
      return Tooltip.singleton
    }
    else {
      this.tooltipOnOver = this.tooltipOnOver.bind(this);
      this.removeTooltip = this.removeTooltip.bind(this);
      Tooltip.singleton = this;
    }
  }

  initialize() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.element = document.createElement('div');
    document.body.append(this.element);
  }

  tooltipOnOver(event) {
    if (event.target.dataset.tooltip === undefined) return;
    this.render();
    this.toolTip = document.createElement('div');
    this.toolTip.innerHTML = event.target.dataset.tooltip;
    this.toolTip.className = 'tooltip';
    let y = event.clientY;
    let x = event.clientX;
    this.toolTip.style.top = y + 'px';
    this.toolTip.style.left = x + 'px';
    this.element.append(this.toolTip);
  }

  removeTooltip(event) {
    if (event.target.dataset.tooltip === undefined) return;
    this.remove();
  }

  attachEventListeners() {
    document.addEventListener('pointerover', this.tooltipOnOver);
    document.addEventListener('pointerout', this.removeTooltip);
  }

  removeEventListeners() {
    document.removeEventListener('pointerover', this.tooltipOnOver);
    document.removeEventListener('pointerout', this.removeTooltip);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
  }
}

export default Tooltip;
