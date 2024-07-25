class Table {
  #inputSearch;
  #template;
  constructor(data, ref, active) {
    // data : la risposta della query che recupera i dati della tabella
    // ref : il riferimento nel DOM, dove verrà costruita la tabella
    // active (bool) indica se il <th> deve contenere gli eventi oppure no
    // Se la tabella non è stata selezionata dal canvas non posso aggiungere colonne e metriche
    // al WorkBook
    this.data = data;
    this.ref = document.getElementById(ref);
    this.active = active;
    this.ref.dataset.active = active;
    this.#inputSearch = document.getElementById(this.ref.dataset.searchInput);
  }

  get inputSearch() { return this.#inputSearch; }

  set template(value) {
    this.#template = document.getElementById(value);
    this.templateContent = this.#template.content.cloneNode(true);
    this.thead = this.templateContent.querySelector('thead');
    this.tbody = this.templateContent.querySelector('tbody');
    this.ref.querySelectorAll('thead, tbody').forEach(element => element.remove());
    this.ref.appendChild(this.thead);
    this.ref.appendChild(this.tbody);
  }

  get template() { return this.#template; }

  /*
  * ricerca colonne
  */
  columnSearch(e) {
    const value = e.target.value.toLowerCase();
    // console.log(this.ref.rows);
    // console.log(this.ref.rows[0].cells);
    // NOTE:https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/rows
    // TODO: da ottimizzare
    Array.from(this.thead.querySelectorAll('th[data-field]')).filter(column => column.hidden = (column.dataset.field.toLowerCase().indexOf(value) === -1) ? true : false);
    Array.from(this.tbody.querySelectorAll('td[data-field]')).filter(column => column.hidden = (column.dataset.field.toLowerCase().indexOf(value) === -1) ? true : false);
  }

  addColumns() {
    this.tr = this.thead.querySelector('tr');
    Object.keys(this.data[0]).forEach((column, i) => {
      this.templateContent = this.#template.content.cloneNode(true);
      const th = this.templateContent.querySelector('th');
      th.setAttribute('col', i);
      th.dataset.field = column;
      th.innerHTML = column;
      if (this.active) {
        th.dataset.id = WorkBook.activeTable.id;
        th.dataset.fn = 'handlerSelectColumn';
        th.dataset.contextFn = 'contextMenuColumn';
      }
      this.tr.appendChild(th);
    });
  }

  addRows() {
    console.log('addRows');
    // TODO: provare questi metodi: https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/insertRow
    this.data.forEach((row, index) => {
      // console.log(row);
      this.tr = document.createElement('tr');
      this.tr.setAttribute('row', 'body');
      this.tbody.appendChild(this.tr);
      Object.entries(row).forEach(([name, value], i) => {
        this.td = document.createElement('td');
        this.td.setAttribute('col', i);
        this.td.dataset.field = name;
        // this.td.innerHTML = data.toUpperCase().trim()
        this.td.innerHTML = value;
        this.tr.appendChild(this.td);
      });

    });
  }

  fields(fields) {
    if (fields) {
      for (const [key, value] of Object.entries(fields)) {
        // console.log(key, value);
        // cerco, in thead, la colonna corrispondente e gli applico il token per identificare una colonna
        // già definita
        [...this.thead.querySelectorAll(`th[data-field='${value.origin_field}']`)].filter(th => th.dataset.token = key);
      }
    }
  }

  metrics(metrics) {
    if (metrics.size !== 0) {
      for (const [key, value] of metrics) {
        // debugger;
        // console.log(key, value);
        // cerco, in thead, la colonna corrispondente e gli applico il token per identificare una metrica
        // già definita
        const field = value.field.split('.');
        [...this.thead.querySelectorAll(`th[data-field='${field[1]}'][data-id='${value.factId}']`)].filter(th => th.dataset.metricToken = key);
      }
    }
  }

}
