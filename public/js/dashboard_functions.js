var Template = new Templates();
let wrappers = [];

// selezione di un filtro della Dashboard
function filterSelected(e) {
	// console.log(this);
	// console.log(e.getControl());
	// console.log(this.getControl());
	// console.log(this.getOption('filterColumnLabel'));
	// console.log(e.getState());
	const controlColumn = this.getOption('filterColumnLabel');
	// il controllo selezionato deve essere clonato se viene trovato un altro controllo con lo stesso nome
	const currentControl = this;
	// valore selezionato nel Control
	const value = e.getState().selectedValues;
	// cerco tutti i Control che hanno la stessa colonna (es. : 'sede')
	Resource.dashboardControls.forEach(control => {
		if (control.getOption('filterColumnLabel') === controlColumn) {
			control.setState({ selectedValues: [value] });
			currentControl.clone();
			control.draw();
		}
	});
}

function dashboardDraw() {
	Resource.multiData.forEach(datamart => {
		Resource.data = datamart.data;
		Resource.specs = datamart.specs;
		// console.log(Resource.specs);
		Resource.dataTable = new google.visualization.DataTable(Resource.prepareData());
		Resource.ref = document.getElementById(datamart.ref);
		let gdashboard = new google.visualization.Dashboard(document.getElementById('template-layout'));
		const controls = Resource.drawControls(document.getElementById('filter__dashboard'));
		wrappers = [];
		for (const [ref, wrapper] of Object.entries(Resource.specs.wrappers)) {
			Resource.ref = document.getElementById(ref);
			const chartWrapper = new google.visualization.ChartWrapper();
			// Resource.chartWrapper = new google.visualization.ChartWrapper();
			// imposto sempre Table di default
			chartWrapper.setChartType(wrapper.chartType);
			chartWrapper.setContainerId(Resource.ref.id);
			chartWrapper.setOptions(wrapper.options);
			if (wrapper.chartType === 'Table') {
				chartWrapper.setOption('height', 'auto');
				chartWrapper.setOption('pageSize', 15);
			}
			/* // effettuo il raggruppamento deciso in fase di creazione report e creo la DataViewGroup
			Resource.group = wrapper.group;
			const dataGroup = Resource.createDataTableGrouped();
			Resource.createDataViewGrouped(dataGroup);
			// ... a questo punto gli indici di colonna della Resource.dataViewGrouped non
			// corrispondono più alla DataTable che viene disegnata dalla Dashboard (sotto, Resource.dataTable)
			// per cui creo un ulteriore DataView che, con il setColumns(), imposta le colonne corrette riferendosi alla Resource.dataTable
			// utilizzando i nomi di colonna anzichè gli indici (che sono diversi tra DataTable/DataGroup)
			const dataView = new google.visualization.DataView(Resource.dataTable);
			dataView.setColumns(Resource.viewDefined);
			chartWrapper.setView(dataView); */

			// console.log(chartWrapper.getView());
			// google.visualization.events.addListener(chartWrapper, 'ready', ready);
			wrappers.push(chartWrapper);
		}
		// TEST: 17.12.2024 logica utilizzata per condizionare un filtro in base a quello precedente (funzionante sui dashboard con un solo datatable)
		/* let binds;
		// Questa logica funziona con il bind() di un filtro verso quello successivo ma
		// possono esserci anche situazioni diverse, che sono da implementare
		Resource.specs.bind.forEach((v, index) => {
		  // console.log('index', index);
		  if (index === 0) {
			// il primo bind deve essere creato dall'istanza gdashboard, i successivi posso legarli ad una variabile
			binds = gdashboard.bind(controls[v[0]], controls[v[1]]);
		  } else {
			binds.bind(controls[v[0]], controls[v[1]]);
		  }
		});
		// Tutti i controlli influenzano i chartWrappers
		binds.bind(controls, wrappers); */

		if (controls.length !== 0) {
			gdashboard.bind(controls, wrappers);
			// NOTE: esempio array di View
			// table.setView([{ columns: [1, 3, 5, 7, 16] }, { columns: [0, 1, 2, 3] }]);
			// table.setView({ columns: [1, 3, 5, 7, 9, 16] });

			google.visualization.events.addListener(gdashboard, 'ready', ready);

			gdashboard.draw(Resource.dataTable);
		} else {
			wrappers.forEach(wrapper => {
				wrapper.setDataTable(Resource.dataTable);
				google.visualization.events.addListener(wrapper, 'ready', ready);
				wrapper.draw();
			});
		}
	})
}

function ready() {
	for (const wrapper of Object.values(Resource.specs.wrappers)) {
		Resource.group = wrapper.group;
		// WARN: 18.12.2024 al momento recupero il primo wrapper della dashboard, in questo modo
		// quando si utilizzano i filtri, passo a createDataTableGrouped() una DataTable già filtrata.
		// Valutare se utilizzare l'index del wrapper in ciclo perchè se, in una dashboard si decide che il primo
		// grafico NON è influenzato dai filtri, qui non funzionerà con wrappers[0]
		Resource.chartWrapper = wrappers[0];
		// const dataGroup = Resource.createDataTableGrouped(wrappers[0].getDataTable());
		Resource.dataGroup = Resource.createDataTableGrouped();
		Resource.createDataViewGrouped();
		// console.log(dataGroup);
		// ridisegno utilizzando il chartWrapper
		let redraw = new google.visualization.ChartWrapper({
			chartType: wrapper.chartType,
			containerId: wrapper.containerId,
			options: wrapper.options,
			dataTable: Resource.dataViewFinal
			// dataTable: dataGroup
		});
		document.querySelector('#title__main').innerText = Resource.json.title;
		redraw.draw();
	}
}

// Recupero il Layout impostato per la dashboard selezionata
async function getLayout() {
	console.log('getLayout');
	await fetch(`/js/json-templates/${Resource.json.layout}.json`)
		.then((response) => {
			// console.log(response);
			if (!response.ok) { throw Error(response.statusText); }
			return response;
		})
		.then((response) => response.json())
		.then(data => {
			if (!data) return;
			console.log(data);
			Template.data = data;
			Template.id = data.id;
			// creo il template nel DOM
			Template.create();
			// carico le risorse (sheet) necessarie alla dashboard
			getResources();
		})
		.catch(err => {
			App.showConsole(err, 'error');
			console.error(err);
		});
}

async function getResources() {
	let urls = [];
	Resource.arrResources = [];
	Resource.wrapperSpecs = [];
	Resource.refs = [];
	// recupero la querystring (quando provenego da un link esterno)
	const querystring = Template.parent.dataset.querystring;
	// ciclo le resources
	for (const [token, resource] of Object.entries(Resource.json.resources)) {
		Resource.resources = resource;
		// Resource.token = token;
		Resource.arrResources.push(token);
		Resource.wrapperSpecs.push(resource);
		// il ref corrente, appena aggiunto
		// Resource.dataColumns.push(specsColumns);
		Object.keys(resource.wrappers).forEach(ref => {
			// ref : id nel DOM (chart__1)
			Resource.ref = document.getElementById(ref);
			Resource.refs.push(ref);
			// aggiungo un token per identificare, in publish(), il report (datamart_id)
			Resource.ref.dataset.token = token;
			Resource.ref.dataset.datamartId = resource.datamartId;
			Resource.ref.dataset.userId = resource.userId;
			// aggiungo la class 'defined' nel div che contiene il grafico/tabella
			Resource.ref.classList.add('defined');
		});
		// urls.push(`/fetch_api/${resource.datamartId}/datamart?page=1`)
		(querystring === undefined) ?
			// urls.push(`/fetch_api/${resource.datamartId}/datamart?page=1`) :
			urls.push(`/fetch_api/${resource.datamartId}/datamart`) :
			urls.push(`/fetch_api/${resource.datamartId}/datamart?${querystring}`)
	}
	await getAllData(urls);
}

async function getAllData(urls) {
	console.log('getAllData');
	// const progressBar = document.getElementById('progressBar');
	// const progressTo = document.getElementById('progressTo');
	// const progressTotal = document.getElementById('progressTotal');
	// const progressLabel = document.querySelector("label[for='progressBar']");
	App.showLoader();
	App.showConsole('Apertura Dashboard in corso...', null, null);
	popover__progressBar.showPopover();
	// L'array multidata ha gli stessi indici della promise.all
	Resource.multiData = [];
	let partialData = [];
	// console.log(urls);
	await Promise.all(urls.map(url => fetch(url)))
		.then(responses => {
			return Promise.all(responses.map(response => {
				if (!response.ok) { throw Error(response.statusText); }
				return response.json();
			}))
		})
		.then(async (paginateData) => {
			console.log('paginateData : ', paginateData);
			paginateData.forEach((pagData, index) => {
				console.log(pagData.data);
				progressBar.value = +((pagData.to / pagData.total) * 100);
				progressLabel.hidden = false;
				progressTo.innerText = pagData.to;
				progressTotal.innerText = pagData.total;
				let recursivePaginate = async (url, index) => {
					await fetch(url).then((response) => {
						if (!response.ok) { throw Error(response.statusText); }
						return response;
					}).then(response => response.json())
						.then((paginate) => {
							progressBar.value = +((paginate.to / paginate.total) * 100);
							progressTo.innerText = paginate.to;
							progressTotal.innerText = paginate.total;
							partialData[index] = partialData[index].concat(paginate.data);
							if (paginate.next_page_url) {
								recursivePaginate(paginate.next_page_url, index);
								console.log(partialData[index]);
							} else {
								// Non sono presenti altre pagine, visualizzo la dashboard
								console.log('tutte le paginate completate :', partialData[index]);
								Resource.multiData[index] = {
									data: partialData[index],
									token: Resource.arrResources[index],
									ref: Resource.refs[index],
									specs: Resource.wrapperSpecs[index]
								};
								google.charts.setOnLoadCallback(dashboardDraw());
								App.closeConsole();
								App.closeLoader();
								progressLabel.hidden = true;
								progressBar.value = 0;
								popover__progressBar.hidePopover();
							}
						}).catch((err) => {
							App.showConsole(err, 'error');
							console.error(err);
						});
				}
				partialData[index] = pagData.data;
				if (pagData.next_page_url) {
					recursivePaginate(pagData.next_page_url, index);
				} else {
					// Non sono presenti altre pagine, visualizzo il dashboard
					// Resource.data = partialData[index];
					Resource.multiData[index] = {
						data: partialData[index],
						token: Resource.arrResources[index],
						ref: Resource.refs[index],
						specs: Resource.wrapperSpecs[index]
					};
					google.charts.setOnLoadCallback(dashboardDraw());
					App.closeConsole();
					App.closeLoader();
					progressLabel.hidden = true;
					progressBar.value = 0;
					popover__progressBar.hidePopover();
				}
			});
		})
		.catch(err => {
			App.showConsole(err, 'error');
			console.error(err);
		});
}

function export_datatable_XLS() {
	// e.preventDefault();
	// console.log(JSON.parse(Resource.dataTable.toJSON()));
	// creo 'dt' da passare a zipcelx
	let dt = [];
	// creo la prima riga di intestazione
	let cols = [];
	JSON.parse(Resource.dataTable.toJSON()).cols.forEach(col => {
		cols.push({ value: col.label.toUpperCase(), type: 'string' });
	});
	dt.push(cols);
	// creazione delle righe
	for (const values of Object.values(JSON.parse(Resource.dataTable.toJSON()).rows)) {
		let row = [];
		values.c.forEach((v, index) => {
			row.push({ value: v.v, type: Resource.dataTable.getColumnType(index) })
		});
		dt.push(row)
	}
	const config = {
		// filename: 'datatable',
		// TODO: aggiungere data estrazione
		filename: 'export_',
		sheet: {
			data: dt
		}
	};

	/* const config = {
	  filename: 'datatable',
	  sheet: {
		data: [
		  [{
			value: 'test 1 colonna',
			type: 'string'
		  }, {
			value: 1400,
			type: 'number'
		  }]
		]
	  }
	}; */

	zipcelx(config);
	App.showConsole('Esportazione completata', 'done', 1500);
}
