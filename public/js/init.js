var App = new Application();
var cube = new Cube();
var StorageCube = new CubeStorage();
var Dim = new Dimension();
var Hier = new Hierarchy();
(() => {
	var app = {
		absPopup : document.getElementById('abs-popup-dialog'),
		dialogCubeName : document.getElementById('cube-name'),
		dialogDimensionName : document.getElementById('dimension-name'),
		dialogHierarchyName : document.getElementById('hierarchy-name'),
		dialogVersioning : document.getElementById('versioning'),
		dialogColumnMap : document.getElementById('dialog-column-map'),
		dialogCompositeMetric : document.getElementById('dialog-composite-metric'),
		// templates
		tmplDimension : document.getElementById('tmpl-dimension-list'),
		tmplCube : document.getElementById('tmpl-cube-list'),
		tmplLists : document.getElementById('templateList'), // include tutte le liste da utilizzare,
		tmplTables : document.getElementById('tmpl-hierarchy-tables'),

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
		btnCompositeMetricSave : document.getElementById('btnCompositeMetricSave'), // tasto salva nella dialog-composite-metric
		btnCompositeMetricDone : document.getElementById('btnCompositeMetricDone'),

		// button dialog-columns-map
		btnEditSqlId : document.getElementById('edit-sql-formula-column-id'),
		btnEditSqlDs : document.getElementById('edit-sql-formula-column-ds'),
		btnColumnMap : document.getElementById('btnColumnsMap'),

		// inputs / textarea
		txtareaColumnId : document.getElementById('textarea-column-id-formula'),
		txtareaColumnDs : document.getElementById('textarea-column-ds-formula'),

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
		/*guideStep : [
			'Seleziona uno Schema sulla sinistra per iniziare',
			'Aggiungi le tabelle da mappare trascinandole da "Lista Tabelle"'
		],*/
		messageId : 0,
		// tooltip : document.getElementById('tooltip'),
		tooltip : null,
		tooltipTimeoutId : null,
		absWindow : document.querySelector('.abs-window')
	}

	App.init();

	// utilizzato per lo spostamento all'interno del drop-zone (card già droppata)
	app.dragStart = (e) => {
        // console.log('dragStart : ', e.target);
        // console.log('dragStart : ', e.target.localName);
		// mousedown da utilizzare per lo spostamento dell'elemento
		// debugger;
		if (e.target.localName === 'h6') {
			app.cardTitle = e.target;
			/* BUG: e.path deprecato
			'Event.path' is deprecated and will be removed in M109, around January 2023.
			Please use 'Event.composedPath()' instead. See https://www.chromestatus.com/feature/5726124632965120 for more details.
			*/
			app.card = e.path[5];
			// recupero la posizione attuale della card tramite l'attributo x-y impostato su .cardTable
			app.xOffset = e.path[5].getAttribute('x');
			app.yOffset = e.path[5].getAttribute('y');
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
	}

	// spostamento della card già droppata
    app.dragEnd = () => {
        // console.log('dragEnd');
		// console.log(e.target);
		// mouseup, elemento rilasciato dopo lo spostamento
		app.initialX = app.currentX;
		app.initialY = app.currentY;
		app.active = false;
	}

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
	}

	app.dropZone.onmousedown = app.dragStart;
	app.dropZone.onmouseup = app.dragEnd;
	app.dropZone.onmousemove = app.drag;

	// TODO: aggiungere anhce eventi touch...

	app.handlerDragStart = (e) => {
		console.log('e.target : ', e.target.id);
		e.dataTransfer.setData('text/plain', e.target.id);
		e.dataTransfer.effectAllowed = "copy";
	}

	app.handlerDragOver = (e) => {
		// console.log('handlerDragOver');
		e.preventDefault();
		// console.log('dragOver:', e.target);
		if (e.target.classList.contains('dropzone')) {
			e.dataTransfer.dropEffect = "copy";
		} else {
			e.dataTransfer.dropEffect = "none";
		}
	}

	app.handlerDragEnter = (e) => {
		// console.log('handlerDragEnter');
		e.preventDefault();
		// console.log(e.target);
		// if (e.target.id === "help-drop") e.target.remove();

		// if (e.target.className === 'dropzone') {
		if (e.target.classList.contains('dropzone')) {
			console.info('DROPZONE');
			// e.dataTransfer.dropEffect = "copy";
			// coloro il border differente per la dropzone
			// la class dropping nasconde (display: none) automaticamente lo span che contiene "Trascina qui gli element......"
			e.target.classList.add('dropping');
		} else {
			console.log('non in dropzone');
			// TODO: se non sono in una dropzone modifico l'icona del drag&drop (icona "non consentito")
			// e.dataTransfer.dropEffect = "none";
		}
	}

	app.handlerDragLeave = (e) => {
        // console.log('handlerDragLeave');
		e.preventDefault();
		// console.log('dragLeave');
	}

	app.handlerDragEnd = async (e) => {
        e.preventDefault();
		// faccio il DESCRIBE della tabella
		// controllo lo stato di dropEffect per verificare se il drop è stato completato correttamente, come descritto qui:https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API#drag_end
		// in app.getTable() vengono utilizzate le property della classe Cube (cube.card.schema, cube.card.tableName);
		if (e.dataTransfer.dropEffect === 'copy') {
			const data = await app.getTable();
			app.addFields(cube.card.ref.querySelector("ul[data-id='columns']"), data);
		}
	}

	app.handlerDrop = (e) => {
        // console.log('handlerDrop');
        // TODO: ottimizzare
		e.preventDefault();
		e.target.classList.replace('dropping', 'dropped');
		if (e.target.id !== 'drop-zone') return;
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
		card.querySelector('span[table]').remove();
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
		cardLayout.querySelector('h6').innerHTML = card.dataset.label;
		// imposto un alias per questa tabella
		const time = Date.now().toString();
		cardLayout.querySelector('.subtitle').innerHTML = `AS ${card.dataset.label}_${time.substring(time.length - 3)}`;
		content.querySelector('.cardTable').dataset.alias = `${card.dataset.label}_${time.substring(time.length - 3)}`;
		card.appendChild(cardLayout);
		// imposto il numero in .hierarchy-order, ordine gerarchico, in base alle tabelle già aggiunte alla dropzone
		const hierNumber = app.dropZone.querySelectorAll('.card.table').length + 1;
		card.querySelector('.hierarchy-order').innerText = hierNumber;
		card.querySelector('.cardTable').dataset.value = hierNumber;
		app.dropZone.appendChild(card);

		// tabella fact viene colorata in modo diverso, imposto attributo fact sia sulla .card.table che sulla .cardTable
		if (document.getElementById('tableList').hasAttribute('fact')) {
			card.setAttribute('fact', true);
			card.querySelector('.cardTable').setAttribute('fact', true); // OPTIMIZE: dataset data-fact
			// visualizzo l'icona metrics
			card.querySelector('section[options] > i[composite-metrics]').dataset.schema = e.target.querySelector('div').dataset.schema;
			card.querySelector('section[options] > i[composite-metrics]').dataset.label = e.target.querySelector('div').dataset.label;
			card.querySelector('section[options] > i[metrics]').hidden = false;
			card.querySelector('section[options] > i[composite-metrics]').hidden = false;
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
		card.querySelector('input').dataset.elementSearch = card.dataset.label;	
		cube.activeCard = {'ref': card.querySelector('.cardTable'), 'schema' : card.dataset.schema, 'tableName': card.dataset.label};
		// creazione della struttura gerarchica sulla destra
		app.hierStruct(card);

		// event sui tasti section[options]
		// TODO: da gestire con document.addEventListener
		card.querySelector('i[join]').onclick = app.handlerAddJoin;
		card.querySelector('i[metrics]').onclick = app.handlerAddMetric;
		card.querySelector('i[composite-metrics]').onclick = app.handlerAddCompositeMetric;
		card.querySelector('i[columns]').onclick = app.handlerAddColumns;
		card.querySelector('i[hier-order-plus]').onclick = app.handlerHierarchyOrder;
		card.querySelector('i[hier-order-minus]').onclick = app.handlerHierarchyOrder;
	}

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
			const divHier = sectionDataHier.querySelector('div[data-hier-id]');
			// const divHierLastTable = sectionDataHier.querySelector('div[data-hier-last-table]');
			// aggiungo la tabella al div all'interno di sectionDataHier
			const tmplTable = document.getElementById('tmpl-hier-table');
			const tmplContentTable = tmplTable.content.cloneNode(true);
			const divTable = tmplContentTable.querySelector('div');
			divTable.innerHTML = cube.card.tableName;
			divTable.dataset.schema = card.dataset.schema;
			divTable.dataset.alias = cube.card.ref.dataset.alias;
			divTable.setAttribute('label', cube.card.tableName); // OPTIMIZE: dataset data-label
			// divHierLastTable.appendChild(divTable);
			divHier.appendChild(divTable);
			btnSaveHierarchy.addEventListener('click', app.btnSaveHierarchy);
		} else {
			// debugger;
			const parent = document.querySelector('section[data-active] > div');
			const tmplTable = document.getElementById('tmpl-hier-table');
			const tmplContentTable = tmplTable.content.cloneNode(true);
			const divTable = tmplContentTable.querySelector('div');
			divTable.innerHTML = cube.card.tableName;
			divTable.dataset.schema = card.dataset.schema;
			divTable.dataset.alias = cube.card.ref.dataset.alias;
			divTable.setAttribute('label', cube.card.tableName); // OPTIMIZE: dataset data-label
			parent.appendChild(divTable);
		}
	}

	app.hierDragStart = (e) => {
		console.log('hier drag start');
		e.dataTransfer.setData('text/plain', e.target.id);
		// disattivo temporaneamente gli eventi drop e dragend su app.content
		app.content.removeEventListener('dragend', app.handlerDragEnd, true);
		app.content.removeEventListener('drop', app.handlerDrop, true);
	}

	app.hierDragOver = (e) => {
		console.log('dragover');
		e.preventDefault();
		// console.log(e.target);
	}

	app.hierDragEnter = (e) => {
		e.preventDefault();
		console.log(e.target);

		if (e.target.className === 'dropzoneHier') {
			console.info('DROPZONE');
			// TODO: css effect
		}
	}

	app.hierDragLeave = (e) => {e.preventDefault();}

	app.hierDragEnd = (e) => {
		e.preventDefault();
		// reimposto gli eventi drop e dragend su app.content
		app.content.addEventListener('dragend', app.handlerDragEnd, true);
		app.content.addEventListener('drop', app.handlerDrop, true);
	}

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
	}

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
		Hier.activeCard = app.dropZone.querySelector(".cardTable[name='" + e.currentTarget.dataset.tableName + "']");
		// colonna selezionata
		cube.fieldSelected = e.currentTarget.dataset.label;
		// TODO: utilizzare uno dei due qui, cube.fieldSelected oppure hier.field, da rivedere
		Hier.field = {field : e.currentTarget.dataset.label, type : e.currentTarget.dataset.key};
		Hier.fieldRef = e.currentTarget;
		// imposto l'alias per la tabella
		Hier.alias = cube.card.ref.dataset.alias;

		let attrs = cube.card.ref.getAttribute('mode'); // OPTIMIZE: dataset data-mode

		switch (attrs) {
			case 'relations':
				// se è presente un altro elemento con attributo hierarchy ma NON data-relation-id, "deseleziono" quello con hierarchy per mettere ...
				// ...[hierarchy] a quello appena selezionato. In questo modo posso selezionare solo una colonna per volta ad ogni relazione da creare
				// se però, viene cliccato una colonna con già una relazione impostata (quindi ha [data-relationn-id]) elimino la relazione da
				// ...entrambe le tabelle tramite un identificatifo di relazione
				if (e.currentTarget.hasAttribute('data-relation-id')) {
					// debugger;
					/* oltre a fare il toggle dell'attributo, se questa colonna era stata già messa in
					relazione con un altra tabella (quindi attributo [data-relation-id] presente) elimino anche la relazione tra i due campi.
					Bisogna eliminarla sia dal DOM, eliminando [data-relation-id] che dall'array this.hierarchy
					*/
					e.currentTarget.toggleAttribute('data-selected');
					// recupero tutti gli attributi di e.currentTarget e vado a ciclare this.removeHierarchy(relationId) per verificare uno alla volta quale posso eliminare
					// NOTE: utilizzo di getAttributeNames()
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
					let liRelationSelected = Hier.card.querySelector('.selectable[relations]:not([data-relation-id])');
					// console.log(liRelationSelected);
					e.currentTarget.toggleAttribute('relations');
					e.currentTarget.toggleAttribute('data-selected');
					// se ho selezionato una colonna diversa da quella già selezionata, rimuovo la selezione corrente e imposto quella nuova
					if (liRelationSelected && (liRelationSelected.dataset.id !== e.currentTarget.dataset.id)) {
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
					// TODO: utilizzare l'oggetto Map come fatto nella classe Query
					// TODO: delete cube.metrics[tableName][fieldName];
				} else {
					// TODO: nel salvataggio di una metrica di base dovrò aprire una dialog dove impostare l'alias.
					// ...quindi andrò a salvare in cube.metrics così come viene salvata la metrica composta di base, cioè quella legata al cubo
					cube.metrics = { name : cube.fieldSelected, metric_type : 0, alias : cube.fieldSelected };
				}
				break;
			default:
				// columns
				if (cube.card.ref.hasAttribute('mode')) {
					console.log('columns');
					// TODO: rivedere se utilizzare il metodo con l'oggetto Map(), come fatto in Query.metrics
					e.currentTarget.toggleAttribute('columns');
					// imposto la colonna selezionata nelle textarea ID - DS
					app.txtareaColumnId.innerText = cube.fieldSelected;
					app.txtareaColumnDs.innerText = cube.fieldSelected;
					app.dialogColumnMap.showModal();
				}
		}
	}

	// click sull'icona di destra "columns" per l'associazione delle colonne
	app.handlerAddColumns = (e) => {
		// console.log(e.target);
		// console.log('add columns');
		/* BUG: e.path deprecato
			'Event.path' is deprecated and will be removed in M109, around January 2023.
			Please use 'Event.composedPath()' instead. See https://www.chromestatus.com/feature/5726124632965120 for more details.
		*/
		const cardTable = e.path[3].querySelector('.cardTable');
		// console.log('cardTable : ', cardTable);
		cube.activeCard = {'ref': cardTable, 'schema' : cardTable.dataset.schema, 'tableName': cardTable.getAttribute('name')}; // OPTIMIZE: dataset data-name
		// quando aggiungo la tabella imposto da subito la colonna id in "columns"
		Hier.activeCard = cardTable; // card attiva
		cube.mode('columns');
	}

	app.handlerAddMetric = (e) => {
		// imposto il metrics mode
		/* BUG: e.path deprecato
			'Event.path' is deprecated and will be removed in M109, around January 2023.
			Please use 'Event.composedPath()' instead. See https://www.chromestatus.com/feature/5726124632965120 for more details.
		*/
		const cardTable = e.path[3].querySelector('.cardTable');
		cube.activeCard = {'ref': cardTable, 'tableName': cardTable.getAttribute('name')}; // OPTIMIZE: dataset data-name
		cube.mode('metrics', 'Seleziona le colonne da impostare come Metriche');
	}

	// aggiunta metrica composta
	app.handlerAddCompositeMetric = async (e) => {
		// recupero dal DB le colonne della tabella
		const cardTable = app.dropZone.querySelector(".cardTable[name='" + e.target.dataset.label + "']");
		cube.activeCard = {'ref': cardTable, schema : e.target.dataset.schema, 'tableName': e.target.dataset.label};
		// NOTE: utilizzo await per aspettare la risposta dal DB
		const data = await app.getTable();
		// popolo la lista #ul-fields	
		const ul = document.getElementById('ul-fields');
		data.forEach( field => {
			const content = app.tmplLists.content.cloneNode(true);
			const section = content.querySelector('section[data-sublist-gen]');
			const div = section.querySelector('div.selectable');
			const span = section.querySelector('span[data-item]');
			section.removeAttribute('hidden');
			div.dataset.label = field.COLUMN_NAME;
			span.innerText = field.COLUMN_NAME;
			div.onclick = app.handlerMetricSelectedComposite;
			ul.appendChild(section);
		});
		app.dialogCompositeMetric.showModal();
	}

	// salvataggio metrica composta di base
	app.btnCompositeMetricSave.onclick = (e) => {
		const name = document.getElementById('composite-metric-name').value;
		const alias = document.getElementById('composite-alias-metric').value;
		let arr_sql = [];
		let fields = [];
		// let metricsAlias = {}; // contiene un'elenco di object con nome_metrica : alias che compongono la metrica composta
		document.querySelectorAll('#composite-metric-formula *').forEach( element => {
			// console.log('element : ', element);
			// console.log('element : ', element.nodeName);
			// se l'elemento è un <mark> lo aggiungo all'array arr_sql, questo creerà la formula in formato SQL
			if (element.nodeName === 'MARK') {
				// StorageMetric.metric = element.innerText;
				// metrics[element.innerText] = StorageMetric.metric.formula.alias;
				// metricsAlias[element.innerText] = StorageMetric.metric.formula.alias;
				// TODO: verificare se è presente il distinct : true in ogni metrica
				arr_sql.push(element.innerText);
				fields.push(element.innerText);
			} else {
				arr_sql.push(element.innerText.trim());	
			}
		});
		console.log('arr_sql : ', arr_sql);
		cube.metrics = { name, metric_type : 1, formula: arr_sql, alias, fields };
	}

	app.createHierarchy = (e) => {
		console.log('create Relations');
		// OPTIMIZE: ottimizzare la logica della funzione
		let hier = [];
		let colSelected = [];
		// console.log( document.querySelectorAll('.cardTable[mode="relations"] .selectable[relations][data-selected]').length);
		// quando i campi selezionati sono 1 recupero il nome della tabella perchè questa gerarchia avrà il nome della prima tabella selezionata da mettere in relazione
		if (document.querySelectorAll('.cardTable[mode="relations"] .selectable[relations][data-selected]').length === 1) {
			Hier.table = document.querySelector('.cardTable[mode="relations"] .selectable[relations][data-selected]').dataset.tableName;
		}
		// console.log('dimension.table : ', Hier.table);
		document.querySelectorAll('.cardTable[mode="relations"]').forEach( card => {
			let spanRef = card.querySelector('.selectable[relations][data-selected]');
			if (spanRef) {
				// metto in un array gli elementi selezionati per la creazione della gerarchia
				colSelected.push(spanRef);
				hier.push(card.dataset.alias+'.'+spanRef.dataset.label); // questa istruzione crea "Azienda_xxx.id" (alias.field)
			}
			// per creare correttamente la relazione è necessario avere due elementi selezionati
			if (hier.length === 2) {
				// se, in questa relazione, è presente anche la tabella FACT rinomino hier_n in fact_n in modo da poter separare le gerarchie
				// e capire quali sono quelle con la fact e quali no (posso salvare la Dimensione, senza il legame con il Cubo)
				if (card.hasAttribute('fact')) {
					console.log('FACT TABLE Relation');
					cube.relations['cubeJoin_'+cube.relationId] = hier;
					cube.relationId++;
					// console.log(cube.relations);
					cube.saveRelation(colSelected);
				} else {
					debugger;
					Hier.join = hier;
					// visualizzo le icone di "join" nelle due colonne
					Hier.showRelationIcons(colSelected);
					// esiste una relazione, visualizzo il div hierarchiesContainer
					app.hierarchyContainer.removeAttribute('hidden');
				}
			}
		});
	}

	app.removeHierarchy = (relationId, value) => {
		// OPTIMIZE: 2022-05-19 la funzione non è testata
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
	}

	app.handlerCloseCard = (e) => {
		// elimino la card e la rivisualizzo nel drawer (spostata durante il drag&drop)
		console.log(e.target);
		console.log(e.path);
		// TODO: rimettere la card chiusa al suo posto originario, nel drawer
		/* BUG: e.path deprecato
			'Event.path' is deprecated and will be removed in M109, around January 2023.
			Please use 'Event.composedPath()' instead. See https://www.chromestatus.com/feature/5726124632965120 for more details.
		*/
		e.path[5].remove();
		// TODO: eliminare anche dal flusso delle gerarchie sulla destra

		// TODO: controllo struttura gerarchica
	}

	// recupero la lista delle dimensioni
	app.getDimensions = () => {
		// TODO: utilizzare lo storage inizializzato all'inizio del file
		const storage = new DimensionStorage();
		// dimensions : è un Object che contiene un array con le tabelle incluse nella dimensione
		for (const [token, value] of storage.dimensions) {
			// key : nome
			// console.log('value : ', value);
			let tmplContent = app.tmplDimension.content.cloneNode(true);
			const section = tmplContent.querySelector('section');
			section.setAttribute('data-element-search', 'dimensions');
			section.setAttribute('data-label', token);
			const div = tmplContent.querySelector('.dimensions');
			const btnDimensionUse = tmplContent.querySelector('button[data-id="dimension-use"]');
			btnDimensionUse.dataset.token = token;

			div.querySelector('h5').innerHTML = value.name;
			// per ogni gerarchia recupero la prop 'from'
			for (const [hierName, hierValue] of Object.entries(value.hierarchies)) {
				// console.log(hierName);
				// console.log(hierValue);
				const tmplHierarchyList = document.getElementById('tmpl-hierarchy-list');
				const tmplHierarchyContent = tmplHierarchyList.content.cloneNode(true);
				const divHier = tmplHierarchyContent.querySelector('.hierarchies');
				const h6 = tmplHierarchyContent.querySelector('h6');
				const divTables = tmplHierarchyContent.querySelector('.tables');
				const btnEdit = tmplHierarchyContent.querySelector("button[data-id='dimension-edit']");
				btnEdit.dataset.dimensionName = value.name;
				btnEdit.dataset.hierarchyName = hierName;
				h6.innerText = hierName;
				tmplContent.querySelector('div[data-dimension-tables]').appendChild(divHier);
				for (const [orderKey, orderValue] of Object.entries(hierValue.order)) {
					const tableContent = app.tmplTables.content.cloneNode(true);
					const div = tableContent.querySelector('div');
					const spanSchema = tableContent.querySelector('span[schema]');
					const spanTable = tableContent.querySelector('span[table]');
					spanSchema.innerText = orderValue.schema;
					spanTable.innerText = orderValue.table;
					divTables.appendChild(div);
				}
				btnEdit.onclick = app.handlerDimensionEdit;
			}
			btnDimensionUse.onclick = app.handlerDimensionSelected;
			div.querySelector('h5').setAttribute('label', value.name); // OPTIMIZE: dataset data-label
			document.querySelector('#dimensions').appendChild(section);
		}
	}

	// recupero la lista dei Cubi in localStorage
	app.getCubes = () => {
		const ul = document.getElementById('cubes');
		for (const [token, value] of StorageCube.cubes) {
			const content = app.tmplLists.content.cloneNode(true);
			const section = content.querySelector('section[data-sublist-generic]');
			const span = section.querySelector('span[generic]');
			section.dataset.label = token;
			section.dataset.elementSearch = 'cubes';
			span.dataset.cubeToken = token;
			span.innerText = value.name;
			span.dataset.fn = 'handlerCubeSelected';
			ul.appendChild(section);
		}
		// associo la Fn che gestisce il click sulle <li>
		// ul.querySelectorAll('li').forEach( (li) => li.addEventListener('click', app.handlerCubeSelected) );
	}

	/*var canvas = document.getElementById('canvas');
	if (canvas.getContext) {
		var ctx = canvas.getContext('2d');
		// Stroked triangle
		ctx.beginPath();
		ctx.moveTo(10, 10);
		ctx.lineTo(10, 145);
		ctx.moveTo(20, 30);
		ctx.lineTo(130, 30);
		ctx.closePath();
		ctx.stroke();
	}*/

	// selezione di un cubo già definito, da qui è possibile associare, ad esempio, una nuova dimensione ad un cubo già esistente.
	app.handlerCubeSelected = (e) => {
		// apro la tabella definita come Cubo
		console.log('e.currentTarget : ', e.currentTarget);
		// debugger;
		StorageCube.selected = e.currentTarget.dataset.cubeToken;
		console.log('cube selected : ', StorageCube.selected);
		// ridefinisco le proprietà del cubo, leggendo da quello selezionato, nello storage, per consentirne la modifica o l'aggiunto di dimensioni al cubo
		// TODO: la prop privata _metric la devo definire tramite un Metodo
		cube.metricDefined = StorageCube.selected.metrics;
		cube.columnsDefined = StorageCube.selected.columns;
		debugger;
		StorageCube.selected.associatedDimensions.forEach( dim => {
			cube.associatedDimensions = dim;
		});
		const factTable = {
			schema : StorageCube.selected.schema,
			table : StorageCube.selected.FACT,
			alias : StorageCube.selected.alias
		};
		// debugger;
		app.addCard(factTable, true);
		// app.addCard(`${StorageCube.selected.schema}.${StorageCube.selected.FACT}`, true);
		// visualizzo il tasto saveOpenedCube al posto di SaveCube
		app.btnSaveOpenedCube.hidden = false;
		// nascondo btnSaveCube
		app.btnSaveCube.hidden = true;
	}

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
		        		const content = app.tmplLists.content.cloneNode(true);
						const section = content.querySelector('section[data-sublist-draggable]');
						const element = content.querySelector('div[draggable]');
						const span = section.querySelector('span[table]');

						section.dataset.label = value.TABLE_NAME;
						section.dataset.elementSearch = 'tables';
						element.ondragstart = app.handlerDragStart;
						element.id = 'table-' + key;
						element.dataset.schema = schema;
						element.dataset.label = value.TABLE_NAME;
						span.innerText = value.TABLE_NAME;
						span.dataset.label =  value.TABLE_NAME;
						ul.appendChild(section);
		        	}
		        } else {
		          // TODO: no data
		          console.warning('Non è stato possibile recuperare la lista delle tabelle');
		        }
		    })
	    .catch( (err) => console.error(err));
	}

	app.handlerAddJoin = (e) => {
		// debugger;
		/* BUG: e.path deprecato
			'Event.path' is deprecated and will be removed in M109, around January 2023.
			Please use 'Event.composedPath()' instead. See https://www.chromestatus.com/feature/5726124632965120 for more details.
		*/
		const cardTable = e.path[3].querySelector('.cardTable');
		cube.activeCard = {'ref': cardTable, 'schema' : cardTable.dataset.schema, 'tableName': cardTable.getAttribute('name')}; // OPTIMIZE: dataset data-name
		cube.mode('relations');
	}

	// recupero i field della tabella
	app.getTable = async () => {
		// elemento dove inserire le colonne della tabella
		// const ul = cube.card.ref.querySelector("ul[data-id='columns']");
		console.log(cube.card.schema, cube.card.tableName);
	    return await fetch('/fetch_api/'+cube.activeCard.schema+'/schema/'+cube.activeCard.tableName+'/table_info')
			.then( (response) => {
				if (!response.ok) {throw Error(response.statusText);}
				return response;
			})
			.then( (response) => response.json())
			.then( response => response)
	    .catch( (err) => console.error(err));
	}

	// WARNING: al momento non utilizzata, il salvataggio di una dimensione viene effettuato nel Versioning
    app.saveDIM = async (json) => {
        const params = JSON.stringify(json);
		const url = "/fetch_api/json/dimension_store";
		const init = {headers: {'Content-Type': 'application/json'}, method: 'POST', body: params};
		const req = new Request(url, init);
        await fetch(req)
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
              console.debug('dimensione non è stata salvata');
            }
          })
          .catch((err) => console.error(err));
    }

	// viene invocata da btnDimensionSaveName.onclick, quando viene salvata una dimensione, vengono chiuse tutte le card aperte attualmente
	app.closeCards = () => {
		document.querySelectorAll('.card.table').forEach((item) => {
			// console.log(item);
			item.remove();
		});
	}

	app.handlerOpenTableList = (e) => {
		// console.log(e.target);
		if (e.target.classList.contains('md-inactive')) return;
		document.getElementById('tableList').removeAttribute('fact');
		e.target.toggleAttribute('open');
		document.getElementById('tableList').toggleAttribute('hidden');
		document.getElementById('tableSearch').focus();
	}

	app.addFields = (ul, response) => {
		ul.hidden = false;
		for ( const [key, value] of Object.entries(response)) {
    		const content = app.tmplLists.content.cloneNode(true);
    		const section = content.querySelector('section[data-sublist-fields]'); // questa lista include le 3 icone per columns, hierarchy, metric
    		const div = section.querySelector('div.selectable');
    		const span = div.querySelector('span[data-item]');
    		section.dataset.label = value.COLUMN_NAME;
    		section.dataset.elementSearch = cube.activeCard.tableName;
    		div.dataset.tableName = cube.activeCard.tableName;
    		div.dataset.label = value.COLUMN_NAME;
    		div.dataset.key = value.CONSTRAINT_NAME;
			span.innerText = value.COLUMN_NAME;
			// scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
			let pos = value.DATA_TYPE.indexOf('(');
			let type = (pos !== -1) ? value.DATA_TYPE.substring(0, pos) : value.DATA_TYPE;
			span.dataset.type = type;
			// span.dataset.key = value.CONSTRAINT_NAME; // pk : chiave primaria
    		div.dataset.id = key;
			// span.id = key;
			// fn da associare all'evento in 'mutation observe'
			div.dataset.fn = 'handlerColumns';
			ul.appendChild(section);
    	}
	}

	app.addCard = async (lastTableObject, fact) => {
		// creo la card (label)
		// fact : true/false
		debugger;
		let card = document.createElement('div');
		card.className = 'card table';
		// split della stringa <schema>.<tabella>
		card.dataset.schema = lastTableObject.schema; // schema
		card.setAttribute('label', lastTableObject.table); // tabella // OPTIMIZE: dataset data-label
		if (fact) card.setAttribute('fact', true); // OPTIMIZE: dataset data-fact
		card.onmousedown = app.dragStart;
		card.onmouseup = app.dragEnd;
		card.onmousemove = app.drag;
		// prendo il template cardLayout e lo inserisco nella .card.table
		let tmpl = document.getElementById('cardLayout');
		let content = tmpl.content.cloneNode(true);
		let cardLayout = content.querySelector('.cardLayout');
		// TODO: da ricontrollare, perchè imposto l'attr 'fact' senza controllare l'argomento fact?
		cardLayout.querySelector('.cardTable').setAttribute('fact', true); // OPTIMIZE: dataset data-fact
		// imposto il titolo in h6
		// TODO: imposto l'alias della tabella
		cardLayout.querySelector('.subtitle').innerHTML = `AS ${lastTableObject.alias}`;
		cardLayout.querySelector('.cardTable').dataset.alias = lastTableObject.alias;
		cardLayout.querySelector('h6').innerHTML = lastTableObject.table;
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
		cube.activeCard = {'ref': card.querySelector('.cardTable'), 'schema' : card.dataset.schema, 'tableName': card.getAttribute('label')}; // OPTIMIZE: dataset data-label

		// event sui tasti section[options]
		card.querySelector('i[join]').onclick = app.handlerAddJoin;

		// console.log(cube.activeCard.schema, cube.activeCard.tableName);
		// ottengo l'elenco dei field della tabella
		const data = await app.getTable();
		// popolo la ul[data-id="columns"] della card corrente recuperata dalla Classe Cube cube.card.ref
		// debugger;
		app.addFields(cube.card.ref.querySelector("ul[data-id='columns']"), data);
	}

	// button "utilizza" nell'elenco delle dimensioni
	app.handlerDimensionSelected = (e) => {
		console.log(e.target);
		const storage = new DimensionStorage();
		storage.selected = e.target.dataset.token;
		// memorizzo la dimensione selezionata per recuperarla nel salvataggio del cubo
		cube.dimensionsSelected = e.target.dataset.token;
		// recupero tutta la dimensione selezionata, dallo storage
		console.log(storage.selected);
		// aggiungo alla dropzone l'ultima tabella della gerarchia
		// debugger;
		app.addCard(storage.selected.lastTableInHierarchy, false);
		// chiudo la lista delle dimensioni
		app.dimensionList.toggleAttribute('hidden');
		app.btnDimensionList.toggleAttribute('open');
	}

	app.addCards = async (dim, hierName) => {
		// OPTIMIZE: logica della funzione
		// dimStorage.selected.hierarchies[hierName].order
		const tables = dim.hierarchies[hierName].order;
		const columns = dim.hierarchies[hierName].columns;
		const joins = dim.hierarchies[hierName].joins;
		console.log('tables to add: ', tables);
		for (const [key, value] of Object.entries(tables)) {
			let x = 40, y = 40;
			// console.log('key : ', key); // la key la posso utilizzare anche per lo z-index
			// console.log('value : ', value);
			const card = document.createElement('div');
			card.className = 'card table';
			// NOTE: Impostazione di una variabile css (--zindex)
			card.style.setProperty('--zindex', key);
			// const schema = value.schema;
			// const table = value.table;
			card.dataset.schema = value.schema;
			card.setAttribute('label', value.table); // OPTIMIZE: dataset data-label
			x *= +key; y *= +key;
			card.style.transform = "translate3d("+x+"px, "+y+"px, 0px)";
			card.setAttribute('x', x);
			card.setAttribute('y', y);
			// recupero il template cardLayout e lo inserisco nella .card.table
			const tmplCardLayout = document.getElementById('cardLayout');
			const tmplContent = tmplCardLayout.content.cloneNode(true);
			const cardLayout = tmplContent.querySelector('.cardLayout');
			// h6 titolo
			cardLayout.querySelector('h6').innerHTML = value.table;
			card.appendChild(cardLayout);
			// sostituisco dropping con dropped per nascondere lo span con la stringa "Trascina qui..."
			app.dropZone.classList.replace('dropping', 'dropped');
			app.dropZone.appendChild(card);
	        app.dropZone.classList.add('dropped');
	        card.querySelector('.cardTable').dataset.alias = value.alias;
	        cube.activeCard = {ref: card.querySelector('.cardTable'), schema : value.schema, tableName : value.table};
	        // debugger;
	        // event sui tasti section[options]
	        card.querySelector('i[join]').onclick = app.handlerAddJoin;
	        card.querySelector('i[columns]').onclick = app.handlerAddColumns;
	        // input di ricerca, imposto l'attr data-element-search
	        card.querySelector('input[type="search"]').dataset.elementSearch = value.table;
	        // await : aspetto che getTable popoli tutta la card con i relativi campi
	        // NOTE: utilizzo di await
	        const data = await app.getTable();
	        app.addFields(cube.card.ref.querySelector("ul[data-id='columns']"), data);
	        // imposto la card attiva
	        Hier.activeCard = card.querySelector('.cardTable');
	        // seleziono i campi impostati nella dimensione, nelle proprietà 'hierarchies[hiername]columns[value]'
	        // per ogni colonna in questa tabella...
	        // ...reimposto le selezioni di origine della gerarchia selezionata
	        if (columns.hasOwnProperty(value.alias)) {
	        	for (const [token, field] of Object.entries(dim.hierarchies[hierName].columns[value.alias])) {
		        	console.log(token, field.id.origin_field);
		        	Hier.activeCard.querySelector(".selectable[data-label='"+field.id.origin_field+"']").toggleAttribute('columns');
		        	Hier.field = field;
					// nel metodo columns c'è la logica per controllare se devo rimuovere/aggiungere la colonna selezionata
					Hier.columns(token);
		        }
	        }
	        // TODO: fare la stessa cosa qui con le join per ogni tabella in ciclo (il codice sotto va spostato qui)
		}
		// dopo aver caricato tutte le tabelle appartenenti alla dimensione, imposto le gerarchie definite recuperandole dalla proprietà 'join'
		// TODO: a questo punto posso recuperare dim.join per inserire nelle tabelle le relative join
		for ( const [tableAlias, tokenJoin] of Object.entries(joins) ) {
			// Hier.table = table;
			// per ogni tabella
			for (const [token, joins] of Object.entries(tokenJoin) ) {
				// joinId : 0,1,2,ecc... ogni relazione
				// console.log('joinId : ', joinId);
				// console.log('joins : ', joins); // array delle relazioni
				// debugger;
				joins.forEach( (table_field) => {
					const tableName = table_field.split('.')[0];
					const fieldName = table_field.split('.')[1];
					const fieldSelected = app.dropZone.querySelector(".cardTable[data-alias='" + tableName + "'] .selectable[data-label='" + fieldName + "']");
					// se questo campo ha già una relazione impostata (ad esempio con un altra tabella), non faccio il toggle dell'attr 'relations' altrimenti viene eliminata la relazione
					if (!fieldSelected.hasAttribute('relations')) fieldSelected.toggleAttribute('relations');
					// TODO: probabilmente qui dovrò usare il token, anche in fase di creazione/mappatura delle join
					// fieldSelected.setAttribute('data-rel-'+joinId, joinId);
					fieldSelected.dataset.relationId = true;
				});
				Hier.join = joins;
			}
		}
			
	}

	// selezione di una dimensione per consentirne le modifica
	app.handlerDimensionEdit = (e) => {
		// Recupero tutto il json della dimensione selezionata
		const storage = new DimensionStorage();
		storage.selected = e.target.dataset.dimensionName;
		const hierName = e.target.dataset.hierarchyName;
		// TODO: Implementare addCards in modo da svolgere anche le istruzioni di addCard
		app.addCards(storage.selected, hierName);
		// imposto lo span all'interno del dropzone con la descrizione della dimensione auutalmente in modifica
		app.dropZone.querySelector('span').innerHTML = "Dimensione in modifica : " + e.target.dataset.dimensionName;
		app.dropZone.setAttribute('edit', e.target.dataset.dimensionName); // OPTIMIZE: dataset data-edit
		// chiudo la lista delle dimensioni
		app.dimensionList.toggleAttribute('hidden');
		app.btnDimensionList.toggleAttribute('open');
	}

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
        e.target.setAttribute('selected', true); // OPTIMIZE: dataset data-selected
        app.getDatabaseTable(e.target.dataset.schema);
        // app.handlerGuide();
    }

    // ordine gerarchico, livello superiore
    app.handlerHierarchyOrder = (e) => {
    	// console.log(e.target);
    	// imposto la attuale card come card attiva
    	/* BUG: e.path deprecato
			'Event.path' is deprecated and will be removed in M109, around January 2023.
			Please use 'Event.composedPath()' instead. See https://www.chromestatus.com/feature/5726124632965120 for more details.
		*/
    	const card = e.path[5]; // .card .table
    	const cardTable = e.path[3]; // .cardTable, qui è presente il data-value
    	const cardCount = document.querySelectorAll('.card.table').length;
		cube.activeCard = {'ref': cardTable, 'schema' : cardTable.dataset.schema, 'tableName': cardTable.getAttribute('name')}; // OPTIMIZE: dataset data-name
    	// console.log(cube.activeCard.ref); // card attiva
    	// console.log(+cardTable.getAttribute('data-value'));
    	let value = +cardTable.dataset.value;
		// spostare, nel DOM, le card in base al livello gerarchico. Livello gerarchico inferiore le card vanno messe prima nel DOM.
    	// questo consentirà di creare correttamente le gerarchie con il nome della tabella di gerarchia inferiore salvata nella prop 'hierarchies'
    	if (e.target.hasAttribute('hier-order-plus')) {
    		value++;
    		// non posso spostare card se supero il numero delle card presenti nella pagina
    		if (value > cardCount) return;
    		// TODO: sostituisco il valore della card successiva con quello della card che sto modificando
    		card.nextElementSibling.querySelector('.cardTable').dataset.value = cardTable.dataset.value;
    		card.nextElementSibling.querySelector('.hierarchy-order').innerText = cardTable.dataset.value;
    		// identifico la card successiva a quella che sto modificando e la posiziono DOPO
    		if (card.nextElementSibling) card.nextElementSibling.after(card);
    	} else {
    		if (value === 1) return;
			value--;
			// console.log(card.previousElementSibling);
			card.previousElementSibling.querySelector('.cardTable').dataset.value = cardTable.dataset.value;
    		card.previousElementSibling.querySelector('.hierarchy-order').innerText = cardTable.dataset.value;
			card.previousElementSibling.before(card);
    	}
    	cardTable.querySelector('.hierarchy-order').innerText = value;
    	cardTable.dataset.value = value;
    }

	app.getDimensions();

    app.getCubes();

    // ***********************events*********************
    // lista cubi già definiti
    app.btnDefinedCube.onclick = (e) => {
		if (e.target.classList.contains('md-inactive')) return;
		// visualizzo la lista dei cubi esistenti
		const cubeList = document.getElementById('cubesList');
		cubeList.toggleAttribute('hidden');
		e.target.toggleAttribute('open');
		document.getElementById('cubeSearch').focus();
	}

	// lista dimensioni già definite
	app.btnDimensionList.onclick = (e) => {
		if (e.target.classList.contains('md-inactive')) return;
		// const dimensionList = document.getElementById('dimensionList');
		app.dimensionList.toggleAttribute('hidden');
		e.target.toggleAttribute('open');
		document.getElementById('dimensionSearch').focus();
	}

	// open dialog salva gerarchia
	app.btnSaveHierarchy = (e) => {
		if (e.target.classList.contains('md-inactive')) return;
		// salvo la gerarchia che andrà inserita in dimension
		app.dialogHierarchyName.showModal();
		// abilito il tasto save dimension
		// TODO: da correggere perchè non è più una <i> ma un <button>
		app.btnSaveDimension.classList.remove('md-inactive');
	}

	// apro la dialog Salva Cubo
	app.btnSaveCube.onclick = (e) => {
		if (e.target.classList.contains('md-inactive')) return;
		app.dialogCubeName.showModal();
	}

	// definisci Cubo
	app.btnNewFact.onclick = (e) => {
		if (e.target.classList.contains('md-inactive')) return;
		document.getElementById('tableList').setAttribute('fact', true); // OPTIMIZE: dataset data-fact
		e.target.toggleAttribute('open');
		document.getElementById('tableList').toggleAttribute('hidden');
		document.getElementById('tableSearch').focus();
	}

	// salvataggio del cubo
	// WARNING: al momento non viene utilizzata perchè il salvataggio del cubo viene effettuato dal Versioning
	app.saveCube = async (json) => {
        const params = JSON.stringify(json);
		const url = "/fetch_api/json/cube_store";
		const init = {headers: {'Content-Type': 'application/json'}, method: 'POST', body: params};
		const req = new Request(url, init);
        await fetch(req)
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
    }

	// update cube
	app.btnSaveOpenedCube.onclick = () => {
		console.log('Aggiornamento Cubo');
		console.log(StorageCube.selected);
		cube.title = StorageCube.selected.name;
		cube.alias = StorageCube.selected.alias;
		cube.FACT = StorageCube.selected.FACT;
		// Creo il cubeId basandomi sui cubi già creati in Storage, il cubeId lo associo al cubo che sto per andare a salvare.
		cube.id = StorageCube.selected.id;
		cube.token = StorageCube.selected.token;
		debugger;

		cube.dimensionsSelected.forEach( dimensionToken => {
			const storage = new DimensionStorage();
			let dimensionObject = {};
			console.log(dimensionToken);
			storage.selected = dimensionToken;
			console.log(storage.selected);
			// il metodo selected restituisce la dimensione che sto ciclando, la salvo in dimensionObject per modificarla (aggiunta cubi)
			dimensionObject[dimensionToken] = storage.selected;
			// salvo il cubo all'interno della dimensione, comprese la sua join con questa dimensione
			// dimensionObject[dimensionName].cubes.push({[cube._title] : cube.relations});
			// TODO: impostare cubes come un object e non come un array, in questo modo è più semplice recuperarlo da report/init.js "app.handlerDimensionSelected()"
			dimensionObject[dimensionToken].cubes[cube.token] = cube.relations;
			console.log(dimensionObject[dimensionToken]);
			// salvo il nome della dimensione/i associate al cubo. In questo modo, il cubo andrà a leggere la dimensione, tramite nome, se la dimensione viene modificata la modifica si riflette su tutti i cubi che hanno questa dimensione
			cube.associatedDimensions = dimensionToken;
			// salvo la "nuova" dimensione, la dimensione avrà la proprietà cubes valorizzata
			storage.saveTemp(dimensionObject[dimensionToken]);
		});
		// TODO: l'aggiornamento del cubo non deve aggiornare anche la prop created_at ma solo updated_at
		cube.save();
		// salvo il cubo in localStorage
		StorageCube.saveTemp(cube.cube);
        debugger;
        // TODO: aggiornamento su database, da implementare
        // app.saveCube(cube.cube);

		app.dialogCubeName.close();
	}

	app.btnEditSqlId.onclick = (e) => {
		app.txtareaColumnId.removeAttribute('readonly');
		app.txtareaColumnId.setAttribute('readwrite', true);
		app.txtareaColumnId.focus();
		app.txtareaColumnId.select();
	}

	app.btnEditSqlDs.onclick = (e) => {
		app.txtareaColumnDs.removeAttribute('readonly');
		app.txtareaColumnDs.setAttribute('readwrite', true);
		app.txtareaColumnDs.focus();
		app.txtareaColumnDs.select();
	}

	/*app.txtareaColumnId.oninput = (e) => {
		// visualizzo il div absolute-popup
		app.absPopup.hidden = false;
		// left position della textarea
		const left = e.target.offsetLeft + 'px';
		const caretXPos = app.txtareaColumnId.textLength+'ch';
		const x = `calc(${left} + ${caretXPos})`;
		const top = e.target.offsetTop + 'px';
		const caretYPos = '4em';
		const y = `calc(${top} + ${caretYPos})`;
		// app.absPopup.style.setProperty('--left', left + 'px');
		app.absPopup.style.setProperty('--left', x);
		app.absPopup.style.setProperty('--top', y);
		// console.log(app.txtareaColumnId.textLength);
		// app.txtareaColumnId.selectionStart = app.txtareaColumnId.textLength;
		// console.log(app.txtareaColumnId.selectionStart);
	}*/

	app.btnColumnMap.onclick = () => {
		Hier.field = {
			id : {field : app.txtareaColumnId.value, type : 'da_completare', SQL : null, origin_field : Hier.field.field},
			ds : {field : app.txtareaColumnDs.value, type : 'da_completare', SQL : null, origin_field : Hier.field.field}
		};
		// nel metodo columns c'è la logica per controllare se devo rimuovere/aggiungere la colonna selezionata
		const rand = () => Math.random(0).toString(36).substr(2);
		const token = rand().substr(0, 7);
		Hier.columns(token);
		// imposto il token sulla colonna selezionata, mi servirà in fase di deselezione della colonna
		Hier.fieldRef.dataset.tokenColumn = token;
		app.dialogColumnMap.close();
		const btnSaveHierarchy = document.querySelector("#box-hierarchy section[data-id='hierarchies'][data-active] button[data-id='hierarchySave']");
		btnSaveHierarchy.disabled = (Object.keys(Hier.columns_).length !== 0) ? false : true;
	}

	// tasto report nella sezione controls -> fabs
    document.getElementById('mdc-report').onclick = () => window.location.href = '/report';

    // associo l'evento click dello schema
	document.querySelectorAll('#nav-schema > a').forEach( (a) => {a.addEventListener('click', app.schemaSelected)});

	app.btnBack.onclick = () => {window.location.href = '/';}

	/* ricerca in lista tabelle */
	document.getElementById('tableSearch').oninput = App.searchInList;

	app.btnTableList.onclick = app.handlerOpenTableList;

	// dialog apertura 'salva dimensione'
	app.btnSaveDimension.onclick = (e) => {
		if (e.target.classList.contains('md-inactive')) return;
		// se drop-zone ha l'attr edit con il nome della dimensione in modifica, lo inserisco direttamente nella input dimensionName
		if (app.dropZone.hasAttribute('edit')) app.dialogDimensionName.querySelector('#dimensionName').value = app.dropZone.getAttribute('edit'); // OPTIMIZE: dataset data-edit
		app.dialogDimensionName.showModal();
	}

	// salvataggio di una gerarchia
	app.btnHierarchySaveName.onclick = () => {
		const hierTitle = document.getElementById('hierarchyName').value;
		// ordine gerarchico (per stabilire quale tabella è da associare al cubo) questo dato viene preso dal valore presente in .hierarchy-order
		let hierarchyOrder = {}, hierarchyOrderTables = {};
		// contare quante tabelle sono presenti nella gerarchia corrente
		// eseguire un ciclo che inizia da 1 (per la prima tabella della gerarchia)
		// recuperare le tabelle in ordine per aggiungerle all'object hierarchyOrder
		const tableCount = document.querySelectorAll('.cardTable').length;
		let from = [];
		let lastTables = {};
		for (let i = 1, index = 0; i <= tableCount; i++, index++) {
			const table = document.querySelector(".cardTable[data-value='"+i+"']");
			hierarchyOrder[index] = {schema : table.dataset.schema, table : table.getAttribute('name'), alias : table.dataset.alias}; // OPTIMIZE: dataset data-name
			from.push(`${table.dataset.schema}.${table.getAttribute('name')} AS ${table.dataset.alias}`); // OPTIMIZE: dataset data-name
			lastTables = {
				alias : table.dataset.alias,
				schema : table.dataset.schema,
				table : table.getAttribute('name') // OPTIMIZE: dataset data-name
			};
		}
		const comment = document.getElementById('textarea-hierarchies-comment').value;
		
		Hier.hier = {title : hierTitle, hierarchyOrder, comment, from};
		// la gerarchia creata la salvo nell'oggetto Dim, della classe Dimension, dove andrò a salvare, alla fine, tutta la dimensione
		Dim.hier = Hier.hier;
		Dim.lastTableHierarchy = lastTables;
		// dimension.hierarchyOrder = {title : hierTitle, hierarchyOrder, comment};
		app.dialogHierarchyName.close();
		// abilito il tasto btnHierarchyNew
		app.btnHierarchyNew.disabled = false;
		// abilito il tasto 'saveDimension'
		app.btnSaveDimension.disabled = false;
	}

	app.btnHierarchyNew.onclick = (e) => {
		/* se è presente più di una tabella, nella gerarchia, l'ultima non la elimino.
		* Questo perchè, l'ultima tabella, sarà messa in relazione anche con le altre gerarchie che verranno create
		*/
		console.log('numero tabelle presenti nella gerarchia : ', app.dropZone.querySelectorAll('.cardTable').length);
		const cards = app.dropZone.querySelectorAll('.card.table');
		const tableCount = cards.length;
		// numero tabelle presenti nella gerarchia corrente
		if (tableCount > 1) {
			// sono presenti più tabelle, l'ultima della gerarchia non la elimino
			cards.forEach( (card) => {
				if (+card.querySelector('.cardTable').dataset.value !== tableCount) {
					card.remove();
				} else {
					// ultima tabella
					// resetto il 'mode' allo stato iniziale
					card.removeAttribute('mode');
					card.querySelector('.info').hidden = true;
				}
			})
		} else {
			debugger;
			// ripulisco la drop-zone per avere la possibilità di inserire altre gerarchie
			// recupero tutte le .card.table presenti nella drop-zone per eliminarle
			app.dropZone.querySelectorAll('.card.table').forEach( card => card.remove());
			// se la dropzone ha un solo elemento, cioè lo span, allora rimuovo la class dropped per ripristinare lo stato iniziale
			if (app.dropZone.childElementCount === 1) app.dropZone.classList.remove('dropped');
			// riduco il section[data-active] relativo alla struttura gerarchica attualmente attiva (sulla destra)
			document.querySelector('section[data-active]').removeAttribute('data-active');
			// document.querySelectorAll('#hierTables > div').forEach( table => table.remove());
		}
		// TODO: prima di creare la nuova struttura sulla destra, rimuovo l'attr [data-active] dalla gerarchia attuale
		document.querySelector("section[data-id='hierarchies'][data-active]").removeAttribute('data-active');
		// TODO: creo una nuova struttura dove andranno inserite le tabelle della nuova gerarchia
		const parent = document.getElementById('hierarchiesContainer');
		const tmpl = document.getElementById('tmpl-hierarchies');
		const content = tmpl.content.cloneNode(true);
		const sectionDataHier = content.querySelector('section[data-hier-id]');
		const h6 = content.querySelector('h6');
		const btnSaveHierarchy = content.querySelector("button[data-id='hierarchySave']");
		parent.appendChild(sectionDataHier);
		btnSaveHierarchy.addEventListener('click', app.btnSaveHierarchy);

		Hier = new Hierarchy();
	}

	// save cube
	app.btnSaveCubeName.onclick = () => {
		console.log('cube save');
		// TODO: devo verificare se il nome del cubo esiste già, sia in locale che sul db.
		cube.title = document.getElementById('cubeName').value;
		debugger;
		cube.columnsDefined = Hier.columns_;
		cube.comment = document.getElementById('textarea-cube-comment').value;
		cube.FACT = document.querySelector('.card.table[fact]').dataset.label;
		// TODO: recupero l'alias della FACT
		cube.alias = document.querySelector('.card.table[fact] .cardTable').dataset.alias;
		cube.schema = document.querySelector('.card.table[fact]').dataset.schema;
		// Creo il cubeId basandomi sui cubi già creati in Storage, il cubeId lo associo al cubo che sto per andare a salvare.
		// TODO: con l'aggiunta del token non servirà più il cubeId, da eliminare 2022-05-24
		// cube.id = StorageCube.getIdAvailable();
		// console.log(cube.id);

		const rand = () => Math.random(0).toString(36).substr(2);
		// const token = rand().substr(0, 21);
		cube.token = rand().substr(0, 21);

		const storage = new DimensionStorage();
		
		cube.dimensionsSelected.forEach( dimensionToken => {
			let dimensionObject = {};
			// console.log(dimensionName);
			storage.selected = dimensionToken;
			// il metodo selected restituisce la dimensione che sto ciclando, la salvo in dimensionObject per modificarla (aggiunta cubi)
			dimensionObject[dimensionToken] = storage.selected;
			// salvo il cubo all'interno della dimensione, comprese la sua join con questa dimensione
			// dimensionObject[dimensionName].cubes.push({[cube._title] : cube.relations});
			dimensionObject[dimensionToken].cubes[cube.token] = cube.relations;
			console.log(dimensionObject[dimensionToken]);
			// salvo il nome della dimensione/i associate al cubo. In questo modo, il cubo andrà a leggere la dimensione, tramite nome, se la dimensione viene modificata la modifica si riflette su tutti i cubi che hanno questa dimensione
			cube.associatedDimensions = dimensionToken;
			// salvo la "nuova" dimensione, la dimensione avrà la proprietà cubes valorizzata
			storage.saveTemp(dimensionObject[dimensionToken]);
		});

		cube.save();

		// salvo il cubo in localStorage
		debugger;
		StorageCube.saveTemp(cube.cube);
		// salvo il cubo sul DB
        // app.saveCube(cube.cube);
		app.dialogCubeName.close();
	}

	// save dimension
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
		storage.saveTemp(Dim.dimension);
		app.dialogDimensionName.close();	
		// chiudo le card presenti
		app.closeCards();
		// visualizzo le dimensioni create
		// imposto, sulla icona openTableList, il colore della fact
		console.debug('REVISIONARE');
		app.btnTableList.setAttribute('fact', true); // OPTIMIZE: dataset data-fact
		debugger;

		app.getDimensions(); // TODO: qui andrò ad aggiornare solo la dimensione appena salvata/modificata

		delete Dim.dimension;
	}

	app.showTooltip = (e) => {
		// OPTIMIZE: da spostare in Application.js
		if (e.target.classList.contains('md-inactive')) return;
		const pos = (tooltipType) => {
			// tooltipType : 0 (tooltip page) 1 (tooltip all'interno di una dialog)
			let x,y;
			let left, right, top, bottom;
			if (tooltipType === 0) {
				// getBoundingClientRect è relativo al viewport
				left = e.target.getBoundingClientRect().left;
				right = e.target.getBoundingClientRect().right;
				top = e.target.getBoundingClientRect().top;
				bottom = e.target.getBoundingClientRect().bottom;
			} else {
				left = e.target.offsetLeft;
				right = left + e.target.offsetWidth;
				top = e.target.offsetTop;
				bottom = top + e.target.offsetHeight;
			}			
			let centerElementW = left + ((right - left) / 2);
			let centerElementH = top + ((bottom - top) / 2);
			// il testo del tooltip
			app.tooltip.innerHTML = e.currentTarget.dataset.tooltip;
			const elementWidth = app.tooltip.offsetWidth / 2;
			const elementHeight = app.tooltip.offsetHeight / 2;
			const width = app.tooltip.offsetWidth;
			const height = app.tooltip.offsetHeight;
			switch (e.target.dataset.tooltipPosition) {
				case 'top':
					y = top - height;
					x = centerElementW - elementWidth;
					break;
				case 'right':
					// y = e.target.getBoundingClientRect().top;
					y = centerElementH - elementHeight;
					x = right + 5;
					break;
				case 'left':
					y = centerElementH - elementHeight;
					x = left - width;
					break;
				default:
					// bottom
					y = bottom + 5;
					x = centerElementW - elementWidth;
					break;
			}
			return {x,y};
		}
		if (e.target.hasAttribute('data-tooltip-dialog')) {
			// recupero il tooltip all'interno della dialog definita nell'attributo data-tooltip-dialog
			app.tooltip = document.querySelector('#'+e.target.dataset.tooltipDialog+' > .tooltip-dialog');
			// console.log('app.tooltip : ', app.tooltip);
			app.tooltip.style.setProperty('--left', pos(1).x + "px");
			// app.tooltip.style.setProperty('--left', xPosition + "px");
			app.tooltip.style.setProperty('--top', pos(1).y + "px");
		} else {
			app.tooltip = document.getElementById('tooltip');
			// console.log('app.tooltip : ', app.tooltip);
			app.tooltip.style.setProperty('--left', pos(0).x + "px");
			// app.tooltip.style.setProperty('--left', xPosition + "px");
			app.tooltip.style.setProperty('--top', pos(0).y + "px");
		}
		
		// app.tooltip.style.setProperty('--top', yPosition + "px");
		if (e.target.hasAttribute('data-open-abs-window')) {
			// tasto versionamento, mostro la abs-window
			app.absWindow.style.setProperty('--left', pos(0).x + 'px');
			app.absWindow.style.setProperty('--top', pos(0).y + 'px');
			app.absWindow.hidden = false;
		}
		// app.popup.classList.add('show');
		app.tooltipTimeoutId = setTimeout(() => {
			// se il tooltip non contiene un testo non deve essere mostrato
			if (e.target.dataset.tooltip.length !== 0) app.tooltip.classList.add('show');
		}, 600);
		/*app.popup.animate([
		  {transform: 'scale(.2)'},
		  {transform: 'scale(1.2)'},
		  {transform: 'scale(1)'}
		], { duration: 50, easing: 'ease-in-out', delay: 1000 });*/

		// console.log(e.target.getBoundingClientRect().bottom);
		// console.log(e.target.getBoundingClientRect().left);
		// console.log(' : ', rect);
	}

	app.hideTooltip = (e) => {
		// OPTIMIZE: da spostare in Application.js
		if (e.target.classList.contains('md-inactive')) return;
		app.tooltip.classList.remove('show');
		clearTimeout(app.tooltipTimeoutId);
		if (e.target.hasAttribute('data-open-abs-window')) {
			// tasto versionamento, mostro la abs-window
			app.absWindow.hidden = true;
		}
	}

	// eventi mouseEnter/Leave su tutte le icon con l'attributo data-tooltip
	document.querySelectorAll('*[data-tooltip]').forEach( icon => {
		// OPTIMIZE: da spostare in Application.js
		icon.onmouseenter = app.showTooltip;
		icon.onmouseleave = app.hideTooltip;
	});

	app.btnCompositeMetricDone.onclick = () => app.dialogCompositeMetric.close();

	// textarea per creare una metrica composta
	document.getElementById('composite-metric-formula').onclick = (e) => {
		console.log('e : ', e);
		console.log('e.target : ', e.target);
		console.log('e.currentTarget : ', e.currentTarget);
		if (e.target.localName === 'div') {
			const span = document.createElement('span');
			span.setAttribute('contenteditable', true);
			e.target.appendChild(span);
			span.focus();
		}
	}

	// selezione di una metrica per la creazione di una metrica composta
	app.handlerMetricSelectedComposite = (e) => {
		// TODO: aggiungo la metrica alla textarea
		console.log(cube.activeCard.tableName);
		// debugger;
		const textArea = document.getElementById('composite-metric-formula');
		// creo uno span con dentro la metrica
		const mark = document.createElement('mark');
		mark.innerText = e.currentTarget.dataset.label;
		textArea.appendChild(mark);
		// aggiungo anche uno span per il proseguimento della scrittura della formula
		let span = document.createElement('span');
		span.setAttribute('contenteditable', true);
		textArea.appendChild(span);
		span.focus();
	}

	app.checkDialogCompositeMetric = () => {
		const name = document.getElementById('composite-metric-name').value;
		const alias = document.getElementById('composite-alias-metric').value;
		(name.length !== 0 && alias.length !== 0) ? app.btnCompositeMetricSave.disabled = false : app.btnCompositeMetricSave.disabled = true;
	}

	document.getElementById('composite-metric-name').oninput = () => app.checkDialogCompositeMetric();
	
	document.getElementById('composite-alias-metric').oninput = () => app.checkDialogCompositeMetric();

	// NOTE: esempio di utilizzo di MutationObserver
	const body = document.getElementById('body');
    // create a new instance of `MutationObserver` named `observer`,
	// passing it a callback function
	const observer = new MutationObserver(function() {
	    // console.log('callback that runs when observer is triggered');
	    document.querySelectorAll('*[data-fn]').forEach( (span) => {
	    	span.onclick = app[span.dataset.fn];
	    });

	    document.querySelectorAll('*[data-tooltip]').forEach( (element) => {
			element.onmouseenter = app.showTooltip;
			element.onmouseleave = app.hideTooltip;
		});
	});
	// call `observe()` on that MutationObserver instance,
	// passing it the element to observe, and the options object
	observer.observe(body, {subtree: true, childList: true, attributes: true});
})();
