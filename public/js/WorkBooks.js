// nella Class Sheets verranno aggiunti gli oggetti che consentono di creare il report.
class Sheets {
  #fields = new Map();
  #tables = new Set(); // tutte le tabelle usate nel report. In base a questo Set() posso creare la from e la where
  #sidTables = new Set(); // id delle tabelle del canvas (svg-data-xxxxx)
  // #from = new Map(); // #from e #joins e #tables dovranno essere presenti nella Sheets eperchè sono proprietà necessarie per processare il report
  #filters = new Set();
  #metrics = new Map();
  // #joins = new Map();
  #id;
  constructor(name, token, WorkBookToken) {
    // lo Sheet viene preparato qui, in base ai dati presenti nel WorkBook passato qui al Costruttore
    // this.workBookToken = WorkBookToken;
    this.options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
    this.sheet = { token, type: 'sheet', workbook_ref: WorkBookToken };
    this.name = name;
    // mappo gli elmenti rimossi dal report in fase di edit. Questo mi consentirà
    // di stabilire se aggiornare "updated_at" del report oppure no
    this.objectRemoved = new Map();
    this.fact = new Set(); // le fact utilizzate nel report
    this.from = {}, this.joins = {}, this.measures = {}; // #from e #joins e #tables dovranno essere presenti nella Sheets eperchè sono proprietà necessarie per processare il report
    // this.joins = new Map();
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

  set sidTables(value) {
    this.#sidTables.add(value);
  }

  get sidTables() { return this.#sidTables; }

  // passaggio del token e recupero del field in WorkSheet tramite l'oggetto WorkBook passato al Costruttore
  set fields(object) {
    this.#fields.set(object.token, object.name);
    // console.info('this.#fields : ', this.#fields);
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

  removeObject(field, token, object = token) {
    // il Set() filters contiene, come object, il token, quindi imposto un valore di
    // default per l'argomento object quando (da removeDefinedFilters()) non viene
    // passato il 3 argomento
    field.dataset.removed = 'true';
    this.objectRemoved.set(token, object);
  }

  save() {
    this.sheet.fields = Object.fromEntries(this.fields);
    this.sheet.from = this.from;
    this.sheet.joins = this.joins;
    // this.sheet.from = Object.fromEntries(this.from);
    // this.sheet.joins = Object.fromEntries(this.joins);
    this.sheet.workbook_ref = this.sheet.workbook_ref;
    /* WARN : verifica dei filtri del report.
      * Se non sono presenti ma sono presenti in metriche filtrate elaboro comunque il report
      * altrimenti visualizzo un AVVISO perchè l'esecuzione potrebbe essere troppo lunga
    */
    this.sheet.filters = [...this.filters];
    // reset delle metriche
    delete this.sheet.metrics;
    delete this.sheet.advMetrics;
    delete this.sheet.compositeMetrics;

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

  }

  // il tasto Aggiorna deve essere attivato solo quando ci sono delle modifiche fatte
  // OPTIMIZE: il codice si ripete in update() e in save()
  update() {
    this.sheet.name = this.name;
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

    for (const [token, field] of Object.entries(SheetStorage.sheet.fields)) {
      this.fields = { token, name: field };
    }

    // from
    debugger;
    // TODO: la proprietà 'from' viene ricreata, in setSheet() quindi potrei NON metterla qui
    this.from = SheetStorage.sheet.from;
    /* for (const [tableAlias, object] of Object.entries(SheetStorage.sheet.from)) {
      this.from = {
        alias: tableAlias,
        schema: object.schema,
        table: object.table
      }
    } */

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

  async exist() {
    return await fetch(`/fetch_api/${this.sheet.id}_${this.userId}/check_datamart`)
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
  #tableJoins = { from: null, to: null }; // refs
  #dataModel = new Map(); // elenco di tutte le tabelle del canvas con le relative tabelle discendenti (verso la fact)
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
    // TODO: dati utili al sistema di log
    // console.log('field aggiunto : ', `${object.value.name} (${object.token})`);
    // console.log('Elenco #field : ', this.#field);
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
    console.log('#joins : ', this.#joins);
  }

  get joins() { return this.#joins; }

  set filters(object) {
    this.#filters.set(object.token, object.value);
  }

  get filters() { return this.#filters; }

  // INFO: da valutare se salvare tutto il dataModel quando si salva il workbook oppure man mano che si aggiungono
  // tabelle al canvas
  // TODO: potrei utilizzare il set e passare al Metodo l'array di nodi della/e Fact

  createDataModel() {
    Draw.svg.querySelectorAll("use.table.fact:not([data-joins='0'])").forEach(fact => {
      let joinTables = [];
      let recursive = (table) => {
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
        joinTables.push(tableJoin.id);
        if (tableJoin.dataset.tableJoin) recursive(tableJoin.dataset.tableJoin);
      }
      let tables = {};
      // verifico se, per la fact corrente, ci sono tabelle (quindi dimensioni) clonate.
      // Se ci sono tabelle in comune tra più fact 'common' sarà !== undefined
      // FIX: il metodo find() restituisce solo la prima shared_ref trovata, se ci sono più tabelle messe in
      // comune, sulla stessa fact, bisogna implementare una logica diversa, con .filter() anzichè .find().
      // Probabilmente si deve ciclare anche la dimensione attraverso dimensionId
      const common = [...Draw.svg.querySelectorAll(`use.table[data-table-join][data-fact-id='${fact.id}']`)].find(table => table.dataset.shared_ref);
      // const common = [...Draw.svg.querySelectorAll(`use.table[data-table-join][data-fact-id='${fact.id}']`)].find(table => table.classList.contains('common'));
      let originTables = [];
      if (common) {
        // nella Fact corrente (in ciclo) sono presenti dimensioni in comune con altre Fact.
        // In questo caso, recupero le tabelle gerarchicamente "superiori" a quella messa in comune.
        // es.: "CodSedeDealer" è stata messa in comune con altre Fact, quindi bisogna recuperare anche "Azienda" (livello superiore)
        originTables.push(common);
        // eseguo una funzione ricorsiva per poter recuperare tutte le tabelle gerarchicamente superiori
        // a partire dalla tabella clonata (messa in relazione con altre Fact)
        let recursiveDimension = (tableId) => {
          // return : un array di tabelle che verranno ricorsivamente aggiunte (in 'recursive()') al dataModel
          Draw.svg.querySelectorAll(`use.table[data-table-join='${tableId}'][data-dimension-id='${common.dataset.dimensionId}']`).forEach(t => {
            originTables.push(t);
            recursiveDimension(t.id);
          });
        }
        recursiveDimension(common.dataset.shared_ref);
      }
      // quando ci sono tabelle .common nella fact.id in ciclo, per poter mettere in relazione
      // la tabelle.common con la "propria" Fact devo recuperare le tabelle della dimensione
      // "di origine".
      // Successivamente, nel ciclo dimensionTables, vado ad invocare una funzione ricorsiva
      // che cerca le tabelle gerarchicamente "inferiori", fino alla Fact, e le aggiunge a joinTables.
      const dimensionTables = (common) ? originTables :
        Draw.svg.querySelectorAll(`use.table[data-table-join][data-fact-id='${fact.id}']`);

      dimensionTables.forEach(table => {
        joinTables = [table.id];
        // recupero la join associata alla tabella in ciclo
        if (table.dataset.tableJoin) recursive(table.dataset.tableJoin);
        tables[table.id] = joinTables;
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
    // if (this.#metrics.has(this.fact)) {
    //   this.#metrics.get(this.fact)[object.token] = object;
    // } else {
    //   this.#metrics.set(fact, object);
    // }
    // debugger;
    this.#metrics.set(object.token, object);
  }

  get metrics() { return this.#metrics; }

  checkChanges(token) {
    // Solo se sono in edit mode aggiungo gli elementi al workBookChange
    if (this.edit) this.workBookChange.add(token);
  }

  save() {
    this.workBook.name = this.title;
    this.workBook.fields = Object.fromEntries(this.fields);
    this.workBook.fields_new = Object.fromEntries(this.field);
    this.workBook.joins = Object.fromEntries(this.joins);
    // WARN: inutile salvarlo in localStorage, questo viene ricreato quando si apre un WorkBook
    this.workBook.dataModel = Object.fromEntries(this.dataModel);
    this.workBook.dateTime = this.dateTime;
    this.workBook.svg = {
      tables: Object.fromEntries(Draw.tables),
      lines: Object.fromEntries(Draw.joinLines)
    }
    for (const [token, metric] of this.metrics) {
      if (metric.metric_type === 'basic') {
        // WARN: perchè non utilizzo Object.fromEntries ?
        (!this.workBook.hasOwnProperty('metrics')) ? this.workBook.metrics = { [token]: metric } : this.workBook.metrics[token] = metric;
      }
    }
    console.info('WorkBook : ', this.workBook);
    if (!this.workBook.hasOwnProperty('created_at')) this.workBook.created_at = new Date().toLocaleDateString('it-IT', this.#options);
    if (this.edit) {
      // sono in edit mode, se sono state fatte modifiche aggiorno 'updated_at'
      if (this.workBookChange.size !== 0) this.workBook.updated_at = new Date().toLocaleDateString('it-IT', this.#options);
    } else {
      // non sono in edit mode, salvo sempre 'updated_at'
      this.workBook.updated_at = new Date().toLocaleDateString('it-IT', this.#options);
    }
    WorkBookStorage.save(this.workBook);
  }

  open(token) {
    // OPTIMIZE: 25.01.2024 recupero dallo storage il workBook, tutte le sue proprietà le caricherò nella Classe
    WorkBookStorage.workBook = token;
    this.workBook.created_at = WorkBookStorage.workBook.created_at;
    this.workBook.updated_at = WorkBookStorage.workBook.updated_at;

    // reimposto la Classe
    this.dateTime = WorkBookStorage.workBook.dateTime;

    // ciclo sulle tables presenti in svg.tables
    // - ricreo l'oggetto Map() this.tables e ridisegno le tabelle
    for (const [key, value] of Object.entries(WorkBookStorage.workBook.svg.tables)) {
      Draw.tables = value;
      Draw.currentTable = Draw.tables.get(key);
      if (!value.join) {
        Draw.drawFact();
      } else {
        switch (value.hasOwnProperty('shared_ref')) {
          // switch (value.cssClass) {
          case 'common':
            Draw.drawCommonTable();
            break;
          default:
            (key === 'svg-data-web_bi_time') ? Draw.drawTime() : Draw.drawTable();
            break;
        }
      }
    }

    // Il dataModel è un oggetto Map() per cui deve essere ricreato qui, dopo aver popolato l'altro oggetto
    // Map() this.tables
    this.createDataModel();

    for (const [key, value] of Object.entries(WorkBookStorage.workBook.svg.lines)) {
      Draw.joinLines = value;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let controlPoints = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };
      line.id = key;
      line.dataset.startX = value.start.x;
      line.dataset.startY = value.start.y;
      line.dataset.endX = value.end.x;
      line.dataset.endY = value.end.y;
      let d;
      if (!value.from) {
        // fact line
        line.classList = value.cssClass;
        controlPoints.start.x = value.start.x;
        controlPoints.start.y = value.start.y + 40;
        controlPoints.end.x = value.end.x;
        controlPoints.end.y = value.end.y - 40;
        d = `M${value.start.x},${value.start.y} C${controlPoints.start.x},${controlPoints.start.y} ${controlPoints.end.x},${controlPoints.end.y} ${value.end.x},${value.end.y}`;
      } else {
        line.dataset.from = value.from;
        line.dataset.joinId = value.name;
        line.dataset.to = value.to;
        controlPoints.start.x = value.start.x + 40;
        controlPoints.start.y = value.start.y;
        controlPoints.end.x = value.end.x - 40;
        controlPoints.end.y = value.end.y;
        d = `M${value.start.x},${value.start.y} C${controlPoints.start.x},${controlPoints.start.y} ${controlPoints.end.x},${controlPoints.end.y} ${value.end.x},${value.end.y}`;
      }
      line.setAttribute('d', d);
      Draw.svg.appendChild(line);
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

    for (const [token, filter] of Object.entries(WorkBookStorage.storage)) {
      this.json = JSON.parse(filter);
      if (this.json.type === 'filter' && this.json.workbook_ref === WorkBookStorage.workBook.token) {
        this.filters = { token, value: this.json };
      }
    }

    if (WorkBookStorage.workBook.hasOwnProperty('metrics')) {
      for (const value of Object.values(WorkBookStorage.workBook.metrics)) {
        this.metrics = value;
      }
    }

    for (const [token, metric] of Object.entries(WorkBookStorage.storage)) {
      // qui vengono recuperate metriche advanced/composite
      this.json = JSON.parse(metric);
      if (this.json.type === 'metric' && this.json.workbook_ref === WorkBookStorage.workBook.token) {
        this.metrics = this.json;
      }
    }

    return this;
  }

}

class Processes {
  #fields = {};
  #filters = {};
  #facts = {};
  constructor(Sheet) {
    console.log(Sheet);
    this.Sheet = Sheet;
    console.log(this.Sheet);
    this.facts = this.Sheet.fact;
  }

  set facts(value) {
    value.forEach(fact => {
      this.#facts[fact] = {};
    });
  }

  get facts() { return this.#facts; }

  set fields(value) {
    this.#fields[value.token] = value;
  }

  get fields() { return this.#fields; }

  set filters(value) {
    this.#filters[value.token] = value;
  }

  get filters() { return this.#filters; }

  set measures(value) {
    this.#facts[value.factId].measures[value.token] = value;
  }

  baseMeasures(value) {
    if (this.facts.hasOwnProperty('measures')) {
      this.facts[value.factId].measures[value.token] = value;
    } else {
      this.facts[value.factId] = { measures: { [value.token]: value } };
    }
  }

  from() {
    this.Sheet.fact.forEach(factId => {
      let from = {};
      this.Sheet.sidTables.forEach(svg_id => {
        const tables = WorkBook.dataModel.get(factId);
        if (tables.hasOwnProperty(svg_id)) {
          tables[svg_id].forEach(tableId => {
            const data = Draw.tables.get(tableId);
            from[data.alias] = { schema: data.schema, table: data.table };
          });
        }
      });
      this.facts[factId].from = from;
    });
  }

  joins() {
    this.Sheet.fact.forEach(factId => {
      let factTable = Draw.tables.get(factId).alias;
      let joins = {};
      this.Sheet.sidTables.forEach(svg_id => {
        const tables = WorkBook.dataModel.get(factId);
        if (tables.hasOwnProperty(svg_id)) {
          tables[svg_id].forEach(tableId => {
            const data = Draw.tables.get(tableId);
            if (WorkBook.joins.has(data.alias)) {
              for (const [token, join] of Object.entries(WorkBook.joins.get(data.alias))) {
                if (data.cssClass !== 'tables') {
                  if (join.to.alias === factTable) joins[token] = join;
                } else {
                  joins[token] = join;
                }
              }
            }
          });
        }
      });
      this.facts[factId].joins = joins;
    });
  }

  get process() {
    return {
      id: this.Sheet.sheet.id,
      datamartId: this.Sheet.userId,
      facts: this.facts, fields: this.fields,
      filters: this.filters
    };
  }

}
