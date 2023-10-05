// Classe Dashboards.js
class Dashboards {
  #sheetSpecs;
  constructor() { }

  set sheetSpecs(value) {
    this.#sheetSpecs = value;
  }

  get sheetSpecs() { return this.#sheetSpecs; }

  drawControls(filtersRef) {
    this.controls = [];
    // console.log(this.sheetSpecs);
    if (this.sheetSpecs.filters) {
      this.sheetSpecs.filters.forEach(filter => {
        // creo qui il div class="filters" che conterrà il filtro
        // In questo modo non è necessario specificare i filtri nel template layout
        this.filterRef = document.createElement('div');
        this.filterRef.className = 'filters';
        this.filterRef.id = filter.containerId;
        filtersRef.appendChild(this.filterRef);
        // console.log(filter.containerId, filter.filterColumnLabel);
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
        this.controls.push(this.filter);
      });
    }
    return this.controls;
  }

}
