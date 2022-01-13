// TODO: Da valutare se la property 'from', all'interno della dimensione mi serve ancora visto che le tabelle sono elencate, in ordine gerarchico, anche nella property 'hierarchies'
// TODO: visto che, nella property lastTableInHierarchy ho l'ultima tabella della gerarchia, potrei togliere questa tabella dalla property 'hierarchies'. In questo modo, 'hierarchies' e 'join' hanno lo stesso indice, da valutare
// window.addEventListener('load', test);
// function test(e) {console.log(e);}

var App = new Application();
var cube = new Cube();
var StorageCube = new CubeStorage();
var dimension = new Dimension();
(() => {
	var app = {
		dialogCubeName : document.getElementById('cube-name'),
		dialogDimensionName : document.getElementById('dimension-name'),
		dialogHierarchyName : document.getElementById('hierarchy-name'),

		hierarchyContainer : document.getElementById('hierarchiesContainer'), // struttura gerarchica sulla destra

		btnBack : document.getElementById('mdc-back'),

		btnSaveDimension : document.getElementById('saveDimension'),
		btnSaveHierarchy : document.getElementById('hierarchySave'),
		btnHierarchySaveName : document.getElementById('btnHierarchySaveName'),
		btnSaveCube : document.getElementById('saveCube'),
		btnSaveCubeName : document.getElementById('btnCubeSaveName'),
		btnSaveOpenedCube : document.getElementById('saveOpenedCube'),

		// tasto openTableList
		btnTableList : document.getElementById('openTableList'),
		tableList : document.getElementById('tableList'),
		// tasto openDimensionList per l'apertura dell'elenco delle dimensioni
		btnDimensionList : document.getElementById('openDimensionList'),
		dimensionList : document.getElementById('dimensionList'),
		// tasto definisci Cubo
		btnNewFact : document.getElementById('defineCube'),
		
		card : null,
		cardTitle : null,
		content : document.getElementById('content'),
		body : document.getElementById('body'),
		// dropzone : document.getElementsByClassName('dropzone')[0],
		currentX : 0,
		currentY : 0,
		initialX : 0,
		initialY : 0,
		active : false,
		xOffset : 0,
		yOffset : 0,
		dragElement : null,
		elementMenu : null
	};

	App.init();

	app.dragStart = (e) => {
        console.log('dragStart : ', e.target);
		// mousedown da utilizzare per lo spostamento dell'elemento
		if (e.target.localName === 'h6') {
			app.cardTitle = e.target;
			app.card = e.path[4];
			// recupero la posizione attuale della card tramite l'attributo x-y impostato su .cardTable
			app.xOffset = e.path[4].getAttribute('x');
			app.yOffset = e.path[4].getAttribute('y');
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

    app.dragEnd = () => {
        console.log('dragEnd');
		// console.log(e.target);
		// mouseup, elemento rilasciato dopo lo spostamento
		app.initialX = app.currentX;
		app.initialY = app.currentY;
		app.active = false;
	};

    app.drag = (e) => {
        // console.log('drag');
		// mousemove elemento si sta spostato
		// console.log(e.target);
		// console.log(e);
		if (app.active) {
			e.preventDefault();

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

	app.body.onmousedown = app.dragStart;
	app.body.onmouseup = app.dragEnd;
	app.body.onmousemove = app.drag;

	// TODO: aggiungere anhce eventi touch...

	app.handlerDragStart = (e) => {
		console.log('handlerDragStart');
		// dragStart
		// console.log(e.target.id);
		// return;
		e.dataTransfer.setData('text/plain', e.target.id);
        // console.log(e.dataTransfer);
		app.dragElement = document.getElementById(e.target.id);
		// console.log(e.path);
		app.elementMenu = e.path[1]; // elemento da eliminare al termine drl drag&drop
		// console.log(e.dataTransfer);
	};

	app.handlerDragOver = (e) => {
		console.log('handlerDragOver');
		e.preventDefault();
	};

	app.handlerDragEnter = (e) => {
		console.log('handlerDragEnter');
		e.preventDefault();
		console.log(e.target);

		if (e.target.className === 'dropzone') {
		  console.info('DROPZONE');
		  // TODO: css effect
		}
	};

	app.handlerDragLeave = (e) => {
        console.log('handlerDragLeave');
		e.preventDefault();
		// console.log('dragLeave');
	};

	app.handlerDragEnd = (e) => {
        console.log('handlerDragEnd');
		e.preventDefault();
		// console.log('dragEnd');
		// console.log(e.target);
		// debugger;
		// faccio il DESCRIBE della tabella
		app.getTable(e.target.getAttribute('data-schema'), cube.card.tableName);
	};

	app.handlerDrop = (e) => {
        console.log('handlerDrop');
		e.preventDefault();
		// console.log('drop');
		// console.log(e.target);
		let data = e.dataTransfer.getData('text/plain');
		let card = document.getElementById(data);
		// debugger;
		// console.log(e.dataTransfer);
		// console.log(e.target);
		// nuova tabella droppata
		// console.log(card);
		// console.log(app.dragElement);
		// TODO: dopo il drop elimino l'elemento <li> e imposto il template #cardLayout
		// TODO: la .card .draggable diventa .card .table
		card.className = 'card table';
		card.removeAttribute('draggable');
		card.removeAttribute('name');
		// elimino lo span all'interno della card
		card.querySelector('span[label]').remove();
		// associo gli eventi mouse
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

		app.body.appendChild(card);
		// tabella fact viene colorata in modo diverso, imposto attributo fact sia sulla .card.table che sulla .cardTable
		if (app.btnTableList.hasAttribute('fact')) {
		  card.setAttribute('fact', true);
		  card.querySelector('.cardTable').setAttribute('fact', true);
		  // visualizzo l'icona metrics
		  card.querySelector('section[options] > .popupContent[hide]').removeAttribute('hide');
		}

		// imposto la card draggata nella posizione dove si trova il mouse
		card.style.transform = 'translate3d(' + e.offsetX + 'px, ' + e.offsetY + 'px, 0)';
		card.setAttribute('x', e.offsetX);
		card.setAttribute('y', e.offsetY);
		// chiudo la list openTableList
		app.btnTableList.removeAttribute('open');
		app.tableList.toggleAttribute('hidden');

		// evento sul tasto close della card
		card.querySelector('i[data-id="closeTable"]').onclick = app.handlerCloseCard;
		// evento sulla input di ricerca nella card
		card.querySelector('input').oninput = App.searchInList;
	
		cube.activeCard = {'ref': card.querySelector('.cardTable'), 'schema' : card.getAttribute('data-schema'), 'tableName': card.getAttribute('label')};
		// inserisco il nome della tabella selezionata nella card [active]
		// cube.table = card.getAttribute('label');

		// inserisco il nome della tabella nella struttura gerarchica sulla destra
		const hierarchiesTables = document.getElementById('hierTables');
		let id = hierarchiesTables.childElementCount;
		// let dropzone = document.createElement('div');
	
		// dropzone.classList = 'dropzoneHier';
		// hierarchiesTables.appendChild(dropzone);
		let div = document.createElement('div');
		div.className = 'hier table dropzoneHier';
		div.id = 'relation_' + id;
		div.setAttribute('data-schema', 'automotive_bi_data');
		div.setAttribute('draggable', true);
		div.setAttribute('label', cube.card.tableName);
		div.innerText = cube.card.tableName;

		hierarchiesTables.appendChild(div);
		// imposto sul div l'evento drag&drop per gli elementi della gerarchia sulla destra
		div.ondragstart = app.hierDragStart;
		div.ondragover = app.hierDragOver;
		div.ondragenter = app.hierDragEnter;
		div.ondragleave = app.hierDragLeave;
		div.ondragend = app.hierDragEnd;
		div.ondrop = app.hierDrop;

		// event sui tasti section[options]
		card.querySelector('i[join]').onclick = app.handlerAddJoin;
		card.querySelector('i[metrics]').onclick = app.handlerAddMetric;
		card.querySelector('i[columns]').onclick = app.handlerAddColumns;
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
		dimension.activeCard = e.path[3];
		cube.fieldSelected = e.currentTarget.getAttribute('label');
		// TODO: utilizzare uno dei due qui, cube.fieldSelected oppure dimension.field, da rivedere
		dimension.field = {field : e.currentTarget.getAttribute('label'), type : e.currentTarget.getAttribute('data-key')};
	
		// console.log(cube.activeCard);

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
					let liRelationSelected = dimension.card.querySelector('li[relations]:not([data-relation-id])');
					// console.log(liRelationSelected);
					e.currentTarget.toggleAttribute('relations');
					e.currentTarget.toggleAttribute('selected');
					// se ho selezionato una colonna diversa da quella già selezionata, rimuovo la selezione corrente e imposto quella nuova
					// se è stata selezionata una colonna già selezionata la deseleziono
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
				if (cube.card.ref.hasAttribute('mode')) {
					console.log('columns');
					e.currentTarget.toggleAttribute('columns');
					// nel metodo columns c'è la logica per controllare se devo rimuovere/aggiungere la colonna selezionata
					dimension.columns();
				}
		}
	};

	// click sull'icona di destra "columns" per l'associazione delle colonne
	app.handlerAddColumns = (e) => {
		// console.log(e.target);
		// console.log(e.path);
		console.log('add columns');

		const cardTable = e.path[3].querySelector('.cardTable');
		console.log('cardTable : ', cardTable);
		cube.activeCard = {'ref': cardTable, 'schema' : cardTable.getAttribute('data-schema'), 'tableName': cardTable.getAttribute('name')};
		// quando aggiungo la tabella imposto da subito la colonna id in "columns"
		dimension.activeCard = cardTable; // card attiva
		const primaryKey = dimension.activeCard.querySelector('ul li[data-key="pk"]');
        if (primaryKey) dimension.field = {field : primaryKey.getAttribute('label'), type : primaryKey.getAttribute('data-key')};
		// dimension.columns = {field : primaryKey.getAttribute('label'), type : primaryKey.getAttribute('data-key')};
		dimension.columns();
		// dimension.columns = primaryKey.getAttribute('label');
		// con l'attributo columns verrà mostrata l'icona "columns associata"
		if (primaryKey) primaryKey.toggleAttribute('columns');
		cube.mode('columns', 'Seleziona le colonne da mettere nel corpo della tabella');
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
		// let hierObj = {};
		let colSelected = [];
		console.log( document.querySelectorAll('.cardTable[mode="relations"] li[relations][selected]').length);
		// quando i campi selezionati sono 1 recupero il nome della tabella perchè questa gerarchia avrà il nome della prima tabella selezionata da mettere in relazione
		if (document.querySelectorAll('.cardTable[mode="relations"] li[relations][selected]').length === 1) {
			dimension.table = document.querySelector('.cardTable[mode="relations"] li[relations][selected]').getAttribute('data-table-name');
			// let li = document.querySelector('.cardTable[mode="relations"] li[relations][selected]');
		}
		console.log('dimension.table : ', dimension.table);
		debugger;
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
				// se, in questa relazione è presente anche la tabella FACT rinomino hier_n in fact_n in modo da poter separare le gerarchie
				// e capire quali sono quelle con la fact (quindi legate al Cubo) e quali no (posso salvare la Dimensione, senza il legame con il Cubo)
				if (card.hasAttribute('fact')) {
					console.log('FACT TABLE Relation');
					cube.relations['cubeJoin_'+cube.relationId] = hier;
					cube.relationId++;
					console.log(cube.relations);
					cube.saveRelation(colSelected);
				} else {
					debugger;
					dimension.hierarchies = hier;
					// dimension.relationId++;
					// visualizzo l'icona per capire che c'è una relazione tra le due colonne
					dimension.saveRelation(colSelected);
					console.log(dimension.hierarchies);
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

	app.getDimensions = () => {
		// recupero la lista delle dimensioni in localStorage
		const dimension = new DimensionStorage();
		// dimensions : è un Object che contiene un array con le tabelle incluse nella dimensione
		const dimensions = dimension.list();
		const tmplDimension = document.getElementById('dimension');
		for (const [key, value] of Object.entries(dimensions)) {
			let tmplContent = tmplDimension.content.cloneNode(true);
			let div = tmplContent.querySelector('.dimensions');
			div.querySelector('h5').innerHTML = key;

			div.querySelector('h5').setAttribute('label', key);
			document.querySelector('#dimensions').appendChild(div);
			div.querySelector('h5').onclick = app.handlerDimensionSelected;

			// aggiungo anche le tabelle all'interno ella dimensione
			// console.log(obj[dimName]); // valore/i
			const tmplMiniCard = document.getElementById('miniCard');

			value.forEach( (table) => {
				let contentMiniCard = tmplMiniCard.content.cloneNode(true);
				let miniCard = contentMiniCard.querySelector('.miniCard');
				miniCard.querySelector('h6').innerHTML = table;
				// console.log(table);
				div.appendChild(miniCard);
			});
		}
	};

	// recupero la lista dei Cubi in localStorage
	app.getCubes = () => {
		const ul = document.getElementById('cubes');
		StorageCube.list(ul);
		// associo la Fn che gestisce il click sulle <li>
		ul.querySelectorAll('li').forEach( (li) => li.addEventListener('click', app.handlerCubeSelected) );
	};

	app.handlerCubeSelected = (e) => {
		// apro la tabella definita come Cubo
		console.log('e.currentTarget : ', e.currentTarget);
		debugger;
		StorageCube.selected = e.currentTarget.getAttribute('label');
		console.log('cube selected : ', StorageCube.selected);
		// ridefinisco le proprietà del cubo, leggendo da quello selezionato, nello storage, per consentirne la modifica o l'aggiunto di dimensioni al cubo
		cube._metrics = StorageCube.selected.metrics;
		debugger;
		StorageCube.selected.associatedDimensions.forEach( (dim) => {
			cube.associatedDimensions = dim;
		});
		app.addCard(StorageCube.selected.FACT, true);
		// visualizzo il tasto saveOpenedCube al posto di SaveCube
		app.btnSaveOpenedCube.parentElement.toggleAttribute('hide');
		// nascondo btnSaveCube
		app.btnSaveCube.parentElement.toggleAttribute('hide');
	};

	// get tabelle del database
	app.getDatabaseTable = async () => {
		const url = '/mapping/tables';
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
		        	for (const [key, value] of Object.entries(data)) {
		        		// debugger;
		        		let tmpl = document.getElementById('el');
						let tmplContent = tmpl.content.cloneNode(true);
						let element = tmplContent.querySelector('.element.card');
						element.ondragstart = app.handlerDragStart;
						element.id = 'table-' + key;
						element.setAttribute('data-schema', 'automotive_bi_data');
						element.setAttribute('label', value.TABLE_NAME);
						ul.appendChild(element);
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
		debugger;
		const cardTable = e.path[3].querySelector('.cardTable');
		cube.activeCard = {'ref': cardTable, 'schema' : cardTable.getAttribute('data-schema'), 'tableName': cardTable.getAttribute('name')};
		cube.mode('relations', 'Selezionare le colonne che saranno messe in relazione');
	};

	app.getTable = async (schema, table) => {
		let tmplList = document.getElementById('templateListColumns');
		// elemento dove inserire le colonne della tabella
		let ulContainer = cube.card.ref.querySelector('#columns');

	    await fetch('/mapping/'+schema+'/schema/'+table+'/table_info')
			.then( (response) => {
			if (!response.ok) {throw Error(response.statusText);}
			return response;
			})
			.then( (response) => response.json())
			.then( (data) => {
                console.log(data);
		        if (data) {
		        	ulContainer.removeAttribute('hidden');
		        	for ( const [key, value] of Object.entries(data)) {
                        console.log(key, value);
		        		let tmplContent = tmplList.content.cloneNode(true);
						let element = tmplContent.querySelector('.element');
						// element.setAttribute('name', 'columnSearch');
						let li = element.querySelector('li');
						li.className = 'elementSearch';
						// let iElement = element.querySelector('i');
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
						ulContainer.appendChild(element);
						// li.onclick = cube.handlerColumns.bind(cube);
						li.onclick = app.handlerColumns;
		        	}
		        } else {
		          // TODO: no data, handlerConsoleMessage
		          console.error('Non è stato possibile recuperare le colonne della tabella : ', table);
		        }
		    })
	    .catch( (err) => console.error(err));
	};

	/*events */

	// salvataggio di un cubo già esistente
	app.btnSaveOpenedCube.onclick = () => {
		console.log('cube opened save');
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

		app.dialogCubeName.close();
	};

	// tasto report nella sezione controls -> fabs
    document.getElementById('mdc-report').onclick = () => {window.location.href = '/report';};

    app.saveDIM = async (jsonDim) => {
        console.log(jsonDim);
        console.log(JSON.stringify(jsonDim));
        await fetch('/fetch_api/dimension/'+JSON.stringify(jsonDim)+'/save')
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
              // NOTE: qui ho creato la FX, a questo punto potrei scegliere di visualizzare il report, per il momento mi serve solo la FX.
              // app.getDatamart(reportId, jsonDataParsed); // recupero i dati dalla FX appena creata
            } else {
              // TODO: no data
              console.debug('FX non è stata creata');
            }
          })
          .catch((err) => console.error(err));
    };

	/* Salvataggio della dimensione, dalla dialog */
	document.getElementById('btnDimensionSaveName').onclick = () => {
		/*
		  Salvo la dimensione, senza il legame con la FACT.
		  Salvo in localStorage la dimensione creata
		  // Visualizzo nell'elenco di sinistra la dimensione appena creata
		  // creo un contenitorre per le dimensioni salvate, con dentro le tabelle che ne fanno parte.
		*/
		dimension.title = document.getElementById('dimensionName').value;
		// cube.dimension
		const storage = new DimensionStorage();
		let from = [];
		document.querySelectorAll('.cardTable').forEach((card) => {
			if (card.getAttribute('name')) {from.push(card.getAttribute('name'));}
		});
		dimension.from = from;
	
		dimension.save();
		storage.save = dimension.dimension;
        // TODO: salvo la dimension anche su DB
        app.saveDIM(dimension.dimension);
		//storage.dimension = dimension.dimension;
		app.dialogDimensionName.close();
	
		// chiudo le card presenti
		app.closeCards();
		// visualizzo le dimensioni create
		// imposto, sulla icona openTableList, il colore della fact
		app.btnTableList.setAttribute('fact', true);
		app.getDimensions(); // TODO: qui andrò ad aggiornare solo la dimensione appena salvata/modificata

		delete dimension.dimension;
	};

	// viene invocata da btnDimensionSaveName.onclick, quando viene salvata una dimensione, vengono chiuse tutte le card aperte attualmente
	app.closeCards = () => {
		document.querySelectorAll('.card.table').forEach((item) => {
			console.log(item);
			item.remove();
		});
	};

	app.btnSaveDimension.onclick = (e) => {
		if (e.target.hasAttribute('disabled')) return;
		app.dialogDimensionName.showModal();
	};

	app.btnSaveHierarchy.onclick = (e) => {
		if (e.target.hasAttribute('disabled')) return;
		// TODO: salvo la gerarchia che andrà inserita in dimension
		app.dialogHierarchyName.showModal();

		// abilito il tasto save dimension
		app.btnSaveDimension.removeAttribute('disabled');
		app.btnSaveDimension.classList.remove('md-dark', 'md-inactive');
	};

	app.btnHierarchySaveName.onclick = () => {
		const hierTitle = document.getElementById('hierarchyName').value;
		// ordine gerarchico (per stabilire quale tabella è da associare al cubo) questo dato viene preso dalla struttura di destra
		let hierarchyOrder = {};
		Array.from(document.querySelectorAll('#hierarchies .hier.table')).forEach((table, i) => {
			hierarchyOrder[i] = `${table.getAttribute('data-schema')}.${table.getAttribute('label')}`;
		});
		dimension.hierarchyOrder = {title : hierTitle, hierarchyOrder};
		app.dialogHierarchyName.close();
	};

	app.btnSaveCube.onclick = () => {app.dialogCubeName.showModal();};

	// salvataggio di un nuovo cubo
	app.btnSaveCubeName.onclick = () => {
		console.log('cube save');
		cube.title = document.getElementById('cubeName').value;

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

		app.dialogCubeName.close();
	};

	app.handlerOpenTableList = () => {
		const tableList = document.getElementById('tableList');
		app.btnTableList.toggleAttribute('open');
		tableList.toggleAttribute('hidden');
		document.getElementById('tableSearch').focus();
	};

	app.btnNewFact.onclick = () => {
		app.btnTableList.setAttribute('fact', true);
		app.handlerOpenTableList();
	};

	app.btnBack.onclick = () => {window.location.href = '/';};

	/* ricerca in lista tabelle */
	document.getElementById('tableSearch').oninput = App.searchInList;

	app.btnTableList.onclick = app.handlerOpenTableList;

	document.getElementById('processCube').onclick = (e) => {
		// visualizzo la lista dei cubi esistenti
		const cubeList = document.getElementById('cubesList');
		cubeList.toggleAttribute('hidden');
		e.target.toggleAttribute('open');
		document.getElementById('cubeSearch').focus();
	};

	app.btnDimensionList.onclick = (e) => {
		const dimensionList = document.getElementById('dimensionList');
		dimensionList.toggleAttribute('hidden');
		e.target.toggleAttribute('open');
		document.getElementById('dimensionSearch').focus();
	};

	app.addCard = (label, fact) => {
		// creo la card (label)
		// fact : true/false
		debugger;
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

		cardLayout.querySelector('.cardTable').setAttribute('fact', true);
		// imposto il titolo in h6

		cardLayout.querySelector('h6').innerHTML = label.split('.')[1];
		card.appendChild(cardLayout);
		console.log(card);
		app.body.appendChild(card);

		// evento sul tasto close della card
		card.querySelector('i[data-id="closeTable"]').onclick = app.handlerCloseCard;
		// evento sulla input di ricerca nella card
		card.querySelector('input').oninput = App.searchInList;
		cube.activeCard = {'ref': card.querySelector('.cardTable'), 'tableName': card.getAttribute('label')};

		// event sui tasti section[options]
		card.querySelector('i[join]').onclick = app.handlerAddJoin;

		app.getTable(label.split('.')[0], label.split('.')[1]);
	};

	// selezione di una dimensione da inserire nel body, per legarla al cubo
	app.handlerDimensionSelected = (e) => {
		console.log(e.target);
		const storage = new DimensionStorage();
		storage.selected = e.target.getAttribute('label');
		
		// memorizzo la dimensione selezionata per recuperarla nel salvataggio del cubo
		cube.dimensionsSelected = e.target.getAttribute('label');
		// recupero tutta la dimensione selezionata, dallo storage
		console.log(storage.selected);
		app.addCard(storage.selected.lastTableInHierarchy, false);
		
	};

    app.getSchemata = async () => {
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
		        } else {
		          // TODO: no data
		          console.warning('Non è stato possibile recuperare la lista delle tabelle');
		        }
		    })
	    .catch( (err) => console.error(err));
    };

    app.getSchemata();

	app.getDatabaseTable();

	app.getDimensions();

    app.getCubes();
    
})();
