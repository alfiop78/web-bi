class Dashboards {
  // #sheetSpecs;
  #data;
  #prepareData = { cols: [], rows: [] };
  #json = {
    name: null,
    data: {
      columns: {},
      formatter: {},
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
        pageSize: 20,
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
  constructor() { }

  set data(value) {
    this.#data = value;
  }

  get data() { return this.#data; }

  set json(value) {
    this.#json = JSON.parse(value);
  }

  get json() { return this.#json; }

  prepareDataPreview() {
    // aggiungo le colonne
    // TODO: probabilmente qui è meglio utilizzare il metodo con addColumn/addRows di GoogleChart
    // debugger;
    for (const key of Object.keys(this.data[0])) {
      // preparo i dati delle colonne tenendo in considerazione le eventuali modifiche fatte in
      // localStorage.json... (nel template report)
      this.#prepareData.cols.push({ id: key, label: this.#json.data.columns[key].label });
      // (this.#json.data.columns[key]) ?
      //   this.#prepareData.cols.push({ id: key, label: this.#json.data.columns[key].label }) :
      //   this.#prepareData.cols.push({ id: key, label: key });
    }
    // aggiungo le righe
    this.data.forEach(row => {
      let v = [];
      for (const [key, value] of Object.entries(row)) {
        v.push({ v: value });
      }
      this.#prepareData.rows.push({ c: v });
    });
    console.log(this.#prepareData);
    return this.#prepareData;
  }

  prepareData() {
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
        // if (this.json.data.columns[key]) {
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
        // }
      }
      this.#prepareData.rows.push({ c: v });
    });
    // debugger;
    // console.log(this.#prepareData);
    return this.#prepareData;
  }

  /* set sheetSpecs(value) {
    this.#sheetSpecs = value;
  }

  get sheetSpecs() { return this.#sheetSpecs; } */

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

  defineColumns(value, index) {
    // debugger;
    // console.log(value);
    this.json.data.columns[value.id] = { id: value.id, label: value.label, type: value.type };
    // Creo l'array json.view con le colonne che saranno visualizzate
    // Le colonne _id non vengono visualizzate nell'anteprima del report
    /* const regex = new RegExp('_id$');
    if (!regex.test(value.id)) this.json.data.view.push(value.id); */

    // console.log('columns :', this.json.data.columns);
    // console.log('wrapper.view :', this.json.wrapper.view);
    // TODO: imposto tutte le colonne _ds visibili
    // const regex = new RegExp('_id$');
    /* const regex = new RegExp('_ds$');
    if (regex.test(value.id)) {
      // verifico prima se esiste per non duplicarlo
      // if (!this.json.data.view.includes(value.id)) this.json.data.view.push(value.id);
      if (!this.json.data.view.includes(index)) this.json.data.view.push(index);
    } */
  }

  /* defineGroup() {
    const data = JSON.parse(this.dataTable.toJSON());
    console.log(data);
    data.cols.forEach((col, index) => {
      // console.log(col, index);
      const regex = new RegExp('_ds$');
      if (regex.test(col.id)) {
        // verifico prima se esiste per non duplicarlo
        // if (!this.json.data.view.includes(value.id)) this.json.data.view.push(value.id);
        // se questi valori sono già presenti non li modifico
        if (this.json.data.view.length === 0) {
          if (!this.json.data.view.includes(index)) this.json.data.view.push(index);
        }
        if (this.json.data.group.key.length === 0) {
          if (!this.json.data.group.key.includes(index)) this.json.data.group.key.push(index);
        }
      }
    });
  } */

}
