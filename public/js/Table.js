class Table {
  #inputSearch;
  constructor(data, ref, editable) {
    // data : la risposta della query che recupera i dati della tabella
    // ref : il riferimento nel DOM, dove verrà costruita la tabella
    // editable (bool) : possibilità di aggiunta colonne e metriche.
    // Se la tabella non è stata selezionata dal canvas non posso aggiungere colonne e metriche
    // al WorkBook
    this.data = data;
    // this.refTableHeader = document.getElementById('table-header-fixed');
    this.ref = document.getElementById(ref);
    // this.thead = this.refTableHeader.querySelector('thead');
    this.thead = this.ref.querySelector('thead');
    this.editable = editable;
    // console.log(this.thead);
    this.tbody = this.ref.querySelector('tbody');
    // console.log(this.ref);
    this.#inputSearch = document.getElementById(this.ref.dataset.searchInput);
  }

  get inputSearch() { return this.#inputSearch; }

  /* set data(value) {
    this.#data = value;
  }

  get data() { return this.#data; } */

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

  draw() {
    // reset table-content
    this.thead.querySelectorAll('th').forEach(th => th.remove());
    this.header();
    this.tbody.querySelectorAll('tr').forEach(tr => tr.remove());
    this.addRows();
  }

  header() {
    // creazione intestazioni
    this.tr = this.thead.querySelector('tr');
    Object.keys(this.data[0]).forEach((column, i) => {
      // TODO: invece di utilizzare questa struttura potrei passare, al metodo, l'id del template HTML da utilizzare
      const th = document.createElement('th');
      const td = document.createElement('td');
      const span = document.createElement('span');
      const buttons = document.createElement('div');
      const btnColumn = document.createElement('button');
      const btnMetric = document.createElement('button');
      // th.innerHTML = column;
      // evento click sulle intestazioni di colonna
      // th.dataset.fn = 'handlerColumn';
      th.setAttribute('col', i);
      th.dataset.field = column;
      this.tr.appendChild(th);
      span.innerHTML = column;
      span.dataset.field = column;
      span.dataset.fn = 'handlerSelectColumn';
      span.dataset.editable = this.editable;
      btnColumn.dataset.fn = 'setColumn';
      btnColumn.dataset.editable = this.editable;
      btnColumn.innerHTML = 'table_rows';
      btnColumn.dataset.field = column;
      btnColumn.classList.add('button-icon', 'material-icons-round', 'md-18');
      btnMetric.dataset.fn = 'setMetric';
      btnMetric.dataset.editable = this.editable;
      btnMetric.classList.add('button-icon', 'material-icons-round', 'md-18');
      btnMetric.innerHTML = 'query_stats';
      btnMetric.dataset.field = column;
      td.appendChild(span);
      buttons.appendChild(btnColumn);
      buttons.appendChild(btnMetric);
      td.appendChild(buttons);
      th.appendChild(td);
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

}
