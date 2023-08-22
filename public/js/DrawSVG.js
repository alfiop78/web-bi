class DrawSVG {
  #tables = new Map();
  #joinLines = new Map();
  #currentLineRef; // ref

  constructor(element) {
    this.svg = document.getElementById(element);
    this.svg.dataset.height = this.svg.parentElement.offsetHeight;
    this.svg.dataset.width = this.svg.parentElement.offsetWidth;
    this.currentLevel;
    this.currentTable = {}, this.currentLine = {};
    this.arrayLevels = [];
  }

  set tables(value) {
    this.#tables.set(value.id, value.properties);
    console.log(this.#tables);
  }

  get countTables() {
    return this.svg.querySelectorAll('use.table').length;
  }

  get tables() { return this.#tables; }

  set currentLineRef(value) {
    this.#currentLineRef = this.svg.querySelector(`#${value}`);
  }

  get currentLineRef() { return this.#currentLineRef; }

  set joinLines(value) {
    this.#joinLines.set(value.id, value.properties);
  }

  get joinLines() { return this.#joinLines; }

  checkResizeSVG() {
    let maxHeightTable = [...this.svg.querySelectorAll('use.table')].reduce((prev, current) => {
      return (+current.dataset.y > +prev.dataset.y) ? current : prev;
    });
    if (1 - (+maxHeightTable.dataset.y / +this.svg.dataset.height) < 0.30) {
      this.svg.dataset.height = +this.svg.dataset.height + 60;
      this.svg.style.height = `${+this.svg.dataset.height}px`;
    }

    let maxWidthTable = [...this.svg.querySelectorAll('use.table')].reduce((prev, current) => {
      return (+current.dataset.x > +prev.dataset.x) ? current : prev;
    });
    if (1 - (+maxWidthTable.dataset.x / +this.svg.dataset.width) < 0.40) {
      this.svg.dataset.width = +this.svg.dataset.width + 180;
      this.svg.style.width = `${+this.svg.dataset.width}px`;
    }
  }

  drawTable() {
    const clonedStruct = this.svg.querySelector('#table-struct').cloneNode(true);
    // assegno l'id e il testo (nome tabella) all'elemento clonato
    clonedStruct.id = `struct-${this.currentTable.key}`;
    clonedStruct.classList.add('struct');
    clonedStruct.querySelector('text').innerHTML = this.currentTable.table;
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
    use.dataset.name = this.currentTable.name;
    use.dataset.schema = this.currentTable.schema;
    use.dataset.joins = this.currentTable.joins;
    use.dataset.tableJoin = this.currentTable.join;
    use.dataset.fn = 'tableSelected';
    use.dataset.enterFn = 'tableEnter';
    use.dataset.leaveFn = 'tableLeave';
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
    // console.log(this.currentLine.from, this.currentLine.to);
    if (Object.keys(this.currentLine).length === 0) return;
    const coordsFrom = {
      x: this.tables.get(this.currentLine.from).line.from.x,
      y: this.tables.get(this.currentLine.from).line.from.y
    };
    let coordsTo;
    if (typeof this.currentLine.to === 'object') {
      // coordinate e.offsetX, e.offsetY. In questo caso provengo da dragOver.
      coordsTo = { x: this.currentLine.to.x, y: this.currentLine.to.y };
    } else {
      // tabella To
      coordsTo = {
        x: this.tables.get(this.currentLine.to).line.to.x,
        y: this.tables.get(this.currentLine.to).line.to.y
      };
    }
    this.line = {
      x1: coordsFrom.x, // start point
      y1: coordsFrom.y,
      p1x: coordsFrom.x + 40, // control point 1
      p1y: coordsFrom.y,
      p2x: coordsTo.x - 40, // control point 2
      p2y: coordsTo.y,
      x2: coordsTo.x, // end point
      y2: coordsTo.y
    };
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
    this.arrayLevels.forEach(levelId => {
      // il primo ciclo recupera le tabelle del penultimo level (le tabelle dell'ultimo level non hanno altre tabelle collegate ad esse)
      this.svg.querySelectorAll(`use.table[data-level-id='${levelId}']:not([data-joins='1'], [data-joins='0'])`).forEach(table => {
        let y = 0;
        // verifico la posizione y delle tabelle legate in join con quella in ciclo
        for (let properties of this.tables.values()) {
          if (properties.join === table.id) y += properties.y;
        }
        // la tabella in ciclo verrà riposizionata in base a y calcolato.
        // Se sono presenti due tabelle in join con 'table' (in ciclo) le posizioni y di queste tabelle vengono sommate (nel for) e
        // ...poi divise per il numero di tabelle join, in questo modo la tabella in ciclo viene posizionata al centro
        this.tables.get(table.id).y = (y / table.dataset.joins);
        this.tables.get(table.id).line.from.y = (y / table.dataset.joins) + 15;
        this.tables.get(table.id).line.to.y = (y / table.dataset.joins) + 15;
        this.currentTable = this.tables.get(table.id);
        this.autoPosition();
      });
    });
    this.autoPositionLine();
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
