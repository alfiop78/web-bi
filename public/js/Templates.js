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

	create() {
		// options: un boolean che indica se aggiungere al DOM anche il div delle opzioni (.resourceActions)
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
				if (child.actions) {
					this.actionsContent = this.resourceActionsTmpl.content.cloneNode(true);
					this.resourceAction = this.actionsContent.querySelector('.resourceActions');
					parent.appendChild(this.resourceAction);
					child.actions.forEach(action => {
						this.tmpl = document.getElementById(action.template);
						this.tmpl_content = this.tmpl.content.cloneNode(true);
						this.btn = this.tmpl_content.querySelector('button');
						this.btn.dataset.fn = action.fn;
						this.resourceAction.appendChild(this.btn);

					});
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
