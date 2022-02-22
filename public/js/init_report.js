var App = new Application();
var Query = new Queries();
const Dim = new DimensionStorage();
var StorageCube = new CubeStorage();
var StorageProcess = new ProcessStorage();
var StorageFilter = new FilterStorage();
var StorageMetric = new MetricStorage();

(() => {
	App.init();
	// console.info('Date.now() : ', Date.now());

	// la Classe Steps deve impostare alcune proprietà DOPO che viene visualizzato il body, non può essere posizionato prima di App.init();
	var Step = new Steps('stepTranslate');

	var app = {
		// templates
		tmplUlList: document.getElementById('template_ulList'), // contiene le <ul>
		tmplList: document.getElementById('templateList'), // contiene i section

		// popup
		popup: document.getElementById('popup'),
		dialogPopup: null,

		// btn		
		btnPreviousStep: document.getElementById('stepPrevious'),
		btnNextStep: document.getElementById('stepNext'),
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
	};

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
	};

	app.hidePopup = (e) => {app.popup.style.display = 'none';};

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
	};

	// creo la lista degli elementi da processare
	app.datamartToBeProcessed = () => {
		const ul = document.getElementById('reportsProcess');
		const toProcess = StorageProcess.list(app.tmplList, ul);
		// associo la Fn che gestisce il click sulle <li>
		ul.querySelectorAll('li').forEach((li) => li.addEventListener('click', app.handlerReportToBeProcessed));
	};

	app.handlerCubeSelected = (e) => {
		// const cubeId = e.currentTarget.getAttribute('data-cube-id');
		// const fieldType = e.currentTarget.getAttribute('data-list-type');
		StorageCube.selected = e.currentTarget.getAttribute('label');

		console.log('cube selected : ', StorageCube.selected.name);
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// Query.addFromCubes(StorageCube.selected.FACT);
			// visualizzo la <ul> contentente le dimensioni appartenenti al cubo selezionato
			document.querySelectorAll("ul[data-id='fields-dimensions'] > section[data-cube-name='" + StorageCube.selected.name + "']").forEach((dimension) => {
				// console.log('Dimensioni del cubo selezionato : ', dimension);
				dimension.hidden = false;
				dimension.toggleAttribute('data-searchable');
			});
			// aggiungo la FACT al cubeSelected, questa mi serve per recuperare i filtri nella dialog-metrics che appartengono alla FACT
			StorageCube.addCube();
			// visualizzo la FACT nello step 3 Metrics
			document.querySelectorAll("ul[data-id='fields-tables'] > section[data-cube-name='" + StorageCube.selected.name + "']").forEach((table) => {
				table.hidden = false;
				table.toggleAttribute('data-searchable');
			});
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
		}
	};

	// selezione delle dimensioni
	app.handlerDimensionSelected = (e) => {
		Dim.selected = e.currentTarget.getAttribute('data-dimension-name');
		console.log('Dimensione selezionata : ', Dim.selected);
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			document.querySelectorAll("ul[data-id='fields-hierarchies'] > section[data-dimension-name='" + Dim.selected.name + "']").forEach((hier) => {
			hier.hidden = false;
			hier.toggleAttribute('data-searchable');
			});
			Query.factRelation = Dim.selected;
			// imposto, in un object le dimensioni selezionate, questo mi servirà nella dialog-metrics per visualizzare/nascondere solo i filtri appartenenti alle dimensioni selezionate
			// ... probabilmente mi servirà anche nella dialog-filter per lo stesso utilizzo
			Dim.add();
		} else {
			document.querySelectorAll("ul[data-id='fields-hierarchies'] > section[data-dimension-name='" + Dim.selected.name + "']").forEach((hier) => {
				hier.hidden = true;
				hier.toggleAttribute('data-searchable');
			});
			// TODO: delete factRelation
			Query.deleteFactRelation(Dim.selected.name);
			Dim.delete();
		}
	};

	// selezione della gerarchia
	app.handlerHierSelected = (e) => {
		debugger;
		const hier = e.currentTarget.getAttribute('data-hier-name');
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			document.querySelectorAll("ul[data-id='fields-tables'] > section[data-hier-name='" + hier + "']").forEach((table) => {
				// console.log('tabelle appartententi alla gerarchia selezionata : ', table);
				table.hidden = false;
				// imposto l'elemento con l'attr 'searchable' in modo che il metodo SearchInSectionList cerca solo tra gli elementi che hanno questo attributo
				// senza questo attributo, il metodo cerca tra tutti gli elementi e quindi và a nascondere/visualizzare anche quelli appartenenti ad altre dimensioni/gerarchie/tabelle ecc...
				table.toggleAttribute('data-searchable');
			});
		} else {
			// deselezionata la gerarchia
			document.querySelectorAll("ul[data-id='fields-tables'] > section[data-hier-name='" + hier + "']").forEach((table) => {
				table.hidden = true;
				table.toggleAttribute('data-searchable');
			});
		}
	};

	// selezione di un filtro già esistente, lo salvo nell'oggetto Query, come quando si salva un nuovo filtro dalla dialog
	app.handlerFilterSelected = (e) => {
		StorageFilter.filter = e.currentTarget.getAttribute('label');

		e.currentTarget.toggleAttribute('selected');
		Query.filterName = StorageFilter.filter.name;
		if (e.currentTarget.hasAttribute('selected')) {
			// recupero dallo storage il filtro selezionato
			console.log(StorageFilter.filter);
			console.log('Query.table : ', Query.table);
			console.log('Query.tableId : ', Query.tableId);
			Query.addTables();
			console.log(StorageFilter.filter.formula);
			debugger;
			Query.filters = StorageFilter.filter.formula;
		} else {
			// delete filter
			Query.deleteFilter();
		}
	};

	// selezione di una metrica già esistente, lo salvo nell'oggetto Query, come quando si salva un nuovo filtro dalla dialog
	app.handlerMetricSelected = (e) => {
		StorageMetric.metric = e.currentTarget.getAttribute('label');
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// aggiungo la metrica
			// recupero dallo StorageMetric la metrica selezionata
			debugger;
			console.log(StorageMetric.metric);
			console.log(StorageMetric.metric.name);
			console.log(StorageMetric.metric.formula);
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
	};

	// selezione della metrica, apro la dialog per impostare la metrica
	app.handlerSelectedMetricToSet = (e) => {
		Query.field = e.currentTarget.getAttribute('label');
		app.dialogMetric.querySelector('h4 > span').innerHTML = Query.field;
		app.dialogMetric.querySelector('section').setAttribute('data-table-selected', e.currentTarget.getAttribute('data-table-name'));

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
					for (const [tableKey, table] of Object.entries(hierValue.order)) {
						const filters = StorageFilter.tableFilters(table.split('.')[1]); // split per il nome dello schema, qui prendo il nome della tabella
						filters.forEach((filter) => {
							const contentElement = app.tmplList.content.cloneNode(true);
							const section = contentElement.querySelector('section[data-no-icon]');
							const element = section.querySelector('.element');
							const li = element.querySelector('li');
							section.hidden = false;
							section.setAttribute('data-label-search', filter.name);
							section.setAttribute('data-table-name', table);
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
	};

	// selezione della tabella nella sezione Column
	app.openDialogTables = (e) => {
		const hier = e.currentTarget.getAttribute('data-hier-name');
		const dimension = e.currentTarget.getAttribute('data-dimension-name');
		app.dialogTables.querySelector('section').setAttribute('data-hier-name', hier);
		app.dialogTables.querySelector('section').setAttribute('data-dimension-name', dimension);
		// visualizzo le tabelle appartenenti alla hier selezionata
		app.dialogTables.querySelectorAll("ul[data-id='fields-tables'] > section[data-dimension-name='" + dimension + "'][data-hier-name='" + hier + "']").forEach((table) => {
			// console.log('tabelle appartententi alla gerarchia selezionata : ', table);
			table.hidden = false;
			// imposto l'elemento con l'attr 'searchable' in modo che il metodo SearchInSectionList cerca solo tra gli elementi che hanno questo attributo
			// senza questo attributo, il metodo cerca tra tutti gli elementi e quindi và a nascondere/visualizzare anche quelli appartenenti ad altre dimensioni/gerarchie/tabelle ecc...
			table.toggleAttribute('data-searchable');
		});
		app.dialogTables.showModal();
	};

	app.selectColumn = (e) => {
		console.log('e.currentTarget : ', e.currentTarget);
		e.currentTarget.toggleAttribute('selected');
		Query.field = e.currentTarget.getAttribute('label');
		if (!e.currentTarget.hasAttribute('selected')) {
			// deselezionato
			Query.deleteSelect();
			// Query.deleteGroupBy();
		} else {
			// selezionato
			document.getElementById('columnName').value = "";
			document.getElementById('columnName').focus();
			document.getElementById('columnAlias').value = "";
		}
	};

	app.handlerTableSelected = (e) => {
		const dimension = e.currentTarget.getAttribute('data-dimension-name');
		Query.table = e.currentTarget.getAttribute('label');
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
				field.toggleAttribute('data-searchable');
			});
		}
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// visualizzo le colonne appartenenti alla tabella selezionata
			app.dialogTables.querySelectorAll("ul[data-id='fields-column'] > section[data-dimension-name='" + dimension + "'][data-hier-name='" + hier + "'][data-table-name='" + Query.table + "']").forEach((field) => {
				field.hidden = false;
				field.toggleAttribute('data-searchable');
			});
		}
	};

	// selezione di una tabella nella dialog-filter
	app.handlerTableSelectedDialogFilter = (e) => {
		const dimension = e.currentTarget.getAttribute('data-dimension-name');
		Query.table = e.currentTarget.getAttribute('label');
		Query.schema = e.currentTarget.getAttribute('data-schema');
		// debugger;
		Query.tableId = e.currentTarget.getAttribute('data-table-id');
		const hier = e.currentTarget.getAttribute('data-hier-name');
		// pulisco la <ul> della selezione precedente
		if (app.dialogFilter.querySelector('#filter-fieldList-tables ul li[selected]')) {
			const li = app.dialogFilter.querySelector('#filter-fieldList-tables ul li[selected]');
			li.toggleAttribute('selected');
			debugger;
			app.dialogFilter.querySelector('#fieldList-filter ul').remove();
			// nascondo tutti filtri che fanno parte della tabella precedentemente selezionata
			app.dialogFilter.querySelectorAll("ul[data-id='fields-filter'] > section[data-dimension-name='" + dimension + "'][data-hier-name='" + hier + "'][data-table-name='" + li.getAttribute('label') + "']").forEach((filter) => {
				filter.hidden = true;
				filter.toggleAttribute('data-searchable');
			});
		}
		// TODO: visualizzo i filtri esistenti appartenenti alla tabella selezionata
		debugger;
		app.dialogFilter.querySelectorAll("ul[data-id='fields-filter'] > section[data-dimension-name='" + dimension + "'][data-hier-name='" + hier + "'][data-table-name='" + `${Query.schema}.${Query.table}` + "']").forEach((filter) => {
			filter.hidden = false;
			filter.toggleAttribute('data-searchable');
		});
		app.getFields();
		e.currentTarget.toggleAttribute('selected');
	};

	// selezione della FACT nella sezione metric
	app.handlerTableSelectedMetrics = (e) => {
		const fact = e.currentTarget.getAttribute('data-fact');
		const schema = e.currentTarget.getAttribute('data-schema');
		Query.from = `${schema}.${fact}`;
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
	};

	// selezione della tabella nello step Filter, visualizzo i filtri creati su questa tabella, recuperandoli dallo storage
	app.openDialogFilters = (e) => {
		const hier = e.currentTarget.getAttribute('data-hier-name');
		const dimension = e.currentTarget.getAttribute('data-dimension-name');
		app.dialogFilter.querySelector('section').setAttribute('data-hier-name', hier);
		app.dialogFilter.querySelector('section').setAttribute('data-dimension-name', dimension);
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
		app.dialogPopup = app.dialogFilter.querySelector('#dialog-popup');
		app.dialogFilter.showModal();
	};

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
	};

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
					section.setAttribute('data-label-search', value.COLUMN_NAME);
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
	};

	app.checkRelations = (hier) => {
		// recupero la prima tabella selezionata della gerarchia
		console.log(+Query.tables.tableId);
		// debugger;

		for (const [k, table] of Object.entries(Dim.selected.hierarchies[hier].order)) {
			// recupero la property 'join' (nella dimensione) dove la key è maggiore della tableId al momento selezionata (Quindi recupero tutte le hier inferiori)
			if (+k >= +Query.tables.tableId) {
				Query.from = table;
				if (Dim.selected.hierarchies[hier].joins[table.split('.')[1]]) {
					Query.joinId = +k;
					// debugger;
					Query.where = Dim.selected.hierarchies[hier].joins[table.split('.')[1]];
				}
			}
		}
	};

	// "Fatto" nella dialog Tables
	app.btnColumnDone.onclick = () => {
		// console.log('Query.table : ', Query.table);
		// console.log('Query.tableId : ', Query.tableId);
		const hier = app.dialogTables.querySelector('section').getAttribute('data-hier-name');
		const list = document.getElementById('fieldList-tables');
		Dim.selected = app.dialogTables.querySelector('section').getAttribute('data-dimension-name');
		// recupero la property #select della classe Query per visualizzare nella <ul> #columnsSet
		const ul = document.getElementById('columnsSet');
		console.log('Query.select : ', Query.select);
		for (const [key, value] of Object.entries(Query.select)) {
			const contentElement = app.tmplList.content.cloneNode(true);
			const section = contentElement.querySelector('section[data-no-icon]');
			const element = section.querySelector('.element');
			const li = element.querySelector('li');
			section.hidden = false;
			section.setAttribute('data-label-search', key);
			li.innerText = key;
			ul.appendChild(section);
		}

		// verifico quali relazioni inserire in where e quindi anche in from
		app.checkRelations(hier);
		app.dialogTables.close();
		return;

		// verifico se l'object _select ha elementi selezionati (per una determinata tabella). _select avrà sempre almeno 1 elemento selezionato, si tratta della primaryKey
		// ... quindi, oltre a verificare se ci sono colonne selezionate, devo verificare anche se ce n'è una sola, quella è la primaryKey

		if (Query.select[Query.table]) {
			debugger;
			// TODO: L'aggiunta della primaryKey NON deve essere impostata per ogni tabella...10.10.2021 in corso di valutazione. Probabilmente deve essere impostato solo sulla prima tabella della gerarchia
			// Ci sono colonne selezionate per questa tabella, quindi aggiungo anche la primaryKey (contrassegnata dall'attr data-key)
			/*const fieldList = document.getElementById('table-fieldList'); // contiene la ul con i nomi dei field
			// cerco la <li> che ha data-key='PRI'
			Query.field = fieldList.querySelector('section[data-table-name="'+Query.table+'"] li[data-key="PRI"]').getAttribute('label');
			Query.select = {SQLFormat: null, alias : "pri_"+Query.table+"_"+Query.field};
			Query.groupBy = {SQLFormat: null};*/
			for (const [k, table] of Object.entries(Dim.selected.hierarchies[hier].order)) {
				// recupero la property 'join' (nella dimensione) dove la key è maggiore della tableId al momento selezionata (Quindi recupero tutte le hier inferiori)
				if (+k >= Query.tableId) {
					Query.from = table;
					if (Dim.selected.join[table]) {
						Query.joinId = +k;
						Query.where = Dim.selected.join[table];
					}
				}
			}
			// liTable.setAttribute('data-columns', true);
			list.querySelector('section[data-label-search="' + Query.table + '"][data-hier-name="' + hier + '"] #columns-icon-' + hier + "-" + Query.table).setAttribute('selected', true);
		} else {
			debugger;
			// non ci sono colonne impostati/selezionati per questa tabella, oppure c'è solo l'id impostato (in automatico) per questa tabella. 
			// La elimino da Query.from e dalla Query.join, deseleziono con l'attr 'selected' in 'fieldList-tables'
			// se l'elemento <li> con il nome della tabella NON contiene l'attr data-filters (quindi su questa tabella non è stato impostata un filtro) la posso eliminare dalla _from e dalla _join
			/*list.querySelector('section[data-label-search="'+Query.table+'"][data-hier-name="'+hier+'"] #columns-icon-'+hier+"-"+Query.table).removeAttribute('selected');

			// se l'icona filter-icon NON ha l'attributo 'selected' non è stato impostato alcun filtro su questa tabella, quindi posso rimuoverla dalla _from/_join
			// controllo tutte le tabelle di gerarchia inferiore
			for ( const [k, table] of Object.entries(Dim.selected.hierarchies[hier].order)) {
			// elimino tutte le tabelle appartenenti a gerarchie superiori alla tabella selezionata
			if (+k <= Query.tableId) {
			  Query.deleteFrom(table);
			  if (Dim.selected.join[table]) {
				Query.joinId = +k;
				Query.deleteWhere();
			  }
			}
			// vado a controllare tutte le tabelle di gerarchia inferiore a quella selezionata, controllo se sono impostati filtri o colonne
			const filterIcon = list.querySelector('section[data-label-search="'+table+'"][data-hier-name="'+hier+'"] #filter-icon-'+hier+"-"+table);
			// console.log('filterIcon : ', filterIcon);
			const columnIcon = list.querySelector('section[data-label-search="'+table+'"][data-hier-name="'+hier+'"] #columns-icon-'+hier+"-"+table);
			// console.log('filterIcon : ', columnIcon);
			if (!filterIcon.hasAttribute('selected') && !columnIcon.hasAttribute('selected')) {
			  // non ha nè filtri impostati nè colonne impostate, quindi la elimino dalla _from/_join
			  Query.deleteFrom(table);
			  if (Dim.selected.join[table]) {
				Query.joinId = +k;
				Query.deleteWhere();
			  }
			}
			}*/
		}
		app.dialogTables.close();
	};
	
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
	};

	// tasto 'fatto' nella dialogMetric, salvo la metrica impostata
	app.btnMetricDone.onclick = (e) => {
		const name = app.dialogMetric.querySelector('#metric-name').value;
		const alias = document.getElementById('alias-metric').value;
		const SQLFunction = document.querySelector('#sql-aggregation-list > li[selected]').getAttribute('label');
		const distinctOption = document.getElementById('checkbox-distinct').checked;
		Query.table = app.dialogMetric.querySelector('section').getAttribute('data-table-selected');
		Query.metricName = name;
		console.log(Query.metricName);
		//console.log(Query.table);
		// verifico se ci sono filtri da associare a questa metrica
		debugger;
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
		// ****************************
		/*const ul = app.dialogMetric.querySelector('#existsFilter_Metric > ul');
		console.log('ul con filtri all\'interno della metrica : ', ul);
		let associatedFilters = {};
		// const filterStorage = new FilterStorage()
		ul.querySelectorAll('section li[selected]').forEach((filter) => {
		  // associatedFilters.push(filter.getAttribute('label'));
		  // set il nome del filtro
		  StorageFilter.filter = filter.getAttribute('label');
		  // recupero dallo storage il contenuto del filtro per inserirlo in un object (quest'ultimo verrà inserito nella metrica)
		  associatedFilters[filter.getAttribute('label')] = StorageFilter.filter;
		});*/
		// ******************************

		let metricObj = {};
		// se associatedFilters > 0 sarà una metrica filtrata, altrimenti una metrica a livello di report (senza nessun filtro all'interno della metrica)
		if (Object.keys(associatedFilters).length > 0) {
			// metrica filtrata
			console.log('metrica filtrata');
			Query.filteredMetrics = { SQLFunction, 'table': Query.table, 'field': Query.field, name, 'distinct': distinctOption, alias, 'filters': associatedFilters };

			console.log(Query.filteredMetrics);
			metricObj = { 'type': 'METRIC', name, 'formula': Query.filteredMetrics };
		} else {
			// metrica
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
	};

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
	};

	// salvataggio del filtro impostato nella dialog
	app.btnFilterSave.onclick = (e) => {
		console.log(Query.table);
		const hier = app.dialogFilter.querySelector('section').getAttribute('data-hier-name');
		const dimension = app.dialogFilter.querySelector('section').getAttribute('data-dimension-name');
		// Filter save
		const textarea = document.getElementById('filterSQLFormula');
		let filterName = document.getElementById('inputFilterName');

		Query.filterName = filterName.value;

		const formula = `${Query.table}.${textarea.value}`;
		console.log(formula);
		StorageFilter.save = { 'type': 'FILTER', 'name': filterName.value, /*'schema' : Query.schema,*/ 'table': Query.table, formula };
		// salvataggio di un filtro nel DB
		app.saveFilterDB({ 'type': 'FILTER', 'name': filterName.value, /*'schema' : Query.schema,*/ 'table': Query.table, formula });
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
	};

	app.btnFilterDone.onclick = () => {
		// console.log(Query.filters);
		console.log('Query.table : ', Query.table);
		console.log('Query.tableId : ', Query.tableId);
		const hier = app.dialogFilter.querySelector('section').getAttribute('data-hier-name');
		const list = document.getElementById('fieldList-tables');
		Dim.selected = app.dialogFilter.querySelector('section').getAttribute('data-dimension-name');
		console.log(Query.filters);
		console.log(Query.filters[Query.table]);
		const ul = document.getElementById('filtersSet');
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

		// verifico quali relazioni inserire in where e quindi anche in from
		app.checkRelations(hier);
		app.dialogFilter.close();
	};

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
	};

	// selezione di uno o più valori dalla lista dei valori della colonna in dialogFilter
	app.handlerValueFilterSelected = (e) => {
		const textarea = document.getElementById('filterSQLFormula');
		// aggiungo alla textarea il valore selezionato
		textarea.value += e.currentTarget.getAttribute('label');
		app.checkFilterForm();
	};

	// carico elenco Cubi su cui creare il report
	app.getCubes = () => {
		const content = app.tmplUlList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-cubes']");
		const parent = document.getElementById('fieldList-cubes'); // dove verrà inserita la <ul>
		for (const [key, value] of Object.entries(StorageCube.cubes)) {
			const contentElement = app.tmplList.content.cloneNode(true);
			const section = contentElement.querySelector('section[data-no-icon]');
			const element = section.querySelector('.element');
			const li = element.querySelector('li');
			section.setAttribute('data-label-search', key);
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
	};

	app.getDimensions = () => {
		// elenco di tutte le dimensioni
		const content = app.tmplUlList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-dimensions']");
		const parent = document.getElementById('dimensionList'); // dove verrà inserita la <ul>
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
				section.setAttribute('data-label-search', dimension); // questo attr consente la ricerca dalla input sopra
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
	};

	app.getHierarchies = () => {
		// lista di tutte le gerarchie, imposto un data-dimension-id/name sugli .element della lista gerarchie, in questo modo posso filtrarle quando seleziono le dimensioni nello step precedente
		const content = app.tmplUlList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-hierarchies']");
		const parent = document.getElementById('tableList-hierarchies'); // dove verrà inserita la <ul>

		// ottengo l'elenco delle gerarchie per ogni dimensione presente in storage, successivamente, quando la dimensione viene selezionata, visualizzo/nascondo solo quella selezionata
		// console.log('lista dimensioni :', Dim.dimensions);
		// per ogni dimensione presente aggiungo gli elementi nella ul con le gerarchie
		for (const [dimName, dimValue] of (Object.entries(Dim.dimensions))) {
			// per ogni dimensione presente in associatedDimensions inserisco un element (preso dal template app.tmplListField)
			for (const hier in dimValue.hierarchies) {
				const contentElement = app.tmplList.content.cloneNode(true);
				const section = contentElement.querySelector('section[data-icon-column][data-icon-filter');
				const element = section.querySelector('.element');
				const li = element.querySelector('li');
				const iColumns = element.querySelector("i[data-id='columns-icon']");
				const iFilter = element.querySelector("i[data-id='filter-icon']");
				iColumns.setAttribute('data-dimension-name', dimName);
				iColumns.setAttribute('data-hier-name', hier);
				iColumns.onclick = app.openDialogTables; // apre la dialog dialogTables per impostare gli alias e SQL per le colonne
				iFilter.setAttribute('data-dimension-name', dimName);
				iFilter.setAttribute('data-hier-name', hier);
				iFilter.onclick = app.openDialogFilters; // apre la dialog dialogFilter per impostare i filtri
				section.setAttribute('data-label-search', hier); // ricerca dalla input sopra
				section.setAttribute('data-dimension-name', dimValue.name);
				section.setAttribute('data-hier-name', hier);
				li.innerText = hier;
				li.setAttribute('data-hier-name', hier);
				ul.appendChild(section);
				li.onclick = app.handlerHierSelected;
			}
		  parent.appendChild(ul);
		}
	};

	// popolamento della lista delle tabelle nella dialog-filter
	app.getTablesInHierarchiesDialogFilter = () => {
		const content = app.tmplUlList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-tables']");
		const parent = document.getElementById('filter-fieldList-tables'); // dove verrà inserita la <ul> nella dialog Tables
		// per ogni dimensione, vado a leggere le hierarchies presenti, le ciclo per creare una <ul>, in sectionFields-tables, con le tabelle presenti nella gerarchia in ciclo
		for (const [dimName, dimValue] of (Object.entries(Dim.dimensions))) {
			Dim.selected = dimName;
			// console.log('hierarchies : ', Dim.selected.hierarchies);
			for (const hier in Dim.selected.hierarchies) {
				for (const [key, value] of Object.entries(Dim.selected.hierarchies[hier]['order'])) {
					// ciclo le tabelle presenti nella gerarchia
					// console.log(key, value);
					const contentElement = app.tmplList.content.cloneNode(true);
					const section = contentElement.querySelector('section[data-no-icon]');
					const element = section.querySelector('.element');
					const li = element.querySelector('li');
					section.setAttribute('data-label-search', value.split('.')[1]); // utilizzabile per la ricerca dalla input sopra
					section.setAttribute('data-dimension-name', dimName); // utilizzabile dalla dimensione + gerarchia selezionata
					section.setAttribute('data-hier-name', hier);
					li.innerText = value.split('.')[1];
					li.setAttribute('data-table-id', key);
					li.setAttribute('label', value.split('.')[1]);
					li.setAttribute('data-schema', value.split('.')[0]);
					li.setAttribute('data-dimension-name', dimName);
					li.setAttribute('data-hier-name', hier);
					li.onclick = app.handlerTableSelectedDialogFilter;
					ul.appendChild(section);
				}
				parent.appendChild(ul);
			}
		}
	};

	app.getTablesInHierarchies = () => {
		// lista di tutte le tabelle, incluse nelle dimensioni e di conseguenza, nelle gerarchie
		const content = app.tmplUlList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-tables']");
		const parent = document.getElementById('fieldList-tables'); // dove verrà inserita la <ul> nella dialog Tables
		// per ogni dimensione, vado a leggere le hierarchies presenti, le ciclo per creare una <ul>, in sectionFields-tables, con le tabelle presenti nella gerarchia in ciclo
		for (const [dimName, dimValue] of (Object.entries(Dim.dimensions))) {
			Dim.selected = dimName;
			// console.log('hierarchies : ', Dim.selected.hierarchies);
			for (const hier in Dim.selected.hierarchies) {
				for (const [key, value] of Object.entries(Dim.selected.hierarchies[hier]['order'])) {
					// ciclo le tabelle presenti nella gerarchia
					// console.log(key, value);
					const contentElement = app.tmplList.content.cloneNode(true);
					const section = contentElement.querySelector('section[data-no-icon]');
					const element = section.querySelector('.element');
					const li = element.querySelector('li');
					section.setAttribute('data-label-search', value); // utilizzabile per la ricerca dalla input sopra
					section.setAttribute('data-dimension-name', dimName); // utilizzabile dalla dimensione + gerarchia selezionata
					section.setAttribute('data-hier-name', hier);
					li.innerText = value;
					li.setAttribute('data-table-id', key);
					li.setAttribute('label', value);
					li.setAttribute('data-dimension-name', dimName);
					li.setAttribute('data-hier-name', hier);
					li.onclick = app.handlerTableSelected;
					ul.appendChild(section);
				}
				parent.appendChild(ul);
			}
		}
	};

	app.getColumnsInTable = () => {
		// lista di tutte le colonne, incluse nelle dimensioni, property 'columns'
		const content = app.tmplUlList.content.cloneNode(true);
		const ul = content.querySelector("ul[data-id='fields-column']");
		const parent = document.getElementById('table-fieldList'); // dove verrà inserita la <ul>
		// per ogni dimensione, recupero la property 'columns'
		// console.log('Dim.dimension : ', Dim.dimensions);
		for (const [key, value] of (Object.entries(Dim.dimensions))) {
			// key : nome della dimensione
			// value : tutte le property della dimensione
			// console.log('key : ', key);
			// console.log('value : ', value.columns);
			// le columns sono all'interno della prop hierarchies.nomeGerarchia.columns per cui vado a ciclare questa prop
			// per ogni gerarchia vado ad aggiungere le columns
			for (const [hier, hierValue] of Object.entries(value.hierarchies)) {
				// console.log('hier : ', hier, hierValue.columns);
				for (const [table, fields] of Object.entries(hierValue.columns)) {
					// console.log('table : ', table);
					// console.log('fields : ', fields);
					for (let field in fields) {
						// console.log('field : ', field);
						// console.log('fields[field] : ', fields[field]);
						const contentElement = app.tmplList.content.cloneNode(true);
						const section = contentElement.querySelector('section[data-no-icon');
						const element = section.querySelector('.element');
						const li = element.querySelector('li');
						section.setAttribute('data-label-search', field);
						section.setAttribute('data-table-name', table);
						section.setAttribute('data-dimension-name', key);
						section.setAttribute('data-hier-name', hier);
						li.innerText = field;
						li.setAttribute('label', field);
						li.setAttribute('data-key', fields[field]);
						li.setAttribute('data-table-name', table);
						ul.appendChild(section);
						li.onclick = app.selectColumn;
					}
					parent.appendChild(ul);
				}
			}
		}
	};

	// recupero elenco di tutti i filtri presenti nello storage, per ogni dimensione
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
				for (const [tableKey, table] of Object.entries(hierValue.order)) {
					const filters = StorageFilter.tableFilters(table.split('.')[1]);
					// debugger;
					filters.forEach((filter) => {
						const contentElement = app.tmplList.content.cloneNode(true);
						const section = contentElement.querySelector('section[data-icon-edit]');
						const element = section.querySelector('.element');
						const li = element.querySelector('li');
						const iEdit = element.querySelector('#edit-icon');
						iEdit.setAttribute('data-popup-label', "Modifica filtro"); // TODO: aggiungere eventListener
						section.setAttribute('data-label-search', filter.name);
						section.setAttribute('data-table-name', table);
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
	};

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
			li.setAttribute('label', cubeValue.FACT);
			ul.appendChild(section);
			li.onclick = app.handlerTableSelectedMetrics;
			parent.appendChild(ul);
		}
	};

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
				ul.appendChild(section);
				li.onclick = app.handlerSelectedMetricToSet; // metrica da impostare
				parent.appendChild(ul);
			});
		}
	};

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
				li.innerText = metricName;
				li.setAttribute('label', metricName);
				ul.appendChild(section);
				li.onclick = app.handlerMetricSelected;
				parent.appendChild(ul);
			}
		}
	};

	app.getCubes();

	app.getDimensions();

	app.getHierarchies();

	app.getTablesInHierarchies();

	app.getTablesInHierarchiesDialogFilter();

	app.getColumnsInTable();

	app.getFiltersInFrom();

	app.getTables();

	app.getMetricsInCubes();

	app.getMetrics();

	app.datamartToBeProcessed();

	// abilito il tasto btnFilterSave se il form per la creazione del filtro è corretto
	app.checkFilterForm = () => {
		const filterName = document.getElementById('inputFilterName');
		const filterFormula = document.getElementById('filterSQLFormula');
		((filterName.value.length !== 0) && (filterFormula.value.length !== 0)) ? app.btnFilterSave.disabled = false : app.btnFilterSave.disabled = true;
	};

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
	};
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
	};

	app.btnPreviousStep.onclick = () => Step.previous();

	app.btnNextStep.onclick = () => {
		// verifica selezioni cubo e dimensioni
		// console.log('return check : ', app.checkSelection());
		if (app.checkSelection()) Step.next();
	};

	// tasto completato nello step 4, // dialog per il salvataggio del nome del report
	app.btnStepDone.onclick = (e) => {
		app.dialogSaveReport.showModal();
		// sulla dialog imposto la modalità di salvataggio tra process/report, se impostato su process salvo, dal tasto OK, il process del report, altrimenti salvo il report con tutte le sue opzioni
		app.dialogSaveReport.setAttribute('mode', 'process');
	};

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
	};

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
	};

	// visualizzo la lista dei report da processare
	app.btnProcessReport.onclick = () => {
		const listReportProcess = document.getElementById('reportProcessList');
		listReportProcess.toggleAttribute('hidden');
	};

	document.addEventListener('input', (e) => {
		// console.log('currentTarget : ', e.target);
		if (e.target.hasAttribute('type') && e.target.getAttribute('type') === 'search') {
		  e.target.oninput = App.searchInSectionList;
		}
	});

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
	};

	app.checkDialogMetric = () => {
		const metricName = document.getElementById('metric-name').value;
		const aliasMetric = document.getElementById('alias-metric').value;
		(metricName.length !== 0 && aliasMetric.length !== 0) ? app.btnMetricDone.disabled = false : app.btnMetricDone.disabled = true;
	};

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
	};

	// 'Salva' nella dialogTables
	app.btnSaveColumn.onclick = (e) => {
		Query.columnName = document.getElementById('columnName').value;
		const alias = document.getElementById('columnAlias').value;
		const textarea = (document.getElementById('columnSQL').value.length === 0) ? null : document.getElementById('columnSQL').value;

		Query.select = { table: Query.table, field: Query.field, SQL: textarea, alias };
		Query.addTables();
		// aggiungo la colonna selezionata a Query.groupBy
		// Query.groupBy = {table : Query.table, field: Query.field, SQL: textarea};
		document.getElementById('columnAlias').value = '';
	};

	app.btnMapping.onclick = () => location.href = '/mapping';

	app.btnBackPage.onclick = () => window.location.href = '/';

})();
