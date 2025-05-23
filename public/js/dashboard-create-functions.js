const checkbox__refresh_button = document.getElementById('input__refresh_button');
const input__script_file_name = document.getElementById('input__script_file_name');
let wrappers = [];
let app = {
	number: function(properties) {
		return new google.visualization.NumberFormat(properties);
		// TEST: per provare il colore sui numeri negativi (non funziona, da rivedere 20.09.2024)
		/* const prop = {
		  fractionDigits: 0,
		  negativeColor: 'red',
		  negativeParens: true,
		  groupingSymbol: '.',
		  // suffix: ' €'
		};
		return new google.visualization.NumberFormat(prop); */
	}
}

function getDataView() {
	// esempio utilizzato senza impostare le metriche contenute nelle composite
	console.log('onReady');
	// let tableRef = new google.visualization.Table(document.getElementById(Resource.ref));
	// console.log(groupColumnsIndex);
	// Funzione group(), raggruppo i dati in base alle key presenti in keyColumns
	Resource.groupFunction();
	// Al momento non utilizzo il Metodo groupFunction() nella classe Dashboard
	// perchè da qui richiamo il wrapper del ChartWrapper invece dal report non c'è il ChartWrapper
	// TODO: potrei crearlo anche l' il ChartWrapper
	Resource.dataGroup = new google.visualization.data.group(
		Resource.dataTable, Resource.groupKey, Resource.groupColumn
	);

	Resource.dataViewGrouped = new google.visualization.DataView(Resource.dataGroup);
	Resource.createDataView();
}

function drawDashboard() {
	Resource.multiData.forEach(datamart => {
		Resource.data = datamart.data;
		Resource.dashboardWrappers = datamart.specs.wrappers;
		Resource.specs = JSON.parse(window.localStorage.getItem(datamart.specs.token)).specs;
		debugger;
		Resource.dataTable = new google.visualization.DataTable(Resource.prepareData());
		Resource.ref = document.getElementById(datamart.ref);
		let gdashboard = new google.visualization.Dashboard(document.getElementById('template-layout'));
		const controls = Resource.drawDraggableControls(document.getElementById('filter__dashboard'));
		wrappers = [];
		for (const [ref, wrapper] of Object.entries(Resource.dashboardWrappers)) {
			Resource.ref = document.getElementById(ref);
			const chartWrapper = new google.visualization.ChartWrapper();
			// imposto sempre Table di default
			chartWrapper.setChartType(wrapper.chartType);
			chartWrapper.setContainerId(Resource.ref.id);
			chartWrapper.setOptions(wrapper.options);
			if (wrapper.chartType === 'Table') {
				chartWrapper.setOption('height', 'auto');
				chartWrapper.setOption('pageSize', 15);
			}
			wrappers.push(chartWrapper);
		}
		// NOTE: esempio array di View
		// table.setView([{ columns: [1, 3, 5, 7, 16] }, { columns: [0, 1, 2, 3] }]);
		// table.setView({ columns: [1, 3, 5, 7, 9, 16] });
		if (controls.length !== 0) {
			gdashboard.bind(controls, wrappers);
			google.visualization.events.addListener(gdashboard, 'ready', dashboardReady);
			gdashboard.draw(Resource.dataTable);
		} else {
			wrappers.forEach(wrapper => {
				wrapper.setDataTable(Resource.dataTable);
				google.visualization.events.addListener(wrapper, 'ready', dashboardReady);
				wrapper.draw();
			});
		}
	})
}

function dashboardReady() {
	for (const wrapper of Object.values(Resource.dashboardWrappers)) {
		// le specifiche del group le recupero dal localStorage
		Resource.group = Resource.specs.wrapper[wrapper.chartType].group;
		// Resource.group = wrapper.group;
		// WARN: 18.12.2024 al momento recupero il primo wrapper della dashboard, in questo modo
		// quando si utilizzano i filtri, passo a createDataTableGrouped() una DataTable già filtrata.
		// Valutare se utilizzare l'index del wrapper in ciclo perchè se, in una dashboard si decide che il primo
		// grafico NON è influenzato dai filtri, qui non funzionerà con wrappers[0]
		Resource.chartWrapper = wrappers[0];
		Resource.dataGroup = Resource.createDataTableGrouped();
		// const dataGroup = Resource.createDataTableGrouped(wrappers[0].getDataTable());
		Resource.createDataViewGrouped();
		// console.log(dataGroup);
		// ridisegno utilizzando il chartWrapper
		const chartWrapper = new google.visualization.ChartWrapper({
			chartType: wrapper.chartType,
			containerId: wrapper.containerId,
			options: wrapper.options,
			dataTable: Resource.dataViewFinal
		});
		chartWrapper.draw();
	}
}

// invocata da sheetSelected, apertura di un singolo report in fase di creazione dashboard
function draw() {
	console.log('TIMER START', new Date());
	debugger;
	const start_time_execution = new Date();
	// Utilizzo la DataTable per poter impostare la formattazione. La formattazione NON
	// è consentità con la DataView perchè questa è read-only
	Resource.dataTable = new google.visualization.DataTable(Resource.prepareData());
	// definisco la formattazione per le percentuali e per i valori currency
	// console.log(dataFormatted);
	let gdashboard = new google.visualization.Dashboard(document.getElementById('template-layout'));
	// disegno i filtri dal template, con l'icona draggable
	const controls = Resource.drawDraggableControls(document.getElementById('filter__dashboard'));
	// console.log(JSON.parse(Resource.view.toJSON()));
	// utilizzo senza i metodi setter. Le proprietà del ChartWrapper sono incluse in Resource.specs
	// var wrap = new google.visualization.ChartWrapper(Resource.specs.wrapper);
	// utilizzo con i metodi setter
	// creo il ChartWrapper Table, anche se questo Sheet ha più ChartWrapper creati, imposterò un tasto per fare lo swicth e cambiare la visualizzazione
	Resource.chartWrapper = new google.visualization.ChartWrapper();
	// imposto sempre Table di default
	Resource.chartWrapper.setChartType('Table');
	Resource.chartWrapper.setContainerId(Resource.ref.id);
	Resource.chartWrapper.setDataTable(Resource.dataTable);
	// console.log(Resource.specs.wrapper.Table.options);
	Resource.chartWrapper.setOption('height', 'auto');
	Resource.chartWrapper.setOption('allowHTML', true);
	Resource.chartWrapper.setOption('page', 'enabled');
	Resource.chartWrapper.setOption('pageSize', 15);
	Resource.chartWrapper.setOption('width', '100%');
	Resource.chartWrapper.setOption('cssClassNames', {
		"headerRow": "g-table-header",
		"tableRow": "g-table-row",
		"oddTableRow": null,
		"selectedTableRow": null,
		"hoverTableRow": null,
		"headerCell": "g-header-cell",
		"tableCell": "g-table-cell",
		"rowNumberCell": null
	});

	// NOTE: esempio array di View
	// table.setView([{ columns: [1, 3, 5, 7, 16] }, { columns: [0, 1, 2, 3] }]);
	// table.setView({ columns: [1, 3, 5, 7, 9, 16] });

	if (controls.length !== 0) {
		gdashboard.bind(controls, Resource.chartWrapper);
		google.visualization.events.addListener(gdashboard, 'ready', onReady);
		gdashboard.draw(Resource.dataTable);
	} else {
		google.visualization.events.addListener(Resource.chartWrapper, 'ready', onReady);
		Resource.chartWrapper.draw();
	}
	console.log('TIMER END', new Date());
	console.info(`ExecutionTime : ${new Date() - start_time_execution}ms`);
}

function onReady() {
	console.log('onReady');
	console.log('TIMER START (ready)', new Date());
	const start_time_execution = new Date();
	// esempio utilizzato senza impostare le metriche contenute nelle composite
	// let tableRef = new google.visualization.Table(document.getElementById(Resource.ref));
	// console.log(groupColumnsIndex);
	// Funzione group(), raggruppo i dati in base alle key presenti in keyColumns
	Resource.group = Resource.specs.wrapper[Resource.wrapper].group;
	Resource.dataGroup = Resource.createDataTableGrouped();
	Resource.createDataViewGrouped();
	Resource.chartWrapperView = new google.visualization.ChartWrapper();
	Resource.chartWrapperView.setChartType(Resource.specs.wrapper[Resource.wrapper].chartType);
	Resource.chartWrapperView.setContainerId(Resource.ref.id);
	if (Resource.wrapper === 'Table') {
		Resource.chartWrapperView.setOption('height', 'auto');
		Resource.chartWrapperView.setOption('allowHTML', true);
		Resource.chartWrapperView.setOption('page', 'enabled');
		Resource.chartWrapperView.setOption('pageSize', 15);
		Resource.chartWrapperView.setOption('width', '100%');
		Resource.chartWrapperView.setOption('cssClassNames', {
			"headerRow": "g-table-header",
			"tableRow": "g-table-row",
			"oddTableRow": null,
			"selectedTableRow": null,
			"hoverTableRow": null,
			"headerCell": "g-header-cell",
			"tableCell": "g-table-cell",
			"rowNumberCell": null
		});
	} else {
		Resource.chartWrapperView.setOptions(Resource.specs.wrapper[Resource.wrapper].options);
	}
	// formatter
	debugger;
	Resource.specs.wrapper[Resource.wrapper].group.columns.forEach(metric => {
		let formatter = app[metric.properties.formatter.type](metric.properties.formatter.prop);
		formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(metric.token));
	});

	Resource.chartWrapperView.setDataTable(Resource.dataViewFinal);
	Resource.chartWrapperView.draw();
	console.log('TIMER END', new Date());
	console.info(`ExecutionTime (ChartWrapperReady) : ${new Date() - start_time_execution}ms`);
}

function openGenerateUrl(e) {
	// dashboard token
	btn__url_generate.dataset.token = e.target.dataset.token;
	// recupero la proprietà 'resources[token].data.columns[nome_colonna]' di tutti gli sheets presenti nella dashboard
	const url_params = document.getElementById('url_params');
	if (url_params.childElementCount === 0) {
		for (const value of Resource.resources.values()) {
			console.log(value.data.columns);
			for (const column of Object.values(value.data.columns)) {
				// escludo le metriche
				if (column.p.data === 'column') {
					const template = tmpl__url_params.content.cloneNode(true);
					const section = template.querySelector('section');
					const checkbox = section.querySelector("input[type='checkbox']");
					const label = section.querySelector('label');
					checkbox.id = column.id;
					label.innerText = column.id;
					label.setAttribute('for', column.id);
					url_params.appendChild(section);
				}
			}
		}
	}
	dlg__create_url.showModal();
}

function urlGenerate(e) {
	// TODO: recupero i parametri inseriti dall'utente
	let params = [];
	document.querySelectorAll("#url_params>section>input:checked").forEach(param => {
		// console.log(param);
		const param_label = param.parentElement.querySelector('label').innerText;
		// const param_name = param.parentElement.querySelector("input[type='text']").value;
		// (param_name.length === 0) ? params.push(param_label) : params.push(param_name);
		params.push(param_label)
	});
	console.log(params);
	fetch(`/dashboards/test/${e.target.dataset.token}?${params.join('&')}`)
		.then((response) => {
			// console.log(response);
			if (!response.ok) { throw Error(response.statusText); }
			return response;
		})
		.then((response) => response.text())
		.then(data => {
			console.log(data);
			url.innerHTML = data;
		})
		.catch(err => {
			App.showConsole(err, 'error');
			console.error(err);
		});
}

function workbookSelected(e) {
	console.log(e.currentTarget.dataset.token);
	// recupero l'elenco degli sheets del workbook selezionato
	const sheets = Storages.getSheetsByWorkbookId(e.currentTarget.dataset.token);
	console.log(sheets);
	ul__sheets.querySelectorAll('li').forEach(item => item.remove());
	Storages.getSheetsByWorkbookId(e.currentTarget.dataset.token).forEach(sheet => {
		const content = template__li.content.cloneNode(true);
		const li = content.querySelector('li[data-li]');
		const span = li.querySelector('span');
		li.dataset.token = sheet.token;
		li.dataset.datamartId = sheet.datamartId;
		li.dataset.userId = sheet.userId;
		li.dataset.label = sheet.name;
		li.dataset.workbookId = sheet.workbook_ref;
		li.addEventListener('click', sheetSelected);
		li.dataset.elementSearch = 'sheets';
		span.innerText = sheet.name;
		ul__sheets.appendChild(li);
	});


	// recupero gli Sheet appartenenti al workbook
	/* fetch(`/fetch_api/workbook_token/${e.currentTarget.dataset.token}/sheet_indexByWorkbook`)
	   .then((response) => {
		   if (!response.ok) { throw Error(response.statusText); }
		   return response;
	   })
	   .then((response) => response.json())
	   .then(data => {
		   // console.log(data);
		   const ul = document.getElementById('ul-sheets');
		   ul.querySelectorAll('li').forEach(el => el.remove());
		   data.forEach(sheet => {
			   const content = template__li.content.cloneNode(true);
			   const li = content.querySelector('li[data-li]');
			   const span = li.querySelector('span');
			   li.dataset.token = sheet.token;
			   li.dataset.datamartId = sheet.datamartId;
			   li.dataset.userId = sheet.userId;
			   li.dataset.label = sheet.name;
			   li.dataset.workbookId = sheet.workbookId;
			   li.addEventListener('click', app.sheetSelected);
			   li.dataset.elementSearch = 'sheets';
			   span.innerText = sheet.name;
			   ul.appendChild(li);
		   });
	   })
	   .catch(err => {
		   App.showConsole(err, 'error');
		   console.error(err);
	   }); */
}

// Selezione del report che alimenta il chart_div
function sheetSelected(e) {
	// recupero le specifiche per questo report (resource)
	// successivamente recupero i dati del datamart
	Resource.token = e.currentTarget.dataset.token;
	// aggiungo un token per identificare, in publish(), il report (datamart_id)
	Resource.ref.dataset.token = e.currentTarget.dataset.token;
	Resource.ref.dataset.datamartId = e.currentTarget.dataset.datamartId;
	Resource.ref.dataset.userId = e.currentTarget.dataset.userId;
	// NOTE: 10.12.2024 imposto di default 'Table' ma potrei impostare il default
	// direttamente nelle specs.wrapper dello sheet, ad esempio se salvo lo sheet come barChart
	// potrei impostare una proprietà 'default : true' nel wrapper barChart
	Resource.ref.dataset.wrapper = 'Table';
	// WARN: 11-04-2025 le specifiche le devo recuperare dal DB e non dal localStorage perchè la versione su DB potrebbe essere
	// diversa tra quella su DB (fatta da un altro utente) e quella in locale
	/* await fetch(`/fetch_api/sheet_get_specs/${Resource.token}/get_sheet_specs`)
		.then((response) => {
			if (!response.ok) { throw Error(response.statusText); }
			return response;
		})
		.then((response) => response.json())
		.then(data => {
			Resource.specs = JSON.parse(data.json_specs);
			// imposto, sul tasto btn__chartWrapper il token di questo Sheet
			const btn__chartWrapper = Resource.ref.parentElement.querySelector(".resourceActions>button[data-popover-id='popover__chartWrappers']");
			btn__chartWrapper.dataset.id = Resource.ref.id;
			btn__chartWrapper.dataset.token = Resource.token;
			if (Object.keys(Resource.specs.wrapper).length >= 2) btn__chartWrapper.removeAttribute('disabled');
			// eseguo una singola promise perchè qui viene caricata una risorsa, quindi un solo report che viene aggiunto alla Dashboard
			debugger;
			app.getData(`/fetch_api/${Resource.ref.dataset.datamartId}_${Resource.ref.dataset.userId}/preview?page=1`);
			dlg__chartSection.close();
			// aggiungo la class 'defined' nel div che contiene il grafico/tabella
			Resource.ref.classList.add('defined');
		})
		.catch(err => {
			App.showConsole(err, 'error');
			console.error(err);
		}); */

	// Resource.specs = JSON.parse(window.localStorage.getItem(e.currentTarget.dataset.token)).specs;
	Resource.specs = SheetStorages.getSheetSpecifications(e.currentTarget.dataset.token);
	// imposto, sul tasto btn__chartWrapper il token di questo Sheet
	const btn__chartWrapper = Resource.ref.parentElement.querySelector(".resourceActions>button[data-popover-id='popover__chartWrappers']");
	btn__chartWrapper.dataset.id = Resource.ref.id;
	btn__chartWrapper.dataset.token = e.currentTarget.dataset.token;
	if (Object.keys(Resource.specs.wrapper).length >= 2) btn__chartWrapper.removeAttribute('disabled');
	// eseguo una singola promise perchè qui viene caricata una risorsa, quindi un solo report che viene aggiunto alla Dashboard
	getData(`/fetch_api/${e.currentTarget.dataset.datamartId}_${e.currentTarget.dataset.userId}/preview?page=1`);
	dlg__chartSection.close();
	// aggiungo la class 'defined' nel div che contiene il grafico/tabella
	Resource.ref.classList.add('defined');
}

// recupero il datamrt
async function getData(url) {
	let partialData = [];
	await fetch(url)
		.then((response) => {
			console.log(response);
			if (!response.ok) { throw Error(response.statusText); }
			return response;
		})
		.then((response) => response.json())
		.then(async (paginateData) => {
			// console.log(paginateData);
			// console.log(paginateData.data);
			// funzione ricorsiva fino a quando è presente next_page_url
			let recursivePaginate = async (url) => {
				// console.log(url);
				await fetch(url).then((response) => {
					// console.log(response);
					if (!response.ok) { throw Error(response.statusText); }
					return response;
				}).then(response => response.json()).then((paginate) => {
					// console.log(paginate);
					// console.log(progressBar.value);
					partialData = partialData.concat(paginate.data);
					if (paginate.next_page_url && paginate.current_page !== 2) {
						recursivePaginate(paginate.next_page_url);
					} else {
						// Non sono presenti altre pagine, visualizzo il dashboard
						// console.log('tutte le paginate completate :', partialData);
						Resource.data = partialData;
						google.charts.setOnLoadCallback(draw());
					}
				}).catch((err) => {
					App.showConsole(err, 'error');
					console.error(err);
				});
			}
			partialData = paginateData.data;
			if (paginateData.next_page_url) {
				recursivePaginate(paginateData.next_page_url);
			} else {
				// Non sono presenti altre pagine, visualizzo la dashboard
				Resource.data = partialData;
				google.charts.setOnLoadCallback(draw());
			}
		})
		.catch(err => {
			App.showConsole(err, 'error');
			console.error(err);
		});
}

// checkbox per aggiungere il tasto "aggiorna" sulla dashboard.
// Da questa checkbox:true viene visualizzata la input per poter inserire il nome dello script file
function handleOptionRefresh(e) {
	// console.log(e.target.checked);
	input__script_file_name.hidden = !e.target.checked
	input__script_file_name.focus();
}
