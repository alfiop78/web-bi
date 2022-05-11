var App = new Application();
var Query = new Queries();
var StorageDimension = new DimensionStorage();
var StorageCube = new CubeStorage();
var StorageProcess = new ProcessStorage();
var StorageFilter = new FilterStorage();
var StorageMetric = new MetricStorage();
// TODO: impostare i dataset come fatto in getHierarchy()
(() => {
	App.init();
	// console.info('Date.now() : ', Date.now());

	// la Classe Steps deve impostare alcune proprietà DOPO che viene visualizzato il body, non può essere posizionato prima di App.init();
	var Step = new Steps('stepTranslate');

	var app = {
		// templates
		tmplUlList: document.getElementById('template_ulList'), // contiene le <ul>
		tmplList: document.getElementById('templateList'), // contiene i section
		tmplSublists : document.getElementById('template-sublists'),

		// popup
		popup: document.getElementById('popup'),
		dialogPopup: null,

		// btn
		btnAddColumns : document.getElementById('btn-add-columns'),
		btnAddFilters : document.getElementById('btn-add-filters'),
		btnAddMetrics : document.getElementById('btn-add-metrics'),
		btnAddCompositeMetrics : document.getElementById('btn-add-composite-metrics'),
		btnPreviousStep : document.getElementById('prev'),
		btnNextStep : document.getElementById('next'),
		btnSaveAndProcess: document.getElementById('saveAndProcess'),
		btnSaveColumn: document.getElementById('btnSaveColumn'), // salvataggio di un alias/sql di colonna nella dialog dialogColumns
		btnSearchValue : document.getElementById('search-field-values'),

		btnProcessReport: document.getElementById('btnProcessReport'), // apre la lista dei report da processare "Crea FX"

		// dialog
		dialogSaveReport: document.getElementById('dialog-save-report'),
		dialogFilter: document.getElementById('dialog-filter'),
		dialogMetricFilter : document.getElementById('dialog-metric-filter'),
		dialogColumns: document.getElementById('dialog-column'),
		dialogValue : document.getElementById('dialog-value'),
		dialogMetric: document.getElementById('dialog-metric'),
		dialogCompositeMetric : document.getElementById('dialog-composite-metric'),
		btnFilterSave: document.getElementById('btnFilterSave'), //tasto salva nella dialog filter
		btnFilterDone: document.getElementById('btnFilterDone'), //tasto fatto nella dialog filter
		btnColumnDone: document.getElementById('btnColumnDone'), // tasto ok nella dialogColumns
		btnMetricSave: document.getElementById('btnMetricSave'), // tasto salva nella dialogMetric
		btnCompositeMetricSave: document.getElementById('btnCompositeMetricSave'), // tasto salva nella dialog-composite-metric
		btnMetricDone: document.getElementById('btnMetricDone'), // tasto Salva nella dialogMetric
		btnMetricFilterDone: document.getElementById('btnMetricFilterDone'), // tasto ok nella dialog-metric-filter
		btnSetMetricFilter : document.getElementById('metric-filtered'), // apre la dialog-metric-filter
		btnValueDone : document.getElementById('btnValueDone'), // tasto done nella dialogValue
		btnSaveReport: document.getElementById('save'), // apre la dialogSaveReport
		btnSaveReportDone: document.getElementById('btnReportSaveName'),

		btnBackPage: document.getElementById('mdcBack'), // da definire
		ulDimensions: document.getElementById('dimensions'),
		aggregationFunction: document.getElementById('ul-aggregation-functions'),
		btnMapping: document.getElementById('mdcMapping'),
		tooltip : document.getElementById('tooltip'),
		tooltipTimeoutId : null
	}

	// creo la lista degli elementi da processare
	app.getProcesses = () => {
		const ul = document.getElementById('ul-processes');
		for (const [key, value] of Object.entries(StorageProcess.processes)) {
			const content = app.tmplList.content.cloneNode(true);
			const section = content.querySelector('section[data-sublist-gen]');
			const div = section.querySelector('div.selectable');
			const span = section.querySelector('span');
			section.hidden = false;
			section.dataset.elementSearch = 'search-process';
			section.dataset.label = key;
			section.toggleAttribute('data-searchable');
			// section.dataset.processId = value.id;
			div.dataset.label = key;
			div.dataset.processId = value.processId;
			span.innerText = key;
			div.onclick = app.handlerReportToBeProcessed;
			ul.appendChild(section);
		}
	}

	// carico elenco Cubi su cui creare il report
	app.getCubes = () => {
		const ul = document.getElementById('list-cubes');
		for (const [key, value] of Object.entries(StorageCube.cubes)) {
			const content = app.tmplList.content.cloneNode(true);
			const section = content.querySelector('section[data-sublist-gen]');
			const div = section.querySelector('div.selectable');
			const span = section.querySelector('span');
			section.hidden = false;
			section.setAttribute('data-element-search', 'search-cube');
			section.setAttribute('data-label', key);
			section.toggleAttribute('data-searchable');
			section.setAttribute('data-cube-id', value.id);
			section.setAttribute('data-cube-name', key);
			div.setAttribute('data-label', key);
			span.innerText = key;
			div.onclick = app.handlerCubeSelected;
			ul.appendChild(section);
		}
	}

	// lista dimensioni
	app.getDimensions = () => {
		const ul = document.getElementById('list-dimensions');
		for (const [cubeName, cubeValue] of (Object.entries(StorageCube.cubes))) {
			// console.log('key : ', cubeName);
			// console.log('value : ', cubeValue); // tutto il contenuto del cubo
			// console.log('dimensioni associate : ', cubeValue.associatedDimensions);
			// per ogni dimensione presente in associatedDimensions inserisco un element (preso dal template app.tmplListField)
			cubeValue.associatedDimensions.forEach((dimension, index) => {
				const content = app.tmplList.content.cloneNode(true);
				const section = content.querySelector('section[data-sublist-gen]');
				const div = section.querySelector('div.selectable');
				const span = section.querySelector('span');
				section.hidden = true;
				section.setAttribute('data-element-search', 'search-dimension');
				section.setAttribute('data-label', dimension);
				section.setAttribute('data-cube-name', cubeName);
				section.setAttribute('data-dimension-name', dimension);

				div.setAttribute('data-dimension-name', dimension);
				span.innerText = dimension;
				div.onclick = app.handlerDimensionSelected;
				ul.appendChild(section);
			});
		}
	}

	// selezione di una gerarchia (step-2)
	app.handlerHierarchySelected = (e) => {
		console.clear();
		console.log(e.currentTarget);
		e.currentTarget.toggleAttribute('selected');
		const hier = e.currentTarget.getAttribute('data-hier-name');
		const dimension = e.currentTarget.getAttribute('data-dimension-name');
		if (e.currentTarget.hasAttribute('selected')) {
			// visualizzo, in tutte le <ul>, gli elementi appartenenti alla dimensione->gerarchia selezionata
			document.querySelectorAll("ul > section.data-item[data-dimension-name='" + dimension + "'][data-hier-name='" + hier + "']").forEach( (item) => {
				item.hidden = false;
				item.toggleAttribute('data-searchable');
			});
		} else {
			// deselezione della gerarchia, nascondo le tabelle della gerarchia selezionata
			document.querySelectorAll("ul section.data-item[data-dimension-name='" + dimension + "'][data-hier-name='" + hier + "']").forEach( (item) => {
				item.hidden = true;
				item.toggleAttribute('data-searchable');
			});
		}
	}

	// lista gerarchie
	app.getHierarchies = () => {
		// imposto un data-dimension-id/name sugli .element della lista gerarchie, in questo modo posso filtrarle quando seleziono le dimensioni nello step precedente
		// const content = app.tmplUlList.content.cloneNode(true);
		const ul = document.getElementById('list-hierarchies');
		// ottengo l'elenco delle gerarchie per ogni dimensione presente in storage, successivamente, quando la dimensione viene selezionata, visualizzo/nascondo solo quella selezionata
		// console.log('lista dimensioni :', StorageDimension.dimensions);
		// per ogni dimensione presente aggiungo gli elementi nella ul con le gerarchie
		for (const [dimName, dimValue] of (Object.entries(StorageDimension.dimensions))) {
			// per ogni dimensione presente in associatedDimensions inserisco un element (preso dal template app.tmplListField)
			for (const [hierName, hier] of (Object.entries(dimValue.hierarchies)) ) {
				const contentElement = app.tmplList.content.cloneNode(true);
				const section = contentElement.querySelector('section[data-sublist-gen]');
				const div = section.querySelector('div.selectable');
				const vContent = div.querySelector('.v-content');
				const span = vContent.querySelector('span[item]');
				section.dataset.label = hierName;
				section.dataset.elementSearch = 'search-hierarchy';
				section.dataset.dimensionName = dimValue.name;
				div.dataset.label = hierName;
				div.dataset.dimensionName = dimValue.name;
				div.dataset.hierName = hierName;
				div.addEventListener('click', app.handlerHierarchySelected);
				span.innerText = hierName;
				span.dataset.hierName = hierName;
				span.dataset.dimensionName = dimName;
				span.classList.add('highlight');
				
				// lista tabelle presenti per ogni gerarchia
				for (const [tableId, table] of Object.entries(hier.order)) {
					// console.log(table.table);
					const contentSub = app.tmplSublists.content.cloneNode(true);
					const small = contentSub.querySelector('small');
					small.dataset.searchable = true;
					small.dataset.label = table.table;
					small.dataset.tableAlias = table.alias;
					small.dataset.tableId = tableId;
					small.dataset.elementSearch = 'search-hierarchy';
					small.innerText = table.table;
					vContent.appendChild(small);
				}
				ul.appendChild(section);
			}
		}
	}

	// lista di tutte le colonne, incluse nelle dimensioni, property 'columns'
	app.getColumns = () => {
		const ul = document.getElementById('list-columns');
		// per ogni dimensione, recupero la property 'columns'
		// console.log('StorageDimension.dimension : ', StorageDimension.dimensions);
		for (const [key, value] of (Object.entries(StorageDimension.dimensions))) {
			// key : nome della dimensione
			// value : tutte le property della dimensione
			for (const [hier, hierValue] of Object.entries(value.hierarchies)) {
				// per ogni gerarchia...
				for (const [tableId, table] of Object.entries(hierValue.order)) {
					// verifico se la tabella in ciclo ha delle colonne mappate					
					if (hierValue.columns.hasOwnProperty(table.alias)) {
						for (const [token, field] of Object.entries(hierValue.columns[table.alias])) {
							// console.log('field : ', field);
							const content = app.tmplList.content.cloneNode(true);
							const section = content.querySelector('section[data-sublist-columns]');
							const div = section.querySelector('div.selectable');
							const spanHContent = div.querySelector('.h-content');
							const span = spanHContent.querySelector('span[column]');
							const smallTable = spanHContent.querySelector('small[table]');
							const smallHier = spanHContent.querySelector('small:last-child');

							section.setAttribute('data-label', field.ds.field);
							section.setAttribute('data-element-search', 'search-columns');
							section.setAttribute('data-dimension-name', key);
							section.setAttribute('data-hier-name', hier);
							div.setAttribute('data-label', field.ds.field);
							div.setAttribute('data-table-name', table.table);
							div.setAttribute('data-table-alias', table.alias);
							div.setAttribute('data-table-id', tableId);
							div.setAttribute('data-dimension-name', key);
							div.setAttribute('data-hier-name', hier);
							div.setAttribute('data-token-column', token);
							div.onclick = app.handlerSelectColumn;

							span.innerText = field.ds.field;
							smallTable.innerText = table.table;
							smallHier.innerText = hier;
							ul.appendChild(section);
						}
					}
				}
			}
		}
	}

	// recupero le colonne agganciate alla fact, proprietà columns nel json, per aggiungerle nelle dialog-column
	app.getColumnsFact = () => {
		const ul = document.getElementById('list-columns-fact');
		for (const [key, value] of Object.entries(StorageCube.cubes)) {
			if (value.columns.hasOwnProperty(value.alias)) {
				for (const [token, field] of Object.entries(value.columns[value.alias])) {
					// console.log('field : ', field);
					const content = app.tmplList.content.cloneNode(true);
					const section = content.querySelector('section[data-sublist-columns]');
					const div = section.querySelector('div.selectable');
					const spanHContent = div.querySelector('.h-content');
					const span = spanHContent.querySelector('span[column]');
					const smallTable = spanHContent.querySelector('small[table]');
					const smallCube = spanHContent.querySelector('small:last-child');

					section.setAttribute('data-label', field.ds.field);
					section.setAttribute('data-element-search', 'search-columns');
					section.setAttribute('data-cube-name', key);
					div.setAttribute('data-label', field.ds.field);
					div.setAttribute('data-table-name', value.FACT);
					div.setAttribute('data-table-alias', value.alias);
					div.setAttribute('data-token-column', token);
					div.setAttribute('data-cube-name', key);
					div.onclick = app.handlerSelectColumn;

					span.innerText = field.ds.field;
					smallTable.innerText = value.FACT;
					smallCube.innerText = key;
					ul.appendChild(section);
				}
			}
		}
	}

	// popolo la lista dei filtri esistenti
	app.getFilters = () => {
		const ul = document.getElementById('exist-filters');
		// console.log('filters : ', StorageFilter.filters);
		for (const [dimName, dimValue] of (Object.entries(StorageDimension.dimensions))) {
			// per ogni dimensione recupero i filtri a questa appartenenti
			for (const [hierName, hier] of (Object.entries(dimValue.hierarchies)) ) {
				// per ogni gerarchia...
				for (const [tableId, table] of Object.entries(hier.order)) {
					// per ogni tabella...
					const filters = StorageFilter.getFiltersByDimension(dimName, hierName, table.table);
					if (filters.length > 0) {
						// se sono presenti filtri per questa tabella
						filters.forEach( (filter) => {
							const contentElement = app.tmplList.content.cloneNode(true);
							const section = contentElement.querySelector('section[data-sublist-filters]');
							const div = section.querySelector('div.selectable');
							const spanHContent = div.querySelector('.h-content');
							const span = spanHContent.querySelector('span[filter]');
							const smallTable = spanHContent.querySelector('small[table]');
							const smallHier = spanHContent.querySelector('small:last-child');
							section.setAttribute('data-element-search', 'search-exist-filters');
							section.setAttribute('data-label', filter.name);
							section.setAttribute('data-dimension-name', filter.dimension);
							section.setAttribute('data-hier-name', filter.hier);
							div.setAttribute('data-label', filter.name);
							div.setAttribute('data-element-search','search-exist-filters');
							div.setAttribute('data-dimension-name', filter.dimension);
							div.setAttribute('data-hier-name', filter.hier);
							div.setAttribute('data-table-name', filter.table);
							div.setAttribute('data-table-alias', table.alias);
							div.setAttribute('data-table-id', tableId);
							div.onclick = app.handlerFilterSelected;

							span.innerText = filter.name;
							smallTable.innerText = table.table;
							smallHier.setAttribute('hier', true);
							smallHier.innerText = hierName;
							ul.appendChild(section);
						});
					}
				}
			}
		}
	}

	app.getFiltersFact = () => {
		const ul = document.getElementById('exist-filters');
		for (const [cubeName, cubeValue] of Object.entries(StorageCube.cubes) ) {
			StorageFilter.getFiltersByCube(cubeName).forEach( (filter) => {
				// console.log('filter : ', filter);
				const content = app.tmplList.content.cloneNode(true);
				const section = content.querySelector('section[data-sublist-filters]');
				const div = section.querySelector('div.selectable');
				const spanHContent = div.querySelector('.h-content');
				const span = spanHContent.querySelector('span[filter]');
				const smallTable = spanHContent.querySelector('small[table]');
				const smallCube = spanHContent.querySelector('small:last-child');
				section.setAttribute('data-element-search', 'search-exist-filters');
				section.setAttribute('data-label', filter.name);
				section.setAttribute('data-cube-name', cubeName);
				div.setAttribute('data-table-name', cubeValue.FACT);
				div.setAttribute('data-table-alias', cubeValue.alias);
				div.setAttribute('data-cube-name', cubeName);
				div.setAttribute('data-label', filter.name);
				div.onclick = app.handlerFilterSelected;
				span.innerText = filter.name;
				smallTable.innerText = cubeValue.FACT;
				smallCube.innerText = cubeName;
				ul.appendChild(section);
			});
		}
	}

	// popolo la lista dei filtri esistenti nella dialog metric-filter (metriche filtrate)
	app.getMetricFilters = () => {
		const ul = document.getElementById('ul-metric-filter');
		// console.log('filters : ', StorageFilter.filters);
		for (const [dimName, dimValue] of (Object.entries(StorageDimension.dimensions))) {
			// per ogni dimensione recupero i filtri a questa appartenenti
			for (const [hierName, hier] of (Object.entries(dimValue.hierarchies)) ) {
				// per ogni gerarchia...
				for (const [tableId, table] of Object.entries(hier.order)) {
					// per ogni tabella...
					const filters = StorageFilter.getFiltersByDimension(dimName, hierName, table.table);
					if (filters.length > 0) {
						// se sono presenti filtri per questa tabella
						filters.forEach( (filter) => {
							const contentElement = app.tmplList.content.cloneNode(true);
							const section = contentElement.querySelector('section[data-sublist-filters]');
							const div = section.querySelector('div.selectable');
							const spanHContent = div.querySelector('.h-content');
							const span = spanHContent.querySelector('span[filter]');
							const smallTable = spanHContent.querySelector('small[table]');
							const smallHier = spanHContent.querySelector('small:last-child');
							section.setAttribute('data-element-search', 'search-exist-filters');
							section.setAttribute('data-label', filter.name);
							section.setAttribute('data-dimension-name', filter.dimension);
							section.setAttribute('data-hier-name', filter.hier);
							div.setAttribute('data-label', filter.name);
							div.setAttribute('data-element-search','search-exist-filters');
							div.setAttribute('data-dimension-name', filter.dimension);
							div.setAttribute('data-hier-name', filter.hier);
							div.setAttribute('data-table-name', filter.table);
							div.setAttribute('data-table-alias', table.alias);
							div.setAttribute('data-table-id', tableId);
							div.onclick = app.handlerMetricFilterSelected;

							span.innerText = filter.name;
							smallTable.innerText = table.table;
							smallHier.setAttribute('hier', true);
							smallHier.innerText = hierName;
							ul.appendChild(section);
						});
					}
				}
			}
		}
	}

	app.getMetricFiltersFact = () => {
		const ul = document.getElementById('ul-metric-filter');
		for (const [cubeName, cubeValue] of Object.entries(StorageCube.cubes) ) {
			StorageFilter.getFiltersByCube(cubeName).forEach( (filter) => {
				// console.log('filter : ', filter);
				const content = app.tmplList.content.cloneNode(true);
				const section = content.querySelector('section[data-sublist-filters]');
				const div = section.querySelector('div.selectable');
				const spanHContent = div.querySelector('.h-content');
				const span = spanHContent.querySelector('span[filter]');
				const smallTable = spanHContent.querySelector('small[table]');
				const smallCube = spanHContent.querySelector('small:last-child');
				section.setAttribute('data-element-search', 'search-exist-filters');
				section.setAttribute('data-label', filter.name);
				section.setAttribute('data-cube-name', cubeName);
				div.setAttribute('data-table-name', cubeValue.FACT);
				div.setAttribute('data-table-alias', cubeValue.alias);
				div.setAttribute('data-cube-name', cubeName);
				div.onclick = app.handlerMetricFilterSelected;
				span.innerText = filter.name;
				smallTable.innerText = cubeValue.FACT;
				smallCube.innerText = cubeName;
				ul.appendChild(section);
			});
		}
	}

	// popolamento delle tabelle nella dialogFilter
	app.getTables = () => {
		const ul = document.getElementById('list-tables');
		for (const [key, value] of (Object.entries(StorageDimension.dimensions))) {
			// key : nome della dimensione
			// value : tutte le property della dimensione
			for (const [hier, hierValue] of Object.entries(value.hierarchies)) {
				for (const [tableId, table] of Object.entries(hierValue.order)) {
					// console.log('tableId : ', tableId);
					// console.log('table : ', table);
					const content = app.tmplList.content.cloneNode(true);
					const section = content.querySelector('section[data-sublist-tables]');
					const div = section.querySelector('div.selectable');
					const spanHContent = div.querySelector('.h-content');
					const span = spanHContent.querySelector('span[table]');
					const smallHier = spanHContent.querySelector('small');

					section.setAttribute('data-dimension-name', key);
					section.setAttribute('data-hier-name', hier);
					section.setAttribute('data-label', table.table);
					section.setAttribute('data-table-name', table.table);
					section.setAttribute('data-element-search', 'search-tables');
					div.setAttribute('data-dimension-name', key);
					div.setAttribute('data-hier-name', hier);
					div.setAttribute('data-table-name', table.table);
					div.setAttribute('data-table-alias', table.alias);
					div.setAttribute('data-schema', table.schema);
					div.setAttribute('data-table-id', tableId);
					div.onclick = app.handlerSelectTable;
					span.innerText = table.table;
					smallHier.innerText = hier;
					ul.appendChild(section);
				}
			}
		}
	}

	app.getTablesInDialogFilter = () => {
		const ul = document.getElementById('list-filters-fact');
		for (const [key, value] of Object.entries(StorageCube.cubes)) {
			const content = app.tmplList.content.cloneNode(true);
			const section = content.querySelector('section[data-sublist-tables]');
			const div = section.querySelector('div.selectable');
			const spanHContent = div.querySelector('.h-content');
			const span = spanHContent.querySelector('span[table]');
			const small = spanHContent.querySelector('small');
			section.setAttribute('data-label', value.FACT);
			section.setAttribute('data-cube-name', key);
			section.setAttribute('data-table-alias', value.alias);
			section.setAttribute('data-schema-name', value.schema);
			div.setAttribute('data-label', value.FACT);
			div.setAttribute('data-table-name', value.FACT);
			div.setAttribute('data-table-alias', value.alias);
			div.setAttribute('data-schema', value.schema);
			div.setAttribute('data-cube-name', key);
			div.onclick = app.handlerSelectTable;
			span.innerText = value.FACT;
			small.innerText = key;
			ul.appendChild(section);
		}
	}

	// lista tabelle Fact (step 1)
	app.getFactTable = () => {
		const ul = document.getElementById('list-fact-tables');
		for (const [key, value] of Object.entries(StorageCube.cubes)) {
			const content = app.tmplList.content.cloneNode(true);
			const section = content.querySelector('section[data-sublist-gen]');
			const div = section.querySelector('div.selectable');
			const span = div.querySelector('span');
			section.classList.remove('data-item');
			section.setAttribute('data-label', value.FACT);
			section.setAttribute('data-cube-name', key);
			section.setAttribute('data-table-alias', value.alias);
			section.setAttribute('data-schema-name', value.schema);
			div.setAttribute('data-cube-name', key);
			div.setAttribute('data-label', value.FACT);
			div.setAttribute('data-table-alias', value.alias);

			span.innerText = value.FACT;
			div.onclick = app.handlerFactSelected;
			ul.appendChild(section);
		}
	}

	// lista metriche esistenti
	app.getMetrics = () => {
		const ul = document.getElementById('exist-metrics');
		for (const [cubeName, cubeValue] of Object.entries(StorageCube.cubes)) {
			for (const [key, value] of Object.entries(StorageMetric.metrics)) {
				const contentElement = app.tmplList.content.cloneNode(true);
				const section = contentElement.querySelector('section[data-sublist-metrics]');
				const div = section.querySelector('div.selectable');
				const spanHContent = div.querySelector('.h-content');
				const span = spanHContent.querySelector('span[metric]');
				const smallTable = spanHContent.querySelector('small[table]');
				const smallCube = spanHContent.querySelector('small[cube]');
				section.setAttribute('data-element-search', 'search-exist-metrics');
				section.setAttribute('data-label', key);
				section.setAttribute('data-cube-name', cubeName);
				div.setAttribute('data-table-name', cubeValue.FACT);
				div.setAttribute('data-table-alias', cubeValue.alias);
				div.setAttribute('data-cube-name', cubeName);
				div.setAttribute('data-label', key);
				div.onclick = app.handlerMetricSelected;
				span.innerText = key;
				smallTable.innerText = cubeValue.FACT;
				smallCube.innerText = cubeName;
				ul.appendChild(section);
			}
		}
	}

	// lista delle metriche disponibili nei cubi
	app.getAvailableMetrics = () => {
		const ul = document.getElementById('ul-available-metrics');
		for (const [key, value] of Object.entries(StorageCube.cubes)) {
			// console.log(key, value);
			// per ogni metrica
			// console.log(value.metrics[value.FACT]);
			value.metrics[value.FACT].forEach( (metric) => {
				const content = app.tmplList.content.cloneNode(true);
				const section = content.querySelector('section[data-sublist-available-metrics]');
				const div = section.querySelector('div.selectable');
				const spanHContent = div.querySelector('.h-content');
				const span = div.querySelector('span[metric]');
				const small = div.querySelector('small');

				section.setAttribute('data-label', metric);
				section.setAttribute('data-cube-name', key);
				section.setAttribute('data-table-alias', value.alias);
				section.setAttribute('data-table-name', value.FACT);
				section.setAttribute('data-element-search', 'search-available-metrics');
				div.setAttribute('data-table-alias', value.alias);
				div.setAttribute('data-table-name', value.FACT);
				div.setAttribute('data-label', metric);
				div.setAttribute('data-cube-name', key);
				div.onclick = app.handlerMetricAvailable;
				span.innerText = metric;
				small.innerText = value.FACT;
				ul.appendChild(section);
			});
		}
	}

	// selezione della fact nello step-2
	app.handlerFactSelected = (e) => {
		e.currentTarget.toggleAttribute('selected');
		const cube = e.currentTarget.getAttribute('data-cube-name');
		const table = e.currentTarget.getAttribute('data-label');
		const alias = e.currentTarget.getAttribute('data-table-alias');
		if (e.currentTarget.hasAttribute('selected')) {
			// visualizzo, in tutte le ul section.data-item[data-cube-name] gli elementi appartenenti al cubo selezionato
			document.querySelectorAll("ul > section.data-item[data-cube-name='" + cube + "']").forEach( item => {
				item.hidden = false;
				item.toggleAttribute('data-searchable');
			});
		} else {
			document.querySelectorAll("ul > section.data-item[data-cube-name='" + cube + "']").forEach( item => {
				item.hidden = true;
				item.toggleAttribute('data-searchable');
			});
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
		const label = e.currentTarget.dataset.label;
		debugger;
		console.log(label);
		const reportId = +e.currentTarget.dataset.processId;
		// const reportId = +e.target.getAttribute('data-id');
		console.log('reportId : ', reportId);
		debugger;
		let jsonData = window.localStorage.getItem(label);
		let jsonDataParsed = JSON.parse(window.localStorage.getItem(label));
		console.dir(jsonDataParsed);
		console.dir(jsonData);
		console.dir(JSON.stringify(jsonData));
		debugger;
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

	// selezione di un cubo (step-1)
	app.handlerCubeSelected = (e) => {
		StorageCube.selected = e.currentTarget.getAttribute('data-label');
		Query.tableAlias = StorageCube.selected.alias;
		Query.from = `${StorageCube.selected.schema}.${StorageCube.selected.FACT} AS ${Query.tableAlias}`;

		// console.log('cube selected : ', StorageCube.selected.name);
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// Query.addFromCubes(StorageCube.selected.FACT);
			// visualizzo la <ul> contentente le dimensioni appartenenti al cubo selezionato
			document.querySelectorAll("#list-dimensions > section[data-cube-name='" + StorageCube.selected.name + "']").forEach((dimension) => {
				// console.log('Dimensioni del cubo selezionato : ', dimension);
				dimension.hidden = false;
				dimension.setAttribute('data-searchable', true);
			});
			// visualizzo la/e tabelle fact nello step-2
			document.querySelector("#list-fact-tables > section[data-cube-name='" + StorageCube.selected.name + "']").hidden = false;
		} else {
			// deselect cube
			document.querySelectorAll("ul[data-id='fields-dimensions'] > section[data-cube-name='" + StorageCube.selected.name + "']").forEach((table) => {
				table.hidden = true;
				table.toggleAttribute('data-searchable');
			});
			StorageCube.deleteCube();
			// TODO: elimino la FACT dall'elenco #tableList-hierarchies > ul
		}
	}

	// selezione delle dimensioni
	app.handlerDimensionSelected = (e) => {
		StorageDimension.selected = e.currentTarget.getAttribute('data-dimension-name');
		console.log('Dimensione selezionata : ', StorageDimension.selected);
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			document.querySelectorAll("#list-hierarchies > section[data-dimension-name='" + StorageDimension.selected.name + "']").forEach( (hier) => {
				hier.hidden = false;
				hier.setAttribute('data-searchable', true);
			});
			Query.factRelation = StorageDimension.selected;
			// imposto, in un object le dimensioni selezionate, questo mi servirà nella dialog-metrics per visualizzare/nascondere solo i filtri appartenenti alle dimensioni selezionate
			// ... probabilmente mi servirà anche nella dialog-filter per lo stesso utilizzo
			// TODO: da rivedere se viene utilizzato
			StorageDimension.add();
		} else {
			document.querySelectorAll("#list-hierarchies > section[data-dimension-name='" + StorageDimension.selected.name + "']").forEach((hier) => {
				hier.hidden = true;
				hier.removeAttribute('data-searchable');
			});
			// TODO: delete factRelation
			Query.deleteFactRelation(StorageDimension.selected.name);
			StorageDimension.delete();
		}
	}

	// selezione di un filtro già presente, lo salvo nell'oggetto Query
	app.handlerFilterSelected = (e) => {
		StorageFilter.filter = e.currentTarget.getAttribute('data-label');
		if (e.currentTarget.hasAttribute('data-hier-name')) {
			hier = e.currentTarget.getAttribute('data-hier-name');
			StorageDimension.selected = e.currentTarget.getAttribute('data-dimension-name');
			Query.tableId = e.currentTarget.getAttribute('data-table-id');
		}
		Query.table = e.currentTarget.getAttribute('data-table-name');
		Query.tableAlias = e.currentTarget.getAttribute('data-table-alias');
		e.currentTarget.toggleAttribute('selected');
		Query.filterName = StorageFilter.filter.name;
		if (e.currentTarget.hasAttribute('selected')) {
			// recupero dallo storage il filtro selezionato
			console.log(StorageFilter.filter);
			if (StorageFilter.filter.hier) {
				// imposto la firstTable se il filtro appartiene a una dimensione e non a un cubo
				Query.addTables(StorageFilter.filter.hier);
				app.checkRelations(hier);
			}
			console.log(StorageFilter.filter.formula);
			// nel salvare il filtro nel report attuale devo impostarne anche l'alias della tabella selezionata nella dialog
			Query.filters = `${Query.tableAlias}.${StorageFilter.filter.formula}`;
		} else {
			// delete filter
			Query.deleteFilter();
		}
	}

	app.handlerMetricFilterSelected = e => e.currentTarget.toggleAttribute('selected');

	// selezione di una metrica già esistente, lo salvo nell'oggetto Query, come quando si salva un nuovo filtro dalla dialog
	app.handlerMetricSelected = (e) => {
		StorageMetric.metric = e.currentTarget.getAttribute('data-label');
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// aggiungo la metrica
			// recupero dallo StorageMetric la metrica selezionata
			Query.metricName = StorageMetric.metric.name;
			if (StorageMetric.metric.composite) {
				// metrica composta
				Query.compositeMetrics = StorageMetric.metric.formula[StorageMetric.metric.name];
			} else {
				// se la metrica contiene un filtro bisogna aggiungerla a Query.filteredMetrics altrimenti a Query.metrics
				if (StorageMetric.metric.formula[StorageMetric.metric.name].hasOwnProperty('filters')) {
					Query.filteredMetrics = StorageMetric.metric.formula[StorageMetric.metric.name];
				} else {
					Query.metrics = StorageMetric.metric.formula[StorageMetric.metric.name];
				}
			}
		} else {
			// TODO: elimino la metrica
		}
	}

	// selezione di una metrica per la creazione di una metrica composta
	app.handlerMetricSelectedComposite = (e) => {
		// TODO: aggiungo la metrica alla textarea
		Query.table = e.currentTarget.dataset.tableName;
		const textArea = document.getElementById('composite-metric-formula');
		// creo uno span con dentro la metrica
		const mark = document.createElement('mark');
		mark.innerText = e.currentTarget.getAttribute('data-label');
		textArea.appendChild(mark);
		// aggiungo anche uno span per il proseguimento della scrittura della formula
		let span = document.createElement('span');
		span.setAttribute('contenteditable', true);
		textArea.appendChild(span);
		span.focus();
	}

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

	// selezione delle colonne nella dialogColumns
	app.handlerSelectColumn = (e) => {
		e.currentTarget.toggleAttribute('selected');
		let hier = e.currentTarget.getAttribute('data-hier-name');
		Query.table = e.currentTarget.getAttribute('data-table-name');
		Query.tableAlias = e.currentTarget.getAttribute('data-table-alias');
		Query.columnToken = e.currentTarget.getAttribute('data-token-column');
		// la FACT table non ha un data-table-id
		if (e.currentTarget.hasAttribute('data-table-id')) {
			StorageDimension.selected = e.currentTarget.getAttribute('data-dimension-name');
			Query.tableId = e.currentTarget.getAttribute('data-table-id');
			Query.field = {[Query.columnToken] : StorageDimension.selected.hierarchies[hier].columns[Query.tableAlias][Query.columnToken]};
		} else {
			StorageCube.selected = e.currentTarget.getAttribute('data-cube-name');
			Query.field = {[Query.columnToken] : StorageCube.selected.columns[Query.tableAlias][Query.columnToken]};
		}
		if (!e.currentTarget.hasAttribute('selected')) {
			// TODO: colonna deselezionata, implementare la logica in Query.deleteSelect
			Query.deleteSelect();
		} else {
			document.getElementById('columnAlias').value = '';
			document.getElementById('columnAlias').focus();
			// imposto, nella section della dialog, l'attributo data-hier-name e data-dimension-name selezionata
			if (e.currentTarget.hasAttribute('data-hier-name')) {
				app.dialogColumns.querySelector('section').setAttribute('data-hier-name', e.currentTarget.getAttribute('data-hier-name'));
				app.dialogColumns.querySelector('section').setAttribute('data-dimension-name', e.currentTarget.getAttribute('data-dimension-name'));				
			} else {
				// selezione di una colonna della Fact, elimino l'attributo data-hier-name perchè, nel tasto Salva, è su questo attributo che controllo se si tratta di una colonna da dimensione o da Fact
				app.dialogColumns.querySelector('section').removeAttribute('data-hier-name');
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
		if (app.dialogColumns.querySelector('#fieldList-tables ul li[selected]')) {
			const li = app.dialogColumns.querySelector('#fieldList-tables ul li[selected]');
			li.toggleAttribute('selected');
			// nascondo tutte le colonne che fanno parte della tabella precedentemente selezionata
			app.dialogColumns.querySelectorAll("ul[data-id='fields-column'] > section[data-dimension-name='" + dimension + "'][data-hier-name='" + hier + "'][data-table-name='" + li.getAttribute('label') + "']").forEach((field) => {
				field.hidden = true;
				field.removeAttribute('data-searchable');
			});
		}
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// visualizzo le colonne appartenenti alla tabella selezionata
			app.dialogColumns.querySelectorAll("ul[data-id='fields-column'] > section[data-dimension-name='" + dimension + "'][data-hier-name='" + hier + "'][data-table-name='" + Query.table + "']").forEach((field) => {
				field.hidden = false;
				field.setAttribute('data-searchable', true);
			});
		}
	}

	// selezione di una tabella nella dialog-filter
	app.handlerSelectTable = (e) => {
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// tabella selezionata
			// query per visualizzare tutti i field della tabella
			Query.table = e.currentTarget.getAttribute('data-table-name');
			Query.tableAlias = e.currentTarget.getAttribute('data-table-alias');
			Query.schema = e.currentTarget.getAttribute('data-schema');
			if (e.currentTarget.hasAttribute('data-hier-name')) {
				Query.tableId = e.currentTarget.getAttribute('data-table-id');
				// TODO: invece di impostare questi due attributi nel <section> della dialog potrei impostarli nella Classe Storage, con il metodo selected()
				app.dialogFilter.querySelector('section').setAttribute('data-hier-name', e.currentTarget.getAttribute('data-hier-name'));
				app.dialogFilter.querySelector('section').setAttribute('data-dimension-name', e.currentTarget.getAttribute('data-dimension-name'));
			} else {
				// selezione di una tabella della Fact, elimino l'attributo data-hier-name perchè, nel tasto Salva, è su questo attributo che controllo se si tratta di una colonna da dimensione o da Fact
				app.dialogFilter.querySelector('section').removeAttribute('data-hier-name');
				app.dialogFilter.querySelector('section').removeAttribute('data-dimension-name');
				StorageCube.selected = e.currentTarget.getAttribute('data-cube-name');
			}
			// pulisco la <ul> dialog-filter-fields contenente la lista dei campi recuperata dal db, della selezione precedente
			app.dialogFilter.querySelectorAll('#dialog-filter-fields > section').forEach( section => section.remove());
			app.dialogFilter.querySelector('section').setAttribute('data-table-name', e.currentTarget.getAttribute('data-table-name'));
		}
		app.getFields();
		e.currentTarget.toggleAttribute('selected');
	}

	// selezione di una metrica mappata, disponibile per la creazione
	app.handlerMetricAvailable = (e) => {
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			Query.field = e.currentTarget.getAttribute('data-label');
			Query.table = e.currentTarget.getAttribute('data-table-name');
			Query.tableAlias = e.currentTarget.getAttribute('data-table-alias');
			StorageCube.selected = e.currentTarget.getAttribute('data-cube-name');
		} else {
			// TODO: 
		}
	}

	// apertura dialog per impostare le colonne nel report
	app.openDialogColumns = (e) => {
		const hier = e.currentTarget.getAttribute('data-hier-name');
		const table = e.currentTarget.getAttribute('data-table-name');
		const dimension = e.currentTarget.getAttribute('data-dimension-name');
		app.dialogColumns.querySelector('section').setAttribute('data-hier-name', hier);
		app.dialogColumns.querySelector('section').setAttribute('data-dimension-name', dimension);
		// nascondo le tabelle NON appartenenti alla gerarchia selezionata
		app.dialogColumns.querySelectorAll("#list-columns > section:not([data-table-name='" + table + "'])").forEach( (column) => {
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
		app.dialogColumns.showModal();
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
	app.handlerSelectField = (e) => {
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// field selezionato
			Query.field = e.currentTarget.getAttribute('label');
			Query.fieldType = e.currentTarget.getAttribute('data-type');
			Query.schema = e.currentTarget.getAttribute('data-schema');
			const valueList = app.dialogValue.querySelector('#dialog-filter-values');
			valueList.querySelectorAll('section').forEach( section => section.remove());
			const textarea = document.getElementById('filterSQLFormula');
			textarea.value = (textarea.value.length === 0) ? Query.field+" = " : textarea.value + Query.field;
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

		await fetch('/fetch_api/' + Query.schema + '/schema/' + Query.table + '/table_info')
			.then((response) => {
				if (!response.ok) { throw Error(response.statusText); }
				return response;
			})
			.then((response) => response.json())
			.then((data) => {
			  	console.log(data);
				if (data) {
					const ul = document.getElementById('dialog-filter-fields'); // dove verrà inserita la <ul>
					// ul.querySelectorAll('section').forEach((el) => {el.remove();});
					for (const [key, value] of Object.entries(data)) {
						// console.log(key, value);
						const content = app.tmplList.content.cloneNode(true);
						const section = content.querySelector('section[data-sublist-gen]');
						const div = section.querySelector('div.selectable');
						const span = div.querySelector('span');
						// section.hidden = false;
						section.setAttribute('data-searchable', true);
						section.setAttribute('data-label', value.COLUMN_NAME);
						section.setAttribute('data-element-search', 'dialog-filter-search-field');
						section.setAttribute('data-table-name', Query.table);
						div.setAttribute('data-schema', Query.schema);
						// scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
						let pos = value.DATA_TYPE.indexOf('('); // datatype
						let type = (pos !== -1) ? value.DATA_TYPE.substring(0, pos) : value.DATA_TYPE;
						div.setAttribute('data-type', type);
						div.setAttribute('label', value.COLUMN_NAME); // nome campo
						div.onclick = app.handlerSelectField;
						span.innerText = value.COLUMN_NAME;
						
						ul.appendChild(section);
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
		for (const [k, order] of Object.entries(StorageDimension.selected.hierarchies[hier].order)) {
			// recupero la property 'join' (nella dimensione) dove la key è maggiore della tableId al momento selezionata (Quindi recupero tutte le hier inferiori)
			if (+k >= +Query.tables.tableId) {
				Query.from = `${order.schema}.${order.table} AS ${order.alias}`;
				if (StorageDimension.selected.hierarchies[hier].joins[order.alias]) {
					Query.joinId = +k;
					Query.where = StorageDimension.selected.hierarchies[hier].joins[order.alias];
				}
			}
		}
	}

	// tasto Fatto nella dialog Column
	app.btnColumnDone.onclick = () => {
		// L'oggetto Query.select ora è popolato con le colonne scelte, da aggiungere al report.
		// Popolo una <ul> dove sono presenti le colonne scelte prima di chiudere la dialog.
		const ul = document.getElementById('report-columns');
		// ripulisco la <ul> in caso di una precedente aggiunta delle colonne
		ul.querySelectorAll('section').forEach( section => section.remove());
		// console.log('Query.select : ', Query.select);
		// aggiungo, alla <ul> report-columns le colonne selezionate nella dialog
		for (const [key, value] of Object.entries(Query.select)) {
			const contentElement = app.tmplList.content.cloneNode(true);
			const section = contentElement.querySelector('section[data-sublist-columns-selected]');
			const div = section.querySelector('div');
			const spanHContent = div.querySelector('.h-content');
			const column = spanHContent.querySelector('span[column]');
			const smallTable = spanHContent.querySelector('small');
			section.hidden = false;
			section.setAttribute('data-label', value.alias);
			section.setAttribute('data-element-search', 'search-columns-selected');
			section.setAttribute('data-searchable', true);
			column.innerText = value.alias;
			smallTable.innerText = value.table;
			ul.appendChild(section);
		}
		app.dialogColumns.close();
	}

	// tasto 'Fatto' nella dialogFilter
	app.btnFilterDone.onclick = e => app.dialogFilter.close();
	
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

	app.btnMetricDone.onclick = () => app.dialogMetric.close();

	// dialog-metric-filter, recupero i filtri selezionati per inserirli nella metrica filtrata
	app.btnMetricFilterDone.onclick = e => app.dialogMetricFilter.close();

	// tasto salva nella dialogMetric, salvo la metrica impostata
	app.btnMetricSave.onclick = (e) => {
		const name = document.getElementById('metric-name').value;
		const alias = document.getElementById('alias-metric').value;
		const SQLFunction = document.querySelector('#ul-aggregation-functions .selectable[selected]').getAttribute('data-label');
		const distinctOption = document.getElementById('checkbox-distinct').checked;
		console.log('Query.table : ', Query.table);
		console.log('Query.tableAlias : ', Query.tableAlias);
		console.log('cube selected : ', StorageCube.selected.name);
		Query.metricName = name;
		console.log(Query.metricName);
		// verifico se ci sono filtri da associare a questa metrica
		let associatedFilters = {};
		document.querySelectorAll('#ul-metric-filter > section span[filter][selected]').forEach((filterSelected) => {
			StorageFilter.filter = filterSelected.getAttribute('data-label');
			// recupero dallo storage il contenuto del filtro per inserirlo in un object (quest'ultimo verrà inserito nella metrica)
			associatedFilters[StorageFilter.filter.name] = StorageFilter.filter;
		});

		let metricObj = {};
		// se associatedFilters > 0 sarà una metrica filtrata, altrimenti una metrica a livello di report (senza nessun filtro all'interno della metrica)
		if (Object.keys(associatedFilters).length > 0) {
			// metrica filtrata
			console.info('metrica filtrata');
			Query.filteredMetrics = { SQLFunction, 'table': Query.table, 'tableAlias' : Query.tableAlias, 'field': Query.field, name, 'distinct': distinctOption, alias, cube : StorageCube.selected.name, 'filters': associatedFilters };

			console.log(Query.filteredMetrics);
			metricObj = { 'type': 'METRIC', name, 'formula': Query.filteredMetrics };
		} else {
			// metrica
			console.info('metrica non filtrata');
			Query.metrics = { SQLFunction, 'table': Query.table, 'tableAlias' : Query.tableAlias, 'field': Query.field, name, 'distinct': distinctOption, alias, cube : StorageCube.selected.name };
			metricObj = { 'type': 'METRIC', name, 'formula': Query.metrics };
		}

		// salvo la nuova metrica nello storage
		console.log(metricObj)
		StorageMetric.save = metricObj
		// salvo nel DB
		app.saveMetricDB(metricObj);
		// TODO: spostare in una funzione il codice per aggiungere la nuova metrica all'elenco di quelle esistenti (da fare anche per i filtri creati/esistenti)
		const ul = document.getElementById('exist-metrics');
		const content = app.tmplList.content.cloneNode(true);
		const section = content.querySelector('section[data-sublist-metrics]');
		const div = section.querySelector('div.selectable');
		const spanMetric = div.querySelector('span[metric]');
		const smallTable = div.querySelector('small[table]');
		const smallCube = div.querySelector('small[cube]');
		section.removeAttribute('hidden');
		section.setAttribute('data-element-search', 'search-exist-metrics');
		section.setAttribute('data-label', Query.metricName);
		section.setAttribute('data-cube-name', StorageCube.selected.name);
		section.toggleAttribute('data-searchable');

		div.setAttribute('data-label', Query.metricName);
		div.setAttribute('data-table-name', Query.table);
		div.setAttribute('data-table-alias', Query.tableAlias);
		div.setAttribute('data-cube-name', StorageCube.selected.name);
		
		spanMetric.innerText = Query.metricName;
		smallTable.innerText = Query.table;
		smallCube.innerText = StorageCube.selected.name;
		div.onclick = app.handlerMetricSelected;
		ul.appendChild(section);
	}

	app.btnCompositeMetricSave.onclick = (e) => {
		const name = document.getElementById('composite-metric-name').value;
		const alias = document.getElementById('composite-alias-metric').value;
		let arr_text = [], arr_sql = [];
		document.querySelectorAll('#composite-metric-formula *').forEach( element => {
			// console.log('element : ', element);
			// console.log('element : ', element.nodeName);
			// se l'elemento è un <mark> lo aggiungo all'array arr_sql, questo creerà la formula in formato SQL
			if (element.nodeName === 'MARK') {
				StorageMetric.metric = element.innerText;
				// es. SUM(NettoRiga)
				// TODO: verificare se è presente il distinct : true in ogni metrica
				arr_sql.push(`${StorageMetric.metric.formula[element.innerText].SQLFunction}(${StorageMetric.metric.formula[element.innerText].field})`);
			} else {
				arr_sql.push(element.innerText.trim());	
			}
			arr_text.push(element.innerText.trim());
		});
		const formula_text = arr_text.join(' ');
		const formula_sql = arr_sql.join(' ');
		Query.metricName = name;

		let metricObj = {};
		Query.metrics = { formula_text, formula_sql, 'table': Query.table, 'tableAlias' : Query.tableAlias, alias, cube : StorageCube.selected.name };
		metricObj = { 'type': 'METRIC', name, composite : true, 'formula': Query.metrics };

		console.log(metricObj)
		StorageMetric.save = metricObj
		// salvo nel DB
		app.saveMetricDB(metricObj);
		// TODO: spostare in una funzione il codice per aggiungere la nuova metrica all'elenco di quelle esistenti (da fare anche per i filtri creati/esistenti)
		const ul = document.getElementById('exist-metrics');
		const content = app.tmplList.content.cloneNode(true);
		const section = content.querySelector('section[data-sublist-metrics]');
		const div = section.querySelector('div.selectable');
		const spanMetric = div.querySelector('span[metric]');
		const smallTable = div.querySelector('small[table]');
		const smallCube = div.querySelector('small[cube]');
		section.removeAttribute('hidden');
		section.setAttribute('data-element-search', 'search-exist-metrics');
		section.setAttribute('data-label', Query.metricName);
		section.setAttribute('data-cube-name', StorageCube.selected.name);
		section.toggleAttribute('data-searchable');

		div.setAttribute('data-label', Query.metricName);
		div.setAttribute('data-table-name', Query.table);
		div.setAttribute('data-table-alias', Query.tableAlias);
		div.setAttribute('data-cube-name', StorageCube.selected.name);
		
		spanMetric.innerText = Query.metricName;
		smallTable.innerText = Query.table;
		smallCube.innerText = StorageCube.selected.name;
		div.onclick = app.handlerMetricSelected;
		ul.appendChild(section);
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

	// salvataggio del filtro impostato nella dialog-filter
	app.btnFilterSave.onclick = (e) => {
		console.log(Query.table);
		// per i filtri creati sulla Fact, hier e dimension devono essere = null ma và salvato, nel filtro, il nome del cubo a cui accede
		let hier, dimension;
		const textarea = document.getElementById('filterSQLFormula');
		let filterName = document.getElementById('inputFilterName');
		let filterObject = {};
		// TODO: controllo se il nome del filtro, per la stessa dimensione-hier, già esiste
		Query.filterName = filterName.value;
		// la creazione di un filtro su un livello dimensionale salva il filtro con, all'interno, le proprietà dimension e hier.
		// Un filtro impostato la FACT avrà al suo interno il nome del cubo a cui è associato e l'alias della FACT
		if (app.dialogFilter.querySelector('section').hasAttribute('data-hier-name')) {
			hier = app.dialogFilter.querySelector('section').getAttribute('data-hier-name');	
			dimension = app.dialogFilter.querySelector('section').getAttribute('data-dimension-name');
			filterObject = {'type': 'FILTER', 'name': filterName.value, 'table': Query.table, formula : textarea.value, dimension, hier};
		} else {
			filterObject = {'type': 'FILTER', 'name': filterName.value, 'table': Query.table, formula : textarea.value, cube : StorageCube.selected.name, alias : StorageCube.selected.alias};
		}
		StorageFilter.save = filterObject;
		debugger;
		// salvataggio nel DB
		app.saveFilterDB(filterObject);
		// reset del form
		filterName.value = "";
		filterName.focus();
		textarea.value = "";
		// aggiorno la lista dei filtri esistenti, aggiungendo il filtro appena creato
		const ul = document.getElementById('exist-filters');
		const content = app.tmplList.content.cloneNode(true);
		const section = content.querySelector('section[data-sublist-filters]');
		const div = section.querySelector('div.selectable');
		const spanHContent = div.querySelector('.h-content');
		const span = spanHContent.querySelector('span[filter]');
		const smallTable = spanHContent.querySelector('small[table]');
		const smallHier = spanHContent.querySelector('small:last-child');
		section.removeAttribute('hidden');
		section.setAttribute('data-label', Query.filterName);
		section.setAttribute('data-element-search', 'search-exist-filters');
		section.setAttribute('data-dimension-name', dimension);
		section.setAttribute('data-hier-name', hier);
		div.setAttribute('data-label', Query.filterName);
		div.setAttribute('data-table-name', Query.table);
		div.setAttribute('data-table-alias', Query.tableAlias);

		span.innerText = Query.filterName;
		smallTable.innerText = Query.table;
		
		if (dimension !== undefined) {
			div.setAttribute('data-dimension-name', dimension);
			div.setAttribute('data-hier-name', hier);
			div.setAttribute('data-table-id', Query.tableId);
			smallHier.setAttribute('hier', true);
			smallHier.innerText = hier;
		} else {
			section.setAttribute('data-cube-name', StorageCube.selected.name);
			div.setAttribute('data-cube-name', StorageCube.selected.name);
			smallHier.innerText = StorageCube.selected.name;
		}

		div.onclick = app.handlerFilterSelected;
		ul.appendChild(section);
	}

	// tasto OK nella dialogValue
	app.btnValueDone.onclick = () => {
		// recupero tutti i valori selezionati.
		const valueSelected = app.dialogValue.querySelectorAll('#dialog-filter-values .selectable[selected]');
		// TODO: Elaborare un sistema per effettuare la IN(), la BETWEEN, AND, OR, ecc...in base alla selezione dei valori
		const textarea = document.getElementById('filterSQLFormula');
		let arrayValues = [];
		valueSelected.forEach( (element) => {
			arrayValues.push(element.getAttribute('data-label'));
		});
		debugger;
		textarea.value += arrayValues.join(',');
		// textarea.value += e.currentTarget.getAttribute('label');
		
		// TODO: posizionare nella creazione di un nuovo filtro app.checkFilterForm();

		app.dialogValue.close();
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
				console.log(data);
				if (data) {
					const ul = document.getElementById('dialog-filter-values');
					for (const [key, value] of Object.entries(data)) {
						const content = app.tmplList.content.cloneNode(true);
						const section = content.querySelector('section[data-sublist-gen');
						const div = section.querySelector('div.selectable');
						const span = div.querySelector('span');
						section.setAttribute('data-label', value[Query.field]);
						section.setAttribute('data-element-search', 'dialog-value-search');
						section.setAttribute('data-searchable', true);
						div.setAttribute('data-label', value[Query.field]);
						span.innerText = value[Query.field];
						span.id = key;
						div.onclick = app.handlerSelectValue;
						ul.appendChild(section);
					}
				} else {
					// TODO: no data
					console.warning('Dati non recuperati');
				}
			})
		.catch((err) => console.error(err));
	}

	// selezione di uno o più valori dalla lista dei valori della colonna in dialogFilter
	app.handlerSelectValue = e => e.currentTarget.toggleAttribute('selected');

	app.getCubes();

	app.getDimensions();

	app.getHierarchies();

	app.getColumns();

	app.getColumnsFact();

	app.getFilters(); // <ul> exist-filters

	app.getFiltersFact(); // exist-filters : filtri collegati alla Fact

	app.getMetricFilters(); // dialog-metric-filter per le metriche filtrate
	
	app.getMetricFiltersFact(); // dialog-metric-filter filtri appartenenti ai cubi per le metriche filtrate

	app.getTables(); //  elenco tabelle nella dialogFilter

	app.getTablesInDialogFilter();

	app.getFactTable(); // lista delle FACT da visualizzare nello step-2

	app.getMetrics();

	app.getAvailableMetrics();

	app.getProcesses();

	// abilito il tasto btnFilterSave se il form per la creazione del filtro è corretto
	app.checkFilterForm = () => {
		const filterName = document.getElementById('inputFilterName');
		const filterFormula = document.getElementById('filterSQLFormula');
		((filterName.value.length !== 0) && (filterFormula.value.length !== 0)) ? app.btnFilterSave.disabled = false : app.btnFilterSave.disabled = true;
	}

	// selezione di un operatore logica da inserire nella formula (AND, OR, NOT, ecc...)
	// TODO: da rivedere/ricostruire 22.04.2022
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

	// TODO: da ricontrollare 22.04.2022
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
				if (StorageDimension.selectedDimensions.size === 0) {
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
		const hierSelectedCount = document.querySelectorAll('#list-hierarchies .selectable[selected]').length;
		if (hierSelectedCount === 0) {
			App.handlerConsole('Selezionare una gerarchia per poter aggiungere colonne al report', 'warning');
			return;
		} else {
			// recupero le gerarchie selezionate
			// const hierSelected = document.querySelectorAll('#list-hierarchies section[selected]');
			// per ogni gerarchia selezionata aggiungo le tabelle e le colonne in una lista
			app.dialogColumns.showModal();
		}
	}

	// aggiungi filtri (step-2)
	app.btnAddFilters.onclick = (e) => {
		// stessa logica di btnAddColumns
		console.log('addFilters');
		const hierSelectedCount = document.querySelectorAll('#list-hierarchies .selectable[selected]').length;
		if (hierSelectedCount === 0) {
			App.handlerConsole('Selezionare una gerarchia per poter aggiungere colonne al report', 'warning');
			return;
		} else {
			app.dialogFilter.showModal();
		}
	}

	// aggiungi metriche (step-2)
	app.btnAddMetrics.onclick = (e) => {
		// verifico se è stato selezionato almeno un cubo
		const cubeSelectedCount = document.querySelectorAll('#list-fact-tables .selectable[selected]').length;
		if (cubeSelectedCount === 0) {
			App.handlerConsole('Selezionare un Cubo per poter aggiungere metriche al report', 'warning');
			return;
		} else {
			app.dialogMetric.showModal();
		}
	}

	// aggiungi metrica composta
	app.btnAddCompositeMetrics.onclick = (e) => {
		const cubeSelectedCount = document.querySelectorAll('#list-fact-tables .selectable[selected]').length;
		if (cubeSelectedCount === 0) {
			App.handlerConsole('Selezionare un Cubo per poter aggiungere metriche al report', 'warning');
			return;
		} else {
			// TODO: popola la #ul-metrics
			// recupero i cubi selezionati
			const selectedCubes = document.querySelectorAll('#list-fact-tables .selectable[selected]');
			// per ogni cubo selezionato ne recupero le metriche ad esso appartenenti
			const ul = document.getElementById('ul-metrics');
			selectedCubes.forEach( cube => {
				const cubeName = cube.getAttribute('data-cube-name');
				// for (const [key, value] of Object.entries(StorageMetric.getCubeMetrics(cubeName)) ) {
				// ripulisco la lista, prima di popolarla
				document.querySelectorAll('#ul-metrics > section').forEach( item => item.remove());
				StorageMetric.getCubeMetrics(cubeName).forEach( metric => {
					const contentElement = app.tmplList.content.cloneNode(true);
					const section = contentElement.querySelector('section[data-sublist-metrics]');
					const div = section.querySelector('div.selectable');
					const spanHContent = div.querySelector('.h-content');
					const span = spanHContent.querySelector('span[metric]');
					const smallTable = spanHContent.querySelector('small[table]');
					const smallCube = spanHContent.querySelector('small[cube]');
					section.hidden = false;
					section.setAttribute('data-element-search', 'search-exist-metrics');
					// nome metrica
					section.setAttribute('data-label', metric.name);
					section.setAttribute('data-cube-name', cubeName);
					div.setAttribute('data-table-name', metric.formula[metric.name].table);
					div.setAttribute('data-table-alias', metric.formula[metric.name].tableAlias);
					div.setAttribute('data-cube-name', cubeName);
					div.setAttribute('data-label', metric.name);
					div.onclick = app.handlerMetricSelectedComposite;
					span.innerText = metric.name;
					smallTable.innerText = metric.formula[metric.name].table;
					smallCube.innerText = cubeName;
					ul.appendChild(section);
				});
			});
			app.dialogCompositeMetric.showModal();
		}
	}

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

	app.btnSaveReport.onclick = (e) => app.dialogSaveReport.showModal();

	// salvo il report da processare
	app.btnSaveReportDone.onclick = () => {
		// console.dir(Query);
		debugger;
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

	// apro la dialog-metric-filter
	app.btnSetMetricFilter.onclick = () => app.dialogMetricFilter.showModal();

	// visualizzo la lista dei report da processare
	app.btnProcessReport.onclick = () => {
		const listReportProcess = document.getElementById('reportProcessList');
		listReportProcess.toggleAttribute('hidden');
	}

	// app.btnSearchValue.addEventListener('click', () => app.dialogValue.showModal());
	// apertura dialog-value per ricerca dei valori all'interno del database relativo alla colonna selezionata
	app.btnSearchValue.onclick = (e) => {
		app.getDistinctValues();
		app.dialogValue.showModal();
	}

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
	}

	app.checkDialogMetric = () => {
		const metricName = document.getElementById('metric-name').value;
		const aliasMetric = document.getElementById('alias-metric').value;
		(metricName.length !== 0 && aliasMetric.length !== 0) ? app.btnMetricSave.disabled = false : app.btnMetricSave.disabled = true;
	}

	app.checkDialogCompositeMetric = () => {
		const name = document.getElementById('composite-metric-name').value;
		const alias = document.getElementById('composite-alias-metric').value;
		(name.length !== 0 && alias.length !== 0) ? app.btnCompositeMetricSave.disabled = false : app.btnCompositeMetricSave.disabled = true;
	}

	document.getElementById('alias-metric').oninput = () => app.checkDialogMetric();

	document.getElementById('metric-name').oninput = () => app.checkDialogMetric();

	document.getElementById('composite-metric-name').oninput = () => app.checkDialogCompositeMetric();
	
	document.getElementById('composite-alias-metric').oninput = () => app.checkDialogCompositeMetric();

	document.getElementById('inputFilterName').oninput = () => app.checkFilterForm();

	document.getElementById('filterSQLFormula').oninput = () => app.checkFilterForm();

	// selezione di una funzione di aggregazione (dialog-metric)
	app.aggregationFunction.querySelectorAll('section > .selectable').forEach( (fn) => {
		fn.onclick = (e) => {
			// deseleziono altre funzioni di aggregazione precedentemente selezionate e seleziono quella e.target
			document.querySelector('#ul-aggregation-functions .selectable[selected]').toggleAttribute('selected');
			// console.log('e.currentTarget : ', e.currentTarget);
			e.currentTarget.toggleAttribute('selected');
		}
	});

	// Salva nella dialogColumns
	app.btnSaveColumn.onclick = (e) => {
		let hier, field;
		// le colonne di una Fact non hanno data-hier-name
		if (app.dialogColumns.querySelector('section').hasAttribute('data-hier-name')) {
			hier = app.dialogColumns.querySelector('section').getAttribute('data-hier-name');
			StorageDimension.selected = app.dialogColumns.querySelector('section').getAttribute('data-dimension-name');
		}
		const alias = document.getElementById('columnAlias').value;
		const textarea = (document.getElementById('columnSQL').value.length === 0) ? null : document.getElementById('columnSQL').value;
		// NOTE: in SQLReport avrò un custom SQL utilizzabile solo nel report che si sta creando. La prop SQL, all'interno dei singoli field, determinano la customSQL impostata sulla Dimensione.
		Query.select = { table: Query.table, tableAlias : Query.tableAlias, field: Query.field, SQLReport: textarea, alias };
		if (app.dialogColumns.querySelector('section').hasAttribute('data-hier-name')) {
			Query.addTables(hier);
			// verifico quali relazioni inserire in where e quindi anche in from
			app.checkRelations(hier);	
		}		
		document.getElementById('columnAlias').value = '';
	}

	app.btnMapping.onclick = () => location.href = '/mapping';

	app.btnBackPage.onclick = () => window.location.href = '/';

	// TODO: queste 3 funzioni che riguardano i tooltip vanno posizionate in Application.js, rendendole disponibili per tutte le pagine
	app.showTooltip = (e) => {
		// TODO: da spostare in Application.js
		if (e.target.classList.contains('md-inactive')) return;
		// console.log(e.target.getAttribute('data-tooltip').length);
		// console.log('enter');
		// const toast = document.getElementById('toast');
		// console.log('pageX : ', e.pageX);
		// console.log('pageY : ', e.pageY);
		// console.log('screen-x : ', e.screenX);
		// console.log('offset-x : ', e.offsetX);
		// console.log('offset-y : ', e.offsetY);
		// console.log('client-x : ', e.clientX);
		// console.log('client-y : ', e.clientY);
		// console.log(e.target.getBoundingClientRect().top);
		// console.log(e.target.getBoundingClientRect().right);
		// console.log(e.target.getBoundingClientRect().bottom);
		// console.log('left : ',e.target.getBoundingClientRect().left);
		const pos = () => {
			let x,y;
			const left = e.target.getBoundingClientRect().left;
			const right = e.target.getBoundingClientRect().right;
			const top = e.target.getBoundingClientRect().top;
			const bottom = e.target.getBoundingClientRect().bottom;
			let centerElementW = left + ((right - left) / 2);
			let centerElementH = top + ((bottom - top) / 2);
			app.tooltip.innerHTML = e.currentTarget.getAttribute('data-tooltip');
			const elementWidth = app.tooltip.offsetWidth / 2;
			const elementHeight = app.tooltip.offsetHeight / 2;
			const width = app.tooltip.offsetWidth;
			const height = app.tooltip.offsetHeight;
			switch (e.target.getAttribute('data-tooltip-position')) {
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
		
		app.tooltip.style.setProperty('--left', pos().x + "px");
		// app.tooltip.style.setProperty('--left', xPosition + "px");
		app.tooltip.style.setProperty('--top', pos().y + "px");
		// app.tooltip.style.setProperty('--top', yPosition + "px");
		if (e.target.hasAttribute('data-open-abs-window')) {
			// tasto versionamento, mostro la abs-window
			app.absWindow.style.setProperty('--left', pos().x + 'px');
			app.absWindow.style.setProperty('--top', pos().y + 'px');
			app.absWindow.hidden = false;
		}
		// app.popup.classList.add('show');
		app.tooltipTimeoutId = setTimeout(() => {
			// se il tooltip non contiene un testo non deve essere mostrato
			if (e.target.getAttribute('data-tooltip').length !== 0) app.tooltip.classList.add('show');
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
		// console.log('leave');
		if (e.target.classList.contains('md-inactive')) return;
		app.tooltip.classList.remove('show');
		clearTimeout(app.tooltipTimeoutId);
		if (e.target.hasAttribute('data-open-abs-window')) {
			// tasto versionamento, mostro la abs-window
			app.absWindow.hidden = true;
		}
	}

	// eventi mouseEnter/Leave su tutte le icon con l'attributo data-tooltip
	document.querySelectorAll('*[data-tooltip]').forEach((icon) => {
		icon.onmouseenter = app.showTooltip;
		icon.onmouseleave = app.hideTooltip;
	});

	// NOTE: esempio di utilizzo di MutationObserver
	/*
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
	observer.observe(columnName, {subtree: true, childList: true, attributes: true});
	*/

})();
