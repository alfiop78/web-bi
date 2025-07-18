console.info('workbook_functions');
// dialogs
const dlg__workbookNew = document.getElementById('dlg__workbook_new');
const dlg__workbookOpen = document.getElementById('dlg__workbook_open');
// buttons
const btn__workbookNew = document.getElementById('btn__workbook_new');
const btn__workbookCreate = document.getElementById('btn__workbook_create');
const btn__workbookOpenDialog = document.getElementById('btn__workbook_openDialog');
const btn__workbook = document.getElementById('btn__workbook');
// inputs
const input__workbook_name = document.getElementById('input__workbook_name');
// ul
const ul__used_on_composite_metric = document.getElementById('ul__used_on_composite_metric');
// titolo contenuto nella barra del menù
const input__workbook_title = document.getElementById('input__workbook_title');

function workbook() {
	const translateRef = document.getElementById('stepTranslate');
	const steps = document.getElementById('steps');
	steps.dataset.step = 1;
	translateRef.dataset.step = 1;
	body.dataset.step = 1;
	// carico le proprietà del Workbook nel boxInfo
	WorkBook.getInformations();
}

// Creazione di un nuovo WorkBook, creazione oggetto della Classe WorkBook
function workbookCreate() {
	const name = input__workbook_name.value;
	WorkBook = new WorkBooks(name);
	WorkBook.databaseId = +document.querySelector('main').dataset.databaseId;
	Draw = new DrawSVG('svg');
	input__workbook_title.dataset.value = name;
	input__workbook_title.innerText = name;
	// abilito il tasto "carica Schema"
	document.querySelector('#btnSchemata').disabled = false;
	dlg__workbookNew.close();
}

function editWorkbookTitle(e) {
	if (e.target.dataset.tempValue) {
		e.target.dataset.value = e.target.textContent;
		if (WorkBook) {
			WorkBook.name = e.target.textContent;
			delete e.target.dataset.tempValue;
		}
	} else {
		e.target.innerText = e.target.dataset.defaultValue;
	}
}

/*
* Apertura di un WorkBook già presente
* */
async function workbookSelected(e) {
	Draw = new DrawSVG('svg');
	WorkBook = new WorkBooks(e.currentTarget.dataset.name);
	WorkBook = WorkBook.open(e.currentTarget.dataset.token);
	WorkBook.workBook.token = e.currentTarget.dataset.token;
	WorkBook.name = e.currentTarget.dataset.name;
	// scarico le tabelle del canvas in sessionStorage, questo controllo va fatto dopo aver definito WorkBook.hierTables
	await checkTablesStorage();
	// Gli elementi del canvas sono stati disegnati, creo il workbookMap
	WorkBook.workbookMap = Draw.svg.querySelectorAll('use.table:not([data-shared_ref]), use.time');
	WorkBook.getInformations();
	// modifico il nome del WorkBook in #input__workbook_title
	input__workbook_title.innerText = WorkBook.name;
	input__workbook_title.dataset.value = WorkBook.name;
	input__workbook_title.dataset.tempValue = WorkBook.name;
	// app.hierTables();
	Draw.checkResizeSVG();
	document.querySelector('#btnSchemata').disabled = false;
	// il WorkBook è già creato quindi da questo momento è in fase di edit
	WorkBook.edit = true;
	dlg__workbookOpen.close();
}

async function checkTablesStorage() {
	// scarico in sessionStorage tutte le tabelle del canvas
	let urls = [];
	const tables = Draw.svg.querySelectorAll('use.table:not([data-shared_ref]), use.time');
	for (const objects of tables.values()) {
		WorkBook.activeTable = objects.id;
		// se la tabella è già presente in sessionStorage non rieseguo la query
		if (!window.sessionStorage.getItem(WorkBook.activeTable.dataset.table)) {
			// urls.push('/fetch_api/' + WorkBook.activeTable.dataset.schema + '/schema/' + WorkBook.activeTable.dataset.table + '/table_info');
			urls.push(`/fetch_api/${WorkBook.activeTable.dataset.schema}/schema/${WorkBook.activeTable.dataset.table}/table_info`);
		}
	}
	if (urls.length !== 0) {
		App.showConsole('Recupero tabelle in corso...', 'info');
		// Scarico le tabelle del canvas in sessionStorage, questo controllo và fatto dopo aver definito WorkBook.hierTables
		console.log('eseguo fetch...');
		WorkBookStorage.saveTables(await getTables(urls));
		console.log('Tabelle salvate in sessionStorage');
		App.closeConsole();
	}
}

function workbookOpenDialog() {
	// carico elenco dei workBook presenti
	const parent = document.getElementById("ul-workbooks");
	// reset list
	parent.querySelectorAll('li').forEach(workbook => workbook.remove());
	for (const [token, object] of Object.entries(WorkBookStorage.workBooks(+document.querySelector('main').dataset.databaseId))) {
		const tmpl = template_li.content.cloneNode(true);
		const li = tmpl.querySelector('li.select-list');
		const span = li.querySelector('span');
		// li.dataset.fn = 'workBookSelected';
		li.addEventListener('click', workbookSelected);
		li.dataset.elementSearch = "workbooks";
		li.dataset.token = token;
		li.dataset.label = object.name;
		li.dataset.name = object.name;
		span.innerHTML = object.name;
		parent.appendChild(li);
	}
	dlg__workbookOpen.showModal();
}

// TODO: 15.05.2025 Potrei usare uno script 'module' per includere questo tipo
// di funzioni. Un'altra funzione simile è getDatabaseTable() utilizzata in supportFn.js
async function getTables(urls) {
	console.log('getTables() in workbook_functions');
	return await Promise.all(urls.map(url => fetch(url)))
		.then(responses => {
			return Promise.all(responses.map(response => {
				if (!response.ok) {
					throw Error(response.statusText);
				}
				return response.json();
			}))
		})
		.then(data => data)
		.catch(err => console.error(err));

	// ottengo le risposte separatamente
	/* return await Promise.all(urls.map(url => {
	  fetch(url)
		.then(response => {
		  if (!response.ok) { throw Error(response.statusText); }
		  return response;
		})
		.then(response => response.json())
		.then(data => data)
		.catch(err => {
		  App.showConsole(err, 'error');
		  console.error(err);
		})
	})); */
}

input__workbook_title.oninput = (e) => App.checkTitle(e.target);
btn__workbookNew.onclick = () => dlg__workbookNew.showModal();
dlg__workbookNew.addEventListener('close', () => input__workbook_name.value = '');

console.info('END workbook_functions');

/*
 * Carico elenco metriche in #navMetrics
 */
function getMetricsList() {
	// console.log(WorkBook.metrics);
	const nav = document.getElementById('navMetrics');
	const basicDetails = nav.querySelector("details[data-id='basic']");
	const advancedDetails = nav.querySelector("details[data-id='advanced']");
	const compositeDetails = nav.querySelector("details[data-id='composite']");
	// reset ul
	nav.querySelectorAll('details>li').forEach(el => el.remove());
	// const sort = [...WorkBook.metric.entries()].sort((a, b) => a[1].localeCompare(b[1]));
	// INFO: ordinamento di un oggetto Map() tramite una proprietà dell'oggetto
	// const sort = [...WorkBook.metrics.values()].sort((a, b) => a.metric_type.localeCompare(b.metric_type));
	// console.log(sort);
	// for (const metric of WorkBook.metrics.values()) {
	for (const element of WorkBook.elements.values()) {
		if (element.type === 'metric') {
			const tmpl = template_li.content.cloneNode(true);
			const li = tmpl.querySelector(`li.drag-list.metrics.${element.metric_type}`);
			const span__content = li.querySelector('span');
			const span = span__content.querySelector('span');
			const i = li.querySelector('i');
			li.dataset.id = element.token;
			i.id = element.token;
			li.dataset.type = element.metric_type;
			li.dataset.elementSearch = 'metrics-dlg-composite';
			if (element.factId) li.dataset.factId = element.factId;
			li.dataset.label = element.alias;
			i.addEventListener('dragstart', elementDragStart);
			i.addEventListener('dragend', elementDragEnd);
			span.innerHTML = element.alias;
			switch (element.metric_type) {
				case 'advanced':
					advancedDetails.appendChild(li);
					break;
				case 'composite':
					compositeDetails.appendChild(li);
					break;
				default:
					// basic
					basicDetails.appendChild(li);
					break;
			}

		}
	}
}

/*
 * Verifica e restituisce l'elenco delle metriche/filtri/reports che utilizzano
 * la metrica passata come parametro
 */
function checkUsage(token) {
	let result = {};
	const metric = WorkBook.elements.get(token);
	// verifico prima se l'elemento è presente negli Sheet
	result = Storages.getSheetsUsage(token);
	// WARN: 18.07.2025 Verificare cosa contiene result se non
	// viene restituito nessuno sheet
	// ciclo l'Object Map WorkBook.elements dove sono contenute tutte
	// le metriche e i filtri del WorkBook
	for (const [key, value] of WorkBook.elements) {
		if (value.type === 'metric') {
			// ogni tipo di metrica può essere utilizzata solo in metriche composte e
			// negli Sheets
			if (value.metric_type === 'composite' && value.formula.includes(metric.alias)) {
				// la metrica passata come argomento è utilizzata da una metrica composta
				result[key] = { name: value.alias, type: metric.type, metric_type: metric.metric_type };
			}
		}
	}
	return result;
}

/*
 * Creo una lista con gli elementi utilizzati da una
 * determinata metrica o filtro
 */
function setUsedElementsList(token) {
	const usedElements = checkUsage(token);
	ul__used_on_composite_metric.querySelectorAll('li').forEach(item => item.remove());
	if (usedElements) {
		// TODO: 18.07.2025 popolo la lista degli elementi utilizzati
		// Sono presenti elementi (metriche/sheets) utilizzati dall'elemento (metriche/filtri)
		// passato come argometnto
		for (const [elementToken, element] of Object.entries(usedElements)) {
			const content = template_li.content.cloneNode(true);
			const li = content.querySelector('li.default.icon');
			const i = li.querySelector('i');
			const span = li.querySelector('span');
			li.dataset.token = elementToken;
			span.innerText = element.name;
			// imposto l'icona in base al type dell'elemento in ciclo
			switch (element.type) {
				case 'sheet':
					i.innerText = 'flowsheet';
					i.dataset.type = 'sheet';
				break;
				case 'metric':
					i.innerText = 'multiline_chart';
					i.dataset.metricType = element.metric_type;
					break;
				default:
					// colonne custom
					i.innerText = 'table_rows';
			}
			ul__used_on_composite_metric.appendChild(li);
		}
	} else {
		// nessun elemento utilizzato da questa metrica
	}
}

