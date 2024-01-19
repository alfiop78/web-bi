class DrawSVG {
  #tables = new Map();
  #joinLines = new Map();
  #dimensions = new Set();
  #dimensionSelected = {};
  #currentLineRef; // ref
  tmplJoin = document.getElementById('tmpl-join-field');
  dialogJoin = document.getElementById('dlg-join');

  constructor(element) {
    this.svg = document.getElementById(element);
    this.svg.dataset.height = this.svg.parentElement.offsetHeight;
    this.svg.dataset.width = this.svg.parentElement.offsetWidth;
    this.currentLevel;
    this.currentTable = {}, this.currentLine = {};
    this.arrayLevels = [];
    this.dragElementPosition = { x: 0, y: 0 };
    this.coordsRef = document.getElementById('coords');
    this.nearestPoint = [];
    this.svg.addEventListener('dragover', this.handlerDragOver.bind(this), false);
    this.svg.addEventListener('drop', this.handlerDrop.bind(this), false);
    this.svg.addEventListener('dragenter', this.handlerDragEnter.bind(this), false);
    this.svg.addEventListener('dragleave', this.handlerDragLeave.bind(this), false);

    this.svg.addEventListener('mousemove', this.handlerMouseMove.bind(this), true);
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
    e.target.classList.add('dragging');
    this.dragElementPosition.x = e.offsetX;
    this.dragElementPosition.y = e.offsetY;
    // console.log(this.dragElementPosition);
    e.dataTransfer.setData('text/plain', e.target.id);
    // creo la linea
    if (this.countTables > 0) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const token = this.rand().substring(0, 4);
      // line.id = `line-${Draw.svg.querySelectorAll('use.table').length}`;
      // line.dataset.id = Draw.svg.querySelectorAll('use.table').length;
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
          return (Math.hypot(e.offsetX - (+current.dataset.x + 190), e.offsetY - (+current.dataset.y + 13)) < Math.hypot(e.offsetX - (+prev.dataset.x + 190), e.offsetY - (+prev.dataset.y + 13))) ? current : prev;
        });
        // console.log(nearestTable.id);
        const rectBounding = nearestTable.getBoundingClientRect();
        // console.log(rectBounding);
        this.tableJoin = {
          table: nearestTable,
          x: +nearestTable.dataset.x + rectBounding.width + 10,
          bottom: +nearestTable.dataset.x + rectBounding.width + 10 - 95,
          y: +nearestTable.dataset.y + (rectBounding.height / 2),
          joins: +nearestTable.dataset.joins,
          levelId: +nearestTable.dataset.levelId
        }
        // console.log('joinTable :', Draw.tableJoin);
        // console.log('tableJoin :', Draw.tableJoin.table.id);
        if (this.currentLineRef && this.tableJoin) {
          this.joinLines = {
            id: this.currentLineRef.id, properties: {
              id: this.currentLineRef.dataset.id,
              key: this.currentLineRef.id,
              coordsFrom: { x: (e.offsetX - this.dragElementPosition.x - 10), y: (e.offsetY - this.dragElementPosition.y + 13) },
              coordsBottomFrom: { x: (e.offsetX - this.dragElementPosition.x + 13), y: (e.offsetY - this.dragElementPosition.y - 13) },
              from: null, // questo viene popolato nel handlerDrop, dopo aver ottenuto l'id dell'elemento nel DOM
              to: this.tableJoin.table.id
            }
          };
          this.currentLine = this.joinLines.get(this.currentLineRef.id);
        }
        // let testCoords = [{ x: 305, y: 70 }, { x: 210, y: 85 }];
        // creo 2 punti di ancoraggio (right, bottom e left)
        const anchorPoints = [
          { x: this.tableJoin.x, y: this.tableJoin.y, anchor: 'right' }, // right
          { x: this.tableJoin.x - 95, y: this.tableJoin.y + 32, anchor: 'bottom' } // botton
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
      if (e.target.nodeName === 'use') this.currentLevel = +e.target.dataset.levelId;
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
    if (!this.tableJoin) {
      this.tables = {
        id: `svg-data-${tableId}`, properties: {
          id: tableId,
          key: `svg-data-${tableId}`,
          x: coords.x,
          y: coords.y,
          line: {
            to: { x: coords.x + 190, y: coords.y + 13 },
            from: { x: coords.x - 10, y: coords.y + 13 }
          },
          table: liElement.dataset.label,
          alias: `${liElement.dataset.label}_${time.substring(time.length - 3)}`,
          name: liElement.dataset.label,
          schema: liElement.dataset.schema,
          join: null,
          joins: 0,
          levelId: 0
        }
      };
    } else {
      // è presente una tableJoin
      // imposto data.joins anche sull'elemento SVG
      // OPTIMIZE: potrei creare un Metodo nella Classe Draw che imposta la prop 'join'
      // ...in Draw.tables e, allo stesso tempo, imposta anche 'dataset.joins'
      // ...sull'elemento 'use.table' come fatto sulle due righe successive
      this.svg.querySelector(`use.table[id="${this.tableJoin.table.id}"]`).dataset.joins = ++this.tableJoin.joins;
      // ... lo imposto anche nell'oggetto Map() tables
      this.tables.get(this.tableJoin.table.id).joins = this.tableJoin.joins;
      // livello che sto aggiungendo
      const levelId = this.tableJoin.levelId + 1;
      // creo un array dei livelli, ordinato in reverse per poter fare un ciclo dal penultimo livello fino al primo ed effettuare il posizionamento automatico
      if (!this.arrayLevels.includes(this.tableJoin.levelId)) this.arrayLevels.splice(0, 0, this.tableJoin.levelId);
      this.svg.dataset.level = (this.svg.dataset.level < levelId) ? levelId : this.svg.dataset.level;
      // imposto il data-dimensionId
      const dimensionId = (levelId === 1) ? +this.tableJoin.joins : +this.tableJoin.table.dataset.dimensionId;
      // imposto la proprietà 'tables' della Classe Draw
      this.tables = {
        id: `svg-data-${tableId}`, properties: {
          id: tableId,
          key: `svg-data-${tableId}`,
          x: coords.x,
          y: coords.y,
          line: {
            to: { x: coords.x + 190, y: coords.y + 13 }, // punto di ancoraggio di destra della tabella
            from: { x: coords.x - 10, y: coords.y + 13 } // punto di ancoraggio di sinistra della tabella
          },
          table: liElement.dataset.label,
          alias: `${liElement.dataset.label}_${time.substring(time.length - 3)}`,
          name: liElement.dataset.label,
          schema: liElement.dataset.schema,
          joins: 0,
          join: this.tableJoin.table.id,
          dimensionId,
          levelId
        }
      };
      // linea di join da tableJoin alla tabella droppata
      // imposto solo la proprietà 'from' rimasta "in sospeso" in handlerDragOver perchè in quell'evento non
      // ho ancora l'elemento nel DOM
      this.joinLines.get(this.currentLineRef.id).from = `svg-data-${tableId}`;
      // console.info('create JOIN');
      this.openJoinWindow();
      this.tables.get(`svg-data-${tableId}`).name;
    }
    this.currentTable = this.tables.get(`svg-data-${tableId}`);
    // creo nel DOM la tabella appena droppata
    this.drawTable();
    // imposto la tabella attiva per poter scaricare le colonne in sessionStorage (in handlerDragEnd())
    WorkBook.activeTable = `svg-data-${tableId}`;
    // imposto event contextmenu
    this.svg.querySelector(`#${this.currentTable.key}`).addEventListener('contextmenu', app.contextMenuTable);
    // posizionamento delle joinTable (tabelle che hanno data-join > 1)
    // this.joinTablePositioning();
  }

  /* NOTE: END DRAG&DROP EVENTS */

  /* NOTE: mouse events */

  handlerMouseMove(e) {
    this.coordsRef.innerHTML = `<small>x ${e.offsetX}</small><br /><small>y ${e.offsetY}</small>`;
  }

  /* NOTE: end mouse events */

  // Questa funzione restituisce i due elementi da aggiungere al DOM
  // Può essere invocata sia per creare una nuova join che
  // per creare/popolare una join esistente (ad es.: click sulla join line)
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
    // app.dialogJoin.dataset.open = 'false';
    this.dialogJoin.show();
    this.dialogJoin.dataset.lineId = this.currentLineRef.id;
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
        let joinFields = app.createJoinField();
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
    const from = this.tables.get(this.joinLines.get(this.currentLineRef.id).from);
    const to = this.tables.get(this.joinLines.get(this.currentLineRef.id).to);

    this.dialogJoin.querySelector('.joins section[data-table-from]').dataset.tableFrom = from.table;
    this.dialogJoin.querySelector('.joins section[data-table-from]').dataset.tableId = from.key;
    this.dialogJoin.querySelector('.joins section[data-table-from] .table').innerHTML = from.table;
    this.dialogJoin.querySelector('.joins section[data-table-to]').dataset.tableTo = to.table;
    this.dialogJoin.querySelector('.joins section[data-table-to]').dataset.tableId = to.key;
    this.dialogJoin.querySelector('.joins section[data-table-to] .table').innerHTML = to.table;
  }

  checkResizeSVG() {
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
  }

  handlerOver(e) {
    // console.log(e.currentTarget);
    // console.log(this);
    // NOTE: utilizzo di bind(). Qui, il this, si riferisce alla Classe Draw e non alla fn richiamata da evento
    this.svg.querySelectorAll(`use.table[data-multifact][data-dimension-id='${+e.currentTarget.dataset.dimensionId}']`).forEach(table => {
      table.dataset.related = 'true';
    });
  }

  // rimuovo il data-related a tutte le tabelle
  handlerLeave() { this.svg.querySelectorAll(`use.table[data-related]`).forEach(table => delete table.dataset.related); }

  handlerDblClick(e) {
    console.log(e.target);
    console.log(this);
    debugger;
  }

  handlerTableDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log(e.target);
    // rimuovo la linea di join
    // TODO: invece di rimuoverla potrei impostarla al punto di ancoraggio 'bottom'
    delete this.currentLine;
    this.currentLineRef.remove();
    const liElement = document.getElementById(e.dataTransfer.getData('text/plain'));
    const time = Date.now().toString();
    const tableId = time.substring(time.length - 5);
    // imposto tutte le dimensioni con il dataset.multi-fact per poterne consentire
    // l'evidenziazione e la selezione
    this.svg.querySelectorAll('use.table').forEach(table => table.dataset.multifact = true);
    console.log('dataset.multifact impostato');
    // la nuova fact è visualizzata immediatamente sotto la prima fact
    // recupero le coordinate del e.target
    const coords = { x: +e.target.dataset.x, y: +e.target.dataset.y + 40 };
    this.tables = {
      id: `svg-data-${tableId}`, properties: {
        id: tableId,
        key: `svg-data-${tableId}`,
        x: coords.x,
        y: coords.y,
        line: {
          to: { x: coords.x + 190, y: coords.y + 13 },
          from: { x: coords.x - 10, y: coords.y + 13 }
        },
        table: liElement.dataset.label,
        alias: `${liElement.dataset.label}_${time.substring(time.length - 3)}`,
        name: liElement.dataset.label,
        schema: liElement.dataset.schema,
        join: null,
        joins: 0,
        levelId: 0
      }
    };
    this.currentTable = this.tables.get(`svg-data-${tableId}`);
    this.drawTable();
    // const rectBounding = e.target.getBoundingClientRect();
    // Draw.tableJoin = {
    //   table: e.target,
    //   x: +e.target.dataset.x + rectBounding.width + 10,
    //   y: +e.target.dataset.y + (rectBounding.height / 2),
    //   joins: +e.target.dataset.joins,
    //   levelId: +e.target.dataset.levelId
    // }
  }

  handlerTableDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.classList.contains('dropzone')) {
      // coloro il border differente per la dropzone
      e.target.classList.add('dropping');
    }
  }

  handlerTableDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.remove('dropping');
  }

  drawTable() {
    let clonedStruct = (this.currentTable.levelId === 0 && !this.currentTable.join) ?
      this.svg.querySelector('#table-struct-fact').cloneNode(true) :
      this.svg.querySelector('#table-struct').cloneNode(true);
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
    // tutte le tabelle hanno la prop join, tranne la fact, dove NON aggiungo 'tableJoin' e dimensionId
    // TODO: credo, per l'analisi multifatti, di dover aggiungere un 'cubeId' per poter evidenziare
    // le dimensioni appartenenti a un cubo (riguardo l'analisi multifatti)
    if (this.currentTable.join) {
      use.dataset.tableJoin = this.currentTable.join;
      use.dataset.dimensionId = this.currentTable.dimensionId;
      // debugger;
      if (this.tableJoin.table.classList.contains('fact') && this.nearestPoint.anchor === 'bottom') {
        this.currentTable.x = +this.tableJoin.table.dataset.x;
        this.currentTable.y = +this.tableJoin.table.dataset.y + 100;
        this.autoPos();
      }
    } else {
      // aggiungo l'evento drop sulla Fact, questo consentirà l'analisi multifatti
      use.classList.add('fact');
      use.addEventListener('drop', this.handlerTableDrop.bind(Draw));
      // use.addEventListener('dragenter', this.handlerTableDragEnter);
      // use.addEventListener('dragleave', this.handlerTableDragLeave);
    }
    use.dataset.name = this.currentTable.name;
    use.dataset.schema = this.currentTable.schema;
    use.dataset.joins = this.currentTable.joins;
    use.dataset.fn = 'tableSelected';
    use.dataset.enterFn = 'tableEnter';
    use.onmouseover = this.handlerOver.bind(Draw);
    use.onmouseleave = this.handlerLeave.bind(Draw);
    use.ondblclick = this.handlerDblClick.bind(Draw);
    // use.dataset.leaveFn = 'tableLeave';
    use.dataset.x = this.currentTable.x;
    use.dataset.y = this.currentTable.y;
    use.dataset.levelId = this.currentTable.levelId;
    use.setAttribute('x', this.currentTable.x);
    use.setAttribute('y', this.currentTable.y);
    Draw.svg.appendChild(use);
    // <animate> tag
    const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animate.setAttribute('attributeName', 'y');
    animate.setAttribute('dur', '.15s');
    animate.setAttribute('fill', 'freeze');
    use.appendChild(animate);
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

    console.log(coordsFrom);

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

  joinTablePositioning() {
    // recupero tutte le tabelle con data-joins > 1 partendo dal livello più alto (l'ultimo)
    // ciclo dal penultimo livello fino a 0 per riposizionare tutti gli elementi che hanno più di 1 join con altre tabelle
    // debugger;
    this.arrayLevels.forEach(levelId => {
      // il primo ciclo recupera le tabelle del penultimo level (le tabelle dell'ultimo level non hanno altre tabelle collegate ad esse)
      // this.svg.querySelectorAll(`use.table[data-level-id='${levelId}']:not([data-joins='1'], [data-joins='0'])`).forEach(table => {
      this.svg.querySelectorAll(`use.table[data-level-id='${levelId}']:not([data-joins='0'])`).forEach(table => {
        // this.svg.querySelectorAll(`use.table[data-level-id='${levelId}']`).forEach(table => {
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
        this.tables.get(table.id).line.from.y = yResult + 13;
        this.tables.get(table.id).line.to.y = yResult + 13;
        // this.tables.get(table.id).line.from.y = (y / +table.dataset.joins) + 13;
        // this.tables.get(table.id).line.to.y = (y / +table.dataset.joins) + 13;
        this.currentTable = this.tables.get(table.id);
        this.autoPosition();
      });
    });
    this.autoPositionLine();
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

  autoPositionLine() {
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
  }

}
