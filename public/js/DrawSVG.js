class DrawSVG {
  #tables = new Map();
  // 2024.02.01 - Oggetto Map() contenente le "specifiche" delle linee
  #joinLines = new Map();
  // #dimensions = new Set();
  // #dimensionSelected = {};
  tmplJoin = document.getElementById('tmpl-join-field');
  dialogJoin = document.getElementById('dlg-join');
  // ref nel DOM
  #currentLineRef;
  #currentTableRef;

  constructor(element) {
    this.svg = document.getElementById(element);
    this.svg.querySelectorAll("use, path").forEach(element => element.remove());
    this.messageConsole = document.getElementById("message-console");
    this.svg.dataset.height = this.svg.parentElement.offsetHeight;
    this.svg.dataset.width = this.svg.parentElement.offsetWidth;
    this.contextMenu = document.getElementById('context-menu-table');
    this.currentTable = {}, this.currentLine = {};
    // la tabella più vicina alle coordinate del mouse (durante il drag&drop e il mousemove)
    this.nearestTable = null;
    // la tabella corrente: viene impostata :
    // - al termine del drawTable/Fact
    // - Quando si attiva il contextMenu
    this.table; // la tabella corrente
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

  /* set tables(value) {
    this.#tables.set(value.id, value.properties);
    // console.log(this.#tables);
  } */

  set tables(value) {
    this.#tables.set(value.id, value);
  }

  get tables() { return this.#tables; }

  set joinLines(value) {
    this.#joinLines.set(value.key, value);
  }

  get joinLines() { return this.#joinLines; }


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

  /* set dimensionSelected(dimensionId) {
    this.svg.querySelectorAll(`use.table[data-dimension-id='${dimensionId}']`).forEach(table => {
      debugger;
      this.#dimensionSelected[table.id] = this.tables.get(table.id);
    });
  }

  get dimensionSelected() { return this.#dimensionSelected; } */

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
        this.nearestTable = [...this.svg.querySelectorAll('use.table:not([data-shared_ref])')].reduce((prev, current) => {
          // this.nearetestTable = [...this.svg.querySelectorAll('use.table:not(.common)')].reduce((prev, current) => {
          return (Math.hypot(e.offsetX - (+current.dataset.anchorXTo), e.offsetY - (+current.dataset.anchorYTo)) < Math.hypot(e.offsetX - (+prev.dataset.anchorXTo), e.offsetY - (+prev.dataset.anchorYTo))) ? current : prev;
          // return (Math.hypot(e.offsetX - (+current.dataset.x + 190), e.offsetY - (+current.dataset.y + 12)) < Math.hypot(e.offsetX - (+prev.dataset.x + 190), e.offsetY - (+prev.dataset.y + 12))) ? current : prev;
        });
        const rectBounding = this.nearestTable.getBoundingClientRect();

        // let testCoords = [{ x: 305, y: 70 }, { x: 210, y: 85 }];
        // creo 2 punti di ancoraggio (right, bottom) per la Fact e un solo punto di anchor
        // per le tabelle dimensionali.
        /* INFO: la seguente logica può variare in futuro. Non è necessario avere almeno un livello dimensionale per poter
        * aggiungere una seconda Fact.
        * Se NON è presente nemmeno una dimensione (livello dimensionale) non posso ancora aggiungere
        * la seconda Fact, quindi creo solo un punto di anchor, quello di destra (right)
        * */
        // 2024.02.01 - All'interno dei punti di anchor inserisco anche le coordinate dei punti di controllo e
        // ...punti finali (in base al mouse) della linea perchè questi variano
        // ...se sto droppando in 'bottom' o in 'right'
        // OPTIMIZE: 2024.02.01 - calcolo controlPoint dinamici
        // console.log(this.currentLineRef.getTotalLength());
        const anchorPoints = (this.countJoins >= 1 && this.nearestTable.classList.contains('fact')) ?
          [
            {
              x: +this.nearestTable.dataset.anchorXTo,
              y: +this.nearestTable.dataset.anchorYTo,
              // punti di controllo della linea
              p1x: +this.nearestTable.dataset.anchorXTo + 40,
              p1y: +this.nearestTable.dataset.anchorYTo,
              p2x: (e.offsetX - this.dragElementPosition.x - 10) - 40,
              p2y: (e.offsetY - this.dragElementPosition.y + 15),
              // punto end della linea
              x2: (e.offsetX - this.dragElementPosition.x - 10),
              y2: (e.offsetY - this.dragElementPosition.y + 15),
              anchor: 'right'
            }, // right
            {
              x: +this.nearestTable.getAttribute('x') + (rectBounding.width / 2),
              y: +this.nearestTable.getAttribute('y') + (rectBounding.height + 9),
              p1x: +this.nearestTable.getAttribute('x') + (rectBounding.width / 2),
              p1y: +this.nearestTable.dataset.anchorYTo + 50,
              p2x: (e.offsetX - this.dragElementPosition.x + 15),
              p2y: (e.offsetY - this.dragElementPosition.y) - 50,
              x2: (e.offsetX - this.dragElementPosition.x + 15), y2: (e.offsetY - this.dragElementPosition.y - 9),
              anchor: 'bottom'
            } // bottom
          ] :
          [
            {
              x: +this.nearestTable.dataset.anchorXTo, y: +this.nearestTable.dataset.anchorYTo,
              p1x: +this.nearestTable.dataset.anchorXTo + 40,
              p1y: +this.nearestTable.dataset.anchorYTo,
              p2x: (e.offsetX - this.dragElementPosition.x - 10) - 40,
              p2y: (e.offsetY - this.dragElementPosition.y + 15),
              x2: (e.offsetX - this.dragElementPosition.x - 10), y2: (e.offsetY - this.dragElementPosition.y + 15),
              anchor: 'right'
            }, // right
            // { x: +nearestTable.dataset.x - 10, y: this.tableJoin.y, anchor: 'left' } // left
          ];

        // il nearestPoint restituisce anchorPoints qui sopra definito, al suo interno le coordinate per disegnare la linea
        this.nearestPoint = anchorPoints.reduce((prev, current) => {
          return (Math.hypot(e.offsetX - current.x, e.offsetY - current.y) < Math.hypot(e.offsetX - prev.x, e.offsetY - prev.y)) ? current : prev;
        });

        // console.log(this.nearestPoint);
        if (this.currentLineRef) {
          this.currentLineRef.dataset.startX = this.nearestPoint.x; // start point x
          this.currentLineRef.dataset.startY = this.nearestPoint.y; // start point y
          this.currentLineRef.dataset.endX = this.nearestPoint.x2; // end point x
          this.currentLineRef.dataset.endY = this.nearestPoint.y2; // end point y

          // se la tableJoin è una fact agginugo la css class fact alla linea che sto disegnando
          // La linea tratteggiata compare SOLO quando si sta aggiungendo al punto di ancoraggio 'bottom'.
          // In questo modo, sto indicando all'utente, che in questo punto di ancoraggio si può droppare una
          // Fact per consentire l'analisi multifatti
          if (this.nearestPoint.anchor === "bottom") {
            this.currentLineRef.classList.add('fact')
            this.messageConsole.dataset.message = "Creazione Data Model per analisi Multifatti";
          } else {
            this.currentLineRef.classList.remove('fact');
            delete this.messageConsole.dataset.message;
          }
          this.autoPos();
          // Imposto un posizionamento, sull'asse x, semi-automatico andando a verificare
          // se ci sono altre tabelle nei pressi di quella corrente, per poterla
          // posizionare sullo stesso asse x
          this.svg.querySelectorAll('use.table').forEach(table => {
            if ((+table.getAttribute('x') >= e.offsetX - 20) && (+table.getAttribute('x') <= e.offsetX + 20)) {
              // auto-posizionamento per la line, rispetto alla tabella trovata sull'asse x
              this.currentLineRef.dataset.endX = +table.dataset.anchorXFrom;
              this.nearestPoint.x2 = +table.dataset.anchorXFrom;
            }
          });

          const d = `M${this.nearestPoint.x},${this.nearestPoint.y} C${this.nearestPoint.p1x},${this.nearestPoint.p1y} ${this.nearestPoint.p2x},${this.nearestPoint.p2y} ${this.nearestPoint.x2},${this.nearestPoint.y2}`;
          this.currentLineRef.setAttribute('d', d);
          // console.log(this.currentLineRef.getTotalLength());
          this.currentLineRef.dataset.to = this.nearestTable.id;
        }
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
    const id = `svg-data-${tableId}`;

    // se non è presente una tableJoin significa che sto aggiungendo la prima tabella
    // console.log(this);
    let coords = { x: e.offsetX - this.dragElementPosition.x, y: e.offsetY - this.dragElementPosition.y };
    // console.log(this.dragElementPosition);
    // alcune proprietà di this.tables sono presente sia quando viene droppataa una Fact che quando
    // viene droppata una tabella dimensionale
    // WARN: 2024.02.08 - Probabilmente la prop 'id' non è utilizzata (key ha lo stesso valore)
    // WARN: 2024.02.08 - cssClass dovrebbe essere eliminato (in createDataModel() viene utilizzato data-shared_ref)
    const tableObj = {
      id,
      key: id,
      x: coords.x,
      y: coords.y,
      table: liElement.dataset.label,
      alias: `${liElement.dataset.label}_${time.substring(time.length - 3)}`,
      name: liElement.dataset.label,
      schema: liElement.dataset.schema,
      joins: 0,
      join: null,
      cssClass: null
    };

    this.tables = tableObj;

    if (this.currentLineRef) {
      // console.log(this.currentLineRef.classList);
      this.joinLines = {
        key: this.currentLineRef.id,
        start: { x: +this.currentLineRef.dataset.startX, y: +this.currentLineRef.dataset.startY },
        end: { x: +this.currentLineRef.dataset.endX, y: +this.currentLineRef.dataset.endY },
        from: null,
        to: this.currentLineRef.dataset.to,
        cssClass: this.currentLineRef.classList.value
      };
      // TODO: creazione icona join sotto la linea di join, sarà un button referenziato con il tag foreignObject
      /* const foreignObject = this.svg.getElementById("btn-join");
      const btnJoin = foreignObject.cloneNode(true);
      btnJoin.id = `btn-join-${this.currentLineRef.id}`;
      btnJoin.dataset.id = this.currentLineRef.id;
      btnJoin.setAttribute("x", (+this.currentLineRef.dataset.endX - 26));
      btnJoin.setAttribute("y", (+this.currentLineRef.dataset.endY + 9));
      // btnJoin.addEventListener("click", this.joinSelected);
      // btnJoin.dataset.fn = "selectLine";
      this.svg.appendChild(btnJoin); */
    }

    if (!this.nearestTable) {
      // nessuna tabella da mettere in join (prima tabella)
      this.tables.get(id).factId = id;
      this.tables.get(id).cssClass = 'fact';
      this.currentTable = this.tables.get(id);
      this.drawFact();
    } else if (this.nearestTable && this.currentLineRef.classList.contains('fact')) {
      // Aggiunta di una Fact per l'analisi MultiFact (linea di join verticale)
      // la nuova fact è visualizzata immediatamente sotto la prima fact
      // recupero le coordinate del e.target
      this.tables.get(id).x = +this.nearestTable.getAttribute('x');
      this.tables.get(id).factId = id;
      this.tables.get(id).cssClass = 'fact';
      this.currentTable = this.tables.get(id);
      // this.createDimensionInfo();
      this.drawFact();
      this.currentLineRef.remove();
      console.log(this.joinLines);
      this.joinLines.delete(this.currentLineRef.id);
      delete this.messageConsole.dataset.message;
    } else {
      // è presente una tableJoin, è un livello dimensionale
      // calcolo quante tabelle sono legate a q nearestTable (quante dimensioni ci sono)
      // per aggiornare la proprietà 'joins'
      this.nearestTable.dataset.joins = ++this.nearestTable.dataset.joins;
      this.tables.get(this.nearestTable.id).joins = +this.nearestTable.dataset.joins;
      // imposto il data-dimensionId
      // se la tabella droppata è legata direttamente alla fact (ultima tabella della gerarchia)
      // incremento il dimensionId (è una nuova dimensione, l'id è basato su tableJoin.dataset.joins)
      // se la tabella corrente sta per essere legata a una Fact creo il token per identificare la dimensione
      this.tables.get(id).dimensionId = (this.nearestTable.classList.contains('fact')) ?
        this.rand().substring(0, 4) : this.nearestTable.dataset.dimensionId;
      // imposto la proprietà 'tables' della Classe Draw
      // imposto solo le proprietà che sono presenti in una tabella dimensionale
      this.tables.get(id).join = this.nearestTable.id;
      this.tables.get(id).factId = this.nearestTable.dataset.factId;
      this.tables.get(id).cssClass = 'tables';

      // se il punto y del mouse è "nei pressi" di y della nearestTable imposto y alla stessa altezza di nearestTable.y
      if (this.tables.get(id).y >= this.nearestPoint.y - 20 && this.tables.get(id).y <= this.nearestPoint.y + 20) {
        this.tables.get(id).y = +this.nearestTable.getAttribute('y');
        // salvo i dati della joinLines per poter essere salvata correttamente nel WorkBook in localStorage
        this.joinLines.get(this.currentLineRef.id).end.y = this.nearestPoint.y;
        this.currentLineRef.dataset.endY = this.nearestPoint.y;
      }

      // // Imposto un posizionamento, sull'asse x, semi-automatico andando a verificare
      // // se ci sono altre tabelle nei pressi di quella corrente, per poterla
      // // posizionare sullo stesso asse x
      this.svg.querySelectorAll('use.table').forEach(table => {
        if ((+table.getAttribute('x') >= this.tables.get(id).x - 20) && (+table.getAttribute('x') <= this.tables.get(id).x + 20)) {
          this.tables.get(id).x = +table.getAttribute('x');
        }
      });
      this.currentTable = this.tables.get(id);
      // aggiungo qui l'evento click sulla linea perchè sulla line.fact non deve essere presente
      this.currentLineRef.dataset.fn = 'selectLine';
      // linea di join da tableJoin alla tabella droppata (questa deve essere impostata DOPO this.currentTable
      // perchè vengono prese da lì le coordinate finali della tabella droppata)
      // imposto solo la proprietà 'from' rimasta "in sospeso" in handlerDragOver perchè in quell'evento non
      // ho ancora l'elemento nel DOM
      this.joinLines.get(this.currentLineRef.id).from = id;
      this.currentLineRef.dataset.from = id;
      this.joinLines.get(this.currentLineRef.id).factId = this.nearestTable.dataset.factId;
      this.currentLineRef.dataset.factId = this.nearestTable.dataset.factId;
      this.drawTable();
    }
    // WARN: non utilizzata in altri punti del codice
    this.currentTableRef = id;
    // imposto la tabella attiva per poter scaricare le colonne in sessionStorage (in handlerDragEnd())
    WorkBook.activeTable = id;
    // imposto event contextmenu
    // this.currentTableRef.addEventListener('contextmenu', this.contextMenuTable.bind(Draw));
    // this.svg.querySelector(`#${this.currentTable.key}`).addEventListener('contextmenu', this.contextMenuTable.bind(Draw));
  }

  /* NOTE: END DRAG&DROP EVENTS */

  /* NOTE: mouse events */

  handlerMouseMove(e) {
    this.coordsRef.innerHTML = `<small>x ${e.offsetX}</small><br /><small>y ${e.offsetY}</small>`;
  }

  async handlerDblClick(e) {
    console.log('dblClick');
    // console.log(e.target);
    // console.log(this);
    // deseleziono le altre tabelle con attributo active
    Draw.svg.querySelectorAll("use.table[data-active='true']").forEach(use => delete use.dataset.active);
    WorkBook.activeTable = e.currentTarget.id;
    WorkBook.activeTable.dataset.active = 'true';
    // recupero 50 record della tabella selezionata per visualizzare un anteprima
    WorkBook.schema = WorkBook.activeTable.dataset.schema;
    // TODO: potrei popolare qui il datatype delle colonne prendendo i dati dalle tabelle in
    // sessionStorage, qui vengono salvati appena viene aggiunta la tabella al canvas.
    // Attualmente questa operazione la faccio in setColumn()
    // TODO: utilizzare anche qui la DataTable di GoogleChart ed eliminare il file con la Classe Table
    let DT = new Table(await Draw.getPreviewSVGTable(), 'preview-table', true);
    DT.template = 'tmpl-preview-table';
    DT.addColumns();
    DT.addRows();
    DT.inputSearch.addEventListener('input', DT.columnSearch.bind(DT));
    // imposto un colore diverso per le colonne già definite nel workbook
    DT.fields(WorkBook.fields.get(WorkBook.activeTable.dataset.alias));
    // imposto un colore diverso per le meriche già definite nel workbook
    DT.metrics(WorkBook.metrics);
  }

  async getPreviewSVGTable() {
    return await fetch('/fetch_api/' + WorkBook.activeTable.dataset.schema + '/schema/' + WorkBook.activeTable.dataset.table + '/table_preview')
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(response => response)
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  tableMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!e.ctrlKey || e.button === 2) return;
    console.log('event mouseDown');
    e.currentTarget.classList.add("move");
    this.coordinate = { x: +e.currentTarget.getAttribute('x'), y: +e.currentTarget.getAttribute('y') };
    if (e.target.dataset.type !== "fact") this.nearestTable = this.svg.querySelector(`#${e.target.dataset.tableJoin}`);
    this.el = e.currentTarget;
    // if (this.tablePopup.classList.contains("open")) this.tablePopup.classList.remove("open");
  }

  tableMouseMove(e) {
    e.preventDefault();
    e.stopPropagation();
    // console.log(e);
    // console.log('mousemove', e.currentTarget);
    (e.ctrlKey) ? e.currentTarget.classList.add("move") : e.currentTarget.classList.remove("move");
    if (this.el && e.ctrlKey) {
      this.coordinate.x += e.movementX;
      this.coordinate.y += e.movementY;
      // console.log(e);
      e.currentTarget.setAttribute('x', this.coordinate.x);
      e.currentTarget.setAttribute('y', this.coordinate.y);
      // nella fase di spostamento modifico anche gli attributi data-anchor-to
      // in modo che la linea di destra (rispetto a e.target) possa far riferimento
      // a data-anchor-to per spostarsi
      e.currentTarget.dataset.anchorXTo = this.coordinate.x + 210;
      e.currentTarget.dataset.anchorYTo = this.coordinate.y + 15;

      // se è presente una sola tabella nel canvas non eseguo il codice successivo, non c'è bisogno
      // di legare la linea di join
      if (this.countTables === 1) return;

      // this.currentLineRef, nel caso di spostamento della Fact, non è valorizzata perchè
      // ...non è presente nessuna linea di join alla sinistra della Fact
      this.currentLineRef = (e.target.dataset.type !== "fact") ?
        this.svg.querySelector(`path[data-from='${e.target.id}']`).id : null;
      if (this.el.dataset.shared_ref) {
        // if (this.el.classList.contains('common')) {
        // se sto spostando una tabella da mettere in comune tra più fact la posso legare solo alle Fact
        // nella ricerca della tabella più vicina escludo la tabella che sto spostando
        // inoltre, la tabella messa in comune (shared_ref), non può essere legata alla stessa Fact a cui è legata la tabella .shared
        // let tables = (e.currentTarget.classList.contains('common')) ?
        let tables = (e.currentTarget.dataset.shared_ref) ?
          this.svg.querySelectorAll(`use.table.fact:not(#${this.svg.querySelector('use.shared').dataset.factId})`) :
          // this.svg.querySelectorAll(`use.table:not(#${e.target.id}, .common)`);
          this.svg.querySelectorAll(`use.table:not(#${e.target.id}, [data-shared_ref])`);

        this.nearestTable = [...tables].reduce((prev, current) => {
          return (Math.hypot(this.coordinate.x - (+current.dataset.anchorXTo), this.coordinate.y - (+current.dataset.anchorYTo)) < Math.hypot(this.coordinate.x - (+prev.dataset.anchorXTo), this.coordinate.y - (+prev.dataset.anchorYTo))) ? current : prev;
        });

        e.currentTarget.dataset.factId = this.nearestTable.id;
        e.currentTarget.dataset.tableJoin = this.nearestTable.id;
        this.tables.get(e.currentTarget.id).factId = this.nearestTable.id;
        this.tables.get(e.currentTarget.id).join = this.nearestTable.id;
        // this.currentLineRef.dataset.to = nearestTable.id;
        const d = `M${+this.nearestTable.dataset.anchorXTo},${+this.nearestTable.dataset.anchorYTo} C${+this.nearestTable.dataset.anchorXTo + 40},${+this.nearestTable.dataset.anchorYTo} ${this.coordinate.x - 40},${this.coordinate.y + 15} ${this.coordinate.x - 10},${this.coordinate.y + 15}`;
        this.currentLineRef.setAttribute('d', d);
        this.currentLineRef.dataset.startX = +this.nearestTable.dataset.anchorXTo;
        this.currentLineRef.dataset.startY = +this.nearestTable.dataset.anchorYTo;
        this.currentLineRef.dataset.factId = this.nearestTable.id;
        this.currentLineRef.dataset.to = this.nearestTable.id;
      } else {
        // la fact non ha una nearestTable
        if (e.target.dataset.type !== "fact") {
          // in questo caso non devo cercare la nearestTable perchè non voglio modificare la join
          // presente con questa tabella, lo valorizzo con il valore già presente
          this.nearestTable = this.svg.querySelector(`#${e.target.dataset.tableJoin}`);
          // console.log(this.currentLineRef.getTotalLength());
          const d = `M${+this.nearestTable.dataset.anchorXTo},${+this.nearestTable.dataset.anchorYTo} C${+this.nearestTable.dataset.anchorXTo + 40},${+this.nearestTable.dataset.anchorYTo} ${this.coordinate.x - 40},${this.coordinate.y + 15} ${this.coordinate.x - 10},${this.coordinate.y + 15}`;
          if (this.currentLineRef) this.currentLineRef.setAttribute('d', d);
        }
      }
      if (this.currentLineRef) {
        this.currentLineRef.dataset.startX = +this.nearestTable.dataset.anchorXTo;
        this.currentLineRef.dataset.startY = +this.nearestTable.dataset.anchorYTo;
        this.currentLineRef.dataset.endX = this.coordinate.x - 10;
        this.currentLineRef.dataset.endY = this.coordinate.y + 15;
      }
      // console.log(this.currentLineRef.getTotalLength());
      // linea di join di "destra" rispetto alla tabella che sto spostando
      this.svg.querySelectorAll(`path[data-to='${e.target.id}']`).forEach(line => {
        // console.log(line);
        // data-start è il punto in cui la linea è collegata alla tabella che sto spostando
        const lineDataPath = {
          xStart: +e.target.dataset.anchorXTo,
          yStart: +e.target.dataset.anchorYTo,
          // curve, point 1
          point1x: +e.target.dataset.anchorXTo + 40,
          point1y: +e.target.dataset.anchorYTo,
          // point 2
          point2x: +line.dataset.endX - 40,
          point2y: +line.dataset.endY,
          // end
          xEnd: +line.dataset.endX,
          yEnd: +line.dataset.endY
        };
        const d = `M${lineDataPath.xStart},${lineDataPath.yStart} C${lineDataPath.point1x},${lineDataPath.point1y} ${lineDataPath.point2x},${lineDataPath.point2y} ${lineDataPath.xEnd},${lineDataPath.yEnd}`;
        // modifico gli attributi della linea appena ridisegnata
        line.dataset.startX = e.target.dataset.anchorXTo;
        line.dataset.startY = e.target.dataset.anchorYTo;
        line.setAttribute('d', d);
        this.joinLines.get(line.id).start.x = +line.dataset.startX;
        this.joinLines.get(line.id).start.y = +line.dataset.startY;
      });
      // se sto spostando la Fact devo verificare se c'è una TIME collegata
      if (e.target.dataset.type === "fact") {
        if (this.svg.querySelector(`#WB_DATE-${e.target.id}`)) {
          const timeIcon = this.svg.querySelector(`#WB_DATE-${e.target.id}`);
          // imposto solo +30 (in this.tables) perchè il posizionamento viene fatto in fase di
          // ...apertura del WorkBook, in drawTime, mentre lo imposto su timeIcon perchè lo vedo mentre sposto la fact
          timeIcon.setAttribute("x", +e.target.getAttribute("x") + 4);
          timeIcon.setAttribute("y", +e.target.getAttribute("y") + 34);
          this.tables.get(timeIcon.id).x = +e.target.getAttribute('x');
          this.tables.get(timeIcon.id).y = +e.target.getAttribute('y') + 30;
        }
      }
    }
  }

  // imposto come tabella attiva (currentTableRef)
  tableMouseEnter(e) {
    e.preventDefault();
    // console.log('tableMouseEnter');
    this.currentTableRef = e.target.id;
    (e.ctrlKey) ? e.currentTarget.classList.add("move") : e.currentTarget.classList.remove("move");

    // this.tablePopup = document.getElementById("table-popup");
    // const { left: mouseX, bottom: mouseY } = e.currentTarget.getBoundingClientRect();
    // this.tablePopup.style.top = `${mouseY}px`;
    // this.tablePopup.style.left = `${mouseX + 28}px`;
    // this.tablePopup.querySelector("button").dataset.id = e.target.id;
    // this.tablePopup.classList.add("open");
  }

  tableMouseLeave(e) {
    e.preventDefault();
    // console.log('tableMouseLeave');
    if (this.el) delete this.el;
    e.currentTarget.classList.remove("move");
  }

  tableMouseUp(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('tableMouseUp event');
    if (!this.el) return;
    delete this.el;
    if (e.button === 2 || this.countTables === 1) return false;
    // console.log(this.currentTable);
    this.tables.get(e.currentTarget.id).x = +e.currentTarget.getAttribute('x');
    this.tables.get(e.currentTarget.id).y = +e.currentTarget.getAttribute('y');
    this.currentTable = this.tables.get(e.currentTarget.id);
    // calcolo quante tabelle sono legate a q nearestTable (quante dimensioni ci sono)
    // per aggiornare la proprietà 'joins'
    //  31.01.2024 - aggiorno in ogni caso l'attributo joins perchè quando si attiva
    // il addFactJoin e la linea viene automaticamente associata alla fact, questo attributo non
    // viene valorizzato/incrementato
    // Fact non ha nearestTable
    if (e.target.dataset.type !== "fact") {
      const joins = this.svg.querySelectorAll(`use.table[data-table-join=${this.nearestTable.id}]`).length;
      this.nearestTable.dataset.joins = joins;
      this.tables.get(this.nearestTable.id).joins = joins;
    }

    // aggiorno gli attributi per la nuova posizione
    this.updateTable();
    if (this.currentLineRef) {
      // se esiste già una join per questa tabella non visualizzo la dialogJoin
      if (!('joinId' in this.currentLineRef.dataset)) {
        // la join non è presente su questa linea
        // recupero gli id delle tabelle (from/to) per poter leggere le colonne in WorkBookStorage.getTable()
        WorkBook.tableJoins = {
          from: Draw.currentLineRef.dataset.from,
          to: Draw.currentLineRef.dataset.to
        }
        this.openJoinWindow();
        this.createWindowJoinContent();
      }
      this.currentLineRef.dataset.factId = this.nearestTable.dataset.factId;
      this.joinLines.get(this.currentLineRef.id).factId = this.nearestTable.dataset.factId;
      this.joinLines.get(this.currentLineRef.id).start.x = +this.currentLineRef.dataset.startX;
      this.joinLines.get(this.currentLineRef.id).start.y = +this.currentLineRef.dataset.startY;
      this.joinLines.get(this.currentLineRef.id).end.x = +this.currentLineRef.dataset.endX;
      this.joinLines.get(this.currentLineRef.id).end.y = +this.currentLineRef.dataset.endY;
      this.nearestTable;
    }

    // creo/aggiorno la mappatura di tutte le tabelle del Canvas
    WorkBook.createDataModel();
  }

  createWindowJoinContent() {
    // WorkBook.tableJoins = {
    //   from: this.dialogJoin.querySelector('.joins section[data-table-from]').dataset.tableId,
    //   to: this.dialogJoin.querySelector('.joins section[data-table-to]').dataset.tableId
    // }
    for (const [key, value] of Object.entries(WorkBook.tableJoins)) {
      WorkBook.activeTable = value.id;
      const data = WorkBookStorage.getTable(WorkBook.activeTable.dataset.table);
      this.addFields(key, data);
    }
  }

  /* NOTE: end mouse events */

  // Questa funzione restituisce i due field da aggiungere al DOM
  // Può essere invocata sia per creare una nuova join che
  // per creare/popolare una join esistente (ad es.: click sulla join line)
  get getJoinFieldsTemplate() {
    const tmplJoinFrom = this.tmplJoin.content.cloneNode(true);
    const tmplJoinTo = this.tmplJoin.content.cloneNode(true);
    const fieldFrom = tmplJoinFrom.querySelector('.join-field');
    const fieldTo = tmplJoinTo.querySelector('.join-field');
    // rimuovo eventuali attributi [active] nelle joinField prima di aggiungere quelli nuovi
    this.dialogJoin.querySelectorAll('.join-field[data-active]').forEach(joinField => delete joinField.dataset.active);

    this.dialogJoin.querySelector('.joins section[data-table-from] > .join').appendChild(fieldFrom);
    this.dialogJoin.querySelector('.joins section[data-table-to] > .join').appendChild(fieldTo);
    fieldFrom.dataset.factId = this.currentLineRef.dataset.factId;
    fieldTo.dataset.factId = this.currentLineRef.dataset.factId;
    return { from: fieldFrom, to: fieldTo };
  }

  addJoin() {
    // recupero i riferimenti del template da aggiungere al DOM
    let joinFields = this.getJoinFieldsTemplate;
    // imposto il token per la nuova join
    const token = this.rand().substring(0, 7);
    joinFields.from.dataset.token = token;
    joinFields.to.dataset.token = token;
    document.querySelector('#btn-remove-join').dataset.token = token;
  }

  openJoinWindow() {
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
        // per ogni join devo creare i due campi .join-field (from/to) e popolarli
        // con i dati presenti in WorkBook.joins
        // Quando viene utilizzata una tabella condivisa tra più fact, è necessario
        // visualizzare qui solo la join relativa alla fact "di competenza"
        if (this.currentLineRef.dataset.factId === value.factId) {
          let joinFields = this.getJoinFieldsTemplate;
          joinFields.from.dataset.token = key;
          joinFields.from.dataset.field = value.from.field;
          joinFields.from.dataset.table = value.from.table;
          joinFields.from.dataset.alias = value.from.alias;
          joinFields.from.innerHTML = value.from.field;
          joinFields.to.dataset.token = key;
          joinFields.to.dataset.field = value.to.field;
          joinFields.to.dataset.table = value.to.table;
          joinFields.to.dataset.alias = value.to.alias;
          joinFields.to.innerHTML = value.to.field;
          document.querySelector('#btn-remove-join').dataset.token = key;
        }
      }
    }
    // in base alla linea di join corrente recupero le proprietà 'from' e 'to' che contengono
    // l'id delle tabelle collegate (all'interno del canvas)

    // proprietà contenute in this.tables, recuperate attraverso il tableId (currentLineRef.dataset.from/to)
    const from = this.tables.get(this.currentLineRef.dataset.from);
    const to = this.tables.get(this.currentLineRef.dataset.to);

    // 'from' è la tabella che sto droppando
    const joinSectionFrom = this.dialogJoin.querySelector('.joins section[data-table-from]');
    // 'to' è la tabella a cui collegare quella corrente (corrente si riferisce sempre a quella che sto droppando)
    const joinSectionTo = this.dialogJoin.querySelector('.joins section[data-table-to]');
    // imposto gli attributi sugli elementi section all'interno di .joins
    joinSectionFrom.dataset.tableFrom = from.table;
    joinSectionFrom.dataset.tableId = from.key;
    joinSectionFrom.querySelector('.table').innerHTML = from.table;
    joinSectionTo.dataset.tableTo = to.table;
    joinSectionTo.dataset.tableId = to.key;
    joinSectionTo.querySelector('.table').innerHTML = to.table;
    this.dialogJoin.show();
  }

  checkResizeSVG() {
    let maxHeightTable = [...this.svg.querySelectorAll('use.table')].reduce((prev, current) => {
      return (+current.getAttribute('y') > +prev.getAttribute('y')) ? current : prev;
    });
    if (1 - (+maxHeightTable.getAttribute('y') / +this.svg.dataset.height) < 0.30) {
      // this.svg.dataset.height = +this.svg.dataset.height + 40;
      this.svg.dataset.height = +maxHeightTable.getAttribute('y') + 80;
      this.svg.style.height = `${+this.svg.dataset.height}px`;
    }
    let maxWidthTable = [...this.svg.querySelectorAll('use.table')].reduce((prev, current) => {
      return (+current.getAttribute('x') > +prev.getAttribute('x')) ? current : prev;
    });
    if (1 - (+maxWidthTable.getAttribute('x') / +this.svg.dataset.width) < 0.40) {
      // this.svg.dataset.width = +this.svg.dataset.width + 190;
      this.svg.dataset.width = +maxWidthTable.getAttribute('x') + 240;
      this.svg.style.width = `${+this.svg.dataset.width}px`;
    }
  }

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
    use.dataset.type = 'fact';
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
    use.addEventListener('click', (e) => {
      this.svg.querySelectorAll("use.table[data-active='true']").forEach(use => delete use.dataset.active);
      WorkBook.activeTable = e.target.id;
      WorkBook.activeTable.dataset.active = 'true';
    });
    use.ondblclick = this.handlerDblClick;
    // punto di ancoraggio di destra
    use.dataset.anchorXTo = this.currentTable.x + 210;
    use.dataset.anchorYTo = this.currentTable.y + 15;
    // punto di ancoraggio sotto (solo per la fact) per l'aggiunta di MultiFact
    // la Fact non ha un punto di ancoraggio di sinistra
    use.dataset.anchorXBottom = this.currentTable.x + 10;
    use.dataset.anchorYBottom = this.currentTable.y + 15;
    use.setAttribute('x', this.currentTable.x);
    use.setAttribute('y', this.currentTable.y);
    use.addEventListener('mousedown', this.tableMouseDown.bind(this));
    use.addEventListener('mousemove', this.tableMouseMove.bind(this));
    use.addEventListener('mouseup', this.tableMouseUp.bind(this));
    use.addEventListener('mouseleave', this.tableMouseLeave.bind(this));
    use.addEventListener('mouseenter', this.tableMouseEnter.bind(this));
    this.svg.appendChild(use);
    use.addEventListener('contextmenu', this.contextMenuTable.bind(this));
    this.table = use;
    // <animate> tag
    const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animate.setAttribute('attributeName', 'y');
    animate.setAttribute('dur', '.15s');
    animate.setAttribute('fill', 'freeze');
    use.appendChild(animate);
  }

  updateTable() {
    // qui aggiorno l'elemento del DOM che è stato spostato, quando non si utilizza il drag&drop
    const use = this.svg.querySelector(`#${this.currentTable.key}`);
    // da testare
    use.dataset.x = this.currentTable.x;
    use.dataset.y = this.currentTable.y;
    use.setAttribute('x', this.currentTable.x);
    use.setAttribute('y', this.currentTable.y);
    // punto di ancoraggio di destra
    use.dataset.anchorXTo = this.currentTable.x + 210;
    use.dataset.anchorYTo = this.currentTable.y + 15;
    // punto di ancoraggio di sinistra
    use.dataset.anchorXFrom = this.currentTable.x - 10;
    use.dataset.anchorYFrom = this.currentTable.y + 15;
    // this.table = use;
    if (this.currentLineRef) this.currentLineRef.dataset.from = this.currentTable.key;
  }

  drawCommonTable() {
    let commonStruct = this.svg.querySelector('#table-common').cloneNode(true);
    // const originTable = this.table;
    commonStruct.id = `struct-common-${this.currentTable.key}`;
    // commonStruct.classList.add('struct', 'common');
    commonStruct.classList.add('struct');
    commonStruct.querySelector('text').innerHTML = this.currentTable.name;
    this.svg.querySelector('defs').appendChild(commonStruct);
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#${commonStruct.id}`);

    use.id = this.currentTable.key;
    use.classList.add('table');
    use.dataset.type = 'table';
    use.dataset.tableJoin = this.currentTable.join;
    use.dataset.table = this.currentTable.table;
    use.dataset.factId = this.currentTable.factId;
    use.dataset.alias = this.currentTable.alias;
    use.dataset.shared_ref = this.currentTable.shared_ref;
    use.dataset.dimensionId = this.currentTable.dimensionId;
    use.dataset.name = this.currentTable.name;
    use.dataset.schema = this.currentTable.schema;
    use.dataset.joins = this.currentTable.joins;
    use.setAttribute('x', this.currentTable.x);
    use.setAttribute('y', this.currentTable.y);
    // punto di ancoraggio di destra
    use.dataset.anchorXTo = this.currentTable.x + 210;
    use.dataset.anchorYTo = this.currentTable.y + 15;
    // punto di ancoraggio di sinistra
    use.dataset.anchorXFrom = this.currentTable.x - 10;
    use.dataset.anchorYFrom = this.currentTable.y + 15;
    use.addEventListener('mousedown', this.tableMouseDown.bind(this));
    use.addEventListener('mousemove', this.tableMouseMove.bind(this));
    use.addEventListener('mouseup', this.tableMouseUp.bind(this));
    use.addEventListener('mouseleave', this.tableMouseLeave.bind(this));
    use.addEventListener('mouseenter', this.tableMouseEnter.bind(this));
    // la tabella di origine viene "contrassegnata" con la cssClass "shared"
    this.svg.appendChild(use);
    use.addEventListener('contextmenu', this.contextMenuTable.bind(this));
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
    use.dataset.type = 'table';
    // WARN: 2024.02.08 - La proprietà cssClass, che era stata utilizzata per gestire l'analisi multifatti, è da
    // rivedere perchè probabilmente può essere eliminata
    use.classList.add(this.currentTable.cssClass);
    use.dataset.table = this.currentTable.table;
    use.dataset.alias = this.currentTable.alias;
    use.dataset.factId = this.currentTable.factId;
    // tutte le tabelle hanno la prop join, tranne la fact, dove NON aggiungo 'tableJoin' e dimensionId
    use.dataset.tableJoin = this.currentTable.join;
    use.dataset.dimensionId = this.currentTable.dimensionId;
    use.dataset.name = this.currentTable.name;
    use.dataset.schema = this.currentTable.schema;
    use.dataset.joins = this.currentTable.joins;
    use.addEventListener('click', (e) => {
      this.svg.querySelectorAll("use.table[data-active='true']").forEach(use => delete use.dataset.active);
      WorkBook.activeTable = e.target.id;
      WorkBook.activeTable.dataset.active = 'true';
    });
    use.ondblclick = this.handlerDblClick;
    use.setAttribute('x', this.currentTable.x);
    use.setAttribute('y', this.currentTable.y);
    // punto di ancoraggio di destra
    use.dataset.anchorXTo = this.currentTable.x + 210;
    use.dataset.anchorYTo = this.currentTable.y + 15;
    // punto di ancoraggio di sinistra
    use.dataset.anchorXFrom = this.currentTable.x - 10;
    use.dataset.anchorYFrom = this.currentTable.y + 15;
    use.addEventListener('mousedown', this.tableMouseDown.bind(this));
    use.addEventListener('mousemove', this.tableMouseMove.bind(this));
    use.addEventListener('mouseup', this.tableMouseUp.bind(this));
    use.addEventListener('mouseleave', this.tableMouseLeave.bind(this));
    use.addEventListener('mouseenter', this.tableMouseEnter.bind(this));
    Draw.svg.appendChild(use);
    use.addEventListener('contextmenu', this.contextMenuTable.bind(this));
    this.table = use;

    // <animate> tag
    // const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    // animate.setAttribute('attributeName', 'y');
    // animate.setAttribute('dur', '.15s');
    // animate.setAttribute('fill', 'freeze');
    // use.appendChild(animate);
  }

  drawTimeRelated() {
    // se il tag <use> esiste già per questo this.currentTable.id non devo ricrearlo
    // Questa situazione si verifica quando si aggiorna la relazione tra la dimensione TIME e la Fact
    if (!this.svg.querySelector(`use.time#${this.currentTable.id}`)) {
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', this.currentTable.id);
      use.id = this.currentTable.id;
      use.classList.add('table', 'time');
      use.dataset.type = 'time';
      use.dataset.table = this.currentTable.table;
      use.dataset.joins = this.currentTable.joins;
      use.dataset.tableJoin = this.currentTable.join;
      use.dataset.name = this.currentTable.name;
      use.dataset.alias = this.currentTable.alias;
      use.dataset.schema = this.currentTable.schema;
      use.dataset.factId = this.currentTable.factId;
      Draw.svg.appendChild(use);
    }
  }

  recursiveHier(table, createJoin) {
    // cerco le tabelle gerarchicamente superiori a quella passata come argomento
    // es. Quando viene passata WB_QUARTERS, il primo ciclo processa WB_YEARS
    Draw.svg.querySelectorAll(`g#time-dimension > desc[data-table-join='${table.dataset.table}']`).forEach(timeTable => {
      if (createJoin) {
        // const token = this.rand().substring(0, 7);
        const token = `${timeTable.dataset.alias}-${this.currentTable.factId.substring(9)}`;
        WorkBook.join = {
          token,
          value: {
            alias: timeTable.dataset.alias,
            type: 'TIME',
            SQL: [`${timeTable.dataset.table}.${timeTable.dataset.field}`, `${table.dataset.table}.${table.dataset.joinField}`],
            factId: this.currentTable.factId,
            // factId: WorkBook.activeTable.dataset.factId,
            from: { table: timeTable.dataset.table, alias: timeTable.dataset.alias, field: timeTable.dataset.field },
            to: { table: table.dataset.table, alias: table.dataset.alias, field: table.dataset.joinField }
          }
        };
        WorkBook.joins = token;
      }
      this.tables = {
        id: `${timeTable.dataset.alias}-${this.currentTable.factId}`,
        key: 'related-time',
        table: timeTable.dataset.table,
        alias: timeTable.dataset.alias,
        name: timeTable.dataset.table,
        schema: 'decisyon_cache',
        joins: +timeTable.dataset.joins,
        factId: this.currentTable.factId,
        // factId: WorkBook.activeTable.dataset.factId,
        join: `${timeTable.dataset.tableJoin}-${this.currentTable.factId}`,
        // join: `${t.dataset.tableJoin}-${WorkBook.activeTable.dataset.factId}`,
        joinField: timeTable.dataset.joinField,
      };
      this.currentTable = this.tables.get(`${timeTable.dataset.alias}-${this.currentTable.factId}`);
      this.drawTimeRelated(); // tabelle relative alla TIME (WB_YEARS, WB_QUARTERS, ecc...)
      if (timeTable.dataset.joinField) this.recursiveHier(timeTable, createJoin);
    });
  }

  drawTime(createJoin = true) {
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#time');
    use.id = this.currentTable.id;
    use.classList.add('table', 'time');
    use.dataset.type = 'time';
    use.dataset.table = this.currentTable.table;
    use.dataset.joins = this.currentTable.joins;
    use.dataset.tableJoin = this.currentTable.join;
    use.dataset.joinField = this.currentTable.joinField;
    use.dataset.name = this.currentTable.name;
    use.dataset.alias = this.currentTable.alias;
    use.dataset.schema = this.currentTable.schema;
    use.dataset.factId = this.currentTable.factId;
    use.setAttribute('x', this.currentTable.x + 4);
    use.setAttribute('y', this.currentTable.y + 4);
    use.dataset.fn = "editTimeDimension";
    Draw.svg.appendChild(use);

    this.recursiveHier(use, createJoin);
  }

  updateLine() {
    this.currentLineRef.dataset.startX = this.nearestPoint.x;
    this.currentLineRef.dataset.startY = this.nearestPoint.y;
    this.currentLineRef.dataset.endX = this.nearestPoint.x;
    this.currentLineRef.dataset.endY = this.nearestPoint.y2;
    const d = `M${this.nearestPoint.x},${this.nearestPoint.y} C${this.nearestPoint.x},${this.nearestPoint.y} ${this.nearestPoint.x},${this.nearestPoint.y2} ${this.nearestPoint.x},${this.nearestPoint.y2}`;
    this.currentLineRef.setAttribute('d', d);
    this.joinLines.get(this.currentLineRef.id).end.x = this.nearestPoint.x;
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

  // effettuo un auto-posizionamento quando il mouse è "nei pressi x" del punto anchor bottom
  // "nei pressi Y" nel caso di un punto di anchor "right"
  autoPos() {
    if (this.currentLineRef.classList.contains('fact')) {
      if ((this.nearestPoint.x2 >= this.nearestPoint.x - 20) && (this.nearestPoint.x2 <= this.nearestPoint.x + 20)) {
        this.nearestPoint.p1x = this.nearestPoint.x;
        this.nearestPoint.p2x = this.nearestPoint.x;
        this.nearestPoint.x2 = this.nearestPoint.x;
      }
    } else {
      if ((this.nearestPoint.y2 >= this.nearestPoint.y - 20) && (this.nearestPoint.y2 <= this.nearestPoint.y + 20)) {
        this.nearestPoint.p1y = this.nearestPoint.y;
        this.nearestPoint.p2y = this.nearestPoint.y;
        this.nearestPoint.y2 = this.nearestPoint.y;
      }
    }
  }

  /* autoPos() {
    const d = `M${this.line.x1},${this.line.y1} C${this.line.p1x},${this.line.y1} ${this.line.p2x},${this.currentTable.y - 10} ${this.line.x2},${this.currentTable.y - 10}`;
    this.currentLineRef = this.currentLine.key;
    this.currentLineRef.setAttribute('d', d);
    if (this.currentLineRef.hasChildNodes()) {
      const animLine = this.currentLineRef.querySelector('animate');
      animLine.setAttribute('to', d);
      animLine.beginElement();
    }
  } */

  /* autoPosition() {
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
  } */

  addFactJoin() {
    // .shared indica che la tabella è una tabella condivisa con altre Fact.
    // La logica per l'utilizzo di .shared è utilizzata in WorkBook.createDataModel() -> recursive()
    this.table.classList.add('shared');
    this.tables.get(this.table.id).cssClass = 'shared';
    const token = this.rand().substring(0, 3);
    const id = `${this.table.id}-common-${token}`;

    this.tables = {
      id,
      key: id,
      x: +this.table.getAttribute('x') + 8,
      y: +this.table.getAttribute('y') + 26,
      table: this.table.dataset.name,
      alias: this.table.dataset.alias,
      name: this.table.dataset.name,
      schema: this.table.dataset.schema,
      shared_ref: this.table.id, // tabella da cui far partire la condivisione della dimensione
      joins: 0,
      join: null,
      factId: null,
      dimensionId: this.table.dataset.dimensionId,
    };

    // this.currentTable = this.tables.get(`${this.table.id}-common`);
    this.currentTable = this.tables.get(id);
    console.log(this.currentTable);
    this.drawCommonTable();

    // clono anche la sua linea andando a cercare la line con data-from = this.table.id
    const line = this.svg.querySelector(`path[data-from='${this.table.id}']`);
    const lineClone = line.cloneNode();
    lineClone.id = `${line.id}-common-${token}`;
    lineClone.dataset.from = this.currentTable.key;
    // imposto la linea come quella di origine però questa tabella .common NON può
    // essere legata alla stessa Fact dove è legata la tabella .shared
    // Quindi cerco la Fact più vicina che non sia quella a cui è legata la tabella .shared
    // cerco la Fact a cui è legata .shared
    const sharedFact = this.svg.querySelector('use.shared').dataset.factId;
    let nearestTable = [...this.svg.querySelectorAll(`use.table.fact:not(#${sharedFact})`)].reduce((prev, current) => {
      return (Math.hypot(this.currentTable.x - (+current.dataset.anchorXTo), this.currentTable.y - (+current.anchorYTo)) < Math.hypot(this.currentTable.x - (+prev.dataset.anchorXTo), this.currentTable.y - (+prev.dataset.anchorYTo))) ? current : prev;
    });
    lineClone.dataset.to = nearestTable.id;
    lineClone.dataset.startX = +nearestTable.dataset.anchorXTo;
    lineClone.dataset.startY = +nearestTable.dataset.anchorYTo;
    lineClone.dataset.factId = nearestTable.dataset.factId;
    console.log(nearestTable.dataset.factId);
    const d = `M${+nearestTable.dataset.anchorXTo},${+nearestTable.dataset.anchorYTo} C${+nearestTable.dataset.anchorXTo + 40},${+nearestTable.dataset.anchorYTo} ${this.currentTable.x - 40},${this.currentTable.y + 15} ${this.currentTable.x - 10},${this.currentTable.y + 15}`;
    lineClone.setAttribute('d', d);
    // elimino, dalla nuova linea clonata, il data-join-id, se presente, perchè qui sto creando una nuova join
    if ('joinId' in lineClone.dataset) delete lineClone.dataset.joinId;
    this.svg.appendChild(lineClone);
    this.currentLineRef = lineClone.id;
    this.joinLines = {
      key: this.currentLineRef.id,
      start: { x: +this.currentLineRef.dataset.startX, y: +this.currentLineRef.dataset.startY },
      end: { x: +this.currentLineRef.dataset.endX, y: +this.currentLineRef.dataset.endY },
      from: this.currentTable.key,
      factId: this.currentLineRef.dataset.factId,
      to: this.currentLineRef.dataset.to,
      cssClass: this.currentLineRef.classList.value
    };
  }

  contextMenuTable(e) {
    e.preventDefault();
    this.table = e.currentTarget;
    // Imposto la activeTable relativa al context-menu
    WorkBook.activeTable = e.currentTarget.id;
    const btnAddFactJoin = document.getElementById('addFactJoin');
    const btnTimeDimension = document.getElementById('time-dimension');
    const btnCustomMetric = document.getElementById('context-custom-metric');
    // per le tabelle con data-shared_ref disabilito alcuni tasti
    btnAddFactJoin.disabled = (this.table.dataset.shared_ref || this.svg.querySelectorAll('use.table.fact').length === 1) ? true : false;
    btnTimeDimension.disabled = (this.table.dataset.shared_ref || this.table.dataset.type === 'table') ? true : false;
    btnCustomMetric.disabled = (this.table.dataset.shared_ref || this.table.dataset.type === 'table') ? true : false;

    // console.log(e.target.dataset);
    // console.log(e.target.getBoundingClientRect());
    // const { clientX: mouseX, clientY: mouseY } = e;
    // const { left: mouseX, top: mouseY } = e.target.getBoundingClientRect();
    const { left: mouseX, bottom: mouseY } = e.currentTarget.getBoundingClientRect();
    this.contextMenu.style.top = `${mouseY + 8}px`;
    this.contextMenu.style.left = `${mouseX}px`;
    // Chiudo eventuali dlg-info aperte sul mouseEnter della use.table
    // if (app.dialogInfo.hasAttribute('open')) app.dialogInfo.close();
    this.contextMenu.toggleAttribute('open');
    // Imposto, sugli elementi del context-menu, l'id della tabella selezionata
    document.querySelectorAll('#ul-context-menu-table button').forEach(item => item.dataset.id = WorkBook.activeTable.id);
    // abilito "addJoin" se sono presenti due o più fact-table
    // btnAddFactJoin.disabled = (this.svg.querySelectorAll('use.table.fact').length > 1) ? false : true;
  }

  // aggiungo i campi di una tabella per creare la join
  addFields(source, response) {
    // source : from, to
    // console.log(source, response);
    const ul = this.dialogJoin.querySelector(`section[data-table-${source}] ul`);
    for (const [key, value] of Object.entries(response)) {
      const content = this.tmplList.content.cloneNode(true);
      const li = content.querySelector('li.select-list');
      const span = li.querySelector('span');
      li.dataset.label = value.column_name;
      li.dataset.elementSearch = `${source}-fields`;
      li.dataset.tableId = WorkBook.activeTable.id;
      // if (WorkBook.activeTable.classList.contains('common')) li.dataset.factId = WorkBook.activeTable.dataset.factId;
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

}
