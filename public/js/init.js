var App = new Application();
var cube = new Cube();
var StorageCube = new CubeStorage();
var Dim = new Dimension();
var Hier = new Hierarchy();
(() => {
	var app = {
		dialogCubeName : document.getElementById('cube-name'),
		dialogDimensionName : document.getElementById('dimension-name'),
		dialogHierarchyName : document.getElementById('hierarchy-name'),
		dialogVersioning : document.getElementById('versioning'),
		// templates
		tmplDimension : document.getElementById('tmpl-dimension-list'),
		tmplCube : document.getElementById('tmpl-cube-list'),

		hierarchyContainer : document.getElementById('hierarchiesContainer'), // struttura gerarchica sulla destra

		btnBack : document.getElementById('mdc-back'),

		// btn dialog versioning
		btnCubes : document.getElementById('navBtnCubes'),
		btnDimensions : document.getElementById('navBtnDimensions'),
		btnMetrics : document.getElementById('navBtnMetrics'),
		btnFilters : document.getElementById('navBtnFilters'),
		btnProcesses : document.getElementById('navBtnProcesses'),

		// actions button
		btnSaveDimension : document.getElementById('saveDimension'),
		btnHierarchySaveName : document.getElementById('btnHierarchySaveName'),
		btnHierarchyNew : document.getElementById('hierarchyNew'),
		btnSaveCube : document.getElementById('saveCube'),
		btnSaveCubeName : document.getElementById('btnCubeSaveName'),
		btnSaveOpenedCube : document.getElementById('saveOpenedCube'),
		btnDefinedCube : document.getElementById('definedCube'),

		// tasto openTableList
		btnTableList : document.getElementById('openTableList'),
		tableList : document.getElementById('tableList'),
		// tasto openDimensionList per l'apertura dell'elenco delle dimensioni
		btnDimensionList : document.getElementById('openDimensionList'),
		dimensionList : document.getElementById('dimensionList'),
		// tasto definisci Cubo
		btnNewFact : document.getElementById('cube'),
		
		card : null,
		cardTitle : null,
		content : document.getElementById('content'),
		body : document.getElementById('body'),
		dropZone : document.getElementById('drop-zone'),
		// dropzone : document.getElementsByClassName('dropzone')[0],
		currentX : 0,
		currentY : 0,
		initialX : 0,
		initialY : 0,
		active : false,
		xOffset : 0,
		yOffset : 0,
		popup: document.getElementById('popup-help'),
		dragElement : null,
		elementMenu : null,
		guideStep : [
			'Seleziona uno Schema sulla sinistra per iniziare',
			'Aggiungi le tabelle da mappare trascinandole da "Lista Tabelle"'
		],
		messageId : 0
	};

	App.init();

	// utilizzato per lo spostamento all'interno del drop-zone (card già droppata)
	app.dragStart = (e) => {
        // console.log('dragStart : ', e.target);
		// mousedown da utilizzare per lo spostamento dell'elemento
		if (e.target.localName === 'h6') {
			app.cardTitle = e.target;
			app.card = e.path[4];
			// recupero la posizione attuale della card tramite l'attributo x-y impostato su .cardTable
			app.xOffset = e.path[4].getAttribute('x');
			app.yOffset = e.path[4].getAttribute('y');
			// console.log('xOffset : ', app.xOffset);
			// console.log('yOffset : ', app.yOffset);
		}
		// cardTitle = document.querySelector('.card.table .title > h6');
		if (e.type === 'touchstart') {
			app.initialX = e.touches[0].clientX - app.xOffset;
			app.initialY = e.touches[0].clientY - app.yOffset;
		} else {
			app.initialX = e.clientX - app.xOffset;
			app.initialY = e.clientY - app.yOffset;
		}
		if (e.target === app.cardTitle) {app.active = true;}
	};

	// spostamento della card già droppata
    app.dragEnd = () => {
        // console.log('dragEnd');
		// console.log(e.target);
		// mouseup, elemento rilasciato dopo lo spostamento
		app.initialX = app.currentX;
		app.initialY = app.currentY;
		app.active = false;
	};

	// evento attivato quando sposto la card già droppata all'interno della drop-zone
    app.drag = (e) => {
        // console.log('drag');
        // console.log('e.target drag : ', e.target);
		// mousemove elemento si sta spostando
		if (app.active) {
			e.preventDefault();
			// debugger;
			if (e.type === 'touchmove') {
				app.currentX = e.touches[0].clientX - app.initialX;
				app.currentY = e.touches[0].clientY - app.initialY;
			} else {
				app.currentX = e.clientX - app.initialX;
				app.currentY = e.clientY - app.initialY;
			}

			app.xOffset = app.currentX;
			app.yOffset = app.currentY;
			// imposto sulla .cardTable le posizioni dove è 'stato lasciato'  dopo il drag in modo da "riprendere" lo
			// spostamento da dove era rimasto
			app.card.setAttribute('x', app.xOffset);
			app.card.setAttribute('y', app.yOffset);

			app.card.style.transform = 'translate3d(' + app.currentX + 'px, ' + app.currentY + 'px, 0)';
		}
	};

	app.dropZone.onmousedown = app.dragStart;
	app.dropZone.onmouseup = app.dragEnd;
	app.dropZone.onmousemove = app.drag;

	// TODO: aggiungere anhce eventi touch...

	app.handlerDragStart = (e) => {
		// console.log('handlerDragStart');
		// dragStart
		// console.log(e.target.id);
		// return;
		e.dataTransfer.setData('text/plain', e.target.id);
		e.dataTransfer.effectAllowed = "copy";
        // console.log(e.dataTransfer);
		// app.dragElement = document.getElementById(e.target.id);
		// console.log(e.path);
		// app.elementMenu = e.path[1]; // elemento da eliminare al termine drl drag&drop
		// console.log(e.dataTransfer);
	};

	app.handlerDragOver = (e) => {
		// console.log('handlerDragOver');
		e.preventDefault();
		// console.log('dragOver:', e.target);
		if (e.target.classList.contains('dropzone')) {
			e.dataTransfer.dropEffect = "copy";
		} else {
			e.dataTransfer.dropEffect = "none";
		}
	};

	app.handlerDragEnter = (e) => {
		// console.log('handlerDragEnter');
		e.preventDefault();
		// console.log(e.target);
		// if (e.target.id === "help-drop") e.target.remove();

		if (e.target.className === 'dropzone') {
			console.info('DROPZONE');
			// e.dataTransfer.dropEffect = "copy";
			// coloro il border differente per la dropzone
			// la class dropping nasconde (display: none) automaticamente lo span che contiene "Trascina qui gli element......"
			e.target.classList.add('dropping');
		} else {
			// TODO: se non sono in una dropzone modifico l'icona del drag&drop (icona "non consentito")
			// e.dataTransfer.dropEffect = "none";
		}
	};

	app.handlerDragLeave = (e) => {
        // console.log('handlerDragLeave');
		e.preventDefault();
		// console.log('dragLeave');
	};

	app.handlerDragEnd = (e) => {
        // console.log('handlerDragEnd');
		e.preventDefault();
		// console.log('dragEnd');
		// console.log(e.target);
		// debugger;
		// faccio il DESCRIBE della tabella
		app.getTable(e.target.getAttribute('data-schema'), cube.card.tableName);
	};

	app.handlerDrop = (e) => {
        // console.log('handlerDrop');
        // TODO: ottimizzare
		e.preventDefault();
		e.target.classList.replace('dropping', 'dropped');
		if (e.target.id !== 'drop-zone') return; // anullo il drop (da vedere drop abort oppure dropcancel)
		// console.log('drop');
		// console.log(e.target);
		let data = e.dataTransfer.getData('text/plain');
        let card = document.getElementById(data).cloneNode(true);
		// nuova tabella droppata
		// console.log(card);
		// la .card .draggable diventa .card .table
		card.className = 'card table';
		card.removeAttribute('draggable');
		card.removeAttribute('name');
		// elimino lo span all'interno della card
		card.querySelector('span[label]').remove();
		// associo gli eventi mouse
		// TODO: da eliminare per impostarli nel document.addEventListener
		card.onmousedown = app.dragStart;
		card.onmouseup = app.dragEnd;
		card.onmousemove = app.drag;
		// prendo il template cardLayout e lo inserisco nella card table
		let tmpl = document.getElementById('cardLayout');
		let content = tmpl.content.cloneNode(true);
		let cardLayout = content.querySelector('.cardLayout');

		// imposto il titolo in h6
		cardLayout.querySelector('h6').innerHTML = card.getAttribute('label');
		card.appendChild(cardLayout);
		app.dropZone.appendChild(card);

		// tabella fact viene colorata in modo diverso, imposto attributo fact sia sulla .card.table che sulla .cardTable
		if (document.getElementById('tableList').hasAttribute('fact')) {
			card.setAttribute('fact', true);
			card.querySelector('.cardTable').setAttribute('fact', true);
			// visualizzo l'icona metrics
			card.querySelector('section[options] > .popupContent[hide]').removeAttribute('hide');
		}

		// imposto la card draggata nella posizione dove si trova il mouse
		// console.log('e.target : ', e.target);
		card.style.transform = 'translate3d(' + e.offsetX + 'px, ' + e.offsetY + 'px, 0)';
		card.setAttribute('x', e.offsetX);
		card.setAttribute('y', e.offsetY);
		// chiudo la list openTableList
		// TODO: definire in Application.js la chiusura/apertura di tutte le liste
		app.btnTableList.removeAttribute('open');
		app.tableList.toggleAttribute('hidden');

		// evento sul tasto close della card
		// TODO: da associare al document.addEventListener
		card.querySelector('i[data-id="closeTable"]').onclick = app.handlerCloseCard;
		// imposto la input search, con questo attributo, l'evento input viene gestito in Application.js
		card.querySelector('input').setAttribute('data-element-search', card.getAttribute('label'));
	
		cube.activeCard = {'ref': card.querySelector('.cardTable'), 'schema' : card.getAttribute('data-schema'), 'tableName': card.getAttribute('label')};
		// creazione della struttura gerarchica sulla destra
		app.hierStruct(card);

		// event sui tasti section[options]
		// TODO: da gestire con document.addEventListener
		card.querySelector('i[join]').onclick = app.handlerAddJoin;
		card.querySelector('i[metrics]').onclick = app.handlerAddMetric;
		card.querySelector('i[columns]').onclick = app.handlerAddColumns;
	};

	app.hierStruct = (card) => {
		if (!document.querySelector('section[data-active]')) {
			// creo la struttura per la gerarchia
			const parent = document.getElementById('hierarchiesContainer');
			const tmpl = document.getElementById('tmpl-hierarchies');
			const content = tmpl.content.cloneNode(true);
			const sectionDataHier = content.querySelector('section[data-hier-id]');
			const h6 = content.querySelector('h6');
			const btnSaveHierarchy = content.querySelector("button[data-id='hierarchySave']");
			h6.innerHTML = cube.card.tableName;
			parent.appendChild(sectionDataHier);
			const divHier = sectionDataHier.querySelector('div');
			// aggiungo la tabella al div all'interno di sectionDataHier
			const tmplTable = document.getElementById('tmpl-hier-table');
			const tmplContentTable = tmplTable.content.cloneNode(true);
			const divTable = tmplContentTable.querySelector('div');
			divTable.innerHTML = cube.card.tableName;
			divTable.setAttribute('data-schema', card.getAttribute('data-schema'));
			divTable.setAttribute('label', cube.card.tableName);
			divHier.appendChild(divTable);
			btnSaveHierarchy.addEventListener('click', app.btnSaveHierarchy);
		} else {
			// debugger;
			const parent = document.querySelector('section[data-active] > div');
			const tmplTable = document.getElementById('tmpl-hier-table');
			const tmplContentTable = tmplTable.content.cloneNode(true);
			const divTable = tmplContentTable.querySelector('div');
			divTable.innerHTML = cube.card.tableName;
			divTable.setAttribute('data-schema', card.getAttribute('data-schema'));
			divTable.setAttribute('label', cube.card.tableName);
			parent.appendChild(divTable);

		}
	};

	app.hierDragStart = (e) => {
		console.log('hier drag start');
		e.dataTransfer.setData('text/plain', e.target.id);
		// disattivo temporaneamente gli eventi drop e dragend su app.content
		app.content.removeEventListener('dragend', app.handlerDragEnd, true);
		app.content.removeEventListener('drop', app.handlerDrop, true);
	};

	app.hierDragOver = (e) => {
		console.log('dragover');
		e.preventDefault();
		// console.log(e.target);
	};

	app.hierDragEnter = (e) => {
		e.preventDefault();
		console.log(e.target);

		if (e.target.className === 'dropzoneHier') {
			console.info('DROPZONE');
			// TODO: css effect
		}
	};

	app.hierDragLeave = (e) => {e.preventDefault();};

	app.hierDragEnd = (e) => {
		e.preventDefault();
		// reimposto gli eventi drop e dragend su app.content
		app.content.addEventListener('dragend', app.handlerDragEnd, true);
		app.content.addEventListener('drop', app.handlerDrop, true);
	};

	app.hierDrop = (e) => {
		e.preventDefault();
		let data = e.dataTransfer.getData('text/plain');
		console.log(data);
		const draggedCard = document.getElementById(data);
		const nextCard = draggedCard.nextElementSibling;
		// e.target.before(document.getElementById(data));
		// verifico se il target è l'elemento successivo o precedente, se successivo effettuo un after() altrimenti un before()
		(e.target === nextCard) ? e.target.after(document.getElementById(data)) : e.target.before(document.getElementById(data));

		// let parent = document.getElementById('hierTables');
		// parent.replaceChild(document.getElementById(data), e.target);
	};

	app.content.ondragover = app.handlerDragOver;
	app.content.ondragenter = app.handlerDragEnter;
	app.content.ondragleave = app.handlerDragLeave;
	app.content.ondrop = app.handlerDrop;
	//app.content.addEventListener('drop', app.handlerDrop, true);
	// app.content.ondragend = app.handlerDragEnd;
	app.content.addEventListener('dragend', app.handlerDragEnd, true);

	app.handlerColumns = (e) => {
		// selezione della colonna nella card table
		// console.log(e.target);
		// passo a activeCard il riferimento nel DOM della card attiva
		Hier.activeCard = app.dropZone.querySelector(".cardTable[name='" + e.currentTarget.getAttribute('data-table-name') + "']");
		// debugger;
		cube.fieldSelected = e.currentTarget.getAttribute('label');
		// TODO: utilizzare uno dei due qui, cube.fieldSelected oppure hier.field, da rivedere
		Hier.field = {field : e.currentTarget.getAttribute('label'), type : e.currentTarget.getAttribute('data-key')};
		// debugger;

		// se è presente un altro elemento con attributo hierarchy ma NON data-relation-id, "deseleziono" quello con hierarchy per mettere ...
		// ...[hierarchy] a quello appena selezionato. In questo modo posso selezionare solo una colonna per volta ad ogni relazione da creare
		// se però, viene cliccato una colonna con già una relazione impostata (quindi ha [data-relationn-id]) elimino la relazione da
		// ...entrambe le tabelle tramite un identificatifo di relazione

		let attrs = cube.card.ref.getAttribute('mode');

		switch (attrs) {
			case 'relations':
				if (e.currentTarget.hasAttribute('data-relation-id')) {
					// debugger;
					/* oltre a fare il toggle dell'attributo, se questa colonna era stata già messa in
					relazione con un altra tabella (quindi attributo [data-relation-id] presente) elimino anche la relazione tra i due campi.
					Bisogna eliminarla sia dal DOM, eliminando [data-relation-id] che dall'array this.hierarchy
					*/
					e.currentTarget.toggleAttribute('selected');
					// recupero tutti gli attributi di e.currentTarget e vado a ciclare this.removeHierarchy(relationId) per verificare uno alla volta quale posso eliminare
					for (let name of e.currentTarget.getAttributeNames()) {
						// console.log(name);
						let relationId, value;
						if (name.substring(0, 9) === 'data-rel-') {
							relationId = name;
							value = e.currentTarget.getAttribute(name);
							app.removeHierarchy(relationId, value);
						}
					}
				} else {
					let liRelationSelected = Hier.card.querySelector('li[relations]:not([data-relation-id])');
					// console.log(liRelationSelected);
					e.currentTarget.toggleAttribute('relations');
					e.currentTarget.toggleAttribute('selected');
					// se ho selezionato una colonna diversa da quella già selezionata, rimuovo la selezione corrente e imposto quella nuova
					if (liRelationSelected && (liRelationSelected.id !== e.currentTarget.id)) {
						liRelationSelected.toggleAttribute('relations');
						liRelationSelected.toggleAttribute('selected');
					}
				}
				app.createHierarchy();
				break;
			case 'metrics':
				console.log('metrics');
				e.currentTarget.toggleAttribute('metrics');

				if (!e.currentTarget.hasAttribute('metrics')) {
					// TODO: delete cube.metrics[tableName][fieldName];
				} else {
					cube.metrics = cube.fieldSelected;
				}
				break;
			default:
				// se la card è stata imposta con l'attributo mode ...
				// debugger;
				if (cube.card.ref.hasAttribute('mode')) {
					console.log('columns');
					e.currentTarget.toggleAttribute('columns');
					// nel metodo columns c'è la logica per controllare se devo rimuovere/aggiungere la colonna selezionata
					Hier.columns();
					// se è stata impostata almento una colonna posso abilitare il tasto 'hierarchySave'
					console.log(Hier.columns_);
					// debugger;
					// recuper o il tasto Save della gerarchia attiva
					debugger;
					const btnSaveHierarchy = document.querySelector("#box-hierarchy section[data-id='hierarchies'][data-active] button[data-id='hierarchySave']");
					(Object.keys(Hier.columns_).length !== 0) ? btnSaveHierarchy.disabled = false : btnSaveHierarchy.disabled = true;
				}
		}
	};

	// click sull'icona di destra "columns" per l'associazione delle colonne
	app.handlerAddColumns = (e) => {
		// console.log(e.target);
		// console.log('add columns');
		const cardTable = e.path[3].querySelector('.cardTable');
		// console.log('cardTable : ', cardTable);
		cube.activeCard = {'ref': cardTable, 'schema' : cardTable.getAttribute('data-schema'), 'tableName': cardTable.getAttribute('name')};
		// quando aggiungo la tabella imposto da subito la colonna id in "columns"
		Hier.activeCard = cardTable; // card attiva
		cube.mode('columns');
	};

	app.handlerAddMetric = (e) => {
		// imposto il metrics mode
		const cardTable = e.path[3].querySelector('.cardTable');
		cube.activeCard = {'ref': cardTable, 'tableName': cardTable.getAttribute('name')};
		cube.mode('metrics', 'Seleziona le colonne da impostare come Metriche');
	};

	app.createHierarchy = (e) => {
		console.log('create Relations');
		let hier = [];
		let colSelected = [];
		console.log( document.querySelectorAll('.cardTable[mode="relations"] li[relations][selected]').length);
		// quando i campi selezionati sono 1 recupero il nome della tabella perchè questa gerarchia avrà il nome della prima tabella selezionata da mettere in relazione
		if (document.querySelectorAll('.cardTable[mode="relations"] li[relations][selected]').length === 1) {
			Hier.table = document.querySelector('.cardTable[mode="relations"] li[relations][selected]').getAttribute('data-table-name');
		}
		console.log('dimension.table : ', Hier.table);
		// debugger;
		document.querySelectorAll('.cardTable[mode="relations"]').forEach((card) => {
			let tableName = card.getAttribute('name');
			let liRef = card.querySelector('li[relations][selected]');
			if (liRef) {
				// metto in un array gli elementi selezionati per la creazione della gerarchia
				colSelected.push(liRef);
				hier.push(tableName+'.'+liRef.innerText); // questa istruzione crea "Azienda.id"
			}
			console.log(hier);
			// per creare correttamente la relazione è necessario avere due elementi selezionati
			if (hier.length === 2) {
				// se, in questa relazione, è presente anche la tabella FACT rinomino hier_n in fact_n in modo da poter separare le gerarchie
				// e capire quali sono quelle con la fact e quali no (posso salvare la Dimensione, senza il legame con il Cubo)
				if (card.hasAttribute('fact')) {
					console.log('FACT TABLE Relation');
					cube.relations['cubeJoin_'+cube.relationId] = hier;
					cube.relationId++;
					console.log(cube.relations);
					cube.saveRelation(colSelected);
				} else {
					debugger;
					Hier.join = hier;
					// visualizzo le icone di "join" nelle due colonne
					Hier.showRelationIcons(colSelected);
					console.log(Hier.join);
					// esiste una relazione, visualizzo il div hierarchiesContainer
					app.hierarchyContainer.removeAttribute('hidden');
				}
			}
		});
	};

	app.removeHierarchy = (relationId, value) => {
		console.log(relationId);
		console.log(value);
		debugger;
		console.log('delete hierarchy');
		/* prima di eliminare la gerarchia devo stabilire se le due card, in questo momento, sono in modalità hierarchies
		// ...(questo lo vedo dall'attributo presente su card-table)
		// elimino la gerarchia solo se la relazione tra le due tabelle riguarda le due tabelle attualmente impostate in modalità [hierarchies]
		// se la relazione riguarda le tabelle A e B e attualmente la modalità impostata è A e B allora elimino la gerarchia
		// altrimenti se la relazione riguarda A e B e attualmente la modalità impostata [hierarchies] riguarda B e C aggiungo la relazione e non la elimino
		*/
		// elementi li che hanno la relazione relationId
		let liElementsRelated = document.querySelectorAll('.cardTable[hierarchies] li[data-relation-id]['+relationId+']').length;

		if (liElementsRelated === 2) {
			// tra le due tabelle .card-table[hiearachies] non esiste questa relazione, per cui si sta creando una nuova relazione
			// ci sono due colonne che fanno parte di "questa relazione" (cioè delle due tabelle attualmente in modalità [hierarchies]) quindi possono essere eliminate
			document.querySelectorAll('.cardTable[hierarchies] ul > .element > li[data-relation-id]['+relationId+']').forEach((li) => {
				console.log('elimino li :'+li.innerText);
				// TODO: se è presente un'altra relazione, quindi un altro attributo data-rel, NON elimino [hierarchy] e [data-relation-id]
				//... (per non eliminare l'icona) che fa riferimento ad un'altra relazione sulla stessa colonna (doppia chiave)
				li.removeAttribute(relationId);
				li.removeAttribute('selected');
				let relationFound = false; // altra relazione trovata ?
				// console.log(li.getAttributeNames());
				// console.log(li.getAttributeNames().indexOf('data-rel-'));
				li.getAttributeNames().forEach((attr) => {
					// console.log(attr.indexOf('data-rel-'));
					if (attr.indexOf('data-rel-') !== -1) {
						console.log('trovata altra relazione : '+attr);
						relationFound = true;
					}
				});
				if (!relationFound) {
					li.removeAttribute('data-relation-id');
					li.removeAttribute('hierarchy');
				}
			});
			delete cube.hierarchyFact['dimensionJoin_'+value];
			delete cube.hierarchyTable['dimensionJoin_'+value];
			console.log(cube.hierarchyTable);
		}
	};

	app.handlerCloseCard = (e) => {
		// elimino la card e la rivisualizzo nel drawer (spostata durante il drag&drop)
		console.log(e.target);
		console.log(e.path);
		// TODO: rimettere la card chiusa al suo posto originario, nel drawer
		e.path[5].remove();
		// TODO: eliminare anche dal flusso delle gerarchie sulla destra

		// TODO: controllo struttura gerarchica
	};

	// recupero la lista delle dimensioni
	app.getDimensions = () => {
		const dimension = new DimensionStorage();
		// dimensions : è un Object che contiene un array con le tabelle incluse nella dimensione
		const dimensions = dimension.list();
		// debugger;
		for (const [key, value] of Object.entries(dimensions)) {
			// key : nome
			console.log('value : ', value);
			let tmplContent = app.tmplDimension.content.cloneNode(true);
			const section = tmplContent.querySelector('section');
			section.setAttribute('data-element-search', 'dimensions');
			section.setAttribute('data-label', key);
			const div = tmplContent.querySelector('.dimensions');
			const btnDimensionUse = tmplContent.querySelector('.mini-card-buttons > button[data-id="dimension-use"]');
			const btnDimensionEdit = tmplContent.querySelector('.mini-card-buttons > button[data-id="dimension-edit"]');
			div.querySelector('h5').innerHTML = key;
			// per ogni gerarchia recupero la prop 'from'
			for (const [hierName, hierValue] of Object.entries(value.hierarchies)) {
				console.log(hierName);
				console.log(hierValue);
				const tmplHierarchyList = document.getElementById('tmpl-hierarchy-list');
				const tmplHierarchyContent = tmplHierarchyList.content.cloneNode(true);
				const divHier = tmplHierarchyContent.querySelector('.hierarchies');
				const h6 = tmplHierarchyContent.querySelector('h6');
				const divTables = tmplHierarchyContent.querySelector('.tables');
				const btnUse = tmplHierarchyContent.querySelector("button[data-id='dimension-use']");
				const btnEdit = tmplHierarchyContent.querySelector("button[data-id='dimension-edit']");
				btnUse.setAttribute('data-dimension-name', key);
				btnUse.setAttribute('data-hierarchy-name', hierName);
				btnEdit.setAttribute('data-dimension-name', key);
				btnEdit.setAttribute('data-hierarchy-name', hierName);
				h6.innerText = hierName;
				tmplContent.querySelector('div[data-dimension-tables]').appendChild(divHier);
				hierValue.from.forEach( (table) => {
					let div = document.createElement('div');
					div.innerText = table;
					divTables.appendChild(div);
				});
				btnUse.onclick = app.handlerDimensionSelected;
				btnEdit.onclick = app.handlerDimensionEdit;
			}
			div.querySelector('h5').setAttribute('label', key);
			document.querySelector('#dimensions').appendChild(section);
		}
	};

	// recupero la lista dei Cubi in localStorage
	app.getCubes = () => {
		const ul = document.getElementById('cubes');
		console.log(StorageCube.cubes);
		// StorageCube.list(ul);
		for (const [key, value] of Object.entries(StorageCube.cubes)) {
			let tmplContent = app.tmplCube.content.cloneNode(true);
			const section = tmplContent.querySelector('section');
			const element = tmplContent.querySelector('.element');
			const li = tmplContent.querySelector('li');
			section.setAttribute('data-label', key);
			li.setAttribute('label', key);
			li.innerText = key;
			/* TODO: questi erano precedentemente impostati, da valutare se servono ancora
			li.id = 'cube-id-' + value['id'];
			li.setAttribute('data-cube-id', value['id']);*/

			li.setAttribute('data-fn', 'handlerCubeSelected');
			ul.appendChild(section);
		}
		// associo la Fn che gestisce il click sulle <li>
		// ul.querySelectorAll('li').forEach( (li) => li.addEventListener('click', app.handlerCubeSelected) );
	};

	// selezione di un cubo già definito, da qui è possibile associare, ad esempio, una nuova dimensione ad un cubo già esistente.
	app.handlerCubeSelected = (e) => {
		// apro la tabella definita come Cubo
		console.log('e.currentTarget : ', e.currentTarget);
		debugger;
		StorageCube.selected = e.currentTarget.getAttribute('label');
		console.log('cube selected : ', StorageCube.selected);
		// ridefinisco le proprietà del cubo, leggendo da quello selezionato, nello storage, per consentirne la modifica o l'aggiunto di dimensioni al cubo
		// TODO: la prop privata _metric la devo definire tramite un Metodo
		cube._metrics = StorageCube.selected.metrics;
		debugger;
		StorageCube.selected.associatedDimensions.forEach( (dim) => {
			cube.associatedDimensions = dim;
		});
		debugger;
		app.addCard(`${StorageCube.selected.schema}.${StorageCube.selected.FACT}`, true);
		// visualizzo il tasto saveOpenedCube al posto di SaveCube
		app.btnSaveOpenedCube.parentElement.toggleAttribute('hide');
		// nascondo btnSaveCube
		app.btnSaveCube.parentElement.toggleAttribute('hide');
	};

	// recupero le tabelle del database in base allo schema selezionato
	app.getDatabaseTable = async (schema) => {
		const url = '/fetch_api/schema/'+schema+'/tables';
		await fetch(url)
			.then( (response) => {
                console.log(response);
			if (!response.ok) {throw Error(response.statusText);}
			return response;
			})
			.then( (response) => response.json())
			.then( (data) => {
		        console.log(data);
		        if (data) {
		        	let ul = document.getElementById('tables');
		        	// attivo tutti i tasti presenti in .actions dopo aver caricato l'elenco delle tabelle
		        	app.btnTableList.classList.remove('md-inactive');
		        	app.btnDimensionList.classList.remove('md-inactive');
		        	app.btnNewFact.classList.remove('md-inactive');
		        	app.btnSaveCube.classList.remove('md-inactive');
		        	app.btnSaveCubeName.classList.remove('md-inactive');
		        	app.btnDefinedCube.classList.remove('md-inactive');

		        	// popolo l'elenco delle tabelle
		        	for (const [key, value] of Object.entries(data)) {
		        		// debugger;
		        		let tmpl = document.getElementById('el');
						let tmplContent = tmpl.content.cloneNode(true);
						const section = tmplContent.querySelector('section');
						section.setAttribute('data-label', value.TABLE_NAME);

						let element = tmplContent.querySelector('.element.card');
						element.ondragstart = app.handlerDragStart;
						element.id = 'table-' + key;
						element.setAttribute('data-schema', schema);
						element.setAttribute('label', value.TABLE_NAME);
						ul.appendChild(section);
						let span = document.createElement('span');
						span.classList = 'elementSearch';
						span.setAttribute('label', value.TABLE_NAME);
						span.innerHTML = value.TABLE_NAME;
						element.appendChild(span);
		        	}
		        } else {
		          // TODO: no data
		          console.warning('Non è stato possibile recuperare la lista delle tabelle');
		        }
		    })
	    .catch( (err) => console.error(err));
	};

	app.handlerAddJoin = (e) => {
		// debugger;
		const cardTable = e.path[3].querySelector('.cardTable');
		cube.activeCard = {'ref': cardTable, 'schema' : cardTable.getAttribute('data-schema'), 'tableName': cardTable.getAttribute('name')};
		cube.mode('relations');
	};

	app.getTable = async (schema, table) => {
		let tmplList = document.getElementById('templateListColumns');
		// elemento dove inserire le colonne della tabella
		let ulContainer = cube.card.ref.querySelector('#columns');

	    await fetch('/fetch_api/'+schema+'/schema/'+table+'/table_info')
			.then( (response) => {
			if (!response.ok) {throw Error(response.statusText);}
			return response;
			})
			.then( (response) => response.json())
			.then( (data) => {
				// console.log('response getTable');
                // console.log(data);
		        if (data) {
		        	ulContainer.removeAttribute('hidden');
		        	for ( const [key, value] of Object.entries(data)) {
                        // console.log(key, value);
		        		let tmplContent = tmplList.content.cloneNode(true);
		        		const section = tmplContent.querySelector('section');
		        		section.setAttribute('data-label', value.COLUMN_NAME);
		        		section.setAttribute('data-element-search', table);
						let li = section.querySelector('li');
						li.className = 'elementSearch';
						li.innerText = value.COLUMN_NAME;
						li.setAttribute('label', value.COLUMN_NAME);
						li.setAttribute('data-table-name', table);
						// scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
						let pos = value.DATA_TYPE.indexOf('(');
						let type = (pos !== -1) ? value.DATA_TYPE.substring(0, pos) : value.DATA_TYPE;
						li.setAttribute('data-type', type);
						li.setAttribute('data-key', value.CONSTRAINT_NAME); // pk : chiave primaria
						//li.setAttribute('data-table',cube.table);
						li.id = key;
						// fn da associare all'evento in 'mutation observe'
						li.setAttribute('data-fn', 'handlerColumns');
						ulContainer.appendChild(section);
		        	}
		        } else {
		          // TODO: no data, handlerConsoleMessage
		          console.error('Non è stato possibile recuperare le colonne della tabella : ', table);
		        }
		    })
	    .catch( (err) => console.error(err));
	};

    app.saveDIM = async (jsonDim) => {
        console.log(jsonDim);
        console.log(JSON.stringify(jsonDim));
        // await fetch('/fetch_api/json/'+JSON.stringify(jsonDim)+'/table/bi_dimensions/save')
        await fetch('/fetch_api/json/'+JSON.stringify(jsonDim)+'/dimension_store')
          .then((response) => {
            if (!response.ok) { throw Error(response.statusText); }
            return response;
          })
          .then((response) => response.json())
          .then((data) => {
            // console.log(data);
            if (data) {
              console.log('data : ', data);
              console.log('DIMENSIONE SALVATA CORRETTAMENTE');
              // app.getDatamart(reportId, jsonDataParsed); // recupero i dati dalla FX appena creata
            } else {
              // TODO: no data
              console.debug('FX non è stata creata');
            }
          })
          .catch((err) => console.error(err));
    };

	// viene invocata da btnDimensionSaveName.onclick, quando viene salvata una dimensione, vengono chiuse tutte le card aperte attualmente
	app.closeCards = () => {
		document.querySelectorAll('.card.table').forEach((item) => {
			// console.log(item);
			item.remove();
		});
	};

	app.handlerOpenTableList = (e) => {
		// console.log(e.target);
		if (e.target.classList.contains('md-inactive')) return;
		document.getElementById('tableList').removeAttribute('fact');
		e.target.toggleAttribute('open');
		document.getElementById('tableList').toggleAttribute('hidden');
		document.getElementById('tableSearch').focus();
	};

	app.addCard = (label, fact) => {
		// creo la card (label)
		// fact : true/false
		let card = document.createElement('div');
		card.className = 'card table';
		// split della stringa <schema>.<tabella>
		card.setAttribute('data-schema', label.split('.')[0]); // schema
		card.setAttribute('label', label.split('.')[1]); // tabella
		if (fact) card.setAttribute('fact', true);
		card.onmousedown = app.dragStart;
		card.onmouseup = app.dragEnd;
		card.onmousemove = app.drag;
		// prendo il template cardLayout e lo inserisco nella .card.table
		let tmpl = document.getElementById('cardLayout');
		let content = tmpl.content.cloneNode(true);
		let cardLayout = content.querySelector('.cardLayout');
		// TODO: da ricontrollare, perchè imposto l'attr 'fact' senza controllare l'argomento fact?
		cardLayout.querySelector('.cardTable').setAttribute('fact', true);
		// imposto il titolo in h6

		cardLayout.querySelector('h6').innerHTML = label.split('.')[1];
		card.appendChild(cardLayout);
		console.log(card);
		app.dropZone.classList.replace('dropping', 'dropped');
		app.dropZone.appendChild(card);
        app.dropZone.classList.add('dropped');

		// evento sul tasto close della card
		card.querySelector('i[data-id="closeTable"]').onclick = app.handlerCloseCard;
		// evento sulla input di ricerca nella card
		// input di ricerca, imposto l'attr data-element-search
		card.querySelector('input[type="search"]').setAttribute('data-element-search', card.getAttribute('label'));
		cube.activeCard = {'ref': card.querySelector('.cardTable'), 'schema' : card.getAttribute('data-schema'), 'tableName': card.getAttribute('label')};

		// event sui tasti section[options]
		card.querySelector('i[join]').onclick = app.handlerAddJoin;

		app.getTable(card.getAttribute('data-schema'), card.getAttribute('label'));
	};

	// selezione di una dimensione da inserire nel body, per legarla al cubo
	app.handlerDimensionSelected = (e) => {
		console.log(e.target);
		const storage = new DimensionStorage();
		storage.selected = e.target.getAttribute('data-dimension-name');
		// memorizzo la dimensione selezionata per recuperarla nel salvataggio del cubo
		cube.dimensionsSelected = e.target.getAttribute('data-dimension-name');
		// recupero tutta la dimensione selezionata, dallo storage
		console.log(storage.selected);
		// aggiungo alla dropzone l'ultima tabella della gerarchia
		app.addCard(storage.selected.lastTableInHierarchy, false);
		// chiudo la lista delle dimensioni
		app.dimensionList.toggleAttribute('hidden');
		app.btnDimensionList.toggleAttribute('open');
	};

	app.addCards = async (dim, hierName) => {
		// dimStorage.selected.hierarchies[hierName].order
		const tables = dim.hierarchies[hierName].order;
		const columns = dim.hierarchies[hierName].columns;
		console.log('tables to add: ', tables);
		for (const [key, value] of Object.entries(tables)) {
			let x = 40, y = 40;
			console.log('key : ', key); // la key la posso utilizzare anche per lo z-index
			console.log('value : ', value);
			const card = document.createElement('div');
			card.className = 'card table';
			// NOTE: Impostazione di una variabile css (--zindex)
			card.style.setProperty('--zindex', key);
			const schema = value.split('.')[0];
			const table = value.split('.')[1];
			card.setAttribute('data-schema', schema);
			card.setAttribute('label', table);
			x *= +key; y *= +key;
			card.style.transform = "translate3d("+x+"px, "+y+"px, 0px)";
			card.setAttribute('x', x);
			card.setAttribute('y', y);
			// recupero il template cardLayout e lo inserisco nella .card.table
			const tmplCardLayout = document.getElementById('cardLayout');
			const tmplContent = tmplCardLayout.content.cloneNode(true);
			const cardLayout = tmplContent.querySelector('.cardLayout');
			// h6 titolo
			cardLayout.querySelector('h6').innerHTML = table;
			card.appendChild(cardLayout);
			// sostituisco dropping con dropped per nascondere lo span con la stringa "Trascina qui..."
			app.dropZone.classList.replace('dropping', 'dropped');
			app.dropZone.appendChild(card);
	        app.dropZone.classList.add('dropped');
	        cube.activeCard = {'ref': card.querySelector('.cardTable'), 'schema' : schema, 'tableName': table};
	        // debugger;
	        // event sui tasti section[options]
	        card.querySelector('i[join]').onclick = app.handlerAddJoin;
	        card.querySelector('i[columns]').onclick = app.handlerAddColumns;
	        // input di ricerca, imposto l'attr data-element-search
	        card.querySelector('input[type="search"]').setAttribute('data-element-search', table);
	        // await : aspetto che getTable popoli tutta la card con i relativi campi
	        await app.getTable(schema, table);
	        console.log('after await');
	        // imposto la card attiva
	        Hier.activeCard = card.querySelector('.cardTable');
	        // seleziono i campi impostati nella dimensione, nelle proprietà 'hierarchies[hiername]columns[value]'
	        // debugger;
	        // se la tabella, appartenente alla gerarchia selezionata, ha field selezionati li imposto come 'selezionati'
	        if (dim.hierarchies[hierName].columns.hasOwnProperty(value)) {
	        	for (const [field, type] of Object.entries(dim.hierarchies[hierName].columns[value])) {
		        	// console.log(field);
		        	// console.log(type);
		        	Hier.activeCard.querySelector("li[label='"+field+"']").toggleAttribute('columns');
		        	Hier.field = {field, type};
					// nel metodo columns c'è la logica per controllare se devo rimuovere/aggiungere la colonna selezionata
					Hier.columns();
		        }
	        }
		}
		// dopo aver caricato tutte le tabelle appartenenti alla dimensione, imposto le gerarchie definite recuperandole dalla proprietà 'join'
		// , dim.join
		// TODO: a questo punto posso recuperare dim.join per inserire nelle tabelle le relative join
		console.clear();
		for (let table in dim.join) {
			Hier.table = table;
			// console.log(table);
			// console.log(dim.join[table]);
			// per ogni tabella
			for (const [joinId, joins] of Object.entries(dim.join[table]) ) {
				// joinId : 0,1,2,ecc... ogni relazione
				console.log('joinId : ', joinId);
				// console.log('joins : ', joins); // array delle relazioni
				// debugger;
				joins.forEach( (table_field) => {
					// debugger;
					const tableName = table_field.split('.')[0];
					const fieldName = table_field.split('.')[1];
					const li = app.dropZone.querySelector(".cardTable[name='" + tableName + "'] li[label='" + fieldName + "']");
					// console.log('tableName : ', tableName);
					// console.log('fieldName : ', fieldName);
					// se questo campo ha già una relazione impostata (ad esempio con un altra tabella), non faccio il toggle dell'attr 'relations' altrimenti viene eliminata la relazione
					if (!li.hasAttribute('relations')) li.toggleAttribute('relations');
					li.setAttribute('data-rel-'+joinId, joinId);
					li.setAttribute('data-relation-id', true);
				});
				
				dimension.hierarchies = joins;
			}
		}
			
	};

	// selezione di una dimensione per consentirne le modifica
	app.handlerDimensionEdit = (e) => {
		// Recupero tutto il json della dimensione selezionata
		const dimStorage = new DimensionStorage();
		dimStorage.selected = e.target.getAttribute('data-dimension-name');
		const hierName = e.target.getAttribute('data-hierarchy-name');
		// TODO: Implementare addCards in modo da svolgere anche le istruzioni di addCard
		app.addCards(dimStorage.selected, hierName);
		// imposto lo span all'interno del dropzone con la descrizione della dimensione auutalmente in modifica
		app.dropZone.querySelector('span').innerHTML = "Dimensione in modifica : " + e.target.getAttribute('data-dimension-name');
		app.dropZone.setAttribute('edit', e.target.getAttribute('data-dimension-name'));
		// chiudo la lista delle dimensioni
		app.dimensionList.toggleAttribute('hidden');
		app.btnDimensionList.toggleAttribute('open');
	};

    app.schemaSelected = (e) => {
    	// TODO: implementare un metodo per caricare di default lo schema 'automotive_bi_data'
        e.preventDefault();
        console.log(e.target);
        // rimuovo l'attributo selected dalla precedente selezione, se ce ne sono
        if (document.querySelector('#nav-schema a[selected]')) {
        	document.querySelector('#nav-schema a[selected]').removeAttribute('selected');
        	// ripulisco la #tableList perchè ci sono tabelle appartenenti allo schema selezionato in precedenza
        	document.querySelectorAll('#tables .element.card').forEach( (element) => {element.remove();});
        }
        e.target.setAttribute('selected', true);
        app.getDatabaseTable(e.target.getAttribute('data-schema'));
        app.handlerGuide();
    };

    // recupero gli schemi database presenti
    /*app.getSchemata = async () => {
		const url = '/fetch_api/schema';
		await fetch(url)
			.then( (response) => {
                console.log(response);
			if (!response.ok) {throw Error(response.statusText);}
			return response;
			})
			.then( (response) => response.json())
			.then( (data) => {
		        console.log(data);
		        if (data) {
                    const nav = document.getElementById('nav-schema');
                    for (const [key, value] of Object.entries(data)) {
                        const a = document.createElement('a');
                        a.innerHTML = value.SCHEMA_NAME;
                        a.href = '#';
                        a.setAttribute('data-schema', value.SCHEMA_NAME);
                        a.id = key;
                        nav.appendChild(a);
                        a.addEventListener('click', app.schemaSelected);
                    }
                    
		        } else {
		          // TODO: no data
		          console.warning('Non è stato possibile recuperare la lista delle tabelle');
		        }
		    })
	    .catch( (err) => console.error(err));
    };*/

    // app.getSchemata(); // l'elenco degli schemi li recupero sulla Route mapping

	// app.getDatabaseTable();

	app.handlerGuide = () => {
		if (app.messageId === 0) {
			app.guideStep[app.messageId];
			document.getElementById('guide').innerHTML = app.guideStep[app.messageId];
			app.messageId++;
		} else {
			document.getElementById('guide').innerHTML = app.guideStep[app.messageId];
			app.messageId++
		}		
	};

	app.getDimensions();

    app.getCubes();

    app.handlerGuide();

    // ***********************events*********************
    // lista cubi già definiti
    app.btnDefinedCube.onclick = (e) => {
		if (e.target.classList.contains('md-inactive')) return;
		// visualizzo la lista dei cubi esistenti
		const cubeList = document.getElementById('cubesList');
		cubeList.toggleAttribute('hidden');
		e.target.toggleAttribute('open');
		document.getElementById('cubeSearch').focus();
	};

	// lista dimensioni già definite
	app.btnDimensionList.onclick = (e) => {
		if (e.target.classList.contains('md-inactive')) return;
		// const dimensionList = document.getElementById('dimensionList');
		app.dimensionList.toggleAttribute('hidden');
		e.target.toggleAttribute('open');
		document.getElementById('dimensionSearch').focus();
	};

	// open dialog salva gerarchia
	app.btnSaveHierarchy = (e) => {
		debugger;
		if (e.target.classList.contains('md-inactive')) return;
		// salvo la gerarchia che andrà inserita in dimension
		app.dialogHierarchyName.showModal();
		// abilito il tasto save dimension
		// TODO: da correggere perchè non è più una <i> ma un <button>
		app.btnSaveDimension.classList.remove('md-inactive');
	};

	// apro la dialog Salva Cubo
	app.btnSaveCube.onclick = (e) => {
		if (e.target.classList.contains('md-inactive')) return;
		app.dialogCubeName.showModal();
	};

	// definisci Cubo
	app.btnNewFact.onclick = (e) => {
		if (e.target.classList.contains('md-inactive')) return;
		document.getElementById('tableList').setAttribute('fact', true);
		e.target.toggleAttribute('open');
		document.getElementById('tableList').toggleAttribute('hidden');
		document.getElementById('tableSearch').focus();
	};

	app.saveCube = async (json) => {
        console.log(json);
        console.log(JSON.stringify(json));
        // await fetch('/fetch_api/json/'+JSON.stringify(json)+'/table/bi_cubes/save')
        await fetch('/fetch_api/json/'+JSON.stringify(json)+'/cube_store')
          .then((response) => {
            if (!response.ok) { throw Error(response.statusText); }
            return response;
          })
          .then((response) => response.json())
          .then((data) => {
            // console.log(data);
            if (data) {
              console.log('data : ', data);
              console.log('CUBO SALVATO CORRETTAMENTE');
              // app.getDatamart(reportId, jsonDataParsed); // recupero i dati dalla FX appena creata
            } else {
              // TODO: no data
              console.debug('ERRORE NEL SALVATAGGIO DEL CUBO SU BD');
            }
          })
          .catch((err) => console.error(err));
    };

	// Aggiornamento di un cubo
	app.btnSaveOpenedCube.onclick = () => {
		console.log('Aggiornamento Cubo');
		console.log(StorageCube.selected);
		cube.title = StorageCube.selected.name;

		cube.FACT = StorageCube.selected.FACT;
		// Creo il cubeId basandomi sui cubi già creati in Storage, il cubeId lo associo al cubo che sto per andare a salvare.
		cube.id = StorageCube.selected.id;
		debugger;

		const dimensionStorage = new DimensionStorage();
		
		cube.dimensionsSelected.forEach((dimensionName) => {
			let dimensionObject = {};
			console.log(dimensionName);
			dimensionStorage.selected = dimensionName;
			console.log(dimensionStorage.selected);
			// il metodo selected restituisce la dimensione che sto ciclando, la salvo in dimensionObject per modificarla (aggiunta cubi)
			dimensionObject[dimensionName] = dimensionStorage.selected;
			// salvo il cubo all'interno della dimensione, comprese la sua join con questa dimensione
			// dimensionObject[dimensionName].cubes.push({[cube._title] : cube.relations});
			// TODO: impostare cubes come un object e non come un array, in questo modo è più semplice recuperarlo da report/init.js "app.handlerDimensionSelected()"
			dimensionObject[dimensionName].cubes[cube._title] = cube.relations;
			console.log(dimensionObject[dimensionName]);
			// salvo il nome della dimensione/i associate al cubo. In questo modo, il cubo andrà a leggere la dimensione, tramite nome, se la dimensione viene modificata la modifica si riflette su tutti i cubi che hanno questa dimensione
			cube.associatedDimensions = dimensionName;
			// salvo la "nuova" dimensione, la dimensione avrà la proprietà cubes valorizzata
			dimensionStorage.save = dimensionObject[dimensionName];
		});

		cube.save();

		// salvo il cubo in localStorage
		StorageCube.save = cube.cube;
        debugger;
        // TODO: aggiornamento su database, da implementare
        // app.saveCube(cube.cube);

		app.dialogCubeName.close();
	};

	// tasto report nella sezione controls -> fabs
    document.getElementById('mdc-report').onclick = () => window.location.href = '/report';

    // associo l'evento click dello schema
	document.querySelectorAll('#nav-schema > a').forEach( (a) => {a.addEventListener('click', app.schemaSelected)});

	app.btnBack.onclick = () => {window.location.href = '/';};

	/* ricerca in lista tabelle */
	document.getElementById('tableSearch').oninput = App.searchInList;

	app.btnTableList.onclick = app.handlerOpenTableList;

	app.btnSaveDimension.onclick = (e) => {
		if (e.target.classList.contains('md-inactive')) return;
		// se drop-zone ha l'attr edit con il nome della dimensione in modifica, lo inserisco direttamente nella input dimensionName
		if (app.dropZone.hasAttribute('edit')) app.dialogDimensionName.querySelector('#dimensionName').value = app.dropZone.getAttribute('edit');
		app.dialogDimensionName.showModal();
	};

	app.btnHierarchySaveName.onclick = () => {
		const hierTitle = document.getElementById('hierarchyName').value;
		// ordine gerarchico (per stabilire quale tabella è da associare al cubo) questo dato viene preso dalla struttura di destra
		let hierarchyOrder = {};
		Array.from(document.querySelectorAll('section[data-hier-id][data-active] .hier.table')).forEach((table, i) => {
			// NOTE: utilizzo del backTick
			hierarchyOrder[i] = `${table.getAttribute('data-schema')}.${table.getAttribute('label')}`;
		});
		const comment = document.getElementById('textarea-hierarchies-comment').value;
		// debugger;
		let from = [];
		document.querySelectorAll('.cardTable').forEach((card) => {
			if (card.getAttribute('name')) {from.push(card.getAttribute('name'));}
		});
		// Hier.from = from;
		Hier.hier = {title : hierTitle, hierarchyOrder, comment, from};
		// la gerarchia creata la salvo nell'oggetto Dim, della classe Dimension, dove andrò a salvare, alla fine, tutta la dimensione
		Dim.hier = Hier.hier;
		// Dim.hier = Hier.hierarchies;
		Dim.lastTableHierarchy = Hier.lastTableHierarchy;
		console.log('Dim.#hier : ', Dim.hier);
		// dimension.hierarchyOrder = {title : hierTitle, hierarchyOrder, comment};
		app.dialogHierarchyName.close();
		// abilito il tasto btnHierarchyNew
		app.btnHierarchyNew.disabled = false;
		// abilito il tasto 'saveDimension'
		app.btnSaveDimension.disabled = false;
	};

	app.btnHierarchyNew.onclick = (e) => {
		// ripulisco la drop-zone per avere la possibilità di inserire altre gerarchie
		// recupero tutte le .card.table presenti nella drop-zone per eliminarle
		app.dropZone.querySelectorAll('.card.table').forEach( card => card.remove());
		// se la dropzone ha un solo elemento, cioè lo span, allora rimuovo la class dropped per ripristinare lo stato iniziale
		if (app.dropZone.childElementCount === 1) app.dropZone.classList.remove('dropped');
		// riduco il section[data-active] relativo alla struttura gerarchica attualmente attiva
		document.querySelector('section[data-active]').removeAttribute('data-active');
		// document.querySelectorAll('#hierTables > div').forEach( table => table.remove());
		Hier = new Hierarchy();
	};

	// salvataggio di un nuovo cubo
	app.btnSaveCubeName.onclick = () => {
		console.log('cube save');
		debugger;
		// TODO: devo verificare se il nome del cubo esiste già, sia in locale che sul db.
		cube.title = document.getElementById('cubeName').value;

		cube.comment = document.getElementById('textarea-cube-comment').value;

		cube.FACT = document.querySelector('.card.table[fact]').getAttribute('label');
		cube.schema = document.querySelector('.card.table[fact]').getAttribute('data-schema');
		debugger;
		// Creo il cubeId basandomi sui cubi già creati in Storage, il cubeId lo associo al cubo che sto per andare a salvare.
		cube.id = StorageCube.getIdAvailable();
		console.log(cube.id);

		const dimensionStorage = new DimensionStorage();
		
		cube.dimensionsSelected.forEach((dimensionName) => {
			let dimensionObject = {};
			console.log(dimensionName);
			dimensionStorage.selected = dimensionName;
			console.log(dimensionStorage.selected);
			// il metodo selected restituisce la dimensione che sto ciclando, la salvo in dimensionObject per modificarla (aggiunta cubi)
			dimensionObject[dimensionName] = dimensionStorage.selected;
			// salvo il cubo all'interno della dimensione, comprese la sua join con questa dimensione
			// dimensionObject[dimensionName].cubes.push({[cube._title] : cube.relations});
			dimensionObject[dimensionName].cubes[cube._title] = cube.relations;

			console.log(dimensionObject[dimensionName]);
			// salvo il nome della dimensione/i associate al cubo. In questo modo, il cubo andrà a leggere la dimensione, tramite nome, se la dimensione viene modificata la modifica si riflette su tutti i cubi che hanno questa dimensione
			cube.associatedDimensions = dimensionName;
			// salvo la "nuova" dimensione, la dimensione avrà la proprietà cubes valorizzata
			dimensionStorage.save = dimensionObject[dimensionName];
		});

		cube.save();

		// salvo il cubo in localStorage
		StorageCube.save = cube.cube;
		// salvo il cubo sul DB
        // app.saveCube(cube.cube);

		app.dialogCubeName.close();
	};

	/* Salvataggio della dimensione, dalla dialog */
	document.getElementById('btnDimensionSaveName').onclick = () => {
		/*
		  Salvo la dimensione, senza il legame con la FACT.
		  Salvo in localStorage la dimensione creata
		  // Visualizzo nell'elenco di sinistra la dimensione appena creata
		  // creo un contenitorre per le dimensioni salvate, con dentro le tabelle che ne fanno parte.
		*/
		Dim.title = document.getElementById('dimensionName').value;
		Dim.comment = document.getElementById('textarea-dimension-comment').value;
		// cube.dimension
		const storage = new DimensionStorage();
		
		Dim.save();
		storage.save = Dim.dimension;
		app.dialogDimensionName.close();
	
		// chiudo le card presenti
		app.closeCards();
		// visualizzo le dimensioni create
		// imposto, sulla icona openTableList, il colore della fact
		console.debug('REVISIONARE');
		app.btnTableList.setAttribute('fact', true);
		debugger;

		app.getDimensions(); // TODO: qui andrò ad aggiornare solo la dimensione appena salvata/modificata

		delete Dim.dimension;
	};

	// NOTE: esempio di utilizzo di MutationObserver
	const body = document.getElementById('body');
    // create a new instance of `MutationObserver` named `observer`,
	// passing it a callback function
	const observer = new MutationObserver(function() {
	    // console.log('callback that runs when observer is triggered');
	    document.querySelectorAll('li[data-fn]').forEach( (li) => {
	    	li.onclick = app[li.getAttribute('data-fn')];
	    });
	});
	// call `observe()` on that MutationObserver instance,
	// passing it the element to observe, and the options object
	observer.observe(body, {subtree: true, childList: true, attributes: true});
})();
