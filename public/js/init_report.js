var App = new Application();
var Query = new Queries();
var StorageDimension = new DimensionStorage();
var StorageCube = new CubeStorage();
var StorageProcess = new ProcessStorage();
var StorageFilter = new FilterStorage();
var StorageMetric = new MetricStorage();
(() => {
	App.init();
    const rand = () => Math.random(0).toString(36).substr(2);
	// console.info('Date.now() : ', Date.now());

	// la Classe Steps deve impostare alcune proprietà DOPO che viene visualizzato il body, non può essere posizionato prima di App.init();
	var Step = new Steps('stepTranslate');

	var app = {
		// templates
		tmplUlList: document.getElementById('template_ulList'), // contiene le <ul>
		tmplList: document.getElementById('templateList'), // contiene i section
		tmplSublists : document.getElementById('template-sublists'),
        absoluteWindow : document.getElementById('absolute-window'),

        processList : document.getElementById('reportProcessList'),

		// btn
		btnAddFilters : document.getElementById('btn-add-filters'),
		btnAddMetrics : document.getElementById('btn-add-metrics'),
		btnAddCompositeMetrics : document.getElementById('btn-add-composite-metrics'),
		btnPreviousStep : document.getElementById('prev'),
		btnNextStep : document.getElementById('next'),
		btnSaveAndProcess: document.getElementById('saveAndProcess'),
        btnSQLProcess : document.getElementById('sql_process'),
		btnSearchValue : document.getElementById('search-field-values'),

		btnProcessReport: document.getElementById('btnProcessReport'), // apre la lista dei report da processare "Crea FX"

		// dialog
		dialogSaveReport: document.getElementById('dialog-save-report'),
		dialogSQLInfo : document.getElementById('dialog-sqlInfo'),
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
		tooltipTimeoutId : null,
		btnToggleHierarchyStruct : document.getElementById('toggle-hierarchy-struct')
	}

	app.addReport = (token, value) => {
		const ul = document.getElementById('ul-processes');
		const content = app.tmplList.content.cloneNode(true);
		const section = content.querySelector('section[data-sublist-processes]');
		const span = section.querySelector('span[data-process]');
		const btnEdit = section.querySelector('button[data-edit]');
		const btnCopy = section.querySelector('button[data-copy]');
		const btnSchedule = section.querySelector('button[data-schedule]');
		section.dataset.elementSearch = 'search-process';
		section.dataset.label = value.name; // per la ricerca
		section.dataset.reportToken = token;
		span.innerText = value.name;
		btnEdit.dataset.id = value.report.processId;
		btnEdit.dataset.processToken = token;
		btnCopy.dataset.id = value.report.processId;
		btnCopy.dataset.processToken = token;
		btnSchedule.dataset.id = value.report.processId;
		btnSchedule.dataset.processToken = token;
		btnEdit.onclick = app.handlerReportEdit;
		btnCopy.onclick = app.handlerReportCopy;
		btnSchedule.onclick = app.handlerReportSelected;
		ul.appendChild(section);
	}

	app.editReport = (token, name) => {
		const ul = document.getElementById('ul-processes');
		const section = ul.querySelector("section[data-report-token='"+token+"']");
		section.dataset.label = name;
		section.querySelector("span[data-process]").innerText = name;
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
			const section = content.querySelector('section[data-sublist-cube]');
			const div = section.querySelector('div.selectable');
			const span = section.querySelector('span');
			section.dataset.label = value.name;
			section.dataset.cubeToken = token;
			div.dataset.label = value.name;
			div.dataset.cubeToken = token;
			div.dataset.tableAlias = value.alias;
			div.dataset.tableName = value.FACT;
			div.dataset.schema = value.schema;
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
				const section = content.querySelector('section[data-sublist-dimension]');
				const div = section.querySelector('div.selectable');
				const span = section.querySelector('span');
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
				section.dataset.relatedObject =  'dimension';
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
					small.dataset.schema = table.schema;
					small.dataset.dimensionToken = token;
					small.dataset.hierToken = hierToken;
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
                            const btnEdit = spanHContent.querySelector('button');
                            section.dataset.relatedObject = 'dimension';
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
                            btnEdit.dataset.objectToken = token;
                            btnEdit.onclick = app.handlerColumnEdit; // TODO: da implementare
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
		const ul = document.getElementById('ul-columns');
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
                    const btnEdit = spanHContent.querySelector('button');
                    section.dataset.relatedObject = 'cube';
                    section.dataset.label = field.ds.field;
                    section.dataset.elementSearch = 'search-columns';
                    section.dataset.cubeToken = cubeToken;
                    selectable.dataset.label = field.ds.field;
                    selectable.dataset.tableName = value.FACT;
                    selectable.dataset.tableAlias = value.alias;
                    selectable.dataset.tokenColumn = token;
                    selectable.dataset.cubeToken = cubeToken;
                    selectable.onclick = app.handlerSelectColumn;
                    btnEdit.dataset.objectToken = token;
                    btnEdit.onclick = app.handlerColumnEdit;
                    span.innerText = field.ds.field;
                    smallTable.innerText = value.FACT;
                    smallCube.innerText = value.name;
                    ul.appendChild(section);
                }
			}
		}
	}

	// popolo la lista dei filtri esistenti
	app.getFilters = (ul_id, hiddenStatus, fn) => {
		for (const [token, filter] of StorageFilter.filters) {
			StorageFilter.selected = token;
            app.addFilter(ul_id, hiddenStatus, fn);
		}
	}

	// verifico se ci sono object selezionati per poter attivare/disattivare alcuni tasti
	app.checkObjectSelected = () => {
		if (Query.objects.size > 0) {
			app.btnSQLProcess.disabled = false;
            app.btnSaveReport.disabled = false;
		} else {
			app.btnSQLProcess.disabled = true;
            app.btnSaveReport.disabled = true;
		}
	}

	// visualizzo metriche / filtri appartenenti al cubo
	app.showCubeObjects = () => {
		document.querySelectorAll("section[data-related-object*='cube'][data-cube-token='" + StorageCube.selected.token + "']").forEach( item => {
			item.hidden = false;
			item.toggleAttribute('data-searchable');
		});
	}

	app.hideCubeObjects = () => {
		document.querySelectorAll("section[data-related-object*='cube'][data-cube-token='" + StorageCube.selected.token + "']").forEach( item => {
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

	app.showDimensionObjects = () => {
		document.querySelectorAll("section[data-related-object*='dimension'][data-dimension-token='" + StorageDimension.selected.token + "']").forEach( hier => {
			hier.hidden = false;
			hier.dataset.searchable = true;
		});
	}

	app.hideDimensionObjects = () => {
		document.querySelectorAll("section[data-related-object*='dimension'][data-dimension-token='" + StorageDimension.selected.token + "']").forEach( hier => {
			hier.hidden = true;
			delete hier.dataset.searchable;
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
					section.dataset.relatedObject = 'dimension';
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
		const ul = document.getElementById('ul-tables');
		for (const [token, value] of StorageCube.cubes) {
			const content = app.tmplList.content.cloneNode(true);
			const section = content.querySelector('section[data-sublist-tables]');
			const div = section.querySelector('div.selectable');
			const spanHContent = div.querySelector('.h-content');
			const span = spanHContent.querySelector('span[table]');
			const small = spanHContent.querySelector('small');
			section.dataset.label = value.FACT;
			section.dataset.cubeToken = token;
			section.dataset.relatedObject = 'cube';
			// section.dataset.tableAlias = value.alias;
			// section.dataset.schemaName = value.schema; // WARN: normalizzare i nomi (data-schema oppure schema-name ?)
			div.dataset.label = value.FACT;
			div.dataset.tableName = value.FACT;
			div.dataset.tableAlias = value.alias;
			// debugger;
			div.dataset.schema = value.schema;
			div.dataset.cubeToken = token;
			div.onclick = app.handlerSelectTable;
			span.innerText = value.FACT;
			small.innerText = value.name;
			ul.appendChild(section);
		}
	}

	// lista tabelle Fact (step 1)
	/*app.getFactTable = () => {
		const ul = document.getElementById('ul-tables');
		for (const [token, value] of StorageCube.cubes) {
			const content = app.tmplList.content.cloneNode(true);
			const section = content.querySelector('section[data-sublist-gen]');
			const div = section.querySelector('div.selectable');
			const span = div.querySelector('span');
			section.dataset.relatedObject = 'cube';
			section.classList.remove('data-item');
			div.classList.remove('selectable');
			section.dataset.cubeToken = token;
			span.innerText = value.FACT;
			ul.appendChild(section);
		}
	}*/

	// lista metriche esistenti
	app.getMetrics = () => {
        /* NOTE: logica delle metriche
        0 : metrica di base
        1 : metrica di base, legata al cubo, composto (es.: prezzo*quantità)
        2 : metrica filtrata
        3 : metrica filtrata composta
        4 : metrica composta
        */
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
                const btnInfo = spanHContent.querySelector('button[data-info-object-token]');
                const btnEdit = spanHContent.querySelector('button[data-object-token]');
                section.dataset.relatedObject = 'cube';
                section.dataset.elementSearch = 'search-exist-metrics';
                section.dataset.label = metric.name;
                section.dataset.cubeToken = cubeToken;
                // TODO: da rivedere
                // if (metric.metric_type !== 1) {
                selectable.dataset.tableName = value.FACT;
                selectable.dataset.tableAlias = value.alias;
                // } else {
                // metricha di base composta
                selectable.dataset.cubeToken = cubeToken;
                // }
                // div.dataset.cubeToken = cubeToken;
                selectable.dataset.metricToken = metric.token;
                selectable.dataset.metricType = metric.metric_type;
                // div.dataset.label = metric.name;
                selectable.onclick = app.handlerMetricSelected;
                (metric.metric_type === 2) ? btnInfo.dataset.infoObjectToken = metric.token : btnInfo.hidden = 'true';
                btnEdit.dataset.objectToken = metric.token;
                btnEdit.onclick = app.handlerMetricEdit; // TODO: implementare
                span.innerText = metric.name;
                smallTable.innerText = value.FACT;
                smallCube.innerText = value.name;
                ul.appendChild(section);
            });
        }
    }

	// lista metriche composte
	app.getCompositeMetrics = () => {
		// TODO: 2022-05-27 in futuro ci sarà da valutare metriche composte appartenenti a più cubi
		StorageMetric.compositeMetrics.forEach( metric => {
			StorageMetric.selected = metric.token;
			// aggiungo la metrica alla #ul-exist-composite-metrics
			app.addCompositeMetric(); // questa function viene usata anche quando si crea una nuova metrica composta
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
				const span = div.querySelector('span[metric]');
				const small = div.querySelector('small');
				section.dataset.relatedObject = 'cube';
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
			}
		}
	}

	// execute report
 	app.handlerReportSelected = async (e) => {
		console.clear();
		const processToken = e.currentTarget.dataset.processToken;
		let jsonDataParsed = JSON.parse(window.localStorage.getItem(processToken));
		console.dir(jsonDataParsed.report);
		// invio, al fetchAPI solo i dati della prop 'report' che sono quelli utili alla creazione del datamart
		const params = JSON.stringify(jsonDataParsed.report);
		App.showConsole('Elaborazione in corso...', 'info');
		// chiudo la lista dei report da eseguire
		app.processList.toggleAttribute('hidden');
		// lo processo in post, come fatto per il salvataggio del process. La richiesta in get potrebbe superare il limite consentito nella url, come già successo per saveReport()
		const url = "/fetch_api/cube/process";
		const init = {headers: {'Content-Type': 'application/json'}, method: 'POST', body: params};
		const req = new Request(url, init);
		await fetch(req)
			.then((response) => {
				// TODO: Rivedere la gestione del try...catch per poter creare un proprio oggetto Error visualizzando un errore personalizzato
				if (!response.ok) {throw Error(response.statusText);}
				return response;
			})
			.then((response) => response.json())
			.then((response) => {
				if (response) {
					App.closeConsole();
					App.showConsole('Datamart creato con successo!', 'done', 5000);
					// console.log('data : ', response);
					// NOTE: qui ho creato la FX, a questo punto potrei scegliere di visualizzare il report, per il momento mi serve solo la FX.
					// app.getDatamart(reportId, jsonDataParsed); // recupero i dati dalla FX appena creata
				} else {
					// TODO: Da testare se il codice arriva qui o viene gestito sempre dal catch()
					console.debug('FX non è stata creata');
					debugger;
					App.showConsole('Errori nella creazione del datamart', 'error', 5000);
				}
			})
			.catch( err => {
				App.showConsole(err, 'error');
				console.error(err);
			});
	}

	app.handlerReportEdit = (e) => {
        StorageProcess.selected = e.target.dataset.processToken;
        Query.token = e.target.dataset.processToken;
        Query.processId = +e.target.dataset.id;
        // cubi
        StorageProcess.selected.edit.cubes.forEach( token => {
            console.log(token);
            StorageCube.selected = token;
            // selezione del cubo nella #ul-cubes
            document.querySelector("#ul-cubes section[data-cube-token='"+token+"'] .selectable").dataset.selected = 'true';
            Query.cubes = token;
            app.showCubeObjects();
        });
        // dimensioni
        StorageProcess.selected.edit.dimensions.forEach( token => {
            StorageDimension.selected = token;
            document.querySelector("#ul-dimensions section[data-dimension-token='"+token+"'] .selectable").dataset.selected = 'true';
            Query.dimensions = token;
            app.showDimensionObjects();
        });
        // colonne
        for (const [token, column] of Object.entries(StorageProcess.selected.edit.columns)) {
            // Query.select = { field: Query.field, SQLReport: textarea, alias : alias.value };
            document.querySelector("#ul-columns .selectable[data-token-column='"+token+"']").dataset.selected = 'true';
            Query.field = column.field;
            // reimposto la colonna come quando viene selezionata
            Query.select = column;
            if (column.hasOwnProperty('tableId')) {
                Query.objects = {
                    token,
                    tableId : column.tableId,
                    hierToken : column.hier,
                    dimension : column.dimensionToken
                };
            } else {
                Query.objects = {
                    token,
                    cubeToken : column.cubeToken
                };
            }
        }
        // filtri
        StorageProcess.selected.edit.filters.forEach( token => {
            StorageFilter.selected = token;
            // seleziono i filtri impostati nel report
            document.querySelector("#ul-exist-filters .selectable[data-filter-token='"+token+"']").dataset.selected = 'true';
            // reimposto il filtro come se fosse stato selezionato
            Query.filters = StorageFilter.selected;
            if (StorageFilter.selected.hier) {
                Query.objects = {
                    token,
                    tableId : StorageFilter.selected.tableId,
                    hierToken : StorageFilter.selected.hier.token,
                    dimension : StorageFilter.selected.dimensionToken
                };
            } else {
                Query.objects = {token, cubeToken : StorageFilter.selected.cubeToken};
            }
        });
        // metriche
        StorageProcess.selected.edit.metrics.forEach( token => {
            StorageMetric.selected = token;
            // seleziono le metriche (0, 1, 2, 3) impostate nel report
            document.querySelector("#ul-exist-metrics .selectable[data-metric-token='"+token+"']").dataset.selected = 'true';
            Query.objects = {token, cubeToken : StorageMetric.selected.cubeToken};
        });
        // metriche composte
        StorageProcess.selected.edit.compositeMetrics.forEach( token => {
            StorageMetric.selected = token;
            // seleziono le metriche (0, 1, 2, 3) impostate nel report
            document.querySelector("#ul-exist-composite-metrics .selectable[data-metric-token='"+token+"']").dataset.selected = 'true';
            Query.objects = {token, cubes : StorageMetric.selected.cubes};
        });

        app.processList.toggleAttribute('hidden');
        app.checkObjectSelected();
	}

	app.handlerReportCopy = (e) => {
		console.clear();
		StorageProcess.selected = e.target.dataset.processToken;
		const process = StorageProcess.selected;
		console.log('process selected : ', process);
		// modifico il token e il processId
		process.token = rand().substr(0, 21);;
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
		StorageProcess.save(process);
		// lo aggiungo alla #ul-processes
		app.addReport(process.token, process);
	}

	// edit filter
    app.handlerFilterEdit = (e) => {
        // TODO: Implementazione
        // recupero il filtro selezionato
        // apro la #dialog-filter
        // carico l'elenco delle colonne della tabella (da valutare per i filtri su più tabelle)
        // inserisco i dati del filtro nella dialog (formula, name, table)
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
		// Query.tableAlias = StorageCube.selected.alias;
		// al momento non serve l'object con tableAlias e from, lo recupero direttamente dal nome del cubo in handlerEditReport, se così potrei anche utilizzare un oggetto Set anziche Map in Query.js
		// Query.elementCube = {token : e.currentTarget.dataset.cubeToken, tableAlias : StorageCube.selected.alias, from : Query.from, FACT : StorageCube.selected.FACT, name : StorageCube.selected.name};
		if (e.currentTarget.hasAttribute('data-selected')) {
			// nascondo tutti gli elementi relativi al cubo deselezionato
			// TODO: oltre a nascondere gli elementi del cubo deselezionato, devo anche rimuoverli dalla proprietà #objects della classe Query
			app.hideCubeObjects();
			e.currentTarget.toggleAttribute('data-selected');
		} else {
			app.showCubeObjects();
			// visualizzo la tabelle fact del cubo selezionato
			// document.querySelector("#ul-fact-tables > section[data-cube-token='" + StorageCube.selected.token + "']").hidden = false;
			// aggiungo l'attr data-selected
			e.currentTarget.toggleAttribute('data-selected');
		}
		Query.cubes = e.currentTarget.dataset.cubeToken;
	}

	// selezione delle dimensioni
	app.handlerDimensionSelected = (e) => {
		StorageDimension.selected = e.currentTarget.dataset.dimensionToken;
		console.log('Dimensione selezionata : ', StorageDimension.selected);
		// Query.elementDimension = { token : e.currentTarget.dataset.dimensionToken, cubes : StorageDimension.selected.cubes};
		if (e.currentTarget.hasAttribute('data-selected')) {
			e.currentTarget.toggleAttribute('data-selected');
			// TODO: oltre a nascondere gli elementi della dimensione deselezionata, devo anche eliminarli dalla proprietà #objects della classe Query.
			app.hideDimensionObjects();
		} else {
			// imposto l'attr data-selected
			e.currentTarget.toggleAttribute('data-selected');
			app.showDimensionObjects();
			
			app.btnToggleHierarchyStruct.disabled = false;
		}
		Query.dimensions = e.currentTarget.dataset.dimensionToken;
	}
	// selezione di un filtro già presente, lo salvo nell'oggetto Query
	app.handlerFilterSelected = (e) => {
		StorageFilter.selected = e.currentTarget.dataset.filterToken;
		if (e.currentTarget.hasAttribute('data-selected')) {
			e.currentTarget.toggleAttribute('data-selected');
			// delete filter
            // TODO: da rivedere se occorre aggiungere qui anche la prop SQL
			Query.filters = { token : e.currentTarget.dataset.filterToken, SQL : `${StorageFilter.selected.tableAlias}.${StorageFilter.selected.formula}` };
			Query.objects = { token : e.currentTarget.dataset.filterToken };
		} else {
			e.currentTarget.toggleAttribute('data-selected');
			// verifico le gerarchie incluse nel filtro selezionato (modifica filtro multiplo)
			Query.objects = {
                token : e.currentTarget.dataset.filterToken,
                cubeToken : StorageFilter.selected.cubeToken,
                hierarchies : StorageFilter.selected.hierarchies,
                dimensions : StorageFilter.selected.dimensions
            };
			// console.log(StorageFilter.selected.formula);
			// nel salvare il filtro nel report attuale devo impostarne anche l'alias della tabella selezionata nella dialog
            Query.filters = StorageFilter.selected;
			// Query.filters = { token : e.currentTarget.dataset.filterToken, SQL : `${StorageFilter.selected.tableAlias}.${StorageFilter.selected.formula}` };
			app.checkObjectSelected();
		}
	}

	app.handlerMetricFilterSelected = e => e.currentTarget.toggleAttribute('data-selected');

	// selezione di una metrica già esistente
	app.handlerMetricSelected = (e) => {
		StorageMetric.selected = e.currentTarget.dataset.metricToken;
		if (e.currentTarget.hasAttribute('data-selected')) {
			e.currentTarget.toggleAttribute('data-selected');
			Query.objects = {token : e.currentTarget.dataset.metricToken};
		} else {
			e.currentTarget.toggleAttribute('data-selected');
            // TODO: per le metriche composte (metric_type: 4) c'è da definire se inserire nel JSON, i cubi a cui appartengono le metriche che compongono la composta
            if (+e.currentTarget.dataset.metricType === 4) {
                Query.objects = {token : e.currentTarget.dataset.metricToken, cubes : StorageMetric.selected.cubes};
                // quando viene selezionata una metrica composta, le metriche al suo interno verranno incluse nel datamart finale, potrei selezionarle sulla pagina con un colore diverso per
                // ... evidenziare il fatto che sono già incluse nel report
                // la prop formula->metrics_alias contiene {nome_metrica : metricToken, metricAlias}. Tramite il metricToken posso selezionare le metriche incluse nella formula della composta.
                for (const [metricName, metric] of Object.entries(StorageMetric.selected.formula.metrics_alias)) {
                    document.querySelector("#ul-exist-metrics .selectable[data-metric-token='"+metric.token+"']").dataset.selected = 'true';
                }
                
            } else {
                Query.objects = {token : e.currentTarget.dataset.metricToken, cubeToken : e.currentTarget.dataset.cubeToken};
            }
		}
		app.checkObjectSelected();
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
        span.setAttribute('contenteditable', 'true');
        textArea.appendChild(span);
        span.focus();
    }

    // div contenteditable della formula per la metrica composta
    document.getElementById('composite-metric-formula').onclick = (e) => {
        console.log('e : ', e);
        console.log('e.target : ', e.target);
        console.log('e.currentTarget : ', e.currentTarget);
        if (e.target.localName === 'div') {
            const span = document.createElement('span');
            span.setAttribute('contenteditable', 'true');
            e.target.appendChild(span);
            span.focus();
        }
    }

    // div contenteditable della formula per il filtro
    document.getElementById('composite-filter-formula').onclick = (e) => {
        console.log('e : ', e);
        // elimino lo span che contiene il "placeholder"

        console.log('e.target : ', e.target);
        console.log('e.currentTarget : ', e.currentTarget);
        if (e.target.localName === 'div') {
            const span = document.createElement('span');
            span.setAttribute('contenteditable', 'true');
            e.target.appendChild(span);
            span.focus();
        }
    }

	// selezione delle colonne
	app.handlerSelectColumn = (e) => {
		console.log('addColumns');
		// verifico che almeno una gerarchia sia stata selezionata
		// const dimensionSelectedCount = document.querySelectorAll('#ul-dimensions .selectable[data-selected]').length;
		if (Query.dimensions.size === 0) {
			App.showConsole('Selezionare una gerarchia per poter aggiungere colonne al report', 'warning');
		} else {
			Query.table = e.currentTarget.dataset.tableName;
			Query.tableAlias = e.currentTarget.dataset.tableAlias;
			Query.columnToken = e.currentTarget.dataset.tokenColumn;
			// la FACT table non ha un data-table-id
			if (e.currentTarget.hasAttribute('data-table-id')) {
				StorageDimension.selected = e.currentTarget.dataset.dimensionToken;
				Query.tableId = +e.currentTarget.dataset.tableId;
				Query.field = {[Query.columnToken] : StorageDimension.selected.hierarchies[e.currentTarget.dataset.hierToken].columns[Query.tableAlias][Query.columnToken]};
			} else {
				StorageCube.selected = e.currentTarget.dataset.cubeToken;
				Query.field = {[Query.columnToken] : StorageCube.selected.columns[Query.tableAlias][Query.columnToken]};
			}
			if (e.currentTarget.hasAttribute('data-selected')) {
				e.currentTarget.toggleAttribute('data-selected');
				// Query.addTables(e.currentTarget.dataset.hierToken);
				// verifico quali relazioni inserire in where e quindi anche in from
				// app.removeRelations(e.currentTarget.dataset.hierToken);
				// Query.objects = {type : 'column', token : Query.columnToken};
				Query.objects = {token : Query.columnToken};

				// TODO: colonna deselezionata, implementare la logica in Query.deleteSelect
				// Query.deleteSelect();				
			} else {
				document.getElementById('columnAlias').value = '';
				document.getElementById('columnAlias').focus();
				// imposto, nella section della dialog, l'attributo data-hier-token e data-dimension-name selezionata
				if (e.currentTarget.hasAttribute('data-hier-token')) {
					app.dialogColumns.querySelector('section').dataset.hierToken = e.currentTarget.dataset.hierToken;
					app.dialogColumns.querySelector('section').dataset.dimensionToken = e.currentTarget.dataset.dimensionToken;
				} else {
					// selezione di una colonna della Fact, elimino l'attributo data-hier-token perchè, nel tasto Salva, è su questo attributo che controllo se si tratta di una colonna da dimensione o da Fact
					delete app.dialogColumns.querySelector('section').dataset.hierToken;
				}
				app.dialogColumns.showModal();
			}			
		}		
	}

	// selezione della tabella nella dialog-tables (columns)
	app.handlerTableSelected = (e) => {
		debugger;
		const dimension = e.currentTarget.dataset.dimensionToken;
		Query.table = e.currentTarget.getAttribute('label'); // TODO: impostare data-label
		Query.tableAlias = e.currentTarget.dataset.tableAlias;
		Query.tableId = +e.currentTarget.dataset.tableId;
		const hier = e.currentTarget.dataset.hierToken;
		// deseleziono le precedenti tabelle selezionate
		// let activeDialog = document.querySelector('dialog[open]');
		if (app.dialogColumns.querySelector('#fieldList-tables ul li[selected]')) {
			const li = app.dialogColumns.querySelector('#fieldList-tables ul li[selected]');
			li.toggleAttribute('selected');
			// nascondo tutte le colonne che fanno parte della tabella precedentemente selezionata
			app.dialogColumns.querySelectorAll("ul[data-id='fields-column'] > section[data-dimension-name='" + dimension + "'][data-hier-token='" + hier + "'][data-table-name='" + li.getAttribute('label') + "']").forEach((field) => {
				field.hidden = true;
				delete field.dataset.searchable;
			});
		}
		e.currentTarget.toggleAttribute('selected');
		if (e.currentTarget.hasAttribute('selected')) {
			// visualizzo le colonne appartenenti alla tabella selezionata
			app.dialogColumns.querySelectorAll("ul[data-id='fields-column'] > section[data-dimension-name='" + dimension + "'][data-hier-token='" + hier + "'][data-table-name='" + Query.table + "']").forEach((field) => {
				field.hidden = false;
				field.dataset.searchable = 'true';
			});
		}
	}

	// selezione di una tabella nella dialog-filter
    app.handlerSelectTable = async (e) => {
        if (!e.currentTarget.hasAttribute('data-selected')) {
            // de-seleziono le tabelle precedentemente selezionate se ce ne sono
            if (document.querySelector('#ul-tables .selectable[data-selected]')) document.querySelector('#ul-tables .selectable[data-selected]').toggleAttribute('data-selected');
            // disabilito il tasto "Ricerca valori", viene riattivato quando si seleziona una colonna della tabella
            app.btnSearchValue.disabled = true;
            // query per visualizzare tutti i field della tabella
            e.currentTarget.toggleAttribute('data-selected');

            Query.table = e.currentTarget.dataset.tableName;
            Query.tableAlias = e.currentTarget.dataset.tableAlias;
            Query.schema = e.currentTarget.dataset.schema;
            if (e.currentTarget.hasAttribute('data-hier-token')) {
                Query.tableId = +e.currentTarget.dataset.tableId;
                Query.hierToken = e.currentTarget.dataset.hierToken;
                Query.dimensionToken = e.currentTarget.dataset.dimensionToken;
            } else {
                // selezione di una tabella della Fact, elimino l'attributo data-hier-token perchè, nel tasto Salva, è su questo attributo che controllo se si tratta di una colonna da dimensione o da Fact
                // TODO: da ricontrollare se questi due attributi vengono utilizzati quando si seleziona una tabella appartenente a una dimensione->hier
                Query.tableId = null;
                // StorageCube.selected = e.currentTarget.dataset.cubeToken;
                Query.cubeToken = e.currentTarget.dataset.cubeToken;
            }
            // pulisco la <ul> dialog-filter-fields contenente la lista dei campi recuperata dal db, della selezione precedente
            app.dialogFilter.querySelectorAll('#dialog-filter-fields > section').forEach( section => section.remove());
            //app.dialogFilter.querySelector('section').dataset.tableName = e.currentTarget.dataset.tableName;
            app.addFields(await app.getFields());
        }
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
                // NOTE: utilizzo di map()
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
			delete column.dataset.searchable;
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
        // field selezionato
        Query.field = e.currentTarget.dataset.label;
        // TODO: il fieldType mi servirà per scegliere di trattare il datatype del valore da inserire nell'SQL.
        // ... se string ad esempio, potrei inserire automaticamente degli apici, come in CodAziendaSId = 'XXXX'
        Query.fieldType = e.currentTarget.dataset.type;
        // ul con i valori contenuti nella colonna
        const valueList = app.dialogValue.querySelector('#ul-filter-values');
        valueList.querySelectorAll('section').forEach( section => section.remove());
        const textarea = document.getElementById('composite-filter-formula');
        const mark = document.createElement('mark');
        // TODO: creare un template per il mark
        //const small = document.createElement('small');
        // aggiungo il tableAlias e table come attributo.
        // ...in questo modo visualizzo solo il nome della colonna ma quando andrò a salvare la formula del filtro salverò table.field
        mark.dataset.tableAlias = Query.tableAlias;
        mark.dataset.table = Query.table;
        //debugger;
        if (Query.tableId === null) {
            // tabella selezionata è la FACT
            mark.dataset.cubeToken = Query.cubeToken;
        } else {
            mark.dataset.tableId = Query.tableId;
            mark.dataset.hierToken = Query.hierToken;
            // mark.dataset.hierName = Query.hierName;
            mark.dataset.dimensionToken = Query.dimensionToken;
        }
        mark.dataset.field = Query.field;
        // TODO: visualizzare, nell'SQL formula solo il nome della colonna, potrei impostare un attr dove inserire il nome della tabella e mostrarlo, con css::before, all'evento del mouseOver
        // mark.innerText = `${Query.table}.${Query.field}`;
        mark.innerText = Query.field;
        //small.innerText = Query.table;
        textarea.appendChild(mark);
        //mark.appendChild(small);
        const span = document.createElement('span');
        span.setAttribute('contenteditable', 'true');
        textarea.appendChild(span);
        span.focus();
        // TODO: checkFormulaValid()
        app.btnSearchValue.disabled = false;
        app.btnFilterSave.disabled = false;
    }

    app.addFields = (response) => {
        const ul = document.getElementById('dialog-filter-fields'); // dove verrà inserita la <ul>
        // ul.querySelectorAll('section').forEach((el) => {el.remove();});
        for (const [key, value] of Object.entries(response)) {
            // console.log(key, value);
            const content = app.tmplList.content.cloneNode(true);
            const section = content.querySelector('section[data-sublist-gen]');
            const selectable = section.querySelector('.selectable');
            const span = selectable.querySelector('span');
            section.hidden = false;
            section.dataset.searchable = true;
            section.dataset.label = value.COLUMN_NAME;
            section.dataset.elementSearch = 'dialog-filter-search-field';
            //section.dataset.tableName = Query.table;
            selectable.dataset.schema = Query.schema;
            // scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
            let pos = value.DATA_TYPE.indexOf('('); // datatype
            const type = (pos !== -1) ? value.DATA_TYPE.substring(0, pos) : value.DATA_TYPE;
            selectable.dataset.type = type;
            selectable.dataset.label = value.COLUMN_NAME;
            selectable.dataset.tableName = Query.table;
            selectable.onclick = app.handlerSelectField;
            span.innerText = value.COLUMN_NAME;
            ul.appendChild(section);
        }
    }

	// carico elenco colonne dal DB da visualizzare nella dialogFilter
    app.getFields = async () => {
        return await fetch('/fetch_api/' + Query.schema + '/schema/' + Query.table + '/table_info')
            .then((response) => {
                if (!response.ok) { throw Error(response.statusText); }
                    return response;
                })
            .then((response) => response.json())
            .then(response => response)
            .catch( err => {
                App.showConsole(err, 'error');
                console.error(err);
            });
    }

	// tasto 'Fatto' nella dialogFilter
    app.btnFilterDone.onclick = () => app.dialogFilter.close();
	
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
		  .catch( err => {
		  	App.showConsole(err, 'error');
		  	console.error(err);
		  });
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
		//const rand = () => Math.random(0).toString(36).substr(2);
		const token = rand().substr(0, 21);
		const date = new Date();
		// const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
		const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
		// verifico se ci sono filtri da associare a questa metrica
		// let associatedFilters = new Map();
		// let from = new Set();
		// let where = new Map();
		let associatedFilters = new Set();
		document.querySelectorAll('#ul-metric-filters .selectable[data-selected]').forEach( filterSelected => {
			associatedFilters.add(filterSelected.dataset.filterToken);
		});
		let metricObj = { created_at : date.toLocaleDateString('it-IT', options), updated_at : date.toLocaleDateString('it-IT', options) };
		/* se sono presenti dei filtri per la metrica che si sta creando, il metric_type sarà :
		* 2 : metrica di base con filtri
		* 3 : metrica di base composta, con filtri
		*/
		if (associatedFilters.size > 0) {
			metric_type = (metric_type === 0) ? 2 : 3;
		}
		debugger;
		
		switch (metric_type) {
			case 1:
				// base composta (legata al cubo) senza filtri es.: prezzo*quantita
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
				// base filtrata (es.: venduto con filtro manodopera)
				debugger;
				metricObj = {
					type: 'METRIC',
					token,
					metric_type,
					name,
					formula: { token, SQLFunction, field: Query.field, distinct: distinctOption, alias, table: Query.table, tableAlias : Query.tableAlias, filters: [...associatedFilters] },
					cubeToken : StorageCube.selected.token
				};
				break;
			case 3:
				// base composta filtrata (es.: prezzo * qta impostate sul cubo e con filtro)
				metricObj = {
					type: 'METRIC',
					token,
					metric_type,
					name,
					formula: { token, SQLFunction, field: Query.field, distinct: distinctOption, alias, filters: [...associatedFilters] },
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
		StorageMetric.save(metricObj);
		// salvo nel DB
		// app.saveMetricDB(metricObj);
		// Imposto la metrica appena create come "selezionata" in modo da andare a creare il nuovo elemento nella #ul-exist-metrics
		StorageMetric.selected = token;
		// aggiungo la nuova metrica alla #ul-exist-metrics
		app.addMetric('ul-exist-metrics');
	}

	// aggiungo la metrica appena creata alla <ul> (metriche base e filtrate)
	app.addMetric = (ulId) => {
        const ul = document.getElementById(ulId);
        const content = app.tmplList.content.cloneNode(true);
        const section = content.querySelector('section[data-sublist-metrics]');
        const spanHContent = section.querySelector('.h-content');
        const selectable = spanHContent.querySelector('.selectable');
        const span = spanHContent.querySelector('span[metric]');
        const smallTable = spanHContent.querySelector('small[table]');
        const smallCube = spanHContent.querySelector('small[cube]');
        const btnInfo = spanHContent.querySelector('button[data-info-object-token]');
        const btnEdit = spanHContent.querySelector('button[data-object-token]');
        section.removeAttribute('hidden');
        section.dataset.elementSearch = 'search-exist-metrics';
        section.dataset.label = StorageMetric.selected.name;
        section.dataset.cubeToken = StorageMetric.selected.cubeToken;
        section.toggleAttribute('data-searchable');

		// div.dataset.label = StorageMetric.selected.name;
		// if (StorageMetric.selected.metric_type === 0 || StorageMetric.selected.metric_type === 2) {
			selectable.dataset.tableName = Query.table;
			selectable.dataset.tableAlias = Query.tableAlias;
			selectable.dataset.cubeToken = StorageMetric.selected.cubeToken;
		// }		
		selectable.dataset.metricToken = StorageMetric.selected.token;
		selectable.dataset.metricType = StorageMetric.selected.metric_type;		
		span.innerText = StorageMetric.selected.name;
        (StorageMetric.selected.metric_type === 2) ? btnInfo.dataset.infoObjectToken = StorageMetric.selected.token : btnInfo.hidden = 'true';
        btnEdit.dataset.objectToken = StorageMetric.selected.token;
        btnEdit.onclick = app.handlerMetricEdit; // TODO: implementare
		if (StorageMetric.selected.metric_type === 0 || StorageMetric.selected.metric_type === 2) smallTable.innerText = Query.table;
		smallCube.innerText = StorageCube.selected.name;
		selectable.onclick = app.handlerMetricSelected;
		ul.appendChild(section);
	}

	app.addFilter = (ul_id, hiddenStatus, fn) => {
        /*
        * hidden (boolean) : indica che il section deve essere visibile/nascosto (boolean)
        * La funzione, invocata da getFilters() avrà hidden true (elementi nascosti)
        * mentre, se invocata dalla creazione di un nuovo filtro avrà hidden: false
        * fn : il nome della function da associare a .selectable.onclick
        */
		const ul = document.getElementById(ul_id);
		const contentElement = app.tmplList.content.cloneNode(true);
        const section = contentElement.querySelector('section[data-sublist-filters]');
        const spanHContent = section.querySelector('.h-content');
        const selectable = spanHContent.querySelector('.selectable');
        const span = selectable.querySelector('span[filter]');
        //const smallTable = selectable.querySelector('small[table]');
        const smallHier = selectable.querySelector('small:last-child');
        const btnEdit = spanHContent.querySelector('button');
        section.hidden = hiddenStatus;
        // il filtro può contenere tabelle dei livelli dimensionali insieme alla FACT
        section.dataset.relatedObject = 'dimension cube';
        section.dataset.elementSearch = 'search-exist-filters';
        section.dataset.label = StorageFilter.selected.name;
        if (StorageFilter.selected.dimensions.length !== 0) {
        	section.dataset.dimensionToken = StorageFilter.selected.dimensions.join(' ');	
        	// elenco token hier separate da spazi
        	section.dataset.hierToken = Object.keys(StorageFilter.selected.hierarchies).join(' ');
        } else {
        	section.dataset.cubeToken = StorageFilter.selected.cubeToken;
        }                       
        selectable.dataset.filterToken = StorageFilter.selected.token;
        selectable.onclick = app[fn];
        span.innerText = StorageFilter.selected.name;
        // smallTable.innerText = table.table;
        smallHier.setAttribute('hier', 'true'); // TODO: dataset
        btnEdit.dataset.objectToken = StorageFilter.selected.token;
        //btnEdit.onclick = app.handlerFilterEdit;
        // smallHier.innerText = hier.name;
        ul.appendChild(section);
	}

	// aggiungo la metrica appena creata alla <ul> (metrica composta)
	app.addCompositeMetric = () => {
        const ul = document.getElementById('ul-exist-composite-metrics');
        const contentElement = app.tmplList.content.cloneNode(true);
        const section = contentElement.querySelector('section[data-sublist-composite-metrics]');
        const spanHContent = section.querySelector('.h-content');
        const selectable = spanHContent.querySelector('.selectable');
        const smalls = selectable.querySelector('.smalls');
        const spanMetric = spanHContent.querySelector('span[metric]');
        const btnInfo = spanHContent.querySelector('button[data-info-object-token]')
        const btnEdit = spanHContent.querySelector('button[data-object-token]')
        section.dataset.relatedObject = 'cube';
        // non esiste nessun cubo legato a una metrica composta, quindi la rendo subito visibile
        section.hidden = false;
        // const smallTable = spanHContent.querySelector('small[table]');
        // const smallCube = spanHContent.querySelector('small[cube]');
        section.dataset.elementSearch = 'search-exist-metrics';
        section.dataset.label = StorageMetric.selected.name; // ricerca
        // section.dataset.cubeToken = cubeToken;
        selectable.dataset.metricToken = StorageMetric.selected.token;
        selectable.dataset.metricType = StorageMetric.selected.metric_type;
        // selectable.dataset.tableName = value.FACT;
        // selectable.dataset.tableAlias = value.alias;
        // selectable.dataset.cubeToken = cubeToken;
        selectable.onclick = app.handlerMetricSelected;
        spanMetric.innerText = StorageMetric.selected.name;
        // per ogni cubo in StorageMetric.selected.metric_cubes
        for ( const [cubeToken, cube] of Object.entries(StorageMetric.selected.cubes)) {
            // debugger;
            const contentSub = app.tmplSublists.content.cloneNode(true);
            const small = contentSub.querySelector('small');
            small.dataset.cubeToken = cubeToken;
            // small.dataset.metricToken = StorageMetric.selected.token;
            // small.dataset.searchable = true;
            // small.dataset.tableAlias = table.alias;
            // small.dataset.tableId = tableId;
            // small.dataset.elementSearch = 'search-hierarchy';
            small.innerText = cube;
            small.dataset.attr = cube+'test';
            smalls.appendChild(small);
        }
        ul.appendChild(section);
    }

	// save compositeMetric
	app.btnCompositeMetricSave.onclick = () => {
		const name = document.getElementById('composite-metric-name').value;
		const alias = document.getElementById('composite-alias-metric').value;
		let arr_sql = [];
		//const rand = () => Math.random(0).toString(36).substr(2);
		const token = rand().substr(0, 21);
		let metricsAlias = {}; // contiene un'elenco di object con nome_metrica : alias che compongono la metrica composta
		let metricCubes = new Map(); // contiene i cubi relativi alle metriche all'interno della metrica composta
		document.querySelectorAll('#composite-metric-formula *').forEach( element => {
			console.log('element : ', element);
			// console.log('element : ', element.nodeName);
			// se l'elemento è un <mark> lo aggiungo all'array arr_sql, questo creerà la formula in formato SQL
			if (element.nodeName === 'MARK') {
				StorageMetric.selected = element.dataset.metricToken;
				// recupero il nome del cubo a cui appartiene la metrica. Questo lo visualizzerò nell'elenco delle metriche composte
				StorageCube.selected = StorageMetric.selected.cubeToken;
				metricCubes.set(StorageCube.selected.token, StorageCube.selected.name);
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
		const metricObj = { type: 'METRIC', token, name, metric_type : 4, formula: { token, formula_sql : arr_sql, alias, metrics_alias : metricsAlias }, cubes : Object.fromEntries(metricCubes) };
		console.log(metricObj);
		StorageMetric.save(metricObj);
		// salvo nel DB
		// app.saveMetricDB(metricObj);
		// aggiungo la metrica alla <ul>
		// reimposto, come metrica selezionata, la metrica appena creata e da aggiungere a #ul-exist-composite-metrics
		StorageMetric.selected = token;
		app.addCompositeMetric();
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
		  .catch( err => {
		  	App.showConsole(err, 'error');
		  	console.error(err);
		  });
	}

	// save filter
    app.btnFilterSave.onclick = () => {
        console.log(Query.table);
        // per i filtri creati sulla Fact, hier e dimension devono essere = null ma và salvato, nel filtro, il nome del cubo a cui accede
        const textarea = document.getElementById('composite-filter-formula');
        const filterName = document.getElementById('filterName');
        const token = rand().substr(0, 21);
        const date = new Date();
        // const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
        let filterObject = {};
        let sql_formula = [];
        let hierarchies = new Map(); // tabelle (e quindi gerarchie) utilizzate nel filtro
        let dimensions = new Set();
        let cubeToken;
        //let dimensions = [];
        // la creazione di un filtro su un livello dimensionale salva il filtro con, all'interno, le proprietà dimension e hier.
        // Un filtro impostato la FACT avrà al suo interno il nome del cubo a cui è associato e l'alias della FACT
        document.querySelectorAll('#composite-filter-formula *').forEach( element => {
            // console.log(element);
            // se, nell'elemento <mark> è presente il tableId allora posso recuperare anche hierToken, hierName e dimensionToken
            // ... altrimenti devo recuperare il cubeToken. Ci sono anche filtri che possono essere fatti su un livello dimensionale e su una FACT
            if (element.nodeName === 'MARK') {
                if (element.dataset.tableId) {
                    // tabella appartenente a un livello dimensionale
                    // debugger;
                    dimensions.add(element.dataset.dimensionToken);
                    sql_formula.push(`${element.dataset.tableAlias}.${element.dataset.field}`); // Azienda_444.id
                    //sql_formula.push(element.innerText.trim());
                    //debugger;
                    if (hierarchies.has(element.dataset.hierToken)) {
                        if (+element.dataset.tableId < hierarchies.get(element.dataset.hierToken)) {
                            hierarchies.set(element.dataset.hierToken, +element.dataset.tableId);
                        }
                    } else {
                        hierarchies.set(element.dataset.hierToken, +element.dataset.tableId);
                    }
                } else {
                    // tabella appartenente alla FACT.
                    cubeToken = element.dataset.cubeToken;
                    // ...non dovrebbe servire il cubeToken su un filtro associato alla FACT, perchè in ogni caso, la FACT viene aggiunta in base alle metriche (che devono essere obbligatorie)
                    sql_formula.push(`${element.dataset.tableAlias}.${element.dataset.field}`);
                }
            } else {
                sql_formula.push(element.innerText.trim());
            }
        });
        console.log(sql_formula);
        console.log(hierarchies);
        filterObject = {
            token,
            type: 'FILTER',
            name: filterName.value,
            dimensions : [...dimensions],
            cubeToken,
            formula : sql_formula.join(' '), // Azienda_444.id = 43
            hierarchies : Object.fromEntries(hierarchies),
            created_at : date.toLocaleDateString('it-IT', options), updated_at : date.toLocaleDateString('it-IT', options)
        };
        debugger;

        // if (app.dialogFilter.querySelector('section').hasAttribute('data-hier-token')) {
            // debugger;
            //hierToken = app.dialogFilter.querySelector('section').dataset.hierToken;
            //hierName = app.dialogFilter.querySelector('section').dataset.hierName;
            //dimensionToken = app.dialogFilter.querySelector('section').dataset.dimensionToken;
            // NOTE: inizializzazione di un Map con un Object
            /*filterObject = new Map([
            [token, {token, 'type': 'FILTER', 'name': filterName.value, 'table': Query.table, formula : textarea.value, dimension, hier}]
            ]);*/
            /*filterObject = {
                token,
                type: 'FILTER',
                name: filterName.value,
                table: Query.table,
                tableAlias : Query.tableAlias,
                tableId : Query.tableId,
                formula : textarea.value,
                dimensionToken,
                hier : {token : hierToken, name: hierName},
                created_at : date.toLocaleDateString('it-IT', options), updated_at : date.toLocaleDateString('it-IT', options)
            };*/
        // } else {
            /*filterObject = {
                token,
                type: 'FILTER',
                name: filterName.value,
                table: Query.table,
                tableAlias : Query.tableAlias,
                formula : textarea.value,
                cubeToken : StorageCube.selected.token,
                alias : StorageCube.selected.alias,
                created_at : date.toLocaleDateString('it-IT', options), updated_at : date.toLocaleDateString('it-IT', options)
            };*/
        // }
        StorageFilter.save(filterObject);
        StorageFilter.selected = token;
        // salvataggio nel DB
        // app.saveFilterDB(filterObject);
        // reset del form
        filterName.value = "";
        filterName.focus();
        textarea.value = "";
        // aggiorno la lista dei filtri esistenti, aggiungendo il filtro appena creato
        app.addFilter('ul-exist-filters', false, 'handlerFilterSelected');
        app.addFilter('ul-metric-filters', false, 'handlerMetricFilterSelected');
    }

	// tasto OK nella dialogValue
	app.btnValueDone.onclick = () => {
		// recupero tutti i valori selezionati.
		const valueSelected = app.dialogValue.querySelectorAll('#ul-filter-values .selectable[data-selected]');
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
					const ul = document.getElementById('ul-filter-values');
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
		.catch( err => {
			App.showConsole(err, 'error');
			console.error(err);
		});
	}

	// selezione di uno o più valori dalla lista dei valori della colonna in dialogFilter
	app.handlerSelectValue = e => e.currentTarget.toggleAttribute('data-selected');

	app.getCubes();

	app.getDimensions();

	app.getHierarchies();

	app.getColumns();

	app.getColumnsFact();

	app.getFilters('ul-exist-filters', true, 'handlerFilterSelected'); // <ul> exist-filters

	app.getFilters('ul-metric-filters', true, 'handlerMetricFilterSelected'); // <ul> metric-filters

	app.getCompositeMetrics(); // metriche composite

	app.getTables(); //  elenco tabelle nella dialogFilter

	app.getTablesInDialogFilter();

	// app.getFactTable(); // lista delle FACT da visualizzare nello step-2

	app.getMetrics();

	app.getAvailableMetrics();

	app.getReports();

	// abilito il tasto btnFilterSave se il form per la creazione del filtro è corretto
	app.checkFilterForm = (check) => {
        // TODO: Implementazione
		const filterName = document.getElementById('filterName').value;
		//const filterFormula = document.getElementById('filterSQLFormula').value;
		//((filterName.length !== 0) && (filterFormula.length !== 0) || !check) ? app.btnFilterSave.disabled = false : app.btnFilterSave.disabled = true;
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

	app.btnNextStep.onclick = () => Step.next();

	// aggiungi filtri (step-2)
	app.btnAddFilters.onclick = () => {
		if (Query.dimensions.size === 0) {
			App.showConsole('Selezionare una dimensione per poter aggiungere colonne al report', 'warning');
		} else {
			app.dialogFilter.showModal();
			document.getElementById('filterName').value = '';
			document.getElementById('filterName').focus();
		}
	}

	// aggiungi metriche (step-2)
	app.btnAddMetrics.onclick = () => {
		// verifico se è stato selezionato almeno un cubo
		if (Query.cubes.size === 0) {
			App.showConsole('Selezionare un Cubo per poter aggiungere metriche al report', 'warning');
		} else {
			app.dialogMetric.showModal();
			document.getElementById('metric-name').value = '';
			document.getElementById('metric-name').focus();
		}
	}

	// aggiungi metrica composta
	app.btnAddCompositeMetrics.onclick = () => {
		// console.log(Query.elementCube);
		// TODO: questo controllo lo farò sul tasto next degli step
		if (Query.cubes.size === 0) {
			App.showConsole('Selezionare un Cubo per poter aggiungere metriche al report', 'warning');
		} else {
			// per ogni cubo selezionato ne recupero le metriche ad esso appartenenti
			const ul = document.getElementById('ul-metrics');
			Query.cubes.forEach( cubeToken => {
				StorageCube.selected = cubeToken;
				// ripulisco la lista, prima di popolarla
				document.querySelectorAll('#ul-metrics > section').forEach( item => item.remove());
				// recupero lista aggiornata delle metriche
				StorageMetric.cubeMetrics = cubeToken;
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
					section.dataset.searchable = 'true';
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
					smallCube.innerText = StorageCube.selected.name;
					ul.appendChild(section);
				}
				// 2022-06-01 TODO: in questo elenco dovranno esserci anche le metriche composte da poter selezionare
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
		  .catch( err => {
		  	App.showConsole(err, 'error');
		  	console.error(err);
		  });
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
		  .catch( err => {
		  	App.showConsole(err, 'error');
		  	console.error(err);
		  });
	}

	// input reportName
	document.getElementById('reportName').oninput = (e) => {
		// verifico se il nome inserito è presente nello storage
		// console.log(window.localStorage);
		const check = StorageProcess.checkNames(e.target.value);
		if (check) {
			// nome già presente nello storage
			// console.log(e.target.querySelector(':scope'));
			e.target.parentElement.querySelector('.helper').classList.add('warning');
			e.target.parentElement.querySelector('.helper').innerText = "Il nome inserito è già presente";
		} else {
			e.target.parentElement.querySelector('.helper').classList.remove('warning');
			e.target.parentElement.querySelector('.helper').innerText = "";
		}
	}

	app.btnSaveReport.onclick = () => {
        // edit report inserisco il titolo nella input
        (!Query.token) ?
            document.getElementById('reportName').value = '' :
            document.getElementById('reportName').value = StorageProcess.selected.name;
        app.dialogSaveReport.showModal();
    }

	app.setFrom = () => {
        debugger;
		// imposto la FROM per le gerarchie
		document.querySelectorAll("#ul-hierarchies section:not([hidden]) .selectable").forEach( hier => {
			// per ogni gerarchia VISIBILE, aggiungo le tabelle con data-include-query alla FROM
			// recuperare qui la FROM tra gli elementi contenenti data-include-query
			// ...in questo modo dovrei avere le tabelle anche ordinate secondo la logica della gerarchia
			hier.querySelectorAll("small[data-include-query]").forEach( tableRef => {
				Query.FROM = {tableAlias : tableRef.dataset.tableAlias, SQL : `${tableRef.dataset.schema}.${tableRef.dataset.label} AS ${tableRef.dataset.tableAlias}`};
				StorageDimension.selected = tableRef.dataset.dimensionToken;
				// per l'ultima tabella della gerarchia non esiste la join perchè è quella che si lega al cubo e il legame è fatto nella proprietà 'cubes' della dimensione
				if (StorageDimension.selected.hierarchies[tableRef.dataset.hierToken].joins[tableRef.dataset.tableAlias]) {
					// console.log(Object.keys(StorageDimension.selected.hierarchies[tableRef.dataset.hierToken].joins[tableRef.dataset.tableAlias]));
					// debugger;
					for (const [token, join] of Object.entries(StorageDimension.selected.hierarchies[tableRef.dataset.hierToken].joins[tableRef.dataset.tableAlias])) {
						Query.WHERE = {token, join};
					}
				}
			});
		});
	}

	app.setMetrics = () => {
        document.querySelectorAll("#ul-exist-metrics .selectable[data-selected][data-metric-type='0']").forEach( metricRef => {
            StorageMetric.selected = metricRef.dataset.metricToken;
            // se questa metrica è stata precedentemente aggiunta non devo invocare il metodo metrics() altrimenti viene eliminata
            if (!Query.metrics.has(metricRef.dataset.metricToken))
                Query.metrics = {
                    token : metricRef.dataset.metricToken,
                    name : StorageMetric.selected.name,
                    metric_type : StorageMetric.selected.metric_type,
                    SQLFunction : StorageMetric.selected.formula.SQLFunction,
                    field : StorageMetric.selected.formula.field,
                    distinct : StorageMetric.selected.formula.distinct,
                    alias : StorageMetric.selected.formula.alias,
                    table : StorageMetric.selected.formula.table,
                    tableAlias : StorageMetric.selected.formula.tableAlias
                };
        });
	}

    // metrica di base composta : 1 (es.: prezzo * quantita) impostate sul cubo
    app.setCompositeBaseMetrics = () => {
        // TODO: questo tipo di metrica potrei metterlo insieme a quelle di base (metric_type : 0) perchè le uniche differenze riguardano le prop 'table' e 'tableAlias'
		document.querySelectorAll("#ul-exist-metrics .selectable[data-selected][data-metric-type='1']").forEach( metricRef => {
			StorageMetric.selected = metricRef.dataset.metricToken;
            if (!Query.metrics.has(metricRef.dataset.metricToken))
    			Query.metrics = {
                    token : metricRef.dataset.metricToken,
                    name : StorageMetric.selected.name,
                    metric_type : StorageMetric.selected.metric_type,
                    SQLFunction : StorageMetric.selected.formula.SQLFunction,
                    field : StorageMetric.selected.formula.field, // contiene la formula (es.: prezzo * quantita)
                    distinct : StorageMetric.selected.formula.distinct,
                    alias : StorageMetric.selected.formula.alias
    			};
		});
	}

	app.setFilteredMetrics = () => {
		document.querySelectorAll("#ul-exist-metrics .selectable[data-selected][data-metric-type='2'], #ul-exist-metrics .selectable[data-selected][data-metric-type='3']").forEach( metricRef => {
			StorageMetric.selected = metricRef.dataset.metricToken;
            //debugger;
			let object = {
                token : metricRef.dataset.metricToken,
                name : StorageMetric.selected.name,
                metric_type : StorageMetric.selected.metric_type,
                SQLFunction : StorageMetric.selected.formula.SQLFunction,
                alias : StorageMetric.selected.formula.alias,
                distinct : StorageMetric.selected.formula.distinct,
                field : StorageMetric.selected.formula.field,
                table : StorageMetric.selected.formula.table,
                tableAlias : StorageMetric.selected.formula.tableAlias
			};
			let FROM = new Map(), WHERE = new Map(), filters = new Map();
			// debugger;
			// verifico se i filtri inclusi nella metrica, sono di un livello dimensionale oppure del cubo
			StorageMetric.selected.formula.filters.forEach( filterToken => {
                StorageFilter.selected = filterToken;
                filters.set(filterToken, {SQL : StorageFilter.selected.formula});
                debugger;
                if (Object.keys(StorageFilter.selected.hierarchies).length !== 0) {
                    // filtro appartenente a un livello dimensionale. Ciclare tutte le gerarchie presenti nel filtro multiplo creato
                    for (const [token, tableId] of Object.entries(StorageFilter.selected.hierarchies)) {
                    	const hier = document.querySelector("#ul-hierarchies .selectable[data-hier-token='"+token+"']");
                    	hier.querySelectorAll("small").forEach( tableRef => {
	                        FROM.set(tableRef.dataset.tableAlias, `${tableRef.dataset.schema}.${tableRef.dataset.label} AS ${tableRef.dataset.tableAlias}`);
	                        StorageDimension.selected = tableRef.dataset.dimensionToken;
	                        // TODO: utilizzando la dimensione presente sul ref nel DOM della gerarchia, forse posso eliminarlo dall'oggetto filter che salvo e lasciare solo le gerarchie
	                        // per ogni dimensione contenuta all'interno del filtro recupero le join con il cubo
	                        for (const [cubeToken, joins] of Object.entries(StorageDimension.selected.cubes)) {
	                            for (const [token, join] of Object.entries(joins)) {
	                                WHERE.set(token, join);
	                            }
	                        }
	                        // per l'ultima tabella della gerarchia non esiste la join perchè è quella che si lega al cubo e il legame è fatto nella proprietà 'cubes' della dimensione
	                        if (StorageDimension.selected.hierarchies[tableRef.dataset.hierToken].joins[tableRef.dataset.tableAlias]) {
	                            for (const [token, join] of Object.entries(StorageDimension.selected.hierarchies[tableRef.dataset.hierToken].joins[tableRef.dataset.tableAlias])) {
	                                WHERE.set(token, join);
	                            }
	                        }
	                    });
                    }
                } else {
                    // il filtro contenuto nella metrica è un filtro della FACT
                    // document.querySelector("#ul-cubes .selectable[data-cube-token='"++"'][data-selected]")
                    // TODO: da rivedere dopo la modifica dei filtri multipli
                    //StorageCube.selected = StorageFilter.selected.cubeToken;
                    //FROM.set(StorageCube.selected.alias, `${StorageCube.selected.schema}.${StorageCube.selected.FACT} AS ${StorageCube.selected.alias}`);
                }
                object.FROM = Object.fromEntries(FROM);
                if (WHERE.size !== 0) object.WHERE = Object.fromEntries(WHERE);
                object.filters = Object.fromEntries(filters);
			});				
			Query.filteredMetrics = object;
		});
	}

    // metriche composte selezionate
    app.setCompositeMetrics = () => {
        // Siccome le metriche composte contengono le metriche "base"/"filtrate" vanno aggiunte anche queste all'elaborazione di baseTable() (metriche base) oppure metricTable() (metriche filtrate)
        document.querySelectorAll("#ul-exist-composite-metrics .selectable[data-selected][data-metric-type='4']").forEach( metricRef => {
            StorageMetric.selected = metricRef.dataset.metricToken;
            // ottengo le metriche inserite nella composta
            for (const [name, metric] of Object.entries(StorageMetric.selected.formula.metrics_alias)) {
                // recupero le metriche che compongono la composta
                StorageMetric.selected = metric.token;
                // se c'è una metrica filtrata memorizzo in Query.filteredMetrics altrimenti in Query.metrics
                // BUG: nella metrica composta potrebbero esserci anche altre metriche composte
                if (StorageMetric.selected.metric_type === 2 || StorageMetric.selected.metric_type === 3)  {
                    // se, in Query.filteredMetrics e Query.metrics sono già presenti le metriche in ciclo (che compongono la composta) non devono essere aggiunte
                    //debugger;
                    if (!Query.filteredMetrics.has(metric.token))
                        Query.filteredMetrics = {
                            token : metric.token,
                            name,
                            metric_type : StorageMetric.selected.metric_type,
                            formula : StorageMetric.selected.formula,
                            field : StorageMetric.selected.formula.field,
                            distinct : StorageMetric.selected.formula.distinct,
                            alias : StorageMetric.selected.formula.alias,
                            table : StorageMetric.selected.table,
                            tableAlias : StorageMetric.selected.tableAlias
                        };
                } else {
                    if (!Query.metrics.has(metric.token))
                        Query.metrics = {
                            token : metric.token,
                            name,
                            metric_type : StorageMetric.selected.metric_type,
                            SQLFunction : StorageMetric.selected.formula.SQLFunction,
                            field : StorageMetric.selected.formula.field,
                            distinct : StorageMetric.selected.formula.distinct,
                            alias : StorageMetric.selected.formula.alias,
                            table : StorageMetric.selected.table,
                            tableAlias : StorageMetric.selected.tableAlias
                        };
                }
            }
            // reimposto la metrica composta selezionata
            StorageMetric.selected = metricRef.dataset.metricToken;
            // aggiungo alle metriche selezionate per il report
            Query.compositeMetric = { token : metricRef.dataset.metricToken, name : StorageMetric.selected.name, formula : StorageMetric.selected.formula };
        });
    }

	// save report
	app.btnSaveReportDone.onclick = () => {
		const name = document.getElementById('reportName').value;
		app.setFrom();
		
		// imposto la factJoin che è presente solo sulla dimensione
		document.querySelectorAll('#ul-dimensions .selectable[data-include-query]').forEach( dimension => {
			StorageDimension.selected = dimension.dataset.dimensionToken;
			// per ogni dimensione con includeQuery recupero le join con il cubo
			for (const [cubeToken, joins] of Object.entries(StorageDimension.selected.cubes)) {
				// debugger;
				for (const [token, join] of Object.entries(joins)) {
					Query.WHERE = {token, join};
				}
			}
		});
		// imposto la FROM per gli elementi del cubo/i selezionati
		document.querySelectorAll("#ul-cubes section:not([hidden]) .selectable[data-include-query]").forEach( cubeRef => {
			Query.FROM = {tableAlias : cubeRef.dataset.tableAlias, SQL : `${cubeRef.dataset.schema}.${cubeRef.dataset.tableName} AS ${cubeRef.dataset.tableAlias}`};
		});

		app.setMetrics();
        // metrica di base composta
        app.setCompositeBaseMetrics();
		// metriche filtrate
		app.setFilteredMetrics();
        // metriche composte
        app.setCompositeMetrics();

		// il datamart sarà creato come FX_processId
		// se è stato già definito un token significa che sto editando un report
		if (Query.token) {
			// edit del report
			Query.save(name);
			// Aggiorno nel database tabella : bi_processes
			app.editReport(Query.token, name);
			// app.updateReport();
			// TODO: aggiorno il nome del report nella lista #ul-processes
		} else {
            // nuovo report
            Query.token = rand().substr(0, 21);
            Query.processId = Date.now();
            Query.save(name);
            // app.saveReport();
            // recupero da Query la proprietà this.#reportProcess appena creata e la aggiungo a #ul-processes
            // aggiungo alla lista #ul-processes
            app.addReport(Query.token, Query.process);
		}
		app.dialogSaveReport.close();
	}

    // visualizzo in una dialog l'SQL della baseTable e delle metricTable
    app.btnSQLProcess.onclick = async () => {
        const name = document.getElementById('reportName').value;

        app.setFrom();

		// imposto la factJoin che è presente solo sulla dimensione
		document.querySelectorAll('#ul-dimensions .selectable[data-include-query]').forEach( dimension => {
			StorageDimension.selected = dimension.dataset.dimensionToken;
			// per ogni dimensione con includeQuery recupero le join con il cubo
			for (const [cubeToken, joins] of Object.entries(StorageDimension.selected.cubes)) {
				// debugger;
				for (const [token, join] of Object.entries(joins)) {
					Query.WHERE = {token, join};
				}
			}
		});
		// imposto la FROM per gli elementi del cubo/i selezionati
		document.querySelectorAll("#ul-cubes section:not([hidden]) .selectable[data-include-query]").forEach( cubeRef => {
			Query.FROM = {tableAlias : cubeRef.dataset.tableAlias, SQL : `${cubeRef.dataset.schema}.${cubeRef.dataset.tableName} AS ${cubeRef.dataset.tableAlias}`};
		});

        app.setMetrics();
        // metrica di base composta
        app.setCompositeBaseMetrics();
		// metriche filtrate
		app.setFilteredMetrics();
        // metriche composte
        app.setCompositeMetrics();
        if (!Query.processId) Query.processId = '_process_id_';

        Query.SQLProcess(name);
		const params = JSON.stringify(Query.getSQLProcess().report);
        const url = "/fetch_api/cube/sqlInfo";
		const init = {headers: {'Content-Type': 'application/json'}, method: 'POST', body: params};
		const req = new Request(url, init);
		await fetch(req)
			.then((response) => {
				// TODO: Rivedere la gestione del try...catch per poter creare un proprio oggetto Error visualizzando un errore personalizzato
				if (!response.ok) {throw Error(response.statusText);}
				return response;
			})
			.then((response) => response.text())
			.then((response) => {
				if (response) {
					// console.log(response);
					app.dialogSQLInfo.showModal();
					document.getElementById('SQL').innerHTML = response;
					App.showConsole('SQL generato!', 'done', 5000);
				} else {
					App.showConsole('Errori nella creazione del datamart', 'error', 5000);
				}
			})
			.catch( err => {
				App.showConsole(err, 'error');
				console.error(err);
			});
    }

    // apro la dialog-metric-filter
    app.btnSetMetricFilter.onclick = () => app.dialogMetricFilter.showModal();

	// visualizzo la lista dei report da processare
	app.btnProcessReport.onclick = () => {
		app.processList.toggleAttribute('hidden');
	}

	// app.btnSearchValue.addEventListener('click', () => app.dialogValue.showModal());
	// apertura dialog-value per ricerca dei valori all'interno del database relativo alla colonna selezionata
	app.btnSearchValue.onclick = (e) => {
		app.getDistinctValues();
		app.dialogValue.showModal();
	}

	document.getElementById('columnAlias').oninput = (e) => {
		const check = Query.checkColumnAlias(e.target.value);
		if (check) {
			// nome già presente nello storage
			e.target.parentElement.querySelector('.helper').classList.add('error');
			e.target.parentElement.querySelector('.helper').innerText = "Il nome della colonna è stato già aggiunto al report";
		} else {
			e.target.parentElement.querySelector('.helper').classList.remove('error');
			e.target.parentElement.querySelector('.helper').innerText = "";
		}
		console.log('check : ', check);
		(e.target.value.length === 0 || check) ? app.btnColumnDone.disabled = true : app.btnColumnDone.disabled = false;
	}

	app.checkDialogMetric = () => {
		const metricName = document.getElementById('metric-name').value;
		const aliasMetric = document.getElementById('alias-metric').value;
		(metricName.length !== 0 && aliasMetric.length !== 0) ? app.btnMetricSave.disabled = false : app.btnMetricSave.disabled = true;
	}

	app.checkDialogCompositeMetric = (check) => {
		const name = document.getElementById('composite-metric-name').value;
		const alias = document.getElementById('composite-alias-metric').value;
		app.btnCompositeMetricSave.disabled = (!((name.length !== 0) && (alias.length !== 0) || !check));
	}

	// hide hierarchy struct
	app.btnToggleHierarchyStruct.onclick = (e) => {
		// console.log(e.target);
		const hierarchyStruct = document.getElementById('hierarchies');
		hierarchyStruct.toggleAttribute('data-open');
		e.target.innerText = (hierarchyStruct.hasAttribute('data-open')) ? 'arrow_circle_left' : 'arrow_circle_right';
	}

	document.getElementById('alias-metric').oninput = (e) => {
		/* TODO: verifico se un nome e un alias sono già presenti nell'elenco delle metriche
		const check = Query.checkMetricAlias(e.target.value);
		if (check) {
			e.target.parentElement.querySelector('.helper').classList.add('warning');
			e.target.parentElement.querySelector('.helper').innerText = "Il nome inserito è già presente";
		} else {
			e.target.parentElement.querySelector('.helper').classList.remove('warning');
			e.target.parentElement.querySelector('.helper').innerText = "";
		}
		(e.target.value.length === 0 || check) ? app.btnMetricSave.disabled = true : app.btnMetricSave.disabled = false;*/
		app.checkDialogMetric();
	}

	document.getElementById('metric-name').oninput = () => {
		app.checkDialogMetric();
	}

	document.getElementById('composite-metric-name').oninput = (e) => {
		const check = StorageMetric.checkNames(e.target.value);
		if (check) {
			// nome già presente nello storage
			// console.log(e.target.querySelector(':scope'));
			e.target.parentElement.querySelector('.helper').classList.add('error');
			e.target.parentElement.querySelector('.helper').innerText = "Il nome inserito è già presente";
		} else {
			e.target.parentElement.querySelector('.helper').classList.remove('error');
			e.target.parentElement.querySelector('.helper').innerText = "";
		}
		app.checkDialogCompositeMetric(check);
	}
	
	document.getElementById('composite-alias-metric').oninput = () => app.checkDialogCompositeMetric();

	document.getElementById('filterName').oninput = (e) => {
		// verifico se il nome inserito è presente nello storage
		// console.log(window.localStorage);
		const check = StorageFilter.checkNames(e.target.value);
		if (check) {
			// nome già presente nello storage
			// console.log(e.target.querySelector(':scope'));
			e.target.parentElement.querySelector('.helper').classList.add('warning');
			e.target.parentElement.querySelector('.helper').innerText = "Il nome inserito è già presente";
		} else {
			e.target.parentElement.querySelector('.helper').classList.remove('warning');
			e.target.parentElement.querySelector('.helper').innerText = "";
		}
		app.checkFilterForm(check);
	}

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
			StorageDimension.selected = app.dialogColumns.querySelector('section').dataset.dimensionToken;
			const hierToken = app.dialogColumns.querySelector('section').dataset.hierToken;
			document.querySelector("#ul-columns .selectable[data-token-column='"+Query.columnToken+"'] span[column]").innerText += ` (${alias.value})`;
			// in SQLReport avrò un custom SQL utilizzabile solo nel report che si sta creando. La prop SQL, all'interno dei singoli field, determinano la customSQL impostata sulla Dimensione.
			Query.select = { token : Query.columnToken, dimensionToken : StorageDimension.selected.token, hier : hierToken, tableId : Query.tableId, table: Query.table, tableAlias : Query.tableAlias, field: Query.field, SQLReport: textarea, alias : alias.value };
			// NOTE: Oggetto Map
			const hierarchiesObject = new Map([[hierToken, Query.tableId]]);
			Query.objects = {
				token : Query.columnToken,
				hierarchies : Object.fromEntries(hierarchiesObject),
				dimensions : [StorageDimension.selected.token]
			};
		} else {
            document.querySelector("#ul-columns .selectable[data-token-column='"+Query.columnToken+"'] span[column]").innerText += ` (${alias.value})`;
            Query.select = { token : Query.columnToken, table: Query.table, tableAlias : Query.tableAlias, field: Query.field, SQLReport: textarea, alias : alias.value };
            Query.objects = {token : Query.columnToken, cubeToken : StorageCube.selected.token};
		}
		console.log('columnToken : ', Query.columnToken);
		// evidenzio come 'selezionata' la colonna che ha aperto la dialog dopo averla salvata qui. Vado a verificare sia le colonne della fact che quelle delle dimensioni
		document.querySelector("#ul-columns .selectable[data-token-column='" + Query.columnToken + "']").toggleAttribute('data-selected');
		// in SQLReport avrò un custom SQL utilizzabile solo nel report che si sta creando. La prop SQL, all'interno dei singoli field, determinano la customSQL impostata sulla Dimensione.
		app.dialogColumns.close();
		app.checkObjectSelected();
	}

	// save column : salvataggio di una colonna del report
	app.btnColumnDone.onclick = () => app.saveColumn();

	app.btnMapping.onclick = () => location.href = '/mapping';

	app.btnBackPage.onclick = () => window.location.href = '/';

	document.getElementById('columnAlias').onkeydown = (e) => {
		if (e.defaultPrevented) {
			console.log('è stato premuto 2 volte');
			return; // Do nothing if the event was already processed
		}
		// console.log(e);
		// console.log(e.key);
		if (e.key === 'Enter' && !app.btnColumnDone.disabled) app.saveColumn();
		// e.preventDefault();
	}

    app.showAbsoluteWindow = (e) => {
        const pos = () => {
            let x,y;
            const left = e.target.getBoundingClientRect().left;
            const right = e.target.getBoundingClientRect().right;
            const top = e.target.getBoundingClientRect().top;
            const bottom = e.target.getBoundingClientRect().bottom;
            let centerElementW = left + ((right - left) / 2);
            const elementWidth = app.absoluteWindow.offsetWidth / 2;

            y = bottom + 5;
            x = centerElementW - elementWidth;
            return {x,y};
        }

        app.absoluteWindow.style.setProperty('--left', pos().x + "px");
        // app.tooltip.style.setProperty('--left', xPosition + "px");
        app.absoluteWindow.style.setProperty('--top', pos().y + "px");
        // app.tooltip.style.setProperty('--top', yPosition + "px");
        /*app.popup.animate([
        {transform: 'scale(.2)'},
        {transform: 'scale(1.2)'},
        {transform: 'scale(1)'}
        ], { duration: 50, easing: 'ease-in-out', delay: 1000 });*/

        // console.log(e.target.getBoundingClientRect().bottom);
        // console.log(e.target.getBoundingClientRect().left);
        // console.log(' : ', rect);
	}

    app.showInfoObject = (e) => {
        console.log(e.target);
        const storage = new Storages();
        storage.selected = e.target.dataset.infoObjectToken;
        app.absoluteWindow.dataset.open = 'true';
        app.absoluteWindow.querySelector('*[data-object-name]').innerText = storage.selected.name;
        //debugger;
        switch (storage.selected.type) {
            case 'METRIC':
                app.absoluteWindow.querySelector('*[data-object-alias]').innerText = storage.selected.formula.alias;
                storage.selected.formula.filters.forEach(token => {
                    StorageFilter.selected = token;
                    app.absoluteWindow.querySelector('span[data-filter]').innerText = StorageFilter.selected.formula;
                });
                break;
            default:
                break;
        }
        app.showAbsoluteWindow(e);
    }

	const body = document.getElementById('body');
    // create a new instance of `MutationObserver` named `observer`,
	// passing it a callback function
	const observer = new MutationObserver(function() {
	    console.log('callback that runs when observer is triggered');
	    body.querySelectorAll('*[data-info-object-token]').forEach( element => element.addEventListener('click', app.showInfoObject));
	});
	// call `observe()` on that MutationObserver instance,
	// passing it the element to observe, and the options object
	observer.observe(body, {subtree: true, childList: true, attributes: true});

})();
