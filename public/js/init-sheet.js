console.info('init-sheet');
let input__column_label;
let select__column_datatype;
let select__column_format;
let input__fraction_digits;
let checkbox__column_filter;

const ulColumnsHandler = document.getElementById('ul-columns-handler');
const dlgConfig = document.getElementById('dlg-sheet-config');
const btnSheetPreview = document.getElementById("btn-sheet-preview");
const btnSQLPreview = document.getElementById("btn-sql-preview");
const saveColumnConfig = document.getElementById('btn-column-save');
const tmplList = document.getElementById('tmpl-li');
// const export__datatable_csv = document.getElementById('export__datatable_csv');
// const export__dataview_csv = document.getElementById('export__dataview_csv');

const config = { attributes: true, childList: false, subtree: false };
const callback = (mutationList, observer) => {
	// console.log(mutationList);
	for (const mutation of mutationList) {
		if (mutation.type === "attributes") {
			// console.log(`${mutation.attributeName} attributo è stato modificato.`);
			// console.log(mutation.target.dataset.error);
			if (mutation.target.dataset.error === "true") {
				console.error("Error");
				btnSheetPreview.disabled = true;
				btnSQLPreview.disabled = true;
			} else {
				btnSheetPreview.disabled = false;
				btnSQLPreview.disabled = false;
			}
		}
	}
};
const observerList = new MutationObserver(callback);
observerList.observe(document.getElementById('dropzone-columns'), config);
observerList.observe(document.getElementById('dropzone-rows'), config);
// observerList.observe(document.getElementById('dropzone-filters'), config);

// google.charts.load('current', { 'packages': ['bar', 'table', 'corechart', 'line', 'controls', 'charteditor'], 'language': 'it' });
google.charts.load('current', { 'packages': ['corechart', 'controls', 'charteditor'], 'language': 'it' });

function updatedSheet() {
	// la 'updated_at' dello sheet deve essere aggiornata perchè viene modificato lo Sheet
	const sheet = SheetStorage.sheet;
	sheet.updated_at = Sheets.getISOStringDate(new Date());
	// sheet.updated_at = new Date().toLocaleDateString('it-IT', Sheet.options);
	SheetStorage.save(sheet);
}

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

function createSheetColumns(data) {
	// ciclo il prpareData.cols per aggiungere l'elenco delle colonne in #ul-columns-handler.
	// Da questo elenco si potranno nascondere/visualizzare le colonne e le metreehe
	ulColumnsHandler.querySelectorAll('li').forEach(el => el.remove());
	data.cols.forEach((col, index) => {
		const template = template_li.content.cloneNode(true);
		const li = template.querySelector('li');
		// in questo elenco non aggiungo le colonne _id e le metriche con 'dependencies':true.
		// Le colonne _id sono automaticamente nascoste dalla DataTable, anche se sono
		// presenti nel func group() (json.data.group.key)
		// se è una metrica con 'dependencies' : true non devo aggiungerla alla ul
		const column = (Resource.specs.wrapper[Resource.wrapper].group.key.find(column => (column.id === col.id)) || Resource.specs.wrapper[Resource.wrapper].group.columns.find(metric => (metric.alias === col.id && metric.dependencies === false)));
		if (column) {
			li.dataset.visible = column.properties.visible;
			li.innerText = col.label;
			li.dataset.columnId = col.id;
			li.dataset.index = index;
			li.addEventListener('click', columnHander);
			ulColumnsHandler.appendChild(li);
		}
	});
}

function draw() {
	console.clear();
	console.log('TIMER START', new Date());
	const start_time_execution = new Date();
	const prepareData = Resource.prepareData();
	// Creo l'elenco di colonne/metriche elaborate dallo Sheet. Da qui
	// potranno essere visualizzate/nascoste le colonne o le metriche per poter
	// creare diverse "visualizzazioni"
	createSheetColumns(prepareData);
	Resource.dataTable = new google.visualization.DataTable(prepareData);
	Resource.gdashboard = new google.visualization.Dashboard(document.getElementById('report__area'));
	// console.log(Resource.wrapper);
	// I controlli, in questa fase, vengono recuperati dall'oggetto 'key', all'interno di
	// specs[wrapper].group
	Resource.dashboardControls = Resource.drawSheetControls(document.getElementById('preview__filters'));

	// Creo il ChartWrapper, le varie proprietà vengono recuperate da : specs[wrapper].chartType
	Resource.chartWrapper = new google.visualization.ChartWrapper();
	Resource.chartWrapper.setChartType(Resource.specs.wrapper[Resource.wrapper].chartType);
	Resource.chartWrapper.setContainerId(Resource.ref.id);
	// Legame tra Controlli e Dashboard
	Resource.gdashboard.bind(Resource.dashboardControls, Resource.chartWrapper);
	google.visualization.events.addListener(Resource.gdashboard, 'ready', chartWrapperReady);
	Resource.gdashboard.draw(Resource.dataTable);
	console.log('TIMER END', new Date());
	console.info(`ExecutionTime : ${new Date() - start_time_execution}ms`);
}

// NOTE: qui è commentata tutta la logica utilizzata anche nelle Dashboard.
// Ricopiare gli appunti in un altra sezinoe prima di eliminarla.
function drawDatamart() {
	// Il dato iniziale non è raggruppato, la query sul datamart è eseguita con SELECT *...
	// La preview deve consentire la personalizzazione del report, quindi la possibilità
	// di nascondere/visualizzare una colonna e decidere anche il raggruppamento per i
	// livelli dimensionali
	const prepareData = Resource.prepareData();
	createSheetColumns(prepareData);
	Resource.dataTable = new google.visualization.DataTable(prepareData);
	// var tableRef = new google.visualization.Table(document.getElementById(Resource.ref));
	// Resource.tableRef = new google.visualization.Table(Resource.ref);
	// effettuando il calcolo del margine ((ricavo-costo)/ricavo*100) qui, cioè prima della
	// funzione di group(), il risultato non è corretto, questi calcoli vanno effettuati con una
	// DataView DOPO la function group()
	// imposto le opzioni per la dataTable
	Resource.chartWrapper = new google.visualization.ChartWrapper();
	const wrapper = (Resource.wrapperSelected) ? Resource.wrapperSelected : 'Table';
	Resource.chartWrapper.setChartType(Resource.specs.wrapper[wrapper].chartType);
	Resource.chartWrapper.setContainerId(Resource.ref.id);
	Resource.chartWrapper.setDataTable(Resource.dataTable);
	Resource.chartWrapper.setOptions(Resource.specs.wrapper[wrapper].options);
	// NOTE: prova impostazione CSS su una colonna
	// Resource.dataTable.setColumnProperty(1, 'className', 'cssc1')
	// Resource.dataTable.setColumnProperty(2, 'className', 'cssc1')
	// Resource.dataTable.setColumnProperty(3, 'className', 'cssc1')
	// console.log(Resource.dataTable.getColumnProperty(1, 'className'));
	// console.log(Resource.dataTable.getColumnProperties(1));
	// END NOTE: prova impostazione CSS su una colonna

	// L'evento 'ready' genera un'ulteriore visualizzazione della dataTable.
	// In questa funzione andrò a creare la DataView, necessaria per poter
	// aggiungere/rimuovere colonne. Prima di creare la DataView viene effettuata
	// una group(), questa consente di raggruppare la visualizzazione in base ai livelli
	// dimensionali scelti (aggiunta/rimozione di livelli dimensionali)
	// tableRef.clearChart();
	// google.visualization.events.addListener(Resource.tableRef, 'ready', chartWrapperReady);
	google.visualization.events.addListener(Resource.chartWrapper, 'ready', chartWrapperReady);

	Resource.chartWrapper.draw();
	// Resource.tableRef.draw(Resource.dataTable, Resource.options);
	// drawToolbar();
	// var csv = google.visualization.dataTableToCsv(Resource.dataTable);
	// console.log(csv);
	/* var csvFormattedDataTable = google.visualization.dataTableToCsv(Resource.dataTable);
	var encodedUri = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csvFormattedDataTable);
	export__datatable_csv.href = encodedUri;
	export__datatable_csv.download = 'table-data.csv'; */
	// export_datatable_CSV();
	// export__csv.target = '_blank';
}

function chartWrapperReady() {
	debugger
	console.log('TIMER START (ready)', new Date());
	const start_time_execution = new Date();
	// Imposto un altro riferimento a tableRef altrimenti l'evento ready si attiva ricorsivamente (errore)
	// Resource.tableRefGroup = new google.visualization.Table(document.getElementById(Resource.ref));
	// Resource.tableRefGroup = new google.visualization.Table(Resource.ref);
	// console.log('group.key:', Resource.specs.data.group.key);
	// trasformo il data.group.key in un array di indici di colonne (anche se potrebbe funzionare
	// anche con un object, da rivedere su Google Chart)
	// Questo è il secondo param della funzione group() e, in questo array sono incluse
	// anche le colonne _id
	// let keyColumns = [];
	// keyColumns conterrà gli index delle colonne (recuperandoli da
	// json.data.group.key) per le quali il report viene raggruppato.
	// Questo consente di fare i calcoli per le metriche composte sui dati raggruppati
	/* Resource.specs.data.group.key.forEach(column => {
	  // if (column.properties.grouped) keyColumns.push(Resource.dataTable.getColumnIndex(column.id));
	  // imposto il key con un object anzichè con gli indici, questo perchè voglio impostare la label
	  // che viene modificata dall'utente a runtime
	  if (column.properties.grouped) {
		keyColumns.push({ id: column.id, column: Resource.dataTable.getColumnIndex(column.id), label: column.label, type: column.type });
	  }
	}); */
	Resource.group = Resource.specs.wrapper[Resource.wrapper].group;
	Resource.dataGroup = Resource.createDataTableGrouped();
	Resource.createDataViewGrouped();
	Resource.chartWrapperView = new google.visualization.ChartWrapper();
	Resource.chartWrapperView.setChartType(Resource.specs.wrapper[Resource.wrapper].chartType);
	Resource.chartWrapperView.setContainerId(Resource.ref.id);
	Resource.chartWrapperView.setOptions(Resource.specs.wrapper[Resource.wrapper].options);
	// console.log(Resource.dataTable);
	// creo l'object che verrà messo nel terzo param di group()
	// Es.: { column: 16, aggregation: google.visualization.data.sum, type: 'number' },
	// le metriche che hanno la proprietà dependencies: true, sono quelle NON aggiunte DIRETTAMENTE
	// al report ma "dipendono" da quelle composite, quindi creo l'array con le sole colonne
	// da visualizzare nel report, prendendo i dati da 'data.group.columns'
	// let groupColumnsIndex = [];
	/* Resource.specs.data.group.columns.forEach(metric => {
	  // salvo in groupColumnsIndex TUTTE le metriche, deciderò nella DataView
	  // quali dovranno essere visibili (quelle con dependencies:false)
	  // recupero l'indice della colonna in base al suo nome
	  const index = Resource.dataTable.getColumnIndex(metric.alias);
	  // TODO: modificare la prop 'aggregateFn' in 'aggregation' in fase di creazione delle metriche
	  const aggregation = (metric.aggregateFn) ? metric.aggregateFn.toLowerCase() : 'sum';
	  let object = { id: metric.alias, column: index, aggregation: google.visualization.data[aggregation], type: 'number', label: metric.label };
	  groupColumnsIndex.push(object);
	}); */
	// console.log(groupColumnsIndex);
	// Funzione group(), raggruppo i dati in base alle key presenti in keyColumns
	/* Resource.dataGroup = new google.visualization.data.group(
	  Resource.dataTable, keyColumns, groupColumnsIndex
	); */
	// for (const [key, value] of Object.entries(Resource.specs.data.formatter)) {
	//   let formatter = app[value.type](value.prop);
	//   formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(key));
	// }
	Resource.specs.wrapper[Resource.wrapper].group.columns.forEach(metric => {
		let formatter = app[metric.properties.formatter.type](metric.properties.formatter.prop);
		formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(metric.token));
	});
	// console.log('dataGroup():', Resource.dataGroup);
	// console.log(Resource.dataGroup.getColumnIndex())
	// Imposto le label memorizzate in group.key. In questo caso potrei utilizzare gli object da passare
	// a group(), invece degli indici, per le colonne, è la stessa logica utilizzata per le metriche.
	// Utilizzando un object al posto degli indici potrei impostare la prop 'label' direttamente nell'object
	// invece di fare questo ciclo...
	// Resource.specs.data.group.key.forEach(column => {
	//   Resource.dataGroup.setColumnLabel(Resource.dataTable.getColumnIndex(column.id), column.label);
	// });
	// console.log(Resource.dataGroup);
	// Formattazione colonne
	// debugger;

	// TEST: aggiunta di una CSS class a una colonna, nella dataGroup
	// Resource.dataGroup.setColumnProperty(1, 'className', 'cssc1')
	// console.log(Resource.dataGroup.getColumnProperty(1, 'className'));

	// DataView, mi consente di visualizzare SOLO le colonne definite nel report ed
	// effettuare eventuali calcoli per le metriche composite ('calc')
	// Resource.dataViewGrouped = new google.visualization.DataView(Resource.dataGroup);
	// console.log('DataViewGrouped :', Resource.dataViewGrouped);

	// TEST: recupero gli indici delle colonne area_ds, zona_ds (colonna da visualizzare)
	// console.log('costo_rapporto_6 (index):', Resource.dataGroup.getColumnIndex('costo_rapporto_6'));
	// console.log('costo_rapporto_2 (index):', Resource.dataGroup.getColumnIndex('costo_rapporto_2'));
	// console.log('ricavo_rapporto_2 (index):', Resource.dataGroup.getColumnIndex('ricavo_rapporto_2'));
	// console.log('area_ds index : ', Resource.dataTable.getColumnIndex('area_ds'));
	// console.log('zona_ds index : ', Resource.dataTable.getColumnIndex('zona_ds'));
	// per le colonne dimensionali, potrei recuperare gli indici, da mettere in DataView.setColumns()
	// con il getColumnId() sulla dataGroup
	// console.log(Resource.dataGroup.getColumnId(3));
	// console.log(Resource.dataGroup.getColumnIndex('zona'));
	// END TEST

	// recupero le colonne presenti nel report, tramite le impostazioni di
	// json.data.view (contiene i nomi delle colonne "_ds", da visualizzare)
	// e json.data.group.columns (contiene le metriche, con dependencies:false)
	// che saranno visualizzate nella preview.
	// In .data.view sono presenti tutte le colonne del report, tramite la
	// prop 'visible' (bool) posso decidere di visualizzarla/nascondere a seconda della scelta
	// dell'utente.
	// Dalla dataGroup, recupero gli indici delle colonne impostato con 'visible:true'
	// Resource.specs.data.view.forEach(column => {
	//   if (column.properties.visible) viewColumns.push(Resource.dataGroup.getColumnIndex(column.id));
	// });
	// Resource.createDataViewSheet();

	google.visualization.events.addListener(Resource.chartWrapperView, 'ready', ready);
	// con l'opzione sort: 'event' viene comunque processato l'evento 'sort'
	// senza effettuare l'ordinamento.
	// console.log(Resource.wrapper);
	// console.log(Resource.specs.wrapper[Resource.wrapper].options);
	Resource.chartWrapperView.setDataTable(Resource.dataViewFinal);
	Resource.chartWrapperView.draw();
	console.log('TIMER END', new Date());
	console.info(`ExecutionTime (ChartWrapperReady) : ${new Date() - start_time_execution}ms`);
	App.closeConsole();
	App.loaderStop();
	// google.visualization.events.addListener(Resource.chartWrapperView, 'sort', sort);
	// Resource.tableRefGroup.draw(Resource.dataViewGrouped, Resource.specs.wrapper[Resource.wrapper].options);
	// var csvFormattedDataTable = google.visualization.dataTableToCsv(Resource.dataViewGrouped);
	// console.log(csvFormattedDataTable);
	// var encodedUri = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csvFormattedDataTable);
	// export__dataview_csv.href = encodedUri;
	// export__dataview_csv.download = 'table-view-data.csv';
	// export_dataview_CSV();
}

function ready() {
	google.visualization.events.addListener(Resource.chartWrapperView.getChart(), 'sort', handleColumn);
}

function replacement(match, offset, string) {
	return `&#${match.charCodeAt()};`;
}

function export_datatable_CSV() {
	var csvColumns;
	var csvContent;

	// Creo le intestazioni di colonna
	csvColumns = '';
	for (var i = 0; i < Resource.dataTable.getNumberOfColumns(); i++) {
		csvColumns += Resource.dataTable.getColumnLabel(i);
		if (i < Resource.dataTable.getNumberOfColumns() - 1) {
			csvColumns += ',';
		}
	}
	csvColumns += '\n';

	// get data rows
	// console.log(google.visualization.dataTableToCsv(Resource.dataTable));
	csvContent = csvColumns + google.visualization.dataTableToCsv(Resource.dataTable);

	// export__datatable_csv.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
	// export__datatable_csv.href = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csvContent);
	// export__datatable_csv.download = 'datatable.csv';
	// export__datatable_csv.target = '_blank';
}

function export_dataview_CSV(data) {
	var csvColumns;
	var csvContent;

	// Creo le intestazioni di colonna
	csvColumns = '';
	for (var i = 0; i < Resource.dataViewGrouped.getNumberOfColumns(); i++) {
		csvColumns += Resource.dataViewGrouped.getColumnLabel(i);
		if (i < Resource.dataViewGrouped.getNumberOfColumns() - 1) {
			csvColumns += ',';
		}
	}
	csvColumns += '\n';

	// get data rows
	csvContent = csvColumns + google.visualization.dataTableToCsv(Resource.dataViewGrouped);

	// export__datatable_csv.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
	// export__dataview_csv.href = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csvContent);
	// export__dataview_csv.download = 'dataview.csv';
	// export__datatable_csv.target = '_blank';
}

function drawToolbar() {
	var components = [
		{
			type: 'igoogle', datasource: 'https://spreadsheets.google.com/tq?key=pCQbetd-CptHnwJEfo8tALA',
			gadget: 'https://www.google.com/ig/modules/pie-chart.xml',
			userprefs: { '3d': 1 }
		},
		{ type: 'html', datasource: 'https://spreadsheets.google.com/tq?key=pCQbetd-CptHnwJEfo8tALA' },
		// { type: 'csv', datasource: 'https://spreadsheets.google.com/tq?key=pCQbetd-CptHnwJEfo8tALA' },
		{ type: 'csv', datasource: csv },
		{
			type: 'htmlcode', datasource: 'https://spreadsheets.google.com/tq?key=pCQbetd-CptHnwJEfo8tALA',
			gadget: 'https://www.google.com/ig/modules/pie-chart.xml',
			userprefs: { '3d': 1 },
			style: 'width: 800px; height: 700px; border: 3px solid purple;'
		}
	];

	var container = document.getElementById('toolbar_div');
	google.visualization.drawToolbar(container, components);
};

function handleColumn(e) {
	input__column_label = document.getElementById('input__column_label');
	select__column_datatype = document.getElementById('select__column_datatype');
	select__column_format = document.getElementById('select__column_format');
	input__fraction_digits = document.getElementById('input__fraction_digits');
	checkbox__column_filter = document.getElementById('checkbox__column_filter');
	// default del valore decimale
	input__fraction_digits.value = 0;
	// valore di default per la select__column_format
	select__column_format.selectedIndex = 0;

	// l'indice della colonna nella DataViewFinal
	Resource.colIndex = e.column;
	console.log(`index DataTable : ${Resource.dataTable.getColumnIndex(Resource.colIndex)}`);
	// const test = Resource.chartWrapperView.getDataTable().toDataTable();
	// console.log(test.getColumnIndex(Resource.colIndex));

	// console.log(Resource.dataViewFinal.getViewColumnIndex(4));
	// console.log(Resource.dataViewFinal.toDataTable().getColumnIndex(4));

	// recupero il nome della colonna in base al suo indice
	Resource.columnId = Resource.dataGroup.getColumnId(Resource.colIndex);
	console.log(`index della dataViewFinal ${Resource.colIndex}`);
	console.log(`column_id : ${Resource.columnId}`);
	console.log(`index DataGroup : ${Resource.dataGroup.getColumnIndex(Resource.columnId)}`);
	console.log(`index DataTable : ${Resource.dataTable.getColumnIndex(Resource.columnId)}`);
	console.log(`index DataTable (colIndex) : ${Resource.dataTable.getColumnIndex(Resource.colIndex)}`);
	console.log(`index DataGroup (colIndex) : ${Resource.dataGroup.getColumnIndex(Resource.colIndex)}`);
	// WARN: non vengono trovati gli indici delle metriche composte (questo è
	// segnalato anche su GoogleChart in getTableColumnIndex che parla di colonne generate)
	console.log(`index DataViewFinal : ${Resource.dataViewFinal.getTableColumnIndex(Resource.colIndex)}`);

	Resource.dataGroupIndex = Resource.dataGroup.getColumnIndex(Resource.columnId);
	Resource.dataTableIndex = Resource.dataTable.getColumnIndex(Resource.columnId);

	// NOTE: getViewColumnIndex() resituisce l'indice della DataView impostata
	// con setColumns(), il valore passato è l'indice della dataTable
	// se setColumns([1,3,5,7]) getViewColumnIndex(7) restituisce 4
	// Resource.dataViewIndex = Resource.dataViewGrouped.getViewColumnIndex(7);

	// etichetta colonna, questa viene impostata nella dlg-sheet-config
	Resource.columnLabel = Resource.dataGroup.getColumnLabel(Resource.colIndex);
	// datatype della colonna
	Resource.columnDataType = Resource.dataGroup.getColumnType(Resource.colIndex);
	input__column_label.value = Resource.columnLabel;
	// recupero il dataType della colonna selezionata, la <select> è un'array di <option>
	// console.log(select__column_datatype.options);
	[...select__column_datatype.options].forEach((option, index) => {
		// console.log(Resource.dataViewGrouped.getColumnProperties(Resource.colIndex));
		if (option.value === Resource.columnDataType) select__column_datatype.selectedIndex = index;
	});
	// recupero la formattazione impostata per la colonna e il suo valore di numeri decimali
	// TODO: 04.04.2025 al momento la formattazionie è impostata solo sulle metriche
	const metric = Resource.specs.wrapper[Resource.wrapper].group.columns.find(metric => metric.token === Resource.columnId);
	if (metric) {
		[...select__column_format.options].forEach((option, index) => {
			if (option.value === metric.properties.formatter.format) {
				select__column_format.selectedIndex = index;
				input__fraction_digits.value = metric.properties.formatter.prop.fractionDigits;
			}
		});
	}
	// reimposto la checkbox se questa colonna è stata impostata come filtro dashboard
	checkbox__column_filter.checked = (Resource.specs.filters.find(name => name.id === Resource.columnId)) ?
		true : false;
	dlgConfig.showModal();
}

// Salvataggio della configurazione colonna dalla dialog dlg-config
saveColumnConfig.onclick = () => {
	// console.log(Resource.dataTable);
	console.log({
		"dataTable (index)": Resource.dataTable.getColumnIndex(Resource.columnId),
		"dataGroup (index)": Resource.dataGroup.getColumnIndex(Resource.columnId),
		"dataView (index)": Resource.colIndex,
		"id": Resource.columnId, "label": Resource.columnLabel
	});
	const type = select__column_datatype.options.item(select__column_datatype.selectedIndex).value.toLowerCase();
	const format = select__column_format.options.item(select__column_format.selectedIndex).value;
	const fractionDigits = +input__fraction_digits.value;
	let formatterProperties = {};

	Resource.dataGroup.setColumnLabel(Resource.dataGroupIndex, input__column_label.value);
	Resource.dataTable.setColumnLabel(Resource.dataTableIndex, input__column_label.value);
	switch (format) {
		case 'currency':
			formatterProperties = { suffix: ' €', negativeColor: 'brown', negativeParens: true, fractionDigits };
			break;
		case 'percent':
			formatterProperties = { suffix: ' %', negativeColor: 'brown', negativeParens: true, fractionDigits };
			break;
		case 'date':
			// TODO: da implementare
			// Resource.specs.data.formatter[Resource.columnId] = { format: 'date' };
			break;
		default:
			// numero senza decimali e con separatore migliaia
			formatterProperties = { negativeParens: false, fractionDigits, groupingSymbol: '.' };
			break;
	}
	// console.log(Resource.dataTable.getColumnProperties(Resource.dataTableIndex));
	// recupero la proprietà 'p' impostata in prepareData(), qui ho aggiunto :
	// 'column' : colonne di livelli dimensionali
	// 'measure' : per le metriche
	const columnType = Resource.dataTable.getColumnProperty(Resource.dataTableIndex, 'data');
	// il columnType lo utilizzo per sapere se interrogare l'array ...group.key (colonne dimensionali)
	// ...oppure l'array group.columns (metriche)
	if (columnType === 'column') {
		// cerco, nell'array ...group.key la colonna da modificare, la variabile column è un riferimento
		const column = Resource.specs.wrapper[Resource.wrapper].group.key.find(col => col.id === Resource.columnId);
		// ... quindi posso modificarla direttamente
		column.label = input__column_label.value;
		for (const value of Object.values(Resource.specs.data.columns)) {
			if (value.id === column.id && value.label !== input__column_label.value) value.label = input__column_label.value;
		}
		// console.log(Resource.dataGroup.getColumnId(dataGroupIndex));
		// console.log(Resource.dashboardControls[Resource.dataGroup.getColumnIndex(Resource.columnId)]);
		// console.log(Resource.dashboardControls[Resource.dataGroup.getColumnIndex(Resource.columnId)].getOptions());
		// Modifico le label anche per i controllo associati allo Sheet
		Resource.dashboardControls[Resource.dataGroupIndex].setOption('filterColumnLabel', input__column_label.value);
		Resource.dashboardControls[Resource.dataGroupIndex].setOption('ui.caption', input__column_label.value);
		// Modifico anche l'elemento <li> nella #ul-columns-handler
		ulColumnsHandler.querySelector(`li[data-column-id='${Resource.columnId}']`).innerText = input__column_label.value;
	} else {
		const metric = Resource.specs.wrapper[Resource.wrapper].group.columns.find(metric => metric.token === Resource.columnId);
		metric.label = input__column_label.value;
		for (const value of Object.values(Resource.specs.data.columns)) {
			if (value.id === metric.token && value.label !== input__column_label.value) value.label = input__column_label.value;
		}
		metric.properties.formatter = { type, format, prop: formatterProperties };
		const formatter = app[type](formatterProperties);
		formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(metric.token));
		// formatter.format(Resource.dataTable, Resource.dataTable.getColumnIndex(metric.token));
	}
	console.log('DataGroup:', Resource.dataGroup);
	console.log('DataTable:', Resource.dataTable);

	// filtri definiti per il report
	const index = Resource.specs.filters.findIndex(filter => filter.id === Resource.dataGroup.getColumnId(Resource.dataGroupIndex));
	if (checkbox__column_filter.checked === true) {
		// Proprietà Resource.specs.filters
		// Inserisco il filtro solo se non è ancora presente in Resource.specs.filters
		if (index === -1) {
			// non è presente, lo aggiungo
			Resource.specs.filters.push({
				id: Resource.dataGroup.getColumnId(Resource.dataGroupIndex),
				containerId: `${Resource.specs.token}-${Resource.dataGroup.getColumnId(Resource.dataGroupIndex)}`,
				sheet: Resource.specs.token,
				filterColumnLabel: input__column_label.value,
				caption: input__column_label.value
			});
		} else {
			// il Filtro è gia presente sulla dashboard, ne aggiorno la filterColumnLabel
			const dashboard_filter = Resource.specs.filters.find(filter => filter.id === Resource.dataGroup.getColumnId(Resource.dataGroupIndex));
			debugger;
			dashboard_filter.filterColumnLabel = input__column_label.value;
			dashboard_filter.caption = input__column_label.value;
		}
	} else {
		// rimozione del filtro, se presente
		if (index !== -1) Resource.specs.filters.splice(index, 1);
	}
	// definisco il bind in base ai filtri impostati
	Resource.bind();

	console.log('specifications : ', Resource.specs);
	debugger;
	const sheet = JSON.parse(window.localStorage.getItem(Resource.specs.token));
	sheet.specs = Resource.specs;
	window.localStorage.setItem(Resource.specs.token, JSON.stringify(sheet));
	Resource.gdashboard.draw(Resource.dataTable);
	if (Resource.dashboardControls[Resource.dataGroupIndex]) Resource.dashboardControls[Resource.dataGroupIndex].draw();

	dlgConfig.close();
	// la 'updated_at' dello sheet deve essere aggiornata perchè viene modificato lo Sheet
	updatedSheet();
}

function columnHander(e) {
	// Stessa logica della Func 'chartWrapperReady()'
	const dataTableIndex = Resource.dataTable.getColumnIndex(e.target.dataset.columnId);
	console.log('index colonna DataTable', dataTableIndex);
	// console.log(Resource.dataTable.getColumnProperties(dataTableIndex));
	const columnType = Resource.dataTable.getColumnProperty(dataTableIndex, 'data');
	if (columnType === 'column') {
		// Recupero l'index della colonna da nascondere/visualizzare
		// index = Resource.specs.data.group.key.findIndex(col => col.id === e.target.dataset.columnId);
		if (e.target.dataset.visible === 'false') {
			// la colonna è nascosta, la visualizzo e raggruppo.
			e.target.dataset.visible = true;
			// La logica è descritta nell'else (quando si nasconde una colonna)
			// Resource.specs.data.group.key[dataTableIndex - 1].properties.grouped = true;
			Resource.specs.wrapper[Resource.wrapper].group.key[dataTableIndex].properties.grouped = true;
			Resource.specs.wrapper[Resource.wrapper].group.key[dataTableIndex].properties.visible = true;
		} else {
			e.target.dataset.visible = false;
			// la colonna è visibile, la nascondo e la elimino dal group()
			// Il report è raggruppato (dataViewGrouped) in base ai livelli dimensionali
			// presenti, quando viene nascosta una colonna, anzichè eliminarla
			// dalle proprietà .json.data.group... le "contrassegno" con la prop 'grouped:false'
			// In questo modo posso ripristinarla.
			// Elimino il raggruppamento per la colonna che l'utente ha nascosto
			// se è una colonna dimensionale cerco in .group.key
			// altrimenti cerco in .group.columns
			// Resource.specs.data.group.key[dataTableIndex - 1].properties.grouped = false;
			Resource.specs.wrapper[Resource.wrapper].group.key[dataTableIndex].properties.grouped = false;
			Resource.specs.wrapper[Resource.wrapper].group.key[dataTableIndex].properties.visible = false;
			// OPTIMIZE: se, invece di chartWrapperReady() provassi ad impostare i metodi hideColumn/showColumn di GoogleChart?
			// TEST: aggiorna tabella con il metodo draw()
			/* Resource.dataViewGrouped.hideColumns([dataTableIndex - 1, dataTableIndex]);
			debugger;
			Resource.tableRefGroup.draw(Resource.dataViewGrouped, Resource.options); */
		}
	} else {
		// metrica
		const metric = Resource.specs.wrapper[Resource.wrapper].group.columns.find(metric => metric.alias === e.target.dataset.columnId);
		if (e.target.dataset.visible === 'false') {
			// la colonna è nascosta, la visualizzo e raggruppo.
			e.target.dataset.visible = true;
			metric.properties.visible = true;
		} else {
			e.target.dataset.visible = false;
			metric.properties.visible = false;
		}
	}
	console.log(Resource.specs.wrapper);
	debugger;
	const sheet = JSON.parse(window.localStorage.getItem(Resource.specs.token));
	sheet.specs = Resource.specs;
	window.localStorage.setItem(Resource.specs.token, JSON.stringify(sheet));
	Resource.gdashboard.draw(Resource.dataTable);
	updatedSheet();
}
