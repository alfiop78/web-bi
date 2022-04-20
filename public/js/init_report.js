var App = new Application();
var Query = new Queries();
var Dim = new DimensionStorage();
var StorageCube = new CubeStorage();
var StorageProcess = new ProcessStorage();
var StorageFilter = new FilterStorage();
var StorageMetric = new MetricStorage();
// TODO: 24.03.2022 impostare gli alias di tabella nelle dialog 'columns/filter' altrimenti una tabella in più gerarchie non si riesce a distinguere

(() => {
	App.init();
	// console.info('Date.now() : ', Date.now());

	// la Classe Steps deve impostare alcune proprietà DOPO che viene visualizzato il body, non può essere posizionato prima di App.init();
	var Step = new Steps('stepTranslate');

	var app = {
		// templates
		tmplUlList: document.getElementById('template_ulList'), // contiene le <ul>
		tmplList: document.getElementById('templateList'), // contiene i section
		tmplSubList : document.getElementById('sublist-item'),
		tmplSubListTable : document.getElementById('data-sublist-table-columns'),

		// popup
		popup: document.getElementById('popup'),
		dialogPopup: null,

		// btn
		btnAddColumns : document.getElementById('btn-add-columns'),
		btnPreviousStep : document.getElementById('prev'),
		btnNextStep : document.getElementById('next'),
		btnStepDone: document.getElementById('stepDone'),
		btnSaveAndProcess: document.getElementById('saveAndProcess'),
		btnSaveColumn: document.getElementById('btnSaveColumn'), // salvataggio di un alias/sql di colonna nella dialog dialogTables

		btnProcessReport: document.getElementById('btnProcessReport'), // apre la lista dei report da processare "Crea FX"

		// dialog
		dialogSaveReport: document.getElementById('dialogSaveReport'),
		dialogFilter: document.getElementById('dialogFilter'),
		// dialogColumn : document.getElementById('dialogColumn'),
		dialogTables: document.getElementById('dialogTables'),
		dialogMetric: document.getElementById('dialogMetric'),
		btnFilterSave: document.getElementById('btnFilterSave'), //tasto salva nella dialog filter
		btnFilterDone: document.getElementById('btnFilterDone'), //tasto fatto nella dialog filter
		btnColumnDone: document.getElementById('btnColumnDone'), // tasto ok nella dialogTables
		btnMetricDone: document.getElementById('btnMetricDone'), // tasto Salva nella dialogMetric
		btnSaveReport: document.getElementById('saveReport'),
		btnSaveReportDone: document.getElementById('btnReportSaveName'),

		btnBackPage: document.getElementById('mdcBack'), // da definire
		ulDimensions: document.getElementById('dimensions'),
		aggregationFunction: document.getElementById('sql-aggregation-list'),
		btnMapping: document.getElementById('mdcMapping')
	}

	// carico elenco Cubi su cui creare il report
	app.getCubes = () => {
		// const content = app.tmplUlList.content.cloneNode(true);
		// const ul = content.querySelector("ul[data-id='list-cubes']");
		const ul = document.getElementById('list-cubes');
		const parent = document.getElementById('parent-list-cubes');
		for (const [key, value] of Object.entries(StorageCube.cubes)) {
			const contentElement = app.tmplList.content.cloneNode(true);
			const section = contentElement.querySelector('section[data-no-icon]');
			const element = section.querySelector('.element');
			const li = element.querySelector('li');
			section.setAttribute('data-element-search', 'search-cube');
			section.setAttribute('data-label', key);
			section.setAttribute('data-searchable', true);
			section.removeAttribute('hidden');
			// element.setAttribute('data-cube-id', value.id);
			// element.setAttribute('data-cube-name', key);
			li.innerText = key;
			li.setAttribute('label', key);
			li.setAttribute('data-cube-id', value.id);
			li.setAttribute('data-cube-name', key);
			ul.appendChild(section);
			li.onclick = app.handlerCubeSelected;
		}
		parent.appendChild(ul);
	}

	// lista dimensioni
	app.getDimensions = () => {
		// elenco di tutte le dimensioni
		const ul = document.getElementById('list-dimensions');
		const parent = document.getElementById('parent-list-dimensions');
		// creo un unica <ul> con dentro tutte le dimensioni, queste verranno filtrate quando si selezionano uno o più cubi
		// console.log('lista cubi : ', StorageCube.cubes); // tutta la lista dei cubi
		for (const [cubeName, cubeValue] of (Object.entries(StorageCube.cubes))) {
			// console.log('key : ', cubeName);
			// console.log('value : ', cubeValue); // tutto il contenuto del cubo
			// console.log('dimensioni associate : ', cubeValue.associatedDimensions);
			// per ogni dimensione presente in associatedDimensions inserisco un element (preso dal template app.tmplListField)
			cubeValue.associatedDimensions.forEach((dimension, index) => {
				const contentElement = app.tmplList.content.cloneNode(true);
				const section = contentElement.querySelector('section[data-no-icon]');
				const element = section.querySelector('.element');
				const li = element.querySelector('li');
				section.setAttribute('data-element-search', 'search-dimension');
				section.setAttribute('data-label', dimension); // questo attr consente la ricerca dalla input sopra
				section.setAttribute('data-cube-name', cubeName); // questo attr consente la ricerca dalla selezione del cubo
				// element.setAttribute('data-dimension-id', dimName);
				// element.setAttribute('data-hier-id', hier);
				li.innerText = dimension;
				li.setAttribute('data-dimension-name', dimension);
				li.setAttribute('label', dimension);
				li.setAttribute('data-cube-name', cubeName);
				ul.appendChild(section);
				li.onclick = app.handlerDimensionSelected;
			}); // forse index si deve sostituire con un dimensionId (che attualmente non viene creato quando si crea una dimensione)
			parent.appendChild(ul);
		}
	}

	app.handlerSelectHierarchy = (e) => {
		e.currentTarget.toggleAttribute('selected');
		const hier = e.currentTarget.getAttribute('data-hier-name');
		if (e.currentTarget.hasAttribute('selected')) {
			// visualizzo, in ul list-columns, solo le tabelle delle gerarchie selezionate
			document.querySelectorAll("#list-columns section[data-hier-name='" + hier + "']").forEach( (hier) => {
				hier.hidden = false;
				hier.setAttribute('data-searchable', true);
			});
		} else {
			// deselezione della gerarchia, nascondo le tabelle della gerarchia selezionata
			document.querySelectorAll("#list-columns section[data-hier-name='" + hier + "']").forEach( (hier) => {
				hier.hidden = true;
				hier.removeAttribute('data-searchable');
			});
		}
	}

	// lista gerarchie
	app.getHierarchies = () => {
		// imposto un data-dimension-id/name sugli .element della lista gerarchie, in questo modo posso filtrarle quando seleziono le dimensioni nello step precedente
		// const content = app.tmplUlList.content.cloneNode(true);
		const ul = document.getElementById('list-hierarchies');
		const parent = document.getElementById('parent-list-hierarchies'); // dove verrà inserita la <ul>
		// ottengo l'elenco delle gerarchie per ogni dimensione presente in storage, successivamente, quando la dimensione viene selezionata, visualizzo/nascondo solo quella selezionata
		// console.log('lista dimensioni :', Dim.dimensions);
		// per ogni dimensione presente aggiungo gli elementi nella ul con le gerarchie
		for (const [dimName, dimValue] of (Object.entries(Dim.dimensions))) {
			// per ogni dimensione presente in associatedDimensions inserisco un element (preso dal template app.tmplListField)
			for (const [hierName, hier] of (Object.entries(dimValue.hierarchies)) ) {
				const contentElement = app.tmplList.content.cloneNode(true);
				// const section = contentElement.querySelector('section[data-icon-column][data-icon-filter]');
				const section = contentElement.querySelector('section[data-sublist]');
				const element = section.querySelector('.element');
				const sublist = section.querySelector('.sublist');
				const li = element.querySelector('li');
				section.setAttribute('data-label', hierName); // ricerca dalla input sopra
				section.setAttribute('data-element-search','search-hierarchy'); // ricerca dalla input sopra
				section.setAttribute('data-dimension-name', dimValue.name);
				section.setAttribute('data-hier-name', hierName);
				section.addEventListener('click', app.handlerSelectHierarchy);
				li.innerText = hierName;
				li.setAttribute('data-hier-name', hierName);
				li.setAttribute('data-dimension-name', dimName);
				ul.appendChild(section);
				li.onclick = app.handlerHierSelected;
				// lista tabelle presenti per ogni gerarchia
				for (const [tableId, table] of Object.entries(hier.order)) {
					// console.log(table.table);
					const contentSublist = app.tmplSubList.content.cloneNode(true);
					const sublistElement = contentSublist.querySelector('.sublist-element');
					const sublistItem = sublistElement.querySelector('.sublist-item');
					const columnIcon = sublistElement.querySelector('i[data-id="column-icon"]');
					const filterIcon = sublistElement.querySelector('i[data-id="filter-icon"]');
					columnIcon.setAttribute('data-dimension-name', dimName);
					columnIcon.setAttribute('data-hier-name', hierName);
					columnIcon.setAttribute('data-table-name', table.table);
					filterIcon.setAttribute('data-dimension-name', dimName);
					filterIcon.setAttribute('data-hier-name', hierName);
					filterIcon.setAttribute('data-table-name', table.table);
					columnIcon.onclick = app.openDialogColumns;
					filterIcon.onclick = app.openDialogFilters
					sublistItem.innerText = table.table;
					sublistItem.setAttribute('data-table-id', tableId);
					sublist.appendChild(sublistElement);
				}
			}
		  parent.appendChild(ul);
		}
	}

	app.getColumns = () => {
		// lista di tutte le colonne, incluse nelle dimensioni, property 'columns'
		const ul = document.getElementById('list-columns');
		const parent = document.getElementById('parent-list-columns');
		// per ogni dimensione, recupero la property 'columns'
		// console.log('Dim.dimension : ', Dim.dimensions);
		for (const [key, value] of (Object.entries(Dim.dimensions))) {
			// key : nome della dimensione
			// value : tutte le property della dimensione
			for (const [hier, hierValue] of Object.entries(value.hierarchies)) {

				for (const [tableId, orderTable] of Object.entries(hierValue.order)) {
					// console.log('tableId : ', tableId);
					// console.log('orderTable : ', orderTable);
					// console.log('fields : ', orderTable.alias);
					// console.log('hierValue.columns : ', hierValue.columns[orderTable.alias]);
					for (const field in hierValue.columns[orderTable.alias]) {
						// console.log('field : ', field);
						const content = app.tmplList.content.cloneNode(true);
						const section = content.querySelector('section[data-sublist-hier-table-columns]');
						const subList = section.querySelector('.sublist');
						const spanHier = subList.querySelector('span[hier]');
						const spanTable = subList.querySelector('span[table]');
						const spanColumn = subList.querySelector('span[column]');
						section.setAttribute('data-label', field);
						section.setAttribute('data-element-search', 'search-columns');
						section.setAttribute('data-hier-name', hier);
						spanHier.innerText = hier;
						spanTable.innerText = orderTable.table;
						spanColumn.innerText = field;
						spanColumn.setAttribute('data-label', field);
						// spanColumn.setAttribute('data-table-name', table.split('_')[0]);
						spanColumn.setAttribute('data-table-name', orderTable.table);
						spanColumn.setAttribute('data-alias-name', orderTable.alias);
						spanColumn.setAttribute('data-table-id', tableId);
						spanColumn.setAttribute('data-dimension-name', key);
						spanColumn.setAttribute('data-hier-name', hier);
						// spanColumn.setAttribute('data-table-id')
						spanColumn.onclick = app.selectColumn;
						ul.appendChild(section);
					}
				// for (const [table, fields] of Object.entries(hierValue.columns)) {
					// for (let field in fields) {
						// console.log('field : ', field);
						// console.log('fields[field] : ', fields[field]);
						/*const content = app.tmplList.content.cloneNode(true);
						const section = content.querySelector('section[data-sublist-hier-table-columns]');
						const subList = section.querySelector('.sublist');
						const spanHier = subList.querySelector('span[hier]');
						const spanTable = subList.querySelector('span[table]');
						const spanColumn = subList.querySelector('span[column]');
						section.setAttribute('data-label', field);
						section.setAttribute('data-element-search', 'search-columns');
						section.setAttribute('data-hier-name', hier);
						spanHier.innerText = hier;
						spanTable.innerText = table;
						spanColumn.innerText = field;
						spanColumn.setAttribute('data-label', field);
						spanColumn.setAttribute('data-table-name', table.split('_')[0]);
						spanColumn.setAttribute('data-alias-name', table);
						spanColumn.setAttribute('data-dimension-name', key);
						spanColumn.setAttribute('data-hier-name', hier);
						// spanColumn.setAttribute('data-table-id')
						spanColumn.onclick = app.selectColumn;
						ul.appendChild(section);*/
					// }
				}
			}
		}
	}

	app.showPopupDialog = (e) => {
		// console.log('e : ', e);
		const yPosition = e.target.offsetTop + e.target.clientHeight + 10; // offsetTop : altezza dall'elemento dialog + clienteHeight : altezza dell'icona
		const left = e.target.offsetLeft;
		const right = e.target.offsetLeft + e.target.clientWidth;
		// console.log('left : ', left);
		// console.log('right : ', right);
		// ottengo il centro dell'icona
		let centerElement = left + ((right - left) / 2);
		app.dialogPopup.innerHTML = e.currentTarget.getAttribute('data-popup-label');
		app.dialogPopup.style.display = 'block';
		// ottengo la metà del dialogPopup, la sua width varia a seconda di cosa c'è scritto dentro, quindi qui devo prima visualizzarlo (display: block) e dopo posso vedere la width
		const elementWidth = app.dialogPopup.offsetWidth / 2;
		// il dialogPopup verrà posizionato al centro dell'icona
		const xPosition = centerElement - elementWidth;

		app.dialogPopup.style.setProperty('--left', xPosition + "px");
		app.dialogPopup.style.setProperty('--top', yPosition + "px");
		app.dialogPopup.animate([
		  { transform: 'scale(.2)' },
		  { transform: 'scale(1.2)' },
		  { transform: 'scale(1)' }
		], { duration: 50, easing: 'ease-in-out' });
	}

	app.hidePopupDialog = () => app.dialogPopup.style.display = 'none';

	app.showPopup = (e) => {
		// const toast = document.getElementById('toast');
		// console.log('pageX : ', e.pageX);
		// console.log('pageY : ', e.pageY);
		// console.log('offset : ', e.offsetX);
		// console.log('screen : ', e.screenX);
		const yPosition = e.target.getBoundingClientRect().bottom + 10;
		const left = e.target.getBoundingClientRect().left;
		const right = e.target.getBoundingClientRect().right;
		// console.log('left : ', left);
		// console.log('right : ', right);
		// ottengo il centro dell'icona
		let centerElement = left + ((right - left) / 2);
		app.popup.innerHTML = e.currentTarget.getAttribute('data-popup-label');
		app.popup.style.display = 'block';
		// ottengo la metà del popup, la sua width varia a seconda di cosa c'è scritto dentro, quindi qui devo prima visualizzarlo (display: block) e dopo posso vedere la width
		const elementWidth = app.popup.offsetWidth / 2;
		// il popup verrà posizionato al centro dell'icona
		const xPosition = centerElement - elementWidth;

		app.popup.style.setProperty('--left', xPosition + "px");
		app.popup.style.setProperty('--top', yPosition + "px");
		app.popup.animate([
		  { transform: 'scale(.2)' },
		  { transform: 'scale(1.2)' },
		  { transform: 'scale(1)' }
		], { duration: 50, easing: 'ease-in-out' });

		// console.log(e.target.getBoundingClientRect().bottom);
		// console.log(e.target.getBoundingClientRect().left);
		// console.log(' : ', rect);
	}

	app.hidePopup = (e) => {app.popup.style.display = 'none';}

	// 2021-10-19 click sul report da processare/elaborare. tasto "Process Report"
 	app.handlerReportToBeProcessed = async (e) => {
		console.clear();
		const label = e.target.getAttribute('label');
		console.log(label);
		const reportId = +e.target.getAttribute('data-id');
		console.log('reportId : ', reportId);
		let jsonData = window.localStorage.getItem(label);
		let jsonDataParsed = JSON.parse(window.localStorage.getItem(label));
		console.dir(jsonDataParsed);
		console.dir(jsonData);
		console.dir(JSON.stringify(jsonData));
		debugger;
		// const url = 'ajax/cube.php';
		// const params = 'cube='+jsonData;
		// // console.dir(params);
		// debugger;
		// const init = {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, method: 'POST', body: params};
		// const req = new Request(url, init);
		App.handlerConsole('Process in corso', 'info');

		await fetch('/fetch_api/cube/' + jsonData + '/process')
		.then((response) => {
			if (!response.ok) { throw Error(response.statusText); }
			return response;
		})
		.then((response) => response.json())
		.then((data) => {
			// console.log(data);
			if (data) {
				console.info('FX creata con successo !');
				console.log('data : ', data);
				// NOTE: qui ho creato la FX, a questo punto potrei scegliere di visualizzare il report, per il momento mi serve solo la FX.
				// app.getDatamart(reportId, jsonDataParsed); // recupero i dati dalla FX appena creata
			} else {
				// TODO: no data
				console.debug('FX non è stata creata');
			}
		})
		.catch((err) => console.error(err));
	}

	// creo la lista degli elementi da processare
	app.datamartToBeProcessed = () => {
		const ul = document.getElementById('reportsProcess');
		const toProcess = StorageProcess.list(app.tmplList, ul);
		// associo la Fn che gestisce il click sulle <li>
		ul.querySelectorAll('li').forEach((li) => li.addEventListener('click', app.handlerReportToBeProcessed));
	}

	// recupero la FACT associata al cubo
	app.addFACTToHierList = (parent) => {
		const contentElement = app.tmplList.content.cloneNode(true);
		const section = contentElement.querySelector('section[data-icon-column][data-icon-filter');
		section.removeAttribute('hidden');
		section.className = 'fact';
		const element = section.querySelector('.element');
		const li = element.querySelector('li');
		const iColumns = element.querySelector("i[data-id='columns-icon']");
		const iFilter = element.querySelector("i[data-id='filter-icon']");
		iColumns.setAttribute('data-fact-name', StorageCube.selected.FACT);
		iColumns.setAttribute('data-fact-alias', StorageCube.selected.alias);
		iColumns.setAttribute('data-fact-schema', StorageCube.selected.schema);
		iFilter.setAttribute('data-fact-name', StorageCube.selected.FACT);
		iFilter.setAttribute('data-fact-alias', StorageCube.selected.alias);
		iFilter.setAttribute('data-fact-schema', StorageCube.selected.schema);
		iColumns.onclick = app.openDialogTables; // apre la dialog dialogTables per impostare gli alias e SQL per le colonne
		iFilter.onclick = app.openDialogFilters; // apre la dialog dialogFilter per impostare i filtri
		li.innerText = StorageCube.selected.FACT;
		li.label = StorageCube.selected.FACT;
		li.setAttribute('data-table-alias', StorageCube.selected.alias);
		li.setAttribute('data-schema', StorageCube.selected.schema);
		parent.appendChild(section);
	}

	// aggiungo la fact selezionata all'elenco delle tabelle nella dialogColumns
	app.addFACTToDialogColumns = (parent) => {
		// aggiungo la tabella FACT all'elenco 'fieldList-tables' > ul[data-id=fields-tables] 
		const contentElement = app.tmplList.content.cloneNode(true);
		const section = contentElement.querySelector('section[data-no-icon]');
		const element = section.querySelector('.element');
		const li = element.querySelector('li');
		section.setAttribute('data-label-search', StorageCube.selected.FACT);
		section.setAttribute('data-fact-name', StorageCube.selected.FACT);
		li.innerText = StorageCube.selected.FACT;
		li.setAttribute('label', StorageCube.selected.FACT);
		li.setAttribute('data-fact-alias', StorageCube.selected.alias);
		li.setAttribute('data-fact-schema', StorageCube.selected.schema);
		li.setAttribute('data-cube-name', StorageCube.selected.name);
		li.onclick = app.handlerFactSelectedDialogColumns;
		parent.appendChild(section);
	}

	// aggiungo la fact selezionata all'elenco delle tabelle nella dialogFilter
	app.addFACTToDialogFilters = (parent) => {
		// aggiungo la tabella FACT all'elenco 'filter-fieldList-tables' > ul[data-id=fields-tables]
		const contentElement = app.tmplList.content.cloneNode(true);
		const section = contentElement.querySelector('section[data-no-icon]');
		const element = section.querySelector('.element');
		const li = element.querySelector('li');
		section.setAttribute('data-label-search', StorageCube.selected.FACT);
		section.setAttribute('data-fact-name', StorageCube.selected.FACT);
		li.innerText = StorageCube.selected.FACT;
		li.setAttribute('label', StorageCube.selected.FACT);
		li.setAttribute('data-fact-alias', StorageCube.selected.alias);
		li.setAttribute('data-fact-schema', StorageCube.selected.schema);
		li.setAttribute('data-cube-name', StorageCube.selected.name);
		li.onclick = app.handlerTableSelectedDialogFilter;
		parent.appendChild(section);
	}

	// selezione di un cubo (step-1)
	app.handlerCubeSelected = (e) => {
		// const cubeId = e.currentTarget.getAttribute('data-cube-id');
		// const fieldType = e.currentTarget.getAttribute('data-list-type');
		StorageCube.selected = e.currentTarget.getAttribute('label');

		console.log('cube selected : ', StorageCube.selected.name);
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// Query.addFromCubes(StorageCube.selected.FACT);
			// visualizzo la <ul> contentente le dimensioni appartenenti al cubo selezionato
			document.querySelectorAll("#list-dimensions > section[data-cube-name='" + StorageCube.selected.name + "']").forEach((dimension) => {
				// console.log('Dimensioni del cubo selezionato : ', dimension);
				dimension.hidden = false;
				dimension.setAttribute('data-searchable', true);
			});
			/*
			// aggiungo la FACT al cubeSelected, questa mi serve per recuperare i filtri nella dialog-metrics che appartengono alla FACT
			StorageCube.addCube();
			// visualizzo la FACT nello step 3 Metrics
			document.querySelectorAll("ul[data-id='fields-tables'] > section[data-cube-name='" + StorageCube.selected.name + "']").forEach((table) => {
				table.hidden = false;
				table.toggleAttribute('data-searchable');
			});
			// aggiungo alla <ul> fields-hierarchies la FACT-alias-schema selezionata
			app.addFACTToHierList(document.querySelector('#tableList-hierarchies > ul'));
			app.addFACTToDialogColumns(document.querySelector('#fieldList-tables > ul'));
			app.addFACTToDialogFilters(document.querySelector('#filter-fieldList-tables > ul'));
			*/
		} else {
			// deselect cube
			document.querySelectorAll("ul[data-id='fields-dimensions'] > section[data-cube-name='" + StorageCube.selected.name + "']").forEach((table) => {
				table.hidden = true;
				table.toggleAttribute('data-searchable');
			});
			// nascondo la FACT nello step 3
			document.querySelectorAll("ul[data-id='fields-tables'] > section[data-cube-name='" + StorageCube.selected.name + "']").forEach((table) => {
				table.hidden = true;
				table.toggleAttribute('data-searchable');
			});
			StorageCube.deleteCube();
			// TODO: elimino la FACT dall'elenco #tableList-hierarchies > ul
		}
	}

	// selezione delle dimensioni
	app.handlerDimensionSelected = (e) => {
		Dim.selected = e.currentTarget.getAttribute('data-dimension-name');
		console.log('Dimensione selezionata : ', Dim.selected);
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			document.querySelectorAll("#list-hierarchies > section[data-dimension-name='" + Dim.selected.name + "']").forEach( (hier) => {
				hier.hidden = false;
				hier.setAttribute('data-searchable', true);
			});
			Query.factRelation = Dim.selected;
			// imposto, in un object le dimensioni selezionate, questo mi servirà nella dialog-metrics per visualizzare/nascondere solo i filtri appartenenti alle dimensioni selezionate
			// ... probabilmente mi servirà anche nella dialog-filter per lo stesso utilizzo
			Dim.add();
		} else {
			document.querySelectorAll("ul[data-id='fields-hierarchies'] > section[data-dimension-name='" + Dim.selected.name + "']").forEach((hier) => {
				hier.hidden = true;
				hier.removeAttribute('data-searchable');
			});
			// TODO: delete factRelation
			Query.deleteFactRelation(Dim.selected.name);
			Dim.delete();
		}
	}

	// selezione di un filtro già presente, lo salvo nell'oggetto Query
	app.handlerFilterSelected = (e) => {
		StorageFilter.filter = e.currentTarget.getAttribute('label');
		e.currentTarget.toggleAttribute('selected');
		Query.filterName = StorageFilter.filter.name;
		if (e.currentTarget.hasAttribute('selected')) {
			// recupero dallo storage il filtro selezionato
			console.log(StorageFilter.filter);
			// console.log('Query.table : ', Query.table);
			// console.log('Query.tableId : ', Query.tableId);
			Query.addTables(); // imposto la firstTable
			console.log(StorageFilter.filter.formula);
			// nel salvare il filtro nel report attuale devo impostarne anche l'alias della tabella selezionata nella dialog
			Query.filters = `${Query.tableAlias}.${StorageFilter.filter.formula}`;
		} else {
			// delete filter
			Query.deleteFilter();
		}
	}

	// selezione di una metrica già esistente, lo salvo nell'oggetto Query, come quando si salva un nuovo filtro dalla dialog
	app.handlerMetricSelected = (e) => {
		StorageMetric.metric = e.currentTarget.getAttribute('label');
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// aggiungo la metrica
			// recupero dallo StorageMetric la metrica selezionata
			console.log(StorageMetric.metric);
			console.log(StorageMetric.metric.name);
			console.log(StorageMetric.metric.formula);
			debugger;
			Query.metricName = StorageMetric.metric.name;
			// se la metrica contiene un filtro bisogna aggiungerla a Query.filteredMetrics altrimenti a Query.metrics
			if (StorageMetric.metric.formula[StorageMetric.metric.name].hasOwnProperty('filters')) {
				Query.filteredMetrics = StorageMetric.metric.formula[StorageMetric.metric.name];
			} else {
				Query.metrics = StorageMetric.metric.formula[StorageMetric.metric.name];
			}
		} else {
			// elimino la metrica
		}
	}

	// selezione della metrica, apro la dialog per impostare la metrica
	app.handlerSelectedMetricToSet = (e) => {
		Query.field = e.currentTarget.getAttribute('label');
		app.dialogMetric.querySelector('h4 > span').innerHTML = Query.field;
		app.dialogMetric.querySelector('section').setAttribute('data-table-selected', e.currentTarget.getAttribute('data-table-name'));
		app.dialogMetric.querySelector('section').setAttribute('data-table-selected-alias', e.currentTarget.getAttribute('data-table-alias'));

		// ul.querySelectorAll('.element').forEach((el) => {el.remove();});
		// carico elenco filtri presenti su tutte le tabelle che fanno parte di tutte le dimensioni selezionate
		// 1 new : per ogni tabella presente nelle dimensioni dei cubi selezionati, visualizzo l'elenco dei filtri presenti nello storage
		const content = app.tmplUlList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-filter']");
		const parent = document.getElementById('existsFilter_Metric'); // dove verrà inserita la <ul>
		// ripulisco la lista dei filtri
		if (parent.querySelector('ul')) parent.querySelector('ul').remove();
			// console.log('Dimensioni selezionate : ', Dim.selectedDimensions);
			for (const [dim, from] of Dim.selectedDimensions) {
				// delle dimensioni selezionate nel primo step, recupero la prop hierarchies per prendere le gerarchie, serve per inserire data-hier-name sul tag section
				Dim.selected = dim;
				for (const [hier, hierValue] of Object.entries(Dim.selected.hierarchies)) {
					console.log('hier : ', hier, hierValue.order);
					for (const [tableKey, order] of Object.entries(hierValue.order)) {
						const filters = StorageFilter.tableFilters(order.table); // split per il nome dello schema, qui prendo il nome della tabella
						filters.forEach((filter) => {
							const contentElement = app.tmplList.content.cloneNode(true);
							const section = contentElement.querySelector('section[data-no-icon]');
							const element = section.querySelector('.element');
							const li = element.querySelector('li');
							section.hidden = false;
							section.setAttribute('data-label-search', filter.name);
							section.setAttribute('data-table-name', order.table);
							section.setAttribute('data-dimension-name', dim);
							section.setAttribute('data-hier-name', hier);
							section.setAttribute('data-searchable', true);
							li.innerText = filter.name;
							li.setAttribute('label', filter.name);
							ul.appendChild(section);
							li.onclick = e => e.currentTarget.toggleAttribute('selected');
						});
						parent.appendChild(ul);
					}
				}
			}
		// oltre ai filtri presenti sulla dimensione/i selezionata, recupero anche quelli presenti sulla FACT
		console.log('cubeSelected : ', StorageCube.cubeSelected);
		for (let fact of StorageCube.cubeSelected) {
			const filters = StorageFilter.tableFilters(fact);
			filters.forEach((filter) => {
				const contentElement = app.tmplList.content.cloneNode(true);
				const section = contentElement.querySelector('section[data-no-icon]');
				const element = section.querySelector('.element');
				const li = element.querySelector('li');
				section.hidden = false;
				section.setAttribute('data-label-search', filter.name);
				section.setAttribute('data-table-name', fact);
				li.innerText = filter.name;
				li.setAttribute('label', filter.name);
				ul.appendChild(section);
				li.onclick = e => e.currentTarget.toggleAttribute('selected');
			});
		}
		app.dialogPopup = app.dialogMetric.querySelector('#dialog-popup');
		app.dialogMetric.showModal();
	}

	// selezione delle colonne nella dialogTables
	app.selectColumn = (e) => {
		e.currentTarget.toggleAttribute('selected');
		Query.table = e.currentTarget.getAttribute('data-table-name');
		Query.tableAlias = e.currentTarget.getAttribute('data-alias-name');
		Query.tableId = e.currentTarget.getAttribute('data-table-id');
		Query.field = e.currentTarget.getAttribute('data-label');
		if (!e.currentTarget.hasAttribute('selected')) {
			// TODO: colonna deselezionata, implementare la logica in Query.deleteSelect
			Query.deleteSelect();
		} else {
			// document.getElementById('columnName').value = e.currentTarget.getAttribute('data-label');
			document.getElementById('columnName').setAttribute('value', e.currentTarget.getAttribute('data-label'));
			document.getElementById('columnAlias').value = '';
			document.getElementById('columnName').focus();
			// imposto, nella section della dialog, l'attributo data-hier-name e data-dimension-name selezionata
			app.dialogTables.querySelector('section').setAttribute('data-hier-name', e.currentTarget.getAttribute('data-hier-name'));
			app.dialogTables.querySelector('section').setAttribute('data-dimension-name', e.currentTarget.getAttribute('data-dimension-name'));
		}
	}

	// selezione, dalla dialogColumns, della fact table. Visualizzo la prop 'columns' appartenente alla fact
	app.handlerFactSelectedDialogColumns = (e) => {
		Query.table = e.currentTarget.getAttribute('label');
		Query.tableAlias = e.currentTarget.getAttribute('data-fact-alias');
		StorageCube.selected = e.target.getAttribute('data-cube-name');
		// const FACT = StorageCube.selected.FACT;
		// const alias = StorageCube.selected.alias;
		// visualizzo le colonne mappate nel cubo selezionato
		const ul = app.dialogTables.querySelector('#table-fieldList > ul');
		for (const [table, fields] of Object.entries(StorageCube.selected.columns)) {
			for (let field in fields) {
				console.log('field : ', field);
				console.log('fields[field] : ', fields[field]);
				const contentElement = app.tmplList.content.cloneNode(true);
				const section = contentElement.querySelector('section[data-no-icon');
				const element = section.querySelector('.element');
				const li = element.querySelector('li');
				section.removeAttribute('hidden');
				section.setAttribute('data-label-search', field);
				section.setAttribute('data-table-name', Query.table);
				li.innerText = field;
				li.setAttribute('label', field);
				li.setAttribute('data-key', fields[field]);
				li.setAttribute('data-table-name', Query.table);
				li.setAttribute('data-table-alias', Query.tableAlias);
				ul.appendChild(section);
				li.onclick = app.selectColumn;
			}
		}
	}

	// selezione della tabella nella dialog-tables (columns)
	app.handlerTableSelected = (e) => {
		const dimension = e.currentTarget.getAttribute('data-dimension-name');
		Query.table = e.currentTarget.getAttribute('label');
		Query.tableAlias = e.currentTarget.getAttribute('data-table-alias');
		Query.tableId = e.currentTarget.getAttribute('data-table-id');
		const hier = e.currentTarget.getAttribute('data-hier-name');
		// deseleziono le precedenti tabelle selezionate
		// let activeDialog = document.querySelector('dialog[open]');
		if (app.dialogTables.querySelector('#fieldList-tables ul li[selected]')) {
			const li = app.dialogTables.querySelector('#fieldList-tables ul li[selected]');
			li.toggleAttribute('selected');
			// nascondo tutte le colonne che fanno parte della tabella precedentemente selezionata
			app.dialogTables.querySelectorAll("ul[data-id='fields-column'] > section[data-dimension-name='" + dimension + "'][data-hier-name='" + hier + "'][data-table-name='" + li.getAttribute('label') + "']").forEach((field) => {
				field.hidden = true;
				field.removeAttribute('data-searchable');
			});
		}
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// visualizzo le colonne appartenenti alla tabella selezionata
			app.dialogTables.querySelectorAll("ul[data-id='fields-column'] > section[data-dimension-name='" + dimension + "'][data-hier-name='" + hier + "'][data-table-name='" + Query.table + "']").forEach((field) => {
				field.hidden = false;
				field.setAttribute('data-searchable', true);
			});
		}
	}

	// selezione di una tabella nella dialog-filter
	app.handlerTableSelectedDialogFilter = (e) => {
		if (e.target.hasAttribute('data-hier-name')) {
			// query per visualizzare tutti i field della tabella
			// Visualizzazione dei filtri già creati appartenenti alla tabella selezionata
			const dimension = e.currentTarget.getAttribute('data-dimension-name');
			Query.table = e.currentTarget.getAttribute('label');
			Query.tableAlias = e.currentTarget.getAttribute('data-table-alias');
			Query.schema = e.currentTarget.getAttribute('data-schema');
			// debugger;
			Query.tableId = e.currentTarget.getAttribute('data-table-id');
			const hier = e.currentTarget.getAttribute('data-hier-name');
			// pulisco la <ul> della selezione precedente
			if (app.dialogFilter.querySelector('#filter-fieldList-tables ul li[selected]')) {
				const li = app.dialogFilter.querySelector('#filter-fieldList-tables ul li[selected]');
				li.toggleAttribute('selected');
				if (app.dialogFilter.querySelector('#fieldList-filter ul')) app.dialogFilter.querySelector('#fieldList-filter ul').remove();
				// nascondo tutti filtri che fanno parte della tabella precedentemente selezionata
				app.dialogFilter.querySelectorAll("ul[data-id='fields-filter'] > section[data-dimension-name='" + dimension + "'][data-hier-name='" + hier + "'][data-table-name='" + li.getAttribute('label') + "']").forEach((filter) => {
					filter.hidden = true;
					filter.removeAttribute('data-searchable');
				});
			}
			// visualizzo i filtri esistenti appartenenti alla tabella selezionata
			app.dialogFilter.querySelectorAll("ul[data-id='fields-filter'] > section[data-dimension-name='" + dimension + "'][data-hier-name='" + hier + "'][data-table-name='" + Query.table + "']").forEach((filter) => {
				filter.hidden = false;
				filter.setAttribute('data-searchable', true);
			});	
		} else {
			// FACT
			StorageCube.selected = e.target.getAttribute('data-cube-name');
			Query.table = e.currentTarget.getAttribute('label');
			Query.tableAlias = e.currentTarget.getAttribute('data-fact-alias');
			Query.schema = e.currentTarget.getAttribute('data-fact-schema');
			// nascondo i filtri che NON fanno parte della tabella selezionata
			if (app.dialogFilter.querySelector('#filter-fieldList-tables ul li[selected]')) {
				const li = app.dialogFilter.querySelector('#filter-fieldList-tables ul li[selected]');
				li.toggleAttribute('selected');
				if (app.dialogFilter.querySelector('#fieldList-filter ul')) app.dialogFilter.querySelector('#fieldList-filter ul').remove();
				app.dialogFilter.querySelectorAll("ul[data-id='fields-filter'] > section:not([data-fact-name])").forEach((filter) => {
					filter.hidden = true;
					filter.removeAttribute('data-searchable');
				});
			}
			// visualizzo i filtri esistenti appartenenti alla tabella selezionata
			// debugger;
			app.dialogFilter.querySelectorAll("ul[data-id='fields-filter'] > section[data-fact-name='" + Query.table + "']").forEach( (filter) => {
				filter.hidden = false;
				filter.setAttribute('data-searchable', true);
			});
		}		
		app.getFields();
		e.currentTarget.toggleAttribute('selected');
	}

	// selezione della FACT nella sezione metric
	app.handlerTableSelectedMetrics = (e) => {
		const fact = e.currentTarget.getAttribute('data-fact');
		const schema = e.currentTarget.getAttribute('data-schema');
		Query.tableAlias = e.currentTarget.getAttribute('data-table-alias');
		Query.from = `${schema}.${fact} AS ${Query.tableAlias}`;
		debugger;
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			document.querySelectorAll("ul[data-id='fields-metric'] > section[data-fact='" + fact + "']").forEach((metric) => {
				metric.hidden = false;
				metric.toggleAttribute('data-searchable');
			});
		} else {
			// deselezione
			document.querySelectorAll("ul[data-id='fields-metric'] > section[data-fact='" + fact + "']").forEach((metric) => {
				metric.hidden = true;
				metric.toggleAttribute('data-searchable');
			});
		}
	}

	// apertura dialog per impostare le colonne nel report
	app.openDialogColumns = (e) => {
		const hier = e.currentTarget.getAttribute('data-hier-name');
		const table = e.currentTarget.getAttribute('data-table-name');
		const dimension = e.currentTarget.getAttribute('data-dimension-name');
		app.dialogTables.querySelector('section').setAttribute('data-hier-name', hier);
		app.dialogTables.querySelector('section').setAttribute('data-dimension-name', dimension);
		// nascondo le tabelle NON appartenenti alla gerarchia selezionata
		app.dialogTables.querySelectorAll("#list-columns > section:not([data-table-name='" + table + "'])").forEach( (column) => {
			column.hidden = true;
			column.removeAttribute('data-searchable');
		});
		// visualizzo le tabelle appartenenti alla hier selezionata
		document.querySelectorAll("#list-columns > section[data-table-name='" + table + "']").forEach( (column) => {
			// console.log('tabelle appartententi alla gerarchia selezionata : ', table);
			column.hidden = false;
			// imposto l'elemento con l'attr 'searchable' in modo che il metodo SearchInSectionList cerca solo tra gli elementi che hanno questo attributo
			// senza questo attributo, il metodo cerca tra tutti gli elementi e quindi và a nascondere/visualizzare anche quelli appartenenti ad altre dimensioni/gerarchie/tabelle ecc...
			column.setAttribute('data-searchable', true);
		});
		app.dialogTables.showModal();
	}

	// selezione della tabella nello step Filter, visualizzo i filtri creati su questa tabella, recuperandoli dallo storage
	app.openDialogFilters = (e) => {
		if (!e.target.hasAttribute('data-fact-name')) {
			const hier = e.currentTarget.getAttribute('data-hier-name');
			const dimension = e.currentTarget.getAttribute('data-dimension-name');
			app.dialogFilter.querySelector('section').setAttribute('data-hier-name', hier);
			app.dialogFilter.querySelector('section').setAttribute('data-dimension-name', dimension);
			// nascondo le tabelle NON appartenenti alla hier selezionata
			app.dialogFilter.querySelectorAll("ul[data-id='fields-tables'] > section:not([data-dimension-name='" + dimension + "'][data-hier-name='" + hier + "'])").forEach( table => table.hidden = true);
			// visualizzo le tabelle appartenenti alla hier selezionata
			app.dialogFilter.querySelectorAll("ul[data-id='fields-tables'] > section[data-dimension-name='" + dimension + "'][data-hier-name='" + hier + "']").forEach((table) => {
				// console.log('tabelle appartententi alla gerarchia selezionata : ', table);
				table.hidden = false;
				// imposto l'elemento con l'attr 'searchable' in modo che il metodo SearchInSectionList cerca solo tra gli elementi che hanno questo attributo
				// senza questo attributo, il metodo cerca tra tutti gli elementi e quindi và a nascondere/visualizzare anche quelli appartenenti ad altre dimensioni/gerarchie/tabelle ecc...
				table.toggleAttribute('data-searchable');
			});
			// rimuovo, se già presente, la <ul> contenuto all'interno di #fieldList-filter per mostrare le colonne (recuperate dal DB) della tabella selezionata (esiste su selezione precedente)
			const listRef = app.dialogFilter.querySelector('#fieldList-filter');
			if (listRef.querySelector('ul')) listRef.querySelector('ul').remove();
			// visualizzo i filtri ESISTENTI della tabella selezionata
			// TODO: aggiungere anche la data-hier-name
			// document.querySelectorAll("ul[data-id='fields-filter'] > section[data-table-name='"+Query.table+"']").forEach( (filter) => {
			// 	filter.hidden = false;
			// 	// gli elementi appartenenti alla tabella, dimensione,gerarchia possono essere ricercati dalla input search
			// 	filter.toggleAttribute('data-searchable');
			// });
			// nascondo i filter NON appartenenti alla tabella selezionata
			// document.querySelectorAll("ul[data-id='fields-filter'] > section:not([data-table-name='"+Query.table+"'])").forEach( (filter) => {
			// 	filter.hidden = true;
			// 	// gli elementi nascosti non possono essere ricercati dalla input search
			// 	filter.removeAttribute('data-searchable');
			// });
		} else {
			// FACT
			const fact = e.currentTarget.getAttribute('data-fact-name');
			app.dialogFilter.querySelector('section').setAttribute('data-fact-name', fact);
			// visualizzo le tabelle appartenenti alla FACT selezionata
			app.dialogFilter.querySelectorAll("ul[data-id='fields-tables'] > section[data-fact-name='"+fact+"']").forEach((table) => {
				// console.log('tabelle appartententi alla gerarchia selezionata : ', table);
				table.hidden = false;
				// imposto l'elemento con l'attr 'searchable' in modo che il metodo SearchInSectionList cerca solo tra gli elementi che hanno questo attributo
				// senza questo attributo, il metodo cerca tra tutti gli elementi e quindi và a nascondere/visualizzare anche quelli appartenenti ad altre dimensioni/gerarchie/tabelle ecc...
				table.toggleAttribute('data-searchable');
			});
		}		
		app.dialogPopup = app.dialogFilter.querySelector('#dialog-popup');
		app.dialogFilter.showModal();
	}

	// selezione del field nella dialogFilter, questo metodo farà partire la query per ottenere i campi distinti (in getDistinctValues())
	app.handlerFilterFieldSelected = (e) => {
		// rimuovo eventuali altre selezioni precedenti
		debugger;
		const fieldList = app.dialogFilter.querySelector('#fieldList-filter');
		fieldList.querySelectorAll('ul li[selected]').forEach(element => element.toggleAttribute('selected'));
		e.currentTarget.toggleAttribute('selected');
		Query.field = e.target.getAttribute('label');
		Query.fieldType = e.target.getAttribute('data-type');
		Query.schema = e.currentTarget.getAttribute('data-schema');
		debugger;
		// inserisco il field selezionato nella textarea
		if (e.currentTarget.hasAttribute('selected')) {
			const listRef = app.dialogFilter.querySelector('#filter-valueList');
			if (listRef.querySelector('ul')) listRef.querySelector('ul').remove();
			app.getDistinctValues();
			const textarea = document.getElementById('filterSQLFormula');
			textarea.value = Query.field;
			textarea.focus();
		}
	}

  // carico elenco colonne dal DB da visualizzare nella dialogFilter
	app.getFields = async () => {
		// const url = '/report/table_info';
		// const params = 'tableName='+Query.table;
		// console.log('params : ', params);
		// const init = {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, method: 'POST', body: params};
		// const req = new Request(url, init);
		// debugger;

		await fetch('/fetch_api/' + Query.schema + '/schema/' + Query.table + '/table_info')
		  .then((response) => {
			if (!response.ok) { throw Error(response.statusText); }
			return response;
		  })
		  .then((response) => response.json())
		  .then((data) => {
			console.log(data);
			if (data) {
				// TODO: pulisco l'elenco dei campi
				// let ul = document.getElementById('fieldList-filter');
				const content = app.tmplUlList.content.cloneNode(true);
				const ul = content.querySelector("ul[data-id='fields-field']");
				const parent = document.getElementById('fieldList-filter'); // dove verrà inserita la <ul>
				// ul.querySelectorAll('section').forEach((el) => {el.remove();});
				for (const [key, value] of Object.entries(data)) {
					// console.log(key, value);
					const contentElement = app.tmplList.content.cloneNode(true);
					const section = contentElement.querySelector('section[data-no-icon]');
					const element = section.querySelector('.element');
					const li = element.querySelector('li');
					section.hidden = false;
					section.setAttribute('data-searchable', true);
					section.setAttribute('data-label', value.COLUMN_NAME);
					section.setAttribute('data-element-search', 'search-field-db');
					section.setAttribute('data-table-name', Query.table);
					li.innerText = value.COLUMN_NAME;
					li.setAttribute('data-schema', Query.schema);
					// scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
					let pos = value.DATA_TYPE.indexOf('('); // datatype
					let type = (pos !== -1) ? value.DATA_TYPE.substring(0, pos) : value.DATA_TYPE;
					li.setAttribute('data-type', type);
					li.setAttribute('label', value.COLUMN_NAME); // nome campo
					ul.appendChild(section);
					li.onclick = app.handlerFilterFieldSelected;
					parent.appendChild(ul);
				}
			} else {
				// TODO: no data
				console.debug('Dati non recuperati');
			}
		})
		  .catch((err) => console.error(err));
	}

	app.checkRelations = (hier) => {
		// recupero la prima tabella selezionata della gerarchia
		console.log(+Query.tables.tableId);
		debugger;

		for (const [k, order] of Object.entries(Dim.selected.hierarchies[hier].order)) {
			// recupero la property 'join' (nella dimensione) dove la key è maggiore della tableId al momento selezionata (Quindi recupero tutte le hier inferiori)
			if (+k >= +Query.tables.tableId) {
				Query.from = `${order.schema}.${order.table} AS ${order.alias}`;
				if (Dim.selected.hierarchies[hier].joins[order.alias]) {
					Query.joinId = +k;
					// debugger;
					Query.where = Dim.selected.hierarchies[hier].joins[order.alias];
				}
			}
		}
		// azzero #firstTable dopo aver creato la 'from' e 'where' per la hier selezionata

	}

	// tasto Fatto nella dialog Tables
	app.btnColumnDone.onclick = () => {
		// TODO: L'oggetto Query.select ora è popolato con le colonne scelte, da aggiungere al report. Popolo un div dove sono presenti le colonne scelte prima di chiudere la dialog.
		// console.log('Query.table : ', Query.table);
		// console.log('Query.tableId : ', Query.tableId);
		if (!app.dialogTables.querySelector('section').hasAttribute('data-fact-name')) {
			/*const hier = app.dialogTables.querySelector('section').getAttribute('data-hier-name');
			const list = document.getElementById('fieldList-tables');
			Dim.selected = app.dialogTables.querySelector('section').getAttribute('data-dimension-name');*/
			// recupero la property #select della classe Query per visualizzare nella <ul> #fields-set
			debugger;
			const ul = document.getElementById('report-columns');
			console.log('Query.select : ', Query.select);
			for (const [key, value] of Object.entries(Query.select)) {
				const contentElement = app.tmplList.content.cloneNode(true);
				const section = contentElement.querySelector('section[data-no-icon]');
				const element = section.querySelector('.element');
				const li = element.querySelector('li');
				section.hidden = false;
				section.setAttribute('data-label', key);
				section.setAttribute('data-element-search', 'search-fields-set');
				section.setAttribute('data-searchable', true);
				li.innerText = key;
				ul.appendChild(section);
			}
			// verifico quali relazioni inserire in where e quindi anche in from
			app.checkRelations(hier);
		} else {
			// FACT
			const ul = document.getElementById('fields-set');
			console.log('Query.select : ', Query.select);
			for (const [key, value] of Object.entries(Query.select)) {
				const contentElement = app.tmplList.content.cloneNode(true);
				const section = contentElement.querySelector('section[data-no-icon]');
				const element = section.querySelector('.element');
				const li = element.querySelector('li');
				section.hidden = false;
				section.setAttribute('data-element-search', 'search-fields-set')
				section.setAttribute('data-label', key);
				section.setAttribute('data-searchable', true);
				li.innerText = key;
				ul.appendChild(section);
			}
		}		
		app.dialogTables.close();
	}
	
	// salvataggio della metrica nel db
	app.saveMetricDB = async (json) => {
		console.log(json);
		console.log(JSON.stringify(json));
		// await fetch('/fetch_api/json/'+JSON.stringify(json)+'/table/bi_metrics/save')
		await fetch('/fetch_api/json/'+JSON.stringify(json)+'/metric_store')
		  .then((response) => {
			if (!response.ok) { throw Error(response.statusText); }
			return response;
		  })
		  .then((response) => response.json())
		  .then((data) => {
			// console.log(data);
			if (data) {
			  console.log('data : ', data);
			  console.log('METRICA SALVATA CORRETTAMENTE');
			  // NOTE: qui ho creato la FX, a questo punto potrei scegliere di visualizzare il report, per il momento mi serve solo la FX.
			  // app.getDatamart(reportId, jsonDataParsed); // recupero i dati dalla FX appena creata
			} else {
			  // TODO: no data
			  console.debug('ERRORE NEL SALVATAGGIO DELLA METRICA SU DB');
			}
		  })
		  .catch((err) => console.error(err));
	}

	// tasto 'fatto' nella dialogMetric, salvo la metrica impostata
	app.btnMetricDone.onclick = (e) => {
		const name = app.dialogMetric.querySelector('#metric-name').value;
		const alias = document.getElementById('alias-metric').value;
		const SQLFunction = document.querySelector('#sql-aggregation-list > li[selected]').getAttribute('label');
		const distinctOption = document.getElementById('checkbox-distinct').checked;
		Query.table = app.dialogMetric.querySelector('section').getAttribute('data-table-selected');
		// Query.tableAlias = app.dialogMetric.querySelector('section').getAttribute('data-table-selected-alias');
		Query.metricName = name;
		console.log(Query.metricName);
		//console.log(Query.table);
		// verifico se ci sono filtri da associare a questa metrica
		let associatedFilters = {};
		app.dialogMetric.querySelectorAll('#existsFilter_Metric > ul > section li[selected]').forEach((filterSelected) => {
			// set il nome del filtro
			StorageFilter.filter = filterSelected.getAttribute('label');
			// recupero dallo storage il contenuto del filtro per inserirlo in un object (quest'ultimo verrà inserito nella metrica)
			console.log(StorageFilter.filter.name);
			// debugger;
			// associatedFilters[filterSelected.getAttribute('label')] = StorageFilter.filter;
			associatedFilters[StorageFilter.filter.name] = StorageFilter.filter;
		});

		let metricObj = {};
		// se associatedFilters > 0 sarà una metrica filtrata, altrimenti una metrica a livello di report (senza nessun filtro all'interno della metrica)
		if (Object.keys(associatedFilters).length > 0) {
			// metrica filtrata
			console.info('metrica filtrata');
			debugger;
			Query.filteredMetrics = { SQLFunction, 'table': Query.table, 'field': Query.field, name, 'distinct': distinctOption, alias, 'filters': associatedFilters };

			console.log(Query.filteredMetrics);
			metricObj = { 'type': 'METRIC', name, 'formula': Query.filteredMetrics };
		} else {
			// metrica
			console.info('metrica non filtrata');
			debugger;
			Query.metrics = { SQLFunction, 'table': Query.table, 'field': Query.field, name, 'distinct': distinctOption, alias };
			// all'interno di 'formula' devo vedere se ci posso mettere l'object appena salvato in Query.metrics
			metricObj = { 'type': 'METRIC', name, 'formula': Query.metrics };
			//console.log(metricObj);
		}

		// salvo la nuova metrica nello storage
		console.log(metricObj)
		StorageMetric.save = metricObj
		// salvo nel DB
		app.saveMetricDB(metricObj);

		// storage.save = metricObj;

		app.dialogMetric.close();
	}

	// salvo il filtro nel DB, table : bi_filters
	app.saveFilterDB = async (json) => {
		console.log(json);
		console.log(JSON.stringify(json));
		// await fetch('/fetch_api/json/'+JSON.stringify(json)+'/table/bi_filters/save')
		await fetch('/fetch_api/json/'+JSON.stringify(json)+'/filter_store')
		  .then((response) => {
			if (!response.ok) { throw Error(response.statusText); }
			return response;
		  })
		  .then((response) => response.json())
		  .then((data) => {
			// console.log(data);
			if (data) {
			  console.log('data : ', data);
			  console.log('FILTRO SALVATO CORRETTAMENTE');
			  // NOTE: qui ho creato la FX, a questo punto potrei scegliere di visualizzare il report, per il momento mi serve solo la FX.
			  // app.getDatamart(reportId, jsonDataParsed); // recupero i dati dalla FX appena creata
			} else {
			  // TODO: no data
			  console.debug('ERRORE NEL SALVATAGGIO DEL FILTRO SU DB');
			}
		  })
		  .catch((err) => console.error(err));
	}

	// salvataggio del filtro impostato nella dialog
	app.btnFilterSave.onclick = (e) => {
		console.log(Query.table);
		debugger;
		const hier = app.dialogFilter.querySelector('section').getAttribute('data-hier-name');
		const dimension = app.dialogFilter.querySelector('section').getAttribute('data-dimension-name');
		// Filter save
		const textarea = document.getElementById('filterSQLFormula');
		let filterName = document.getElementById('inputFilterName');

		Query.filterName = filterName.value;

		// const formula = `${Query.table}.${textarea.value}`;
		// const formula = textarea.value;
		// console.log(formula);
		StorageFilter.save = { 'type': 'FILTER', 'name': filterName.value, /*'schema' : Query.schema,*/ 'table': Query.table, formula : textarea.value };
		// salvataggio di un filtro nel DB
		app.saveFilterDB({ 'type': 'FILTER', 'name': filterName.value, /*'schema' : Query.schema,*/ 'table': Query.table, formula : textarea.value });
		debugger;
		const existFilterRef = app.dialogFilter.querySelector('#existFilters');
		const ul = existFilterRef.querySelector("ul[data-id='fields-filter']");
		// const parent = document.getElementById('existFilters'); // dove verrà inserita la <ul>

		const contentElement = app.tmplList.content.cloneNode(true);
		const section = contentElement.querySelector('section[data-icon-edit');
		const element = section.querySelector('.element');
		const li = element.querySelector('li');
		const iEdit = element.querySelector('#edit-icon');
		section.hidden = false;
		section.setAttribute('data-label-search', Query.filterName);
		section.setAttribute('data-table-name', Query.table);
		section.setAttribute('data-hier-name', hier);
		section.setAttribute('data-dimension-name', dimension);
		li.innerText = Query.filterName;
		li.setAttribute('label', Query.filterName);
		iEdit.setAttribute("data-popup-label", "Modifica filtro");
		ul.appendChild(section);
		li.onclick = app.handlerFilterSelected;
		// reset del form
		filterName.value = "";
		filterName.focus();
		// pulisco la textarea
		textarea.value = "";
	}

	app.btnFilterDone.onclick = () => {
		// console.log(Query.filters);
		if (!app.dialogTables.querySelector('section').hasAttribute('data-fact-name')) {
			console.log('Query.table : ', Query.table);
			console.log('Query.tableId : ', Query.tableId);
			const hier = app.dialogFilter.querySelector('section').getAttribute('data-hier-name');
			const list = document.getElementById('fieldList-tables');
			Dim.selected = app.dialogFilter.querySelector('section').getAttribute('data-dimension-name');
			console.log(Query.filters);
			console.log(Query.filters[Query.table]);
			const ul = document.getElementById('filters-set');
			for (const [table, value] of Object.entries(Query.filters)) {
				for (let filter in Query.filters[table]) {
					const contentElement = app.tmplList.content.cloneNode(true);
					const section = contentElement.querySelector('section[data-no-icon]');
					const element = section.querySelector('.element');
					const li = element.querySelector('li');
					section.hidden = false;
					section.setAttribute('data-label', filter);
					section.setAttribute('data-element-search', 'search-filters-set');
					section.setAttribute('data-searchable', true);
					li.innerText = filter;
					ul.appendChild(section);
				}
			}

			// verifico quali relazioni inserire in where e quindi anche in from
			app.checkRelations(hier);
		} else {
			// FACT
			const ul = document.getElementById('filters-set');
			for (const [table, value] of Object.entries(Query.filters)) {
				for (let filter in Query.filters[table]) {
					const contentElement = app.tmplList.content.cloneNode(true);
					const section = contentElement.querySelector('section[data-no-icon]');
					const element = section.querySelector('.element');
					const li = element.querySelector('li');
					section.hidden = false;
					section.setAttribute('data-label-search', filter);
					li.innerText = filter;
					ul.appendChild(section);
				}
			}
		}
		app.dialogFilter.close();
	}

	// recupero valori distinti per inserimento nella dialogFilter
	app.getDistinctValues = async () => {
		// const url = 'report/distinct_values';
		// const params = 'table='+Query.table+'&field='+Query.field;
		// console.log('params : ', params);

		// const init = {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, method: 'POST', body: params};
		// const req = new Request(url, init);
		await fetch('fetch_api/schema/' + Query.schema + '/table/' + Query.table + '/field/' + Query.field + '/distinct_values')
			.then((response) => {
			if (!response.ok) { throw Error(response.statusText); }
				return response;
			})
			.then((response) => response.json())
			.then((data) => {
				// debugger;
				console.log(data);
				if (data) {
					const content = app.tmplUlList.content.cloneNode(true);
					const ul = content.querySelector("ul[data-id='fields-values']");
					const parent = document.getElementById('filter-valueList'); // dove verrà inserita la <ul>
					// pulisco la ul
					ul.querySelectorAll('section').forEach((item) => { item.remove(); });
					for (const [key, value] of Object.entries(data)) {
						const contentElement = app.tmplList.content.cloneNode(true);
						const section = contentElement.querySelector('section[data-no-icon');
						const element = section.querySelector('.element');
						const li = element.querySelector('li');
						section.hidden = false;
						section.setAttribute('data-label-search', value[Query.field]);
						// section.setAttribute('data-table-name', Query.table);
						li.innerText = value[Query.field];
						li.id = key;
						li.setAttribute('label', value[Query.field]);
						li.innerHTML = value[Query.field];
						ul.appendChild(section);
						li.onclick = app.handlerValueFilterSelected;
						parent.appendChild(ul);
					}
				} else {
					// TODO: no data
					console.warning('Dati non recuperati');
				}
			})
		.catch((err) => console.error(err));
	}

	// selezione di uno o più valori dalla lista dei valori della colonna in dialogFilter
	app.handlerValueFilterSelected = (e) => {
		const textarea = document.getElementById('filterSQLFormula');
		// aggiungo alla textarea il valore selezionato
		textarea.value += e.currentTarget.getAttribute('label');
		app.checkFilterForm();
	}

	// popolamento della lista delle tabelle nella dialog-filter
	app.getTablesInHierarchiesDialogFilter = () => {
		const content = app.tmplUlList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-tables']");
		const parent = document.getElementById('filter-fieldList-tables'); // dove verrà inserita la <ul> nella dialog Tables
		// per ogni dimensione, vado a leggere le hierarchies presenti, le ciclo per creare una <ul>, in sectionFields-tables, con le tabelle presenti nella gerarchia in ciclo
		for (const [dimName, dimValue] of (Object.entries(Dim.dimensions))) {
			console.log('dimName : ', dimName);
			// debugger;
			Dim.selected = dimName;
			// console.log('hierarchies : ', Dim.selected.hierarchies);
			for (const hier in Dim.selected.hierarchies) {
				for (const [key, order] of Object.entries(Dim.selected.hierarchies[hier]['order'])) {
					// ciclo le tabelle presenti nella gerarchia
					// console.log(key, order);
					const contentElement = app.tmplList.content.cloneNode(true);
					const section = contentElement.querySelector('section[data-no-icon]');
					const element = section.querySelector('.element');
					const li = element.querySelector('li');
					section.setAttribute('data-label', order.table); // utilizzabile per la ricerca dalla input sopra
					section.setAttribute('data-element-search', 'filters-table-list');
					section.setAttribute('data-dimension-name', dimName); // utilizzabile dalla dimensione + gerarchia selezionata
					section.setAttribute('data-hier-name', hier);
					li.innerText = order.table;
					li.setAttribute('data-table-id', key);
					li.setAttribute('label', order.table);
					li.setAttribute('data-table-alias', order.alias);
					// TODO: schema name
					li.setAttribute('data-schema', order.schema);
					li.setAttribute('data-dimension-name', dimName);
					li.setAttribute('data-hier-name', hier);
					li.onclick = app.handlerTableSelectedDialogFilter;
					ul.appendChild(section);
				}
				parent.appendChild(ul);
			}
		}
	}

	// recupero elenco di tutti i filtri presenti nello storage, per ogni dimensione e per ogni tabella FACT
	app.getFiltersInFrom = () => {
		const content = app.tmplUlList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-filter']");
		const parent = document.getElementById('existFilters'); // dove verrà inserita la <ul>
		// console.log('Dim.dimension : ', Dim.dimensions);
		// TODO: per avere il data-hier-name nel tag section (degli elementi da cercare) devo recuperare la table dalla property hierarchies.nomegerarchia.order, in questo modo posso aggiungere
		// section.setAttribute('data-hier-name', nomegerarchia);
		// L'unione di data-dimension-name+data-hier-name consentirà di evitare bug quando ci sono tabelle uguali in gerarchie diverse o in dimensioni diverse
		for (const [key, value] of (Object.entries(Dim.dimensions))) {
			// key : nome della dimensione
			// value : tutte le property della dimensione
			// console.log('key : ', key);
			// console.log('value : ', value.from);
			for (const [hier, hierValue] of Object.entries(value.hierarchies)) {
				// console.log('hier : ', hier, hierValue.order);
				for (const [tableKey, order] of Object.entries(hierValue.order)) {
					const filters = StorageFilter.tableFilters(order.table);
					// debugger;
					filters.forEach((filter) => {
						const contentElement = app.tmplList.content.cloneNode(true);
						const section = contentElement.querySelector('section[data-icon-edit]');
						const element = section.querySelector('.element');
						const li = element.querySelector('li');
						const iEdit = element.querySelector('#edit-icon');
						iEdit.setAttribute('data-popup-label', "Modifica filtro"); // TODO: aggiungere eventListener
						section.setAttribute('data-label', filter.name);
						section.setAttribute('data-element-search', 'search-exist-filters');
						section.setAttribute('data-table-name', order.table);
						section.setAttribute('data-dimension-name', key);
						section.setAttribute('data-hier-name', hier);
						li.innerText = filter.name;
						li.setAttribute('label', filter.name);
						ul.appendChild(section);
						li.onclick = app.handlerFilterSelected;
					});
					parent.appendChild(ul);
				}
			}
		}
		// fact
		console.log('cubes list : ', StorageCube.getLists());
		for (const [key, value] of Object.entries(StorageCube.getLists())) {
			console.log('key : ', key);
			console.log('value : ', value);
			const filters = StorageFilter.tableFilters(value.FACT);
			// debugger;
			filters.forEach((filter) => {
				const contentElement = app.tmplList.content.cloneNode(true);
				const section = contentElement.querySelector('section[data-icon-edit]');
				const element = section.querySelector('.element');
				const li = element.querySelector('li');
				const iEdit = element.querySelector('#edit-icon');
				iEdit.setAttribute('data-popup-label', "Modifica filtro"); // TODO: aggiungere eventListener
				section.setAttribute('data-label-search', filter.name);
				section.setAttribute('data-fact-name', value.FACT);
				li.innerText = filter.name;
				li.setAttribute('label', filter.name);
				ul.appendChild(section);
				li.onclick = app.handlerFilterSelected;
			});
		}
	}

	// popolamento della/e tabella FACT nello step 3 (metrics)
	app.getTables = () => {
		const content = app.tmplUlList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-tables']");
		const parent = document.getElementById('tableList-metric'); // dove verrà inserita la <ul>
		// creo un unica <ul> con dentro tutte le dimensioni, queste verranno filtrate quando si selezionano uno o più cubi
		// console.log('lista cubi : ', StorageCube.cubes); // tutta la lista dei cubi
		for (const [cubeName, cubeValue] of (Object.entries(StorageCube.cubes))) {
			// console.log('key : ', cubeName);
			// console.log('value : ', cubeValue); // tutto il contenuto del cubo
			// console.log('metriche : ', cubeValue.metrics);
			// console.log('metriche : ', cubeValue.FACT);
			// debugger;
			// per ogni cubo leggo la fact
			const contentElement = app.tmplList.content.cloneNode(true);
			const section = contentElement.querySelector('section[data-no-icon]');
			const element = section.querySelector('.element');
			const li = element.querySelector('li');
			section.setAttribute('data-label-search', cubeValue.FACT); // questo attr consente la ricerca dalla input sopra
			// section.setAttribute('data-schema', cubeValue.schema);
			section.setAttribute('data-cube-name', cubeName); // questo attr consente la ricerca dalla selezione del cubo
			li.innerText = cubeValue.FACT;
			li.setAttribute('data-fact', cubeValue.FACT);
			li.setAttribute('data-schema', cubeValue.schema);
			li.setAttribute('data-table-alias', cubeValue.alias);
			li.setAttribute('label', cubeValue.FACT);
			ul.appendChild(section);
			li.onclick = app.handlerTableSelectedMetrics;
			parent.appendChild(ul);
		}
	}

	// elenco di tutte le metriche impostate all'interno del cubo, queste sono le metriche che si possono impostare, quindi mettere la funzione (SUM, AVG, ecc...), il distinct e l'alias
	app.getMetricsInCubes = () => {
		const content = app.tmplUlList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-metric']");
		const parent = document.getElementById('metrics'); // dove verrà inserita la <ul>
		// creo un unica <ul> con dentro tutte le dimensioni, queste verranno filtrate quando si selezionano uno o più cubi
		// console.log('lista cubi : ', StorageCube.cubes); // tutta la lista dei cubi
		for (const [cubeName, cubeValue] of (Object.entries(StorageCube.cubes))) {
			// per ogni FACT aggiungo l'elenco delle metriche impostate sul cubo nel div #metrics
			cubeValue.metrics[cubeValue.FACT].forEach((metric) => {
				// console.log('metric : ', metric);
				const contentElement = app.tmplList.content.cloneNode(true);
				const section = contentElement.querySelector('section[data-no-icon]');
				const element = section.querySelector('.element');
				const li = element.querySelector('li');
				section.setAttribute('data-label-search', metric); // questo attr consente la ricerca dalla input sopra
				section.setAttribute('data-fact', cubeValue.FACT); // questo attr consente la ricerca dalla selezione del cubo
				li.innerText = metric;
				li.setAttribute('label', metric);
				li.setAttribute('data-table-name', cubeValue.FACT);
				li.setAttribute('data-table-alias', cubeValue.alias);
				ul.appendChild(section);
				li.onclick = app.handlerSelectedMetricToSet; // metrica da impostare
				parent.appendChild(ul);
			});
		}
	}

	// recupero tutte le metriche esistenti dallo storage, per tutti i cubi. Queste sono le metriche che sono state già impostate e quindi si possono già utilizzare nel report che si sta creando
	app.getMetrics = () => {
		const content = app.tmplUlList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-metric']");
		const parent = document.getElementById('existMetrics'); // dove verrà inserita la <ul>
		// creo un unica <ul> con dentro tutte le dimensioni, queste verranno filtrate quando si selezionano uno o più cubi
		// console.log('lista cubi : ', StorageCube.cubes); // tutta la lista dei cubi
		for (const [cubeName, cubeValue] of (Object.entries(StorageCube.cubes))) {
			// console.log('StorageMetric : ', StorageMetric.metrics);
			for (const [metricName, metric] of Object.entries(StorageMetric.metrics)) {
				const contentElement = app.tmplList.content.cloneNode(true);
				const section = contentElement.querySelector('section[data-no-icon]');
				const element = section.querySelector('.element');
				const li = element.querySelector('li');
				section.setAttribute('data-label-search', metricName); // questo attr consente la ricerca dalla input sopra
				section.setAttribute('data-fact', cubeValue.FACT); // questo attr consente la ricerca dalla selezione del cubo
				section.setAttribute('data-table-alias', cubeValue.alias);
				li.innerText = metricName;
				li.setAttribute('label', metricName);
				ul.appendChild(section);
				li.onclick = app.handlerMetricSelected;
				parent.appendChild(ul);
			}
		}
	}

	app.getCubes();

	app.getDimensions();

	app.getHierarchies();

	app.getColumns();

	/*app.getTablesInHierarchiesDialogFilter();

	app.getColumnsInTable();

	app.getFiltersInFrom();

	app.getTables();

	app.getMetricsInCubes();

	app.getMetrics();*/

	app.datamartToBeProcessed();

	// abilito il tasto btnFilterSave se il form per la creazione del filtro è corretto
	app.checkFilterForm = () => {
		const filterName = document.getElementById('inputFilterName');
		const filterFormula = document.getElementById('filterSQLFormula');
		((filterName.value.length !== 0) && (filterFormula.value.length !== 0)) ? app.btnFilterSave.disabled = false : app.btnFilterSave.disabled = true;
	}

	// selezione di un operatore logica da inserire nella formula (AND, OR, NOT, ecc...)
	app.handlerLogicalOperatorSelected = (e) => {
		// TODO: e.currentTarget
		console.log(e.target);
		e.target.toggleAttribute('selected');
		const textarea = document.getElementById('filterFormula');
		let span = document.createElement('span');
		span.className = 'formulaLogicalOperator';
		span.innerText = e.target.getAttribute('label');
		textarea.appendChild(span);
	}
	/* events */

	app.checkSelection = () => {
		// TODO: devo sapere in quale step mi trovo per poter verificare se sono stati selezionati gli elementi per proseguire
		const activeStep = document.querySelector('.step[selected]');
		const dataStep = +activeStep.getAttribute('data-step');
		switch (dataStep) {
			case 1:
				// cubi e dimensioni
				if (StorageCube.cubeSelected.size === 0) {
					App.handlerConsole('Cubo non selezionato', 'warning');
					return false;
				}
				if (Dim.selectedDimensions.size === 0) {
					App.handlerConsole('Dimensione non selezionata', 'warning');
					return false;
				}
				break;
			case 2:
				// colonne/filtri
				// deve essere selezionata almeno una colonna per proseguire
				if (Object.keys(Query.select).length === 0) {
					App.handlerConsole('Selezionare almeno un livello dimensionale', 'warning')
					return false;
				}
				break;
		  default:
		  // step 3
		}
		return true;
	}

	app.btnPreviousStep.onclick = () => Step.previous();

	app.btnNextStep.onclick = () => {
		// verifica selezioni cubo e dimensioni
		// console.log('return check : ', app.checkSelection());
		Step.next();
		// if (app.checkSelection()) Step.next();
	}

	// aggiungi colonne (step-2)
	app.btnAddColumns.onclick = (e) => {
		console.log('addColumns');
		// verifico che almeno una gerarchia è stata selezionata
		const hierSelectedCount = document.querySelectorAll('#list-hierarchies section[selected]').length;
		if (hierSelectedCount === 0) {
			App.handlerConsole('Selezionare una gerarchia per poter aggiungere colonne al report', 'warning');
			return;
		} else {
			// TODO: recupero le gerarchie selezionate
			const hierSelected = document.querySelectorAll('#list-hierarchies section[selected]');
			// TODO: per ogni gerarchia selezionata aggiungo le tabelle e le colonne in una lista
			app.dialogTables.showModal();


		}

		// TODO: apro la dialog, oppure un form, per completare l'aggiunta di nuove colonne
	}

	// tasto completato nello step 4, // dialog per il salvataggio del nome del report
	/*app.btnStepDone.onclick = (e) => {
		app.dialogSaveReport.showModal();
		// sulla dialog imposto la modalità di salvataggio tra process/report, se impostato su process salvo, dal tasto OK, il process del report, altrimenti salvo il report con tutte le sue opzioni
		app.dialogSaveReport.setAttribute('mode', 'process');
	}*/

	// salvo il process nel DB
	app.saveProcess = async () => {
		console.log(JSON.stringify(Query.reportProcessStringify));
		// await fetch('/fetch_api/json/'+JSON.stringify(Query.reportProcessStringify)+'/table/bi_processes/save')
		await fetch('/fetch_api/json/'+JSON.stringify(Query.reportProcessStringify)+'/process_store')
		  .then((response) => {
			if (!response.ok) { throw Error(response.statusText); }
			return response;
		  })
		  .then((response) => response.json())
		  .then((data) => {
			// console.log(data);
			if (data) {
			  console.log('data : ', data);
			  console.log('PROCESS SALVATO CORRETTAMENTE');
			  // NOTE: qui ho creato la FX, a questo punto potrei scegliere di visualizzare il report, per il momento mi serve solo la FX.
			  // app.getDatamart(reportId, jsonDataParsed); // recupero i dati dalla FX appena creata
			} else {
			  // TODO: no data
			  console.debug('PROCESS non salvato nel DB');
			}
		  })
		  .catch((err) => console.error(err));
	}

	// salvo il report da processare
	app.btnSaveReportDone.onclick = () => {
		// console.dir(Query);
		// debugger;
		// aggiungo, nella from, il cubo selezionato nel primo step
		// salvo temporaneamente la query da processare nello storage

		// ottengo un processId per passarlo a costruttore
		// const processId = StorageProcess.getIdAvailable();
		const processId = Date.now();
		const name = document.getElementById('reportName').value;

		// il datamart sarà creato come FX_processId
		Query.save(processId, name);
		app.saveProcess();
		// TODO: salvataggio nel database tabella : bi_processes
		// aggiungo il report da processare nella list 'reportProcessList'
		const ulReportsProcess = document.getElementById('reportsProcess');
		let tmplContent = app.tmplList.content.cloneNode(true);
		let element = tmplContent.querySelector('.element');
		let li = element.querySelector('li');
		li.innerText = name;
		li.setAttribute('label', name);
		li.setAttribute('data-id', processId);
		ulReportsProcess.appendChild(element);
		li.onclick = app.handlerReportToBeProcessed;
		app.dialogSaveReport.close();
	}

	// visualizzo la lista dei report da processare
	app.btnProcessReport.onclick = () => {
		const listReportProcess = document.getElementById('reportProcessList');
		listReportProcess.toggleAttribute('hidden');
	}

	/*document.addEventListener('input', (e) => {
		// console.log('currentTarget : ', e.target);
		if (e.target.hasAttribute('type') && e.target.getAttribute('type') === 'search') {
		  e.target.oninput = App.searchInSectionList;
		}
	});*/

	// document.getElementById('columnSQL').oninput = () => {
	// 	if (Array.from(document.querySelectorAll('#fieldList-tables ul li[selected]')).length === 0) {
	// 		// non ci sono tabelle selezionate
	// 		App.handlerConsole('Selezionare almeno una tabella', 'warning');
	// 	}
	// };

	// eventi mouseEnter/Leave su tutte le icon con l'attributo data-popup-label
	document.querySelectorAll('i[data-popup-label]').forEach((icon) => {
		icon.onmouseenter = app.showPopup;
		icon.onmouseleave = app.hidePopup;
	});

	document.querySelectorAll('dialog i[data-popup-label').forEach((icon) => {
		icon.onmouseenter = app.showPopupDialog;
		icon.onmouseleave = app.hidePopupDialog;
	});

	document.getElementById('columnAlias').oninput = (e) => {
		(e.target.value.length === 0) ? app.btnSaveColumn.disabled = true : app.btnSaveColumn.disabled = false;
	};

	document.getElementById('columnName').oninput = (e) => {
		(e.target.value.length === 0) ? app.btnSaveColumn.disabled = true : app.btnSaveColumn.disabled = false;
	}

	app.checkDialogMetric = () => {
		const metricName = document.getElementById('metric-name').value;
		const aliasMetric = document.getElementById('alias-metric').value;
		(metricName.length !== 0 && aliasMetric.length !== 0) ? app.btnMetricDone.disabled = false : app.btnMetricDone.disabled = true;
	}

	document.getElementById('alias-metric').oninput = () => app.checkDialogMetric();

	document.getElementById('metric-name').oninput = () => app.checkDialogMetric();

	document.getElementById('inputFilterName').oninput = () => app.checkFilterForm();

	document.getElementById('filterSQLFormula').oninput = () => app.checkFilterForm();

	// funzioni di aggregazione da selezionare nella dialogMetrics
	app.aggregationFunction.onclick = (e) => {
		// deseleziono altre funzioni di aggregazione precedentemente selezionate e seleziono quella e.target
		e.path[1].querySelector('li[selected]').toggleAttribute('selected');
		// console.log('e.target : ', e.target.toggleAttribute('selected'))
		e.target.toggleAttribute('selected');
	}

	// Salva nella dialogTables
	app.btnSaveColumn.onclick = (e) => {
		const hier = app.dialogTables.querySelector('section').getAttribute('data-hier-name');
		Dim.selected = app.dialogTables.querySelector('section').getAttribute('data-dimension-name');
		
		Query.columnName = document.getElementById('columnName').value;
		const alias = document.getElementById('columnAlias').value;
		const textarea = (document.getElementById('columnSQL').value.length === 0) ? null : document.getElementById('columnSQL').value;
		Query.select = { table: Query.table, tableAlias : Query.tableAlias, field: Query.field, SQL: textarea, alias };
		debugger;
		Query.addTables(hier);

		// verifico quali relazioni inserire in where e quindi anche in from
		app.checkRelations(hier);
		document.getElementById('columnAlias').value = '';
	}

	app.btnMapping.onclick = () => location.href = '/mapping';

	app.btnBackPage.onclick = () => window.location.href = '/';

	// NOTE: esempio di utilizzo di MutationObserver
	const columnName = document.getElementById('columnName');
    // create a new instance of `MutationObserver` named `observer`,
	// passing it a callback function
	const observer = new MutationObserver(function() {
	    console.log('callback that runs when observer is triggered');
	    // debugger;
	    // console.log(fields);
	    (columnName.value.length > 0) ? columnName.parentElement.querySelector('label').classList.add('has-content') : columnName.parentElement.querySelector('label').classList.remove('has-content');
	});
	// call `observe()` on that MutationObserver instance,
	// passing it the element to observe, and the options object
	observer.observe(columnName, {subtree: true, childList: true, attributes: true})

})();
