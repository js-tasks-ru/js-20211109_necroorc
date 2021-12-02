export default class SortableTable {
  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.headerConfig = headersConfig;
    this.sorted = sorted;
    this.isSortLocally = true;
    this.sortingData = Array.isArray(data) ? data : data.data;
    this.subElements = {};
    this.sortOrder = this.sorted.order;
    this.sortOnClick = this.sortOnClick.bind(this);
    this.render();
    this.attachEventListeners();
  }

  getTemplate() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row"></div>
        <div data-element="body" class="sortable-table__body"></div>
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
      </div>
    </div>
`}

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element)
    this.renderHeader();
    this.renderBody();
    this.sort();
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }

  renderHeader(fieldValue = '', order = '') {
    if (this.subElements.header.firstElementChild) {
      const allHeaderCells = this.subElements.header.querySelectorAll('[data-order]');
      allHeaderCells.forEach((cell) => cell.dataset.order = '');
      const cellRerender = this.subElements.header.querySelector(`[data-id="${fieldValue}"]`);
      cellRerender.dataset.order = `${order}`;
      return;
    }
    function renderHeaderCell(configPart) {
      if (configPart.template) {
        this.template = configPart.template
      }
      return `
      <div class="sortable-table__cell" data-id="${configPart.id}" data-sortable="${configPart.sortable}" data-order="">
        <span>${configPart.title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
        </span>
      </div>
      `
    }
    for (const configPart of this.headerConfig) {
      this.subElements.header.insertAdjacentHTML("beforeend", renderHeaderCell.call(this, configPart))
    }
  }

  renderBody() {
    this.subElements.body.innerHTML = '';
    function renderLink(dataItem) {
      return `
      <a href="/products/${dataItem.id}" class="sortable-table__row">
        ${this.template ? this.template(dataItem.images) : ''}
        <div class="sortable-table__cell">${dataItem.title}</div>
        <div class="sortable-table__cell">${dataItem.quantity}</div>
        <div class="sortable-table__cell">${dataItem.price}</div>
        <div class="sortable-table__cell">${dataItem.sales}</div>
      </a>
      `}
    for (const dataItem of this.sortingData) {
      this.subElements.body.insertAdjacentHTML("beforeend", renderLink.call(this, dataItem))
    }
  }

  sortOnClick(event) {
    const target = event.target.closest('.sortable-table__cell');
    if (target.dataset.sortable === 'false') return;
    this.sortOrder === 'asc' ? this.sortOrder = 'desc' : this.sortOrder = 'asc';
    this.sortOnClient(target.dataset.id, this.sortOrder);
  }

  attachEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.sortOnClick);
  }

  sort() {
    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      this.sortOnServer();
    }
  }

  sortOnClient(fieldValue = this.sorted.id, orderValue = this.sorted.order) {
    const directions = {
      asc: 1,
      desc: -1
    }

    const direction = directions[orderValue];
    const column = this.headerConfig.find(item => item.id === fieldValue);
    const { sortType } = column;

    switch (sortType) {
      case 'string':
        this.sortingData.sort((a, b) => {
          return direction * a[fieldValue].localeCompare(b[fieldValue], ['ru', 'en'], {caseFirst: 'upper'})
        })
        break;
      case 'number':
        this.sortingData.sort((a, b) => {
          return direction * (a[fieldValue] - b[fieldValue])
        })
        break;
      default:
        break;
    }
    this.renderHeader(fieldValue, orderValue)
    this.renderBody();
  }

  removeListeners() {
    this.subElements.header.removeEventListener('pointerdown', this.sortOnClick);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeListeners();
    this.remove();
    this.subElements = {};
  }
}
