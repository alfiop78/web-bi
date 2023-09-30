class Templates {
  #data;
  constructor() { }

  set data(value) {
    this.#data = value;
  }

  get data() { return this.#data; }

  create() {
    console.log(this.#data);
    // recupero l'elemento 'parent' a cui aggiungere il template json (presente in data)
    this.parent = document.getElementById(this.#data.parentElement_id);
    // console.log(this.parent);
    this.recursive = (parent, childs) => {
      childs.forEach(child => {
        console.log(child);
        const tag = document.createElement(child.tag);
        tag.id = child.id;
        // l'array "classes" è sempre presente però potrebbe essere vuoto, se non ci sono classi da impostare
        child.classes.forEach(cssClass => tag.classList.add(cssClass));
        parent.appendChild(tag);
        if (child.childs) this.recursive(tag, child.childs);
      });
    }
    if (this.#data.childs) this.recursive(this.parent, this.#data.childs);
  }

}
