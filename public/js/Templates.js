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
        // se, l'elemento che sto creando è un .chart-elements dovrò
        // aggiungere anche le icone per configurarlo, eliminarlo ecc...
        if (child.attributes) {
          for (const [key, value] of Object.entries(child.attributes)) {
            tag.dataset[key] = value
          }
          if (child.type === 'icon') tag.innerText = child.text;
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
        if (child.classes) {
          child.classes.forEach(cssClass => tag.classList.add(cssClass));
        }
        parent.appendChild(tag);
        if (child.childs) this.recursive(tag, child.childs);
      });
    }
    if (this.#data.childs) this.recursive(this.thumbnailsRef, this.#data.childs);
  }

}
