class Dashboards {
  #sheetSpecs;
  #data;
  #prepareData = { cols: [], rows: [] };
  constructor() {
    this.json = {
      data: {
        columns: {},
        formatter: {
          currency: [],
          percent: []
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
        },
        view: {
          columns: []
        }
      }
    }
  }

  set data(value) {
    this.#data = value;
  }

  get data() { return this.#data; }

  prepareDataPreview() {
    // aggiungo le colonne
    // TODO: probabilmente qui è meglio utilizzare il metodo con addColumn/addRows di GoogleChart
    for (const key of Object.keys(this.data[0])) {
      // Le colonne _id non vengono visualizzate nell'anteprima del report
      /* const regex = new RegExp('_id$');
      if (!regex.test(key)) this.#prepareData.cols.push({ id: key, label: key }); */
      this.#prepareData.cols.push({ id: key, label: key });
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
    debugger;
    return this.#prepareData;
  }

  prepareData() {
    // aggiungo le colonne
    for (const key of Object.keys(this.data[0])) {
      // prepareData.cols.push({ id: key, label: key });
      // console.log(key);
      this.#prepareData.cols.push({
        id: key,
        label: this.sheetSpecs.data.columns[key].label,
        type: this.sheetSpecs.data.columns[key].type
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
        switch (this.sheetSpecs.data.columns[key].type) {
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
            break;
          default:
            (!this.sheetSpecs.data.columns[key].p) ? v.push({ v: value }) : v.push({ v: value, p: { className: this.sheetSpecs.data.columns[key].p } });
            // v.push({ v: value });
            break;
        }
      }
      this.#prepareData.rows.push({ c: v });
    });
    debugger;
    console.log(this.#prepareData);
    return this.#prepareData;
  }

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

  addColumns(fields) {
    // TODO: negli object id/ds c'è il capo 'type' che avevo lasciato "da completare",
    // qui mi può servire per impostare una settaggio di default per il campo 'type'
    for (const key of Object.keys(fields.field)) {
      this.json.data.columns[`${fields.name}_${key}`] = {
        label: `${fields.name}_${key}`,
        type: 'string'
      };
    }

    /* this.#json = {
      data,
      filters,
      bind,
      wrapper
    } */
    console.log(this.json);
  }

  addFormatter(field) {

  }

}
