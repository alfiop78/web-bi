// apertura nuovo Sheet, viene recuperato dal localStorage
async function sheetSelected(e) {
	// const sheetToken = e.currentTarget.dataset.token;
	document.querySelectorAll('#dropzone-columns > *, #dropzone-rows > *, #ul-filters-sheet > *, #ul-columns-handler > *, #preview-datamart > *').forEach(element => element.remove());
	document.querySelector('#btn-sheet-save').disabled = true;
	Sheet = new Sheets(e.currentTarget.dataset.name, e.currentTarget.dataset.token, WorkBook.workBook.token);
	// reimposto tutte le proprietà della Classe
	Sheet.open();
	input__sheetName.innerText = Sheet.name;
	input__sheetName.dataset.value = Sheet.name;
	input__sheetName.dataset.tempValue = Sheet.name;
	// Re-inserisco, nello Sheet, tutti gli elementi (fileds, filters, metrics, ecc...)
	// della classe Sheet (come quando si aggiungono in fase di creazione Sheet)
	for (const token of Sheet.fields.keys()) {
		// const target = document.getElementById('dropzone-rows');
		rowsDropzone.appendChild(createColumnDefined(token));
	}

	for (const [token, metrics] of Sheet.metrics) {
		if (!metrics.dependencies) columnsDropzone.appendChild(createMetricDefined(token));
	}

	// filters
	Sheet.filters.forEach(token => addFilterToSheet(token));

	dlg__sheet.close();
	// in fase di apertura della preview, le specifiche sono sicuramente già presenti.
	Resource = new Resources('preview-datamart');
	// verifico se il datamart, per lo Sheet selezionato, è già presente sul DB.
	// In caso positivo lo apro in preview-datamart.
	Sheet.datamart = await Sheet.exist();
	App.closeConsole();
	(Sheet.datamart) ? preview() : App.showConsole("Nessun Datamart presente!", 'warning', 2000);
	// Imposto la prop 'edit' = true perchè andrò ad operare su uno Sheet aperto
	Sheet.edit = true;
	document.querySelector('#btn-sheet-save').disabled = false;
	document.querySelectorAll('#btn-sql-preview, #btn-sheet-preview').forEach(button => button.disabled = false);
	Sheet.getInformations();
}

/*
 * agiunta di un filtro allo Sheet
 * */
function addFilterToSheet(token) {
	// aggiungo, sulla <li> del filtro selezionato, la class 'added' per evidenziare che il filtro
	// è stato aggiunto al report, non può essere aggiunto di nuovo.
	const li__selected = document.querySelector(`li[data-id='${token}']`);
	li__selected.classList.add('added');
	addTemplateFilter(token);
}

// switch tra i vari tipi di grafici (ChartWrapper) creati
function selectWrapper(e) {
	Resource.wrapper = e.target.getAttribute('value');
	chartWrapperReady();
	// Rivedo le colonne/metriche nascoste in questa visualizzazione e aggiorno la
	// ul #ul-columns-handler
	// Ciclo le proprietà group.key e group.columns per reimpostare la proprietà visible corrispondente
	Resource.specs.wrapper[Resource.wrapper].group.key.forEach(column => {
		const element = document.querySelector(`#ul-columns-handler>li[data-column-id='${column.id}']`);
		element.dataset.visible = column.properties.visible;
	});

	Resource.specs.wrapper[Resource.wrapper].group.columns.forEach(column => {
		const element = document.querySelector(`#ul-columns-handler>li[data-column-id='${column.alias}']`);
		element.dataset.visible = column.properties.visible;
	});
	popover__chartWrappers.hidePopover();
}

async function preview() {
	// NOTE: Chiamata in post per poter passare tutte le colonne, incluso l'alias, alla query
	// TODO: Passo in param un object con le colonne da estrarre (tutte)
	/* const params = JSON.stringify({ sheet_id: sheet.id });
	const url = `/fetch_api/datamartpost`;
	const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
	const req = new Request(url, init);
	await fetch(req)
	  .then((response) => {
		console.log(response);
		if (!response.ok) { throw Error(response.statusText); }
		return response;
	  })
	  .then((response) => response.json())
	  .then(data => {
		console.log(data);
		debugger;
		Dashboard.data = data;
		app.createJsonTemplate();
	  })
	  .catch(err => {
		App.showConsole(err, 'error');
		console.error(err);
	  }); */
	// end chiamta in POST

	console.log(Resource.specs);
	Resource.specs = JSON.parse(window.localStorage.getItem(Sheet.sheet.token)).specs;
	debugger;
	// se esistono più di un chartWrapper li visualizzo in questa popover
	if (Object.keys(Resource.specs.wrapper).length >= 2) btn__chartWrapper.removeAttribute('disabled');

	const progressBar = document.getElementById('progress-bar');
	const progressTo = document.getElementById('progress-to');
	const progressTotal = document.getElementById('progress-total');
	const progressLabel = document.querySelector("label[for='progress-bar']");
	App.showConsole('Recupero dati in corso...', 'info', null);
	await fetch(`/fetch_api/${Sheet.datamart}/preview`)
		// await fetch(`/fetch_api/${Sheet.sheet.datamartId}_${Sheet.sheet.userId}/preview`)
		.then((response) => {
			// console.log(response);
			if (!response.ok) { throw Error(response.statusText); }
			return response;
		})
		.then((response) => response.json())
		.then(async (paginateData) => {
			let partialData = [];
			// TODO: rivedere come utilizzare la progressBar con i dati provenienti dal cursorPaginate.
			// La progress-bar veniva correttamente utilizzata con il paginate
			if (paginateData.total !== 0) {
				// console.log(paginateData);
				progressBar.value = +((paginateData.to / paginateData.total) * 100);
				progressLabel.hidden = false;
				progressTo.innerText = paginateData.to;
				progressTotal.innerText = paginateData.total;
				// console.log(paginateData.data);
				// funzione ricorsiva fino a quando è presente next_page_url
				let recursivePaginate = async (url) => {
					await fetch(url).then(response => {
						// console.log(response);
						if (!response.ok) { throw Error(response.statusText); }
						return response;
					}).then(response => response.json()).then(paginate => {
						// console.log(paginate);
						progressBar.value = +((paginate.to / paginate.total) * 100);
						progressTo.innerText = paginate.to;
						progressTotal.innerText = paginate.total;
						// console.log(progressBar.value);
						partialData = partialData.concat(paginate.data);
						if (paginate.next_page_url && paginate.current_page !== 2) {
							recursivePaginate(paginate.next_page_url);
						} else {
							// Non sono presenti altre pagine, visualizzo il dashboard
							console.log('tutte le paginate completate :', partialData);
							Resource.data = partialData;
							// google.charts.setOnLoadCallback(drawDatamart());
							// App.closeConsole();
							App.loaderStop();
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
					// google.charts.setOnLoadCallback(drawDatamart());
					// App.closeConsole();
					App.loaderStop();
					google.charts.setOnLoadCallback(draw());
				}
			} else {
				App.closeConsole();
				App.loaderStop();
				App.showConsole('Nessun dato presente', 'warning', 2000);
			}
		})
		.catch(err => {
			App.showConsole(err, 'error');
			console.error(err);
		});
}

/* async function preview() {
	Resource.specs = JSON.parse(window.localStorage.getItem(Sheet.sheet.token)).specs;
	// se esistono più di un chartWrapper li visualizzo in questa popover
	if (Object.keys(Resource.specs.wrapper).length >= 2) btn__chartWrapper.removeAttribute('disabled');
	App.showConsole('Recupero dati in corso...', null, null);
	await fetch(`/fetch_api/${Sheet.sheet.datamartId}_${Sheet.sheet.userId}/preview`)
		.then((response) => {
			if (!response.ok) { throw Error(response.statusText); }
			return response;
		})
		.then((response) => response.json())
		.then(data => {
			if (data) {
				// Non sono presenti altre pagine, visualizzo la dashboard
				Resource.data = data;
				// google.charts.setOnLoadCallback(drawDatamart());
				google.charts.setOnLoadCallback(draw());
				App.loaderStop();
				App.closeConsole();
			} else {
				App.loaderStop();
				App.closeConsole();
				App.showConsole('Nessun dato presente', 'warning', 2000);
			}
		})
		.catch(err => {
			App.showConsole(err, 'error');
			console.error(err);
		});
} */
