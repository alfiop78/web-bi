class DrawSVG {
  #tables = new Map();
  #joinLines = new Map();
  #dimensions = new Set();
  #dimensionSelected = {};
  #currentLineRef; // ref
  tmplJoin = document.getElementById('tmpl-join-field');
  dialogJoin = document.getElementById('dlg-join');
  // #dataModel = new Map();

  constructor(element) {
    this.svg = document.getElementById(element);
    this.svg.dataset.height = this.svg.parentElement.offsetHeight;
    this.svg.dataset.width = this.svg.parentElement.offsetWidth;
    this.contextMenu = document.getElementById('context-menu-table');
    this.currentLevel;
    this.currentTable = {}, this.currentLine = {};
    // la tabella corrente: viene impostata :
    // - al termine del drawTable/Fact
    // - Quando si attiva il contextMenu
    this.table; // la tabella corrente
    this.arrayLevels = [];
    this.dragElementPosition = { x: 0, y: 0 };
    this.coordsRef = document.getElementById('coords');
    this.nearestPoint = [];
    this.svg.addEventListener('dragover', this.handlerDragOver.bind(this), false);
    this.svg.addEventListener('drop', this.handlerDrop.bind(this), false);
    this.svg.addEventListener('dragenter', this.handlerDragEnter.bind(this), false);
    this.svg.addEventListener('dragleave', this.handlerDragLeave.bind(this), false);

    this.svg.addEventListener('mousemove', this.handlerMouseMove.bind(this), true);
    this.tmplList = document.getElementById('tmpl-li');
    // altre proprietà
    // tableJoin : è la tabella a cui sto collegando quella corrente
  }

  rand = () => Math.random(0).toString(36).substring(2);

  set tables(value) {
    this.#tables.set(value.id, value.properties);
    // console.log(this.#tables);
  }

  get tables() { return this.#tables; }

  get countTables() {
    return this.svg.querySelectorAll('use.table').length;
  }

  get countJoins() {
    return this.svg.querySelectorAll('use.table:not(.fact)').length;
  }

  set currentLineRef(value) {
    this.#currentLineRef = this.svg.querySelector(`#${value}`);
  }

  get currentLineRef() { return this.#currentLineRef; }

  set dimensionSelected(dimensionId) {
    this.svg.querySelectorAll(`use.table[data-dimension-id='${dimensionId}']`).forEach(table => {
      debugger;
      this.#dimensionSelected[table.id] = this.tables.get(table.id);
    });
  }

  get dimensionSelected() { return this.#dimensionSelected; }

  set joinLines(value) {
    this.#joinLines.set(value.id, value.properties);
  }

  get joinLines() { return this.#joinLines; }

  set dimensions(id) {
    this.#dimensions.add(id);
  }

  get dimensions() { return this.#dimensions; }

  /* NOTE: DRAG&DROP EVENTS */

  handlerDragStart(e) {
    // console.log('e.target : ', e.target.id);
    e.stopPropagation();
    e.target.classList.add('dragging');
    this.dragElementPosition.x = e.offsetX;
    this.dragElementPosition.y = e.offsetY;
    // console.log(this.dragElementPosition);
    e.dataTransfer.setData('text/plain', e.target.id);
    // creo la linea
    if (this.countTables > 0) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const token = this.rand().substring(0, 4);
      line.id = `line-${token}`;
      line.dataset.id = token;
      this.svg.appendChild(line);
      this.currentLineRef = line.id;
    }
    // console.log(e.dataTransfer);
    e.dataTransfer.effectAllowed = "copy";
  }

  handlerDragOver(e) {
    e.preventDefault();
    if (e.currentTarget.classList.contains('dropzone')) {
      e.dataTransfer.dropEffect = "copy";
      this.coordsRef.innerHTML = `<small>x ${e.offsetX}</small><br /><small>y ${e.offsetY}</small>`;
      let nearestTable;
      if (this.countTables > 0) {
        // viene utilizzato il calcolo dell'ipotenusa con il valore assoluto per stabilire qual'è la tabella più vicina
        nearestTable = [...this.svg.querySelectorAll('use.table')].reduce((prev, current) => {
          return (Math.hypot(e.offsetX - (+current.dataset.x + 190), e.offsetY - (+current.dataset.y + 12)) < Math.hypot(e.offsetX - (+prev.dataset.x + 190), e.offsetY - (+prev.dataset.y + 12))) ? current : prev;
        });
        // console.log(nearestTable.id);
        const rectBounding = nearestTable.getBoundingClientRect();
        // console.log(rectBounding);
        // tableJoin identifica la tabella più vicina trovata rispetto al movimento del mouse
        // TODO: 26.01.2024 - in tableJoin probabilmente ho bisogno solo dell'id
        this.tableJoin = {
          table: nearestTable,
          x: +nearestTable.dataset.x + rectBounding.width + 10,
          bottom: +nearestTable.dataset.x + (rectBounding.width / 2),
          // bottom: +nearestTable.dataset.x + rectBounding.width + 10 - 95,
          y: +nearestTable.dataset.y + (rectBounding.height / 2),
          joins: +nearestTable.dataset.joins,
          // levelId: +nearestTable.dataset.levelId
        }
        // console.log('joinTable :', Draw.tableJoin);
        // console.log('tableJoin :', Draw.tableJoin.table.id);
        if (this.currentLineRef && this.tableJoin) {
          this.joinLines = {
            id: this.currentLineRef.id,
            properties: {
              id: this.currentLineRef.dataset.id,
              key: this.currentLineRef.id,
              coordsFrom: { x: (e.offsetX - this.dragElementPosition.x - 10), y: (e.offsetY - this.dragElementPosition.y + 12) },
              // coordsBottomFrom: { x: (e.offsetX - this.dragElementPosition.x + 12), y: (e.offsetY - this.dragElementPosition.y - 12) },
              coordsBottomFrom: { x: (e.offsetX - this.dragElementPosition.x + 12), y: (e.offsetY - this.dragElementPosition.y - 4) },
              from: null, // questo viene popolato nel handlerDrop, dopo aver ottenuto l'id dell'elemento nel DOM
              to: this.tableJoin.table.id
            }
          };
          this.currentLine = this.joinLines.get(this.currentLineRef.id);
        }
        // let testCoords = [{ x: 305, y: 70 }, { x: 210, y: 85 }];
        // creo 2 punti di ancoraggio (right, bottom e left)
        // se NON è presente nemmeno una dimensione (tabella dimensionale) non posso ancora aggiungere
        // la seconda Fact, quindi creo solo un punto di anchor, quello di destra
        // Almeno un livello dimensionale deve essere già esistente altrimenti non si può selezionare
        // il livello dimensionale da mettere in comune tra le due fact
        const anchorPoints = (this.countJoins >= 1) ?
          [
            { x: this.tableJoin.x, y: this.tableJoin.y, anchor: 'right' }, // right
            { x: this.tableJoin.bottom, y: this.tableJoin.y + 16, anchor: 'bottom' } // botton
          ] :
          [
            { x: this.tableJoin.x, y: this.tableJoin.y, anchor: 'right' }, // right
            // { x: this.tableJoin.x - 95, y: this.tableJoin.y + 32, anchor: 'bottom' } // botton
            // { x: +nearestTable.dataset.x - 10, y: this.tableJoin.y, anchor: 'left' } // left
          ];

        this.nearestPoint = anchorPoints.reduce((prev, current) => {
          // console.log(Math.hypot(e.offsetX - current.x, e.offsetY - current.y));
          // console.log(Math.hypot(e.offsetX - prev.x, e.offsetY - prev.y));
          return (Math.hypot(e.offsetX - current.x, e.offsetY - current.y) < Math.hypot(e.offsetX - prev.x, e.offsetY - prev.y)) ? current : prev;
        });
        // console.log(nearestPoint);
        this.drawLine();
      }
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  }

  handlerDragEnter(e) {
    e.preventDefault();
    if (e.currentTarget.classList.contains('dropzone')) {
      console.info('DROPZONE');
      // console.log(e.currentTarget, e.target);
      // if (e.target.nodeName === 'use') this.currentLevel = +e.target.dataset.levelId;
      // e.dataTransfer.dropEffect = "copy";
      // coloro il border differente per la dropzone
      e.currentTarget.classList.add('dropping');
    } else {
      console.warn('non in dropzone');
      // TODO: se non sono in una dropzone modifico l'icona del drag&drop (icona "non consentito")
      e.dataTransfer.dropEffect = "none";
    }
  }

  handlerDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dropping');
  }

  handlerDrop(e) {
    e.preventDefault();
    // console.log('handlerDrop()');
    e.currentTarget.classList.replace('dropping', 'dropped');
    if (!e.currentTarget.classList.contains('dropzone')) return;
    const liElement = document.getElementById(e.dataTransfer.getData('text/plain'));
    liElement.classList.remove('dragging');
    const time = Date.now().toString();
    const tableId = time.substring(time.length - 5);

    // se non è presente una tableJoin significa che sto aggiungendo la prima tabella
    // console.log(this);
    let coords = { x: e.offsetX - this.dragElementPosition.x, y: e.offsetY - this.dragElementPosition.y };
    // console.log(this.dragElementPosition);
    // console.log(coords);
    // alcune proprietà di this.tables sono presente sia quando viene droppataa una Fact che quando
    // viene droppata una tabella dimensionale
    // TODO: probabilmente qui alcune proprietà non servono, ad esempio è da rivedere la proprietà 'line'
    this.tables = {
      id: `svg-data-${tableId}`,
      properties: {
        id: tableId,
        key: `svg-data-${tableId}`,
        x: coords.x,
        y: coords.y,
        // line: {
        //   to: { x: coords.x + 190, y: coords.y + 12 },
        //   from: { x: coords.x - 10, y: coords.y + 12 }
        // },
        table: liElement.dataset.label,
        alias: `${liElement.dataset.label}_${time.substring(time.length - 3)}`,
        name: liElement.dataset.label,
        schema: liElement.dataset.schema,
        join: null,
        joins: 0
      }
    };

    // TODO: invece di factId potrei impostare l'id dell'elemento del DOM (svg-data-xxxx)
    if (!this.tableJoin) {
      // nessuna tabella da mettere in join (prima tabella)
      // this.tables.get(`svg-data-${tableId}`).levelId = 0;
      this.tables.get(`svg-data-${tableId}`).factId = `svg-data-${tableId}`;
      this.currentTable = this.tables.get(`svg-data-${tableId}`);
      this.drawFact();
    } else if (this.tableJoin && this.currentLineRef.classList.contains('factLine')) {
      // Aggiunta di una Fact per l'analisi MultiFact (linea di join verticale)
      // la nuova fact è visualizzata immediatamente sotto la prima fact
      // recupero le coordinate del e.target
      this.tables.get(`svg-data-${tableId}`).x = +this.tableJoin.table.dataset.x;
      this.tables.get(`svg-data-${tableId}`).factId = `svg-data-${tableId}`;
      this.currentTable = this.tables.get(`svg-data-${tableId}`);
      // this.createDimensionInfo();
      this.drawFact();
    } else {
      // è presente una tableJoin
      // OPTIMIZE: potrei creare un Metodo nella Classe Draw che imposta la prop 'join'
      // ...in Draw.tables e, allo stesso tempo, imposta anche 'dataset.joins'
      // ...sull'elemento 'use.table' come fatto sulle due righe successive

      // Incremento l'attributo 'joins' sulla Fact, questo indica quante dimensioni ci sono collegate
      // alla Fact
      this.svg.querySelector(`use.table[id="${this.tableJoin.table.id}"]`).dataset.joins = ++this.tableJoin.joins;
      // ... lo imposto anche nell'oggetto Map() tables
      this.tables.get(this.tableJoin.table.id).joins = this.tableJoin.joins;
      // imposto il data-dimensionId
      // se la tabella droppata è legata direttamente alla fact (ultima tabella della gerarchia)
      // incremento il dimensionId (è una nuova dimensione, l'id è basato su tableJoin.dataset.joins)
      const dimensionId = (this.tableJoin.table.classList.contains('fact')) ?
        +this.tableJoin.joins : +this.tableJoin.table.dataset.dimensionId;
      // const dimensionId = (levelId === 1) ? +this.tableJoin.joins : +this.tableJoin.table.dataset.dimensionId;
      // imposto la proprietà 'tables' della Classe Draw
      // imposto solo le proprietà che sono presenti in una tabella dimensionale
      this.tables.get(`svg-data-${tableId}`).join = this.tableJoin.table.id;
      this.tables.get(`svg-data-${tableId}`).factId = this.tableJoin.table.dataset.factId;
      this.tables.get(`svg-data-${tableId}`).dimensionId = dimensionId;
      // this.tables.get(`svg-data-${tableId}`).levelId = levelId;
      // linea di join da tableJoin alla tabella droppata
      // imposto solo la proprietà 'from' rimasta "in sospeso" in handlerDragOver perchè in quell'evento non
      // ho ancora l'elemento nel DOM
      this.joinLines.get(this.currentLineRef.id).from = `svg-data-${tableId}`;
      this.currentTable = this.tables.get(`svg-data-${tableId}`);
      // creo nel DOM la tabella appena droppata
      this.drawTable();
    }
    // imposto la tabella attiva per poter scaricare le colonne in sessionStorage (in handlerDragEnd())
    WorkBook.activeTable = `svg-data-${tableId}`;
    // imposto event contextmenu
    this.svg.querySelector(`#${this.currentTable.key}`).addEventListener('contextmenu', this.contextMenuTable.bind(Draw));
  }

  /* NOTE: END DRAG&DROP EVENTS */

  /* NOTE: mouse events */

  handlerMouseMove(e) {
    this.coordsRef.innerHTML = `<small>x ${e.offsetX}</small><br /><small>y ${e.offsetY}</small>`;
  }

  handlerDblClick(e) {
    console.log(e.target);
    console.log(this);
    debugger;
  }

  tableMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    // this.coordinate = { x: +e.currentTarget.dataset.x, y: +e.currentTarget.dataset.y };
    this.coordinate = { x: +e.currentTarget.getAttribute('x'), y: +e.currentTarget.getAttribute('y') };
    if (e.button === 2) return false;
    this.el = e.currentTarget;
  }

  tableMouseMove(e) {
    // e.preventDefault();
    e.stopPropagation();
    // console.log('mousemove', e.currentTarget);
    if (this.el) {
      this.coordinate.x += e.movementX;
      this.coordinate.y += e.movementY;
      // console.log(e);
      e.currentTarget.dataset.x = this.coordinate.x;
      e.currentTarget.dataset.y = this.coordinate.y;
      e.currentTarget.setAttribute('x', this.coordinate.x);
      e.currentTarget.setAttribute('y', this.coordinate.y);
      // se è presente una sola tabella nel canvas non eseguo il codice successivo, non c'è bisogno
      // di legare la linea di join
      if (this.countTables === 1) return false;

      // nella ricerca della tabella più vicina escludo la tabella che sto spostando
      let nearestTable = [...this.svg.querySelectorAll(`use.table:not(#${e.target.id})`)].reduce((prev, current) => {
        // return (Math.hypot(e.offsetX - (+current.dataset.x + 190), e.offsetY - (+current.dataset.y + 12)) < Math.hypot(e.offsetX - (+prev.dataset.x + 190), e.offsetY - (+prev.dataset.y + 12))) ? current : prev;
        return (Math.hypot(+e.target.dataset.x - (+current.dataset.x + 190), e.offsetY - (+current.dataset.y + 12)) < Math.hypot(+e.target.dataset.x - (+prev.dataset.x + 190), e.offsetY - (+prev.dataset.y + 12))) ? current : prev;
      });
      // console.log(nearestTable);
      // identifico la tabella a cui mi sto collegando (tablejoin)
      const rectBounding = nearestTable.getBoundingClientRect();
      this.tableJoin = {
        table: nearestTable,
        x: +nearestTable.dataset.x + rectBounding.width + 10,
        bottom: +nearestTable.dataset.x + (rectBounding.width / 2),
        // bottom: +nearestTable.dataset.x + rectBounding.width + 10 - 95,
        y: +nearestTable.dataset.y + (rectBounding.height / 2),
        joins: +nearestTable.dataset.joins,
        // levelId: +nearestTable.dataset.levelId
      }
      // imposto la linea corrente in base alla tabella che sto spostando
      // WARN: la Fact, se ha una joinLine, la devo cercare nel data-to anzichè data-from della linea
      this.currentLineRef = this.svg.querySelector(`path[data-from='${e.target.id}']`).id;
      this.currentLineRef.dataset.to = nearestTable.id;
      // console.log('currentLineRef:', this.currentLineRef);
      // TODO: le coordinate all'interno dell'oggetto Map() joinLines vanno modificate, in base allo spostamento
      // che sto facendo qui
      this.joinLines.get(this.currentLineRef.id).coordsFrom = {
        x: +nearestTable.dataset.x + 190,
        y: +nearestTable.dataset.y + 12
      }
      this.joinLines.get(this.currentLineRef.id).to = nearestTable.id;

      this.currentLine = this.joinLines.get(this.currentLineRef.id);

      // console.log('this.currentline:', this.currentLine);

      if (this.currentLineRef) {
        const d = `M${+nearestTable.dataset.x + 190},${+nearestTable.dataset.y + 12} C${+nearestTable.dataset.x + 190 + 40},${+nearestTable.dataset.y + 12} ${this.coordinate.x - 40},${this.coordinate.y + 12} ${this.coordinate.x - 10},${this.coordinate.y + 12}`;
        this.currentLineRef.setAttribute('d', d);
      }
    }
  }

  tableMouseLeave(e) {
    e.preventDefault();
    console.log('tableMouseLeave');
    if (this.el) delete this.el;
  }

  tableMouseUp(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('tableMouseUp');
    // console.log(this.el);
    delete this.el;
    if (e.button === 2 || this.countTables === 1) return false;
    // OPTIMIZE: 25.01.2024 - aggiungo la nuova tabella a Draw.tables, anche se in Draw.tables dovrei aggiungere le
    // tabelle solo dopo aver completato la join dalla dialogJoin..
    this.tables = {
      id: e.currentTarget.id,
      properties: {
        id: this.tables.get(this.table.id).id,
        key: e.currentTarget.id,
        x: +e.currentTarget.getAttribute('x'),
        y: +e.currentTarget.getAttribute('y'),
        table: this.tables.get(this.table.id).table,
        alias: this.tables.get(this.table.id).alias,
        name: this.tables.get(this.table.id).name,
        schema: this.tables.get(this.table.id).schema,
        join: this.tableJoin.table.id,
        joins: this.tables.get(this.table.id).joins,
        factId: this.tableJoin.table.dataset.factId,
        dimensionId: this.tables.get(this.table.id).dimensionId
      }
    };
    // TODO: qui non devo "disegnare" la tabella spostata
    // (perchè non è un drop ma la tabella è già all'interno del canvas), quindi aggiorno qui
    // l'elemento nel DOM (use.table)
    this.currentTable = this.tables.get(e.currentTarget.id);
    this.reDrawTable();
    // se esiste già una join per questa tabella non visualizzo la dialogJoin
    if (!('joinId' in this.currentLineRef.dataset)) {
      // la join non è presente su questa linea
      this.openJoinWindow();
      WorkBook.tableJoins = {
        from: this.dialogJoin.querySelector('.joins section[data-table-from]').dataset.tableId,
        to: this.dialogJoin.querySelector('.joins section[data-table-to]').dataset.tableId
      }
      for (const [key, value] of Object.entries(WorkBook.tableJoins)) {
        WorkBook.activeTable = value.id;
        const data = WorkBookStorage.getTable(WorkBook.activeTable.dataset.table);
        this.addFields(key, data);
      }
    }
    // creo/aggiorno la mappatura di tutte le tabelle del Canvas
    WorkBook.createDataModel();
  }

  /* NOTE: end mouse events */

  // Questa funzione restituisce i due elementi da aggiungere al DOM
  // Può essere invocata sia per creare una nuova join che
  // per creare/popolare una join esistente (ad es.: click sulla join line)
  // TODO: questi 3 metodi (createJoinField, addjoin e openJoinWindow) sono da ottimizzare,
  createJoinField() {
    const tmplJoinFrom = this.tmplJoin.content.cloneNode(true);
    const tmplJoinTo = this.tmplJoin.content.cloneNode(true);
    const joinFieldFrom = tmplJoinFrom.querySelector('.join-field');
    const joinFieldTo = tmplJoinTo.querySelector('.join-field');
    // rimuovo eventuali joinField che hanno l'attributo data-active prima di aggiungere quelli nuovi
    this.dialogJoin.querySelectorAll('.join-field[data-active]').forEach(joinField => delete joinField.dataset.active);
    this.dialogJoin.querySelector('.joins section[data-table-from] > .join').appendChild(joinFieldFrom);
    this.dialogJoin.querySelector('.joins section[data-table-to] > .join').appendChild(joinFieldTo);
    return { from: joinFieldFrom, to: joinFieldTo };
  }

  addJoin() {
    // recupero i riferimenti del template da aggiungere al DOM
    let joinFields = this.createJoinField();
    const token = this.rand().substring(0, 7);
    joinFields.from.dataset.token = token;
    joinFields.to.dataset.token = token;
    document.querySelector('#btn-remove-join').dataset.token = token;
  }

  openJoinWindow() {
    // WARN: questa proprietà impostata sulla dialogJoin non è mai letta nel resto del codice, si potrebbe eliminare
    // this.dialogJoin.dataset.lineId = this.currentLineRef.id;

    // aggiungo i template per join-field se non ci sono ancora join create
    // verifico se è presente una join su questa line
    if (!this.currentLineRef.dataset.joinId) {
      // join non presente
      this.addJoin();
    } else {
      // join presente, popolo i join-field
      // Le join sono salvate in WorkBook.joins e la key corrisponde alla tabella 'from'
      // messa in relazione
      for (const [key, value] of Object.entries(WorkBook.joins.get(this.currentLineRef.dataset.joinId))) {
        // key : join token
        // per ogni join devo creare i due campi .join-field e popolarli
        // con i dati presenti in WorkBook.join (che corrisponde a value in questo caso)
        let joinFields = this.createJoinField();
        joinFields.from.dataset.token = key;
        joinFields.to.dataset.token = key;
        joinFields.from.dataset.field = value.from.field;
        joinFields.from.dataset.table = value.from.table;
        joinFields.from.dataset.alias = value.from.alias;
        joinFields.from.innerHTML = value.from.field;
        joinFields.to.dataset.field = value.to.field;
        joinFields.to.dataset.table = value.to.table;
        joinFields.to.dataset.alias = value.to.alias;
        joinFields.to.innerHTML = value.to.field;
        document.querySelector('#btn-remove-join').dataset.token = key;
      }
    }
    // in base alla linea di join (this.joinLines) recupero le proprietà 'from' e 'to' che contengono
    // l'id delle tabelle collegate (all'interno del canvas)
    // Tramite questo id utilizzo il .get() sull'oggetto Map() this.tables per recuperare il nome e/o altre
    // proprietà della tabella, per ora solo il nome e la key
    // (quest'ultima però ce l'ho già in this.joinLines)
    // INFO: queste proprietà potrei recuperarle anche direttamente dall'elemento use.table nell'<svg>
    const from = this.tables.get(this.joinLines.get(this.currentLineRef.id).from);
    const to = this.tables.get(this.joinLines.get(this.currentLineRef.id).to);

    // 'from' è la tabella che sto droppando
    const joinSectionFrom = this.dialogJoin.querySelector('.joins section[data-table-from]');
    // 'to' è la tabella a cui collegare quella corrente (corrente si riferisce sempre a quella che sto droppando)
    const joinSectionTo = this.dialogJoin.querySelector('.joins section[data-table-to]');
    joinSectionFrom.dataset.tableFrom = from.table;
    joinSectionFrom.dataset.tableId = from.key;
    joinSectionFrom.querySelector('.table').innerHTML = from.table;
    joinSectionTo.dataset.tableTo = to.table;
    joinSectionTo.dataset.tableId = to.key;
    joinSectionTo.querySelector('.table').innerHTML = to.table;
    this.dialogJoin.show();
  }

  /* checkResizeSVG() {
    let maxHeightTable = [...this.svg.querySelectorAll('use.table')].reduce((prev, current) => {
      return (+current.dataset.y > +prev.dataset.y) ? current : prev;
    });
    if (1 - (+maxHeightTable.dataset.y / +this.svg.dataset.height) < 0.30) {
      // this.svg.dataset.height = +this.svg.dataset.height + 40;
      this.svg.dataset.height = +maxHeightTable.dataset.y + 40;
      this.svg.style.height = `${+this.svg.dataset.height}px`;
    }
    let maxWidthTable = [...this.svg.querySelectorAll('use.table')].reduce((prev, current) => {
      return (+current.dataset.x > +prev.dataset.x) ? current : prev;
    });
    if (1 - (+maxWidthTable.dataset.x / +this.svg.dataset.width) < 0.40) {
      // this.svg.dataset.width = +this.svg.dataset.width + 190;
      this.svg.dataset.width = +maxWidthTable.dataset.x + 190;
      this.svg.style.width = `${+this.svg.dataset.width}px`;
    }
  } */

  drawFact() {
    let clonedStruct = this.svg.querySelector('#table-struct-fact').cloneNode(true);
    // assegno l'id e il testo (nome tabella) all'elemento clonato
    clonedStruct.id = `struct-${this.currentTable.key}`;
    clonedStruct.classList.add('struct');
    clonedStruct.querySelector('text').innerHTML = this.currentTable.name;
    // lo aggiungo al defs
    this.svg.querySelector('defs').appendChild(clonedStruct);
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#${clonedStruct.id}`);
    use.id = this.currentTable.key;
    use.classList.add('table');
    use.dataset.id = `data-${this.currentTable.id}`;
    use.dataset.table = this.currentTable.table;
    use.dataset.factId = this.currentTable.factId;
    use.dataset.alias = this.currentTable.alias;
    // tutte le tabelle hanno la prop join, tranne la fact, dove NON aggiungo 'tableJoin' e dimensionId
    use.classList.add('fact');
    // aggiungo l'evento drop sulla Fact, questo consentirà l'analisi multifatti
    // use.addEventListener('drop', this.handlerTableDrop.bind(Draw));
    // use.addEventListener('dragenter', this.handlerTableDragEnter.bind(this));
    // use.addEventListener('dragleave', this.handlerTableDragLeave.bind(this));
    use.dataset.name = this.currentTable.name;
    use.dataset.schema = this.currentTable.schema;
    use.dataset.joins = this.currentTable.joins;
    // use.dataset.fn = 'tableSelected';
    // INFO: gli eventi impostati con il dataset in questo modo possono essere legati anche a init-responsive.js
    use.dataset.enterFn = 'tableEnter';
    // use.onmouseover = this.handlerOver.bind(Draw);
    // use.onmouseleave = this.handlerLeave.bind(Draw);
    use.ondblclick = this.handlerDblClick.bind(Draw);
    // use.dataset.leaveFn = 'tableLeave';
    use.dataset.x = this.currentTable.x;
    use.dataset.y = this.currentTable.y;
    // punto di ancoraggio di destra
    use.dataset.anchorXTo = this.currentTable.x + 190;
    use.dataset.anchorYTo = this.currentTable.y + 12;
    // punto di ancoraggio sotto (solo per la fact) per l'aggiunta di MultiFact
    // la Fact non ha un punto di ancoraggio di sinistra
    use.dataset.anchorXBottom = this.currentTable.x + 10;
    use.dataset.anchorYBottom = this.currentTable.y + 12;
    use.setAttribute('x', this.currentTable.x);
    use.setAttribute('y', this.currentTable.y);
    use.addEventListener('mousedown', this.tableMouseDown.bind(this));
    use.addEventListener('mousemove', this.tableMouseMove.bind(this));
    use.addEventListener('mouseup', this.tableMouseUp.bind(this));
    use.addEventListener('mouseleave', this.tableMouseLeave.bind(this));
    this.svg.appendChild(use);
    this.table = use;
    // <animate> tag
    // const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    // animate.setAttribute('attributeName', 'y');
    // animate.setAttribute('dur', '.15s');
    // animate.setAttribute('fill', 'freeze');
    // use.appendChild(animate);
  }

  reDrawTable() {
    // qui aggiorno l'elemento del DOM che è stato spostato, quando non si utilizza il drag&drop
    const use = this.svg.querySelector(`#${this.currentTable.key}`);
    debugger;
    // WARN: la Fact non ha il data-fact-id, da ricontrollare quando sposto una Fact
    use.dataset.factId = this.currentTable.factId;
    use.dataset.tableJoin = this.currentTable.join;
    this.svg.querySelector(`use.table[id="${this.tableJoin.table.id}"]`).dataset.joins = ++this.tableJoin.joins;
    // ... lo imposto anche nell'oggetto Map() tables
    this.tables.get(this.tableJoin.table.id).joins = this.tableJoin.joins;
    use.dataset.enterFn = 'tableEnter';
    use.ondblclick = this.handlerDblClick.bind(Draw);
    // da testare
    use.dataset.x = this.currentTable.x;
    use.dataset.y = this.currentTable.y;
    use.setAttribute('x', this.currentTable.x);
    use.setAttribute('y', this.currentTable.y);
    // punto di ancoraggio di destra
    use.dataset.anchorXTo = this.currentTable.x + 190;
    use.dataset.anchorYTo = this.currentTable.y + 12;
    // punto di ancoraggio di sinistra
    use.dataset.anchorXFrom = this.currentTable.x - 10;
    use.dataset.anchorYFrom = this.currentTable.y + 12;
    this.table = use;
    this.currentLineRef.dataset.from = this.currentTable.key;
  }

  drawTable() {
    let clonedStruct = this.svg.querySelector('#table-struct').cloneNode(true);
    // assegno l'id e il testo (nome tabella) all'elemento clonato
    clonedStruct.id = `struct-${this.currentTable.key}`;
    clonedStruct.classList.add('struct');
    clonedStruct.querySelector('text').innerHTML = this.currentTable.name;
    // clonedStruct.querySelector('text').innerHTML = this.currentTable.table;
    // clonedStruct.querySelector('image').dataset.id = this.currentTable.key;
    // lo aggiungo al defs
    this.svg.querySelector('defs').appendChild(clonedStruct);
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#${clonedStruct.id}`);
    use.id = this.currentTable.key;
    use.classList.add('table');
    use.dataset.id = `data-${this.currentTable.id}`;
    use.dataset.table = this.currentTable.table;
    use.dataset.alias = this.currentTable.alias;
    use.dataset.factId = this.currentTable.factId;
    // tutte le tabelle hanno la prop join, tranne la fact, dove NON aggiungo 'tableJoin' e dimensionId
    use.dataset.tableJoin = this.currentTable.join;
    use.dataset.dimensionId = this.currentTable.dimensionId;
    use.dataset.name = this.currentTable.name;
    use.dataset.schema = this.currentTable.schema;
    use.dataset.joins = this.currentTable.joins;
    // use.dataset.fn = 'tableSelected';
    use.dataset.enterFn = 'tableEnter';
    // use.onmouseover = this.handlerOver.bind(Draw);
    // use.onmouseleave = this.handlerLeave.bind(Draw);
    use.ondblclick = this.handlerDblClick.bind(Draw);
    // use.dataset.leaveFn = 'tableLeave';
    use.dataset.x = this.currentTable.x;
    use.dataset.y = this.currentTable.y;
    use.setAttribute('x', this.currentTable.x);
    use.setAttribute('y', this.currentTable.y);
    // punto di ancoraggio di destra
    use.dataset.anchorXTo = this.currentTable.x + 190;
    use.dataset.anchorYTo = this.currentTable.y + 12;
    // punto di ancoraggio di sinistra
    use.dataset.anchorXFrom = this.currentTable.x - 10;
    use.dataset.anchorYFrom = this.currentTable.y + 12;
    use.addEventListener('mousedown', this.tableMouseDown.bind(this));
    use.addEventListener('mousemove', this.tableMouseMove.bind(this));
    use.addEventListener('mouseup', this.tableMouseUp.bind(this));
    use.addEventListener('mouseleave', this.tableMouseLeave.bind(this));
    Draw.svg.appendChild(use);
    this.table = use;
    this.currentLineRef.dataset.from = this.currentTable.key;
    // <animate> tag
    // const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    // animate.setAttribute('attributeName', 'y');
    // animate.setAttribute('dur', '.15s');
    // animate.setAttribute('fill', 'freeze');
    // use.appendChild(animate);
  }

  drawTime() {
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#time');
    use.id = this.currentTable.key;
    use.classList.add('time');
    use.dataset.id = `data-${this.currentTable.id}`;
    use.dataset.table = this.currentTable.table;
    use.dataset.name = this.currentTable.name;
    use.dataset.alias = this.currentTable.alias;
    use.dataset.schema = this.currentTable.schema;
    use.setAttribute('x', this.currentTable.x);
    use.setAttribute('y', this.currentTable.y);
    use.dataset.x = this.currentTable.x;
    use.dataset.y = this.currentTable.y;
    Draw.svg.appendChild(use);
  }

  drawLine() {
    // from: fa riferimento alla partenza della linea dalla tabella corrente
    // to: fa riferimento alla tabella di destinazione della linea (tablejoin)
    // console.log(this.currentLine.from, this.currentLine.to);
    if (Object.keys(this.currentLine).length === 0) return;
    // coordsTo : tabella a cui si aggancia la linea (tableJoin)
    // coordsTo restituisce il punto "di destra" della tabella a cui collegare la tabella corrente
    // console.log(this.tables.get(this.currentLine.to));
    // INFO: con l'utilizzo della logica dei 3 punti di ancoraggio questa non mi serve più
    // const coordsTo = {
    //   // x: this.tables.get(this.currentLine.to).line.bottomTo.x,
    //   x: this.tables.get(this.currentLine.to).line.to.x,
    //   // y: this.tables.get(this.currentLine.to).line.bottomTo.y
    //   y: this.tables.get(this.currentLine.to).line.to.y
    // };

    let coordsFrom; // il punto di ancoraggio della tabella che sto droppando
    switch (this.nearestPoint.anchor) {
      case 'bottom':
        // il punto di ancoraggio della tablejoin è 'bottom' quindi il punto di ancoraggio della tabella
        // corrente è top
        coordsFrom = { x: this.currentLine.coordsBottomFrom.x, y: this.currentLine.coordsBottomFrom.y };
        break;
      // case 'left':
      //   // left si riferisce alla tableJoin, quindi, il punto di ancoraggio della tabella corrente
      //   // è a destra.
      //   coordsFrom = { x: this.currentLine.from.x + 30, y: this.currentLine.from.y + 10 };
      //   break;
      case 'right':
        coordsFrom = { x: this.currentLine.coordsFrom.x, y: this.currentLine.coordsFrom.y };
        break;
      default:
        break;
    }

    // console.log(coordsFrom);

    // se la tableJoin è una fact agginugo la css class fact-line alla linea che sto disegnando
    // La linea tratteggiata compare SOLO quando si sta aggiungendo al punto di ancoraggio 'bottom'.
    // In questo modo, sto indicando all'utente, che in questo punto di ancoraggio si può droppare una
    // Fact per consentire l'analisi multifatti
    (this.tableJoin.table.classList.contains('fact') && this.nearestPoint.anchor === 'bottom') ?
      this.currentLineRef.classList.add('factLine') :
      this.currentLineRef.classList.remove('factLine');
    // OPTIMIZE:
    switch (this.nearestPoint.anchor) {
      case 'right':
        this.line = {
          x1: this.nearestPoint.x, // start point
          y1: this.nearestPoint.y,
          p1x: this.nearestPoint.x + 40, // control point 1
          p1y: this.nearestPoint.y,
          p2x: coordsFrom.x - 40, // control point 2
          p2y: coordsFrom.y,
          x2: coordsFrom.x, // end point
          y2: coordsFrom.y
        }
        break;
      case 'bottom':
        if ((coordsFrom.x >= this.nearestPoint.x - 20) && (coordsFrom.x <= this.nearestPoint.x + 20)) coordsFrom.x = this.nearestPoint.x;
        this.line = {
          // x1: nearestPoint.x, // start point
          x1: this.tableJoin.bottom, // start point
          y1: this.nearestPoint.y,
          p1x: this.nearestPoint.x, // control point 1
          p1y: this.nearestPoint.y + 40,
          p2x: coordsFrom.x, // control point 2
          p2y: coordsFrom.y - 40,
          x2: coordsFrom.x, // end point
          y2: coordsFrom.y
        }
        break;
    }
    /* this.line = {
      x1: nearestPoint.x, // start point
      y1: nearestPoint.y,
      p1x: nearestPoint.x + 40, // control point 1
      p1y: nearestPoint.y,
      p2x: coordsFrom.x - 40, // control point 2
      p2y: coordsFrom.y,
      x2: coordsFrom.x, // end point
      y2: coordsFrom.y
    }; */
    const d = `M${this.line.x1},${this.line.y1} C${this.line.p1x},${this.line.p1y} ${this.line.p2x},${this.line.p2y} ${this.line.x2},${this.line.y2}`;
    this.currentLineRef = this.currentLine.key;
    // console.log(this.currentLineRef);
    this.currentLineRef.dataset.startX = this.line.x1;
    this.currentLineRef.dataset.startY = this.line.y1;
    this.currentLineRef.dataset.endX = this.line.x2;
    this.currentLineRef.dataset.endY = this.line.y2;
    // 'from' viene impostato in drawTable(), perchè ancora non è stata droppata la tabella
    this.currentLineRef.dataset.to = this.tableJoin.table.id;
    this.currentLineRef.setAttribute('d', d);
    if (this.currentLineRef.hasChildNodes()) {
      const animLine = this.currentLineRef.querySelector('animate');
      animLine.setAttribute('to', d);
      animLine.beginElement();
    }
  }

  deleteJoinLine(key) {
    if (key) {
      this.joinLines.delete(key);
      this.svg.querySelector(`#${key}`).remove();
    }
  }

  /* joinTablePositioning() {
    // recupero tutte le tabelle con data-joins > 1 partendo dal livello più alto (l'ultimo)
    // ciclo dal penultimo livello fino a 0 per riposizionare tutti gli elementi che hanno più di 1 join con altre tabelle
    // debugger;
    this.arrayLevels.forEach(levelId => {
      // il primo ciclo recupera le tabelle del penultimo level (le tabelle dell'ultimo level non hanno altre tabelle collegate ad esse)
      this.svg.querySelectorAll(`use.table[data-level-id='${levelId}']:not([data-joins='0'])`).forEach(table => {
        let y = 0;
        // verifico la posizione y delle tabelle legate in join con quella in ciclo
        for (let properties of this.tables.values()) {
          if (properties.join === table.id) y += properties.y;
        }
        const yResult = (y / +table.dataset.joins);
        // la tabella in ciclo verrà riposizionata in base a y calcolato.
        // Se sono presenti due tabelle in join con 'table' (in ciclo) le posizioni y di queste tabelle vengono sommate (nel for) e
        // ...poi divise per il numero di tabelle join, in questo modo la tabella in ciclo viene posizionata al centro
        this.tables.get(table.id).y = yResult;
        this.tables.get(table.id).line.from.y = yResult + 12;
        this.tables.get(table.id).line.to.y = yResult + 12;
        this.currentTable = this.tables.get(table.id);
        this.autoPosition();
      });
    });
    this.autoPositionLine();
  } */

  autoPos() {
    const d = `M${this.line.x1},${this.line.y1} C${this.line.p1x},${this.line.y1} ${this.line.p2x},${this.currentTable.y - 10} ${this.line.x2},${this.currentTable.y - 10}`;
    this.currentLineRef = this.currentLine.key;
    this.currentLineRef.setAttribute('d', d);
    if (this.currentLineRef.hasChildNodes()) {
      const animLine = this.currentLineRef.querySelector('animate');
      animLine.setAttribute('to', d);
      animLine.beginElement();
    }

  }

  autoPosition() {
    const use = this.svg.querySelector(`#${this.currentTable.key}`);
    const animate = use.querySelector('animate');
    // sposto le tabelle con <animation>
    // stabilisco la posizione di partenza, nel from
    animate.setAttribute('from', +use.dataset.y);
    animate.setAttribute('to', this.currentTable.y);
    animate.beginElement();

    // aggiorno i valori presenti nel DOM
    use.dataset.y = this.currentTable.y;
    use.setAttribute('y', this.currentTable.y);
    // verifico la posizione del max x/y all'interno dell'svg per fare un resize di width/height dell'svg
    this.checkResizeSVG();
  }

  /* autoPositionLine() {
    for (const [key, properties] of this.joinLines) {
      this.currentLine = properties;
      this.currentLineRef = key;
      this.currentLineRef.dataset.fn = 'lineSelected';
      this.currentLineRef.dataset.from = properties.from;
      this.currentLineRef.dataset.to = properties.to;
      if (properties.name) this.currentLineRef.dataset.joinId = properties.name;
      // per ogni linea creo un'elemento <animation>
      const animLine = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      animLine.setAttribute('attributeName', 'd');
      animLine.setAttribute('fill', 'freeze');
      animLine.setAttribute('dur', '.15s');
      animLine.setAttribute('from', this.currentLineRef.getAttribute('d'));
      this.currentLineRef.replaceChildren(animLine);
      this.drawLine();
    }
  } */

  addFactJoin() {
    // clono la tabella
    const clone = this.table.cloneNode(true);
    clone.id = `${this.table.id}-clone`;
    clone.classList.add('clone');
    // la sposto leggermente rispetto alla tabella di origine
    clone.setAttribute('x', +this.table.getAttribute('x') + 8);
    clone.setAttribute('y', +this.table.getAttribute('y') + 36);
    clone.dataset.x = +clone.getAttribute('x');
    clone.dataset.y = +clone.getAttribute('y');
    // aggiungo gli stessi eventi della tabella originale
    clone.addEventListener('mousedown', this.tableMouseDown.bind(this));
    clone.addEventListener('mousemove', this.tableMouseMove.bind(this));
    clone.addEventListener('mouseup', this.tableMouseUp.bind(this));
    clone.addEventListener('mouseleave', this.tableMouseLeave.bind(this));
    this.svg.appendChild(clone);
    // clono anche la sua linea andando a cercare la line con data-from = this.table.id
    const line = this.svg.querySelector(`path[data-from='${this.table.id}']`);
    const lineClone = line.cloneNode();
    lineClone.id = `${line.id}-clone`;
    lineClone.dataset.from = `${line.dataset.from}-clone`;
    // recupero la posizione a cui è legata la linea di origine
    const d = `M${+line.dataset.startX},${+line.dataset.startY} C${+line.dataset.startX + 40},${+line.dataset.startY} ${+clone.dataset.x - 40},${+clone.dataset.y + 12} ${+clone.dataset.x - 10},${+clone.dataset.y + 12}`;
    lineClone.setAttribute('d', d);
    // elimino, dalla nuova linea clonata, il data-join-id, se presente, perchè qui sto creando una nuova join
    if ('joinId' in lineClone.dataset) delete lineClone.dataset.joinId;
    this.svg.appendChild(lineClone);
    this.currentLineRef = lineClone.id;
    // aggiungo all'oggetto Map() Draw.joinLines la nuova linea clonata
    this.joinLines = {
      id: this.currentLineRef.id,
      properties: {
        id: this.currentLineRef.dataset.id,
        key: this.currentLineRef.id,
        coordsFrom: { x: +clone.dataset.x, y: +clone.dataset.y },
        coordsBottomFrom: { x: +clone.dataset.x + 90, y: +clone.dataset.y + 12 },
        from: line.dataset.from,
        to: line.dataset.to
      }
    };
  }

  contextMenuTable(e) {
    e.preventDefault();
    const btnAddFactJoin = document.getElementById('addFactJoin');
    // console.log(e.target.dataset);
    // console.log(e.target.getBoundingClientRect());
    // const { clientX: mouseX, clientY: mouseY } = e;
    // const { left: mouseX, top: mouseY } = e.target.getBoundingClientRect();
    const { left: mouseX, bottom: mouseY } = e.currentTarget.getBoundingClientRect();
    this.contextMenu.style.top = `${mouseY + 8}px`;
    this.contextMenu.style.left = `${mouseX}px`;
    // Imposto la activeTable relativa al context-menu
    WorkBook.activeTable = e.currentTarget.id;
    this.table = e.currentTarget;
    // Chiudo eventuali dlg-info aperte sul mouseEnter della use.table
    // if (app.dialogInfo.hasAttribute('open')) app.dialogInfo.close();
    this.contextMenu.toggleAttribute('open');
    // Imposto, sugli elementi del context-menu, l'id della tabella selezionata
    document.querySelectorAll('#ul-context-menu-table button').forEach(item => item.dataset.id = WorkBook.activeTable.id);
    // abilito "addJoin" se sono presenti due o più fact-table e se si è attivato il contextmenu
    // sull'ULTIMA tabella di una dimensione, quella legata alla Fact
    const facts = this.svg.querySelectorAll('use.table.fact').length;
    btnAddFactJoin.addEventListener('click', this.addFactJoin.bind(Draw));
    btnAddFactJoin.disabled = (facts > 1 && this.table.dataset.tableJoin === this.table.dataset.factId) ? false : true;
  }

  // aggiungo i campi di una tabella per creare la join
  addFields(source, response) {
    // source : from, to
    // console.log(source, response);
    const ul = this.dialogJoin.querySelector(`section[data-table-${source}] ul`);
    for (const [key, value] of Object.entries(response)) {
      const content = this.tmplList.content.cloneNode(true);
      const li = content.querySelector('li[data-li]');
      const span = li.querySelector('span');
      li.dataset.label = value.column_name;
      li.dataset.elementSearch = `${source}-fields`;
      li.dataset.tableId = WorkBook.activeTable.id;
      li.dataset.table = WorkBook.activeTable.dataset.table;
      li.dataset.alias = WorkBook.activeTable.dataset.alias;
      li.dataset.label = value.column_name;
      // li.dataset.key = value.CONSTRAINT_NAME;
      span.innerText = value.column_name;
      // scrivo il tipo di dato senza specificare la lunghezza, int(8) voglio che mi scriva solo int
      // let pos = value.DATA_TYPE.indexOf('(');
      // let type = (pos !== -1) ? value.DATA_TYPE.substring(0, pos) : value.DATA_TYPE;
      span.dataset.datatype = value.type_name.toLowerCase();
      // span.dataset.key = value.CONSTRAINT_NAME; // pk : chiave primaria
      li.dataset.id = key;
      // span.id = key;
      // fn da associare all'evento in 'mutation observe'
      li.dataset.fn = 'addFieldToJoin';
      ul.appendChild(li);
    }
  }

  /* createDimensionInfo() {
    const parent = document.getElementById('table-info');
    // debugger;
    this.svg.querySelectorAll("use.table[data-level-id='1']").forEach(dim => {
      const div = document.createElement('div');
      div.innerText = dim.dataset.table;
      parent.appendChild(div);
    });
  } */

}
