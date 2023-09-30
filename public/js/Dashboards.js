// Classe Dashboards.js
class Dashboards {
  #sheetSpecs;
  constructor() {
    this.controlsWrapper = [];
  }

  set sheetSpecs(value) {
    this.#sheetSpecs = value;
  }

  get sheetSpecs() { return this.#sheetSpecs; }

  drawControls() {
    console.log(this.sheetSpecs);
    if (this.sheetSpecs.filters) {
      this.sheetSpecs.filters.forEach(filter => {
        console.log(filter.containerId, filter.filterColumnLabel);

        this.filter = new google.visualization.ControlWrapper({
          'controlType': 'CategoryFilter',
          'containerId': filter.containerId,
          'options': {
            'filterColumnLabel': filter.filterColumnLabel,
            'ui': {
              'caption': filter.caption,
              'label': '',
              'cssClass': 'g-category-filter',
              'selectedValuesLayout': 'aside'
              // 'labelStacking': 'horizontal'
            }
          }
        });
        this.controlsWrapper.push(this.filter);
      });
      console.log(this.controlsWrapper);
    }

  }
}
