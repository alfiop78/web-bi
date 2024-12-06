class Templates {
  #data = new Map();
  constructor() {
    this.resourceActionsTmpl = document.getElementById('tmpl-actions-resource');
  }

  set data(value) {
    // this.#data = value;
    this.#data.set(value.id, value);
  }

  get data() { return this.#data; }

  createFilterSection() {
    const parent = document.querySelector(`#flt__${Resource.ref.id}`);
    Resource.specs.filters.forEach(filter => {
      const template = document.getElementById('template__filter');
      const tmplFilterContent = template.content.cloneNode(true);
      const container = tmplFilterContent.querySelector('.filter__container');
      // const filterDiv = container.querySelector('.preview-filter');
      const span = container.querySelector('span');
      const btnOptions = container.querySelector('button');
      container.id = filter.containerId;
      container.dataset.name = filter.id;
      container.dataset.label = filter.filterColumnLabel;
      container.dataset.caption = filter.caption;
      container.addEventListener('click', addDashboardFilter);
      // filterDiv.addEventListener('dragstart', app.filterDragStart);
      // containerDiv.addEventListener('dragover', app.filterDragOver);
      // containerDiv.addEventListener('dragenter', app.filterDragEnter);
      // containerDiv.addEventListener('dragleave', app.filterDragLeave);
      // containerDiv.addEventListener('drop', app.filterDrop);
      // containerDiv.addEventListener('dragend', app.filterDragEnd);
      btnOptions.dataset.id = filter.containerId;
      btnOptions.dataset.label = filter.filterColumnLabel;
      span.innerText = filter.caption;
      parent.appendChild(container);
    });
  }

  create() {
    // console.log(this.#data);
    // recupero l'elemento 'parent' a cui aggiungere il template json (presente in data)
    this.parent = document.getElementById(this.#data.get(this.id).parentElement_id);
    this.parent.querySelector('.layout')?.remove();
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
        for (const [key, value] of Object.entries(child.attributes)) {
          tag.dataset[key] = value
        }
        parent.appendChild(tag);
        if (child.attributes.actions) {
          this.actionsContent = this.resourceActionsTmpl.content.cloneNode(true);
          this.resourceAction = this.actionsContent.querySelector('.resourceActions');
          parent.appendChild(this.resourceAction);
        }
        if (child.childs) this.recursive(tag, child.childs);
      });
    }
    if (this.#data.get(this.id).childs) this.recursive(this.parent, this.#data.get(this.id).childs);
  }

  thumbnails() {
    this.tmplThumbnail = document.getElementById('tmpl-thumbnails');
    this.tmplContent = this.tmplThumbnail.content.cloneNode(true);
    this.parent = this.tmplContent.querySelector('.thumb-layout');
    this.title = this.parent.querySelector('.title');
    this.thumbnailsRef = this.parent.querySelector('.thumbnails');
    this.parent.id = this.data.get(this.id).id;
    this.title.innerText = this.data.get(this.id).name;
    document.getElementById('thumbnails').appendChild(this.tmplContent);

    this.recursive = (parent, childs) => {
      childs.forEach(child => {
        // console.log(child);
        const tag = document.createElement(child.tag);
        if (child.id) tag.id = `thumb-${child.id}`;
        // l'array "classes" è sempre presente però potrebbe essere vuoto, se non ci sono classi da impostare
        child.classes.forEach(cssClass => tag.classList.add(cssClass));
        parent.appendChild(tag);
        if (child.childs) this.recursive(tag, child.childs);
      });
    }
    if (this.#data.get(this.id).childs) this.recursive(this.thumbnailsRef, this.#data.get(this.id).childs);
  }

}
