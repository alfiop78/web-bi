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
    this.btnAdd = this.section.querySelector('button[data-add]');

    this.#sublist = {
      section: this.section,
      selectable: this.selectable,
      span: this.span,
      table: this.table,
      info: this.info,
      btnAdd: this.btnAdd
    }
  }

  get columns() { return this.#sublist; }

  set definedColumns(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.defined = this.section.querySelector('.defined');
    this.span = this.section.querySelector('span[column]');
    this.btnRemove = this.section.querySelector('button[data-remove]');
    this.btnEdit = this.section.querySelector('button[data-edit]');

    this.#sublist = {
      section: this.section,
      defined: this.defined,
      span: this.span,
      btnRemove: this.btnRemove,
      btnEdit: this.btnEdit
    }
  }

  get definedColumns() { return this.#sublist; }

  set definedFilters(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.defined = this.section.querySelector('.defined');
    this.span = this.section.querySelector('span[filter]');
    this.btnRemove = this.section.querySelector('button[data-remove]');

    this.#sublist = {
      section: this.section,
      defined: this.defined,
      span: this.span,
      btnRemove: this.btnRemove
    }
  }

  get definedFilters() { return this.#sublist; }

  set definedMetrics(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.defined = this.section.querySelector('.defined');
    this.span = this.section.querySelector('span[metric]');
    this.btnRemove = this.section.querySelector('button[data-remove]');

    this.#sublist = {
      section: this.section,
      defined: this.defined,
      span: this.span,
      btnRemove: this.btnRemove
    }
  }

  get definedMetrics() { return this.#sublist; }

  set definedCompositeMetrics(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.defined = this.section.querySelector('.defined');
    this.span = this.section.querySelector('span[metric]');
    this.btnRemove = this.section.querySelector('button[data-remove]');

    this.#sublist = {
      section: this.section,
      defined: this.defined,
      span: this.span,
      btnRemove: this.btnRemove
    }
  }

  get definedCompositeMetrics() { return this.#sublist; }

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

  set allMetrics(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.selectable = this.section.querySelector('.selectable');
    this.span = this.section.querySelector('span[metric]');
    this.table = this.section.querySelector('small[table]');
    this.cube = this.section.querySelector('small[cube]');

    this.#sublist = {
      section: this.section,
      selectable: this.selectable,
      span: this.span,
      table: this.table,
      cube: this.cube
    }
  }

  get allMetrics() { return this.#sublist; }

  set compositeMetrics(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.selectable = this.section.querySelector('.selectable');
    this.span = this.section.querySelector('span[metric]');
    this.smalls = this.section.querySelector('.smalls');
    this.btnInfo = this.section.querySelector('button[data-info]');
    this.btnEdit = this.section.querySelector('button[data-edit]');

    this.#sublist = {
      section: this.section,
      selectable: this.selectable,
      span: this.span,
      smalls: this.smalls,
      btnEdit: this.btnEdit,
      btnInfo: this.btnInfo
    }
  }

  get compositeMetrics() { return this.#sublist; }

  set fields(sublist) {
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

  get fields() { return this.#sublist; }


  set values(sublist) {
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

  get values() { return this.#sublist; }

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

  set filtersDialogMetrics(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.selectable = this.section.querySelector('.selectable');
    this.span = this.section.querySelector('span[filter]');
    this.info = this.section.querySelector('small:last-child');

    this.#sublist = {
      section: this.section,
      selectable: this.selectable,
      span: this.span,
      info: this.info
    }
  }

  get filtersDialogMetrics() { return this.#sublist; }

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

  initCubes() {
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

  initDimensions() {
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
        this.ul.appendChild(this.#sublist.section);
      });
    }
  }

  initHierarchies(ul) {
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

  initTables() {
    // popolamento delle tabelle nella dialogFilter
    this.ul = 'ul-tables';
    for (const [token, value] of StorageDimension.dimensions) {
      // key : nome della dimensione
      // value : tutte le property della dimensione
      for (const [hierToken, hierValue] of Object.entries(value.hierarchies)) {
        for (const [tableId, table] of Object.entries(hierValue.order)) {
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
          this.#sublist.span.innerText = table.table;
          this.#sublist.small.innerText = hierValue.name;
          this.ul.appendChild(this.#sublist.section);
        }
      }
    }
  }

  initFactTables() {
    // popolamento delle tabelle nella dialogFilter
    this.ul = 'ul-tables';
    for (const [token, value] of StorageCube.cubes) {
      this.tables = 'data-sublist-tables';
      this.#sublist.section.dataset.label = value.FACT;
      this.#sublist.section.dataset.cubeToken = token;
      this.#sublist.section.dataset.relatedObject = 'cube';
      this.#sublist.selectable.dataset.label = value.FACT;
      this.#sublist.selectable.dataset.tableName = value.FACT;
      this.#sublist.selectable.dataset.tableAlias = value.alias;
      this.#sublist.selectable.dataset.schema = value.schema;
      this.#sublist.selectable.dataset.cubeToken = token;
      this.#sublist.span.innerText = value.FACT;
      this.#sublist.small.innerText = value.name;
      this.ul.appendChild(this.#sublist.section);
    }
  }

  initColumns() {
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
              this.#sublist.selectable.dataset.token = token;
              this.#sublist.btnAdd.dataset.objectToken = token;
              this.#sublist.btnAdd.dataset.token = token;
              this.#sublist.btnAdd.dataset.label = field.ds.field;
              this.#sublist.btnAdd.dataset.dimensionToken = dimToken;
              this.#sublist.btnAdd.dataset.hierToken = hierToken;
              this.#sublist.btnAdd.dataset.tableName = table.table;
              this.#sublist.btnAdd.dataset.tableAlias = table.alias;
              this.#sublist.btnAdd.dataset.tableId = tableId;
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

  initFactColumns() {
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
          this.#sublist.selectable.dataset.token = token;
          this.#sublist.selectable.dataset.cubeToken = cubeToken;
          this.#sublist.btnAdd.dataset.objectToken = token; // TODO: da valutare se è necessario
          this.#sublist.btnAdd.dataset.token = token;
          this.#sublist.btnAdd.dataset.label = field.ds.field;
          this.#sublist.btnAdd.dataset.tableName = value.FACT;
          this.#sublist.btnAdd.dataset.tableAlias = value.alias;
          this.#sublist.btnAdd.dataset.cubeToken = cubeToken;
          this.#sublist.span.innerText = field.ds.field;
          this.#sublist.table.innerText = value.FACT;
          this.#sublist.info.innerText = value.name;
          this.ul.appendChild(this.#sublist.section);
        }
      }
    }
  }

  // lista metriche esistenti
  initMetrics() {
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
        this.metrics = 'data-sublist-metrics';
        this.#sublist.section.dataset.relatedObject = 'cube';
        this.#sublist.section.dataset.label = metric.name;
        this.#sublist.section.dataset.cubeToken = metric.cube;
        this.#sublist.section.dataset.metricToken = metric.token;
        this.#sublist.selectable.dataset.tableName = value.FACT;
        this.#sublist.selectable.dataset.tableAlias = value.alias;
        // metricha di base composta
        this.#sublist.selectable.dataset.cubeToken = metric.cube;
        this.#sublist.selectable.dataset.metricToken = metric.token;
        this.#sublist.selectable.dataset.metricType = metric.metric_type;
        // div.dataset.label = metric.name;
        (metric.metric_type === 2) ? this.#sublist.btnInfo.dataset.infoObjectToken = metric.token : this.#sublist.btnInfo.hidden = 'true';
        this.#sublist.btnEdit.dataset.objectToken = metric.token;
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
    this.#sublist.section.dataset.cubeToken = StorageMetric.selected.cube;
    this.#sublist.section.toggleAttribute('data-searchable');
    this.#sublist.selectable.dataset.tableName = Query.table;
    this.#sublist.selectable.dataset.tableAlias = Query.tableAlias;
    this.#sublist.selectable.dataset.cubeToken = StorageMetric.selected.cube;
    this.#sublist.selectable.dataset.metricToken = StorageMetric.selected.token;
    this.#sublist.selectable.dataset.metricType = StorageMetric.selected.metric_type;
    this.#sublist.span.innerText = StorageMetric.selected.name;
    (StorageMetric.selected.metric_type === 2) ? this.#sublist.btnInfo.dataset.infoObjectToken = StorageMetric.selected.token : this.#sublist.btnInfo.hidden = 'true';
    this.#sublist.btnEdit.dataset.objectToken = StorageMetric.selected.token;
    if (StorageMetric.selected.metric_type === 0 || StorageMetric.selected.metric_type === 2) this.#sublist.table.innerText = Query.table;
    this.#sublist.cube.innerText = StorageCube.selected.name;
    this.ul.appendChild(this.#sublist.section);
  }

  addCompositeMetric() {
    this.ul = 'ul-composite-metrics';
    this.compositeMetrics = 'data-sublist-composite-metrics';
    this.#sublist.section.dataset.metricToken = StorageMetric.selected.token;
    this.#sublist.section.dataset.label = StorageMetric.selected.name;
    this.#sublist.selectable.dataset.metricToken = StorageMetric.selected.token;
    this.#sublist.selectable.dataset.metricType = StorageMetric.selected.metric_type;
    this.#sublist.span.innerText = StorageMetric.selected.name;
    this.#sublist.btnEdit.dataset.objectToken = StorageMetric.selected.token;
    StorageMetric.selected.cubes.forEach(token => {
      const contentSub = this.tmplSublists.content.cloneNode(true);
      const small = contentSub.querySelector('small');
      small.dataset.cubeToken = token;
      StorageCube.selected = token;
      small.innerText = StorageCube.selected.name;
      small.dataset.attr = token + '----test';
      this.#sublist.smalls.appendChild(small);
    });
    this.ul.appendChild(this.#sublist.section);
  }

  addAllMetric() {
    this.ul = 'ul-all-metrics';
    this.allMetrics = 'data-sublist-all-metrics';
    // TODO: quando passo sopra una metrica da questa lista, per poterla inserire nella formula, potrei visualizzare, in un div, il dettaglio della metrica selezionata, per capire meglio come sto creando la formula
    this.#sublist.section.dataset.label = StorageMetric.selected.name;
    // le metriche composte hanno la prop "cubes" contenente un array di cubi, anzichè "cube"
    if (StorageMetric.selected.metric_type === 4) {
      // TODO: <smalls> per i cubi legati a questa metrica
      this.#sublist.section.dataset.cubeToken = StorageMetric.selected.cubes.join(' ');
      this.#sublist.selectable.dataset.cubeToken = StorageMetric.selected.cubes.join(' ');
    } else {
      this.#sublist.section.dataset.cubeToken = StorageMetric.selected.cube;
      this.#sublist.selectable.dataset.cubeToken = StorageMetric.selected.cube;
      this.#sublist.cube.innerText = StorageCube.selected.name;
    }
    // metriche composte di base e composte non hanno le prop table, tableAlias
    if (StorageMetric.selected.metric_type !== 1 && StorageMetric.selected.metric_type !== 4 && StorageMetric.selected.metric_type !== 3) {
      this.#sublist.selectable.dataset.tableName = StorageMetric.selected.formula.table;
      this.#sublist.selectable.dataset.tableAlias = StorageMetric.selected.formula.tableAlias;
      this.#sublist.table.innerText = StorageMetric.selected.formula.table;
    }
    this.#sublist.selectable.dataset.label = StorageMetric.selected.name;
    this.#sublist.selectable.dataset.metricToken = StorageMetric.selected.token;
    this.#sublist.span.innerText = StorageMetric.selected.name;
    this.ul.appendChild(this.#sublist.section);
  }

  // apertura dialog-composite-metric, popolo elenco di tutte le metriche presenti
  initAllMetrics() {
    // per ogni cubo selezionato ne recupero le metriche ad esso appartenenti
    Query.cubes.forEach(cubeToken => {
      StorageCube.selected = cubeToken;
      // recupero lista aggiornata delle metriche
      StorageMetric.cubeMetrics = cubeToken;
      for (const [token, metric] of Object.entries(StorageMetric.cubeMetrics)) {
        StorageMetric.selected = token;
        this.addAllMetric();
      }
    });
  }

  initCompositeMetrics() {
    // TODO: 2022-05-27 in futuro ci sarà da valutare metriche composte appartenenti a più cubi
    StorageMetric.compositeMetrics.forEach(metric => {
      StorageMetric.selected = metric.token;
      // aggiungo la metrica alla #ul-composite-metrics
      this.addCompositeMetric(); // questa function viene usata anche quando si crea una nuova metrica composta
    });
  }

  // aggiunta colonne della tabella selezionata nella dialog-filter
  addFields(response) {
    this.ul = 'ul-fields';
    for (const [key, value] of Object.entries(response)) {
      // List.addField(value);
      // List.generic.selectable.onclick = app.handlerSelectField;
      this.fields = 'data-sublist-fields';
      this.#sublist.section.dataset.label = value.COLUMN_NAME;
      this.#sublist.selectable.dataset.schema = Query.schema;
      let pos = value.DATA_TYPE.indexOf('('); // datatype
      const type = (pos !== -1) ? value.DATA_TYPE.substring(0, pos) : value.DATA_TYPE;
      this.#sublist.selectable.dataset.type = type;
      this.#sublist.selectable.dataset.label = value.COLUMN_NAME;
      this.#sublist.selectable.dataset.tableName = Query.table;
      this.#sublist.span.innerText = value.COLUMN_NAME;
      this.ul.appendChild(this.#sublist.section);
    }
  }

  // lista delle metriche disponibili nei cubi
  initAvailableMetrics() {
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
        // this.#sublist.selectable.dataset.fn = 'handlerMetricAvailable';
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
    this.#sublist.info.setAttribute('hier', 'true'); // TODO: dataset
  }

  addFilter(hidden) {
    this.ul = 'ul-filters';
    this.filters = 'data-sublist-filters';
    // gli eventi sulla .selectable sono definiti nel template HTML
    this.addFilterProperty(hidden);
    this.#sublist.btnEdit.dataset.objectToken = StorageFilter.selected.token;
    this.ul.appendChild(this.#sublist.section);
  }

  // aggiunta filtri nella dialog metric (metriche avanzate)
  addMetricFilter(hidden) {
    this.ul = 'ul-metric-filters';
    this.filtersDialogMetrics = 'data-sublist-filters-metric';
    // gli eventi sulla .selectable sono definiti nel template HTML
    this.addFilterProperty(hidden);
    // questa sublist non contiene il tasto btnEdit
    this.ul.appendChild(this.#sublist.section);
  }

  // creo la lista degli elementi da processare
  initReports() {
    for (const [token, value] of StorageProcess.processes) {
      // utilizzo addReport() perchè questa funzione viene chiamata anche quando si duplica il report o si crea un nuovo report e viene aggiunto all'elenco
      this.addReport(token, value);
    }
  }

  // caricamento iniziale della ul-filters
  initFilters() {
    for (const [token, filter] of StorageFilter.filters) {
      StorageFilter.selected = token;
      this.addFilter(true);
      // caricamento iniziale della ul-metric-filters
      this.addMetricFilter(true);
    }
  }

  // aggiungo la colonna al report
  addDefinedColumn(object) {
    this.ul = 'ul-defined-columns';
    this.definedColumns = 'data-sublist-columns-defined';
    this.#sublist.section.dataset.label = object.name;
    this.#sublist.section.dataset.tokenColumn = object.token;
    this.#sublist.span.innerText = object.name;
    this.#sublist.btnEdit.dataset.objectToken = object.token;
    this.#sublist.btnRemove.dataset.objectToken = object.token;
    this.ul.appendChild(this.#sublist.section);
  }

  // aggiorno, nella lista delle colonne già aggiunte, la colonna modificata
  editDefinedColumn(object) {
    this.ul = 'ul-defined-columns';
    this.ul.querySelector("section[data-token-column='" + object.token + "']").dataset.label = object.name;
    this.ul.querySelector("section[data-token-column='" + object.token + "'] span[column]").innerText = object.name;
  }

  addDefinedFilter() {
    this.ul = 'ul-defined-filters';
    this.definedFilters = 'data-sublist-filters-defined';
    this.#sublist.section.dataset.label = StorageFilter.selected.name;
    this.#sublist.section.dataset.filterToken = StorageFilter.selected.token;
    if (StorageFilter.selected.hasOwnProperty('dimensions')) {
      this.#sublist.section.dataset.dimensionToken = StorageFilter.selected.dimensions.join(' ');
      // elenco token hier separate da spazi
      this.#sublist.section.dataset.hierToken = Object.keys(StorageFilter.selected.hierarchies).join(' ');
    } else {
      this.#sublist.section.dataset.cubeToken = StorageFilter.selected.cubes;
    }
    this.#sublist.defined.dataset.filterToken = StorageFilter.selected.token;
    this.#sublist.span.innerText = StorageFilter.selected.name;
    this.#sublist.btnRemove.dataset.objectToken = StorageFilter.selected.token;
    this.ul.appendChild(this.#sublist.section);
  }

  // aggiungo la metrica selezionata al report
  addDefinedMetric() {
    // token riguarda una metrica composta, se presente, sto aggiungendo una metrica di base al report perchè
    //.. è presente in una formula della composta
    this.ul = 'ul-defined-metrics';
    this.definedMetrics = 'data-sublist-metrics-defined';
    this.#sublist.section.dataset.label = StorageMetric.selected.name;
    this.#sublist.section.dataset.metricToken = StorageMetric.selected.token;
    this.#sublist.defined.dataset.metricToken = StorageMetric.selected.token;
    this.#sublist.span.innerText = StorageMetric.selected.name;
    this.#sublist.btnRemove.dataset.objectToken = StorageMetric.selected.token;
    this.#sublist.btnRemove.dataset.metricType = StorageMetric.selected.metric_type;
    this.ul.appendChild(this.#sublist.section);
  }

  addDefinedCompositeMetric() {
    this.ul = 'ul-defined-composite-metrics';
    this.definedCompositeMetrics = 'data-sublist-composite-metrics-defined';
    this.#sublist.section.dataset.label = StorageMetric.selected.name;
    this.#sublist.section.dataset.metricToken = StorageMetric.selected.token;
    this.#sublist.defined.dataset.metricToken = StorageMetric.selected.token;
    this.#sublist.span.innerText = StorageMetric.selected.name;
    this.#sublist.btnRemove.dataset.objectToken = StorageMetric.selected.token;
    this.ul.appendChild(this.#sublist.section);
  }

  addDistinctValues(data) {
    this.ul = 'ul-filter-values';
    for (const [key, value] of Object.entries(data)) {
      this.fields = 'data-sublist-values';
      this.#sublist.section.dataset.label = value[Query.field];
      this.#sublist.section.dataset.elementSearch = 'dialog-value-search';
      this.#sublist.section.dataset.searchable = true;
      this.#sublist.selectable.dataset.label = value[Query.field];
      this.#sublist.span.innerText = value[Query.field];
      this.#sublist.span.id = key;
      // this.#sublist.onclick = app.handlerSelectValue;
      this.ul.appendChild(this.#sublist.section);
    }
  }

  addSmallMetric(token) {
    // token: le metrica composta che andrà a popolare lo <small>
    const section = document.querySelector("#ul-defined-metrics section[data-metric-token='" + StorageMetric.selected.token + "']");
    section.querySelector('button[data-remove]').disabled = true;
    const defined = section.querySelector(".defined[data-metric-token='" + StorageMetric.selected.token + "']");
    const contentSub = this.tmplSublists.content.cloneNode(true);
    const small = contentSub.querySelector('small');
    // imposto la metrica composta passata come argomento
    StorageMetric.selected = token;
    // questo dataset mi servirà in fase di rimozione della metrica (rimozione della metrica composta)
    section.dataset[token] = token;
    small.dataset.compositeMetric = StorageMetric.selected.token;
    small.innerText = StorageMetric.selected.name;
    defined.appendChild(small);
  }

  addSmallCompositeMetric(token) {
    // token: le metrica composta che andrà a popolare lo <small>
    const section = document.querySelector("#ul-defined-composite-metrics section[data-metric-token='" + StorageMetric.selected.token + "']");
    section.querySelector('button[data-remove]').disabled = true;
    const defined = section.querySelector(".defined[data-metric-token='" + StorageMetric.selected.token + "']");
    const contentSub = this.tmplSublists.content.cloneNode(true);
    const small = contentSub.querySelector('small');
    // imposto la metrica composta passata come argomento
    StorageMetric.selected = token;
    // questo dataset mi servirà in fase di rimozione della metrica (rimozione della metrica composta)
    section.dataset[token] = token;
    small.dataset.compositeMetric = StorageMetric.selected.token;
    small.innerText = StorageMetric.selected.name;
    defined.appendChild(small);
  }

  selectCompositeMetric(token) {
    this.ul = 'ul-composite-metrics';
    this.ul.querySelector(".selectable[data-metric-token='" + token + "']").dataset.selected = 'true';
    this.ul.querySelector(".selectable[data-metric-token='" + token + "']").dataset.added = 'true';
    // if (this.ul.querySelector(".selectable[data-metric-token='" + token + "']").hasAttribute('nested')) delete this.ul.querySelector(".selectable[data-metric-token='" + token + "']").dataset.nested;
    this.ul.querySelector("button[data-edit][data-object-token='" + token + "']").setAttribute('disabled', 'true');
  }

  // deseleziono la metrica composta specificata dal token
  deselectCompositeMetric(token) {
    this.ul = 'ul-composite-metrics';
    delete this.ul.querySelector(".selectable[data-metric-token='" + token + "']").dataset.selected;
    delete this.ul.querySelector(".selectable[data-metric-token='" + token + "']").dataset.added;
    if (this.ul.querySelector(".selectable[data-metric-token='" + token + "']").hasAttribute('nested')) delete this.ul.querySelector(".selectable[data-metric-token='" + token + "']").dataset.nested;
    this.ul.querySelector("button[data-edit][data-object-token='" + token + "']").removeAttribute('disabled');
  }

  selectMetric(token) {
    this.ul = 'ul-metrics';
    this.ul.querySelector(".selectable[data-metric-token='" + token + "']").dataset.selected = 'true';
    this.ul.querySelector(".selectable[data-metric-token='" + token + "']").dataset.added = 'true';
    // disabilito il tasto edit
    this.ul.querySelector("button[data-edit][data-object-token='" + token + "']").setAttribute('disabled', 'true');
  }

  deselectMetric(token) {
    this.ul = 'ul-metrics';
    delete this.ul.querySelector(".selectable[data-metric-token='" + token + "']").dataset.selected;
    delete this.ul.querySelector(".selectable[data-metric-token='" + token + "']").dataset.added;
    // riabilito il tasto edit per consentire la modifica della metrica
    this.ul.querySelector("button[data-edit][data-object-token='" + token + "']").removeAttribute('disabled');
  }

  deselectFilter(token) {
    this.ul = 'ul-filters';
    delete this.ul.querySelector("section[data-filter-token='" + token + "'] .selectable").dataset.selected;
    delete this.ul.querySelector("section[data-filter-token='" + token + "'] .selectable").dataset.added;
    // riabilito il tasto edit per consentire la modifica del filtro
    this.ul.querySelector("button[data-edit][data-object-token='" + token + "']").removeAttribute('disabled');

  }

  init() {
    this.initCubes();
    this.initDimensions();
    this.initHierarchies('ul-hierarchies');
    this.initHierarchies('ul-hierarchies-struct');
    this.initTables();
    this.initFactTables();
    this.initColumns();
    this.initFactColumns();
    this.initFilters();
    this.initMetrics();
    this.initCompositeMetrics();
    this.initAvailableMetrics();
    this.initReports();
  }

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

  // recupero valori distinti per inserimento nella dialogFilter
  async getDistinctValues() {
    await fetch('fetch_api/schema/' + Query.schema + '/table/' + Query.table + '/field/' + Query.field + '/distinct_values')
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(data => (data) ? this.addDistinctValues(data) : console.warning('Dati non recuperati'))
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }
}
