export default class ColumnChart {
  constructor(init = {
    data: [],
    label: '',
    value: 0,
    link: ''
  }) {
    this.initOptions = init;
    this.columnProps = null;
    this.chartHeight = 50;
    this.getColumnProps(this.initOptions.data)
    this.render();
  }

  getTemplate() {
    return `
  <h2>ColumnCharts with data</h2>
    <div class="dashboard__chart_orders">
      <div class="column-chart" style="">
        <div class="column-chart__title">
          Total
          <a href="/" class="column-chart__link">View All</a>
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>
    </div>
`
  }

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.getTemplate();
    const title = this.element.querySelector('h2');
    title.innerHTML = this.initOptions.label;
    const columnChartTitle = this.element.querySelector('.column-chart__title');
    columnChartTitle.firstChild.data = `Total ${this.initOptions.label}`;
    const columnChart = this.element.querySelector('.column-chart');
    columnChart.style.setProperty('--chart-height', this.chartHeight);
    columnChart.parentElement.className = `dashboard__chart_${this.initOptions.label}`;
    const columnChartLink = this.element.querySelector('.column-chart__link');
    columnChartLink.href = this.initOptions.link;
    const columnChartValue = this.element.querySelector('.column-chart__header');
    if (this.initOptions.formatHeading) {
      columnChartValue.innerHTML = this.initOptions.formatHeading(this.initOptions.value);
    } else {
      columnChartValue.innerHTML = this.initOptions.value;
    }
    const columnChartBody = this.element.querySelector('.column-chart__chart');
    if (!this.columnProps) {
      this.element.className = 'column-chart_loading'
    } else {
      for (const columnProp of this.columnProps) {
        const column = document.createElement("div");
        column.dataset.tooltip = columnProp.percent;
        column.style.setProperty('--value', columnProp.value);
        columnChartBody.append(column);
      }
    }
  }

  getColumnProps(data) {
    if (!this.initOptions.data || this.initOptions.data.length === 0) return;
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;

    this.columnProps = data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  update(data) {
    this.initOptions.data = data;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
