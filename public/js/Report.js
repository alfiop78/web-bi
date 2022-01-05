class Report {

  constructor(table, reportId) {
    // riferimento nel DOM
    this.table = table;
    // tbody posso lavorare solo sul corpo del report
    this.tbody = this.table.querySelector('tbody'); // le righe nella table
    // thead posso lavorare solo sullheader del report
    this.thead = this.table.tHead; // intestazioni, si può utilizzare per ciclare solo l'intestazione senza il corpo del report
    // footer
    this.tfoot = this.table.tFoot;
    // sezione in cui sono visualizzati i filtri in page-by
    this.paramsRef = document.querySelector('section[params] > div.params'); // elemento in cui sono i filtri
    document.querySelector('section[params]').hidden = true;
    // con il reportId vado a recuperaro l'object REPORT dallo storage e con esso anche tutte le opzioni per disegnare il report
    this.reportId = reportId;
    // this._options = {};
  }

  set settings(reportId) {
    // this._options
    this.setting = null;
    this.storage = new ReportStorage();
    this.storage.options = reportId;
    this._options = JSON.parse(this.storage.options);
  }

  get settings() { return this._options; }

  set caption(value) {
    this.name = value;
    let caption = this.table.createCaption();
    caption.textContent = this.name;
  }

  get caption() { return this.name;}

  set data(value) {this._data = value;}

  get data() { return this._data;}

  set title(value) {
    // FIXME: vedere se questa viene chiamata
    console.log(value);
    this.titleCaption = value;
    // console.log(this.titleCaption);
    // console.log(this.table.querySelector('caption'));
    this.table.querySelector('caption').innerHTML = this.titleCaption;
  }

  get title() { return this.titleCaption; }

  addColumns() {
    // aggiungo le intestazioni di colonna
    // TODO: qui posso vedere quali sono le opzioni della colonna, se ad esempio la colonna 2 è hidden qui non la creo
    // TODO: provare ad utilizzare il for in oppure for of con Object.entries
    Object.keys(this._data[0]).forEach((col, index) => {
      this.th = document.createElement('th');
      this.th.setAttribute('col', index);
      // this.th.setAttribute('options', 'cols');
      this.th.id = 'col-header-'+index;
      this.th.innerText = col;
      this.table.querySelector('thead tr').appendChild(this.th);
      // TODO: se questa è una colonna (e non una metrica) agigungo anche il pageBy (addParams),
      // vado a controllare, in this._options.positioning, se l'indice della colonna che sto aggiungendo è una metrica, se true non la inserisco come pageBy
      // console.log(index);
      // console.log(this._options.positioning[index]);
      // console.log(Object.keys(this._options.positioning[index]));
      for (let [key, colName] of Object.entries(this._options.positioning[index])) {
        // imposto l'attributo columns/metrics sulle intestazioni di colonna
        this.th.setAttribute(key, true);
        // console.log(key);
        // console.log(value);
        if (key === 'select') {
          //TODO: aggiungo il pageBy
          this.addPageBy(colName, index);
        }
      }
    });
  }

  addPageBy(col, index) {
    // aggiungo il filtro per ogni colonna, tranne le metriche

    this.tmplParams = document.getElementById('params');
    this.tmplContent = this.tmplParams.content.cloneNode(true);
    this.params = this.tmplContent.querySelector('div[data-param-id]');
    this.params.setAttribute('col', index);
    this.params.setAttribute('data-param-id', index);
    this.params.querySelector('ul').id = 'datalist-' + index;
    this.params.querySelector('label').setAttribute('for', 'param-'+index);
    this.params.querySelector('label').innerText = col;
    this.params.querySelector('input').id = 'param-'+index;
    this.params.querySelector('input').setAttribute('data-param-id', index);
    this.params.querySelector('.elements').setAttribute('col', index);

    this.paramsRef.appendChild(this.params);
  }

  showFilters(e) {
    // verifico prima se ci sono altre dropdown aperte, le chiudo.
    document.querySelectorAll('div.elements[show]').forEach((elementsShow) => {
      elementsShow.removeAttribute('show');
    });
    // apro la dropdown
    e.path[1].querySelector('div.elements').toggleAttribute('show');
    e.target.setAttribute('placeholder', 'Search...');
  }

  handlerSelectMulti() {
    // this = element
    this.parentElement.toggleAttribute('selected');
  }

  handlerMultiBtn(e) {
    // TODO: dovrebbe essere il taso OK all'interno dei multiselect, da controllare
    let parentElement = e.path[3]; // md-field
    let elements = parentElement.querySelector('.elements[show]');
    let input = parentElement.querySelector('input');
    let label = parentElement.querySelector('label');
    let liSelected = Array.from(parentElement.querySelectorAll('.elementContent[selected] > .element > li'));
    if (liSelected.length > 0) {
      parentElement.setAttribute('activated', true);
      input.setAttribute('activated', true);
      label.classList.add('has-content');
      input.value = '[MULTISELECT]';
    } else {
      label.classList.remove('has-content');
    }
    this.search();
    elements.removeAttribute('show');
  }

  handlerInput(e) {
    // input search nel pageby
    let parentElement = e.path[1];
    let label = parentElement.querySelector('label');
    if (e.target.value.length > 0) {
      parentElement.setAttribute('activated', true);
      e.target.setAttribute('activated', true);
      label.classList.add('has-content');
    } else {
      e.target.removeAttribute('activated');
      parentElement.removeAttribute('activated');
      label.classList.remove('has-content');
      this.search();
    }

    // mentre digito filtro l'elenco degli elementi <li>
    let liElement = parentElement.querySelectorAll('ul > .elementContent li');
    liElement.forEach((el) => {
      let label = el.getAttribute('label');
      // imposto hidden su elementContent e non su li
      let elementContent = el.parentElement.parentElement;
      (label.indexOf(e.target.value.toUpperCase()) !== -1) ? elementContent.removeAttribute('hidden') : elementContent.hidden = true;
    });
  }

  handlerSelect(e) {
    // selezione di un elemento nei filtri in page-by
    let parent = e.path[5]; // md-field
    let liElement = e.path[1].querySelector('li');
    let input = parent.querySelector('input');
    let label = parent.querySelector('label');
    input.value = liElement.getAttribute('label');
    if (input.value.length > 0) {
      parent.setAttribute('activated', true);
      input.setAttribute('activated', true);
      label.classList.add('has-content');
    } else {
      label.classList.remove('has-content');
    }
    this.search();
  }

  createDatalist() {
    console.log('create datalist');
    // console.log(this.table.cols.length);
    // creo le option nella datalist in base a quello che 'vedo' nella table
    // console.log(this.table.rows.length);

    this.arrColumns = [];
    for (let c = 0; c < this.tbody.rows[0].cells.length; c++) {
      // se questa è una columns (quindi non è una metrica) aggiungo gli elementi in pageby
      if (this.tbody.rows[0].cells[c].hasAttribute('select')) {

        // per ogni colonna con attributo columns (quindi escludo le metriche) ciclo tutte le righe ed aggiungo gli elementi della colonna in un array
        this.arrCols = [];
        for (let r = 0; r < this.tbody.rows.length; r++) {
          // console.log(this.tbody.rows[r].cells[c]);
          this.arrCols.push(this.tbody.rows[r].cells[c].innerHTML);
        }
        // ottengo gli elementi che vedo nella table
        // console.log(this.arrCols);

        this.arrColumns.push(this.arrCols);
        // console.log(this.arrColumns);

        // NOTE:  rimuovo elementi duplicati nell'array con l'utilizzo di array.filter
          /*
          callback
            Function is a predicate, to test each element of the array. Return true to keep the element, false otherwise. It accepts three arguments:
          element
            The current element being processed in the array.
          index Optional
            The index of the current element being processed in the array.
          array Optional
            The array filter was called upon.
          thisArg Optional
            Value to use as this when executing callback.
          */
        this.arrayUnique = this.arrColumns[c].filter((value, index, self) => self.indexOf(value) === index);
        // console.log(this.arrayUnique);
        this.datalist = document.getElementById('datalist-'+c);
        this.arrayUnique.forEach((el, i) => {
          this.elContent = document.createElement('div');
          this.elContent.classList.add('elementContent');
          this.datalist.appendChild(this.elContent);
          this.element = document.createElement('div');
          this.element.classList.add('element');
          this.elContent.appendChild(this.element);
          this.iconDone = document.createElement('i');
          this.iconDone.innerText = 'done';
          // iconDone.hidden = true; // default non è multiselezione
          this.iconDone.classList.add('material-icons', 'md-18');

          this.li = document.createElement('li');
          this.li.id = i;
          this.li.innerHTML = el.toUpperCase().trim();
          this.li.setAttribute('label', el.toUpperCase().trim());
          this.element.appendChild(this.li);
          this.element.appendChild(this.iconDone);
        });
      }


    }

  }

  eventParams() {
    this.paramsRef.querySelectorAll('input[type="search"]:not([id="search"])').forEach((el) => {
      el.oninput = this.handlerInput.bind(this);
      el.onclick = this.showFilters.bind(this);
      el.onblur = (e) => {e.target.removeAttribute('placeholder');};
      // elementi presenti nei Filtri standard
      el.parentElement.querySelectorAll('.elements:not([multi]) > ul div.element').forEach((element) => {element.onclick = this.handlerSelect.bind(this);});
      // elementi presenti nei Filtri Multiselect
      el.parentElement.querySelectorAll('.elements[multi] > ul div.element').forEach((liElement) => {liElement.onclick = this.handlerSelectMulti.bind(liElement);});
      // tasto OK all'interno dei params in multiselect
      el.parentElement.querySelector('section > button').onclick = this.handlerMultiBtn.bind(this);
    });
  }

  addRows() {
    console.log('addRows');
    // TODO: provare questi metodi: https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/insertRow
    // console.log(rowValues);
    for (let i in this._data) {
      this.tr = document.createElement('tr');
      this.tr.setAttribute('row', 'body');
      this.tbody.appendChild(this.tr);
      // console.log(this._data[i]);
      // TODO: provare ad utilizzare for...in oppure for...of con object.entries
      Array.from(Object.values(this._data[i])).forEach((data, index) => {
        this.td = document.createElement('td');
        this.td.setAttribute('col', index);
        // this.td.setAttribute('options', 'cols');
        // (!data) ? console.log('NULL'): this.td.innerHTML = data.toUpperCase().trim();
        // this.tr.appendChild(this.td);
        // tramite il positioning imposto l'attributo columns/metrics sulle celle
        for (let [key, colName] of Object.entries(this._options.positioning[index])) {
          // imposto l'attributo columns/metrics sulle intestazioni di colonna
          this.td.setAttribute(key, true);
          // (!data) ? console.log('NULL'): this.td.innerHTML = data.toUpperCase().trim();
          // this.tr.appendChild(this.td);
          if (key === 'metrics') {
            // TODO: format della metrica con "decimal", "currency", "percent" oppure "unit"
            // console.log(new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(data));
            // this.formatNumber = new Intl.NumberFormat('it-IT', {style: 'currency', currency: 'EUR'}).format(data);
            // (!data) ? console.log('NULL'): this.td.innerHTML = this.formatNumber;
            (!data) ? console.log('NULL'): this.td.innerHTML = data;
          } else {
            (!data) ? console.log('NULL'): this.td.innerHTML = data.toUpperCase().trim();
          }
          this.tr.appendChild(this.td);
        }
      });
    }
  }

  search() {
    // Ricerca in base alla selezione dei filtri
    console.log('search');
    let cols = [], multiSelectElements = [];
    // recupero i filtri che sono stati impostati
    let filters = Array.from(document.querySelectorAll('input[type="search"][activated]'));
    // console.log(filters);
    filters.forEach(function(item) {
      // per ogni filtro impostato, inserisco nell'array cols i valori selezionati nei filtri
      // verifico se questo filtro è multiple
      if (item.parentElement.querySelector('.elements').getAttribute('multi')) {
        // multi
        let liSelected = Array.from(item.parentElement.querySelectorAll('.elementContent[selected] > .element > li'));
        // console.log(liSelected);
        liSelected.forEach((selected) => {
          // console.log(selected.getAttribute('label'));
          multiSelectElements.push(selected.getAttribute('label'));
        });
        cols[+item.getAttribute('data-param-id')] = multiSelectElements;
      } else {
        cols[+item.getAttribute('data-param-id')] = item.value;
      }
    });
    // console.log(cols);

    // console.log('search');
    let rows = [];
    /* per ogni colonna (filtro) impostato, inserisco in un array le righe trovate per il filtro impostato
    * es.: rows = [3, 44, 54, ecc..] le righe che hanno il valore del filtro
    */

    cols.forEach((value, index) => {
      let row = [];
      for (let i = 0; i < this.tbody.rows.length; i++) {
        // per ogni riga verifico la presenza del valore per ogni filtro selezionato
        // nel caso della multiselect verifico la presenza nell'array di valori selezionati
        if ( (this.tbody.rows[i].cells[index].innerText === value) || (value.includes(this.tbody.rows[i].cells[index].innerText)) ) {
          //... esamino le celle di ogni colonna appartente alla riga
          // il valore ricercare è presente in questa riga, la aggiungo all'array rows
          row.push(i);
        }

      }
      rows[index] = row;
      // console.log(rows);
    });

    /* esamino ogni riga della table e verifico se la riga esaminata è presente nell'array precedente (rows).
    * se è presente imposto true per ogni colonna (quindi per ogni filtro impostato)
    * infine, se tutte le colonne hanno true (rowsArray = [true, true, ecc...]) la riga corrispondente è mostrata altrimenti...
    * rowsArray = [true, false, true, ecc...] è nascosta
    */

    for (let i = 0; i < this.tbody.rows.length; i++) {
      // console.log(i);
      let rowsArray = [];
      cols.forEach((value, colIndex) => {
        // se la riga in esame è presente nell'array, seleziono questa colonna come true
        rowsArray.push(rows[colIndex].includes(i));
      });
      // se nell'array rowsObj è presente una colonna con 'false' NON seleziono la riga
      if (rowsArray.includes(false)) {
        // console.log('not matched');
        this.tbody.rows[i].removeAttribute('found');
        this.tbody.rows[i].hidden = true;
      } else {
        // console.log('matched');
        this.tbody.rows[i].setAttribute('found', true);
        this.tbody.rows[i].removeAttribute('hidden');
      }
    }
    this.rebuildDatalists();
    this.info();
  }

  rebuildDatalists() {
    // TODO: da rivedere
    // console.log(this.table.rows.length);

    let arrColumns = [];

    // console.log(this.tbody.rows[i]);
    // console.log(this.tbody.rows[i].cells[0]);
    // console.log(this.tbody.rows[i].cells);
    // console.log(this.tbody.rows[0].cells.length);

    for (let c = 0; c < this.tbody.rows[0].cells.length; c++) {
      // per ogni colonna ciclo tutte le righe ed aggiungo gli elementi della colonna in un array
      // console.log(this.tbody.rows[i].cells[c]);
      // let arr = [c, this.tbody.rows[i].cells[c].innerHTML];
      let arrCols = [];

      for (let r = 0; r < this.tbody.rows.length; r++) {
        // console.log(this.tbody.rows[r]);
        if (this.tbody.rows[r].getAttribute('found')) {
          arrCols.push(this.tbody.rows[r].cells[c].innerHTML.toUpperCase());
        }
      }
      arrColumns.push(arrCols);
      // console.log(arrColumns);

      let arrayUnique = arrColumns[c].filter((value, index, self) => self.indexOf(value) === index);
      // console.log(arrayUnique);
      // recupero le datalist tranne quelle con activated

      this.datalist = document.querySelector('.params .md-field:not([activated]) ul.filters[id="datalist-'+c+'"]');
      if (this.datalist) {
        // console.log(this.datalist.querySelectorAll('li'));
        this.datalist.querySelectorAll('li').forEach((el, index) => {
          let label = el.getAttribute('label');
          let elementContent = el.parentElement.parentElement;
          (!arrayUnique.includes(label)) ? elementContent.hidden = true : elementContent.removeAttribute('hidden');
        });
      }
    }
  }

  info() {
    console.log('info');
    // TODO: da rivedere
    // console.log(this.table.tFoot); // utlizzare questo nel costruttore (se ritorna il footer)

    this.infoRef = this.table.querySelector('tfoot div[info]');
    this.rowCounter = this.infoRef.querySelector('span[row-number]');
    for (let i = 0, count = 1; i < this.tbody.rows.length; i++) {
      if (this.tbody.rows[i].getAttribute('hidden') === null) {
        this.rowCounter.innerText = count++;
      }
    }
  }

  searchInput(event) {
    // ricerca dalla input in basso
    console.log('search input');
    // console.log(this);
    // console.log(event);
    // console.log(event.target.value.length);


    (event.target.value.length > 0) ? event.target.parentElement.querySelector('label').classList.add('has-content') : event.target.parentElement.querySelector('label').classList.remove('has-content');
    // recupero, dalla table, le righe e le celle, successivamente inserisco le celle in un array per poter utilizzare indexOf su ogni singolo carattere contenuto nella row
    // NOTE: se si vuole far in modo da ricercare l'esatta occorrenza (inserendo tutta la parola) bisogna eliminare [n] da cells[n] nell'indexOf
    // console.log(document.querySelectorAll('table tr[row="body"]'));

    for (let i = 0; i < this.tbody.rows.length; i++) {
      let founded = false;
      // console.log(table.rows[i]);
      // console.log(table.rows[i].cells[1]);
      this.tbody.rows[i].style.backgroundColor = 'initial'; // reimposto il colore iniziale dopo ogni carattere inserito
      this.tbody.rows[i].removeAttribute('found');
      this.tbody.rows[i].removeAttribute('hidden');

      let cells = [];
      for (let n = 0; n < this.tbody.rows[i].cells.length; n++) {
        // console.log(table.rows[i].cells[n].innerText);
        // ... oppure ...
        // console.log(table.rows[i].cells.item(n).innerText);
        cells.push(this.tbody.rows[i].cells[n].innerText);

        // arrayTableContent.push(table.rows[i].cells[n].innerText);
        if (cells[n].indexOf(event.target.value.toUpperCase()) !== -1) {
          // console.log(table.rows[i]);
          // console.log(i);
          // console.log('trovata');
          founded = true;
        }
      }
      (founded) ? this.tbody.rows[i].setAttribute('found', true) : this.tbody.rows[i].hidden = true;
    }
  }

  applyStyles() {
    console.log('applyStyles');

    // applico le opzioni impostate al report
    // console.log(this._options);
    // console.log(this.styles);

    for (let columnId in this._options.cols) {
      // console.log(columnId);
      // leggo le proprietà impostate per questa colonna
      // console.log(this._options.cols[columnId].styles);
      // console.log(Object.keys(this._options.cols[columnId].styles).length);
      // se ci sono delle proprietà impostate in styles le applico al report
      if (Object.keys(this._options.cols[columnId].styles).length >= 1) {
        for (let [property, value] of Object.entries(this._options.cols[columnId].styles)) {
          // console.log(property);
          // console.log(value);
          this.thead.rows[0].cells[columnId].style[property] = value;
        }
      }
    }
  }

  applyAttributes() {
    // applico le opzioni impostate al report
    console.log('applyAttributes');
    /*
    // TODO: dopo aver impostato l'attributo lo devo impostare a tutta la colonna. Alcuni attributi, come hidden sono
      automaticamente impostati qui e quindi ho l'effetto immediato, altri attributi devo andarli a leggerli (switch)
      ed impostarli in base alla proprietà (es.: [format='currency']) non è impostato in automatico e devo farlo attraverso
      this.formatNumber = new Intl.NumberFormat('it-IT', {style: 'currency', currency: 'EUR'}).format(number);
    */

    for (let columnId in this._options.cols) {
      // console.log(columnId);
      // leggo le proprietà impostate per questa colonna
      // console.log(this._options.cols[columnId].attributes);
      // console.log(Object.keys(this._options.cols[columnId].attributes).length);
      // se ci sono delle proprietà impostate in attributes le applico al report
      if (Object.keys(this._options.cols[columnId].attributes).length >= 1) {
        for (let [property, value] of Object.entries(this._options.cols[columnId].attributes)) {
          console.log(property);
          console.log(value);
          this.thead.rows[0].cells[columnId].setAttribute(property, value);
          // applico l'attributo a tutta la colonna
          for (let i = 0; i < this.tbody.rows.length; i++) {
            if (property === 'format') {
              console.log('format');
              // valore della cella da modificare
              // OPTIMIZE: Impostare anche altri formati (decimal, percent, ecc...)
              this.cellValue = this.tbody.rows[i].cells[columnId].innerText;
              // console.log(this.cellValue);
              this.formatOptions = {style: value, currency: 'EUR'};
              // console.log(this.formatOptions);
              this.numberFormat = new Intl.NumberFormat('it-IT', this.formatOptions).format(this.cellValue);
              // console.log(this.numberFormat);
              this.tbody.rows[i].cells[columnId].innerHTML = this.numberFormat;
            }
            this.tbody.rows[i].cells[columnId].setAttribute(property, value);
          }
        }
      }
    }
  }

  applyPageBy() {
    // applico le opzioni inserite sul pageBy
    console.log('apply PageBy');

    for (let columnId in this._options.cols) {
      // leggo le proprietà impostate per questo filtro in pageBy
      if (this._options.cols[columnId].pageBy) {
        for (let [property, value] of Object.entries(this._options.cols[columnId].pageBy)) {
          console.info('PageBy impostato sulla colonna: ', columnId);
          console.log(property, value);
          // i parametri e/o le opzioni dei filtri le imposto sull'elemento div.elements[options]
          this.paramsRef.querySelector('.elements[col="'+columnId+'"]').setAttribute(property, value);
        }
      } else {
        console.log('PageBy non impostato sulla colonna: ',columnId);
      }
    }
  }

  draw() {
    // aggiungo event sugli elementi dei filtri, sia filtri semplici che multiselezione
    // l'associazione degli eventi va messa dopo l'applicazione delle option, solo nelle option vengono definiti i filtri multi e non
    this.eventParams();
    this.info();
    this.applyStyles();
    this.applyAttributes();
    this.applyPageBy();

    // visualizzo il page-by
    document.querySelector('section[params]').hidden = false;
    // visualizzo la table
    this.table.hidden = false;
  }

}

class Options extends Report{
  // apro il report per la prima volta, per crearlo e creo anche le opzioni
  constructor(table, reportId) {
    super(table, reportId);
    this._options = {};
    this.dialogOption = document.getElementById('columnsOption');
    // dialog per setting page-by
    this.dialogPageByOption = document.getElementById('pageByOptions');
    // tasto ok nella dialog per setting page-by
    this.dialogPageByOption.querySelector('#btnSavePageByOption').onclick = this.btnDonePageByOptions.bind(this);
    // tasto ok nella dialog
    this.dialogOption.querySelector('#btnSaveColOption').onclick = this.btnDoneDialogOption.bind(this);

    /**
     * * 'cols':[
     * 2: {
     *    'columnId': 2,
     *    'style': {'backgroundColor': 'red', 'color': 'white'}, // stili css da applicare
     *    'attributes': {'hidden': true, 'order': 'asc', ecc...} // attributi da applicare [esmpio=attributo]
     *    'filters' : {'mode': 'multi/single', ecc...} // pageBy filter
     * 1: {
     *    'columnId': 1,
     *    'style': {'backgroundColor': 'darkgrey', 'color': 'black'}, // stili css da applicare
     *    'attributes': {'hidden': true, 'order': 'asc', ecc...} // attributi da applicare [esmpio=attributo]
     *    'filters' : {'mode' : 'multi/single', ecc..} // pageBy filter

     * ]
     *
     */
    this.cols = {}; // array di object
    // TODO: attributes e style per ora vanno separati perchè, per impostarli sull'elemento, il procedimento è diverso.
    /*
     * Per impostare gli attributi li aggiungo all'elemento es.: <th id=0 attributo=valore>
     * Per impostare gli stili in futuro si potrà usare attr(data-nomeattributo) nel css (funzionalità sperimentale)
     * Al momento dovrò applicare gli styles tramite js th.style.color = valore
     */
    this.styles = {};
    this.pageBy = {};
    this.attributes = {};
    this.reportOptions = {}; // conterrà l'object completo che verrà salvato in storage
    // default imposto la inputSearch (in basso nel footer) abilitata alla ricerca
    this.inputSearch = true;
  }

  set reportName(value) {this.name = value;}

  get reportName() { return this.name;}

  set cube(value) {
    this._cube = value;
    // quando imposto il cubo imposto anche il posizionamaneto di default
    this.defaultPositioning = this._cube;
  }

  get cube() { return this._cube; }

  set inputSearch(value) {
    this._inputSearch = value;
    this.td = this.tfoot.querySelector('td[inputSearch]');
    // se la inputSearch è abilitata (true) la visualizzo ed associo l'evento input al metodo searchInput()
    if (this._inputSearch) {
      // la visualizzo e gli associo l'evento oninput
      // console.log(this.tfoot);
      this.td.hidden = false;
      this.tfoot.querySelector('#search').oninput = this.searchInput.bind(this);
    } else {
      // la nascondo e rimuovo l'evento oniput
      this.td.hidden = false;
      this.tfoot.querySelector('#search').removeEventListener('click', this.searchInput.bind(this));
    }
    this._options.inputSearch = this._inputSearch;
  }

  get inputSearch() { return this._inputSearch;}

  set report(value) {this.reportId = value;}

  get report() { return this.reportId; }

  set column(value) {
    // verifico se già esiste la key con l'id della colonna da modificare, se non esiste azzero this.styles
    this.columnId = value;
    for (let key in this.cols) {
      // se la colonna selezionata già esiste in this.cols non faccio il reset di styles/attributes per non perdere le selezioni precedenti di questa colonna
      // se si attiva una colonna non presente in this.cols azzero styles/attributes per il salvataggio "pulito" di questi personalizzazioni
      if (+key !== +this.columnId) {
        // console.log('azzero');
        this.styles = {};
        this.pageBy = {};
        this.attributes = {};
      }
    }

    console.log(this.cols);
  }

  get column() { return this.columnId; }

  set attribute(attribute) {
    // imposto attributo, questo ha sempre la coppia key/value
    for (let [key, value] of Object.entries(attribute)) {
      this.attributes[key] = value;
    }
    // console.log(this.attributes);
    // this.cols[this.columnId]['attributes'] = this.attributes;
    console.log(this.cols);
  }

  get attribute() { return this.attributes; }

  set pageByOption(pageBy) {
    // console.log(pageBy);
    // imposto parametri del pageby, questo ha sempre la coppia key/value
    for (let [key, value] of Object.entries(pageBy)) {
      this.pageBy[key] = value;
    }
    // console.log(this.pageBy);
    // console.log(this.cols);
  }

  get pageByOption() {return this.pageBy;}

  set colOption(option) {
    // console.log(option);
    this._options.cols = option;
    console.log(this._options);
  }

  get colOption() { return this._options.cols;}

  set style(style) {
    // imposto attributo, questo ha sempre la coppia key/value
    for (let [key, value] of Object.entries(style)) {
      this.styles[key] = value;
    }
    // console.log(this.styles);addR
  }

  get style() { return this.styles; }

  saveReport(process) {

    this.reportOptions.id = this.report;
    this.reportOptions.type = 'REPORT';
    this.reportOptions.name = this.reportName;
    this.reportOptions.options = this._options;
    this.reportOptions.process = process;

    this.storage = new ReportStorage();
    console.log(this.reportOptions);
    this.storage.save = this.reportOptions;
    // dopo aver salvato il report elimino dallo storage il process che elabora questo report
    // se è necessario rielaborare il report, il process lo prendo all'interno del object report.process (in storage)
    window.localStorage.removeItem('process_' + this.reportName);
  }

  addColumns() {
    console.log('AddColumns');
    Object.keys(this._data[0]).forEach((col, index) => {
      // console.log(col, index);
      this.th = document.createElement('th');
      this.th.setAttribute('col', index);
      this.th.classList.add('dropzone');
      // this.th.setAttribute('options', 'cols');
      this.th.setAttribute('draggable', true);
      this.th.id = 'col-header-'+index;
      this.th.innerText = col;
      this.th.onclick = this.handlerColOption.bind(this);
      this.table.querySelector('thead tr').appendChild(this.th);

      for (let [key, colName] of Object.entries(this._options.positioning[index])) {
        // console.log(key);
        // console.log(colName);
        // imposto l'attributo columns/metrics sulle intestazioni di colonna
        this.th.setAttribute(key, true);
        // console.log(key);
        // console.log(value);
        if (key === 'select') {
          //TODO: aggiungo il pageBy
          this.addPageBy(colName, index);
        }
      }
    });
    // this.setColsAttribute();
  }

  handlerColOption(e) {
    // click sulla header della colonna selezionata
    console.log('handlerColOption');
    // console.log(this);
    // console.log(e.target);
    // this.dialogOption.setAttribute('columnId', +e.target.getAttribute('col'));
    this.column = +e.target.getAttribute('col');
    console.log(e.target.innerText);
    // inserisco il nome della colonna selezionata nella dialog
    this.dialogOption.querySelector('#colName').innerHTML = e.target.innerText;
    this.dialogOption.showModal();
  }

  btnDoneDialogOption(e) {
    // click tasto OK nella dialog Options per la colonna
    // Salvo le impostazioni per questa colonna
    console.log('btnDoneDialogOption');
    this.dialogOption.close();
    this.cols[this.columnId] = {'columnId': this.columnId};
    this.cols[this.columnId].styles = this.styles;
    this.cols[this.columnId].attributes = this.attributes;
    // imposto this._options
    this.colOption = this.cols;
    // applico le impostazioni sul report
    super.applyStyles();
    super.applyAttributes();
  }

  btnDonePageByOptions() {
    // btn OK nella dialog pageByOption
    this.dialogPageByOption.close();
    console.log(this.columnId);
    // TODO: se già esiste il columnId selezionato in this.cols non lo riassegno (altrimenti viene resettato styles e attributes)
    if (!this.cols[this.columnId].hasOwnProperty('columnId')) {
      console.log('colonna non impostata azzero');
      this.cols[this.columnId] = {'columnId': this.columnId};
    }

    this.cols[this.columnId].pageBy = this.pageBy;
    // imposto this._options
    this.colOption = this.cols;
    // applico le impostazioni sul report
    console.log('applico impostazione del pageby');
    console.log(this.cols);
    this.applyPageBy();
  }

  handlerPageByOption(e) {
    // Click icona setting nel pageBy
    console.log('pageby option');
    // imposto la colonna selezionata
    this.column = +e.target.getAttribute('data-id');
    console.log(this.column);
    // console.log(e.target);
    // inserisco il nome del filtro selezionato nella dialog
    this.dialogPageByOption.querySelector('#pageBy-colName').innerHTML = e.target.getAttribute('label');
    // open dialog
    this.dialogPageByOption.showModal();
  }

  addPageBy(col, index) {
    this.tmplParams = document.getElementById('params');
    this.tmplContent = this.tmplParams.content.cloneNode(true);
    this.params = this.tmplContent.querySelector('div[data-param-id]');
    this.settingIcon = this.tmplContent.querySelector('span.popupContent');
    this.settingIcon.setAttribute('pageby-setting', index);
    this.icon = this.settingIcon.querySelector('i');
    this.icon.setAttribute('data-id', index);
    // aggiungo una label che fa riferimento alla colonna selezionata
    this.icon.setAttribute('label', col);
    // console.log(this.params);
    this.params.setAttribute('col', index);
    this.params.setAttribute('data-param-id', index);
    this.params.querySelector('ul').id = 'datalist-'+index;
    this.params.querySelector('label').setAttribute('for', 'param-'+index);
    this.params.querySelector('label').innerText = col;
    this.params.querySelector('input').id = 'param-'+index;
    this.params.querySelector('input').setAttribute('data-param-id', index);
    this.params.querySelector('.elements').setAttribute('col', index);
    this.paramsRef.appendChild(this.params);
    this.params.after(this.settingIcon);
    // evento click su icona setting per il pageBy
    this.icon.onclick = this.handlerPageByOption.bind(this);
  }

  set defaultPositioning(cube) {
    /*Definisco un array di oggetti contenenti la disposizione delle colonne, nello stato iniziale del datamart
    positioning = [
      0=> {'col': 'Cod.Sede'},
      1=> {'col': 'Sede'},
      2=> {'metric': 'venduto'},
      3=> {'metric': 'quantita'}
    ]*/

    this.positioning = [];
    for (let element in cube) {
      // console.log(element);
      // console.log(cube[element]);
      if (element === 'select' || element === 'metrics' || element === 'filteredMetrics') {
        // console.log(element); // select
        // console.log(cube[element]);
        // per ogni tabella presente...
        for (let [table] of Object.entries(cube[element])) {
          // console.log(table);
          for (let [field] of Object.entries(cube[element][table])) {
            // console.log(field);
            // console.log(cube[element][table][field]['alias']);
            let obj = {};
            //obj['columns'] = cube[element][table][field]['alias'];
            obj[element] = cube[element][table][field]['alias'];
            this.positioning.push(obj);
          }
        }
      }
    }
    console.log(this.positioning);
    this._options.positioning = this.positioning;
  }

  get defaultPositioning() { return this._options.positioning; }

  draw() {
    console.log('draw');

    // TODO: da ottimizzare nascondendo il report come fatto nella Classe Report
    // aggiungo event sugli elementi dei filtri, sia filtri semplici che multiselezione
    // l'associazione degli eventi va messa dopo l'applicazione delle option, solo nelle option vengono definiti i filtri multi e non
    this.eventParams();
    this.info();
  }
}

class OpenReport extends Options {
  // apro il report che ha già delle opzioni (riapertura per edit)
  constructor(table, reportId, JSONReportData) {
    super(table, reportId);
    this.JSONReportData = JSONReportData;
    // console.log(JSONReportData);
    this._options = JSONReportData.options;
    // console.log(this._options);
    // reimposto questi object allo stato in cui erano stati salvati nello storage
    // in questo modo, quando si modifica di nuovo il report, non vengono perse le precedenti modifiche già salvate nello storage
    // TODO: poi, posso aggiungere un 'salva con nome' per creare un nuovo report
    this.inputSearch = this._options.inputSearch;
    this.cols = this._options.cols;
  }

  set data(value) {
    this._data = value;
    super.addColumns();
    super.addRows(); // class Report
    super.createDatalist(); // class Report
    this.draw();
  }

  saveReport() {
    // sovrascrivo il report in storage con le ultime modifiche effettuate
    this.reportOptions.id = this.report;
    this.reportOptions.type = 'REPORT';
    this.reportOptions.datamartId = this.datamart; // FIXME: Da settare
    this.reportOptions.name = this.reportName;
    this.reportOptions.options = this._options;
    this.reportOptions.process = this.JSONReportData.process;

    this.storage = new ReportStorage();
    console.log(this.reportOptions);
    this.storage.save = this.reportOptions;
  }

  draw() {
    console.log('draw');
    // TODO: disegno la tabella applicandogli le options già definite
    super.eventParams();
    super.info();
    super.applyStyles();
    super.applyAttributes();
    super.applyPageBy();
  }
}
