class Queries {
  #reportProcess = {};
  #SQLProcess = {};
  #cubes = new Set();
  #dimensions = new Set();
  #FROM = new Map();
  #WHERE = new Map();
  constructor() {
    this.OB = {
      COLUMNS: new Map(),
      FILTER: new Map(),
      METRIC: new Map(),
      ADV_METRIC: new Map(),
      COMP_METRIC: new Map()
    };
  }

  add(object) {
    this.OB[object.type].set(object.token, object);
    console.log(this.OB);
    this.includeElements();
  }

  remove(object) {
    this.OB[object.type].delete(object.token);
    console.log(this.OB);
    this.includeElements();
  }

  /*
  * Imposto gli elementi del report.
  * Imposto quali cubi, FROM e JOIN che devono essere incluse nel report
  */
  includeElements() {
    // console.clear();
    document.querySelectorAll("*[data-include-query]").forEach(tableRef => delete tableRef.dataset.includeQuery);
    // debugger;
    for (const [key, value] of Object.entries(this.OB)) {
      console.log(key, value);
      for (const [token, element] of value) {
        // debugger;
        if (element.hasOwnProperty('dimensions')) {
          // ha la prop hierarchies : {hierToken: tableId}
          // per ogni dimensione presente nell'oggetto (es.: filtri multipli)
          element.dimensions.forEach(tkDim => {
            document.querySelector("#ul-dimensions .selectable[data-dimension-token='" + tkDim + "']").dataset.includeQuery = 'true';
          });
          // gerarchie
          for (const [tkHier, tableId] of Object.entries(element.hierarchies)) {
            // debugger;
            const hier = document.querySelector("#ul-hierarchies .unselectable[data-hier-token='" + tkHier + "']");
            // converto il nodeList in un array e, con filter(), recupero le tabelle con un id superiore a quello in ciclo
            [...hier.querySelectorAll("small")].filter((table, index) => index >= +tableId).forEach(tableRef => {
              tableRef.dataset.includeQuery = 'true';
            });
          }
        }
        // cubi
        if (element.hasOwnProperty('cubes')) {
          element.cubes.forEach(tkCube => {
            document.querySelector("#ul-cubes .selectable[data-cube-token='" + tkCube + "']").dataset.includeQuery = 'true';
          });
        }
      }
    }
  }

  editObjects() {
    this.object = {};
    this.object.cubes = [...this.cubes];
    this.object.dimensions = [...this.dimensions];
    this.object.columns = Object.fromEntries(this.OB['COLUMNS']);
    this.object.filters = [...this.OB['FILTER'].keys()];
    // this.object.metrics = [...this.OB['METRIC'].keys()].concat([...this.advancedMetrics.keys()]);
    this.object.metrics = [...this.OB['METRIC'].keys()].concat([...this.OB['ADV_METRIC'].keys()]);
    // console.log([...this.OB['METRIC'].keys()].concat([...this.advancedMetrics.keys()]));
    console.log([...this.OB['METRIC'].keys()].concat([...this.OB['ADV_METRIC'].keys()]));
    this.object.compositeMetrics = [...this.OB['COMP_METRIC'].keys()];
    // console.log([...this.compositeMetrics.keys()]);
    console.log([...this.OB['COMP_METRIC'].keys()]);
    debugger;
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

  checkColumnName(token, name) {
    // in fase di edit di una colonna, tramite l'argomento token, non devo controllare se il nome già esiste di una colonna che sto modificando
    let result = false;
    for (const values of this.OB['COLUMNS'].values()) {
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

  setAdvancedMetrics() {
    for (const [token, metric] of (this.OB['ADV_METRIC'])) {
      StorageMetric.selected = token;
      console.log(StorageMetric.selected);
      let FROM = new Map(), WHERE = new Map(), filters = new Map();
      // associo la FROM e WHERE in base ai filtri contenuti nella metrica
      StorageMetric.selected.formula.filters.forEach(filterToken => {
        StorageFilter.selected = filterToken;
        filters.set(filterToken, { SQL: StorageFilter.selected.formula });
        // se su quseto filtro sono presenti gerarchie...
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
        // debugger;
        this.OB['ADV_METRIC'].get(token).FROM = Object.fromEntries(FROM);
        if (WHERE.size !== 0) this.OB['ADV_METRIC'].get(token).WHERE = Object.fromEntries(WHERE);
        this.OB['ADV_METRIC'].get(token).filters = Object.fromEntries(filters);
      });
      // this.filteredMetrics = object;
    }
  }

  SQLProcess(name) {
    this.reportElements = {};
    this.#SQLProcess.type = 'PROCESS';
    this.#SQLProcess.token = this.token;
    this.reportElements.processId = this.processId; // questo creerà il datamart FX[processId]
    this.#SQLProcess.name = name;
    this.reportElements.select = Object.fromEntries(this.OB['COLUMNS']);
    this.reportElements.from = this.FROM;
    this.reportElements.where = this.WHERE;
    this.reportElements.filters = Object.fromEntries(this.OB['FILTER']);
    if (this.OB['METRIC'].size !== 0) this.reportElements.metrics = Object.fromEntries(this.OB['METRIC']);
    if (this.OB['ADV_METRIC'].size !== 0) {
      this.setAdvancedMetrics();
      this.reportElements.advancedMetrics = Object.fromEntries(this.OB['ADV_METRIC']);
    }
    if (this.OB['COMP_METRIC'].size > 0) this.reportElements.compositeMetrics = Object.fromEntries(this.OB['COMP_METRIC']);
    debugger;
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

    this.reportElements.select = Object.fromEntries(this.OB['COLUMNS']);
    this.reportElements.from = this.FROM;
    this.reportElements.where = this.WHERE;

    this.reportElements.filters = Object.fromEntries(this.OB['FILTER']);
    // this.reportElements.metrics = Object.fromEntries(this.OB['METRIC']);
    if (this.OB['METRIC'].size !== 0) this.reportElements.metrics = Object.fromEntries(this.OB['METRIC']);
    if (this.OB['ADV_METRIC'].size !== 0) {
      this.setAdvancedMetrics();
      this.reportElements.advancedMetrics = Object.fromEntries(this.OB['ADV_METRIC']);
    }
    if (this.OB['COMP_METRIC'].size > 0) this.reportElements.compositeMetrics = Object.fromEntries(this.OB['COMP_METRIC']);

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
