// nella Class Sheets verranno aggiunti gli oggetti che consentono di creare il report.
/*
Es. : Quando viene aggiunta un campo alla dropzone 'rows' (questo è già presente in WorkSheets o la sua derivata) il campo
  * verrà aggiunto alla Sheets (tramite l'istanza Sheet per ogni nuovo report da creare) e quindi diventa 'disponibile'
  * per essere processato da MapDatabaseController -> Cube.php
*/
class Sheets {
  #fields = new Map();
  #tables = new Set(); // tutte le tabelle usate nel report. In base a questo Set() posso creare la from e la where
  #from = new Map(); // #from e #joins e #tables dovranno essere presenti nella Sheets eperchè sono proprietà necessarie per processare il report
  #filters = new Map(); // #from e #joins e #tables dovranno essere presenti nella Sheets eperchè sono proprietà necessarie per processare il report
  #metrics = new Map(); // #from e #joins e #tables dovranno essere presenti nella Sheets eperchè sono proprietà necessarie per processare il report
  #advMetrics = new Map(); // #from e #joins e #tables dovranno essere presenti nella Sheets eperchè sono proprietà necessarie per processare il report
  #joins = new Map();
  #name;
  constructor(token, WorkBookToken) {
    // lo Sheet viene preparato qui, in base ai dati presenti nel WorkBook passato qui al Costruttore
    this.workBookToken = WorkBookToken;
    this.sheet = { token, type: 'Sheet', workBook_ref: WorkBookToken };
  }

  set name(value) {
    this.#name = value;
  }

  get name() { return this.#name; }

  set tables(value) {
    this.#tables.add(value);
  }

  get tables() { return this.#tables; }

  // passaggio del token e recupero del field in WorkSheet tramite l'oggetto WorkBook passato al Costruttore
  set fields(object) {
    /* qui viene creato, all'interno dell'oggetto Map() un nuovo oggetto, quindi, le modifiche
    * fatte sui fields non influiscono sui fields della Classe WorkBooks/Sheets.
    * TODO: questa logica può essere provata (ed utilizzata) anche su Sheet.metrics, dove, attualmente 
    * l'oggettto viene creato nel metodo rowDrop()
    */
    this.#fields.set(object.token, {
      field: object.field,
      tableAlias: object.tableAlias,
      name: object.name
    });
    console.info('this.#fields : ', this.#fields);
  }

  set filters(object) {
    this.#filters.set(object.token, object);
    console.info('this.#filters : ', this.#filters);
  }

  get filters() { return this.#filters; }

  set metrics(object) {
    this.#metrics.set(object.token, object.value);
    console.info('this.#metrics : ', this.#metrics);
  }

  get metrics() { return this.#metrics; }

  set advMetrics(object) {
    this.#advMetrics.set(object.token, object.value);
    console.info('this.#advMetrics : ', this.#advMetrics);
  }

  get advMetrics() { return this.#advMetrics; }

  get fields() { return this.#fields; }

  set from(object) {
    this.#from.set(object.alias, { schema: object.schema, table: object.table });
    console.info('this.#from : ', this.#from);
  }

  get from() { return this.#from; }

  // recupero la join dalla Proprietà join della classe WorkBook (quindi da this.workBook passato al Costruttore)
  set joins(objects) {
    // objects può contenere più join, quindi deve essere ciclato
    for (const [token, join] of Object.entries(objects)) {
      /* TODO: valutare se passare tutto l'oggetto oppure solo la proprieta SQL.
        - Passando tutto l'oggetto posso avere più controllo su cosa costruire nella query.
        - Passando solo l'array SQL, in php, posso utilizzare solo implode('=', join)
        Al momento passo tutto l'oggetto
      */
      this.#joins.set(token, join);
      // this.#joins.set(token, join.SQL);
    }
    console.info('this.#joins : ', this.#joins);
  }

  get joins() { return this.#joins; }

  save() {
    this.sheet.name = this.name;
    this.sheet.fields = Object.fromEntries(this.fields);
    this.sheet.from = Object.fromEntries(this.from);
    this.sheet.joins = Object.fromEntries(this.joins);
    this.sheet.workBook_ref = this.workBookToken;
    /* WARN : verifica dei filtri del report.
      * Se non sono presenti ma sono presenti in metriche filtrate elaboro comunque il report
      * altrimenti visualizzo un AVVISO perchè l'esecuzione potrebbe essere troppo lunga
    */
    this.sheet.filters = Object.fromEntries(this.filters);
    if (this.metrics.size > 0) this.sheet.metrics = Object.fromEntries(this.metrics);
    if (this.advMetrics.size > 0) this.sheet.advMetrics = Object.fromEntries(this.advMetrics);
    console.info(this.sheet);
    SheetStorage.save(this.sheet);
  }

  open() {
    // il token è presente all'interno dell'oggetto sheet

    // recupero dallo storage il workBook, tutte le sue proprietà le caricherò nella Classe 
    // reimposto la Classe
    SheetStorage.sheet = this.sheet.token;
    this.name = SheetStorage.sheet.name;

    for (const [token, object] of Object.entries(SheetStorage.sheet.fields)) {
      this.fields = {
        token,
        field: object.field,
        tableAlias: object.tableAlias,
        name: object.name
      };
    }

    // from
    for (const [tableAlias, object] of Object.entries(SheetStorage.sheet.from)) {
      this.from = {
        alias: tableAlias,
        schema: object.schema,
        table: object.table
      }
    }

    // filters
    for (const [token, object] of Object.entries(SheetStorage.sheet.filters)) {
      this.filters = {
        token,
        field: object.field,
        name: object.name,
        sql: object.sql,
        workBook: {
          table: object.workBook.table,
          tableAlias: object.workBook.tableAlias
        }
      }
    }

    // joins
    /* TODO: valutare la possibilitò di aggiungere proprietà (fields, filters, ecc...) alla Classe Sheets così come ho fatto per joins
    * quindi con una sola riga re-imposto le joins dello Sheet
    */
    this.joins = SheetStorage.sheet.joins;

    for (const [token, object] of Object.entries(SheetStorage.sheet.metrics)) {
      this.metrics = {
        token,
        value: {
          alias: object.alias,
          formula: object.formula,
          workBook: {
            table: object.workBook.table,
            tableAlias: object.workBook.tableAlias
          }

        }
      }
    }


    return this;
  }


}

class WorkBooks {
  #activeTable;
  #field = new Map();
  #fields = new Map();
  #metric = new Map();
  #metrics = new Map();
  #join = new Map();
  #joins = new Map();
  // #nTables = new Map();
  // #hierarchies = new Map();
  #tableJoins = { from: null, to: null }; // refs 
  #tablesMap = new Map(); // elenco di tutte le tabelle del canvas con le relative tabelle discendenti (verso la fact)
  #hierTables = new Map(); // elenco di tutte le tabelle del canvas con le relative tabelle discendenti (verso la fact)
  constructor(name) {
    const rand = () => Math.random(0).toString(36).substring(2);
    this.token = rand().substring(0, 7);
    console.log(this.token);
    this.workBook = { token: this.token, type: 'WorkBook', name: name, workSheet: {} };
    this.sheet = { name: `WorkSheet_${name}` };
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

  // 'field/s' colonne create in fase di Mapping (quindi aggiunte al WorkBook)
  set field(object) {
    this.#field.set(object.token, object.value);
  }

  get field() { return this.#field; }

  set fields(token) {
    if (!this.#fields.has(this.#field.get(token).tableAlias)) {
      // alias tabella non presente nelle #fields, la aggiungo
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

  set join(object) {
    // this.#join.set(object.token, { table: object.table, alias: object.alias, from: object.from, to: object.to });
    this.#join.set(object.token, object.value);
    console.log('#join :', this.#join);
  }

  get join() { return this.#join; }

  set joins(token) {
    if (!this.#joins.has(this.#join.get(token).alias)) {
      // alias tabella non presente nelle #joins, la aggiungo
      this.#joins.set(this.#join.get(token).alias, {
        [token]: this.#join.get(token)
      });
    } else {
      // alias di tabella già presente
      this.#joins.get(this.#join.get(token).alias)[token] = this.#join.get(token);
    }
    console.log('#joins : ', this.#joins);
  }

  get joins() { return this.#joins; }

  /* set hierarchies(value) {
    this.#hierarchies.set(value.name, value.hierarchies);
    console.log(this.#hierarchies);
  }

  get hierarchies() { return this.#hierarchies; } */

  set tablesMap(value) {
    this.#tablesMap.set(value.name, value.joinTables);
    console.log('this.#tablesMap : ', this.#tablesMap);
  }

  get tablesMap() { return this.#tablesMap; }

  set hierTables(value) {
    this.#hierTables.set(value.id, value.table);
    console.log('this.#hierTables : ', this.#hierTables);
  }

  get hierTables() { return this.#hierTables; }

  // qui viene memorizzato solo le tabelle che hanno almeno una colonna impostata nel workbook
  /* set nTables(value) {
    this.#nTables.set(value.table, value.alias);
    console.log(this.#nTables);
  } 

  get nTables() { return this.#nTables; }*/

  set metric(object) {
    this.#metric.set(object.token, object.value);
  }

  get metric() { return this.#metric; }

  set metrics(token) {
    if (!this.#metrics.has(this.#metric.get(token).workBook.tableAlias)) {
      this.#metrics.set(this.#metric.get(token).workBook.tableAlias, {
        [token]: this.#metric.get(token)
      });
    } else {
      // alias di tabella già presente
      this.#metrics.get(this.#metric.get(token).workBook.tableAlias)[token] = this.#metric.get(token);
    }
    console.log('#metrics : ', this.#metrics);
  }

  get metrics() { return this.#metrics; }

  save() {
    this.workBook.fields = Object.fromEntries(this.fields);
    this.workBook.joins = Object.fromEntries(this.joins);
    this.workBook.tablesMap = Object.fromEntries(this.tablesMap);
    this.workBook.metrics = Object.fromEntries(this.metrics);
    // nell'oggetto WorkSheet andrò a memorizzare gli elementi aggiunti nel WorkSheet (es.: metriche/colonne custom)
    // metriche avanzate sono presenti solo nello WorkSheet e non nel WorkBook
    if (this.advMetrics.size !== 0) this.workBook.workSheet.advMetrics = Object.fromEntries(this.advMetrics);
    if (this.filters.size !== 0) this.workBook.workSheet.filters = Object.fromEntries(this.filters);
    this.workBook.svg = {
      tables: Object.fromEntries(Draw.tables),
      lines: Object.fromEntries(Draw.joinLines),
      levelId: +Draw.svg.dataset.level
    }
    console.info('WorkBook : ', this.workBook);
    WorkBookStorage.save(this.workBook);
  }

}

class WorkSheets extends WorkBooks {
  /*
  * in quesa classe andrò ad inserire tutti gli elementi (metriche filtrate, composte, colonne custom SQL, ad es. quelle concatenate) 
  * che saranno poi disponibili per poter crear il report.
  * Quando un filtro viene aggiunto al report (Sheets) lo recupero da questa classe e lo copio nella proprietà 'filters' della classe Sheets.
  * Stesso discorso per le metriche e le colonne.
  * Questa classe, e la sua derivata, sono disponibili come Modello per la creazione del report.
  */

  /* 
  TODO: come per le colonne.
    * Potrei avere filtri creati in fase di mapping e filtri creati nel WorkSheet (Questo è da implementare)
    * Al momento ho filtri solo nel WorkSheet e non nel WorkBook
  */
  #filter = new Map();
  #filters = new Map();
  // #metrics = new Map();
  #advMetrics = new Map();
  #columns = new Map();
  constructor(name) {
    super(name);
  }

  set columns(token) {
    this.#columns.set(token, this.field.get(token));
    console.log('sheet columns : ', this.#columns);
  }

  get columns() { return this.#columns; }

  /* set metrics(object) {
    this.#metrics.set(object.token, object.value);
    console.log('sheet metrics : ', this.#metrics);
  }

  get metrics() { return this.#metrics; } */

  set advMetrics(object) {
    this.#advMetrics.set(object.token, object.value);
    console.log('sheet advMetrics : ', this.#advMetrics);
  }

  get advMetrics() { return this.#advMetrics; }

  set filter(object) {
    this.#filter.set(object.token, object.value);
  }

  get filter() { return this.#filter; }

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

  open(token) {
    // recupero dallo storage il workBook, tutte le sue proprietà le caricherò nella Classe 
    WorkBookStorage.workBook = token;
    WorkBookStorage.workBook;
    // reimposto la Classe

    Draw.svg.dataset.level = WorkBookStorage.workBook.svg.levelId;
    // ciclo sulle tables presenti in svg.tables
    for (const [key, value] of Object.entries(WorkBookStorage.workBook.svg.tables)) {
      Draw.tables = { id: key, properties: value };
      Draw.currentTable = Draw.tables.get(key);
      Draw.drawTable();
    }

    for (const [key, value] of Object.entries(WorkBookStorage.workBook.svg.lines)) {
      Draw.joinLines = { id: key, properties: value };
      // TODO: creare una funzione (qui o in DrawSVG) che crea la linea
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      line.id = key;
      line.dataset.id = value.id;
      Draw.svg.appendChild(line);
      Draw.currentLineRef = key;
      Draw.currentLine = value;
      Draw.drawLine();
      Draw.autoPositionLine();
    }

    for (const [tableAlias, values] of Object.entries(WorkBookStorage.workBook.fields)) {
      // per ogni tabella
      for (const [token, column] of Object.entries(values)) {
        super.field = { token, value: column };
        super.fields = token;
      }
    }

    // joins
    for (const [tableAlias, values] of Object.entries(WorkBookStorage.workBook.joins)) {
      // per ogni tabella
      for (const [token, join] of Object.entries(values)) {
        super.join = { token, value: join };
        super.joins = token;
      }
    }
    // filtri aggiunti allo WorkSheet
    for (const [tableAlias, values] of Object.entries(WorkBookStorage.workBook.workSheet.filters)) {
      // per ogni tabella
      for (const [token, filter] of Object.entries(values)) {
        this.filter = { token, value: filter };
        this.filters = token;
      }
    }

    // metriche aggiunte allo WorkSheet
    for (const [tableAlias, values] of Object.entries(WorkBookStorage.workBook.metrics)) {
      // per ogni tabella
      for (const [token, metric] of Object.entries(values)) {
        this.metric = { token, value: metric };
        this.metrics = token;
      }
    }

    // metriche avanzate aggiunte allo WorkSheet
    for (const [token, advMetric] of Object.entries(WorkBookStorage.workBook.workSheet.advMetrics)) {
      // per ogni tabella
      this.advMetrics = { token, value: advMetric };
    }

    return this;
  }

}
