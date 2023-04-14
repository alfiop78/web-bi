// nella Class Sheets verranno aggiunti gli oggetti che consentono di creare il report.
class Sheets {
  #fields = new Map();
  #tables = new Set(); // tutte le tabelle usate nel report. In base a questo Set() posso creare la from e la where
  #from = new Map(); // #from e #joins e #tables dovranno essere presenti nella Sheets eperchè sono proprietà necessarie per processare il report
  #filters = new Set();
  #metrics = new Map();
  #advMetrics = new Map();
  #compositeMetrics = new Map();
  #joins = new Map();
  #name;
  #id;
  constructor(token, WorkBookToken) {
    // lo Sheet viene preparato qui, in base ai dati presenti nel WorkBook passato qui al Costruttore
    this.workBookToken = WorkBookToken;
    this.sheet = { token, type: 'Sheet', workBook_ref: WorkBookToken };
  }

  set name(value) {
    this.#name = value;
  }

  get name() { return this.#name; }

  set id(timestamp) {
    this.#id = timestamp;
  }

  get id() { return this.#id; }

  set tables(value) {
    this.#tables.add(value);
  }

  get tables() { return this.#tables; }

  // passaggio del token e recupero del field in WorkSheet tramite l'oggetto WorkBook passato al Costruttore
  set fields(object) {
    this.#fields.set(object.token, object.name);
    console.info('this.#fields : ', this.#fields);
  }

  get fields() { return this.#fields; }

  set filters(token) {
    this.#filters.add(token);
    console.info('this.#filters : ', this.#filters);
  }

  get filters() { return this.#filters; }

  set metrics(object) {
    this.#metrics.set(object.token, object);
    // this.#metrics.set(object.token, { name: object.name, type: object.metric_type, aggregateFn: object.aggregateFn });
    console.info('sheet.#metrics : ', this.#metrics);
  }

  get metrics() { return this.#metrics; }

  set advMetrics(object) {
    this.#advMetrics.set(object.token, object);
    console.info('this.#advMetrics : ', this.#advMetrics);
  }

  get advMetrics() { return this.#advMetrics; }

  set compositeMetrics(object) {
    this.#compositeMetrics.set(object.token, object);
    console.info('this.#compositeMetrics : ', this.#compositeMetrics);
  }

  get compositeMetrics() { return this.#compositeMetrics; }

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
    this.sheet.id = this.id;
    this.sheet.name = this.name;
    this.sheet.fields = Object.fromEntries(this.fields);
    this.sheet.from = Object.fromEntries(this.from);
    this.sheet.joins = Object.fromEntries(this.joins);
    this.sheet.workBook_ref = this.workBookToken;
    /* WARN : verifica dei filtri del report.
      * Se non sono presenti ma sono presenti in metriche filtrate elaboro comunque il report
      * altrimenti visualizzo un AVVISO perchè l'esecuzione potrebbe essere troppo lunga
    */
    this.sheet.filters = [...this.filters];
    for (const [token, metric] of this.metrics) {
      switch (metric.type) {
        case 'basic':
          (!this.sheet.hasOwnProperty('metrics')) ? this.sheet.metrics = { [token]: metric } : this.sheet.metrics[token] = metric;
          break;
        case 'advanced':
          (!this.sheet.hasOwnProperty('advMetrics')) ? this.sheet.advMetrics = { [token]: metric } : this.sheet.advMetrics[token] = metric;
          break;
        default:
          // compositeMetrics
          (!this.sheet.hasOwnProperty('compositeMetrics')) ? this.sheet.compositeMetrics = { [token]: metric } : this.sheet.compositeMetrics[token] = metric;
          // this.sheet.compositeMetrics[token] = metric;
          break;
      }
    }
    // if (this.metrics.size > 0) this.sheet.metrics = Object.fromEntries(this.metrics);
    // if (this.advMetrics.size > 0) this.sheet.advMetrics = Object.fromEntries(this.advMetrics);
    // if (this.compositeMetrics.size > 0) this.sheet.compositeMetrics = Object.fromEntries(this.compositeMetrics);
    console.info(this.sheet);
    SheetStorage.save(this.sheet);
  }

  open() {
    // il token è presente all'interno dell'oggetto sheet

    // recupero dallo storage il workBook, tutte le sue proprietà le caricherò nella Classe 
    // reimposto la Classe
    SheetStorage.sheet = this.sheet.token;
    this.name = SheetStorage.sheet.name;
    this.id = SheetStorage.sheet.id;

    for (const [token, field] of Object.entries(SheetStorage.sheet.fields)) {
      debugger;
      this.fields = { token, name: field };
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
    for (const [token, filter] of Object.entries(SheetStorage.sheet.filters)) {
      this.filters = filter;
    }

    // joins
    /* TODO: valutare la possibilitò di aggiungere proprietà (fields, filters, ecc...) alla Classe Sheets così come ho fatto per joins
    * quindi con una sola riga re-imposto le joins dello Sheet
    */
    this.joins = SheetStorage.sheet.joins;

    if (SheetStorage.sheet.hasOwnProperty('metrics')) {
      for (const value of Object.values(SheetStorage.sheet.metrics)) {
        this.metrics = value;
      }
    }

    if (SheetStorage.sheet.hasOwnProperty('advMetrics')) {
      for (const value of Object.values(SheetStorage.sheet.advMetrics)) {
        this.metrics = value;
      }
    }

    if (SheetStorage.sheet.hasOwnProperty('compositeMetrics')) {
      for (const value of Object.values(SheetStorage.sheet.compositeMetrics)) {
        this.metrics = value;
      }
    }

    return this;
  }


}

class WorkBooks {
  #activeTable;
  #field = new Map();
  #fields = new Map();
  #filters = new Map();
  #metrics = new Map();
  #join = new Map();
  #joins = new Map();
  #dateTime;
  // #nTables = new Map();
  // #hierarchies = new Map();
  #tableJoins = { from: null, to: null }; // refs 
  #tablesMap = new Map(); // elenco di tutte le tabelle del canvas con le relative tabelle discendenti (verso la fact)
  #hierTables = new Map(); // elenco di tutte le tabelle del canvas con le relative tabelle discendenti (verso la fact)
  constructor(name) {
    const rand = () => Math.random(0).toString(36).substring(2);
    this.token = rand().substring(0, 7);
    console.log(this.token);
    this.title = name;
    this.workBook = { token: this.token, type: 'WorkBook' };
    this.schema;
  }

  set name(value) {
    this.title = value;
  }

  get name() { return this.title; }

  set tableJoins(object) {
    this.#tableJoins.from = Draw.svg.querySelector(`#${object.from}`);
    this.#tableJoins.to = Draw.svg.querySelector(`#${object.to}`);
  }

  get tableJoins() { return this.#tableJoins; }

  set dateTime(object) {
    this.#dateTime = object;
  }

  get dateTime() { return this.#dateTime; }

  set activeTable(id) {
    // id : `svg-data-x`
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
    // console.log('#fields : ', this.#fields);
  }

  get fields() { return this.#fields; }

  set join(object) {
    // this.#join.set(object.token, { table: object.table, alias: object.alias, from: object.from, to: object.to });
    this.#join.set(object.token, object.value);
    // console.log('#join :', this.#join);
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
    // console.log('#joins : ', this.#joins);
  }

  get joins() { return this.#joins; }

  set filters(object) {
    this.#filters.set(object.token, object.value);
  }

  get filters() { return this.#filters; }

  /* set hierarchies(value) {
    this.#hierarchies.set(value.name, value.hierarchies);
    console.log(this.#hierarchies);
  }

  get hierarchies() { return this.#hierarchies; } */

  set tablesMap(value) {
    this.#tablesMap.set(value.name, value.joinTables);
    // console.log('this.#tablesMap : ', this.#tablesMap);
  }

  get tablesMap() { return this.#tablesMap; }

  set hierTables(value) {
    this.#hierTables.set(value.id, value.table);
    // console.log('this.#hierTables : ', this.#hierTables);
  }

  get hierTables() { return this.#hierTables; }

  // qui viene memorizzato solo le tabelle che hanno almeno una colonna impostata nel workbook
  /* set nTables(value) {
    this.#nTables.set(value.table, value.alias);
    console.log(this.#nTables);
  } 

  get nTables() { return this.#nTables; }*/

  set metrics(object) {
    this.#metrics.set(object.token, object);
    console.log('workBook Metrics : ', this.#metrics);
  }

  get metrics() { return this.#metrics; }

  save() {
    this.workBook.name = this.title;
    this.workBook.fields = Object.fromEntries(this.fields);
    this.workBook.joins = Object.fromEntries(this.joins);
    this.workBook.tablesMap = Object.fromEntries(this.tablesMap);
    this.workBook.dateTime = this.dateTime;
    // this.workBook.metrics = Object.fromEntries(this.metrics);
    this.workBook.svg = {
      tables: Object.fromEntries(Draw.tables),
      lines: Object.fromEntries(Draw.joinLines),
      levelId: +Draw.svg.dataset.level
    }
    // nell'oggetto WorkSheet andrò a memorizzare gli elementi aggiunti nel WorkSheet (es.: metriche/colonne custom)
    // metriche avanzate sono presenti solo nello WorkSheet e non nel WorkBook
    if (this.filters.size !== 0) this.workBook.filters = Object.fromEntries(this.filters);
    // if (this.advMetrics.size !== 0) this.workSheet.advMetrics = Object.fromEntries(this.advMetrics);
    // if (this.compositeMetrics.size !== 0) this.workSheet.compositeMetrics = Object.fromEntries(this.compositeMetrics);
    for (const [token, metric] of this.metrics) {
      switch (metric.metric_type) {
        case 'basic':
          (!this.workBook.hasOwnProperty('metrics')) ? this.workBook.metrics = { [token]: metric } : this.workBook.metrics[token] = metric;
          break;
        case 'advanced':
          (!this.workBook.hasOwnProperty('advMetrics')) ? this.workBook.advMetrics = { [token]: metric } : this.workBook.advMetrics[token] = metric;
          break;
        default:
          // compositeMetrics
          (!this.workBook.hasOwnProperty('compositeMetrics')) ? this.workBook.compositeMetrics = { [token]: metric } : this.workBook.compositeMetrics[token] = metric;
          break;
      }
    }
    console.info('WorkBook : ', this.workBook);
    WorkBookStorage.save(this.workBook);
  }

  open(token) {
    // TODO: ottimizzare
    // recupero dallo storage il workBook, tutte le sue proprietà le caricherò nella Classe 
    WorkBookStorage.workBook = token;
    // reimposto la Classe

    this.dateTime = WorkBookStorage.workBook.dateTime;

    Draw.svg.dataset.level = WorkBookStorage.workBook.svg.levelId;
    // ciclo sulle tables presenti in svg.tables
    for (const [key, value] of Object.entries(WorkBookStorage.workBook.svg.tables)) {
      Draw.tables = { id: key, properties: value };
      Draw.currentTable = Draw.tables.get(key);
      (key === 'svg-data-web_bi_time') ? Draw.drawTime() : Draw.drawTable();
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
        this.field = { token, value: column };
        this.fields = token;
      }
    }

    // joins
    for (const [tableAlias, values] of Object.entries(WorkBookStorage.workBook.joins)) {
      // per ogni tabella
      for (const [token, join] of Object.entries(values)) {
        this.join = { token, value: join };
        this.joins = token;
      }
    }
    // filtri aggiunti allo WorkSheet
    // TODO: da recuperare dallo storage
    /* if (WorkBookStorage.workSheet.hasOwnProperty('filters')) {
      for (const [token, filter] of Object.entries(WorkBookStorage.workSheet.filters)) {
        this.filters = { token, value: filter };
      }
    }*/

    for (const [token, filter] of Object.entries(WorkBookStorage.storage)) {
      this.json = JSON.parse(filter);
      if (this.json.type === 'filter' && this.json.workbook_ref === WorkBookStorage.workBook.token) {
        this.filters = { token, value: this.json };
      }
    }


    if (WorkBookStorage.workBook.hasOwnProperty('metrics')) {
      debugger;
      for (const value of Object.values(WorkBookStorage.workBook.metrics)) {
        this.metrics = value;
      }
    }

    // metriche avanzate aggiunte allo WorkSheet
    /*if (WorkBookStorage.workSheet.hasOwnProperty('advMetrics')) {
      for (const value of Object.values(WorkBookStorage.workSheet.advMetrics)) {
        // per ogni tabella
        this.metrics = value;
      }
    }

    // metriche composite aggiunte allo WorkSheet
    if (WorkBookStorage.workSheet.hasOwnProperty('compositeMetrics')) {
      for (const value of Object.values(WorkBookStorage.workSheet.compositeMetrics)) {
        // per ogni tabella
        this.metrics = value;
      }
    }*/

    return this;
  }

}
