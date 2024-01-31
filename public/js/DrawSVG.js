class DrawSVG {
  #tables = new Map();
  #joinLines = new Map();
  #dimensions = new Set();
  #dimensionSelected = {};
  tmplJoin = document.getElementById('tmpl-join-field');
  dialogJoin = document.getElementById('dlg-join');
  // ref nel DOM
  #currentLineRef;
  #currentTableRef;

  constructor(element) {
    this.svg = document.getElementById(element);
    this.svg.dataset.height = this.svg.parentElement.offsetHeight;
    this.svg.dataset.width = this.svg.parentElement.offsetWidth;
    this.contextMenu = document.getElementById('context-menu-table');
    this.currentLevel;
    this.currentTable = {}, this.currentLine = {};
    // la tabella più vicina alle coordinate del mouse (durante il drag&drop e il mousemove)
    this.nearestTable = null;
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

  set currentTableRef(value) {
    this.#currentTableRef = this.svg.querySelector(`#${value}`);
  }

  get currentTableRef() { return this.#currentTableRef; }

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
      this.nearestTable;
    }
    // console.log(e.dataTransfer);
    e.dataTransfer.effectAllowed = "copy";
  }

  handlerDragOver(e) {
    e.preventDefault();
    if (e.currentTarget.classList.contains('dropzone')) {
      e.dataTransfer.dropEffect = "copy";
      this.coordsRef.innerHTML = `<small>x ${e.offsetX}</small><br /><small>y ${e.offsetY}</small>`;
      if (this.countTables > 0) {
        // viene utilizzato il calcolo dell'ipotenusa con il valore assoluto per stabilire qual'è la tabella più vicina
        this.nearestTable = [...this.svg.querySelectorAll('use.table:not(.common)')].reduce((prev, current) => {
          return (Math.hypot(e.offsetX - (+current.dataset.anchorXTo), e.offsetY - (+current.dataset.anchorYTo)) < Math.hypot(e.offsetX - (+prev.dataset.anchorXTo), e.offsetY - (+prev.dataset.anchorYTo))) ? current : prev;
          // return (Math.hypot(e.offsetX - (+current.dataset.x + 190), e.offsetY - (+current.dataset.y + 12)) < Math.hypot(e.offsetX - (+prev.dataset.x + 190), e.offsetY - (+prev.dataset.y + 12))) ? current : prev;
        });
        // console.log(nearestTable.id);
        const rectBounding = this.nearestTable.getBoundingClientRect();
        // console.log(rectBounding);
        // tableJoin identifica la tabella più vicina trovata rispetto al movimento del mouse
        // TODO: creo il currentLine che mi servirà per disegnare la linea e, in drop(), creo il this.joinLines() che verrà
        // memorizzato in localStorage. Successivamente il this.joinLines viene richiamato in fase di open() del workbook

        if (this.currentLineRef && this.nearestTable) {
          this.joinLines = {
            id: this.currentLineRef.id,
            properties: {
              id: this.currentLineRef.dataset.id,
              key: this.currentLineRef.id,
              coordsFrom: { x: (e.offsetX - this.dragElementPosition.x - 10), y: (e.offsetY - this.dragElementPosition.y + 12) },
              // coordsBottomFrom: { x: (e.offsetX - this.dragElementPosition.x + 12), y: (e.offsetY - this.dragElementPosition.y - 12) },
              coordsBottomFrom: { x: (e.offsetX - this.dragElementPosition.x + 12), y: (e.offsetY - this.dragElementPosition.y - 4) },
              from: null, // questo viene popolato nel handlerDrop, dopo aver ottenuto l'id dell'elemento nel DOM
              to: this.nearestTable.id,
              start: { x: +this.nearestTable.dataset.anchorXTo, y: +this.nearestTable.dataset.anchorYTo },
              end: null
            }
          };
          this.currentLine = this.joinLines.get(this.currentLineRef.id);
        }

        // let testCoords = [{ x: 305, y: 70 }, { x: 210, y: 85 }];
        // creo 2 punti di ancoraggio (right, bottom) per la Fact e un solo punto di anchor
        // per le tabelle dimensionali
        // se NON è presente nemmeno una dimensione (tabella dimensionale) non posso ancora aggiungere
        // la seconda Fact, quindi creo solo un punto di anchor, quello di destra.
        // Almeno un livello dimensionale deve essere già esistente altrimenti non si può selezionare
        // il livello dimensionale da mettere in comune tra le due fact
        const anchorPoints = (this.countJoins >= 1 && this.nearestTable.classList.contains('fact')) ?
          [
            { x: +this.nearestTable.dataset.anchorXTo, y: +this.nearestTable.dataset.anchorYTo, anchor: 'right' }, // right
            { x: +this.nearestTable.getAttribute('x') + (rectBounding.width / 2), y: +this.nearestTable.getAttribute('y') + (rectBounding.height / 2), anchor: 'bottom' } // botton
          ] :
          [
            { x: +this.nearestTable.dataset.anchorXTo, y: +this.nearestTable.dataset.anchorYTo, anchor: 'right' }, // right
            // { x: this.tableJoin.x - 95, y: this.tableJoin.y + 32, anchor: 'bottom' } // botton
            // { x: +nearestTable.dataset.x - 10, y: this.tableJoin.y, anchor: 'left' } // left
          ];

        this.nearestPoint = anchorPoints.reduce((prev, current) => {
          return (Math.hypot(e.offsetX - current.x, e.offsetY - current.y) < Math.hypot(e.offsetX - prev.x, e.offsetY - prev.y)) ? current : prev;
        });
        console.log('nearestPoin: ', this.nearestPoint);
        // this.drawLine();
        if (this.currentLineRef) {
          let from = { x: (e.offsetX - this.dragElementPosition.x - 10), y: (e.offsetY - this.dragElementPosition.y + 12) };
          if (this.nearestPoint.anchor === 'right') {
            this.line = {
              x1: this.nearestPoint.x, // start point
              y1: this.nearestPoint.y,
              p1x: this.nearestPoint.x + 40, // control point 1
              p1y: this.nearestPoint.y,
              p2x: from.x - 40, // control point 2
              p2y: from.y,
              x2: from.x, // end point
              y2: from.y
            }
          } else {
            // bottom
            let from = { x: (e.offsetX - this.dragElementPosition.x + 12), y: (e.offsetY - this.dragElementPosition.y - 4) };
            if ((from.x >= this.nearestPoint.x - 20) && (from.x <= this.nearestPoint.x + 20)) from.x = this.nearestPoint.x;

            // se la tableJoin è una fact agginugo la css class fact-line alla linea che sto disegnando
            // La linea tratteggiata compare SOLO quando si sta aggiungendo al punto di ancoraggio 'bottom'.
            // In questo modo, sto indicando all'utente, che in questo punto di ancoraggio si può droppare una
            // Fact per consentire l'analisi multifatti
            (this.nearestTable.classList.contains('fact')) ?
              this.currentLineRef.classList.add('factLine') :
              this.currentLineRef.classList.remove('factLine');

            this.line = {
              x1: this.nearestPoint.x, // start point
              y1: this.nearestPoint.y + 4,
              p1x: this.nearestPoint.x, // control point 1
              p1y: this.nearestPoint.y + 40,
              p2x: from.x, // control point 2
              p2y: from.y - 40,
              x2: from.x, // end point
              y2: from.y
            }
          }

          const d = `M${this.line.x1},${this.line.y1} C${this.line.p1x},${this.line.p1y} ${this.line.p2x},${this.line.p2y} ${this.line.x2},${this.line.y2}`;
          this.currentLineRef.setAttribute('d', d);
          this.currentLineRef.dataset.to = this.nearestTable.id;
          /* if (this.currentLine.hasOwnProperty('class')) {
            this.currentLineRef.classList.add = this.currentLine.class;
          } else {
            // 'from' viene impostato in handlerDrop(), perchè qui ancora non è stata droppata la tabella
            this.currentLineRef.dataset.to = this.nearestTable.id;
          } */
        }
        this.currentLineRef = this.currentLine.key;
        this.currentLineRef.dataset.startX = this.line.x1;
        this.currentLineRef.dataset.startY = this.line.y1;
        this.currentLineRef.dataset.endX = this.line.x2;
        this.currentLineRef.dataset.endY = this.line.y2;
      }
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  }

  handlerDragEnter(e) {
    e.preventDefault();
    if (e.currentTarget.classList.contains('dropzone')) {
      console.info('DROPZONE');
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
    // alcune proprietà di this.tables sono presente sia quando viene droppataa una Fact che quando
    // viene droppata una tabella dimensionale
    this.tables = {
      id: `svg-data-${tableId}`,
      properties: {
        // id: tableId,
        key: `svg-data-${tableId}`,
        x: coords.x,
        y: coords.y,
        table: liElement.dataset.label,
        alias: `${liElement.dataset.label}_${time.substring(time.length - 3)}`,
        name: liElement.dataset.label,
        schema: liElement.dataset.schema,
        join: null,
        joins: 0,
        cssClass: null
      }
    };

    if (!this.nearestTable) {
      // nessuna tabella da mettere in join (prima tabella)
      this.tables.get(`svg-data-${tableId}`).factId = `svg-data-${tableId}`;
      this.tables.get(`svg-data-${tableId}`).cssClass = 'fact';
      this.currentTable = this.tables.get(`svg-data-${tableId}`);
      this.drawFact();
    } else if (this.nearestTable && this.currentLineRef.classList.contains('factLine')) {
      // Aggiunta di una Fact per l'analisi MultiFact (linea di join verticale)
      // la nuova fact è visualizzata immediatamente sotto la prima fact
      // recupero le coordinate del e.target
      this.tables.get(`svg-data-${tableId}`).x = +this.nearestTable.getAttribute('x');
      this.tables.get(`svg-data-${tableId}`).factId = `svg-data-${tableId}`;
      this.tables.get(`svg-data-${tableId}`).cssClass = 'fact';
      this.currentTable = this.tables.get(`svg-data-${tableId}`);
      delete this.joinLines.get(this.currentLineRef.id).from;
      delete this.joinLines.get(this.currentLineRef.id).to;
      // imposto la proprietà end : {x,y} qui, dove il drop è terminato e definitivo
      this.joinLines.get(this.currentLineRef.id).start = { x: this.nearestPoint.x, y: this.nearestPoint.y - 4 };
      this.joinLines.get(this.currentLineRef.id).end = { x: this.currentTable.x + 90, y: this.currentTable.y - 4 };
      this.joinLines.get(this.currentLineRef.id).class = 'factLine';
      // impostando il 'from' in joinLines automaticamente lo imposto anche in this.currentLine
      // ... resta da impostare l'attributo from in this.currentLineRef
      // this.currentLineRef.dataset.from = `svg-data-${tableId}`;
      console.log(this.currentLine);
      // this.createDimensionInfo();
      this.drawFact();
      this.reDrawLine();
    } else {
      // è presente una tableJoin, è un livello dimensionale
      // OPTIMIZE: potrei creare un Metodo nella Classe Draw che imposta la prop 'join'
      // ...in Draw.tables e, allo stesso tempo, imposta anche 'dataset.joins'
      // ...sull'elemento 'use.table' come fatto sulle due righe successive

      // calcolo quante tabelle sono legate a q nearestTable (quante dimensioni ci sono)
      // per aggiornare la proprietà 'joins'
      this.nearestTable.dataset.joins = ++this.nearestTable.dataset.joins;
      this.tables.get(this.nearestTable.id).joins = +this.nearestTable.dataset.joins;
      // imposto il data-dimensionId
      // se la tabella droppata è legata direttamente alla fact (ultima tabella della gerarchia)
      // incremento il dimensionId (è una nuova dimensione, l'id è basato su tableJoin.dataset.joins)
      // se la tabella corrente sta per essere legata a una Fact creo il token per identificare la dimensione
      this.tables.get(`svg-data-${tableId}`).dimensionId = (this.nearestTable.classList.contains('fact')) ?
        this.rand().substring(0, 4) : this.nearestTable.dataset.dimensionId;
      // imposto la proprietà 'tables' della Classe Draw
      // imposto solo le proprietà che sono presenti in una tabella dimensionale
      this.tables.get(`svg-data-${tableId}`).join = this.nearestTable.id;
      this.tables.get(`svg-data-${tableId}`).factId = this.nearestTable.dataset.factId;
      this.tables.get(`svg-data-${tableId}`).cssClass = 'tables';
      // this.tables.get(`svg-data-${tableId}`).dimensionId = dimensionId;
      // salvo i dati della joinLines per poter essere salvata correttamente nel WorkBook in localStorage
      this.currentTable = this.tables.get(`svg-data-${tableId}`);
      // linea di join da tableJoin alla tabella droppata (questa deve essere impostata DOPO this.currentTable
      // perchè vengono prese da lì le coordinate "finali" della tabella droppata)
      // imposto solo la proprietà 'from' rimasta "in sospeso" in handlerDragOver perchè in quell'evento non
      // ho ancora l'elemento nel DOM
      this.joinLines.get(this.currentLineRef.id).from = `svg-data-${tableId}`;
      // imposto la proprietà end : {x,y} qui, dove il drop è terminato e definitivo
      this.joinLines.get(this.currentLineRef.id).end = { x: this.currentTable.x - 10, y: this.currentTable.y + 12 };
      // impostando il 'from' in joinLines automaticamente lo imposto anche in this.currentLine
      // ... resta da impostare l'attributo from in this.currentLineRef
      this.currentLineRef.dataset.from = `svg-data-${tableId}`;
      console.log(this.currentLine);
      // creo nel DOM la tabella appena droppata
      this.drawTable();
    }
    this.currentTableRef = `svg-data-${tableId}`;
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
    this.nearestTable = null;
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
      // e.currentTarget.dataset.x = this.coordinate.x;
      // e.currentTarget.dataset.y = this.coordinate.y;
      e.currentTarget.setAttribute('x', this.coordinate.x);
      e.currentTarget.setAttribute('y', this.coordinate.y);
      // se è presente una sola tabella nel canvas non eseguo il codice successivo, non c'è bisogno
      // di legare la linea di join
      if (this.countTables === 1) return false;

      this.currentLineRef = this.svg.querySelector(`path[data-from='${e.target.id}']`).id;
      if (this.el.classList.contains('common')) {
        // se sto spostando una tabella da mettere in comune tra più fact la posso legare solo alle Fact
        // nella ricerca della tabella più vicina escludo la tabella che sto spostando
        // inoltre, la tabella .common, non può essere legata alla stessa Fact a cui è legata la tabella .shared
        let tables = (e.currentTarget.classList.contains('common')) ?
          this.svg.querySelectorAll(`use.table.fact:not(#${this.svg.querySelector('use.shared').dataset.factId})`) :
          this.svg.querySelectorAll(`use.table:not(#${e.target.id}, .common)`);

        this.nearestTable = [...tables].reduce((prev, current) => {
          return (Math.hypot(this.coordinate.x - (+current.dataset.anchorXTo), this.coordinate.y - (+current.dataset.anchorYTo)) < Math.hypot(this.coordinate.x - (+prev.dataset.anchorXTo), this.coordinate.y - (+prev.dataset.anchorYTo))) ? current : prev;
          // return (Math.hypot(+e.target.dataset.x - (+current.dataset.x + 190), e.offsetY - (+current.dataset.y + 12)) < Math.hypot(+e.target.dataset.x - (+prev.dataset.x + 190), e.offsetY - (+prev.dataset.y + 12))) ? current : prev;
        });

        e.currentTarget.dataset.factId = this.nearestTable.id;
        e.currentTarget.dataset.tableJoin = this.nearestTable.id;
        // this.currentLineRef.dataset.to = nearestTable.id;
        const d = `M${+this.nearestTable.dataset.anchorXTo},${+this.nearestTable.dataset.anchorYTo} C${+this.nearestTable.dataset.anchorXTo + 40},${+this.nearestTable.dataset.anchorYTo} ${this.coordinate.x - 40},${this.coordinate.y + 12} ${this.coordinate.x - 10},${this.coordinate.y + 12}`;
        this.currentLineRef.setAttribute('d', d);
        this.currentLineRef.dataset.startX = +this.nearestTable.dataset.anchorXTo;
        this.currentLineRef.dataset.startY = +this.nearestTable.dataset.anchorYTo;
      } else {
        // in questo caso non devo cercare la nearestTable perchè non voglio modificare la join
        // presente con questa tabella, lo valorizzo con il valore già presente
        this.nearestTable = this.svg.querySelector(`#${e.target.dataset.tableJoin}`);
        /* prova calcolo controPoints
         * const controlPoints = +this.currentLineRef.dataset.startX + (this.coordinate.x - (+this.currentLineRef.dataset.startX)) / 2;
        const d = `M${+this.currentLineRef.dataset.startX},${+this.currentLineRef.dataset.startY} C${controlPoints},${+this.currentLineRef.dataset.startY} ${controlPoints},${this.coordinate.y + 12} ${this.coordinate.x - 10},${this.coordinate.y + 12}`; */
        // const d = `M${+this.currentLineRef.dataset.startX},${+this.currentLineRef.dataset.startY} C${+this.currentLineRef.dataset.startX + 40},${+this.currentLineRef.dataset.startY} ${this.coordinate.x - 40},${this.coordinate.y + 12} ${this.coordinate.x - 10},${this.coordinate.y + 12}`;
        const d = `M${+this.nearestTable.dataset.anchorXTo},${+this.nearestTable.dataset.anchorYTo} C${+this.nearestTable.dataset.anchorXTo + 40},${+this.nearestTable.dataset.anchorYTo} ${this.coordinate.x - 40},${this.coordinate.y + 12} ${this.coordinate.x - 10},${this.coordinate.y + 12}`;
        this.currentLineRef.setAttribute('d', d);
      }
      this.currentLineRef.dataset.endX = this.coordinate.x - 10;
      this.currentLineRef.dataset.endY = this.coordinate.y + 12;
      // TODO: 29.01.2024 - Implementare lo spostamento della linea di destra della tabella e.target
      // const lines = this.svg.querySelectorAll(`path[data-to='${e.target.id}']`);
      // console.log(lines);
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
    delete this.el;
    if (e.button === 2 || this.countTables === 1) return false;
    console.log(this.currentTable);
    this.tables.get(e.currentTarget.id).x = +e.currentTarget.getAttribute('x');
    this.tables.get(e.currentTarget.id).y = +e.currentTarget.getAttribute('y');
    // this.tables.get(e.currentTarget.id).join = this.tableJoin.table.id;
    // this.tables.get(e.currentTarget.id).factId = this.tableJoin.table.dataset.factId;
    // TODO: qui non devo "disegnare" la tabella spostata
    // (perchè non è un drop ma la tabella è già all'interno del canvas), quindi aggiorno qui
    // l'elemento nel DOM (use.table)
    this.currentTable = this.tables.get(e.currentTarget.id);
    // calcolo quante tabelle sono legate a q nearestTable (quante dimensioni ci sono)
    // per aggiornare la proprietà 'joins'
    const joins = this.svg.querySelectorAll(`use.table[data-table-join=${this.nearestTable.id}]`).length;
    this.nearestTable.dataset.joins = joins;
    this.tables.get(this.nearestTable.id).joins = joins;
    this.updateTable();
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
    this.joinLines.get(this.currentLineRef.id).start.x = +this.currentLineRef.dataset.startX;
    this.joinLines.get(this.currentLineRef.id).start.y = +this.currentLineRef.dataset.startY;
    this.joinLines.get(this.currentLineRef.id).end.x = +this.currentLineRef.dataset.endX;
    this.joinLines.get(this.currentLineRef.id).end.y = +this.currentLineRef.dataset.endY;
    this.nearestTable;
    console.log('nearestTable', this.nearestTable);

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
    console.log(this.currentLineRef.dataset.from);

    const from = this.tables.get(this.currentLineRef.dataset.from);
    // const from = this.tables.get(this.joinLines.get(this.currentLineRef.id).from);
    const to = this.tables.get(this.currentLineRef.dataset.to);
    // const to = this.tables.get(this.joinLines.get(this.currentLineRef.id).to);
    // debugger;

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
    // use.dataset.id = `data-${this.currentTable.id}`;
    use.dataset.table = this.currentTable.table;
    use.dataset.factId = this.currentTable.factId;
    use.dataset.alias = this.currentTable.alias;
    // tutte le tabelle hanno la prop join, tranne la fact, dove NON aggiungo 'tableJoin' e dimensionId
    use.classList.add(this.currentTable.cssClass);
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

  updateTable() {
    // qui aggiorno l'elemento del DOM che è stato spostato, quando non si utilizza il drag&drop
    const use = this.svg.querySelector(`#${this.currentTable.key}`);
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
    // this.table = use;
    this.currentLineRef.dataset.from = this.currentTable.key;
  }

  drawCommonTable() {
    let commonStruct = this.svg.querySelector('#table-common').cloneNode(true);
    // const originTable = this.table;
    commonStruct.id = `struct-common-${this.currentTable.key}`;
    commonStruct.classList.add('struct', 'common');
    commonStruct.querySelector('text').innerHTML = this.currentTable.name;
    this.svg.querySelector('defs').appendChild(commonStruct);
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#${commonStruct.id}`);

    use.id = this.currentTable.key;
    use.classList.add('table');
    use.classList.add(this.currentTable.cssClass);
    // use.dataset.id = this.currentTable.id;
    use.dataset.tableJoin = this.currentTable.join;
    use.dataset.table = this.currentTable.table;
    use.dataset.factId = this.currentTable.factId;
    use.dataset.alias = this.currentTable.alias;
    use.dataset.dimensionId = this.currentTable.dimensionId;
    use.dataset.name = this.currentTable.name;
    use.dataset.schema = this.currentTable.schema;
    use.dataset.joins = this.currentTable.joins;
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
    // la tabella di origine viene "contrassegnata" con la cssClass "shared"
    this.svg.appendChild(use);
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
    use.classList.add(this.currentTable.cssClass);
    // use.classList.add('table');
    // if (this.currentTable.cssClass === 'shared') use.classList.add(this.currentTable.cssClass);
    // use.dataset.id = `data-${this.currentTable.id}`;
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

  /* drawLine() {

    this.currentLineRef = this.currentLine.key;
    // console.log(this.currentLineRef);
    this.currentLineRef.dataset.startX = this.line.x1;
    this.currentLineRef.dataset.startY = this.line.y1;
    this.currentLineRef.dataset.endX = this.line.x2;
    this.currentLineRef.dataset.endY = this.line.y2;
    if (this.currentLine.hasOwnProperty('class')) {
      this.currentLineRef.classList.add = this.currentLine.class;
    } else {
      // 'from' viene impostato in handlerDrop(), perchè qui ancora non è stata droppata la tabella
      this.currentLineRef.dataset.to = this.nearestTable.id;
    }
    this.currentLineRef.setAttribute('d', d);
    if (this.currentLineRef.hasChildNodes()) {
      const animLine = this.currentLineRef.querySelector('animate');
      animLine.setAttribute('to', d);
      animLine.beginElement();
    }
  } */

  reDrawLine() {
    this.line = {
      x1: this.nearestPoint.x, // start point
      y1: this.nearestPoint.y + 4,
      p1x: this.nearestPoint.x, // control point 1
      p1y: this.nearestPoint.y + 40,
      p2x: this.nearestPoint.x, // control point 2
      p2y: this.currentLine.end.y - 40,
      x2: this.nearestPoint.x, // end point
      y2: this.currentLine.end.y
    }
    this.currentLineRef.dataset.startX = this.line.x1;
    this.currentLineRef.dataset.startY = this.line.y1;
    this.currentLineRef.dataset.endX = this.line.x2;
    this.currentLineRef.dataset.endY = this.line.y2;
    const d = `M${this.line.x1},${this.line.y1} C${this.line.p1x},${this.line.p1y} ${this.line.p2x},${this.line.p2y} ${this.line.x2},${this.line.y2}`;
    this.currentLineRef.setAttribute('d', d);
    /* const animLine = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animLine.setAttribute('attributeName', 'd');
    animLine.setAttribute('fill', 'freeze');
    animLine.setAttribute('dur', '.15s');
    animLine.setAttribute('from', this.currentLineRef.getAttribute('d'));
    // const animLine = this.currentLineRef.querySelector('animate');
    animLine.setAttribute('to', d);
    animLine.beginElement(); */
  }

  deleteJoinLine(key) {
    if (key) {
      this.joinLines.delete(key);
      this.svg.querySelector(`#${key}`).remove();
    }
  }

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

  addFactJoin() {
    // imposto, sulla tabella di origine, la cssClass 'shared'
    this.table.classList.add('shared');
    this.tables.get(this.table.id).cssClass = 'shared';

    this.tables = {
      id: `${this.table.id}-common`,
      properties: {
        key: `${this.table.id}-common`,
        x: +this.table.dataset.x + 8,
        y: +this.table.dataset.y + 26,
        table: this.table.dataset.name,
        alias: this.table.dataset.alias,
        name: this.table.dataset.name,
        schema: this.table.dataset.schema,
        join: null,
        joins: 0,
        factId: null,
        dimensionId: this.table.dataset.dimensionId,
        cssClass: 'common'
      }
    };

    this.currentTable = this.tables.get(`${this.table.id}-common`);
    console.log(this.currentTable);
    this.drawCommonTable();

    // clono anche la sua linea andando a cercare la line con data-from = this.table.id
    const line = this.svg.querySelector(`path[data-from='${this.table.id}']`);
    const lineClone = line.cloneNode();
    lineClone.id = `${line.id}-common`;
    lineClone.dataset.from = this.currentTable.key;
    // imposto la linea come quella di origine però questa tabella .common NON può
    // essere legata alla stessa Fact dove è legata la tabella .shared
    // Quindi cerco la Fact più vicina che non sia quella a cui è legata la tabella .shared
    // cerco la Fact a cui è legata .shared
    const sharedFact = this.svg.querySelector('use.shared').dataset.factId;
    let nearestTable = [...this.svg.querySelectorAll(`use.table.fact:not(#${sharedFact})`)].reduce((prev, current) => {
      return (Math.hypot(this.currentTable.x - (+current.dataset.x + 190), this.currentTable.y - (+current.dataset.y + 12)) < Math.hypot(this.currentTable.x - (+prev.dataset.x + 190), this.currentTable.y - (+prev.dataset.y + 12))) ? current : prev;
    });
    lineClone.dataset.to = nearestTable.id;
    lineClone.dataset.startX = +nearestTable.dataset.anchorXTo;
    lineClone.dataset.startY = +nearestTable.dataset.anchorYTo;
    const d = `M${+nearestTable.dataset.anchorXTo},${+nearestTable.dataset.anchorYTo} C${+nearestTable.dataset.anchorXTo + 40},${+nearestTable.dataset.anchorYTo} ${this.currentTable.x - 40},${this.currentTable.y + 12} ${this.currentTable.x - 10},${this.currentTable.y + 12}`;
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
        from: this.currentTable.key,
        to: nearestTable.id,
        start: { x: +nearestTable.dataset.anchorXTo, y: +nearestTable.dataset.anchorYTo },
        end: { x: this.currentTable.x - 10, y: this.currentTable.y + 12 }
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
