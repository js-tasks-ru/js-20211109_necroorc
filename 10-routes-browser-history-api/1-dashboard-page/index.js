import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

export default class Page {
  subElements = {};
  components = {};
  defaultFrom = new Date();
  defaultTo = new Date();

  setDefaultRange() {
    const month = this.defaultTo.getMonth();
    this.defaultFrom.setMonth(month - 1);

    if (this.defaultFrom.getMonth() === month) {
      this.defaultFrom.setDate(0);
      this.defaultFrom.setHours(0, 0, 0, 0);
    }
  }

  getTemplate() {
    return `
      <div class="dashboard full-height flex-column">
        <div class="content__top-panel">
          <h2 class="page-title">Панель Управления</h2>
          <div class="rangepicker"></div>
        </div>
        <div class="dashboard__charts">
          <div class="column-chart dashboard__chart_orders"></div>
          <div class="column-chart dashboard__chart_sales"></div>
          <div class="column-chart dashboard__chart_customers"></div>
        </div>
        <h3 class="block-title">Лидеры продаж</h3>
        <div class="sortable-table"></div>
      </div>
`
  }

  initialize() {
    this.components = {
      rangePicker: new RangePicker({ from: this.defaultFrom, to: this.defaultTo }),
      ordersChart: new ColumnChart({
        range: {
          from: this.defaultFrom,
          to: this.defaultTo
        },
        url: 'api/dashboard/orders',
        label: 'orders',
        link: '#',
      }),
      salesChart: new ColumnChart({
        range: {
          from: this.defaultFrom,
          to: this.defaultTo
        },
        url: 'api/dashboard/sales',
        label: 'sales',
        formatHeading: data => `$${data}`
      }),
      customersChart: new ColumnChart({
        range: {
          from: this.defaultFrom,
          to: this.defaultTo
        },
        url: 'api/dashboard/customers',
        label: 'customers',
      }),
      sortableTable: new SortableTable(header, {
        url: 'api/dashboard/bestsellers',
        range: {
          from: this.defaultFrom,
          to: this.defaultTo
        }
      })
    }

    const rangePickerContainer = this.element.querySelector('.rangepicker');
    rangePickerContainer.append(this.components.rangePicker.element);
    const ordersChartContainer = this.element.querySelector('.dashboard__chart_orders');
    const salesChartContainer = this.element.querySelector('.dashboard__chart_sales');
    const customersChartContainer = this.element.querySelector('.dashboard__chart_customers');
    ordersChartContainer.append(this.components.ordersChart.element);
    salesChartContainer.append(this.components.salesChart.element);
    customersChartContainer.append(this.components.customersChart.element);
    const sortableTableContainer = this.element.querySelector('.sortable-table');
    sortableTableContainer.replaceWith(this.components.sortableTable.element);
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.setDefaultRange();
    this.initialize();
    this.subElements = this.getSubElements();
    this.attachEventListeners();
    return this.element;
  }

  getSubElements() {
    const result = {};
    Object.entries(this.components).forEach(([name, instance]) => {
      result[name] = instance.element;
    })

    return result;
  }

  async updateComponents(range) {
    await this.components.ordersChart.update(range.detail.from, range.detail.to);
    await this.components.salesChart.update(range.detail.from, range.detail.to);
    await this.components.customersChart.update(range.detail.from, range.detail.to);
    await this.components.sortableTable.sortOnServer({
      from: range.detail.from,
      to: range.detail.to,
    })
  }

  dateSelectHandler = (event) => {
    this.updateComponents(event);
  }

  menuToggleHandler = () => {
    document.body.classList.toggle('is-collapsed-sidebar');
  }

  attachEventListeners() {
    document.addEventListener('date-select', this.dateSelectHandler);
    document.querySelector('.sidebar__toggler')?.addEventListener('pointerdown', this.menuToggleHandler);
  }

  removeListeners() {
    document.removeEventListener('date-select', this.dateSelectHandler);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeListeners();
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.remove();
    this.subElements = {};
  }
}
