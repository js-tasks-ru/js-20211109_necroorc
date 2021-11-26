export default class NotificationMessage {
  static isShow = false;
  static timerID = null;

  constructor(message = 'DefaultMessage', {duration = 0, type = ''} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  getTemplate() {
    return `
    <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">
          ${this.message}
        </div>
      </div>
    </div>
`}

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate()
    this.element = wrapper.firstElementChild;
  }

  show(node = document.body) {
    if (NotificationMessage.isShow) {
      this.remove();
      clearTimeout(NotificationMessage.timerID);
    }
    node.append(this.element);
    NotificationMessage.isShow = true;
    NotificationMessage.timerID = setTimeout(() => {
      this.remove();
      NotificationMessage.isShow = false;
    }, this.duration)
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
