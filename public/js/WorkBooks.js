// nella Class Sheets verranno aggiunti gli oggetti che consentono di creare il report.
/*
Es. : Quando viene aggiunta un campo alla dropzone 'rows' (questo è già presente in WorkSheets o la sua derivata) il campo
  * verrà aggiunto alla Sheets (tramite l'istanza Sheet per ogni nuovo report da creare) e quindi diventa 'disponibile'
  * per essere processato da MapDatabaseController -> Cube.php
*/
class Sheets {
  constructor(sheetName) {
    this.name = sheetName;
  }

}

class WorkSheets {
  /*
  * in quesa classe andrò ad inserire tutti gli elementi (metriche filtrate, composte, colonne custom SQL, ad es. quelle concatenate) 
  * che saranno poi disponibili per poter crear il report.
  * Quando un filtro viene aggiunto al report (Sheets) lo recupero da questa classe e lo copio nella proprietà 'filters' della classe Sheets.
  * Stesso discorso per le metriche e le colonne.
  * Questa classe, e la sua derivata, sono disponibili come Modello per la creazione del report.
  */
  // #from = new Map(); // #from e #joins e #tables dovranno essere presenti nella Sheets eperchè sono proprietà necessarie per processare il report
  // #joins = new Map();
  // #tables = new Set(); // tutte le tabelle usate nello sheet. Mi servirà per creare la from e la where

  #filter = new Map();
  #filters = new Map();
  #metrics = new Map();
  #advMetrics = new Map();
  #columns = new Map();
  constructor(name) {
    this.workBook = { name: name };
    this.sheet = { name: `WorkSheet_${name}` };
  }

  /* set from(object) {
    this.#from.set(object.alias, { schema: object.schema, table: object.table });
  }

  get from() { return this.#from; } */

  /* set tables(value) {
    this.#tables.add(value);
  }

  get tables() { return this.#tables; } */

  /* set joins(object) {
    // la tabella dei fatti non ha join
    if (this.nJoins.has(object.alias)) this.#joins.set(object.alias, this.nJoins.get(object.alias));
  }

  get joins() {
    return this.#joins;
  } */

  set columns(token) {
    /* this.#columns.set(this.field.get(token).tableAlias, {
      [token]: this.field.get(token)
    }); */
    this.#columns.set(token, this.field.get(token));
    console.log('sheet columns : ', this.#columns);
  }

  get columns() { return this.#columns; }

  set metrics(token) {
    this.#metrics.set(token, this.mapMetric.get(token));
    console.log('sheet metrics : ', this.#metrics);
  }

  get metrics() { return this.#metrics; }

  set advMetrics(object) {
    this.#advMetrics.set(object.token, object.value);
    console.log('sheet advMetrics : ', this.#advMetrics);
  }

  get advMetrics() { return this.#advMetrics; }

  set filter(object) {
    this.#filter.set(object.token, object.value);
  }

  get filter() { return this.#filters; }

  set filters(token) {
    if (!this.#filters.has(this.#filter.get(token).workBook.tableAlias)) {
      this.#filters.set(this.#filter.get(token).workBook.tableAlias, {
        [token]: this.#filter.get(token)
      });
    } else {
      // alias di tabella già presente
      this.#filters.get(this.#filter.get(token).workBook.tableAlias)[token] = this.#filter.get(token);
    }
    console.log('#filters : ', this.#filters);
  }

  get filters() { return this.#filters; }

}

class WorkBooks extends WorkSheets {
  #activeTable;
  #field = new Map();
  #fields = new Map();
  #mapMetric = new Map();
  #mapMetrics = new Map();
  #nJoin = new Map();
  #nJoins = new Map();
  // #nTables = new Map();
  #nHier = new Map();
  #tableJoins = { from: null, to: null }; // refs 
  #tablesMap = new Map(); // elenco di tutte le tabelle del canvas con le relative tabelle discendenti (verso la fact)
  constructor(name) {
    super(name);
    this.schema;
  }

  set tableJoins(object) {
    this.#tableJoins.from = Draw.svg.querySelector(`#${object.from}`);
    this.#tableJoins.to = Draw.svg.querySelector(`#${object.to}`);
  }

  get tableJoins() { return this.#tableJoins; }

  set activeTable(id) {
    this.#activeTable = Draw.svg.querySelector(`#${id}`);
  }

  get activeTable() { return this.#activeTable; }

  set field(object) {
    this.#field.set(object.token, object.value);
  }

  get field() { return this.#field; }

  set fields(token) {
    if (!this.#fields.has(this.#field.get(token).tableAlias)) {
      // alias tabella non presente nelle #nJoins, la aggiungo
      this.#fields.set(this.#field.get(token).tableAlias, {
        [token]: this.#field.get(token)
      });
    } else {
      // alias di tabella già presente
      this.#fields.get(this.#field.get(token).tableAlias)[token] = this.#field.get(token);
    }
    console.log('#fields : ', this.#fields);
  }

  get fields() { return this.#fields; }

  set nJoin(object) {
    // this.#nJoin.set(object.token, { table: object.table, alias: object.alias, from: object.from, to: object.to });
    this.#nJoin.set(object.token, object.value);
    console.log('#nJoin :', this.#nJoin);
  }

  get nJoin() { return this.#nJoin; }

  set nJoins(token) {
    if (!this.#nJoins.has(this.#nJoin.get(token).alias)) {
      // alias tabella non presente nelle #nJoins, la aggiungo
      this.#nJoins.set(this.#nJoin.get(token).alias, {
        [token]: this.#nJoin.get(token)
      });
    } else {
      // alias di tabella già presente
      this.#nJoins.get(this.#nJoin.get(token).alias)[token] = this.#nJoin.get(token);
    }
    console.log('#nJoins : ', this.#nJoins);
  }

  get nJoins() { return this.#nJoins; }

  set nHier(value) {
    this.#nHier.set(value.name, value.hierarchies);
    console.log(this.#nHier);
  }

  get nHier() { return this.#nHier; }

  set tablesMap(value) {
    this.#tablesMap.set(value.name, value.joinTables);
    console.log(this.#tablesMap);
  }

  get tablesMap() { return this.#tablesMap; }

  // qui viene memorizzato solo le tabelle che hanno almeno una colonna impostata nel workbook
  /* set nTables(value) {
    this.#nTables.set(value.table, value.alias);
    console.log(this.#nTables);
  } 

  get nTables() { return this.#nTables; }*/

  set mapMetric(object) {
    this.#mapMetric.set(object.token, object.value);
  }

  get mapMetric() { return this.#mapMetric; }

  set mapMetrics(token) {
    if (!this.#mapMetrics.has(this.#mapMetric.get(token).workBook.tableAlias)) {
      this.#mapMetrics.set(this.#mapMetric.get(token).workBook.tableAlias, {
        [token]: this.#mapMetric.get(token)
      });
    } else {
      // alias di tabella già presente
      this.#mapMetrics.get(this.#mapMetric.get(token).workBook.tableAlias)[token] = this.#mapMetric.get(token);
    }
    console.log('#mapMetrics : ', this.#mapMetrics);
  }

  get mapMetrics() { return this.#mapMetrics; }

  save() {
    this.workBook.fields = Object.fromEntries(this.fields);
    this.workBook.joins = Object.fromEntries(this.nJoins);
    this.workBook.tablesMap = Object.fromEntries(this.tablesMap);
    this.workBook.metrics = Object.fromEntries(this.mapMetrics);
    this.workBook.svg = {
      tables: Object.fromEntries(Draw.tables),
      lines: Object.fromEntries(Draw.joinLines),
      levelId: +Draw.svg.dataset.level
    }
    console.info('WorkBook : ', this.workBook);
    Storage.save(this.workBook);
  }
}
