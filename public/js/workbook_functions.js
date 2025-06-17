console.info('workbook_functions');
// dialogs
const dlg__workbookNew = document.getElementById('dlg__workbook_new');
const dlg__workbookOpen = document.getElementById('dlg__workbook_open');
// buttons
const btn__workbookNew = document.getElementById('btn__workbook_new');
const btn__workbookCreate = document.getElementById('btn__workbook_create');
const btn__workbookOpenDialog = document.getElementById('btn__workbook_openDialog');
// inputs
const input__workbook_name = document.getElementById('input__workbook_name');
// titolo contenuto nella barra del menù
const input__workbook_title = document.getElementById('input__workbook_title');

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
	debugger;
	WorkBook.getInformations();
	// workBookInformations();
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

function workBookInformations() {
	debugger;
	document.querySelectorAll('#info>.info').forEach(info => info.hidden = true);
	if (WorkBook) {
		document.querySelector('#info.informations').classList.remove('none');
		for (const [key, value] of Object.entries(WorkBook.getInformations())) {
			const ref = document.getElementById(key);
			if (ref) {
				ref.hidden = false;
				const refContent = document.getElementById(`${key}_content`);
				refContent.textContent = value;
			}
		}
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
