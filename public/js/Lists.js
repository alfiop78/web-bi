class Lists {
  #sublist;
  #ul;
  constructor() {
    this.tmplList = document.getElementById('templateList');
    this.tmplSublists = document.getElementById('template-sublists');
  }

  set ul(value) {
    this.#ul = document.getElementById(value);
  }

  get ul() { return this.#ul; }

  set cubes(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.selectable = this.section.querySelector('.selectable');
    this.span = this.section.querySelector('span');
    this.small = this.section.querySelector('small');
    this.#sublist = {
      section: this.section,
      selectable: this.selectable,
      span: this.span,
      small: this.small
    }
  }

  get cubes() { return this.#sublist; }

  set dimensions(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.selectable = this.section.querySelector('.selectable');
    this.span = this.section.querySelector('span');
    this.#sublist = {
      section: this.section,
      selectable: this.selectable,
      span: this.span
    }
  }

  get dimensions() { return this.#sublist; }

  set hierarchies(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.unselectable = this.section.querySelector('.unselectable');
    this.vContent = this.section.querySelector('.v-content');
    this.dimensionSpan = this.vContent.querySelector('span[data-dimension]');
    this.span = this.section.querySelector('span[item]');

    this.#sublist = {
      section: this.section,
      unselectable: this.unselectable,
      dimensionSpan: this.dimensionSpan,
      vContent: this.vContent,
      span: this.span
    }
  }

  get hierarchies() { return this.#sublist; }

  set tables(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.selectable = this.section.querySelector('.selectable');
    this.span = this.section.querySelector('span[table]');
    this.small = this.section.querySelector('small');

    this.#sublist = {
      section: this.section,
      selectable: this.selectable,
      span: this.span,
      small: this.small
    }
  }

  get tables() { return this.#sublist; }

  set columns(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.selectable = this.section.querySelector('.selectable');
    this.span = this.section.querySelector('span[column]');
    this.table = this.section.querySelector('small[table]');
    // info può contenere la gerarchia oppure il cubo
    this.info = this.section.querySelector('small:last-child');
    this.btnEdit = this.section.querySelector('button[data-edit]');

    this.#sublist = {
      section: this.section,
      selectable: this.selectable,
      span: this.span,
      table: this.table,
      info: this.info,
      btnEdit: this.btnEdit
    }
  }

  get columns() { return this.#sublist; }

  set metrics(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.selectable = this.section.querySelector('.selectable');
    this.span = this.section.querySelector('span[metric]');
    this.table = this.section.querySelector('small[table]');
    this.cube = this.section.querySelector('small[cube]');
    this.btnInfo = this.section.querySelector('button[data-info]');
    this.btnEdit = this.section.querySelector('button[data-edit]');

    this.#sublist = {
      section: this.section,
      selectable: this.selectable,
      span: this.span,
      table: this.table,
      cube: this.cube,
      btnEdit: this.btnEdit,
      btnInfo: this.btnInfo
    }
  }

  get metrics() { return this.#sublist; }

  set generic(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.selectable = this.section.querySelector('.selectable');
    this.span = this.section.querySelector('span');

    this.#sublist = {
      section: this.section,
      selectable: this.selectable,
      span: this.span
    }
  }

  get generic() { return this.#sublist; }

  set reports(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.span = this.section.querySelector('span[data-process]');
    this.btnEdit = this.section.querySelector('button[data-edit]');
    this.btnCopy = this.section.querySelector('button[data-copy]')
    this.btnSchedule = this.section.querySelector('button[data-schedule]')

    this.#sublist = {
      section: this.section,
      selectable: this.selectable,
      span: this.span,
      btnEdit: this.btnEdit,
      btnCopy: this.btnCopy,
      btnSchedule: this.btnSchedule
    }
  }

  get reports() { return this.#sublist; }

  set filters(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.selectable = this.section.querySelector('.selectable');
    this.span = this.section.querySelector('span[filter]');
    this.info = this.section.querySelector('small:last-child');
    this.btnEdit = this.section.querySelector('button[data-edit]')

    this.#sublist = {
      section: this.section,
      selectable: this.selectable,
      span: this.span,
      info: this.info,
      btnEdit: this.btnEdit
    }
  }

  get filters() { return this.#sublist; }

  set availableMetrics(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.selectable = this.section.querySelector('.selectable');
    this.span = this.section.querySelector('span[metric]');
    this.small = this.section.querySelector('small');

    this.#sublist = {
      section: this.section,
      selectable: this.selectable,
      span: this.span,
      small: this.small
    }
  }

  get availableMetrics() { return this.#sublist; }

  getCubes() {
    this.ul = 'ul-cubes';
    for (const [token, value] of StorageCube.cubes) {
      // imposto il template per questa sublist
      this.cubes = 'data-sublist-cube';
      this.#sublist.section.dataset.label = value.name;
      this.#sublist.section.dataset.cubeToken = token;
      this.#sublist.selectable.dataset.label = value.name;
      this.#sublist.selectable.dataset.cubeToken = token;
      this.#sublist.selectable.dataset.tableAlias = value.alias;
      this.#sublist.selectable.dataset.tableName = value.FACT;
      this.#sublist.selectable.dataset.schema = value.schema;
      this.#sublist.span.innerText = value.name;
      this.#sublist.small.innerText = value.FACT;
      this.#sublist.selectable.dataset.fn = 'handlerCubeSelected';
      this.ul.appendChild(this.#sublist.section);
    }
  }

  getDimensions() {
    this.ul = 'ul-dimensions';
    for (const [token, cube] of StorageCube.cubes) {
      // per ogni dimensione presente in associatedDimensions inserisco un element (preso dal template app.tmplListField)
      cube.associatedDimensions.forEach(tokenDimension => {
        StorageDimension.selected = tokenDimension;
        this.dimensions = 'data-sublist-dimension';
        this.#sublist.section.dataset.label = StorageDimension.selected.name;
        this.#sublist.section.dataset.dimensionToken = tokenDimension;
        this.#sublist.section.dataset.cubeToken = token;
        this.#sublist.selectable.dataset.dimensionToken = tokenDimension;
        this.#sublist.span.innerText = StorageDimension.selected.name;
        this.#sublist.selectable.dataset.fn = 'handlerDimensionSelected';
        this.ul.appendChild(this.#sublist.section);
      });
    }
  }

  getHierarchies(ul) {
    this.ul = ul;
    // ottengo l'elenco delle gerarchie per ogni dimensione presente in storage, successivamente, quando la dimensione viene selezionata, visualizzo/nascondo solo quella selezionata
    // console.log('lista dimensioni :', StorageDimension.dimensions);
    // per ogni dimensione presente aggiungo gli elementi nella ul con le gerarchie
    for (const [token, dimension] of StorageDimension.dimensions) {
      // per ogni dimensione presente in associatedDimensions inserisco un element (preso dal template app.tmplListField)
      for (const [hierToken, hier] of (Object.entries(dimension.hierarchies))) {
        this.hierarchies = 'data-sublist-hierarchies';
        this.#sublist.section.dataset.label = hier.name;
        this.#sublist.section.dataset.elementSearch = 'search-hierarchy';
        this.#sublist.section.dataset.dimensionToken = token;
        this.#sublist.unselectable.dataset.label = hier.name;
        this.#sublist.unselectable.dataset.dimensionToken = token;
        this.#sublist.unselectable.dataset.hierToken = hierToken;
        // this.#sublist.unselectable.addEventListener('click', app.handlerHierarchySelected);
        this.#sublist.dimensionSpan.innerText = dimension.name;
        this.#sublist.span.innerText = hier.name;
        this.#sublist.span.dataset.hierName = hier.name;
        this.#sublist.span.dataset.dimensionName = dimension.name;

        // lista tabelle presenti per ogni gerarchia
        for (const [tableId, table] of Object.entries(hier.order)) {
          // console.log(table.table);
          const contentSub = this.tmplSublists.content.cloneNode(true);
          const small = contentSub.querySelector('small');
          small.dataset.schema = table.schema;
          small.dataset.dimensionToken = token;
          small.dataset.hierToken = hierToken;
          small.dataset.searchable = true;
          small.dataset.label = table.table;
          small.dataset.tableAlias = table.alias;
          small.dataset.tableId = tableId;
          small.innerText = table.table;
          this.#sublist.vContent.appendChild(small);
        }
        this.ul.appendChild(this.#sublist.section);
      }
    }
  }

  getTables() {
    // popolamento delle tabelle nella dialogFilter
    this.ul = 'ul-tables';
    for (const [token, value] of StorageDimension.dimensions) {
      // key : nome della dimensione
      // value : tutte le property della dimensione
      for (const [hierToken, hierValue] of Object.entries(value.hierarchies)) {
        for (const [tableId, table] of Object.entries(hierValue.order)) {
          // console.log('tableId : ', tableId);
          // console.log('table : ', table);
          this.tables = 'data-sublist-tables';
          this.#sublist.section.dataset.relatedObject = 'dimension';
          this.#sublist.section.dataset.dimensionToken = token;
          this.#sublist.section.dataset.hierToken = hierToken;
          this.#sublist.section.dataset.label = table.table;
          this.#sublist.section.dataset.tableName = table.table;
          this.#sublist.selectable.dataset.dimensionToken = token;
          this.#sublist.selectable.dataset.hierToken = hierToken;
          this.#sublist.selectable.dataset.hierName = hierValue.name;
          this.#sublist.selectable.dataset.tableName = table.table;
          this.#sublist.selectable.dataset.tableAlias = table.alias;
          this.#sublist.selectable.dataset.schema = table.schema;
          this.#sublist.selectable.dataset.tableId = tableId;
          this.#sublist.selectable.dataset.fn = 'handlerSelectTable';
          this.#sublist.span.innerText = table.table;
          this.#sublist.small.innerText = hierValue.name;
          this.ul.appendChild(this.#sublist.section);
        }
      }
    }
  }

  getFactTables() {
    // popolamento delle tabelle nella dialogFilter
    this.ul = 'ul-tables';
    for (const [token, value] of StorageCube.cubes) {
      this.#sublist.section.dataset.label = value.FACT;
      this.#sublist.section.dataset.cubeToken = token;
      this.#sublist.section.dataset.relatedObject = 'cube';
      this.#sublist.selectable.dataset.label = value.FACT;
      this.#sublist.selectable.dataset.tableName = value.FACT;
      this.#sublist.selectable.dataset.tableAlias = value.alias;
      this.#sublist.selectable.dataset.schema = value.schema;
      this.#sublist.selectable.dataset.cubeToken = token;
      this.#sublist.selectable.dataset.fn = 'handlerSelectTable';
      this.#sublist.span.innerText = value.FACT;
      this.#sublist.small.innerText = value.name;
      this.ul.appendChild(this.#sublist.section);
    }
  }

  getColumns() {
    this.ul = 'ul-columns';
    // per ogni dimensione, recupero la property 'columns'
    // console.log('StorageDimension.selected : ', StorageDimension.dimensions);
    for (const [dimToken, value] of StorageDimension.dimensions) {
      // key : nome della dimensione
      // value : tutte le property della dimensione
      for (const [hierToken, hierValue] of Object.entries(value.hierarchies)) {
        // per ogni gerarchia...
        for (const [tableId, table] of Object.entries(hierValue.order)) {
          // verifico se la tabella in ciclo ha delle colonne mappate
          if (hierValue.columns.hasOwnProperty(table.alias)) {
            for (const [token, field] of Object.entries(hierValue.columns[table.alias])) {
              // console.log('field : ', field);
              this.columns = 'data-sublist-columns';
              this.#sublist.section.dataset.relatedObject = 'dimension';
              this.#sublist.section.dataset.label = field.ds.field;
              this.#sublist.section.dataset.dimensionToken = dimToken;
              this.#sublist.section.dataset.hierToken = hierToken;
              this.#sublist.selectable.dataset.label = field.ds.field;
              this.#sublist.selectable.dataset.tableName = table.table;
              this.#sublist.selectable.dataset.tableAlias = table.alias;
              this.#sublist.selectable.dataset.tableId = tableId;
              this.#sublist.selectable.dataset.dimensionToken = dimToken;
              this.#sublist.selectable.dataset.hierToken = hierToken;
              this.#sublist.selectable.dataset.tokenColumn = token;
              this.#sublist.selectable.dataset.fn = 'handlerSelectColumn';
              this.#sublist.btnEdit.dataset.objectToken = token;
              this.#sublist.btnEdit.dataset.fn = 'handlerColumnEdit'; // TODO: da implementare
              this.#sublist.span.innerText = field.ds.field;
              this.#sublist.table.innerText = table.table;
              this.#sublist.info.innerText = hierValue.name;
              this.ul.appendChild(this.#sublist.section);
            }
          }
        }
      }
    }
  }

  getFactColumns() {
    this.ul = 'ul-columns';
    for (const [cubeToken, value] of StorageCube.cubes) {
      if (value.columns.hasOwnProperty(value.alias)) {
        for (const [token, field] of Object.entries(value.columns[value.alias])) {
          this.columns = 'data-sublist-columns';
          this.#sublist.section.dataset.relatedObject = 'cube';
          this.#sublist.section.dataset.label = field.ds.field;
          this.#sublist.section.dataset.cubeToken = cubeToken;
          this.#sublist.selectable.dataset.label = field.ds.field;
          this.#sublist.selectable.dataset.tableName = value.FACT;
          this.#sublist.selectable.dataset.tableAlias = value.alias;
          this.#sublist.selectable.dataset.tokenColumn = token;
          this.#sublist.selectable.dataset.cubeToken = cubeToken;
          this.#sublist.selectable.dataset.fn = 'handlerSelectColumn';
          this.#sublist.btnEdit.dataset.objectToken = token;
          this.#sublist.btnEdit.dataset.fn = 'handlerColumnEdit';
          this.#sublist.span.innerText = field.ds.field;
          this.#sublist.table.innerText = value.FACT;
          this.#sublist.info.innerText = value.name;
          this.ul.appendChild(this.#sublist.section);
        }
      }
    }
  }

  // lista metriche esistenti
  getMetrics() {
    this.ul = 'ul-metrics';
    /* NOTE: logica delle metriche
    0 : metrica di base
    1 : metrica di base, legata al cubo, composto (es.: prezzo*quantità)
    2 : metrica filtrata
    3 : metrica filtrata composta
    4 : metrica composta
    */
    // ...per ogni cubo 
    for (const [cubeToken, value] of StorageCube.cubes) {
      StorageMetric.cubeMetrics = cubeToken;
      // recupero le metriche di base 0, base composte 1, avanzate 2
      // console.log(StorageMetric.baseAdvancedMetrics.size);
      StorageMetric.baseAdvancedMetrics.forEach(metric => {
        // console.log('metric : ', metric);
        this.metrics = 'data-sublist-metrics';
        this.#sublist.section.dataset.relatedObject = 'cube';
        this.#sublist.section.dataset.label = metric.name;
        this.#sublist.section.dataset.cubeToken = cubeToken;
        this.#sublist.section.dataset.metricToken = metric.token;
        this.#sublist.selectable.dataset.tableName = value.FACT;
        this.#sublist.selectable.dataset.tableAlias = value.alias;
        // metricha di base composta
        this.#sublist.selectable.dataset.cubeToken = cubeToken;
        this.#sublist.selectable.dataset.metricToken = metric.token;
        this.#sublist.selectable.dataset.metricType = metric.metric_type;
        // div.dataset.label = metric.name;
        this.#sublist.selectable.dataset.fn = 'handlerMetricSelected';
        (metric.metric_type === 2) ? this.#sublist.btnInfo.dataset.infoObjectToken = metric.token : this.#sublist.btnInfo.hidden = 'true';
        this.#sublist.btnEdit.dataset.objectToken = metric.token;
        this.#sublist.btnEdit.dataset.fn = 'handlerMetricEdit'; // TODO: implementare
        this.#sublist.span.innerText = metric.name;
        this.#sublist.table.innerText = value.FACT;
        this.#sublist.cube.innerText = value.name;
        this.ul.appendChild(this.#sublist.section);
      });
    }
  }

  // aggiungo la metrica appena creata alla <ul> (metriche base e filtrate)
  addMetric() {
    this.ul = 'ul-metrics';
    this.metrics = 'data-sublist-metrics';
    this.#sublist.section.hidden = false; // rendo visibile la metrica appena creata
    this.#sublist.section.dataset.label = StorageMetric.selected.name;
    this.#sublist.section.dataset.cubeToken = StorageMetric.selected.cubeToken;
    this.#sublist.section.toggleAttribute('data-searchable');
    this.#sublist.selectable.dataset.tableName = Query.table;
    this.#sublist.selectable.dataset.tableAlias = Query.tableAlias;
    this.#sublist.selectable.dataset.cubeToken = StorageMetric.selected.cubeToken;
    this.#sublist.selectable.dataset.metricToken = StorageMetric.selected.token;
    this.#sublist.selectable.dataset.metricType = StorageMetric.selected.metric_type;
    this.#sublist.span.innerText = StorageMetric.selected.name;
    (StorageMetric.selected.metric_type === 2) ? this.#sublist.btnInfo.dataset.infoObjectToken = StorageMetric.selected.token : this.#sublist.btnInfo.hidden = 'true';
    this.#sublist.btnEdit.dataset.objectToken = StorageMetric.selected.token;
    this.#sublist.btnEdit.dataset.fn = 'handlerMetricEdit';
    if (StorageMetric.selected.metric_type === 0 || StorageMetric.selected.metric_type === 2) this.#sublist.table.innerText = Query.table;
    this.#sublist.cube.innerText = StorageCube.selected.name;
    this.#sublist.selectable.dataset.fn = 'handlerMetricSelected';
    this.ul.appendChild(this.#sublist.section);
  }

  addField(value) {
    this.ul = 'dialog-filter-fields';
    this.generic = 'data-sublist-gen';
    this.#sublist.section.dataset.label = value.COLUMN_NAME;
    this.#sublist.section.dataset.elementSearch = 'dialog-filter-search-field';
    this.#sublist.selectable.dataset.schema = Query.schema;
    let pos = value.DATA_TYPE.indexOf('('); // datatype
    const type = (pos !== -1) ? value.DATA_TYPE.substring(0, pos) : value.DATA_TYPE;
    this.#sublist.selectable.dataset.type = type;
    this.#sublist.selectable.dataset.label = value.COLUMN_NAME;
    this.#sublist.selectable.dataset.tableName = Query.table;
    this.#sublist.span.innerText = value.COLUMN_NAME;
    this.ul.appendChild(this.#sublist.section);
  }

  // lista delle metriche disponibili nei cubi
  getAvailableMetrics() {
    this.ul = 'ul-available-metrics';
    for (const [token, value] of StorageCube.cubes) {
      // per ogni metrica
      for (const [name, metric] of Object.entries(value.metrics)) {
        this.availableMetrics = 'data-sublist-available-metrics';
        this.#sublist.section.dataset.relatedObject = 'cube';
        this.#sublist.section.dataset.label = name;
        this.#sublist.section.dataset.cubeToken = token;
        this.#sublist.section.dataset.tableAlias = value.alias;
        this.#sublist.section.dataset.tableName = value.FACT;
        this.#sublist.selectable.dataset.tableAlias = value.alias;
        this.#sublist.selectable.dataset.tableName = value.FACT;
        this.#sublist.selectable.dataset.label = name;
        this.#sublist.selectable.dataset.cubeToken = token;
        this.#sublist.selectable.dataset.metricType = metric.metric_type;
        this.#sublist.selectable.dataset.fn = 'handlerMetricAvailable';
        this.#sublist.span.innerText = name;
        this.#sublist.small.innerText = value.FACT;
        this.ul.appendChild(this.#sublist.section);
      }
    }
  }

  addReport(token, value) {
    this.ul = 'ul-processes';
    this.reports = 'data-sublist-processes';
    this.#sublist.section.dataset.label = value.name;
    this.#sublist.section.dataset.reportToken = token;
    this.#sublist.span.innerText = value.name;
    this.#sublist.btnEdit.dataset.id = value.report.processId;
    this.#sublist.btnEdit.dataset.processToken = token;
    this.#sublist.btnCopy.dataset.id = value.report.processId;
    this.#sublist.btnCopy.dataset.processToken = token;
    this.#sublist.btnSchedule.dataset.id = value.report.processId;
    this.#sublist.btnSchedule.dataset.processToken = token;
    this.#sublist.btnEdit.dataset.fn = 'handlerReportEdit';
    this.#sublist.btnCopy.dataset.fn = 'handlerReportCopy';
    this.#sublist.btnSchedule.dataset.fn = 'handlerReportSelected';
    this.ul.appendChild(this.#sublist.section);
  }

  addFilterProperty(hidden) {
    this.#sublist.section.hidden = hidden;
    // il filtro può contenere tabelle dei livelli dimensionali insieme alla FACT
    this.#sublist.section.dataset.label = StorageFilter.selected.name;
    this.#sublist.section.dataset.filterToken = StorageFilter.selected.token;
    if (StorageFilter.selected.hasOwnProperty('dimensions')) {
      this.#sublist.section.dataset.dimensionToken = StorageFilter.selected.dimensions.join(' ');
      // elenco token hier separate da spazi
      this.#sublist.section.dataset.hierToken = Object.keys(StorageFilter.selected.hierarchies).join(' ');
    } else {
      this.#sublist.section.dataset.cubeToken = StorageFilter.selected.cubes;
    }
    this.#sublist.selectable.dataset.filterToken = StorageFilter.selected.token;
    this.#sublist.span.innerText = StorageFilter.selected.name;
    // smallTable.innerText = table.table;
    this.#sublist.info.setAttribute('hier', 'true'); // TODO: dataset
    this.#sublist.btnEdit.dataset.objectToken = StorageFilter.selected.token;
    this.ul.appendChild(this.#sublist.section);
  }

  addFilter(hidden) {
    this.ul = 'ul-filters';
    this.filters = 'data-sublist-filters';
    // gli eventi sulla .selectable sono definiti nel template HTML
    this.addFilterProperty(hidden);
  }

  // aggiunta filtri nella dialog metric (metriche avanzate)
  addMetricFilter(hidden) {
    this.ul = 'ul-metric-filters';
    this.filters = 'data-sublist-filters-metric';
    // gli eventi sulla .selectable sono definiti nel template HTML
    this.addFilterProperty(hidden);
  }

  /* QUESTE FN LE SPOSTERO' IN UN ALTRO FILE "asyncReq*/
  // carico elenco colonne dal DB da visualizzare nella dialogFilter
  async getFields() {
    return await fetch('/fetch_api/' + Query.schema + '/schema/' + Query.table + '/table_info')
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(response => response)
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }
}
