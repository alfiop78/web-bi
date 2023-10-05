class Templates {
  #data;
  constructor() { }

  set data(value) {
    this.#data = value;
  }

  get data() { return this.#data; }

  /* create() {
    // console.log(this.#data);
    // recupero l'elemento 'parent' a cui aggiungere il template json (presente in data)
    this.parent = document.getElementById(this.#data.parentElement_id);
    // console.log(this.parent);
    this.recursive = (parent, childs) => {
      childs.forEach(child => {
        // console.log(child);
        const tag = document.createElement(child.tag);
        tag.id = child.id;
        // l'array "classes" è sempre presente però potrebbe essere vuoto, se non ci sono classi da impostare
        child.classes.forEach(cssClass => tag.classList.add(cssClass));
        parent.appendChild(tag);
        if (child.childs) this.recursive(tag, child.childs);
      });
    }
    if (this.#data.childs) this.recursive(this.parent, this.#data.childs);
  } */

  create() {
    // console.log(this.#data);
    // recupero l'elemento 'parent' a cui aggiungere il template json (presente in data)
    this.parent = document.getElementById(this.#data.parentElement_id);
    // console.log(this.parent);
    // la prop 'rows' è sempre presente nel layout
    this.data.rows.forEach(row => {
      // in una 'rows' c'è sempre almeno una 'columns'
      row.columns.forEach(column => {
        const tag = document.createElement(column.tag);
        column.classes.forEach(cssClass => tag.classList.add(cssClass));
        this.parent.appendChild(tag);
        this.recursive = (parent, childs) => {
          childs.forEach(child => {
            // console.log(child);
            const tag = document.createElement(child.tag);
            tag.id = child.id;
            // l'array "classes" è sempre presente però potrebbe essere vuoto, se non ci sono classi da impostare
            child.classes.forEach(cssClass => tag.classList.add(cssClass));
            parent.appendChild(tag);
            if (child.childs) this.recursive(tag, child.childs);
          });
        }
        if (column.childs) this.recursive(tag, column.childs);
      });
    });
  }

  /* thumbnails() {
    this.tmplThumbnail = document.getElementById('tmpl-thumbnails');
    this.tmplContent = this.tmplThumbnail.content.cloneNode(true);
    this.parent = this.tmplContent.querySelector('.thumb-layout');
    this.title = this.parent.querySelector('.title');
    this.layoutPreview = this.parent.querySelector('.layout-previews');
    this.parent.id = this.data.id;
    this.title.innerText = this.data.name;
    document.getElementById('thumbnails').appendChild(this.tmplContent);
    // return;
    this.data.rows.forEach(row => {
      row.columns.forEach(column => {
        // div.col
        const tag = document.createElement(column.tag);
        column.classes.forEach(cssClass => tag.classList.add(cssClass));
        this.layoutPreview.appendChild(tag);
        this.recursive = (parent, childs) => {
          childs.forEach(child => {
            // console.log(child);
            const tag = document.createElement(child.tag);
            tag.id = child.id;
            // l'array "classes" è sempre presente però potrebbe essere vuoto, se non ci sono classi da impostare
            child.classes.forEach(cssClass => tag.classList.add(cssClass));
            parent.appendChild(tag);
            if (child.childs) this.recursive(tag, child.childs);
          });
        }
        if (column.childs) this.recursive(tag, column.childs);
      });
    });
  } */

  thumbnails() {
    this.tmplThumbnail = document.getElementById('tmpl-thumbnails');
    this.tmplContent = this.tmplThumbnail.content.cloneNode(true);
    this.parent = this.tmplContent.querySelector('.thumb-layout');
    this.title = this.parent.querySelector('.title');
    this.layoutPreview = this.parent.querySelector('.layout-previews');
    this.parent.id = this.data.id;
    this.title.innerText = this.data.name;
    document.getElementById('thumbnails').appendChild(this.tmplContent);
    // return;
    // Aggiungo il div.grid al layoutPreview
    const grid = document.createElement(this.data.grid.tag);
    this.data.grid.classes.forEach(cssClass => grid.classList.add(cssClass));
    this.layoutPreview.appendChild(grid);

    this.data.grid.rows.forEach(row => {
      // aggiungo il section.row
      const rowTag = document.createElement(row.tag);
      row.classes.forEach(cssClass => rowTag.classList.add(cssClass));
      // aggiungo la row al div.grid
      grid.appendChild(rowTag);
      row.columns.forEach(column => {
        // div.col
        const tag = document.createElement(column.tag);
        column.classes.forEach(cssClass => tag.classList.add(cssClass));
        rowTag.appendChild(tag);
        this.recursive = (parent, childs) => {
          childs.forEach(child => {
            // console.log(child);
            const tag = document.createElement(child.tag);
            tag.id = child.id;
            // l'array "classes" è sempre presente però potrebbe essere vuoto, se non ci sono classi da impostare
            child.classes.forEach(cssClass => tag.classList.add(cssClass));
            parent.appendChild(tag);
            if (child.childs) this.recursive(tag, child.childs);
          });
        }
        if (column.childs) this.recursive(tag, column.childs);
      });
    });
  }

}
