export default class ColumnChart {
  constructor({
    data = [],
    label = '',
    value = 0,
    link = '',
    formatHeading = (data) => data
  } = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = formatHeading(value);
    this.columnProps = null;
    this.chartHeight = 50;
    this.getColumnProps(this.data)
    this.render();
  }

  getTemplate() {
    return `
  <h2>${this.label}</h2>
    <div class="dashboard__chart_${this.label}">
      <div class="column-chart" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          <a href="${this.link}" class="column-chart__link">View All</a>
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.value}</div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>
    </div>
`}

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.getTemplate();
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
    if (!this.data || this.data.length === 0) return;
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
    this.data = data;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
