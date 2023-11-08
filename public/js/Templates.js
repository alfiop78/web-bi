class Templates {
  #data;
  constructor() { }

  set data(value) {
    this.#data = value;
  }

  get data() { return this.#data; }

  create() {
    // console.log(this.#data);
    // recupero l'elemento 'parent' a cui aggiungere il template json (presente in data)
    this.parent = document.getElementById(this.#data.parentElement_id);
    // console.log(this.parent);
    this.recursive = (parent, childs) => {
      childs.forEach(child => {
        // console.log(child);
        const tag = document.createElement(child.tag);
        if (child.id) tag.id = child.id;
        // l'array "classes" è sempre presente però potrebbe essere vuoto, se non ci sono classi da impostare
        child.classes.forEach(cssClass => tag.classList.add(cssClass));
        // Gli elementi con .chart-elements avranno il tasto + per poter
        // aggiungere la risorsa (il report)
        if (child.classes.includes('chart-elements')) {
          const btnAdd = document.createElement('button');
          btnAdd.className = 'material-icons-round md-48';
          btnAdd.innerText = 'add';
          btnAdd.dataset.fn = 'addChart';
          tag.appendChild(btnAdd);
        }
        parent.appendChild(tag);
        if (child.childs) this.recursive(tag, child.childs);
      });
    }
    if (this.#data.childs) this.recursive(this.parent, this.#data.childs);
  }

  thumbnails() {
    this.tmplThumbnail = document.getElementById('tmpl-thumbnails');
    this.tmplContent = this.tmplThumbnail.content.cloneNode(true);
    this.parent = this.tmplContent.querySelector('.thumb-layout');
    this.title = this.parent.querySelector('.title');
    this.thumbnailsRef = this.parent.querySelector('.thumbnails');
    this.parent.id = this.data.id;
    this.title.innerText = this.data.name;
    document.getElementById('thumbnails').appendChild(this.tmplContent);

    this.recursive = (parent, childs) => {
      childs.forEach(child => {
        // console.log(child);
        const tag = document.createElement(child.tag);
        if (child.id) tag.id = child.id;
        // l'array "classes" è sempre presente però potrebbe essere vuoto, se non ci sono classi da impostare
        child.classes.forEach(cssClass => tag.classList.add(cssClass));
        parent.appendChild(tag);
        if (child.childs) this.recursive(tag, child.childs);
      });
    }
    if (this.#data.childs) this.recursive(this.thumbnailsRef, this.#data.childs);
  }

}
