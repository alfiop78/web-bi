class Queries {
  #compositeMetrics = new Map();
  #filters = new Map();
  #metrics = new Map();
  #filteredMetrics = new Map();
  #columns = new Map();
  #reportProcess = {};
  #SQLProcess = {};
  #objects = new Map();
  #cubes = new Set();
  #dimensions = new Set();
  #FROM = new Map();
  #WHERE = new Map();
  constructor() { }

  set objects(object) {
    (!this.#objects.has(object.token)) ? this.#objects.set(object.token, object) : this.#objects.delete(object.token);
    console.log('#objects : ', this.#objects);

    this.setReportProperties();
  }

  get objects() { return this.#objects; }

  /*
  * Imposto gli elementi del report.
  * Imposto quali cubi, FROM e JOIN che devono essere incluse nel report
  */
  setReportProperties() {
    document.querySelectorAll("*[data-include-query]").forEach(tableRef => delete tableRef.dataset.includeQuery);
    //debugger;
    for (const [key, value] of Query.objects) {
      // console.log(value);
      // debugger;
      if (value.hasOwnProperty('dimensions')) {
        // ha la prop hierarchies : {hierToken: tableId}
        // per ogni dimensione presente nell'oggetto (es.: filtri multipli)
        value.dimensions.forEach(token => {
          document.querySelector("#ul-dimensions .selectable[data-dimension-token='" + token + "']").dataset.includeQuery = 'true';
        });
        // gerarchie
        for (const [token, tableId] of Object.entries(value.hierarchies)) {
          // debugger;
          const hier = document.querySelector("#ul-hierarchies .unselectable[data-hier-token='" + token + "']");
          // converto il nodeList in un array e, con filter(), recupero le tabelle con un id superiore a quello in ciclo
          [...hier.querySelectorAll("small")].filter((table, index) => index >= +tableId).forEach(tableRef => {
            tableRef.dataset.includeQuery = 'true';
          });
        }
      }
      // cubi
      if (value.hasOwnProperty('cubes')) {
        value.cubes.forEach(token => {
          document.querySelector("#ul-cubes .selectable[data-cube-token='" + token + "']").dataset.includeQuery = 'true';
        });
      }
    }
  }

  editObjects() {
    this.object = {};
    this.object.cubes = [...this.cubes];
    this.object.dimensions = [...this.dimensions];
    this.object.columns = Object.fromEntries(this.select);
    this.object.filters = [...this.filters.keys()];
    this.object.metrics = [...this.metrics.keys()].concat([...this.filteredMetrics.keys()]);
    debugger;
    this.object.compositeMetrics = [...this.compositeMetrics.keys()];
    return this.object;
  }

  set FROM(object) {
    this.#FROM.set(object.tableAlias, object.SQL);
    console.log('#FROM : ', this.#FROM);
  }

  get FROM() { return Object.fromEntries(this.#FROM); }

  set WHERE(object) {
    this.#WHERE.set(object.token, object.join);
    console.log('#WHERE : ', this.#WHERE);
  }

  get WHERE() { return Object.fromEntries(this.#WHERE); }

  set cubes(token) {
    (!this.#cubes.has(token)) ? this.#cubes.add(token) : this.#cubes.delete(token);
    // console.log('#cubes : ', this.#cubes);
  }

  get cubes() { return this.#cubes; }

  set dimensions(token) {
    (!this.#dimensions.has(token)) ? this.#dimensions.add(token) : this.#dimensions.delete(token);
    // console.log('#dimensions : ', this.#dimensions);
  }

  get dimensions() { return this.#dimensions; }

  // set fieldType(value) {this._fieldType = value;}

  // get fieldType() {return this._fieldType;}

  set select(value) {
    (this.#columns.has(value.token)) ? this.#columns.delete(value.token) : this.#columns.set(value.token, value);
    console.log('select : ', this.#columns);
  }

  get select() { return this.#columns; }

  set filters(value) {
    (!this.#filters.has(value.token)) ? this.#filters.set(value.token, { SQL: value.formula }) : this.#filters.delete(value.token);
    // console.log('this.#filters : ', this.#filters);
  }

  get filters() { return this.#filters };

  set metrics(value) {
    // value = {sqlFunction: "SUM", field: "NettoRiga", metricName: "netto riga", distinct: false, alias: "Venduto"}
    (!this.#metrics.has(value.token)) ? this.#metrics.set(value.token, value) : this.#metrics.delete(value.token);
    // console.log('metrics : ', this.#metrics);
  }

  get metrics() { return this.#metrics; }

  set filteredMetrics(value) {
    (!this.#filteredMetrics.has(value.token)) ? this.#filteredMetrics.set(value.token, value) : this.#filteredMetrics.delete(value.token);
    console.log('this.#filteredMetrics : ', this.#filteredMetrics);
  }

  get filteredMetrics() { return this.#filteredMetrics; }

  set compositeMetrics(value) {
    (!this.#compositeMetrics.has(value.token)) ? this.#compositeMetrics.set(value.token, value) : this.#compositeMetrics.delete(value.token);
    // console.log('this.#compositeMetrics : ', this.#compositeMetrics);
  }
  get compositeMetrics() { return this.#compositeMetrics; }

  checkColumnName(token, name) {
    // in fase di edit di una colonna, tramite l'argomento token, non devo controllare se il nome già esiste di una colonna che sto modificando
    let result = false;
    for (const values of this.select.values()) {
      if (values.token !== token) {
        if (values.name.toLowerCase() === name.toLowerCase()) result = true;
      }
    }
    return result;
  }

  checkMetricAlias(alias) {
    for (const values of this.metrics.values()) {
      debugger;
      return (values.alias.toLowerCase() === alias.toLowerCase()) ? true : false;
    }
  }

  setMetricReport(metric) {
    /* La metrica potrebbe già essere stata inclusa in Query.metrics se, ad esempio si è attivato SQLinfo più volte (il Metodo Query.metrics è un Map che aggiunge/elimina)
    * oppure si clicca prima SQLInfo e poi Salva report.
    * Per questo motivo faccio qui il controllo se la metrica già esiste nella classe Query non la aggiungo
    */
    if (!this.metrics.has(metric.dataset.metricToken)) {
      let obj = {
        token: metric.dataset.metricToken,
        name: StorageMetric.selected.name,
        metric_type: StorageMetric.selected.metric_type,
        aggregateFn: StorageMetric.selected.formula.aggregateFn,
        field: StorageMetric.selected.formula.field,
        distinct: StorageMetric.selected.formula.distinct,
        alias: StorageMetric.selected.formula.alias,
        // show_datamart: metricRef.dataset.showDatamart
      };
      // per le metric_type = 0 deve esserci anche table e tableAlias
      if (StorageMetric.selected.metric_type === 0) {
        obj.table = StorageMetric.selected.formula.table;
        obj.tableAlias = StorageMetric.selected.formula.tableAlias;
      }
      this.metrics = obj;
    }
  }

  setFilteredMetricReport(metric) {
    if (!this.filteredMetrics.has(metric.dataset.metricToken)) {
      let object = {
        token: metric.dataset.metricToken,
        name: StorageMetric.selected.name,
        metric_type: StorageMetric.selected.metric_type,
        aggregateFn: StorageMetric.selected.formula.aggregateFn,
        alias: StorageMetric.selected.formula.alias,
        distinct: StorageMetric.selected.formula.distinct,
        field: StorageMetric.selected.formula.field,
      };
      if (StorageMetric.selected.metric_type === 2) {
        object.table = StorageMetric.selected.formula.table;
        object.tableAlias = StorageMetric.selected.formula.tableAlias;
      }

      let FROM = new Map(), WHERE = new Map(), filters = new Map();
      // associo la FROM e WHERE in base ai filtri contenuti nella metrica
      StorageMetric.selected.formula.filters.forEach(filterToken => {
        StorageFilter.selected = filterToken;
        filters.set(filterToken, { SQL: StorageFilter.selected.formula });
        // se su quseto filtro sono presneti gerarchie...
        if (StorageFilter.selected.hasOwnProperty('hierarchies')) {
          for (const [token, tableId] of Object.entries(StorageFilter.selected.hierarchies)) {
            const hier = document.querySelector("#ul-hierarchies .unselectable[data-hier-token='" + token + "']");
            hier.querySelectorAll("small").forEach(tableRef => {
              FROM.set(tableRef.dataset.tableAlias, `${tableRef.dataset.schema}.${tableRef.dataset.label} AS ${tableRef.dataset.tableAlias}`);
              StorageDimension.selected = tableRef.dataset.dimensionToken;
              // per ogni dimensione contenuta all'interno del filtro recupero le join con il cubo
              // debugger;
              for (const [cubeToken, joins] of Object.entries(StorageDimension.selected.cubes)) {
                if (StorageFilter.selected.cubes) {
                  if (StorageFilter.selected.cubes.includes(cubeToken)) {
                    for (const [token, join] of Object.entries(joins)) {
                      WHERE.set(token, join);
                    }
                  }
                }
              }
              // per l'ultima tabella della gerarchia non esiste la join perchè è quella che si lega al cubo e il legame è fatto nella proprietà 'cubes' della dimensione
              if (StorageDimension.selected.hierarchies[tableRef.dataset.hierToken].joins[tableRef.dataset.tableAlias]) {
                for (const [token, join] of Object.entries(StorageDimension.selected.hierarchies[tableRef.dataset.hierToken].joins[tableRef.dataset.tableAlias])) {
                  WHERE.set(token, join);
                }
              }
            });
          }
        }
        /*
        * un filtro può contenere anche una tabella di un livello dimensionale e una FACT. Es.: Azienda.id =43 AND tiporiga = 'M'
        * in questo caso, dopo aver verificato le prop hierarchies e dimensions del filtro vado a verificare anche se è presente il cubeToken
        */
        if (StorageFilter.selected.hasOwnProperty('cubes')) {
          StorageFilter.selected.cubes.forEach(cubeToken => {
            StorageCube.selected = cubeToken;
            FROM.set(StorageCube.selected.alias, `${StorageCube.selected.schema}.${StorageCube.selected.FACT} AS ${StorageCube.selected.alias}`);
          });
        }
        object.FROM = Object.fromEntries(FROM);
        if (WHERE.size !== 0) object.WHERE = Object.fromEntries(WHERE);
        object.filters = Object.fromEntries(filters);
      });
      this.filteredMetrics = object;
    }
  }

  SQLProcess(name) {
    this.reportElements = {};
    this.#SQLProcess.type = 'PROCESS';
    this.#SQLProcess.token = this.token;
    this.reportElements.processId = this.processId; // questo creerà il datamart FX[processId]
    this.#SQLProcess.name = name;
    this.reportElements.select = Object.fromEntries(this.select);
    this.reportElements.from = this.FROM;
    this.reportElements.where = this.WHERE;
    if (this.filters.size > 0) this.reportElements.filters = Object.fromEntries(this.filters);
    if (this.metrics.size > 0) this.reportElements.metrics = Object.fromEntries(this.metrics);
    if (this.compositeMetrics.size > 0) this.reportElements.compositeMetrics = Object.fromEntries(this.compositeMetrics);
    if (this.filteredMetrics.size > 0) this.reportElements.filteredMetrics = Object.fromEntries(this.filteredMetrics);
    this.#SQLProcess.report = this.reportElements;
    console.info(this.#SQLProcess);
  }

  getSQLProcess() { return this.#SQLProcess; }

  save(name) {
    this.reportElements = {};
    this.#reportProcess.type = 'PROCESS';
    this.#reportProcess.token = this.token;
    this.reportElements.processId = this.processId; // questo creerà il datamart FX[processId]
    this.#reportProcess.name = name;
    const date = new Date();
    // const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
    // TODO: l'update del report non deve aggiornare updated_at
    this.#reportProcess.created_at = date.toLocaleDateString('it-IT', options);
    this.#reportProcess.updated_at = date.toLocaleDateString('it-IT', options);

    this.reportElements.select = Object.fromEntries(this.select);
    //this.#elementReport.set('columns', Object.fromEntries(this.select));
    this.reportElements.from = this.FROM;
    this.reportElements.where = this.WHERE;

    if (this.filters.size > 0) this.reportElements.filters = Object.fromEntries(this.filters);
    if (this.metrics.size > 0) this.reportElements.metrics = Object.fromEntries(this.metrics);
    if (this.compositeMetrics.size > 0) this.reportElements.compositeMetrics = Object.fromEntries(this.compositeMetrics);
    if (this.filteredMetrics.size > 0) this.reportElements.filteredMetrics = Object.fromEntries(this.filteredMetrics);

    // this.editElements = Object.fromEntries(this.elementReport);
    this.#reportProcess.report = this.reportElements;
    this.#reportProcess.edit = this.editObjects();
    console.info(this.#reportProcess);
    debugger;
    window.localStorage.setItem(this.token, JSON.stringify(this.#reportProcess));
    console.info(`${name} salvato nello storage con token : ${this.token}`);
  }

  get process() { return this.#reportProcess; }

  get reportProcessStringify() { return this.#reportProcess; }

  getJSONProcess(value) {
    return JSON.parse(window.localStorage.getItem(value));
  }
}
