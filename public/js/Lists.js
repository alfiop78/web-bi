class Lists {
  #sublist;
  #ul;
  constructor() {
    this.tmplList = document.getElementById('templateList');
    this.tmplSublists = document.getElementById('template-sublists');
  }

  set ul(value) {
    this.#ul = document.getElementById(value);
  }

  get ul() { return this.#ul; }

  set cubes(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.selectable = this.section.querySelector('.selectable');
    this.span = this.section.querySelector('span');
    this.small = this.section.querySelector('small');
    this.#sublist = {
      section: this.section,
      selectable: this.selectable,
      span: this.span,
      small: this.small
    }
  }

  get cubes() { return this.#sublist; }

  set dimensions(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.selectable = this.section.querySelector('.selectable');
    this.span = this.section.querySelector('span');
    this.#sublist = {
      section: this.section,
      selectable: this.selectable,
      span: this.span
    }
  }

  get dimensions() { return this.#sublist; }

  set hierarchies(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.unselectable = this.section.querySelector('.unselectable');
    this.vContent = this.section.querySelector('.v-content');
    this.dimensionSpan = this.vContent.querySelector('span[data-dimension]');
    this.span = this.section.querySelector('span[item]');

    this.#sublist = {
      section: this.section,
      unselectable: this.unselectable,
      dimensionSpan: this.dimensionSpan,
      vContent: this.vContent,
      span: this.span
    }
  }

  get hierarchies() { return this.#sublist; }


  set columns(sublist) {
    this.content = this.tmplList.content.cloneNode(true);
    this.section = this.content.querySelector('section[' + sublist + ']');
    this.selectable = this.section.querySelector('.selectable');
    this.span = this.section.querySelector('span[column]');
    this.table = this.section.querySelector('small[table]');
    // info può contenere la gerarchia oppure il cubo
    this.info = this.section.querySelector('small:last-child');
    this.btnEdit = this.section.querySelector('button[data-edit]');

    this.#sublist = {
      section: this.section,
      selectable: this.selectable,
      span: this.span,
      table: this.table,
      info: this.info,
      btnEdit: this.btnEdit
    }
  }

  get columns() { return this.#sublist; }
  getCubes() {
    this.ul = 'ul-cubes';
    for (const [token, value] of StorageCube.cubes) {
      // imposto il template per questa sublist
      this.cubes = 'data-sublist-cube';
      this.#sublist.section.dataset.label = value.name;
      this.#sublist.section.dataset.cubeToken = token;
      this.#sublist.selectable.dataset.label = value.name;
      this.#sublist.selectable.dataset.cubeToken = token;
      this.#sublist.selectable.dataset.tableAlias = value.alias;
      this.#sublist.selectable.dataset.tableName = value.FACT;
      this.#sublist.selectable.dataset.schema = value.schema;
      this.#sublist.span.innerText = value.name;
      this.#sublist.small.innerText = value.FACT;
      this.#sublist.selectable.dataset.fn = 'handlerCubeSelected';
      this.ul.appendChild(this.#sublist.section);
    }
  }

  getDimensions() {
    this.ul = 'ul-dimensions';
    for (const [token, cube] of StorageCube.cubes) {
      // per ogni dimensione presente in associatedDimensions inserisco un element (preso dal template app.tmplListField)
      cube.associatedDimensions.forEach(tokenDimension => {
        StorageDimension.selected = tokenDimension;
        this.dimensions = 'data-sublist-dimension';
        this.#sublist.section.dataset.label = StorageDimension.selected.name;
        this.#sublist.section.dataset.dimensionToken = tokenDimension;
        this.#sublist.section.dataset.cubeToken = token;
        this.#sublist.selectable.dataset.dimensionToken = tokenDimension;
        this.#sublist.span.innerText = StorageDimension.selected.name;
        this.#sublist.selectable.dataset.fn = 'handlerDimensionSelected';
        this.ul.appendChild(this.#sublist.section);
      });
    }
  }

  getHierarchies(ul) {
    this.ul = ul;
    // ottengo l'elenco delle gerarchie per ogni dimensione presente in storage, successivamente, quando la dimensione viene selezionata, visualizzo/nascondo solo quella selezionata
    // console.log('lista dimensioni :', StorageDimension.dimensions);
    // per ogni dimensione presente aggiungo gli elementi nella ul con le gerarchie
    for (const [token, dimension] of StorageDimension.dimensions) {
      // per ogni dimensione presente in associatedDimensions inserisco un element (preso dal template app.tmplListField)
      for (const [hierToken, hier] of (Object.entries(dimension.hierarchies))) {
        this.hierarchies = 'data-sublist-hierarchies';
        this.#sublist.section.dataset.label = hier.name;
        this.#sublist.section.dataset.elementSearch = 'search-hierarchy';
        this.#sublist.section.dataset.dimensionToken = token;
        this.#sublist.unselectable.dataset.label = hier.name;
        this.#sublist.unselectable.dataset.dimensionToken = token;
        this.#sublist.unselectable.dataset.hierToken = hierToken;
        // this.#sublist.unselectable.addEventListener('click', app.handlerHierarchySelected);
        this.#sublist.dimensionSpan.innerText = dimension.name;
        this.#sublist.span.innerText = hier.name;
        this.#sublist.span.dataset.hierName = hier.name;
        this.#sublist.span.dataset.dimensionName = dimension.name;

        // lista tabelle presenti per ogni gerarchia
        for (const [tableId, table] of Object.entries(hier.order)) {
          // console.log(table.table);
          const contentSub = this.tmplSublists.content.cloneNode(true);
          const small = contentSub.querySelector('small');
          small.dataset.schema = table.schema;
          small.dataset.dimensionToken = token;
          small.dataset.hierToken = hierToken;
          small.dataset.searchable = true;
          small.dataset.label = table.table;
          small.dataset.tableAlias = table.alias;
          small.dataset.tableId = tableId;
          small.innerText = table.table;
          this.#sublist.vContent.appendChild(small);
        }
        this.ul.appendChild(this.#sublist.section);
      }
    }
  }

  getColumns() {
    this.ul = 'ul-columns';
    // per ogni dimensione, recupero la property 'columns'
    // console.log('StorageDimension.selected : ', StorageDimension.dimensions);
    for (const [dimToken, value] of StorageDimension.dimensions) {
      // key : nome della dimensione
      // value : tutte le property della dimensione
      for (const [hierToken, hierValue] of Object.entries(value.hierarchies)) {
        // per ogni gerarchia...
        for (const [tableId, table] of Object.entries(hierValue.order)) {
          // verifico se la tabella in ciclo ha delle colonne mappate
          if (hierValue.columns.hasOwnProperty(table.alias)) {
            for (const [token, field] of Object.entries(hierValue.columns[table.alias])) {
              // console.log('field : ', field);
              this.columns = 'data-sublist-columns';
              this.#sublist.section.dataset.relatedObject = 'dimension';
              this.#sublist.section.dataset.label = field.ds.field;
              this.#sublist.section.dataset.dimensionToken = dimToken;
              this.#sublist.section.dataset.hierToken = hierToken;
              this.#sublist.selectable.dataset.label = field.ds.field;
              this.#sublist.selectable.dataset.tableName = table.table;
              this.#sublist.selectable.dataset.tableAlias = table.alias;
              this.#sublist.selectable.dataset.tableId = tableId;
              this.#sublist.selectable.dataset.dimensionToken = dimToken;
              this.#sublist.selectable.dataset.hierToken = hierToken;
              this.#sublist.selectable.dataset.tokenColumn = token;
              this.#sublist.selectable.dataset.fn = 'handlerSelectColumn';
              this.#sublist.btnEdit.dataset.objectToken = token;
              this.#sublist.btnEdit.dataset.fn = 'handlerColumnEdit'; // TODO: da implementare
              this.#sublist.span.innerText = field.ds.field;
              this.#sublist.table.innerText = table.table;
              this.#sublist.info.innerText = hierValue.name;
              this.ul.appendChild(this.#sublist.section);
            }
          }
        }
      }
    }
  }

  getFactColumns() {
    this.ul = 'ul-columns';
    for (const [cubeToken, value] of StorageCube.cubes) {
      if (value.columns.hasOwnProperty(value.alias)) {
        for (const [token, field] of Object.entries(value.columns[value.alias])) {
          this.columns = 'data-sublist-columns';
          this.#sublist.section.dataset.relatedObject = 'cube';
          this.#sublist.section.dataset.label = field.ds.field;
          this.#sublist.section.dataset.cubeToken = cubeToken;
          this.#sublist.selectable.dataset.label = field.ds.field;
          this.#sublist.selectable.dataset.tableName = value.FACT;
          this.#sublist.selectable.dataset.tableAlias = value.alias;
          this.#sublist.selectable.dataset.tokenColumn = token;
          this.#sublist.selectable.dataset.cubeToken = cubeToken;
          this.#sublist.selectable.dataset.fn = 'handlerSelectColumn';
          this.#sublist.btnEdit.dataset.objectToken = token;
          this.#sublist.btnEdit.dataset.fn = 'handlerColumnEdit';
          this.#sublist.span.innerText = field.ds.field;
          this.#sublist.table.innerText = value.FACT;
          this.#sublist.info.innerText = value.name;
          this.ul.appendChild(this.#sublist.section);
        }
      }
    }
  }
}
