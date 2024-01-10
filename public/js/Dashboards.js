class Dashboards {
  #dashboards = {};
  constructor() { }

  drawControls(filtersRef) {
    this.controls = [];
    // console.log(this.sheetSpecs);
    if (this.json.filters) {
      this.json.filters.forEach(filter => {
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
            'filterColumnIndex': filter.filterColumnIndex,
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

  // TODO: verificare se viene utilizzata (l'elenco delle dashboard viene recuperato dal Model)
  getDashboards() {
    for (const [token, object] of Object.entries(window.localStorage)) {
      if (JSON.parse(object).type === 'dashboard') {
        this.#dashboards[token] = JSON.parse(object);
      }
    }
    return this.#dashboards;
  }

}

class Resources extends Dashboards {
  #data;
  #resource = new Map();
  #prepareData = { cols: [], rows: [] };
  #specs_columns = {};
  #specs_group = { key: [], columns: [] };
  #json = {
    token: null,
    name: null,
    data: {
      columns: {},
      group: {
        key: [],
        columns: []
      }
    },
    filters: [],
    bind: [],
    wrapper: {
      chartType: null,
      containerId: null,
      options: {
        width: "100%",
        height: "auto",
        page: "enabled",
        frozenColumns: 0,
        pageSize: 15,
        allowHTML: true,
        cssClassNames: {
          headerRow: "g-table-header",
          tableRow: "g-table-row",
          oddTableRow: "",
          selectedTableRow: "",
          hoverTableRow: "",
          headerCell: "g-header-cell",
          tableCell: "g-table-cell",
          rowNumberCell: ""
        }
      }
    }
  }

  constructor(ref) {
    super();
    this.ref = document.getElementById(ref);
  }

  set data(value) {
    this.#data = value;
  }

  get data() { return this.#data; }

  /*
   * Viene creato un Object Map() con il token del report e il suo elemento nel DOM corrispondente
   * */
  set resource(object) {
    // object: contiene ref (il riferimento nel DOM), il datamart_id e lo user_id
    this.#resource.set(this.token, {
      token: this.token,
      ref: this.ref.id,
      datamart_id: object.datamart_id,
      user_id: object.userId
    });
  }

  get resource() {
    return this.#resource;
  }

  set json(value) {
    this.#json = JSON.parse(value);
  }

  get json() { return this.#json; }

  setSpecifications() {
    this.#specs_columns = {};
    this.#specs_group = { key: [], columns: [] };
    this.json.name = Sheet.name;
    for (const [token, field] of Sheet.fields) {
      const workbookField = WorkBook.field.get(token).field;
      Object.keys(WorkBook.field.get(token).field).forEach(key => {
        // console.log(key);
        let field_id_ds = (key === 'id') ? `${field}_${key}` : field;
        if (this.json.data.columns[field_id_ds]) {
          // colonna già presente, la aggiungo a #specs_columns ma non modifico le proprietà type e p
          this.#specs_columns[field_id_ds] = this.json.data.columns[field_id_ds];
        } else {
          // colonna non presente nelle specifiche
          this.#specs_columns[field_id_ds] = {
            id: field_id_ds,
            // label: field_id_ds,
            type: this.getDataType(workbookField[key].datatype),
            p: { data: 'column' }
          };
        }

        // json.data.group.key
        const keyColumn = this.json.data.group.key.find(value => value.id === field_id_ds);
        if (!keyColumn) {
          // colonna non presente in json.data.group.key
          const visible = (key === 'id') ? false : true;
          this.#specs_group.key.push({
            id: field_id_ds, label: field_id_ds, type: this.getDataType(workbookField[key].datatype),
            properties: { grouped: true, visible }
          });
        } else {
          // già presente
          this.#specs_group.key.push(keyColumn);
        }
      });
    }
    // console.log(this.#specs_columns);
    // console.log(this.#specs_group.key);

    for (const [token, metric] of Sheet.metrics) {
      if (this.json.data.columns[metric.alias]) {
        // metrica già presente in json.data.columns
        this.#specs_columns[metric.alias] = this.json.data.columns[metric.alias];
      } else {
        // colonna non presente in json.data.columns
        this.#specs_columns[metric.alias] = {
          id: metric.alias,
          // label: metric.alias,
          type: this.getDataType(metric.datatype),
          p: { data: 'measure' }
        };
      }

      const findMetric = this.json.data.group.columns.find(value => value.alias === metric.alias);
      if (!findMetric) {
        // non presente
        this.#specs_group.columns.push({
          token,
          alias: metric.alias,
          aggregateFn: metric.aggregateFn,
          dependencies: metric.dependencies,
          properties: {
            visible: true,
            formatter: {
              type: 'number', format: 'default', prop: {
                negativeParens: false, fractionDigits: 0, groupingSymbol: '.'
              }
            }
          },
          label: metric.alias,
          type: metric.type,
          datatype: 'number'
        });
      } else {
        // già presente
        this.#specs_group.columns.push(findMetric);
      }
    }
    this.json.data.columns = this.#specs_columns;
    this.json.data.group.key = this.#specs_group.key;
    this.json.data.group.columns = this.#specs_group.columns;
    this.sheetBind();
    debugger;
    window.localStorage.setItem(`specs_${Sheet.sheet.token}`, JSON.stringify(this.json));
  }

  bind() {
    let bind = [];
    // se il filtro impostato è uno solo salvo il bind con un solo elemento nell'array
    if (this.json.filters.length === 1) {
      bind = [0];
    } else {
      const iter = this.json.filters.entries();
      let result = iter.next();
      while (!result.done) {
        let subBind = [];
        // console.log(result.value[0]); // 1 3 5 7 9
        subBind.push(result.value[0]);
        result = iter.next();
        if (!result.done) {
          subBind.push(result.value[0]);
          bind.push(subBind);
        }
      }
    }
    console.info('bind : ', bind);
    debugger;
    this.json.bind = bind;
  }

  specificationsSave() {
    debugger;
    window.localStorage.setItem(`specs_${this.json.token}`, JSON.stringify(this.json));
  }

  prepareData() {
    this.#prepareData = { cols: [], rows: [] };
    // aggiungo le colonne
    for (const key of Object.keys(this.data[0])) {
      // prepareData.cols.push({ id: key, label: key });
      console.log('prepareData : ', key);
      this.#prepareData.cols.push({
        id: key,
        label: key,
        type: this.json.data.columns[key].type,
        p: this.json.data.columns[key].p
      });
      // debugger;
    }

    // aggiungo le righe
    this.data.forEach(row => {
      let v = [];
      for (const [key, value] of Object.entries(row)) {
        switch (this.json.data.columns[key].type) {
          case 'date':
            if (value.length === 8) {
              // console.log('Data di 8 cifre (YYYYMMDD)', value);
              const date = new Date(`${value.substring(0, 4)}-${value.substring(4, 6)}-${value.substring(6, 8)}`);
              // console.log(new Intl.DateTimeFormat("it-IT", dateOptions).format(date));
              v.push({ v: date, f: new Intl.DateTimeFormat("it-IT", dateOptions).format(date), p: { className: 'myClass' } });
            } else {
              v.push({ v: null });
            }
            break;
          case 'number':
            // TODO: valutare se formattare qui i valori (come sopra per le date) oppure con le funzioni Formatter (sotto)
            // di GoogleChart
            (isNaN(parseFloat(value))) ? v.push({ v: null }) : v.push({ v: parseFloat(value) });
            // (isNaN(parseFloat(value))) ? v.push({ v: 0 }) : v.push({ v: parseFloat(value) });
            break;
          default:
            // (!this.json.data.columns[key].p) ? v.push({ v: value }) : v.push({ v: value, p: { className: this.json.data.columns[key].p } });
            v.push({ v: value });
            break;
        }
        // v.push({ v: value });
      }
      this.#prepareData.rows.push({ c: v });
    });
    // console.log(this.#prepareData);
    return this.#prepareData;
  }

  groupFunction() {
    this.groupKey = [], this.groupColumn = [];
    this.json.data.group.key.forEach(column => {
      // if (column.properties.grouped) keyColumns.push(Resource.dataTable.getColumnIndex(column.id));
      // imposto il key con un object anzichè con gli indici, questo perchè voglio impostare la label
      // che viene modificata dall'utente a runtime
      if (column.properties.grouped) {
        this.groupKey.push({
          id: column.id,
          column: this.dataTable.getColumnIndex(column.id),
          label: column.label,
          type: column.type
        });
      }
    });
    this.json.data.group.columns.forEach(metric => {
      // salvo in groupColumnsIndex TUTTE le metriche, deciderò nella DataView
      // quali dovranno essere visibili (quelle con dependencies:false)
      // recupero l'indice della colonna in base al suo nome
      const index = this.dataTable.getColumnIndex(metric.alias);
      // TODO: modificare la prop 'aggregateFn' in 'aggregation' in fase di creazione delle metriche
      const aggregation = (metric.aggregateFn) ? metric.aggregateFn.toLowerCase() : 'sum';
      let object = {
        id: metric.alias,
        column: index,
        aggregation: google.visualization.data[aggregation],
        type: 'number',
        label: metric.label
      };
      this.groupColumn.push(object);
    });
  }

  getDataType(datatype) {
    this.datatype;
    switch (datatype) {
      case 'varchar':
      case 'char':
        this.datatype = 'string';
        break;
      default:
        this.datatype = 'number';
        break;
    }
    return this.datatype;
  }

  createDataView() {
    this.viewColumns = [], this.viewMetrics = [];
    this.json.data.group.key.forEach(column => {
      if (column.properties.visible) {
        this.viewColumns.push(this.dataGroup.getColumnIndex(column.id));
        // imposto la classe per le colonne dimensionali
        this.dataGroup.setColumnProperty(this.dataGroup.getColumnIndex(column.id), 'className', 'dimensional-column');
      }
    });
    // dalla dataGroup, recupero gli indici di colonna delle metriche
    this.json.data.group.columns.forEach(metric => {
      if (!metric.dependencies && metric.properties.visible) {
        const index = this.dataGroup.getColumnIndex(metric.alias);
        // NOTE: si potrebbe utilizzare un nuovo oggetto new Function in questo
        // modo come alternativa a eval() (non l'ho testato)
        // function evil(fn) {
        //   return new Function('return ' + fn)();
        // }
        // console.log(evil('12/5*9+9.4*2')); // => 40.4     const index = Resource.dataGroup.getColumnIndex(metric.alias);

        // Implementazione della func 'calc' per le metriche composite.
        if (metric.type === 'composite') {
          // è una metrica composta, creo la funzione calc, sostituendo i nomi
          // delle metriche contenute nella formula, con gli indici corrispondenti.
          // Es.: margine = ((ricavo - costo) / ricavo) * 100, recuperare gli indici
          // delle colonne ricavo e costo per creare la metrica margine :
          // recupero la formula della metrica composta
          const formula = JSON.parse(localStorage.getItem(metric.token)).formula;
          // Creo una Func "dinamica"
          let calcFunction = function(dt, row) {
            const app = {
              number: function(properties) {
                return new google.visualization.NumberFormat(properties);
              }
            }
            let formulaJoined = [];
            // in formulaJoined ciclo tutti gli elementi della Formula, imposto i
            // valori della DataTable, con getValue(), recuperandoli con getColumnIndex(nome_colonna)
            formula.forEach(formulaEl => {
              if (formulaEl.alias) {
                formulaJoined.push(dt.getValue(row, dt.getColumnIndex(formulaEl.alias)));
              } else {
                formulaJoined.push(formulaEl);
              }
            });
            // La funzione eval() è in grado di eseguire operazioni con valori 'string' es. eval('2 + 2') = 4.
            // Quindi inserisco tutto il contenuto della stringa formulaJoined in eval(), inoltre
            // effettuo un controllo sul risultato in caso fosse NaN
            const result = (isNaN(eval(formulaJoined.join('')))) ? 0 : eval(formulaJoined.join(''));
            let total = (result) ? { v: result } : { v: result, f: '-' };
            // console.log(result);
            // const result = (isNaN(eval(formulaJoined.join('')))) ? null : eval(formulaJoined.join(''));
            // formattazione della cella con formatValue()
            const formatter = app[metric.properties.formatter.type](metric.properties.formatter.prop);
            const resultFormatted = (result) ? formatter.formatValue(result) : '-';
            total = { v: result, f: resultFormatted };
            // resultFormatted = (result) ? result : '-';
            // total = (result) ? { v: result } : { v: result, f: '-' };
            return total;
          }
          this.viewMetrics.push({ id: metric.alias, calc: calcFunction, type: 'number', label: metric.label, properties: { className: 'col-metrics' } });
        } else {
          this.viewMetrics.push(index);
        }
        this.dataGroup.setColumnProperty(index, 'className', 'col-metrics');
        // let formatter = app[metric.properties.formatter.type](metric.properties.formatter.prop);
        // formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(metric.alias));
      }
    });
    // concateno i due array che popoleranno la DataView.setColumns()
    this.viewDefined = this.viewColumns.concat(this.viewMetrics)
    console.log('DataView defined:', this.viewDefined);
    // Resource.dataGroup.setColumnProperty(0, 'className', 'cssc1')
    // console.log(Resource.dataGroup.getColumnProperty(0, 'className'));
    // console.log(Resource.dataGroup.getColumnProperties(0));
    this.dataViewGrouped.setColumns(this.viewDefined);
    console.log('dataViewGrouped : ', this.dataViewGrouped);
  }

  saveSpecifications() {
    const url = (this.jsonExists === true) ? '/fetch_api/json/sheet_specs_update' : '/fetch_api/json/sheet_specs_store';
    const params = JSON.stringify(this.json);
    // debugger;
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    const req = new Request(url, init);
    fetch(req)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((err) => console.error(err));
  }

  /* prepareData() {
    this.#prepareData = { cols: [], rows: [] };
    // aggiungo le colonne
    for (const key of Object.keys(this.data[0])) {
      // prepareData.cols.push({ id: key, label: key });
      // console.log(key);
      this.#prepareData.cols.push({
        id: key,
        label: this.json.data.columns[key].label,
        type: this.json.data.columns[key].type
      });
    }

    let dateOptions = {
      // weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    // aggiungo le righe
    this.data.forEach(row => {
      let v = [];
      for (const [key, value] of Object.entries(row)) {
        // if (key === 'DtArrivo_ds') console.log(new Date(value));
        // console.log(value);
        switch (this.json.data.columns[key].type) {
          case 'date':
            if (value.length === 8) {
              // console.log('Data di 8 cifre (YYYYMMDD)', value);
              const date = new Date(`${value.substring(0, 4)}-${value.substring(4, 6)}-${value.substring(6, 8)}`);
              // console.log(new Intl.DateTimeFormat("it-IT", dateOptions).format(date));
              v.push({ v: date, f: new Intl.DateTimeFormat("it-IT", dateOptions).format(date), p: { className: 'myClass' } });
            } else {
              v.push({ v: null });
            }
            break;
          case 'number':
            // TODO: valutare se formattare qui i valori (come sopra per le date) oppure con le funzioni Formatter (sotto)
            // di GoogleChart
            (isNaN(parseFloat(value))) ? v.push({ v: null }) : v.push({ v: parseFloat(value) });
            // (isNaN(parseFloat(value))) ? v.push({ v: 0 }) : v.push({ v: parseFloat(value) });
            break;
          default:
            (!this.json.data.columns[key].p) ? v.push({ v: value }) : v.push({ v: value, p: { className: this.json.data.columns[key].p } });
            // v.push({ v: value });
            break;
        }
      }
      this.#prepareData.rows.push({ c: v });
    });
    // debugger;
    // console.log(this.#prepareData);
    return this.#prepareData;
  } */

}
