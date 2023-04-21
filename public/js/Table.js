class Table {
  #inputSearch;
  constructor(data, ref) {
    this.data = data;
    // this.refTableHeader = document.getElementById('table-header-fixed');
    this.ref = document.getElementById(ref);
    // this.thead = this.refTableHeader.querySelector('thead');
    this.thead = this.ref.querySelector('thead');
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
    console.log(this.ref.rows);
    console.log(this.ref.rows[0].cells);
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/rows
    debugger;
    // let hiddenColumns = [];
    let test = Array.from(this.thead.querySelectorAll('th[data-field]')).filter(column => column.dataset.field.toLowerCase().indexOf(value) !== -1);
    console.log(test);
    // creo un array con gli elementi trovati
    test.forEach(tt => {
      console.log('visualizzo ', tt.getAttribute('col'));
      this.thead.querySelectorAll('*[col]').forEach(head => {
        head.hidden = (head.getAttribute('col') === tt.getAttribute('col')) ? false : true;
      });
    });
    // console.log(test);
    /* this.thead.querySelectorAll('th[data-field]').forEach(column => {
      const field = column.dataset.field.toLowerCase();
      // se la colonna non viene trovata la nascondo (con hidden = true)
      hiddenColumns.push((field.indexOf(value) === -1) ? true : false);
      column.hidden = (field.indexOf(value) === -1) ? true : false;
    }); */
  }

  draw() {
    // reset table-content
    this.thead.querySelectorAll('th').forEach(th => th.remove());
    this.header();
    this.tbody.querySelectorAll('tr').forEach(tr => tr.remove());
    this.addRows();
    this.addCompositeColumn();
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
      btnColumn.dataset.fn = 'setColumn';
      btnColumn.innerHTML = 'table_rows';
      btnColumn.dataset.field = column;
      btnColumn.classList.add('button-icon', 'material-icons-round', 'md-18');
      btnMetric.dataset.fn = 'setMetric';
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

  addCompositeColumn() {
    this.tr = this.thead.querySelector('tr');
    // TODO: invece di utilizzare questa struttura potrei passare, al metodo, l'id del template HTML da utilizzare
    const th = document.createElement('th');
    const td = document.createElement('td');
    const span = document.createElement('span');
    const buttons = document.createElement('div');
    const btnMetric = document.createElement('button');
    th.classList.add('custom-field');
    span.innerHTML = 'Nuovo Campo';
    th.dataset.fn = 'setCustomField';
    btnMetric.classList.add('button-icon', 'material-icons-round', 'md-18');
    btnMetric.innerHTML = 'add';
    this.tr.appendChild(th);
    td.appendChild(span);
    buttons.appendChild(btnMetric);
    td.appendChild(buttons);
    th.appendChild(td);
  }

  addRows() {
    console.log('addRows');
    // TODO: provare questi metodi: https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/insertRow
    this.data.forEach((row, index) => {
      // console.log(row);
      this.tr = document.createElement('tr');
      this.tr.setAttribute('row', 'body');
      this.tbody.appendChild(this.tr);
      Object.values(row).forEach((value, i) => {
        this.td = document.createElement('td');
        this.td.setAttribute('col', i);
        // this.td.innerHTML = data.toUpperCase().trim()
        this.td.innerHTML = value;
        this.tr.appendChild(this.td);
      });

    });
  }

}
