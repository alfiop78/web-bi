var App = new Application();
var Query = new Queries();
var StorageDimension = new DimensionStorage();
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
		tmplSublists : document.getElementById('template-sublists'),

		// popup
		popup: document.getElementById('popup'),
		dialogPopup: null,

		// btn
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
		btnCompositeMetricDone : document.getElementById('btnCompositeMetricDone'),
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

	app.addReport = (token, value) => {
		const ul = document.getElementById('ul-processes');
		const content = app.tmplList.content.cloneNode(true);
		const section = content.querySelector('section[data-sublist-processes]');
		const span = section.querySelector('span[data-process]');
		const iEdit = section.querySelector('i[data-edit]');
		const iCopy = section.querySelector('i[data-copy]');
		const iSchedule = section.querySelector('i[data-schedule]');
		section.dataset.elementSearch = 'search-process';
		section.dataset.label = value.name; // per la ricerca
		span.innerText = value.name;
		iEdit.dataset.id = value.report.processId;
		iEdit.dataset.processToken = token;
		iCopy.dataset.id = value.report.processId;
		iCopy.dataset.processToken = token;
		iSchedule.dataset.id = value.report.processId;
		iSchedule.dataset.processToken = token;
		iEdit.onclick = app.handlerReportEdit;
		iCopy.onclick = app.handlerReportCopy;
		iSchedule.onclick = app.handlerReportSelected;
		ul.appendChild(section);
	}

	// creo la lista degli elementi da processare
	app.getReports = () => {
		for (const [token, value] of StorageProcess.processes) {
			// utilizzo addReport() perchè questa funzione viene chiamata anche quando si duplica il report o si crea un nuovo report e viene aggiunto all'elenco
			app.addReport(token, value);
		}
	}

	// carico elenco Cubi su cui creare il report
	app.getCubes = () => {
		const ul = document.getElementById('ul-cubes');
		for (const [token, value] of StorageCube.cubes) {
			const content = app.tmplList.content.cloneNode(true);
			const section = content.querySelector('section[data-sublist-gen]');
			const div = section.querySelector('div.selectable');
			const span = section.querySelector('span');
			section.hidden = false;
			section.dataset.elementSearch = 'search-cube';
			section.dataset.label = value.name;
			section.toggleAttribute('data-searchable');
			section.dataset.cubeToken = token;
			div.dataset.label = value.name;
			div.dataset.cubeToken = token;
			div.dataset.tableAlias = value.alias;
			div.dataset.tableName = value.FACT;
			span.innerText = value.name;
			div.onclick = app.handlerCubeSelected;
			ul.appendChild(section);
		}
	}

	// lista dimensioni
	app.getDimensions = () => {
		const ul = document.getElementById('ul-dimensions');
		for (const [token, cubeValue] of StorageCube.cubes) {
			// console.log('key : ', cubeName);
			// console.log('value : ', cubeValue); // tutto il contenuto del cubo
			// console.log('dimensioni associate : ', cubeValue.associatedDimensions);
			// per ogni dimensione presente in associatedDimensions inserisco un element (preso dal template app.tmplListField)
			cubeValue.associatedDimensions.forEach( tokenDimension => {
				// TODO: recupero le proprietà della dimensione dallo storage
				StorageDimension.selected = tokenDimension;
				const content = app.tmplList.content.cloneNode(true);
				const section = content.querySelector('section[data-sublist-gen]');
				const div = section.querySelector('div.selectable');
				const span = section.querySelector('span');
				section.hidden = true;
				section.dataset.elementSearch = 'search-dimension';
				section.dataset.label = StorageDimension.selected.name;
				section.dataset.dimensionToken = tokenDimension;
				section.dataset.cubeToken = token;
				div.dataset.dimensionToken = tokenDimension;
				// section.dataset.dimensionName = dimension;
				// div.dataset.dimensionName = dimension;
				span.innerText = StorageDimension.selected.name;
				div.onclick = app.handlerDimensionSelected;
				ul.appendChild(section);
			});
		}
	}

	// lista gerarchie
	app.getHierarchies = () => {
		// imposto un data-dimension-id/name sugli .element della lista gerarchie, in questo modo posso filtrarle quando seleziono le dimensioni nello step precedente
		// const content = app.tmplUlList.content.cloneNode(true);
		const ul = document.getElementById('ul-hierarchies');
		// ottengo l'elenco delle gerarchie per ogni dimensione presente in storage, successivamente, quando la dimensione viene selezionata, visualizzo/nascondo solo quella selezionata
		// console.log('lista dimensioni :', StorageDimension.dimensions);
		// per ogni dimensione presente aggiungo gli elementi nella ul con le gerarchie
		for (const [token, dimValue] of StorageDimension.dimensions ) {
			// per ogni dimensione presente in associatedDimensions inserisco un element (preso dal template app.tmplListField)
			for (const [hierToken, hier] of (Object.entries(dimValue.hierarchies)) ) {
				const contentElement = app.tmplList.content.cloneNode(true);
				const section = contentElement.querySelector('section[data-sublist-gen]');
				const div = section.querySelector('div.selectable');
				const vContent = div.querySelector('.v-content');
				const span = vContent.querySelector('span[item]');
				section.dataset.label = hier.name;
				section.dataset.elementSearch = 'search-hierarchy';
				section.dataset.dimensionToken = token;
				div.dataset.label = hier.name;
				div.dataset.dimensionToken = token;
				div.dataset.hierToken = hierToken;
				div.addEventListener('click', app.handlerHierarchySelected);
				span.innerText = hier.name;
				span.dataset.hierName = hier.name;
				span.dataset.dimensionName = dimValue.name;
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
		const ul = document.getElementById('ul-columns');
		// per ogni dimensione, recupero la property 'columns'
		// console.log('StorageDimension.selected : ', StorageDimension.dimensions);
		for (const [dimToken, value] of StorageDimension.dimensions) {
			// key : nome della dimensione
			// value : tutte le property della dimensione
			for (const [hierToken, hierValue] of Object.entries(value.hierarchies)) {
				// per ogni gerarchia...
				for (const [tableId, table] of Object.entries(hierValue.order)) {
					// verifico se la tabella in ciclo ha delle colonne mappate					
					if (hierValue.columns.hasOwnProperty(table.alias)) {
						for (const [token, field] of Object.entries(hierValue.columns[table.alias])) {
							// console.log('field : ', field);
							const content = app.tmplList.content.cloneNode(true);
							const section = content.querySelector('section[data-sublist-columns]');
							const spanHContent = section.querySelector('.h-content');
							const selectable = spanHContent.querySelector('.selectable');
							const span = selectable.querySelector('span[column]');
							const smallTable = selectable.querySelector('small[table]');
							const smallHier = selectable.querySelector('small:last-child');
							const i = spanHContent.querySelector('i');

							section.dataset.label = field.ds.field;
							section.dataset.elementSearch = 'search-columns';
							section.dataset.dimensionToken = dimToken;
							section.dataset.hierToken = hierToken;
							selectable.dataset.label = field.ds.field;
							selectable.dataset.tableName = table.table;
							selectable.dataset.tableAlias = table.alias;
							selectable.dataset.tableId = tableId;
							selectable.dataset.dimensionToken = dimToken;
							selectable.dataset.hierToken = hierToken;
							selectable.dataset.tokenColumn = token;
							selectable.onclick = app.handlerSelectColumn;
							i.onclick = app.handlerColumnEdit;
							span.innerText = field.ds.field;
							smallTable.innerText = table.table;
							smallHier.innerText = hierValue.name;
							ul.appendChild(section);
						}
					}
				}
			}
		}
	}

	// recupero le colonne agganciate alla fact, proprietà columns nel json, per aggiungerle nelle dialog-column
	app.getColumnsFact = () => {
		const ul = document.getElementById('ul-columns-fact');
		for (const [cubeToken, value] of StorageCube.cubes) {
			if (value.columns.hasOwnProperty(value.alias)) {
				for (const [token, field] of Object.entries(value.columns[value.alias])) {
					// console.log('field : ', field);
					const content = app.tmplList.content.cloneNode(true);
					const section = content.querySelector('section[data-sublist-columns]');
					const spanHContent = section.querySelector('.h-content');
					const selectable = spanHContent.querySelector('.selectable');
					const span = selectable.querySelector('span[column]');
					const smallTable = selectable.querySelector('small[table]');
					const smallCube = selectable.querySelector('small:last-child');
					const i = spanHContent.querySelector('i');

					section.dataset.label = field.ds.field;
					section.dataset.elementSearch = 'search-columns';
					section.dataset.cubeToken = cubeToken;
					selectable.dataset.label = field.ds.field;
					selectable.dataset.tableName = value.FACT;
					selectable.dataset.tableAlias = value.alias;
					selectable.dataset.tokenColumn = token;
					selectable.dataset.cubeToken = cubeToken;
					selectable.onclick = app.handlerSelectColumn;
					i.onclick = app.handlerColumnEdit;
					span.innerText = field.ds.field;
					smallTable.innerText = value.FACT;
					smallCube.innerText = value.name;
					ul.appendChild(section);
				}
			}
		}
	}

	// popolo la lista dei filtri esistenti
	app.getFilters = () => {
		const ul = document.getElementById('ul-exist-filters');
		// console.log('filters : ', StorageFilter.filters);
		for (const [dimToken, dimValue] of StorageDimension.dimensions) {
			// per ogni dimensione recupero i filtri appartenenti ad essa
			for (const [hierToken, hier] of (Object.entries(dimValue.hierarchies)) ) {
				// per ogni gerarchia...
				for (const [tableId, table] of Object.entries(hier.order)) {
					// per ogni tabella...
					const filters = StorageFilter.getFiltersByDimension(dimToken, hierToken, table.table);
					if (filters.size > 0) {
						// se sono presenti filtri per questa tabella
						filters.forEach( (filter) => {
							const contentElement = app.tmplList.content.cloneNode(true);
							const section = contentElement.querySelector('section[data-sublist-filters]');
							const spanHContent = section.querySelector('.h-content');
							const selectable = spanHContent.querySelector('.selectable');
							const span = selectable.querySelector('span[filter]');
							const smallTable = selectable.querySelector('small[table]');
							const smallHier = selectable.querySelector('small:last-child');
							const iEdit = spanHContent.querySelector('i');
							section.dataset.elementSearch = 'search-exist-filters';
							section.dataset.label = filter.name;
							section.dataset.dimensionToken = filter.dimensionToken;
							section.dataset.hierToken = hierToken;
							selectable.dataset.filterToken = filter.token;
							selectable.dataset.dimensionToken = filter.dimensionToken;
							selectable.dataset.hierToken = hierToken;
							selectable.dataset.tableName = filter.table;
							selectable.dataset.tableAlias = table.alias;
							selectable.dataset.tableId = tableId;
							selectable.onclick = app.handlerFilterSelected;
							span.innerText = filter.name;
							smallTable.innerText = table.table;
							smallHier.setAttribute('hier', true); // TODO: dataset
							iEdit.onclick = app.handlerFilterEdit; // TODO: da implementare
							smallHier.innerText = hier.name;
							ul.appendChild(section);
						});
					}
				}
			}
		}
	}

	app.getFiltersFact = () => {
		// TODO: 2022-05-24 da rivedere - branch editReport
		const ul = document.getElementById('ul-exist-filters');
		for (const [cubeToken, value] of StorageCube.cubes) {
			// TODO: 
			StorageFilter.getFiltersByCube(cubeToken).forEach( (filter) => {
				// console.log('filter : ', filter);
				const content = app.tmplList.content.cloneNode(true);
				const section = content.querySelector('section[data-sublist-filters]');
				const spanHContent = section.querySelector('.h-content');
				const selectable = spanHContent.querySelector('.selectable');
				const span = selectable.querySelector('span[filter]');
				const smallTable = selectable.querySelector('small[table]');
				const smallCube = selectable.querySelector('small:last-child');
				section.dataset.elementSearch = 'search-exist-filters';
				section.dataset.label = filter.name;
				section.dataset.cubeToken = cubeToken;
				selectable.dataset.tableName = value.FACT;
				selectable.dataset.tableAlias = value.alias;
				selectable.dataset.cubeToken = cubeToken;
				selectable.dataset.filterToken = filter.token;
				selectable.onclick = app.handlerFilterSelected;
				span.innerText = filter.name;
				smallTable.innerText = value.FACT;
				smallCube.innerText = value.name;
				ul.appendChild(section);
			});
		}
	}

	// visualizzo metriche / filtri appartenenti al cubo
	app.showCubeObjects = () => {
		document.querySelectorAll("ul > section.data-item[data-cube-token='" + StorageCube.selected.token + "']").forEach( item => {
			item.hidden = false;
			item.toggleAttribute('data-searchable');
		});
	}

	app.hideCubeObjects = () => {
		document.querySelectorAll("ul > section.data-item[data-cube-token='" + StorageCube.selected.token + "']").forEach( item => {
			item.hidden = true;
			item.toggleAttribute('data-searchable');
		});
	}

	app.showDimensions = () => {
		// visualizzo la <ul> contentente le dimensioni appartenenti al cubo selezionato
		document.querySelectorAll("#ul-dimensions > section[data-cube-token='" + StorageCube.selected.token + "']").forEach((dimension) => {
			// console.log('Dimensioni del cubo selezionato : ', dimension);
			dimension.hidden = false;
			dimension.dataset.searchable = true;
		});
	}

	app.hideDimensions = () => {
		document.querySelectorAll("#ul-dimensions > section[data-cube-token='" + StorageCube.selected.token + "']").forEach((table) => {
			table.hidden = true;
			table.toggleAttribute('data-searchable');
		});
	}

	app.showHierarchies = () => {
		document.querySelectorAll("#ul-hierarchies > section[data-dimension-token='" + StorageDimension.selected.token + "']").forEach( (hier) => {
			hier.hidden = false;
			hier.dataset.searchable = true;
		});
	}

	app.hideHierarchies = () => {
		document.querySelectorAll("#ul-hierarchies > section[data-dimension-token='" + StorageDimension.selected.token + "']").forEach((hier) => {
			hier.hidden = true;
			hier.removeAttribute('data-searchable');
		});
	}

	app.showAllElements = () => {
		// per ogni dimensione in #elementDimension...
		for ( const [token, value] of Query.elementHierarchy) {
			document.querySelectorAll("ul > section.data-item[data-dimension-token='" + value.dimensionToken + "'][data-hier-token='" + token + "']").forEach( (item) => {
				item.hidden = false;
				item.toggleAttribute('data-searchable');
			});
		}
	}

	app.hideAllElements = () => {
		for ( const [token, value] of Query.elementHierarchy) {
			document.querySelectorAll("ul section.data-item[data-dimension-token='" + value.dimensionToken + "'][data-hier-token='" + token + "']").forEach( (item) => {
				item.hidden = true;
				item.toggleAttribute('data-searchable');
			});
		}
	}

	// popolo la lista dei filtri esistenti nella dialog metric-filter (metriche filtrate)
	app.getMetricFilters = () => {
		const ul = document.getElementById('ul-metric-filter');
		// console.log('filters : ', StorageFilter.filters);
		for (const [token, dimValue] of StorageDimension.dimensions ) {
			// per ogni dimensione recupero i filtri a questa appartenenti
			for (const [hierName, hier] of (Object.entries(dimValue.hierarchies)) ) {
				// per ogni gerarchia...
				for (const [tableId, table] of Object.entries(hier.order)) {
					// per ogni tabella...
					const filters = StorageFilter.getFiltersByDimension(token, hierName, table.table);
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
							section.dataset.elementSearch = 'search-exist-filters';
							section.dataset.label = filter.name;
							section.dataset.dimensionName = filter.dimension;
							section.dataset.hierName = filter.hier;
							div.dataset.label = filter.name;
							div.dataset.elementSearch = 'search-exist-filters';
							div.dataset.dimensionName = filter.dimension;
							div.dataset.hierName = filter.hier;
							div.dataset.tableName = filter.table;
							div.dataset.tableAlias = table.alias;
							div.dataset.tableId = tableId;
							div.onclick = app.handlerMetricFilterSelected;
							span.innerText = filter.name;
							smallTable.innerText = table.table;
							smallHier.setAttribute('hier', true); // TODO: dataset
							smallHier.innerText = hierName;
							ul.appendChild(section);
						});
					}
				}
			}
		}
	}

	

	// popolamento delle tabelle nella dialogFilter
	app.getTables = () => {
		const ul = document.getElementById('ul-tables');
		for (const [token, value] of StorageDimension.dimensions) {
			// key : nome della dimensione
			// value : tutte le property della dimensione
			for (const [hierToken, hierValue] of Object.entries(value.hierarchies)) {
				for (const [tableId, table] of Object.entries(hierValue.order)) {
					// console.log('tableId : ', tableId);
					// console.log('table : ', table);
					const content = app.tmplList.content.cloneNode(true);
					const section = content.querySelector('section[data-sublist-tables]');
					const div = section.querySelector('div.selectable');
					const spanHContent = div.querySelector('.h-content');
					const span = spanHContent.querySelector('span[table]');
					const smallHier = spanHContent.querySelector('small');

					section.dataset.dimensionToken = token;
					section.dataset.hierToken = hierToken;
					section.dataset.label = table.table;
					section.dataset.tableName = table.table;
					section.dataset.elementSearch = 'search-tables';
					div.dataset.dimensionToken = token;
					div.dataset.hierToken = hierToken;
					div.dataset.hierName = hierValue.name;
					div.dataset.tableName = table.table;
					div.dataset.tableAlias = table.alias;
					div.dataset.schema = table.schema;
					div.dataset.tableId = tableId;
					div.onclick = app.handlerSelectTable;
					span.innerText = table.table;
					smallHier.innerText = hierValue.name;
					ul.appendChild(section);
				}
			}
		}
	}

	app.getTablesInDialogFilter = () => {
		const ul = document.getElementById('ul-fact');
		for (const [token, value] of StorageCube.cubes) {
			const content = app.tmplList.content.cloneNode(true);
			const section = content.querySelector('section[data-sublist-tables]');
			const div = section.querySelector('div.selectable');
			const spanHContent = div.querySelector('.h-content');
			const span = spanHContent.querySelector('span[table]');
			const small = spanHContent.querySelector('small');
			section.dataset.label = value.FACT;
			section.dataset.cubeToken = token;
			// section.dataset.tableAlias = value.alias;
			// section.dataset.schemaName = value.schema; // WARN: normalizzare i nomi (data-schema oppure schema-name ?)
			div.dataset.label = value.FACT;
			div.dataset.tableName = value.FACT;
			div.dataset.tableAlias = value.alias;
			div.dataset.schema = value.schema;
			div.dataset.cubeToken = token;
			div.onclick = app.handlerSelectTable;
			span.innerText = value.FACT;
			small.innerText = value.name;
			ul.appendChild(section);
		}
	}

	// lista tabelle Fact (step 1)
	app.getFactTable = () => {
		const ul = document.getElementById('ul-fact-tables');
		for (const [token, value] of StorageCube.cubes) {
			const content = app.tmplList.content.cloneNode(true);
			const section = content.querySelector('section[data-sublist-gen]');
			const div = section.querySelector('div.selectable');
			const span = div.querySelector('span');
			section.classList.remove('data-item');
			div.classList.remove('selectable');
			section.dataset.cubeToken = token;
			span.innerText = value.FACT;
			ul.appendChild(section);
		}
	}

	// lista metriche esistenti
	app.getMetrics = () => {
		const ul = document.getElementById('ul-exist-metrics');
		for (const [cubeToken, value] of StorageCube.cubes) {
			StorageMetric.cubeMetrics = cubeToken;
			// recupero le metriche di base 0, base composte 1, avanzate 2
			// console.log(StorageMetric.baseAdvancedMetrics.size);
			StorageMetric.baseAdvancedMetrics.forEach( metric => {
				// console.log('metric : ', metric);
				const contentElement = app.tmplList.content.cloneNode(true);
				const section = contentElement.querySelector('section[data-sublist-metrics]');
				const spanHContent = section.querySelector('.h-content');
				const selectable = spanHContent.querySelector('.selectable');
				const span = spanHContent.querySelector('span[metric]');
				const smallTable = spanHContent.querySelector('small[table]');
				const smallCube = spanHContent.querySelector('small[cube]');
				const iEdit = spanHContent.querySelector('i');
				section.dataset.elementSearch = 'search-exist-metrics';
				section.dataset.label = metric.name;
				section.dataset.cubeToken = cubeToken;
				if (metric.metric_type !== 1) {
					selectable.dataset.tableName = value.FACT;
					selectable.dataset.tableAlias = value.alias;
				} else {
					// metricha di base composta
					selectable.dataset.cubeToken = cubeToken;
				}
				// div.dataset.cubeToken = cubeToken;
				selectable.dataset.metricToken = metric.token;
				// div.dataset.label = metric.name;
				selectable.onclick = app.handlerMetricSelected;
				iEdit.onclick = app.handlerMetricEdit; // TODO: implementare
				span.innerText = metric.name;
				smallTable.innerText = value.FACT;
				smallCube.innerText = value.name;
				ul.appendChild(section);
			});
		}
	}

	// lista metriche composte
	app.getCompositeMetrics = () => {
		const ul = document.getElementById('ul-exist-composite-metrics');
		// TODO: 2022-05-27 in futuro ci sarà da valutare metriche composte appartenenti a più cubi
		StorageMetric.compositeMetrics.forEach( metric => {
			const contentElement = app.tmplList.content.cloneNode(true);
			const section = contentElement.querySelector('section[data-sublist-metrics]');
			const spanHContent = section.querySelector('.h-content');
			const selectable = spanHContent.querySelector('.selectable');
			const span = spanHContent.querySelector('span[metric]');
			// non esiste nessun cubo legato a una metrica composta, quindi la rendo subito visibile
			section.hidden = false;
			// const smallTable = spanHContent.querySelector('small[table]');
			// const smallCube = spanHContent.querySelector('small[cube]');
			section.dataset.elementSearch = 'search-exist-metrics';
			section.dataset.label = metric.name; // ricerca
			// section.dataset.cubeToken = cubeToken;
			selectable.dataset.metricToken = metric.token;
			// selectable.dataset.tableName = value.FACT;
			// selectable.dataset.tableAlias = value.alias;
			// selectable.dataset.cubeToken = cubeToken;
			selectable.onclick = app.handlerMetricSelected;
			span.innerText = metric.name;
			ul.appendChild(section);
		});
	}

	// lista delle metriche disponibili nei cubi
	app.getAvailableMetrics = () => {
		const ul = document.getElementById('ul-available-metrics');
		for (const [token, value] of StorageCube.cubes) {
			// console.log(key, value);
			// per ogni metrica
			// console.log(value.metrics[value.FACT]);
			for ( const [name, metric] of Object.entries(value.metrics) ) {
			// value.metrics[value.FACT].forEach( (metric) => {
				const content = app.tmplList.content.cloneNode(true);
				const section = content.querySelector('section[data-sublist-available-metrics]');
				const div = section.querySelector('div.selectable');
				const spanHContent = div.querySelector('.h-content');
				const span = div.querySelector('span[metric]');
				const small = div.querySelector('small');
				section.dataset.label = name;
				section.dataset.cubeToken = token;
				section.dataset.tableAlias = value.alias;
				section.dataset.tableName = value.FACT;
				section.dataset.elementSearch = 'search-available-metrics';
				div.dataset.tableAlias = value.alias;
				div.dataset.tableName = value.FACT;
				div.dataset.label = name;
				div.dataset.cubeToken = token;
				div.dataset.metricType = metric.metric_type;
				div.onclick = app.handlerMetricAvailable;
				span.innerText = name;
				small.innerText = value.FACT;
				ul.appendChild(section);
			};
		}
	}

	// execute report
 	app.handlerReportSelected = async (e) => {
		console.clear();
		const processToken = e.currentTarget.dataset.processToken;
		const reportId = +e.currentTarget.dataset.id;
		let jsonDataParsed = JSON.parse(window.localStorage.getItem(processToken));
		console.dir(jsonDataParsed.report);
		// invio, al fetchAPI solo i dati della prop 'report' che sono quelli utili alla creazione del datamart
		const params = JSON.stringify(jsonDataParsed.report);
		App.showConsole('Process in corso...', 'info');
		// chiudo la lista dei report da eseguire
		const listReportProcess = document.getElementById('reportProcessList');
		listReportProcess.toggleAttribute('hidden');
		// lo processo in post, come fatto per il salvataggio del process. La richiesta in get potrebbe superare il limite consentito nella url, come già successo per saveReport()
		const url = "/fetch_api/cube/process";
		const init = {headers: {'Content-Type': 'application/json'}, method: 'POST', body: params};
		const req = new Request(url, init);
		await fetch(req)
			.then((response) => {
				if (!response.ok) {
					// console.log('response : ', response);
					throw Error(response.statusText);
				}
				return response;
			})
			.then((response) => response.json())
			.then((response) => {
				if (response) {
					App.closeConsole();
					App.showConsole('Datamart creato con successo!', 'done', 5000);
					console.log('data : ', response);
					// NOTE: qui ho creato la FX, a questo punto potrei scegliere di visualizzare il report, per il momento mi serve solo la FX.
					// app.getDatamart(reportId, jsonDataParsed); // recupero i dati dalla FX appena creata
				} else {
					// TODO: no response
					console.debug('FX non è stata creata');
					App.showConsole('Errori nella creazione del datamart', 'error', 5000);
				}
			})
			.catch((err) => {
				App.showConsole(err, 'error');
				console.error(err);
			});
	}

	app.handlerReportEdit = (e) => {
		StorageProcess.selected = e.currentTarget.dataset.processToken;
		// imposto il processToken e il processId in modo da andare a sovrascrivere il report esistente quando si salva
		Query.processId = StorageProcess.selected.report.processId;
		Query.token = StorageProcess.selected.token;
		// converto in oggetto Map
		const cubes = new Map(Object.entries(StorageProcess.selected.edit.cubes));
		// seleziono il cubo/i utilizzati nel report (prop factJoin -> dimensioni utilizzate -> cubi utilizzati)
		for (const [token, cube] of cubes) {
			// console.log(token + ' = ' + cube.tableAlias);
			// #ul-cubes visualizzo e seleziono il cubo presente nella lista
			document.querySelector("#ul-cubes > section[data-cube-token='" + token + "'] .selectable").setAttribute('selected', true);
			// reimposto tutto come se avessi fatto clic per selezionare il cubo, in app.handlerCubeSelected()
			StorageCube.selected = token;
			Query.tableAlias = StorageCube.selected.alias;
			Query.from = `${StorageCube.selected.schema}.${StorageCube.selected.FACT} AS ${Query.tableAlias}`;
			Query.elementCube = {token : token, tableAlias : cube.tableAlias, from : Query.from};

			// TODO: implementare una funzione, come showAll.... che visualizza/nasconde tutti gli elementi
			app.showDimensions();
			// visualizzo la/e tabelle fact
			document.querySelector("#ul-fact-tables > section[data-cube-token='" + token + "']").hidden = false;
			// visualizzo e seleziono metriche e filtri appartenenti al cubo
			app.showCubeObjects();
		}
		
		// seleziono le dimensioni utilizzate nel report
		const dimensions = new Map(Object.entries(StorageProcess.selected.edit.dimensions));
		for ( const [token, value] of dimensions ) {
			StorageDimension.selected = token;
			Query.factRelation = StorageDimension.selected;
			Query.elementDimension = { token, cubes : StorageDimension.selected.cubes};
			// seleziono la dimensione in ciclo
			document.querySelector("#ul-dimensions > section[data-dimension-token='" + token + "'] .selectable").setAttribute('selected', true);
			// visualizzo le hier relative alla dimensione
			app.showHierarchies();
		}

		// gerarchie
		const hierarchies = new Map(Object.entries(StorageProcess.selected.edit.hierarchies));
		for ( const [token, value] of hierarchies ) {
			Query.elementHierarchy = {dimensionToken : value.dimensionToken, token};
			// seleziono le gerarchie
			document.querySelector("#ul-hierarchies .selectable[data-hier-token='" + token + "']").setAttribute('selected', true);
			// visualizzo tutti gli oggetti relativi alla gerarchia
			app.showAllElements();
		}

		// seleziono i filtri utilizzati nel report
		const filters = new Map(Object.entries(StorageProcess.selected.edit.filters));
		for (const [token, filter] of filters) {
			// seleziono i filtri impostati sul report
			document.querySelector("#ul-exist-filters .selectable[data-filter-token='"+token+"']").setAttribute('selected', true); // TODO: dataset data-selected
			// lo re-imposto come se venisse selezionato
			if (filter.hier) {
				// imposto la firstTable se il filtro appartiene a una dimensione e non a un cubo
				Query.tableId = filter.tableId;
				Query.table = filter.table;
				// debugger;
				// seleziono la dimensione "attiva" perchè serve in checkRelations()
				StorageDimension.selected = filter.dimensionToken;
				Query.addTables(filter.hier);
				app.checkRelations(filter.hier);
				Query.elementFilter = {
					token,
					dimensionToken : StorageDimension.selected.token,
					hier: filter.hier,
					tableAlias : filter.tableAlias,
					formula : filter.formula,
					tableId : filter.tableId,
					table : filter.table
				};
			} else {
				Query.elementFilter = {token, tableAlias : filter.tableAlias, formula : filter.formula, table : filter.table};
			}
			Query.filters = { token, SQL : `${filter.tableAlias}.${filter.formula}` };
		}

		const metrics = new Map(Object.entries(StorageProcess.selected.edit.metrics));
		for (const [token, metric] of metrics) {
			// seleziono le metriche impostate sul report
			document.querySelector("#ul-exist-metrics .selectable[data-metric-token='"+token+"']").setAttribute('selected', true); // TODO: dataset data-selected
			// se la metrica NON ha la prop table è una metrica composta, di base, quindi legata al cubo
			Query.addMetric = {
				token,
				name : metric.name,
				SQLFunction : metric.SQLFunction,
				field : metric.field,
				distinct : metric.distinct,
				alias : metric.alias
			};
		}

		// metriche filtrate
		if (StorageProcess.selected.edit.filteredMetrics) {
			const metrics = new Map(Object.entries(StorageProcess.selected.edit.filteredMetrics));
			for (const [token, metric] of metrics) {
				// seleziono le metriche impostate sul report
				document.querySelector("#ul-exist-metrics .selectable[data-metric-token='"+token+"']").setAttribute('selected', true); // TODO: dataset data-selected
				// se la metrica NON ha la prop table è una metrica composta, di base, quindi legata al cubo
				if (metric.metric_type === 2) {
					// metrica filtrata
					Query.addFilteredMetric = {
						token,
						name : metric.name,
						metric_type : metric.metric_type,
						SQLFunction : metric.SQLFunction,
						field : metric.field,
						distinct : metric.distinct,
						alias : metric.alias,
						filters : metric.filters,
						table : Query.table,
						tableAlias : Query.tableAlias
					};
				} else {
					// metrica composta a livello di cubo filtrata
					Query.addFilteredMetric = {
						token,
						name : metric.name,
						metric_type : metric.metric_type,
						SQLFunction : metric.SQLFunction,
						field : metric.field,
						distinct : metric.distinct,
						alias : metric.alias,
						filters : metric.filters
					};
				}
			}
		}

		// metriche composte
		if (StorageProcess.selected.edit.compositeMetrics) {
			const compositeMetrics = new Map(Object.entries(StorageProcess.selected.edit.compositeMetrics));
			for (const [token, metric] of compositeMetrics) {
				// seleziono le metriche impostate sul report
				document.querySelector("#ul-exist-composite-metrics .selectable[data-metric-token='"+token+"']").setAttribute('selected', true); // TODO: dataset data-selected
				Query.addCompositeMetric = {
					token,
					name : metric.name,
					formula : metric.formula
				};
			}
		}

		// TODO: metriche filtrate

		const columns =new Map(Object.entries(StorageProcess.selected.edit.columns));
		for (const [token, value] of columns) {
			// seleziono le colonne impostate sul report, sia quelle dei livelli dimensionali che quelle della Fact
			// TODO: dataset data-selected
			console.log('value.name : ', value.alias);
			if (value.dimensionToken) {
				// colonna di un livello dimensionale
				Query.table = value.table;
				Query.tableId = value.tableId;
				// dimensione a cui appartiene la colonna da aggiungere
				StorageDimension.selected = value.dimensionToken;
				Query.addTables(value.hier);
				// verifico quali relazioni inserire in where e quindi anche in from
				app.checkRelations(value.hier);
				// le imposto come se fossero state selezionate
				Query.select = { 
					token,
					dimensionToken : value.dimensionToken,
					hier : value.hier,
					tableId : value.tableId,
					table: value.table,
					tableAlias : value.tableAlias,
					field: value.field,
					SQLReport : value.SQLReport,
					alias : value.alias
				};
			} else {
				// colonna appartenente alla Fact
				Query.select = { 
					token,
					// dimensionToken : value.dimensionToken,
					// hier : value.hier,
					// tableId : value.tableId,
					table: value.table,
					tableAlias : value.tableAlias,
					field: value.field,
					SQLReport : value.SQLReport,
					alias : value.alias
				};
			}
			// debugger;
			document.querySelector("#ul-columns .selectable[data-token-column='"+token+"'], #ul-columns-fact .selectable[data-token-column='"+token+"']").setAttribute('selected', true);
		}
		const listReportProcess = document.getElementById('reportProcessList');
		listReportProcess.toggleAttribute('hidden');
	}

	app.handlerReportCopy = (e) => {
		console.clear();
		StorageProcess.selected = e.target.dataset.processToken;
		const process = StorageProcess.selected;
		console.log('process selected : ', process);
		const rand = () => Math.random(0).toString(36).substr(2);
		const newToken = rand().substr(0, 21);
		// modifico il token e il processId
		process.token = newToken;
		process.report.processId = Date.now();
		// salvo il process duplicato con lo stesso nome aggiungendo un prefix _copy_of_
		process.name = '_copy_of_'+process.name;
		// modifico la data creazione e updated
		const date = new Date();
		// const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
		const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
		process.created_at = date.toLocaleDateString('it-IT', options);
		process.updated_at = date.toLocaleDateString('it-IT', options);
		// salvo il process duplicato
		StorageProcess.saveTemp(process);
		// lo aggiungo alla #ul-processes
		app.addReport(process.token, process);
	}

	// edit filter
	app.handlerFilterEdit = (e) => {
		debugger;
	}

	app.handlerMetricEdit = (e) => {
		debugger;
	}

	app.handlerColumnEdit = (e) => {
		debugger;
	}

	// selezione di un cubo (step-1)
	app.handlerCubeSelected = (e) => {
		StorageCube.selected = e.currentTarget.dataset.cubeToken;
		Query.tableAlias = StorageCube.selected.alias;
		Query.from = `${StorageCube.selected.schema}.${StorageCube.selected.FACT} AS ${Query.tableAlias}`;
		// al momento non serve l'object con tableAlias e from, lo recupero direttamente dal nome del cubo in handlerEditReport, se così potrei anche utilizzare un oggetto Set anziche Map in Query.js
		Query.elementCube = {token : e.currentTarget.dataset.cubeToken, tableAlias : StorageCube.selected.alias, from : Query.from, FACT : StorageCube.selected.FACT, name : StorageCube.selected.name};
		// debugger;
		// console.log('cube selected : ', StorageCube.selected.name);
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// Query.addFromCubes(StorageCube.selected.FACT);
			app.showDimensions();
			app.showCubeObjects();
			// visualizzo la tabelle fact del cubo selezionato
			document.querySelector("#ul-fact-tables > section[data-cube-token='" + StorageCube.selected.token + "']").hidden = false;
		} else {

			app.hideDimensions();
			// nascondo tutti gli elementi relativi al cubo deselezionato
			app.hideCubeObjects();
		}
	}

	// selezione delle dimensioni
	app.handlerDimensionSelected = (e) => {
		StorageDimension.selected = e.currentTarget.dataset.dimensionToken;
		console.log('Dimensione selezionata : ', StorageDimension.selected);
		Query.elementDimension = { token : e.currentTarget.dataset.dimensionToken, cubes : StorageDimension.selected.cubes};
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			app.showHierarchies();
			// imposto la relazione tra dimensione -> cubo
			// TODO: utilizzare oggetto Map()
			Query.factRelation = StorageDimension.selected;
			// Query.elementDimension = {token : e.currentTarget.dataset.dimensionToken};
			// imposto, in un object le dimensioni selezionate, questo mi servirà nella dialog-metrics per visualizzare/nascondere solo i filtri appartenenti alle dimensioni selezionate
			// ... probabilmente mi servirà anche nella dialog-filter per lo stesso utilizzo
			// TODO: da rivedere se viene utilizzato, 2022-05-22 al momento sembra che non serve più
			// StorageDimension.add();
		} else {
			app.hideHierarchies();
			// TODO: delete factRelation
			Query.deleteFactRelation(StorageDimension.selected.token);
			// StorageDimension.removeDimension(e.currentTarget.dataset.dimensionToken);
		}
	}

	// selezione di una gerarchia (step-2)
	app.handlerHierarchySelected = (e) => {
		e.currentTarget.toggleAttribute('selected');
		StorageDimension.selected = e.currentTarget.dataset.dimensionToken;
		if (e.currentTarget.hasAttribute('selected')) {
			// visualizzo tutti gli elementi (columns, filters) relativi alla gerarchia selezionata
			Query.elementHierarchy = {dimensionToken : e.currentTarget.dataset.dimensionToken, token : e.currentTarget.dataset.hierToken};
			app.showAllElements();
		} else {
			// deselezione della gerarchia, nascondo le tabelle della gerarchia selezionata
			app.hideAllElements();
			Query.elementHierarchy = {dimensionToken : e.currentTarget.dataset.dimensionToken, token : e.currentTarget.dataset.hierToken};
		}
	}

	// selezione di un filtro già presente, lo salvo nell'oggetto Query
	app.handlerFilterSelected = (e) => {
		StorageFilter.selected = e.currentTarget.dataset.filterToken;
		let hier;
		// i filtri impostati su un livello dimensionale hanno l'attr data-hier-token
		if (e.currentTarget.hasAttribute('data-hier-token')) {
			hier = e.currentTarget.dataset.hierToken;
			StorageDimension.selected = e.currentTarget.dataset.dimensionToken;
			Query.tableId = e.currentTarget.dataset.tableId;
		}
		Query.table = e.currentTarget.dataset.tableName;
		Query.tableAlias = e.currentTarget.dataset.tableAlias;
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// recupero dallo storage il filtro selezionato
			if (StorageFilter.selected.hier) {
				// imposto la firstTable se il filtro appartiene a una dimensione e non a un cubo
				Query.addTables(StorageFilter.selected.hier.token);
				app.checkRelations(hier);
				Query.elementFilter = {
					token : e.currentTarget.dataset.filterToken,
					dimensionToken : e.currentTarget.dataset.dimensionToken,
					hier,
					tableAlias : Query.tableAlias,
					formula : StorageFilter.selected.formula,
					tableId : Query.tableId,
					table : Query.table
				};
			} else {
				// filtro sul cubo, non ha hier
				Query.elementFilter = {token : e.currentTarget.dataset.filterToken, tableAlias : Query.tableAlias, formula : StorageFilter.selected.formula, table : Query.table};
			}
			// console.log(StorageFilter.selected.formula);
			// nel salvare il filtro nel report attuale devo impostarne anche l'alias della tabella selezionata nella dialog
			Query.filters = { token : e.currentTarget.dataset.filterToken, SQL : `${Query.tableAlias}.${StorageFilter.selected.formula}` };
		} else {
			// delete filter
			Query.filters = { token : e.currentTarget.dataset.filterToken, SQL : `${Query.tableAlias}.${StorageFilter.selected.formula}` };
			// BUG: dopo aver eliminato il filtro dal report si deve ricontrollare il checkRelations() ed eliminare le join che riguardano il filtro deselezionato
		}
	}

	app.handlerMetricFilterSelected = e => e.currentTarget.toggleAttribute('selected');

	// selezione di una metrica già esistente, lo salvo nella Classe Query.addMetric (oppure Query.addFilteredMetric)
	app.handlerMetricSelected = (e) => {
		StorageMetric.selected = e.currentTarget.dataset.metricToken;
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// aggiungo la metrica
			switch (StorageMetric.selected.metric_type) {
				case 1:
					// metrica di base composta, non ha le proprietà table e tableAlias
					Query.addMetric = {
						token : e.currentTarget.dataset.metricToken,
						name : StorageMetric.selected.name,
						SQLFunction : StorageMetric.selected.formula.SQLFunction,
						field : StorageMetric.selected.formula.field, // contiene la formula (es.: prezzo * quantita)
						distinct : StorageMetric.selected.formula.distinct,
						alias : StorageMetric.selected.formula.alias
					};
					break;
				case 2:
					// metrica filtrata
					Query.table = e.currentTarget.dataset.tableName;
					Query.tableAlias = e.currentTarget.dataset.tableAlias;
					Query.addFilteredMetric = {
						token : e.currentTarget.dataset.metricToken,
						name : StorageMetric.selected.name,
						metric_type : 2,
						SQLFunction : StorageMetric.selected.formula.SQLFunction,
						alias : StorageMetric.selected.formula.alias,
						distinct : StorageMetric.selected.formula.distinct,
						field : StorageMetric.selected.formula.field,
						filters : StorageMetric.selected.formula.filters,
						table : Query.table,
						tableAlias : Query.tableAlias
					};
					break;
				case 3:
					// metrica composta di base con filtri
					Query.addFilteredMetric = {
						token : e.currentTarget.dataset.metricToken,
						name : StorageMetric.selected.name,
						metric_type : 3,
						SQLFunction : StorageMetric.selected.formula.SQLFunction,
						alias : StorageMetric.selected.formula.alias,
						field : StorageMetric.selected.formula.field, // contiene la formula (es.: prezzo * quantita)
						distinct : StorageMetric.selected.formula.distinct,
						filters : StorageMetric.selected.formula.filters
					};
					break;
				case 4:
					// metrica composta
					// Siccome le metriche composte contengono le metriche "base"/"filtrate" vanno aggiunte anche queste all'elaborazione di baseTable() (metriche base) oppure metricTable() (metriche filtrate)
					// ottengo le metriche inserite nella composta
					for (const [name, metric] of Object.entries(StorageMetric.selected.formula.metrics_alias)) {
						// TODO: tutto da rivedere dopo la modifica del token
						// recupero le metriche che compongono la composta
						StorageMetric.selected = metric.token;
						// se c'è una metrica filtrata memorizzo in Query.addFilteredMetric altrimenti in Query.addMetric
						// BUG: nella metrica composta potrebbe esserci anche un'altra metrica composta
						(StorageMetric.selected.metric_type === 2 || StorageMetric.selected.metric_type === 3) ? 
							Query.addFilteredMetric = {
								token : metric.token,
								name : StorageMetric.selected.name,
								formula : StorageMetric.selected.formula,
								field : StorageMetric.selected.formula.field,
								distinct : StorageMetric.selected.formula.distinct,
								alias : StorageMetric.selected.formula.alias,
								table : Query.table,
								tableAlias : Query.tableAlias
							} : 
							Query.addMetric = {
								token : metric.token,
								name : StorageMetric.selected.name,
								SQLFunction : StorageMetric.selected.formula.SQLFunction,
								field : StorageMetric.selected.formula.field,
								distinct : StorageMetric.selected.formula.distinct,
								alias : StorageMetric.selected.formula.alias,
								table : Query.table,
								tableAlias : Query.tableAlias
							};
						}
					// reimposto la metrica selezionata
					StorageMetric.selected = e.currentTarget.dataset.metricToken;
					// aggiungo alle metriche selezionate per il report
					debugger;
					Query.addCompositeMetric = {
						token : e.currentTarget.dataset.metricToken,
						name : StorageMetric.selected.name,
						formula : StorageMetric.selected.formula
					};
					break;
				default:
					// base
					Query.table = e.currentTarget.dataset.tableName;
					Query.tableAlias = e.currentTarget.dataset.tableAlias;
					debugger;
					Query.addMetric = {
						token : e.currentTarget.dataset.metricToken,
						name : StorageMetric.selected.name,
						SQLFunction : StorageMetric.selected.formula.SQLFunction,
						field : StorageMetric.selected.formula.field,
						distinct : StorageMetric.selected.formula.distinct,
						alias : StorageMetric.selected.formula.alias,
						table : Query.table,
						tableAlias : Query.tableAlias
					};
					break;
			}
		} else {
			// deselezione di una metrica
			switch (StorageMetric.selected.metric_type) {
				case 2:
				case 3:
					// metrica avanzata e metrica composta a livello cubo filtrata
					Query.removeFilteredMetric = e.currentTarget.data.metricToken;
					break;
				case 4:
					// metrica composta
					Query.removeCompositeMetric = e.currentTarget.dataset.metricToken;
					break;
				default:
					// metrica composta di base oppure metrica di base
					Query.removeMetric = e.currentTarget.dataset.metricToken;
					break;
			}
		}
	}

	// selezione di una metrica per la creazione di una metrica composta
	app.handlerMetricSelectedComposite = (e) => {
		// aggiungo la metrica alla textarea
		Query.table = e.currentTarget.dataset.tableName;
		const textArea = document.getElementById('composite-metric-formula');
		// creo uno span con dentro la metrica
		const mark = document.createElement('mark');
		mark.dataset.metricToken = e.currentTarget.dataset.metricToken;
		mark.innerText = e.currentTarget.dataset.label;
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

	// selezione delle colonne
	app.handlerSelectColumn = (e) => {
		console.log('addColumns');
		// verifico che almeno una gerarchia sia stata selezionata
		const hierSelectedCount = document.querySelectorAll('#ul-hierarchies .selectable[selected]').length;
		if (hierSelectedCount === 0) {
			App.showConsole('Selezionare una gerarchia per poter aggiungere colonne al report', 'warning');
			return;
		} else {
			e.currentTarget.toggleAttribute('selected');
			Query.table = e.currentTarget.dataset.tableName;
			Query.tableAlias = e.currentTarget.dataset.tableAlias;
			Query.columnToken = e.currentTarget.dataset.tokenColumn;
			// la FACT table non ha un data-table-id
			if (e.currentTarget.hasAttribute('data-table-id')) {
				StorageDimension.selected = e.currentTarget.dataset.dimensionToken;
				Query.tableId = e.currentTarget.dataset.tableId;
				Query.field = {[Query.columnToken] : StorageDimension.selected.hierarchies[e.currentTarget.dataset.hierToken].columns[Query.tableAlias][Query.columnToken]};
			} else {
				StorageCube.selected = e.currentTarget.dataset.cubeToken;
				Query.field = {[Query.columnToken] : StorageCube.selected.columns[Query.tableAlias][Query.columnToken]};
			}
			if (e.currentTarget.hasAttribute('selected')) {
				document.getElementById('columnAlias').value = '';
				document.getElementById('columnAlias').focus();
				// imposto, nella section della dialog, l'attributo data-hier-token e data-dimension-name selezionata
				if (e.currentTarget.hasAttribute('data-hier-token')) {
					app.dialogColumns.querySelector('section').dataset.hierToken = e.currentTarget.dataset.hierToken;
					app.dialogColumns.querySelector('section').dataset.dimensionToken = e.currentTarget.dataset.dimensionToken;
				} else {
					// selezione di una colonna della Fact, elimino l'attributo data-hier-token perchè, nel tasto Salva, è su questo attributo che controllo se si tratta di una colonna da dimensione o da Fact
					app.dialogColumns.querySelector('section').removeAttribute('data-hier-token');
				}
				app.dialogColumns.showModal();
			} else {
				// TODO: colonna deselezionata, implementare la logica in Query.deleteSelect
				Query.deleteSelect();
			}
			
		}		
	}

	// selezione della tabella nella dialog-tables (columns)
	app.handlerTableSelected = (e) => {
		debugger;
		const dimension = e.currentTarget.dataset.dimensionToken;
		Query.table = e.currentTarget.getAttribute('label'); // TODO: impostare data-label
		Query.tableAlias = e.currentTarget.dataset.tableAlias;
		Query.tableId = e.currentTarget.dataset.tableId;
		const hier = e.currentTarget.dataset.hierToken;
		// deseleziono le precedenti tabelle selezionate
		// let activeDialog = document.querySelector('dialog[open]');
		if (app.dialogColumns.querySelector('#fieldList-tables ul li[selected]')) {
			const li = app.dialogColumns.querySelector('#fieldList-tables ul li[selected]');
			li.toggleAttribute('selected');
			// nascondo tutte le colonne che fanno parte della tabella precedentemente selezionata
			app.dialogColumns.querySelectorAll("ul[data-id='fields-column'] > section[data-dimension-name='" + dimension + "'][data-hier-token='" + hier + "'][data-table-name='" + li.getAttribute('label') + "']").forEach((field) => {
				field.hidden = true;
				field.removeAttribute('data-searchable');
			});
		}
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// visualizzo le colonne appartenenti alla tabella selezionata
			app.dialogColumns.querySelectorAll("ul[data-id='fields-column'] > section[data-dimension-name='" + dimension + "'][data-hier-token='" + hier + "'][data-table-name='" + Query.table + "']").forEach((field) => {
				field.hidden = false;
				field.dataset.searchable = true;
			});
		}
	}

	// selezione di una tabella nella dialog-filter
	app.handlerSelectTable = (e) => {
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// tabella selezionata
			// query per visualizzare tutti i field della tabella
			Query.table = e.currentTarget.dataset.tableName;
			Query.tableAlias = e.currentTarget.dataset.tableAlias;
			Query.schema = e.currentTarget.dataset.schema;
			if (e.currentTarget.hasAttribute('data-hier-token')) {
				Query.tableId = e.currentTarget.dataset.tableId;
				// TODO: invece di impostare questi due attributi nel <section> della dialog potrei impostarli nella Classe Storage, con il metodo selected()
				app.dialogFilter.querySelector('section').dataset.hierToken = e.currentTarget.dataset.hierToken;
				app.dialogFilter.querySelector('section').dataset.hierName = e.currentTarget.dataset.hierName;
				app.dialogFilter.querySelector('section').dataset.dimensionToken = e.currentTarget.dataset.dimensionToken;
			} else {
				// selezione di una tabella della Fact, elimino l'attributo data-hier-token perchè, nel tasto Salva, è su questo attributo che controllo se si tratta di una colonna da dimensione o da Fact
				// TODO: da ricontrollare se questi due attributi vengono utilizzati quando si seleziona una tabella appartenente a una dimensione->hier
				app.dialogFilter.querySelector('section').removeAttribute('data-hier-token');
				app.dialogFilter.querySelector('section').removeAttribute('data-dimension-token');
				StorageCube.selected = e.currentTarget.dataset.cubeToken;
			}
			// pulisco la <ul> dialog-filter-fields contenente la lista dei campi recuperata dal db, della selezione precedente
			app.dialogFilter.querySelectorAll('#dialog-filter-fields > section').forEach( section => section.remove());
			app.dialogFilter.querySelector('section').dataset.tableName = e.currentTarget.dataset.tableName;
		}
		app.getFields();
		e.currentTarget.toggleAttribute('selected');
	}

	// selezione di una metrica mappata, disponibile per la creazione
	app.handlerMetricAvailable = (e) => {
		const ul = document.getElementById('ul-available-metrics');
		const inputMetricName = document.getElementById('metric-name');
		const inputMetricAlias = document.getElementById('alias-metric');
		// elimino tutte le selezioni precedenti
		if (ul.querySelector('.selectable[selected]')) ul.querySelector('.selectable[selected]').toggleAttribute('selected');
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			inputMetricName.value = '';
			inputMetricAlias.value = '';
			inputMetricName.focus();
			StorageCube.selected = e.currentTarget.dataset.cubeToken;
			// se la metrica selezionata è metric_type: 1 si tratta di una metrica composta, legata al cubo (es.: prezzo * quantità)
			if (StorageCube.selected.metrics[e.currentTarget.dataset.label].metric_type === 1) {
				// in Query.field devo impostare (alias_tabella.prezzo * alias_tabella.quantita)
				// l'array fields, nella metrica legata al cubo, la utilizzo come "controllo" per verificare quali metriche sono state messe nella formula e modificarle di conseguenza
				// TODO: 2022-05-24 da testare
				debugger;
				const fields = StorageCube.selected.metrics[e.currentTarget.dataset.label].fields;
				// baseFormula contiene la mappatura fatta su DB (es. : [prezzo, *, quantita])
				let baseFormula = StorageCube.selected.metrics[e.currentTarget.dataset.label].formula;
				// per ogni metrica presente nella baseFormula ...
				const newFormula = baseFormula.map(formulaElement => {
					// ...vado a modificare l'elemento dell'array che è contenuto nella formula, generando l'array newFormula : [DocVenditaDettaglio_444.prezzo, *, DocVenditaDettaglio_444.quantita]
					return (fields.includes(formulaElement)) ? `${e.currentTarget.dataset.tableAlias}.${formulaElement}` : formulaElement;
					// ...che successivamente lego con join creando DocVenditaDettaglio_444.prezzo * DocVenditaDettaglio_444.quantita.
					// ...in PHP, questo Query.field, verrà convertito in SUM(DocVenditaDettaglio_444.prezzo * DocVenditaDettaglio_444.quantita) AS 'alias_metric'
				}).join(' ');
				Query.field = newFormula;
			} else {
				debugger;
				Query.field = e.currentTarget.dataset.label;
				// per le metriche composte di primo livello non è necessario impostare le 2 prop tableAlias e table, sono già impostate con il map() qui sopra
				Query.table = e.currentTarget.dataset.tableName;
				Query.tableAlias = e.currentTarget.dataset.tableAlias;
			}
		} else {
			// TODO: 
		}
	}

	// apertura dialog per impostare le colonne nel report
	app.openDialogColumns = (e) => {
		const hier = e.currentTarget.dataset.hierToken;
		const table = e.currentTarget.dataset.tableName;
		const dimension = e.currentTarget.dataset.dimensionToken;
		app.dialogColumns.querySelector('section').dataset.hierToken = hier;
		app.dialogColumns.querySelector('section').dataset.dimensionToken = dimension;
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
			column.dataset.searchable = true;
		});
		app.dialogColumns.showModal();
	}

	// selezione della tabella nello step Filter, visualizzo i filtri creati su questa tabella, recuperandoli dallo storage
	app.openDialogFilters = (e) => {
		if (!e.target.hasAttribute('data-fact-name')) {
			const hier = e.currentTarget.dataset.hierToken;
			const dimension = e.currentTarget.dataset.dimensionToken;
			app.dialogFilter.querySelector('section').dataset.hierToken = hier;
			app.dialogFilter.querySelector('section').dataset.dimensionToken = dimension;
			// nascondo le tabelle NON appartenenti alla hier selezionata
			app.dialogFilter.querySelectorAll("ul[data-id='fields-tables'] > section:not([data-dimension-name='" + dimension + "'][data-hier-token='" + hier + "'])").forEach( table => table.hidden = true);
			// visualizzo le tabelle appartenenti alla hier selezionata
			app.dialogFilter.querySelectorAll("ul[data-id='fields-tables'] > section[data-dimension-name='" + dimension + "'][data-hier-token='" + hier + "']").forEach((table) => {
				// console.log('tabelle appartententi alla gerarchia selezionata : ', table);
				table.hidden = false;
				// imposto l'elemento con l'attr 'searchable' in modo che il metodo SearchInSectionList cerca solo tra gli elementi che hanno questo attributo
				// senza questo attributo, il metodo cerca tra tutti gli elementi e quindi và a nascondere/visualizzare anche quelli appartenenti ad altre dimensioni/gerarchie/tabelle ecc...
				table.toggleAttribute('data-searchable');
			});
			// rimuovo, se già presente, la <ul> contenuto all'interno di #fieldList-filter per mostrare le colonne (recuperate dal DB) della tabella selezionata (esiste su selezione precedente)
			const listRef = app.dialogFilter.querySelector('#fieldList-filter');
			if (listRef.querySelector('ul')) listRef.querySelector('ul').remove();
		} else {
			// FACT
			const fact = e.currentTarget.dataset.factName;
			app.dialogFilter.querySelector('section').dataset.factName = fact;
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
			Query.field = e.currentTarget.getAttribute('label'); // TODO: dataset data-label
			Query.fieldType = e.currentTarget.dataset.type;
			Query.schema = e.currentTarget.dataset.schema;
			const valueList = app.dialogValue.querySelector('#dialog-filter-values');
			valueList.querySelectorAll('section').forEach( section => section.remove());
			const textarea = document.getElementById('filterSQLFormula');
			textarea.value = (textarea.value.length === 0) ? Query.field+" = " : textarea.value + Query.field;
			textarea.focus();
		}
	}

	// carico elenco colonne dal DB da visualizzare nella dialogFilter
	app.getFields = async () => {
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
						section.hidden = false;
						section.dataset.searchable = true;
						section.dataset.label = value.COLUMN_NAME;
						section.dataset.elementSearch = 'dialog-filter-search-field';
						section.dataset.tableName = Query.table;
						div.dataset.schema = Query.schema;
						// scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
						let pos = value.DATA_TYPE.indexOf('('); // datatype
						let type = (pos !== -1) ? value.DATA_TYPE.substring(0, pos) : value.DATA_TYPE;
						div.dataset.type = type;
						div.setAttribute('label', value.COLUMN_NAME); // // TODO: dataset data-label
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
		console.log(Query.tables.tableId);
		for (const [k, order] of Object.entries(StorageDimension.selected.hierarchies[hier].order)) {
			// recupero la property 'join' (nella dimensione) dove la key è maggiore della tableId al momento selezionata (Quindi recupero tutte le hier inferiori)
			if (+k >= Query.tables.tableId) {
				Query.from = `${order.schema}.${order.table} AS ${order.alias}`;
				if (StorageDimension.selected.hierarchies[hier].joins[order.alias]) {
					Query.joinId = +k;
					Query.where = StorageDimension.selected.hierarchies[hier].joins[order.alias];
				}
			}
		}
	}

	// tasto 'Fatto' nella dialogFilter
	app.btnFilterDone.onclick = e => app.dialogFilter.close();
	
	// salvataggio della metrica nel db
	app.saveMetricDB = async (json) => {
		// console.log(json);
		// console.log(JSON.stringify(json));
		const params = JSON.stringify(json);
		const url = "/fetch_api/json/metric_store";
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

	app.btnCompositeMetricDone.onclick = () => app.dialogCompositeMetric.close();

	// dialog-metric-filter, recupero i filtri selezionati per inserirli nella metrica filtrata
	app.btnMetricFilterDone.onclick = e => app.dialogMetricFilter.close();

	// save metric
	app.btnMetricSave.onclick = (e) => {
		const name = document.getElementById('metric-name').value;
		const alias = document.getElementById('alias-metric').value;
		const SQLFunction = document.querySelector('#ul-aggregation-functions .selectable[selected]').dataset.label;
		let metric_type = +document.querySelector('#ul-available-metrics .selectable[selected]').dataset.metricType;
		const distinctOption = document.getElementById('checkbox-distinct').checked;
		console.log('Query.table : ', Query.table);
		console.log('Query.tableAlias : ', Query.tableAlias);
		console.log('Query.field : ', Query.field);
		console.log('cube selected : ', StorageCube.selected.name);
		console.log('cube selected token : ', StorageCube.selected.token);
		const rand = () => Math.random(0).toString(36).substr(2);
		const token = rand().substr(0, 21);
		const date = new Date();
		// const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
		const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
		// verifico se ci sono filtri da associare a questa metrica
		let associatedFilters = {};
		document.querySelectorAll('#ul-metric-filter .selectable[selected]').forEach( filterSelected => {
			debugger;
			// TODO: da testare
			StorageFilter.selected = filterSelected.dataset.filterToken;
			// recupero dallo storage il contenuto del filtro per inserirlo in un object (quest'ultimo verrà inserito nella metrica)
			associatedFilters[StorageFilter.selected.token] = {
				token : StorageFilter.selected.token,
				SQL : `${filterSelected.dataset.tableAlias}.${StorageFilter.selected.formula}`
			};
		});
		let metricObj = { created_at : date.toLocaleDateString('it-IT', options), updated_at : date.toLocaleDateString('it-IT', options) };
		// se associatedFilters > 0 sarà una metrica filtrata, altrimenti una metrica a livello di report (senza nessun filtro all'interno della metrica)
		// TODO: logica con switch è errata. Le metriche disponibili sono sempre metric_type:0 o 1 quindi qui devo stabilire il metric_type :
		// 2 (filtrata) 3 : (composta a livello cubo e filtrata)
		if (Object.keys(associatedFilters).length > 0) {
			if (metric_type === 0) {
				metric_type = 2; // metrica di base con filtri
			} else {
				metric_type = 3; // metrica di base composta con filtri
			}
		}
		debugger;
		
		switch (metric_type) {
			case 1:
				// base composta (legata al cubo) senza filtri
				metricObj = {
					type: 'METRIC',
					token,
					metric_type,
					name,
					formula: { token, SQLFunction, field: Query.field, distinct: distinctOption, alias },
					cubeToken : StorageCube.selected.token
				};
				break;
			case 2:
				// base filtrata
				debugger;
				metricObj = {
					type: 'METRIC',
					token,
					metric_type,
					name,
					formula: { token, SQLFunction, field: Query.field, distinct: distinctOption, alias, table: Query.table, tableAlias : Query.tableAlias, filters: associatedFilters },
					cubeToken : StorageCube.selected.token
				};
				break;
			case 3:
				// base composta filtrata
				metricObj = {
					type: 'METRIC',
					token,
					metric_type,
					name,
					formula: { token, SQLFunction, field: Query.field, distinct: distinctOption, alias, filters: associatedFilters },
					cubeToken : StorageCube.selected.token
				};
				break;
			default:
				// base
				console.info('metrica di base');
				metricObj = {
					type: 'METRIC',
					token,
					metric_type,
					name,
					formula: { token, SQLFunction, field: Query.field, distinct: distinctOption, alias, table : Query.table, tableAlias : Query.tableAlias },
					cubeToken : StorageCube.selected.token
				};
				break;
		}

		// salvo la nuova metrica nello storage
		StorageMetric.saveTemp(metricObj);
		// salvo nel DB
		// app.saveMetricDB(metricObj);
		// Imposto la metrica appena create come "selezionata" in modo da andare a creare il nuovo elemento nella #ul-exist-metrics
		StorageMetric.selected = token;
		// TODO: spostare in una funzione il codice per aggiungere la nuova metrica all'elenco di quelle esistenti (da fare anche per i filtri creati/esistenti)
		app.addMetric('ul-exist-metrics');
	}

	// aggiungo la metrica appena creata alla <ul> (metriche base e filtrate)
	app.addMetric = (ulId) => {
		const ul = document.getElementById(ulId);
		const content = app.tmplList.content.cloneNode(true);
		const section = content.querySelector('section[data-sublist-metrics]');
		const selectable = section.querySelector('.selectable');
		const spanMetric = selectable.querySelector('span[metric]');
		const smallTable = selectable.querySelector('small[table]');
		const smallCube = selectable.querySelector('small[cube]');
		section.removeAttribute('hidden');
		section.dataset.elementSearch = 'search-exist-metrics';
		section.dataset.label = StorageMetric.selected.name;
		section.dataset.cubeToken = StorageMetric.selected.cubeToken;
		section.toggleAttribute('data-searchable');

		// div.dataset.label = StorageMetric.selected.name;
		if (StorageMetric.selected.metric_type === 0 || StorageMetric.selected.metric_type === 2) {
			selectable.dataset.tableName = Query.table;
			selectable.dataset.tableAlias = Query.tableAlias;
		}		
		selectable.dataset.metricToken = StorageMetric.selected.token;
		
		spanMetric.innerText = StorageMetric.selected.name;
		if (StorageMetric.selected.metric_type === 0 || StorageMetric.selected.metric_type === 2) smallTable.innerText = Query.table;
		smallCube.innerText = StorageCube.selected.name;
		selectable.onclick = app.handlerMetricSelected;
		ul.appendChild(section);
	}

	app.addFilter = (ulId) => {
		const ul = document.getElementById(ulId);
		const content = app.tmplList.content.cloneNode(true);
		const section = content.querySelector('section[data-sublist-filters]');
		const spanHContent = section.querySelector('.h-content');
		const selectable = spanHContent.querySelector('.selectable');
		const span = selectable.querySelector('span[filter]');
		const smallTable = selectable.querySelector('small[table]');
		const smallHier = selectable.querySelector('small:last-child');
		const iEdit = spanHContent.querySelector('i');
		section.removeAttribute('hidden');
		section.dataset.label = StorageFilter.selected.name;
		section.dataset.elementSearch = 'search-exist-filters';
		selectable.dataset.filterToken = StorageFilter.selected.token;
		selectable.dataset.tableName = Query.table;
		selectable.dataset.tableAlias = Query.tableAlias;
		if (StorageFilter.selected.hasOwnProperty('dimensionToken')) {
			// è un filtro su un livello dimensionale
			section.dataset.dimensionToken = StorageFilter.selected.dimensionToken;
			section.dataset.hierToken = StorageFilter.selected.hier.token;
			selectable.dataset.dimensionToken = StorageFilter.selected.dimensionToken;
			selectable.dataset.hierToken = StorageFilter.selected.hier.token;
			selectable.dataset.tableId = Query.tableId;
			smallHier.setAttribute('hier', true); // TODO: dataset data-hier
			smallHier.innerText = StorageFilter.selected.hier.name;
		} else {
			// è un filtro su una tabella FACT
			section.dataset.cubeToken = StorageCube.selected.token;
			selectable.dataset.cubeToken = StorageCube.selected.token;
			smallHier.innerText = StorageCube.selected.name;
		}
		span.innerText = StorageFilter.selected.name;
		smallTable.innerText = Query.table;

		selectable.onclick = app.handlerFilterSelected;
		iEdit.onclick = app.handlerFilterEdit; // TODO: da implementare
		ul.appendChild(section);
	}

	// aggiungo la metrica appena creata alla <ul> (metrica composta)
	app.addCompositeMetric = (ulId) => {
		const ul = document.getElementById(ulId);
		const content = app.tmplList.content.cloneNode(true);
		const section = content.querySelector('section[data-sublist-metrics]');
		const selectable = section.querySelector('.selectable');
		const spanMetric = selectable.querySelector('span[metric]');
		const smallTable = selectable.querySelector('small[table]');
		const smallCube = selectable.querySelector('small[cube]');
		section.removeAttribute('hidden');
		section.toggleAttribute('data-searchable');
		section.dataset.elementSearch = 'search-exist-metrics';
		section.dataset.label = StorageMetric.selected.name; // utile per la ricerca

		selectable.dataset.metricToken = StorageMetric.selected.token;
		// selectable.dataset.tableName = Query.table;
		// selectable.dataset.tableAlias = Query.tableAlias;
		// selectable.dataset.cubeName = StorageCube.selected.name;
		
		spanMetric.innerText = StorageMetric.selected.name;
		// smallTable.innerText = Query.table;
		// smallCube.innerText = StorageCube.selected.name;
		selectable.onclick = app.handlerMetricSelected;
		ul.appendChild(section);
	}

	// save compositeMetric
	app.btnCompositeMetricSave.onclick = (e) => {
		const name = document.getElementById('composite-metric-name').value;
		const alias = document.getElementById('composite-alias-metric').value;
		let arr_sql = [];
		const rand = () => Math.random(0).toString(36).substr(2);
		const token = rand().substr(0, 21);
		let metricsAlias = {}; // contiene un'elenco di object con nome_metrica : alias che compongono la metrica composta
		document.querySelectorAll('#composite-metric-formula *').forEach( element => {
			console.log('element : ', element);
			// console.log('element : ', element.nodeName);
			// se l'elemento è un <mark> lo aggiungo all'array arr_sql, questo creerà la formula in formato SQL
			if (element.nodeName === 'MARK') {
				StorageMetric.selected = element.dataset.metricToken;
				// metrics[element.innerText] = StorageMetric.selected.formula.alias;
				// TODO: probabilmente qui meglio inserire tutto il contenuto della metrica e non solo l'alias
				metricsAlias[element.innerText] = {token : element.dataset.metricToken, alias : StorageMetric.selected.formula.alias};
				// TODO: verificare se è presente il distinct : true in ogni metrica
				arr_sql.push(StorageMetric.selected.name);
			} else {
				arr_sql.push(element.innerText.trim());	
			}
		});
		arr_sql.push(`AS '${alias}'`);
		const metricObj = { type: 'METRIC', token, name, metric_type : 4, formula: { token, formula_sql : arr_sql, alias, metrics_alias : metricsAlias } };
		console.log(metricObj);
		StorageMetric.saveTemp(metricObj);
		// salvo nel DB
		// app.saveMetricDB(metricObj);
		// aggiungo la metrica alla <ul>
		// reimposto, come metrica selezionata, la metrica appena creata e da aggiungere a #ul-exist-composite-metrics
		StorageMetric.selected = token;
		app.addCompositeMetric('ul-exist-composite-metrics');
	}

	// salvo il filtro nel DB, table : bi_filters
	app.saveFilterDB = async (json) => {
		const params = JSON.stringify(json);
		const url = "/fetch_api/json/filter_store";
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

	// save filter
	app.btnFilterSave.onclick = (e) => {
		console.log(Query.table);
		// per i filtri creati sulla Fact, hier e dimension devono essere = null ma và salvato, nel filtro, il nome del cubo a cui accede
		let hierToken, hierName, dimension;
		const textarea = document.getElementById('filterSQLFormula');
		let filterName = document.getElementById('inputFilterName');
		const rand = () => Math.random(0).toString(36).substr(2);
		const token = rand().substr(0, 21);
		const date = new Date();
		// const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
		const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
		let filterObject = {created_at : date.toLocaleDateString('it-IT', options), updated_at : date.toLocaleDateString('it-IT', options)};
		// la creazione di un filtro su un livello dimensionale salva il filtro con, all'interno, le proprietà dimension e hier.
		// Un filtro impostato la FACT avrà al suo interno il nome del cubo a cui è associato e l'alias della FACT
		if (app.dialogFilter.querySelector('section').hasAttribute('data-hier-token')) {
			hierToken = app.dialogFilter.querySelector('section').dataset.hierToken;
			hierName = app.dialogFilter.querySelector('section').dataset.hierName;
			dimensionToken = app.dialogFilter.querySelector('section').dataset.dimensionToken;
			// NOTE: inizializzazione di un Map con un Object
			/*filterObject = new Map([
				[token, {token, 'type': 'FILTER', 'name': filterName.value, 'table': Query.table, formula : textarea.value, dimension, hier}]
			]);*/
			filterObject = { token, type: 'FILTER', name: filterName.value, table: Query.table, formula : textarea.value, dimensionToken, hier : {token : hierToken, name: hierName} };
		} else {
			filterObject = {token, type: 'FILTER', name: filterName.value, table: Query.table, formula : textarea.value, cubeToken : StorageCube.selected.token, alias : StorageCube.selected.alias};
		}
		// console.log('filterObject : ', filterObject);
		StorageFilter.saveTemp(filterObject);
		StorageFilter.selected = token;
		// salvataggio nel DB
		// app.saveFilterDB(filterObject);
		// reset del form
		filterName.value = "";
		filterName.focus();
		textarea.value = "";
		// aggiorno la lista dei filtri esistenti, aggiungendo il filtro appena creato		
		app.addFilter('ul-exist-filters');
	}

	// tasto OK nella dialogValue
	app.btnValueDone.onclick = () => {
		// recupero tutti i valori selezionati.
		const valueSelected = app.dialogValue.querySelectorAll('#dialog-filter-values .selectable[selected]');
		// TODO: Elaborare un sistema per effettuare la IN(), la BETWEEN, AND, OR, ecc...in base alla selezione dei valori
		const textarea = document.getElementById('filterSQLFormula');
		let arrayValues = [];
		valueSelected.forEach( (element) => {
			arrayValues.push(element.dataset.label);
		});
		debugger;
		textarea.value += arrayValues.join(',');
		// textarea.value += e.currentTarget.getAttribute('label');
		
		// TODO: posizionare nella creazione di un nuovo filtro app.checkFilterForm();

		app.dialogValue.close();
	}

	// recupero valori distinti per inserimento nella dialogFilter
	app.getDistinctValues = async () => {
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
						section.hidden = false;
						section.dataset.label = value[Query.field];
						section.dataset.elementSearch = 'dialog-value-search';
						section.dataset.searchable = true;
						div.dataset.label = value[Query.field];
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

	app.getCompositeMetrics(); // metriche composite

	app.getTables(); //  elenco tabelle nella dialogFilter

	app.getTablesInDialogFilter();

	app.getFactTable(); // lista delle FACT da visualizzare nello step-2

	app.getMetrics();

	app.getAvailableMetrics();

	app.getReports();

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
		span.innerText = e.target.getAttribute('label'); // TODO: dataset data-label
		textarea.appendChild(span);
	}
	/* events */

	// TODO: da ricontrollare 22.04.2022
	app.checkSelection = () => {
		// TODO: devo sapere in quale step mi trovo per poter verificare se sono stati selezionati gli elementi per proseguire
		const activeStep = document.querySelector('.step[selected]');
		const dataStep = +activeStep.dataset.step;
		switch (dataStep) {
			case 1:
				// cubi e dimensioni
				if (StorageCube.cubeSelected.size === 0) {
					App.showConsole('Cubo non selezionato', 'warning');
					return false;
				}
				if (StorageDimension.dimensionDimensions.size === 0) {
					App.showConsole('Dimensione non selezionata', 'warning');
					return false;
				}
				break;
			case 2:
				// colonne/filtri
				// deve essere selezionata almeno una colonna per proseguire
				if (Object.keys(Query.select).length === 0) {
					App.showConsole('Selezionare almeno un livello dimensionale', 'warning')
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

	// aggiungi filtri (step-2)
	app.btnAddFilters.onclick = (e) => {
		// stessa logica di btnAddColumns
		console.log('addFilters');
		const hierSelectedCount = document.querySelectorAll('#ul-hierarchies .selectable[selected]').length;
		if (hierSelectedCount === 0) {
			App.showConsole('Selezionare una gerarchia per poter aggiungere colonne al report', 'warning');
			return;
		} else {
			app.dialogFilter.showModal();
		}
	}

	// aggiungi metriche (step-2)
	app.btnAddMetrics.onclick = (e) => {
		// verifico se è stato selezionato almeno un cubo
		const cubeSelectedCount = document.querySelectorAll('#ul-cubes .selectable[selected]').length;
		if (cubeSelectedCount === 0) {
			App.showConsole('Selezionare un Cubo per poter aggiungere metriche al report', 'warning');
			return;
		} else {
			app.dialogMetric.showModal();
		}
	}

	// aggiungi metrica composta
	app.btnAddCompositeMetrics.onclick = (e) => {
		const cubeSelectedCount = document.querySelectorAll('#ul-cubes .selectable[selected]').length;
		if (cubeSelectedCount === 0) {
			App.showConsole('Selezionare un Cubo per poter aggiungere metriche al report', 'warning');
			return;
		} else {
			// TODO: popola la #ul-metrics
			// recupero i cubi selezionati
			const selectedCubes = document.querySelectorAll('#ul-cubes .selectable[selected]');
			// per ogni cubo selezionato ne recupero le metriche ad esso appartenenti
			const ul = document.getElementById('ul-metrics');
			selectedCubes.forEach( cube => {
				// ripulisco la lista, prima di popolarla
				document.querySelectorAll('#ul-metrics > section').forEach( item => item.remove());
				// recupero lista aggiornata delle metriche
				StorageMetric.cubeMetrics = cube.dataset.cubeToken;
				for ( const [token, metric] of Object.entries(StorageMetric.cubeMetrics) ) {
					const contentElement = app.tmplList.content.cloneNode(true);
					const section = contentElement.querySelector('section[data-sublist-metrics]');
					const spanHContent = section.querySelector('.h-content');
					const selectable = spanHContent.querySelector('.selectable');
					const span = spanHContent.querySelector('span[metric]');
					const smallTable = spanHContent.querySelector('small[table]');
					const smallCube = spanHContent.querySelector('small[cube]');
					section.hidden = false;
					section.dataset.elementSearch = 'search-metrics';
					section.dataset.searchable = true;
					section.dataset.label = metric.name;
					section.dataset.cubeToken = metric.cubeToken;
					// metriche composte di base e composte non hanno le prop table, tableAlias
					if (metric.metric_type !== 1 && metric.metric_type !== 4 && metric.metric_type !== 3) {
						selectable.dataset.tableName = metric.formula.table;
						selectable.dataset.tableAlias = metric.formula.tableAlias;
						smallTable.innerText = metric.formula.table;
					}
					selectable.dataset.label = metric.name;
					selectable.dataset.cubeToken = metric.cubeToken;
					selectable.dataset.metricToken = token;
					selectable.onclick = app.handlerMetricSelectedComposite;
					span.innerText = metric.name;
					smallCube.innerText = cube.dataset.label;
					ul.appendChild(section);
				}
			});
			app.dialogCompositeMetric.showModal();
			document.getElementById('composite-metric-name').focus();
		}
	}

	// salvo il process nel DB
	app.saveReport = async () => {
		console.log(JSON.stringify(Query.reportProcessStringify));
		const params = JSON.stringify(Query.reportProcessStringify);
		const url = "/fetch_api/json/process_store";
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

	app.updateReport = async () => {
		console.log(JSON.stringify(Query.reportProcessStringify));
		const params = JSON.stringify(Query.reportProcessStringify);
		const url = "/fetch_api/json/process_update";
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
			  console.log('PROCESS AGGIORNATO CORRETTAMENTE');
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

	// save report
	app.btnSaveReportDone.onclick = () => {
		// ottengo un processId per passarlo a costruttore
		// const processId = Date.now();
		const name = document.getElementById('reportName').value;
		// il datamart sarà creato come FX_processId
		// se il token è !== 0 significa che sto editando un report
		if (Query.token !== 0) {
			// edit del report
			// TODO: visualizzare un alert che avvisa della sovrascrittura del report
			Query.save(name);
			// salvataggio nel database tabella : bi_processes
			// app.updateReport();
		} else {
			// nuovo report
			Query.save(name);
			// app.saveReport();
		}
		// recupero da Query la proprietà this.#reportProcess appena creata e la aggiungo a #ul-processes	
		// aggiungo alla lista #ul-processes
		app.addReport(Query.process.token, Query.process);
		app.dialogSaveReport.close();
	}

	// apro la dialog-metric-filter
	app.btnSetMetricFilter.onclick = () => {
		// popolo la <ul>
		// elenco filtri da associare alla metrica (creazione metrica filtrata)
		const ul = document.getElementById('ul-metric-filter');
		ul.querySelectorAll('section').forEach( item => item.remove());
		// recupero i cubi selezionati
		console.log('cubi selezionati : ', Query.elementCube);
		for ( const [token, cube] of Query.elementCube) {
			console.log('cube : ', cube);
			// imposto il cubo in ciclo in modo da poter recuperare le sue proprietà ed inserirle nella <ul> dei filtri
			StorageCube.selected = token;
			StorageFilter.getFiltersByCube(token).forEach( filter => {
				// console.log('filter : ', filter);
				const content = app.tmplList.content.cloneNode(true);
				const section = content.querySelector('section[data-sublist-filters]');
				const spanHContent = section.querySelector('.h-content');
				const selectable = spanHContent.querySelector('.selectable');
				const span = selectable.querySelector('span[filter]');
				const smallTable = selectable.querySelector('small[table]');
				const smallCube = selectable.querySelector('small:last-child');
				section.hidden = false;
				section.dataset.elementSearch = 'search-exist-filters';
				section.dataset.label = filter.name;
				section.dataset.cubeToken = token;
				selectable.dataset.tableName = StorageCube.selected.FACT;
				selectable.dataset.tableAlias = StorageCube.selected.tableAlias;
				selectable.dataset.cubeToken = token;
				selectable.dataset.filterToken = filter.token;
				selectable.onclick = app.handlerMetricFilterSelected;
				span.innerText = filter.name;
				smallTable.innerText = StorageCube.selected.FACT;
				smallCube.innerText = StorageCube.selected.name;
				ul.appendChild(section);
			});	
		}
		// visualizzo i filtri appartenenti alle gerarchie selezionate
		for ( const [token, value] of Query.elementHierarchy) {
			StorageDimension.selected = value.dimensionToken;
			// per ogni tabella nella gerarchia
			for (const [tableId, table] of Object.entries(StorageDimension.selected.hierarchies[token].order)) {
				const filters = StorageFilter.getFiltersByDimension(value.dimensionToken, token, table.table);
				if (filters.size > 0) {
					// debugger;
					filters.forEach( filter => {
						const contentElement = app.tmplList.content.cloneNode(true);
						const section = contentElement.querySelector('section[data-sublist-filters]');
						const spanHContent = section.querySelector('.h-content');
						const selectable = spanHContent.querySelector('.selectable');
						const span = selectable.querySelector('span[filter]');
						const smallTable = selectable.querySelector('small[table]');
						const smallHier = selectable.querySelector('small:last-child');
						section.hidden = false;
						section.dataset.elementSearch = 'search-exist-filters';
						section.dataset.label = filter.name;
						section.dataset.dimensionToken = filter.dimensionToken;
						section.dataset.hierToken = filter.hier.token;
						selectable.dataset.filterToken = filter.token;
						selectable.dataset.dimensionToken = filter.dimensionToken;
						selectable.dataset.hierToken = filter.hier.token;
						selectable.dataset.tableName = filter.table;
						selectable.dataset.tableAlias = table.alias;
						selectable.dataset.tableId = tableId;
						selectable.onclick = app.handlerMetricFilterSelected;
						span.innerText = filter.name;
						smallTable.innerText = table.table;
						smallHier.setAttribute('hier', true); // TODO: dataset
						smallHier.innerText = filter.hier.name;
						ul.appendChild(section);
					});
				}
			}
		}
		app.dialogMetricFilter.showModal();
	}

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

	app.saveColumn = () => {
		const alias = document.getElementById('columnAlias');
		const textarea = (document.getElementById('columnSQL').value.length === 0) ? null : document.getElementById('columnSQL').value;
		// le colonne di una Fact non hanno data-hier-token
		if (app.dialogColumns.querySelector('section').hasAttribute('data-hier-token')) {
			const hier = app.dialogColumns.querySelector('section').dataset.hierToken;
			StorageDimension.selected = app.dialogColumns.querySelector('section').dataset.dimensionToken;
			// il tableId è definito in app.handlerSelectColumn()
			Query.addTables(hier);
			// verifico quali relazioni inserire in where e quindi anche in from
			app.checkRelations(hier);
			document.querySelector("#ul-columns .selectable[data-token-column='"+Query.columnToken+"'] span[column]").innerText += ` (${alias.value})`;
			// in SQLReport avrò un custom SQL utilizzabile solo nel report che si sta creando. La prop SQL, all'interno dei singoli field, determinano la customSQL impostata sulla Dimensione.
			Query.select = { token : Query.columnToken, dimensionToken : StorageDimension.selected.token, hier, tableId : Query.tableId, table: Query.table, tableAlias : Query.tableAlias, field: Query.field, SQLReport: textarea, alias : alias.value };
		} else {
			document.querySelector("#ul-columns-fact .selectable[data-token-column='"+Query.columnToken+"'] span[column]").innerText += ` (${alias.value})`;
			Query.select = { token : Query.columnToken, table: Query.table, tableAlias : Query.tableAlias, field: Query.field, SQLReport: textarea, alias : alias.value };
		}
		console.log('columnToken : ', Query.columnToken);
		// in SQLReport avrò un custom SQL utilizzabile solo nel report che si sta creando. La prop SQL, all'interno dei singoli field, determinano la customSQL impostata sulla Dimensione.
		app.dialogColumns.close();
	}

	// save column : salvataggio di una colonna del report
	app.btnSaveColumn.onclick = () => app.saveColumn();

	app.btnMapping.onclick = () => location.href = '/mapping';

	app.btnBackPage.onclick = () => window.location.href = '/';

	// OPTIMIZE: queste 3 funzioni che riguardano i tooltip vanno posizionate in Application.js, rendendole disponibili per tutte le pagine
	app.showTooltip = (e) => {
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
	// OPTIMIZE: da spostare in Application.js
	document.querySelectorAll('*[data-tooltip]').forEach((icon) => {
		icon.onmouseenter = app.showTooltip;
		icon.onmouseleave = app.hideTooltip;
	});

	document.getElementById('columnAlias').onkeydown = (e) => {
		if (e.defaultPrevented) {
			console.log('è stato premuto 2 volte');
			return; // Do nothing if the event was already processed
		}
		// console.log(e);
		// console.log(e.key);
		if (e.key === 'Enter') app.saveColumn();
		// e.preventDefault();
	}

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
