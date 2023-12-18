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
  #specs_view = [];
  #specs_formatter = {}
  #json = {
    token: null,
    name: null,
    data: {
      columns: {},
      group: {
        key: [],
        columns: []
      },
      view: []
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
  set resource(value) {
    // value: il token del report che è stato aggiunto, in this.ref (nel DOM)
    this.#resource.set(value, { ref: this.ref.id });
    // this.#resource.set(value, { ref: this.ref.id, template: `template-${value}` });
  }

  get resource() {
    return this.#resource;
  }

  set json(value) {
    this.#json = JSON.parse(value);
  }

  get json() { return this.#json; }

  specifications_update() {
    debugger;
    this.json.name = Sheet.name;
    for (const [token, field] of Sheet.fields) {
      const workbookField = WorkBook.field.get(token).field;
      Object.keys(WorkBook.field.get(token).field).forEach(key => {
        // console.log(key);
        let field_id_ds = (key === 'id') ? `${field}_${key}` : field;
        if (this.json.data.columns[field_id_ds]) {
          this.#specs_columns[field_id_ds] = {
            id: field_id_ds,
            label: this.json.data.columns[field_id_ds].label,
            type: this.json.data.columns[field_id_ds].type
          };
        } else {
          this.#specs_columns[field_id_ds] = {
            id: field_id_ds, label: field_id_ds, type: this.getDataType(workbookField[key].datatype)
          };
        }
        // json.data.group.key
        const keyColumn = this.json.data.group.key.find(value => value.id === field_id_ds);
        if (!keyColumn) {
          // non presente
          this.#specs_group.key.push({
            id: field_id_ds, label: field_id_ds, type: this.getDataType(workbookField[key].datatype),
            properties: { grouped: true }
          });
        } else {
          // già presente
          this.#specs_group.key.push({
            id: field_id_ds, label: keyColumn.label, type: keyColumn.type,
            properties: { grouped: keyColumn.properties.grouped }
          });
        }
        // json.data.view
        const viewColumn = this.json.data.view.find(value => value.id === field_id_ds);
        if (!viewColumn) {
          // la colnna _id la nascondo dalla DataView
          const visible = (key === 'id') ? false : true;
          this.#specs_view.push({ id: field_id_ds, properties: { visible } });
        } else {
          this.#specs_view.push({ id: field_id_ds, properties: { visible: viewColumn.properties.visible } });

        }
      });
    }
    console.log(this.#specs_columns);
    console.log(this.#specs_view);
    console.log(this.#specs_group.key);
    debugger;
    for (const [token, metric] of Sheet.metrics) {
      if (this.json.data.columns[metric.alias]) {
        // metrica già presente
        this.#specs_columns[metric.alias] = {
          id: metric.alias,
          label: this.json.data.columns[metric.alias].label,
          type: this.json.data.columns[metric.alias].type
        };
      } else {
        this.#specs_columns[metric.alias] = {
          id: metric.alias, label: metric.alias, type: this.getDataType(metric.datatype)
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
          properties: { visible: true },
          label: metric.alias,
          type: metric.type,
          datatype: 'number'
        });
      } else {
        // già presente
        this.#specs_group.columns.push(findMetric);
      }

      // in fase di creazione di json.data.group.columns (metriche) imposto anche
      // una formattazione, di base, perchè siccomme il json.data.formatter è un {} ma
      // quando viene salvato su DB viene convertito in [] (forse perchè è vuoto) allora lo
      // imposto con i valori delle metriche, in modo da creare un {}
      /* if (!this.json.data.formatter[metric.alias]) {
        // formattazione per questa metrica non presente
        // groupSymbol dovrebbe essere default il punto (.) perchè il googleChart load è impostato
        // language 'it'
        this.json.data.formatter[metric.alias] = {
          type: 'number', format: null, prop: {
            negativeParens: false, fractionDigits: 0, groupingSymbol: '.'
          }
        };
      } */
    }
    this.json.data.columns = this.#specs_columns;
    this.json.data.group.key = this.#specs_group.key;
    this.json.data.group.columns = this.#specs_group.columns;
    this.json.data.view = this.#specs_view;
    debugger;
    window.localStorage.setItem(`specs_${Sheet.sheet.token}`, JSON.stringify(this.json));

  }

  specifications_create() {
    console.log(Sheet);
    this.json.token = Sheet.sheet.token;
    this.json.name = Sheet.name;
    this.json.wrapper.chartType = 'Table';
    this.specs_columns = {};
    for (const [token, field] of Sheet.fields) {
      const workbookField = WorkBook.field.get(token).field;
      Object.keys(WorkBook.field.get(token).field).forEach(key => {
        console.log(key);
        let field_id_ds = (key === 'id') ? `${field}_${key}` : field;
        this.#specs_columns[field_id_ds] = {
          id: field_id_ds, label: field_id_ds, type: this.getDataType(workbookField[key].datatype)
        };
        // json.data.group.key
        this.#specs_group.key.push({
          id: field_id_ds, label: field_id_ds, type: this.getDataType(workbookField[key].datatype),
          properties: { grouped: true }
        });
        // json.data.view
        const visible = (key === 'id') ? false : true;
        this.#specs_view.push({ id: field_id_ds, properties: { visible } });
      });
      console.log(this.#specs_columns);
      console.log(this.#specs_group);
      console.log(this.#specs_view);
    }
    for (const [token, metric] of Sheet.metrics) {
      this.#specs_columns[metric.alias] = {
        id: metric.alias, label: metric.alias, type: 'number'
      };
      this.#specs_group.columns.push({
        token,
        alias: metric.alias,
        aggregateFn: metric.aggregateFn,
        dependencies: metric.dependencies,
        properties: { visible: true },
        label: metric.alias,
        type: metric.type,
        datatype: 'number'
      });
      // in fase di creazione di json.data.group.columns (metriche) imposto anche
      // una formattazione, di base, perchè siccomme il json.data.formatter è un {} ma
      // quando viene salvato su DB viene convertito in [] (forse perchè è vuoto) allora lo
      // imposto con i valori delle metriche, in modo da creare un {}
      /* if (!this.json.data.formatter[metric.alias]) {
        // formattazione per questa metrica non presente
        // groupSymbol dovrebbe essere default il punto (.) perchè il googleChart load è impostato
        // language 'it'
        this.json.data.formatter[metric.alias] = {
          type: 'number', format: null, prop: {
            negativeParens: false, fractionDigits: 0, groupingSymbol: '.'
          }
        };
      } */
    }
    this.json.wrapper.chartType = 'Table';
    this.json.data.columns = this.#specs_columns;
    this.json.data.group.key = this.#specs_group.key;
    this.json.data.group.columns = this.#specs_group.columns;
    this.json.data.view = this.#specs_view;
    debugger;
    window.localStorage.setItem(`specs_${Sheet.sheet.token}`, JSON.stringify(this.json));
  }

  /* createSpecs() {
    console.log(Sheet);
    this.json.token = Sheet.sheet.token;
    this.json.name = Sheet.name;
    this.json.wrapper.chartType = 'Table';
    for (const [token, field] of Sheet.fields) {
      const workbookField = WorkBook.field.get(token).field;
      Object.keys(WorkBook.field.get(token).field).forEach(key => {
        console.log(key);
        let field_id_ds = (key === 'id') ? `${field}_${key}` : field;
        // Se la colonna è già presente è stata modificata in init-sheet quando si editano le colonne
        if (!this.json.data.columns[field_id_ds]) {
          // colonna non presente, la aggiungo
          this.json.data.columns[field_id_ds] = {
            id: field_id_ds, label: field_id_ds, type: this.getDataType(workbookField[key].datatype)
          };
        }
        // json.data.group.key
        const columnFindKey = this.json.data.group.key.find(value => value.id === field_id_ds);
        if (!columnFindKey) {
          this.json.data.group.key.push({
            id: field_id_ds, label: field_id_ds, type: this.getDataType(workbookField[key].datatype),
            properties: { grouped: true }
          });
        }
        // json.data.view
        const columnFindView = this.json.data.view.find(value => value.id === field_id_ds);
        if (!columnFindView) {
          // la colnna _id la nascondo dalla DataView
          const visible = (key === 'id') ? false : true;
          this.json.data.view.push({ id: field_id_ds, properties: { visible } });
        }
      });
      // for (const [key, object] of Object.entries(WorkBook.field.get(token).field)) {
      // }
      console.log(this.json.data.columns);
      console.log(this.json.data.group.key);
      console.log(this.json.data.view);
    }
    for (const [token, metric] of Sheet.metrics) {
      if (!this.json.data.columns[metric.alias]) {
        // metrica non presente in json.data.columns
        this.json.data.columns[metric.alias] = {
          id: metric.alias, label: metric.alias, type: 'number'
        };
        let find = this.json.data.group.columns.find(value => value.id === metric.alias);
        if (!find) {
          this.json.data.group.columns.push({
            token,
            alias: metric.alias,
            aggregateFn: metric.aggregateFn,
            dependencies: metric.dependencies,
            properties: { visible: true },
            label: metric.alias,
            type: metric.type,
            datatype: 'number'
          });
        } else {
          this.json.data.group.columns[metric.alias].aggregateFn = metric.aggregateFn;
        }
      }
      // in fase di creazione di json.data.group.columns (metriche) imposto anche
      // una formattazione, di base, perchè siccomme il json.data.formatter è un {} ma
      // quando viene salvato su DB viene convertito in [] (forse perchè è vuoto) allora lo
      // imposto con i valori delle metriche, in modo da creare un {}
      if (!this.json.data.formatter[metric.alias]) {
        // formattazione per questa metrica non presente
        // groupSymbol dovrebbe essere default il punto (.) perchè il googleChart load è impostato
        // language 'it'
        this.json.data.formatter[metric.alias] = {
          type: 'number', format: null, prop: {
            negativeParens: false, fractionDigits: 0, groupingSymbol: '.'
          }
        };
      }
    }
    this.json.wrapper.chartType = 'Table';
    // debugger;
    // Resource.saveSpecifications();
    debugger;
    window.localStorage.setItem(`specs_${Sheet.sheet.token}`, JSON.stringify(this.json));
  } */

  prepareData() {
    this.#prepareData = { cols: [], rows: [] };
    // aggiungo le colonne
    for (const key of Object.keys(this.data[0])) {
      // prepareData.cols.push({ id: key, label: key });
      console.log('prepareData : ', key);
      this.#prepareData.cols.push({
        id: key,
        label: this.json.data.columns[key].label,
        type: this.json.data.columns[key].type
      });
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
