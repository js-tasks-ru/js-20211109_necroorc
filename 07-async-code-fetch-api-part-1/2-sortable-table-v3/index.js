import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  sortingData = []
  currentSortField
  start = 0
  end = 30
  sortShift = 30

  constructor(headersConfig, { url = '', isSortLocally = false, sorted = {} } = {}) {
    this.headerConfig = headersConfig;
    this.url = url;
    this.sortOrder = sorted.order ?? 'asc';
    this.sortID = sorted.id ?? 'title';
    this.isSortLocally = isSortLocally;
    this.subElements = {};
    this.render();
    this.attachEventListeners();
  }

  getTemplate() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table sortable-table_loading">
        <div data-element="header" class="sortable-table__header sortable-table__row"></div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
          </div>
        <div data-element="body" class="sortable-table__body"></div>
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
      </div>
    </div>
`}

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.renderHeader();
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
        ${this.headerConfig.find(obj => obj.id === 'images').template(dataItem.images)}
        <div class="sortable-table__cell">${dataItem.title}</div>
        <div class="sortable-table__cell">${dataItem.quantity}</div>
        <div class="sortable-table__cell">${dataItem.price}</div>
        ${this.headerConfig.find(obj => obj.id === 'status').template(dataItem.status)}
      </a>
      `}
    for (const dataItem of this.sortingData) {
      this.subElements.body.insertAdjacentHTML("beforeend", renderLink.call(this, dataItem))
    }
  }

  sortOnClick = (event) => {
    const target = event.target.closest('.sortable-table__cell');
    if (target.dataset.sortable === 'false') return;
    this.sortOrder === 'asc' ? this.sortOrder = 'desc' : this.sortOrder = 'asc';
    const sortableTable = document.querySelector('.sortable-table');
    sortableTable.classList.add('sortable-table_loading');
    this.currentSortField = target.dataset.id;
    this.sort(target.dataset.id, this.sortOrder);
  }

  scrollLoader = () => {
    if (document.documentElement.scrollTop + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
      this.sortOnServer(this.currentSortField, this.sortOrder,
        this.start, this.end += this.sortShift);
    }
  }

  attachEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.sortOnClick);
    document.addEventListener('scroll', this.scrollLoader);
  }

  sort(fieldValue, orderValue) {
    if (this.isSortLocally) {
      this.sortOnClient(fieldValue, orderValue);
    }
    this.sortOnServer(fieldValue, orderValue);
  }

  async sortOnServer(fieldValue = this.sortID,
                     orderValue = this.sortOrder,
                     start = this.start,
                     end = this.end) {
    const path = new URL(this.url, BACKEND_URL);
    path.searchParams.set('_embed', 'subcategory.category');
    path.searchParams.set('_sort', `${fieldValue}`);
    path.searchParams.set('_order', `${orderValue}`);
    path.searchParams.set('_start', `${start}`);
    path.searchParams.set('_end', `${end}`);
    this.sortingData = await fetchJson(path);
    const sortableTable = document.querySelector('.sortable-table');
    sortableTable.classList.remove('sortable-table_loading');
    if (Object.entries(this.sortingData).length === 0) {
      sortableTable.classList.add('sortable-table_empty');
      return;
    }
    this.start = start;
    this.end = end;
    this.renderHeader(fieldValue, orderValue);
    this.renderBody();
  }

  sortOnClient(fieldValue = this.sortID, orderValue = this.sortOrder) {
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
    document.removeEventListener('scroll', this.scrollLoader);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeListeners();
    this.remove();
    this.subElements = {};
    this.sortingData = [];
    this.start = 0;
    this.end = 30;
  }
}
