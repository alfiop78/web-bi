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
    // memorizzo qui gli oggetti che sono stati rimossi/aggiunti in fase di edit
    this.ObjectRemoved = {
      COLUMNS: new Map(),
      FILTER: new Map(),
      METRIC: new Map(),
      ADV_METRIC: new Map(),
      COMP_METRIC: new Map()
    }
  }

  add(object) {
    this.OB[object.type].set(object.token, object);
    console.log(this.OB);
    this.includeElements();
  }

  remove(object) {
    this.ObjectRemoved[object.type].set(object.token, this.OB[object.type].get(object.token));
    // prima di eliminare l'object da this.OB, lo aggiungo all'object degli elementi rimossi, questo servirà per il ripristino in fase di edit di un report
    this.OB[object.type].delete(object.token);
    // console.log(this.OB);
    // console.log('ObjectRemoved : ', this.ObjectRemoved);
    this.includeElements();
  }

  setDataInclude(element) {
    if (element.include.hasOwnProperty('dimensions')) {
      element.include.dimensions.forEach(tkDim => {
        document.querySelector("#ul-dimensions .selectable[data-dimension-token='" + tkDim + "']").dataset.includeQuery = 'true';
      });
      // se la prop 'include' contiene 'dimensions' contiene sicuramente anche 'hierarchies'
      for (const [tkHier, tableId] of Object.entries(element.include.hierarchies)) {
        const hier = document.querySelector("#ul-hierarchies .unselectable[data-hier-token='" + tkHier + "']");
        // converto il nodeList in un array e, con filter(), recupero le tabelle con un id superiore a quello in ciclo
        [...hier.querySelectorAll("small")].filter((table, index) => index >= +tableId).forEach(tableRef => {
          tableRef.dataset.includeQuery = 'true';
        });
      }
    }
    // cubi
    if (element.include.hasOwnProperty('cubes')) {
      element.include.cubes.forEach(tkCube => {
        document.querySelector("#ul-cubes .selectable[data-cube-token='" + tkCube + "']").dataset.includeQuery = 'true';
      });
    }
  }

  /*
  * Imposto gli elementi del report.
  * Imposto quali cubi, FROM e JOIN che devono essere incluse nel report
  */
  includeElements() {
    console.clear();
    document.querySelectorAll("*[data-include-query]").forEach(tableRef => delete tableRef.dataset.includeQuery);
    for (const [key, objectProperties] of Object.entries(this.OB)) {
      objectProperties.forEach(element => {
        switch (key) {
          case 'ADV_METRIC':
            // filtri all'interno della metrica, prop 'include' all'interno del filtro in StorageFilter
            // ciclo l'array 'filters' all'interno della ADV_METRIC
            element.formula.filters.forEach(token => {
              // se il token è una delle timing-functions salto il ciclo
              if (['last-year'].includes(token)) return;
              // dallo StorageFilter ottengo la prop 'include'
              StorageFilter.selected = token;
              this.setDataInclude(StorageFilter.selected);
            });
            break;
          default:
            if (element.hasOwnProperty('include')) this.setDataInclude(element);
            break;
        }
      });
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
      if (values.token !== token && values.hasOwnProperty('name')) {
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
      // console.log(StorageMetric.selected);
      let FROM = new Map(), WHERE = new Map(), filters = new Map();
      // associo la FROM e WHERE in base ai filtri contenuti nella metrica
      StorageMetric.selected.formula.filters.forEach(filterToken => {
        // verifico qui se il filtro incluso nella metrica è una timing-functions
        if (['last-year', 'altre-fn-temporali'].includes(filterToken)) {
          // è un filtro temporale
          // recupero le gerarchie (data-include-query) appartenenti alla TIME
          // prima tabella della gerarchia hier-time inclusa nel report (data-include-query)
          // TODO: rinominare il token per la dimensione TIME in "hier-time" in fase di creazione della dimensione TIME
          const hierTime = document.querySelector("#ul-hierarchies .unselectable[data-hier-token='ebvwvjz']");
          hierTime.querySelectorAll("small").forEach(tableRef => {
            FROM.set(tableRef.dataset.tableAlias, `${tableRef.dataset.schema}.${tableRef.dataset.label} AS ${tableRef.dataset.tableAlias}`);
            // funzione temporale last-year
            // TODO: per impostare il TO_CHAR andrà verificato in fase di creazione del cubo, se "DataDocumento" è INTEGER, andrà convertito (in base al DB) in formato DATE
            let join = [`${tableRef.dataset.tableAlias}.trans_ly`, `TO_CHAR(${StorageMetric.selected.formula.tableAlias}.${StorageMetric.selected.formula.DateTimeField})::DATE`];
            filters.set(filterToken, { join });
            // da utilizzare nel caso in cui bisogna prendere timing function "last..." nel json
            // filters.set(filterToken, { table: tableRef.dataset.tableAlias, field: 'last', func: 'year', fn: filterToken });
          });
        } else {
          StorageFilter.selected = filterToken;
          filters.set(filterToken, { SQL: StorageFilter.selected.formula });
          // se su quseto filtro sono presenti gerarchie...
          if (StorageFilter.selected.include.hasOwnProperty('hierarchies')) {
            // TODO: tableId non è utilizzato
            for (const [token, tableId] of Object.entries(StorageFilter.selected.include.hierarchies)) {
              const hier = document.querySelector("#ul-hierarchies .unselectable[data-hier-token='" + token + "']");
              hier.querySelectorAll("small").forEach(tableRef => {
                FROM.set(tableRef.dataset.tableAlias, `${tableRef.dataset.schema}.${tableRef.dataset.label} AS ${tableRef.dataset.tableAlias}`);
                StorageDimension.selected = tableRef.dataset.dimensionToken;
                // per ogni dimensione contenuta all'interno del filtro recupero le join con il cubo
                // debugger;
                for (const [cubeToken, joins] of Object.entries(StorageDimension.selected.cubes)) {
                  if (StorageFilter.selected.include.cubes) {
                    if (StorageFilter.selected.include.cubes.includes(cubeToken)) {
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
          if (StorageFilter.selected.include.hasOwnProperty('cubes')) {
            StorageFilter.selected.include.cubes.forEach(cubeToken => {
              StorageCube.selected = cubeToken;
              FROM.set(StorageCube.selected.alias, `${StorageCube.selected.schema}.${StorageCube.selected.FACT} AS ${StorageCube.selected.alias}`);
            });
          }
        }
      });
      this.OB['ADV_METRIC'].get(token).FROM = Object.fromEntries(FROM);
      if (WHERE.size !== 0) this.OB['ADV_METRIC'].get(token).WHERE = Object.fromEntries(WHERE);
      this.OB['ADV_METRIC'].get(token).filters = Object.fromEntries(filters);
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
    this.#SQLProcess.report = this.reportElements;
    console.info(this.#SQLProcess);
    debugger;
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
