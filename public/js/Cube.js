class Cubes {
  #columns = new Map();
  #metrics = new Map();
  #join = new Map();
  #joins = new Map();
  #timeJoin = new Map();
  #timeJoins = new Map();
  #token;
  #associatedDimension = new Set();
  constructor() {
    this._cube = {};
    this.relationId = 0;
    this._dimensions = []; // dimensioni selezionate da associare al cube
  }

  set token(value) {
    this.#token = value;
  }

  get token() { return this.#token; }

  set columns(value) { this.#columns = value; }

  get columns() { return this.#columns; }

  // viene utilizzata quando si seleziona un cubo e si vuole ripristinare l'oggetto Map #metrics
  set metricDefined(value) {
    // NOTE: converto un oggetto Object in Map()
    this.#metrics = new Map(Object.entries(value));
  }

  get metricDefined() { return this.#metrics; }

  set joins(value) {
    if (!this.#joins.has(value.token)) {
      this.#joins.set(value.token, { join: value.join, columns: value.columnsRef });
    } else {
      this.#joins.delete(value.token);
    }
    console.log('this.#joins : ', this.#joins);
  }

  get joins() { return this.#joins; }

  set join(token) {
    if (!this.#join.has(token)) {
      // join non presente, la aggiungo
      this.#join.set(token, this.joins.get(token).join);
      // imposto i colori delle icone sulle colonne
      this.joins.get(token).columns.forEach(col => {
        if (col.dataset) {
          col.dataset.joinToken = token;
          col.dataset.relationId = true;
          // la relazione è stata creata, posso eliminare [data-selected]
          delete col.dataset.selected;
        }
      });
    } else {
      // join già presente, la elimino
      delete this.#join.get(token);
      // rimuovo icone relative ai field della join eliminata
      this.joins.get(token).columns.forEach(col => {
        delete col.dataset.relation;
        delete col.dataset.joinToken;
        delete col.dataset.relationId;
      });
      // elimino la join anche da this.#joins
      this.joins.delete(token);
    }
    console.log('this.#join : ', this.#join);
  }

  get join() { return this.#join; }

  set timeJoins(value) {
    if (!this.#timeJoins.has(value.token)) {
      this.#timeJoins.set(value.token, { join: value.join, columns: value.columnsRef });
    } else {
      this.#timeJoins.delete(value.token);
    }
    console.log('this.#timeJoins : ', this.#timeJoins);
  }

  get timeJoins() { return this.#timeJoins; }

  set timeJoin(token) {
    if (!this.#timeJoin.has(token)) {
      // join non presente, la aggiungo
      this.#timeJoin.set(token, this.timeJoins.get(token).join);
      // imposto i colori delle icone sulle colonne
      this.timeJoins.get(token).columns.forEach(col => {
        if (col.dataset) {
          col.dataset.joinToken = token;
          col.dataset.relationId = true;
          // la relazione è stata creata, posso eliminare [data-selected]
          delete col.dataset.selected;
        }
      });
    } else {
      // join già presente, la elimino
      delete this.#timeJoin.get(token);
      // rimuovo icone relative ai field della join eliminata
      this.timeJoins.get(token).columns.forEach(col => {
        delete col.dataset.relation;
        delete col.dataset.joinToken;
        delete col.dataset.relationId;
      });
      // elimino la join anche da this.#joins
      this.timeJoins.delete(token);
    }
    console.log('this.#timeJoin : ', this.#timeJoin);
  }

  get timeJoin() { return this.#timeJoin; }

  set fieldSelected(value) { this._field = value; }

  get fieldSelected() { return this._field; }

  // aggiungo/rimuovo una metrica
  set metrics(value) {
    // value : { name, metric_type : 0, formula: arr_sql, alias }
    // se value è un object (metrica composta) lo salvo come object altrimenti come stringa nel Map()
    if (value.metric_type === 0) {
      this.#metrics.set(value.name, { alias: value.alias, metric_type: value.metric_type });
    } else {
      // metrica di base composta (es.: przmedio * quantita) impostata sul cubo
      this.#metrics.set(value.name, { alias: value.alias, formula: value.formula, metric_type: value.metric_type, fields: value.fields });
    }
    console.log(this.#metrics);
  }

  get metrics() { return this.#metrics; }

  save() {
    this._cube.token = this.token;
    // imposto la data last_created e last_edit
    const date = new Date();
    // const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
    this._cube.type = 'CUBE';
    this._cube.dateTimeField = this.dateTimeField;
    this._cube.created_at = date.toLocaleDateString('it-IT', options);
    this._cube.updated_at = date.toLocaleDateString('it-IT', options);
    this._cube.name = this.title;
    // NOTE: conversione di un oggetto Map in Object
    this._cube.metrics = Object.fromEntries(this.metrics);
    this._cube.columns = Object.fromEntries(this.columns);
    this._cube.FACT = this.FACT;
    this._cube.schema = this.schema;
    this._cube.alias = this.alias;
    this._cube.associatedDimensions = this.associatedDimensions;
  }

  get cube() { return this._cube; }

  set dimensionsSelected(value) { this._dimensions.push(value); }

  get dimensionsSelected() { return this._dimensions; }

  set associatedDimensions(token) {
    // debugger;
    // TODO: deve essere un oggetto Set(), quando si aggiunge una dimensione ad un cubo ma la dimensione già esiste, non deve essere aggiunta
    this.#associatedDimension.add(token);
  }

  get associatedDimensions() { return [...this.#associatedDimension]; }

}

class Dimension {
  #lastTableHierarchy;
  #hier = {};
  #dimension = {};
  constructor() { }

  set hier(value) {
    this.#hier[Object.keys(value)] = value[Object.keys(value)];
    console.log('Dim #hier : ', this.#hier);
  }

  get hier() { return this.#hier; }

  set lastTableHierarchy(value) { this.#lastTableHierarchy = value; }

  get lastTableHierarchy() { return this.#lastTableHierarchy; }

  save() {
    const rand = () => Math.random(0).toString(36).substr(2);
    const token = rand().substr(0, 21);
    // imposto la data last_created e last_edit
    const date = new Date();
    // const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
    // console.log(date.toLocaleDateString('it-IT', options));
    this.#dimension.token = token;
    // TODO: quando sarà implementata la modifica di una dimensione dovrò utilizzare solo updated_at
    this.#dimension.created_at = date.toLocaleDateString('it-IT', options);
    this.#dimension.updated_at = date.toLocaleDateString('it-IT', options);
    this.#dimension.type = 'DIMENSION';
    this.#dimension.name = this.title;
    this.#dimension.comment = this.comment;
    this.#dimension.cubes = {}; // object con i nomi dei cubi che hanno associazione con questa dimensione. Questa viene popolata quando si associa la dimensione al cubo
    this.#dimension.lastTableInHierarchy = this.lastTableHierarchy;
    this.#dimension.hierarchies = this.hier;
    console.log(this.#dimension);
    debugger;
  }

  get dimension() { return this.#dimension; }

}

class Hierarchy {
  #schema;
  #activeTable;
  #columns = new Map();
  #join = new Map();
  #joins = new Map();
  #relationId = 0;
  #field; // TODO: da modificare in fieldDs
  #fieldId;
  #fieldRef; // riferimento, nel DOM, della colonna selezionata
  #comment;
  #hier = {};
  #from;
  #table;
  #lastTableHierarchy;
  #alias; // alias per la tabella
  #tableJoins = { from: null, to: null }; // refs 
  // #tableTo; // ref 
  constructor() { }

  /* NOTE: mapdb*/
  set tableJoins(object) {
    this.#tableJoins.from = Draw.svg.querySelector(`#${object.from}`);
    this.#tableJoins.to = Draw.svg.querySelector(`#${object.to}`);
  }

  get tableJoins() { return this.#tableJoins; }

  set activeTable(id) {
    this.#activeTable = Draw.svg.querySelector(`#${id}`);
  }

  get activeTable() { return this.#activeTable; }

  /* NOTE: end mapdb */

  set table(value) { this.#table = value; }

  get table() { return this.#table; }

  set from(value) { this.#from = value; }

  get from() { return this.#from; }

  set activeCard(id) {
    // la card su cui si sta operando
    this.card = document.querySelector(".card.table[data-id='" + id + "']");
    if (this.card) this.schema = this.card.dataset.schema;
  }

  get activeCard() { return this.card; }

  set mode(value) {
    // imposto la modalità della card (relations, columns, filters, groupby, metrics)
    let info = this.card.querySelector('.info');
    if (this.card.dataset.mode === value) {
      this.card.toggleAttribute('data-mode');
      info.hidden = true;
    } else {
      this.card.dataset.mode = value;
      info.hidden = false;
      let msg;
      switch (value) {
        case 'columns':
          msg = 'Seleziona le colonne da mettere nel corpo della tabella';
          break;
        case 'relations':
          msg = 'Selezionare le colonne che saranno messe in relazione';
          break;
        case 'hier-order':
          msg = 'Selezionare le tabelle nell\'ordine gerarchico';
          break;
        default:
          msg = 'Selezionare la colonna per le operazioni DateTime';
          break;
      }
      info.innerHTML = msg;
    }
  }

  get mode() { return this.card.dataset.mode; }

  set field(object) { this.#field = object; }

  get field() { return this.#field; }

  set fieldRef(value) { this.#fieldRef = value; }

  get fieldRef() { return this.#fieldRef; }

  set alias(value) { this.#alias = value; }

  get alias() { return this.#alias; }

  set joins(value) {
    if (!this.#joins.has(value.token)) {
      this.#joins.set(value.token, { join: value.join, columns: value.columnsRef, table: value.table });
    } else {
      this.#joins.delete(value.token);
    }
    console.log('this.#joins : ', this.#joins);
  }

  get joins() { return this.#joins; }

  set join(token) {
    if (!this.#join.has(this.joins.get(token).table)) {
      // tabella non presente, non ci sono join su questa tabella, la aggiungo
      this.#join.set(this.joins.get(token).table, { [token]: this.joins.get(token).join });
      // imposto i colori delle icone sulle colonne
      this.joins.get(token).columns.forEach(col => {
        if (col.dataset) {
          col.dataset.joinToken = token;
          col.dataset.relationId = true;
          // la relazione è stata creata, posso eliminare [data-selected]
          delete col.dataset.selected;
        }
      });
    } else {
      // tabella già presente, verifico se il token è già presente, se non lo è lo aggiungo altrimenti lo elimino
      if (!this.#join.get(this.joins.get(token).table).hasOwnProperty(token)) {
        // join non esistente per questa tabella, lo aggiungo
        this.#join.get(this.joins.get(token).table)[token] = this.joins.get(token).join;
        // definisco colori icone
        this.joins.get(token).columns.forEach(col => {
          col.dataset.joinToken = token;
          col.dataset.relationId = true;
          // la relazione è stata creata, posso eliminare [data-selected]
          delete col.dataset.selected;
        });
      } else {
        // join già esiste per questa tabella, a elimino
        delete this.#join.get(this.joins.get(token).table)[token];
        // rimuovo icone relative ai field della join eliminata
        this.joins.get(token).columns.forEach(col => {
          delete col.dataset.relation;
          delete col.dataset.joinToken;
          delete col.dataset.relationId;
        });
        // elimino anche la tabella se, al suo interno, non sono presenti altre join
        if (Object.keys(this.#join.get(this.joins.get(token).table)).length === 0) this.#join.delete(this.joins.get(token).table);
        // elimino la join anche da this.#joins
        this.joins.delete(token);
      }
    }
    console.log('this.#join : ', this.#join);
  }

  get join() { return this.#join; }

  set comment(value) { this.#comment = value; }

  get comment() { return this.#comment; }

  set hier(object) {
    console.log('object : ', object);
    this.#hier[object.token] = { order: object.hierarchyOrder };
    this.#hier[object.token]['name'] = object.name;
    this.#hier[object.token]['columns'] = Object.fromEntries(this.column);
    this.#hier[object.token]['joins'] = Object.fromEntries(this.join);
    this.#hier[object.token]['from'] = object.from;
    // this.#hier[object.token]['tablesFrom'] = object.tablesForm;
    this.#hier[object.token]['comment'] = object.comment;
    console.log('this._hierarchies : ', this.#hier);
  }

  get hier() { return this.#hier; }

  // aggiungo/elimino una colonna
  set column(token) {
    this.obj = {};
    if (!this.#columns.has(this.#alias)) {
      // alias di tabella ancora non mappata come columns
      this.obj[token] = { id: this.field.id, ds: this.field.ds };
      this.#columns.set(this.#alias, this.obj);
    } else {
      // tabella già presente, verifico se il token è già presente, se non lo è lo aggiungo altrimenti lo elimino
      if (!this.#columns.get(this.#alias).hasOwnProperty(token)) {
        // field non esistente per questa tabella, lo aggiungo
        this.#columns.get(this.#alias)[token] = { id: this.field.id, ds: this.field.ds };
      } else {
        // field già esiste per questa tabella, lo elimino
        delete this.#columns.get(this.#alias)[token];
        // elimino anche l'attr "schema.table" se, al suo interno, non sono presenti altri field
        if (this.#columns.get(this.#alias).size === 0) this.#columns.delete(this.#alias);
      }
    }
    console.log('this.#columns : ', this.#columns);
  }

  get column() { return this.#columns; }
}
