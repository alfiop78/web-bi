class Table {
  // #data;
  #columns;
  #rows;
  constructor(data, ref) {
    this.data = data;
    // this.refTableHeader = document.getElementById('table-header-fixed');
    this.ref = document.getElementById(ref);
    // this.thead = this.refTableHeader.querySelector('thead');
    this.thead = this.ref.querySelector('thead');
    this.tbody = this.ref.querySelector('tbody');
    console.log(this.ref);
  }

  /* set data(value) {
    this.#data = value;
  }

  get data() { return this.#data; } */

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
    Object.keys(this.data[0]).forEach(column => {
      const th = document.createElement('th');
      th.innerHTML = column;
      // evento click sulle intestazioni di colonna
      th.dataset.fn = 'handlerColumn';
      th.dataset.field = column;
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
