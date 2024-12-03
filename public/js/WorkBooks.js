// nella Class Sheets verranno aggiunti gli oggetti che consentono di creare il report.
class Sheets {
  #fields = new Map();
  #tables = new Set(); // tutte le tabelle usate nel report. In base a questo Set() posso creare la from e la where
  #filters = new Set();
  #metrics = new Map();
  #id;
  constructor(name, token, WorkBookToken) {
    // lo Sheet viene preparato qui, in base ai dati presenti nel WorkBook passato qui al Costruttore
    // this.workBookToken = WorkBookToken;
    this.options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
    this.sheet = { token, type: 'sheet', workbook_ref: WorkBookToken, sheet: {}, specs: {} };
    this.name = name;
    // mappo gli elmenti rimossi dal report in fase di edit. Questo mi consentirà
    // di stabilire se aggiornare "updated_at" del report oppure no
    this.objectRemoved = new Map();
    this.fact = new Set(); // le fact utilizzate nel report
    this.from = {}, this.joins = {}, this.measures = {}; // #from e #joins e #tables dovranno essere presenti nella Sheets eperchè sono proprietà necessarie per processare il report
  }

  // TODO: molti di questi setter/getter posso crearli come magicMethod

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
    this.#fields.set(object.token, {
      name: object.name,
      SQL: object.SQL,
      time: object.time,
      datatype: object.datatype
    });
    // console.info('Sheet.#fields : ', this.#fields);
  }

  get fields() { return this.#fields; }

  set filters(token) {
    this.#filters.add(token);
    // console.info('this.#filters : ', this.#filters);
  }

  get filters() { return this.#filters; }

  set metrics(object) {
    this.#metrics.set(object.token, object);
  }

  get metrics() { return this.#metrics; }

  save() {
    this.sheet.sheet.fields = Object.fromEntries(this.fields);
    this.sheet.sheet.from = this.from;
    this.sheet.sheet.joins = this.joins;
    // this.sheet.from = Object.fromEntries(this.from);
    // this.sheet.joins = Object.fromEntries(this.joins);
    this.sheet.workbook_ref = this.sheet.workbook_ref;
    /* WARN : verifica dei filtri del report.
      * Se non sono presenti ma sono presenti in metriche filtrate elaboro comunque il report
      * altrimenti visualizzo un AVVISO perchè l'esecuzione potrebbe essere troppo lunga
    */
    this.sheet.sheet.filters = [...this.filters];
    // reset delle metriche
    delete this.sheet.sheet.metrics;
    delete this.sheet.sheet.advMetrics;
    delete this.sheet.sheet.compositeMetrics;

    for (const [token, metric] of this.metrics) {
      switch (metric.type) {
        case 'basic':
          (!this.sheet.sheet.hasOwnProperty('metrics')) ? this.sheet.sheet.metrics = { [token]: metric } : this.sheet.sheet.metrics[token] = metric;
          break;
        case 'advanced':
          (!this.sheet.sheet.hasOwnProperty('advMetrics')) ? this.sheet.sheet.advMetrics = { [token]: metric } : this.sheet.sheet.advMetrics[token] = metric;
          break;
        default:
          // compositeMetrics
          (!this.sheet.sheet.hasOwnProperty('compositeMetrics')) ? this.sheet.sheet.compositeMetrics = { [token]: metric } : this.sheet.sheet.compositeMetrics[token] = metric;
          // this.sheet.compositeMetrics[token] = metric;
          break;
      }
    }
    debugger;
  }

  // il tasto Aggiorna deve essere attivato solo quando ci sono delle modifiche fatte
  // OPTIMIZE: il codice si ripete in update() e in save()
  update() {
    this.sheet.name = this.name;
    this.sheet.facts = [...this.fact];
    this.sheet.userId = this.userId;
    this.sheet.updated_at = new Date().toLocaleDateString('it-IT', this.options);
    this.save();
    console.info('sheet:', this.sheet);
    SheetStorage.save(this.sheet);
  }

  create() {
    this.sheet.id = Date.now();
    this.sheet.userId = this.userId;
    this.sheet.name = this.name;
    this.sheet.facts = [...this.fact];
    this.sheet.created_at = new Date().toLocaleDateString('it-IT', this.options);
    this.sheet.updated_at = new Date().toLocaleDateString('it-IT', this.options);
    this.save();
    console.info('sheet:', this.sheet);
    debugger;
    SheetStorage.save(this.sheet);
  }

  open() {
    // il token è presente all'interno dell'oggetto sheet

    // recupero dallo storage il workBook, tutte le sue proprietà le caricherò nella Classe
    // reimposto la Classe
    SheetStorage.sheet = this.sheet.token;
    this.name = SheetStorage.sheet.name;
    this.sheet.id = SheetStorage.sheet.id;
    this.userId = SheetStorage.sheet.userId;
    this.sheet.created_at = SheetStorage.sheet.created_at;
    this.sheet.updated_at = SheetStorage.sheet.updated_at;

    for (const [token, object] of Object.entries(SheetStorage.sheet.sheet.fields)) {
      this.fields = { token, SQL: object.SQL, name: object.name, datatype: object.datatype, time: (object.time) ? { table: object.table } : false };
    }

    // from
    // TODO: la proprietà 'from' viene ricreata, in setSheet() quindi potrei NON metterla qui
    this.from = SheetStorage.sheet.sheet.from;

    // filters
    for (const [token, filter] of Object.entries(SheetStorage.sheet.sheet.filters)) {
      this.filters = filter;
    }

    // joins
    /* TODO: valutare la possibilitò di aggiungere proprietà (fields, filters, ecc...) alla Classe Sheets così come ho fatto per joins
    * quindi con una sola riga re-imposto le joins dello Sheet
    */
    this.joins = SheetStorage.sheet.sheet.joins;

    if (SheetStorage.sheet.sheet.hasOwnProperty('metrics')) {
      for (const value of Object.values(SheetStorage.sheet.sheet.metrics)) {
        this.metrics = value;
      }
    }

    if (SheetStorage.sheet.sheet.hasOwnProperty('advMetrics')) {
      for (const value of Object.values(SheetStorage.sheet.sheet.advMetrics)) {
        this.metrics = value;
      }
    }

    if (SheetStorage.sheet.sheet.hasOwnProperty('compositeMetrics')) {
      for (const value of Object.values(SheetStorage.sheet.sheet.compositeMetrics)) {
        this.metrics = value;
      }
    }

    return this;
  }

  async exist() {
    App.showConsole('Verifica in corso...', null, null);
    return await fetch(`/fetch_api/${this.sheet.id}_${this.userId}/check_datamart`)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.text())
      .then(response => {
        App.closeConsole();
        if (!response) App.showConsole('Datamart non presente', 'warning', 1500);
        return response;
      })
      .catch(err => {
        console.error(err);
      });
  }

  delete() {
    return fetch(`/fetch_api/${this.sheet.id}_${this.userId}/delete_datamart`)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.text())
      .then(response => response)
      .catch(err => {
        console.error(err);
      });
  }

  // Verifica se un campo, in un report con più Fact, può essere aggiunto al Report.
  // In un report con più Fact, i livelli dimensionali "inferiori" alla tabella in comune
  // non può essere aggiunto.
  // Es. : Dimensione Azienda -> sede -> DocVenditaIntestazione
  // Tabella in comune tra due fact : Azienda
  // I campi delle tabelle Sede e DocVenditaIntestazione NON possono essere legate ad entrambe le Fact
  checkMultiFactFields(token) {
    let result = true;
    if (this.fact.size > 1) {
      result = [...this.fact].every(fact => (WorkBook.dataModel.get(fact).hasOwnProperty(WorkBook.field.get(token).tableAlias)));
      // console.log(result);
    }
    return result;
  }

  checkMetricNames(token, alias) {
    // verifico se ci sono nomi di metriche duplicati
    for (const value of this.metrics.values()) {
      // utilizzo il token per saltare il controllo (in this.metric) sulla
      // metrica che si sta aggiungendo
      if (token !== value.token) {
        if (value.alias.toLowerCase() === alias.toLowerCase()) return true;
      }
    }
    return false;
  }

  getInformations() {
    // popolo le informazioni per poter essere inserite nel BoxInfo
    // il nome delle key deve corrispondere al nome del div nel DOM
    let info = {
      info__token: this.sheet.token,
      info__name: this.name,
      info__created_at: this.sheet.created_at,
      info__updated_at: this.sheet.updated_at
    }
    if (this.sheet.id) info.info__datamart_id = `decisyon_cache.WEB_BI_${this.sheet.id}_${this.userId}`;
    return info;
  }

}

class WorkBooks {
  #activeTable;
  #field = new Map();
  #elements = new Map();
  #customMetrics = new Map();
  #fields = new Map();
  #filters = new Map();
  #metrics = new Map();
  #join = new Map();
  #joins = new Map();
  #tableJoins = { from: null, to: null }; // refs
  #workbookMap = new Map();
  #dataModel = new Map();
  #hierTables = new Map(); // elenco di tutte le tabelle del canvas con le relative tabelle discendenti (verso la fact)
  #options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };

  constructor(name) {
    const rand = () => Math.random(0).toString(36).substring(2);
    this.token = rand().substring(0, 7);
    console.log(this.token);
    this.title = name;
    this.workBook = { token: this.token, type: 'workbook' };
    this.schema;
    // Intercetto le modifiche fatte al WorkBook per valutare se aggiornare o meno
    // la prop 'updated_at'
    this.workBookChange = new Set();
    this.edit = false;
    this.tablesModel = new Map();
    this.dateTime = {};
    this.timeFields = {
      WB_YEARS: {
        id: { sql: ['WB_YEARS.id'], datatype: 'integer' },
        ds: { sql: ['WB_YEARS.year'], datatype: 'char' }
      },
      WB_QUARTERS: {
        id: { sql: ['WB_QUARTERS.id'], datatype: 'integer' },
        ds: { sql: ['WB_QUARTERS.quarter'], datatype: 'char' }
      },
      WB_MONTHS: {
        id: { sql: ['WB_MONTHS.id'], datatype: 'integer' },
        ds: { sql: ['WB_MONTHS.month'], datatype: 'char' }
      },
      WB_DATE: {
        id: { sql: ['WB_DATE.id'], datatype: 'date' },
        ds: { sql: ['WB_DATE.date'], datatype: 'date' }
      }
    };

    this.workSheet = {};
  }

  set name(value) {
    this.title = value;
  }

  get name() { return this.title; }

  set elements(value) {
    this.#elements.set(value.token, value);
  }

  get elements() { return this.#elements; }

  set customMetrics(value) {
    this.#customMetrics.set(value.token, value);
  }

  get customMetrics() { return this.#customMetrics; }

  set tableJoins(object) {
    this.#tableJoins.from = Draw.svg.querySelector(`#${object.from}`);
    this.#tableJoins.to = Draw.svg.querySelector(`#${object.to}`);
  }

  get tableJoins() { return this.#tableJoins; }

  set activeTable(id) {
    // id : `svg-data-x`
    this.#activeTable = Draw.svg.querySelector(`#${id}`);
  }

  get activeTable() { return this.#activeTable; }

  // 'field/s' colonne create in fase di Mapping (quindi aggiunte al WorkBook)
  set field(object) {
    this.#field.set(object.token, object);
    // TODO: dati utili al sistema di log
    // console.log('field aggiunto : ', `${object.value.name} (${object.token})`);
    // console.log('Elenco #field : ', this.#field);
  }

  get field() { return this.#field; }

  set fields(object) {
    this.#fields.set(object.token, object);
  }

  get fields() { return this.#fields; }

  set join(object) {
    // this.#join.set(object.token, { table: object.table, alias: object.alias, from: object.from, to: object.to });
    this.#join.set(object.token, object.value);
    // console.log('#join :', this.#join);
  }

  get join() { return this.#join; }

  set joins(token) {
    // this.#joins.set(object.factId, {
    //   [this.#join.get(object.token).alias]: this.#join.get(object.token)
    // });

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

  // TODO: da valutare se salvare tutto il dataModel quando si salva il workbook oppure man mano che si aggiungono
  // tabelle al canvas
  createDataModel() {
    // questa viene invocata per mappare tutto il dataModel, quindi posso popolare qui anche workbookMap
    this.workbookMap = Draw.svg.querySelectorAll('use.table:not([data-shared_ref]), use.time');

    Draw.svg.querySelectorAll("use.table.fact:not([data-joins='0'])").forEach(fact => {
      let joinTables = [], tables = {}, originTables = [];
      let recursiveDimensionDown = (table) => {
        // table : svg-data-xxxx (questa è sempre la tabella "di origine" e mai quella .common)
        const tableRef = Draw.svg.querySelector(`use#${table}`);
        // Quando la tabella corrente è una .shared vuol dire che è una tabella condivisa
        // con più fact.
        // A questo punto, se sono in ciclo in una fact diversa da quella presente sulla
        // tabella passata (tableRef) devo recuperare la tabella appartenente alla Fact in ciclo
        // e che ha l'attributo data-shared_ref = tableRef.id
        const tableJoin = (tableRef.classList.contains('shared') && tableRef.dataset.factId !== fact.id) ?
          Draw.svg.querySelector(`use.table[data-fact-id='${fact.id}'][data-shared_ref='${tableRef.id}']`) :
          // Draw.svg.querySelector(`use.table.common[data-fact-id='${fact.id}'][data-shared_ref='${tableRef.id}']`) :
          Draw.svg.querySelector(`use.table#${table}`);
        // joinTables.push(tableJoin.dataset.alias);
        joinTables.push({ table: tableJoin.dataset.alias, id: tableJoin.id });
        if (tableJoin.dataset.tableJoin) recursiveDimensionDown(tableJoin.dataset.tableJoin);
      }
      // verifico se, per la fact corrente, ci sono tabelle (quindi dimensioni) clonate.
      // Se ci sono tabelle in comune tra più fact 'common' sarà !== undefined
      // FIX: il metodo find() restituisce solo la prima shared_ref trovata, se ci sono più tabelle messe in
      // comune, sulla stessa fact, bisogna implementare una logica diversa, con .filter() anzichè .find().
      // Probabilmente si deve ciclare anche la dimensione attraverso dimensionId
      const common = [...Draw.svg.querySelectorAll(`use.table[data-table-join][data-fact-id='${fact.id}']`)].find(table => table.dataset.shared_ref);
      if (common) {
        // nella Fact corrente (in ciclo) sono presenti dimensioni in comune con altre Fact.
        // In questo caso, recupero le tabelle gerarchicamente "superiori" a quella messa in comune.
        // es.: "CodSedeDealer" è stata messa in comune con altre Fact, quindi bisogna recuperare anche "Azienda" (livello superiore)
        originTables.push(common);
        // eseguo una funzione ricorsiva per poter recuperare tutte le tabelle gerarchicamente superiori
        // a partire dalla tabella clonata (messa in relazione con altre Fact)
        let recursiveDimensionUp = (tableId) => {
          // return : un array di tabelle che verranno ricorsivamente aggiunte (in 'recursive()') al dataModel
          Draw.svg.querySelectorAll(`use.table[data-table-join='${tableId}'][data-dimension-id='${common.dataset.dimensionId}']`).forEach(t => {
            originTables.push(t);
            recursiveDimension(t.id);
          });
        }
        recursiveDimensionUp(common.dataset.shared_ref);
        // verifico se esistono tabelle TIME appartenenti alla fact corrente
        // if (Draw.svg.querySelector(`use.time[data-fact-id='${fact.id}']`)) originTables.push(Draw.svg.querySelector(`use.time[data-fact-id='${fact.id}']`));
        // se sono presenti anche le tabelle time le aggiungo a originTables
        Draw.svg.querySelectorAll(`use.time[data-fact-id='${fact.id}']`).forEach(time => {
          originTables.push(time);
        });
      }
      // quando ci sono tabelle .common nella fact.id in ciclo, per poter mettere in relazione
      // la tabelle.common con la "propria" Fact devo recuperare le tabelle della dimensione
      // "di origine".
      // Successivamente, nel ciclo dimensionTables, vado ad invocare una funzione ricorsiva
      // che cerca le tabelle gerarchicamente "inferiori", fino alla Fact, e le aggiunge a joinTables.
      let dimensionTables = (common) ? originTables :
        Draw.svg.querySelectorAll(`use.table[data-table-join][data-fact-id='${fact.id}'], use.time[data-fact-id='${fact.id}']`);

      dimensionTables.forEach(table => {
        // debugger;
        joinTables = [{ table: table.dataset.alias, id: table.id }];
        // recupero la join associata alla tabella in ciclo
        if (table.dataset.tableJoin) recursiveDimensionDown(table.dataset.tableJoin);
        tables[table.dataset.alias] = joinTables;
      });
      // Creazione del DataModel con un oggetto Fact e, al suo interno, gli object relativi alle tabelle, per ogni fact
      this.#dataModel.set(fact.id, tables);
    });
    console.log('this.#dataModel:', this.#dataModel);
  }

  get dataModel() { return this.#dataModel; }

  set hierTables(value) {
    this.#hierTables.set(value.id, value.table);
    // console.log('this.#hierTables : ', this.#hierTables);
  }

  get hierTables() { return this.#hierTables; }

  set metrics(object) {
    this.#metrics.set(object.token, object);
  }

  get metrics() { return this.#metrics; }

  checkChanges(token) {
    // Solo se sono in edit mode aggiungo gli elementi al workBookChange
    if (this.edit) this.workBookChange.add(token);
  }

  save() {
    this.workBook.name = this.title;
    this.workBook.databaseId = this.databaseId;
    // this.workBook.fields = Object.fromEntries(this.fields);
    // TODO: 20.11.2024 fields_new per ora viene utilizzato, da scheduleProcess() DA VALUTARE
    // this.workBook.fields_new = Object.fromEntries(this.field);
    this.workBook.joins = Object.fromEntries(this.joins);
    // WARN: inutile salvarlo in localStorage, questo viene ricreato quando si apre un WorkBook
    this.workBook.dataModel = Object.fromEntries(this.dataModel);
    this.workBook.dateTime = this.dateTime;
    this.workBook.svg = {
      tables: Object.fromEntries(Draw.tables),
      lines: Object.fromEntries(Draw.joinLines)
    }
    /* for (const [token, metric] of this.metrics) {
      if (metric.metric_type === 'basic') {
        // WARN: perchè non utilizzo Object.fromEntries ?
        (!this.workBook.hasOwnProperty('metrics')) ? this.workBook.metrics = { [token]: metric } : this.workBook.metrics[token] = metric;
      }
    } */
    // console.info('WorkBook : ', this.workBook);
    if (!this.workBook.hasOwnProperty('created_at')) this.workBook.created_at = new Date().toLocaleDateString('it-IT', this.#options);
    if (this.edit) {
      // sono in edit mode, se sono state fatte modifiche aggiorno 'updated_at'
      if (this.workBookChange.size !== 0) {
        this.workBook.updated_at = new Date().toLocaleDateString('it-IT', this.#options);
        App.showConsole("Salvataggio del WorkBook in corso...", "done", 2000);
      }
    } else {
      // non sono in edit mode, salvo sempre 'updated_at'
      this.workBook.updated_at = new Date().toLocaleDateString('it-IT', this.#options);
    }
    this.workBook.worksheet = this.workSheet;
    WorkBookStorage.save(this.workBook);
  }

  update() {
    this.workBook.updated_at = new Date().toLocaleDateString('it-IT', this.#options);
    App.showConsole("WorkBook aggiornato", "done", 1500);
    WorkBookStorage.save(this.workBook);
  }

  set workbookMap(tables) {
    tables.forEach(table => {
      let fields = {}, metrics = {};
      let props = {
        key: table.id,
        schema: table.dataset.schema,
        table: table.dataset.table,
        name: table.dataset.name
      }
      // recupero (da sessionStorage) tutte le colonne della tabella in ciclo
      const columns = JSON.parse(window.sessionStorage.getItem(table.dataset.table));
      // console.log(columns);
      columns.forEach(col => {
        const token = (table.dataset.type === 'time') ?
          `_${table.dataset.table}_${col.column_name}` :
          `_${table.id.substring(table.id.length - 5)}_${col.column_name}`;
        switch (col.type_name) {
          case 'float':
            metrics[token] = {
              token,
              alias: col.column_name,
              type: 'metric',
              SQL: `${table.dataset.alias}.${col.column_name}`,
              aggregateFn: 'SUM',
              distinct: false,
              factId: table.id,
              metric_type: 'basic',
              properties: { table: table.dataset.table, fields: [col.column_name] }
            }
            this.metrics = metrics[token];
            this.elements = metrics[token];
            break;
          default:
            fields[token] = {
              token,
              name: col.column_name,
              table: table.dataset.table,
              tableAlias: table.dataset.alias,
              schema: table.dataset.schema,
              tableId: table.id,
              type: 'column',
              origin_field: col.column_name,
              datatype: col.type_name,
              constraint: col.constraint_name,
              SQL: `${table.dataset.alias}.${col.column_name}`,
              time: (table.dataset.type === 'time')
            }
            this.fields = fields[token];
            this.elements = fields[token];
            break;
        }
        // aggiungo le metriche e le colonne custom create, si trovano nella proprietà "worksheet"
        for (const [token, object] of Object.entries(this.workSheet)) {
          // debugger;
          if (object.factId === table.id || object.tableId === table.id) {
            this.elements = this.workSheet[token];
            if (this.workSheet[token].type === 'metric') {
              metrics[token] = object;
              this.metrics = object;
            } else {
              fields[token] = object;
              this.fields = object;
            }
          }
        }
        // aggiungo le metriche avanzate al workBook
        for (const [token, metric] of WorkBook.elements) {
          if (metric.metric_type === 'advanced' && metric.factId === table.id) {
            metrics[token] = metric;
            // la aggiungo anche al Map() elements
            this.elements = metric;
          }
        }
      });
      this.#workbookMap.set(table.dataset.alias, { props, fields, metrics });
    });
    // aggiungo le metriche composte al workBook all'esterno del ciclo, queste
    // metriche non sono associate ad una specifica tabella e vengono posizionate in una <ul> separata
    /* for (const metric of WorkBook.elements.values()) {
      if (metric.metric_type === 'composite') {
        // la aggiungo anche al Map() elements
        this.elements = metric;
      }
    } */
    console.info("workbookMap : ", this.#workbookMap);
  }

  get workbookMap() { return this.#workbookMap; }

  open(token) {
    WorkBookStorage.workBook = token;
    this.workBook.created_at = WorkBookStorage.workBook.created_at;
    this.workBook.updated_at = WorkBookStorage.workBook.updated_at;
    // debugger;
    this.workSheet = WorkBookStorage.workBook.worksheet;
    this.databaseId = WorkBookStorage.workBook.databaseId;

    // reimposto la Classe
    this.dateTime = WorkBookStorage.workBook.dateTime;

    // ciclo sulle tables presenti in svg.tables
    // - ricreo l'oggetto Map() this.tables e ridisegno le tabelle
    for (const [key, value] of Object.entries(WorkBookStorage.workBook.svg.tables)) {
      if (value.key !== 'related-time') {
        Draw.tables = value;
        Draw.currentTable = Draw.tables.get(key);
        // le related-time vengono disegnate dalla drawTime
        if (!value.join) {
          Draw.drawFact();
        } else if (value.hasOwnProperty('shared_ref')) {
          Draw.drawCommonTable();
        } else {
          (value.key === 'time') ? Draw.drawTime(false) : Draw.drawTable();
        }
      }
    }

    for (const [key, value] of Object.entries(WorkBookStorage.workBook.svg.lines)) {
      Draw.joinLines = value;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let controlPoints = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };
      line.id = key;
      line.dataset.startX = value.start.x;
      line.dataset.startY = value.start.y;
      line.dataset.endX = value.end.x;
      line.dataset.endY = value.end.y;
      line.dataset.from = value.from;
      line.dataset.joinId = value.name;
      line.dataset.to = value.to;
      line.dataset.factId = value.factId;
      controlPoints.start.x = value.start.x + 40;
      controlPoints.start.y = value.start.y;
      controlPoints.end.x = value.end.x - 40;
      controlPoints.end.y = value.end.y;
      const d = `M${value.start.x},${value.start.y} C${controlPoints.start.x},${controlPoints.start.y} ${controlPoints.end.x},${controlPoints.end.y} ${value.end.x},${value.end.y}`;
      line.setAttribute('d', d);
      Draw.svg.appendChild(line);
      line.dataset.fn = "selectLine";
    }

    // joins
    for (const [tableAlias, values] of Object.entries(WorkBookStorage.workBook.joins)) {
      // per ogni tabella
      for (const [token, join] of Object.entries(values)) {
        this.join = { token, value: join };
        this.joins = token;
      }
    }

    for (const [token, filter] of Object.entries(WorkBookStorage.storage)) {
      this.json = JSON.parse(filter);
      if (this.json.type === 'filter' && this.json.workbook_ref === WorkBookStorage.workBook.token) {
        this.filters = { token, value: this.json };
      }
    }

    for (const [token, metric] of Object.entries(WorkBookStorage.storage)) {
      // qui vengono recuperate metriche advanced/composite
      this.json = JSON.parse(metric);
      if (this.json.type === 'metric' && this.json.workbook_ref === WorkBookStorage.workBook.token) {
        this.elements = this.json;
        // if (this.json.metric_type === 'composite') this.elements = this.json;
      }
    }

    // metriche e colonne custom (worksheet)

    // this.createDataModel();

    return this;
  }

  checkMetricNames(table, alias) {
    for (const value of this.metrics.values()) {
      if (table === value.factId) {
        if (value.alias.toLowerCase() === alias.toLowerCase()) return true;
      }
    }
    return false;
  }

  getInformations() {
    // popolo le informazioni per poter essere inserite nel BoxInfo
    // il nome delle key deve corrispondere al nome del div nel DOM, in modo da poter essere ciclati
    return {
      info__token: this.workBook.token,
      info__name: this.name,
      info__created_at: this.workBook.created_at,
      info__updated_at: this.workBook.updated_at
    }
  }

}
