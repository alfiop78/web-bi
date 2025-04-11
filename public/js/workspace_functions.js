console.info('workspace_functions');
let chartEditor = null;
// ho incluso, qui, i datatype di vertica a mysql :
// vertica : 'float', 'integer', 'numeric'
// mysql : 'decimal', 'int', 'double'
const numericDataType = ['float', 'integer', 'numeric', 'decimal', 'int', 'double'];
var popupSuggestions;
const sel = document.getSelection();
// utilizzate nel drag&drop .column-defined
var dragSrcEl = null;
var elementAt = null;
const i = document.createElement('i');
// span.className = 'bookmarkDrop';
i.className = 'material-symbols-rounded';
i.classList.add('md-24', 'warn', 'padding__none');
i.innerText = 'start';
var subsequentElements;

const rand = () => Math.random(0).toString(36).substring(2);
const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };


// INFO: replace current word (questo script era stato usato per sostituire la parola che si sta digitando con il suggerimento della popup)
// Replace current word with selected suggestion
/* const replaceCurrentWord = (textarea, newWord) => {
  const currentValue = textarea.value;
  const cursorPos = textarea.selectionStart;
  const startIndex = findIndexOfCurrentWord();

  const newValue = currentValue.substring(0, startIndex + 1) +
	newWord +
	currentValue.substring(cursorPos);
  textarea.value = newValue;
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = startIndex + 1 + newWord.length;
}; */

const findIndexOfCurrentWord = (textarea, caretPosition) => {
	// ottengo il valore corrente e la posizione del cursore
	const currentValue = textarea.firstChild.textContent;
	// const cursorPos = caretPosition;

	// Cerco l'indice di partenza della parola corrente...
	let startIndex = caretPosition - 1;
	// ... il ciclo cerca all'indietro dalla posizione corrente-1 (startIndex) fino a quando trova uno spazio
	// oppure il carattere di "a capo"
	while (startIndex >= 0 && !/\W/.test(currentValue[startIndex])) {
		startIndex--;
	}
	// lo startIndex corrisponde all'indice di inizio della parola corrente
	return startIndex;
};

/*
  * Tasto di salvataggio/aggiornamento filtro
  * sql : viene passato alla procedura .php che elabora il report
  * formula : è la formula scritta nella textarea, verrà utilizzata per ripristinarla nella textarea in case di edit
*/
function filterSave(e) {
	if (textareaFilter.firstChild.nodeType !== 3) return;
	const name = input__filter_name.value;
	// in edit recupero il token presente sul tasto
	const token = (e.target.dataset.token) ? e.target.dataset.token : rand().substring(0, 7);
	let tables = new Set();
	// const formula = textareaFilter.firstChild.textContent.split(' ');
	// separo ogni parola/elemento della formula con \b
	const formula = textareaFilter.firstChild.textContent.split(/\b/);
	const formulaJoined = textareaFilter.firstChild.textContent.split(/\b/).join('');
	// console.log(formula);
	// const formula = textareaFilter.firstChild.textContent.split(/\w+.(?=\.)/g);
	// estraggo dalla formula solo le tabelle, che devono essere convertite in alias
	// es.: Azienda.id, il regex estrae "Azienda", (prima del punto)
	const tablesFounded = textareaFilter.firstChild.textContent.match(/\w+.(?=\.)/g);
	const date = new Date().toLocaleDateString('it-IT', options);
	let object = { type: 'filter', name, token, tables: [], from: {}, joins: {}, formula: formulaJoined, SQL: [], workbook_ref: WorkBook.workBook.token, updated_at: date };
	// replico i nomi delle tabelle con i suoi alias di tabella, recuperandoli dalla ul#wbFilters
	object.SQL = formula.map(element => {
		if (tablesFounded.includes(element)) {
			// recupero l'alias della tabella che mi servirà per creare l'sql
			const alias = document.querySelector(`#wbFilters>details[data-table='${element}']`).dataset.alias;
			tables.add(alias);
			// const regex = new RegExp(`${element}`, 'i');
			return element.replace(new RegExp(`${element}`, 'i'), alias);
		} else {
			return element;
		}
	}).join('');
	// console.log(object.sql);
	// console.log(object.formula);
	// converto l'oggetto Set() tables in un array
	object.tables = [...tables];

	for (const factId of WorkBook.dataModel.keys()) {
		// WARN: 2024.02.08 questa logica è utilizzata anche in setSheet(). Creare un metodo riutilizzabile.
		object.from[factId] = {};
		object.joins[factId] = {};
		// object.tables : l'alias della tabella
		object.tables.forEach(alias => {
			const tablesOfModel = WorkBook.dataModel.get(factId);
			if (tablesOfModel.hasOwnProperty(alias)) {
				tablesOfModel[alias].forEach(table => {
					const data = Draw.tables.get(table.id);
					// 'from' del filtro, questo indica quali tabelle includere quando si utilizza
					// questo filtro nel report
					object.from[factId][data.alias] = { schema: data.schema, table: data.table };
					// 'join', indica quali join utilizzare quando si utilizza questo filtro in un report
					if (WorkBook.joins.has(data.alias)) {
						// esiste una join per questa tabella
						for (const [token, join] of Object.entries(WorkBook.joins.get(data.alias))) {
							if (join.factId === factId) object.joins[factId][token] = join;
						}
					}
				});
			}
		});
	}

	// la prop 'created_at' va aggiunta solo in fase di nuovo filtro e non quando si aggiorna il filtro
	if (e.target.dataset.token) {
		// aggiornamento del filtro
		// recupero il filtro dallo storage per leggere 'created_at'
		const filter = JSON.parse(window.localStorage.getItem(e.target.dataset.token));
		object.created_at = filter.created_at;
	} else {
		object.created_at = date;
	}
	// Salvataggio del Filtro
	WorkBook.filters = { token, value: object };
	window.localStorage.setItem(token, JSON.stringify(WorkBook.filters.get(token)));
	// completato il salvataggio rimuovo l'attributo data-token da e.target
	if (!e.target.dataset.token) {
		appendFilter(token);
		input__filter_name.value = '';
		input__filter_name.focus();
	} else {
		// filtro modificato, aggiorno solo il nome eventualmente modificato
		// NOTE: il querySelector() non gestisce gli id che iniziano con un numero, per questo motivo utilizzo getElementById() in questo caso
		const li = document.querySelector(`li[data-id='${token}']`);
		const dragIcon = li.querySelector('i');
		const span = li.querySelector('span');
		li.dataset.label = name;
		dragIcon.dataset.label = name;
		span.textContent = name;
		dlg__filters.close();
	}
	// ripulisco la textarea eliminando solo il nodo #text, lascio il <br />
	if (textareaFilter.firstChild.nodeType === 3) textareaFilter.firstChild.remove();
	delete e.target.dataset.token;
	document.getElementById('filter-note').value = '';
	App.showConsole(`Nuovo filtro aggiunto al WorkBook: ${name}`, 'done', 2000);
}

function columnSave(e) {
	console.log(WorkBook.activeTable);
	debugger;
	if (textarea__custom_column.firstChild.nodeType !== 3) return;
	const input = document.getElementById('input__column_name');
	const name = input.value;
	// in edit recupero il token presente sul tasto
	const token_string = WorkBook.activeTable.id.substring(WorkBook.activeTable.id.length - 5);
	const generated_token = rand().substring(0, 7);
	const token = (e.target.dataset.token) ? e.target.dataset.token : `__${token_string}_${generated_token}`;
	let tables = new Set();
	// separo ogni parola/elemento della formula con \b
	// const formula_ = textarea__custom_column.firstChild.textContent.split(/\b/);
	// const formulaJoined_ = textarea__custom_column.firstChild.textContent.split(/\b/).join('');
	const formula = textarea__custom_column.firstChild.parentNode.innerText.split(/\b/);
	const formulaJoined = textarea__custom_column.firstChild.parentNode.innerText.split(/\b/).join('');
	// console.log(formula);
	// estraggo dalla formula solo le tabelle, che devono essere convertite in alias
	// es.: Azienda.id, il regex estrae "Azienda", (prima del punto)
	const tablesFounded = textarea__custom_column.firstChild.textContent.match(/\w+.(?=\.)/g);
	// console.log(WorkBook.activeTable);
	let object = {
		token,
		type: 'column',
		name,
		tableId: WorkBook.activeTable.id,
		table: WorkBook.activeTable.dataset.table,
		tableAlias: WorkBook.activeTable.dataset.alias,
		schema: WorkBook.activeTable.dataset.schema,
		cssClass: 'custom',
		datatype: 'varchar',
		tables: [],
		formula: formulaJoined,
		SQL: []
	};
	// replico i nomi delle tabelle con i suoi alias di tabella, recuperandoli dalla ul#wbColumns
	object.SQL = formula.map(element => {
		if (tablesFounded) {
			if (tablesFounded.includes(element)) {
				// recupero l'alias della tabella che mi servirà per creare l'sql
				const alias = document.querySelector(`#wbColumns>details[data-table='${element}']`).dataset.alias;
				tables.add(alias);
				// const regex = new RegExp(`${ element } `, 'i');
				return element.replace(new RegExp(`${element}`, 'i'), alias);
			} else {
				return element;
			}
		} else {
			return element;
		}
	}).join('');
	console.log(object.SQL);
	console.log(object.formula);
	// converto l'oggetto Set() tables in un array e lo aggiungo a object.tables
	debugger;
	object.tables = [...tables];
	// TODO: 22.11.2024 logica utilizzata per i filtri, quando sono utilizzate colonne provenienti da diverse tabelle.
	// Valutare se applicarla anche per le colonne
	/* for (const factId of WorkBook.dataModel.keys()) {
	  // WARN: 2024.02.08 questa logica è utilizzata anche in setSheet(). Creare un metodo riutilizzabile.
	  object.from[factId] = {};
	  object.joins[factId] = {};
	  // object.tables : l'alias della tabella
	  object.tables.forEach(alias => {
		const tablesOfModel = WorkBook.dataModel.get(factId);
		if (tablesOfModel.hasOwnProperty(alias)) {
		  tablesOfModel[alias].forEach(table => {
			const data = Draw.tables.get(table.id);
			// 'from' del filtro, questo indica quali tabelle includere quando si utilizza
			// questo filtro nel report
			object.from[factId][data.alias] = { schema: data.schema, table: data.table };
			// 'join', indica quali join utilizzare quando si utilizza questo filtro in un report
			if (WorkBook.joins.has(data.alias)) {
			  // esiste una join per questa tabella
			  for (const [token, join] of Object.entries(WorkBook.joins.get(data.alias))) {
				if (join.factId === factId) object.joins[factId][token] = join;
			  }
			}
		  });
		}
	  });
	} */

	// il workBook è stato modificato
	WorkBook.checkChanges(token);
	// TODO: 22.11.2024 aggiornare il WorkBook
	WorkBook.elements = object;
	// TODO: 22.11.2024 da valutare se è utilizzato
	// WorkBook.fields = object;
	WorkBook.workSheet[token] = object;
	WorkBook.update();
	// completato il salvataggio rimuovo l'attributo data-token da e.target
	if (!e.target.dataset.token) {
		appendColumn(token);
		input.value = '';
		input.focus();
	} else {
		// colonna modificata, aggiorno solo il nome eventualmente modificato
		// NOTE: il querySelector() non gestisce gli id che iniziano con un numero, per questo motivo utilizzo getElementById() in questo caso
		const li = document.querySelector(`li[data-id='${token}']`);
		const dragIcon = li.querySelector('i[draggable]');
		const span = li.querySelector('.span__content>span');
		li.dataset.label = name;
		dragIcon.dataset.label = name;
		span.textContent = name;
		dlg__custom_columns.close();
	}
	// ripulisco la textarea eliminando solo il nodo #text, lascio il <br />
	if (textareaFilter.firstChild.nodeType === 3) textareaFilter.firstChild.remove();
	delete e.target.dataset.token;
	// document.getElementById('filter-note').value = '';
	App.showConsole(`Colonna <b>${name}</b> aggiunta al WorkBook`, 'done', 2000);
}

btnToggle_table__content.onclick = (e) => {
	const table__content = document.getElementById('table__content');
	table__content.toggleAttribute('open');
	e.target.innerText = (table__content.hasAttribute('open')) ? 'arrow_menu_close' : 'arrow_menu_open';
}

// rimuovo il filtro aggiunto allo Sheet
function removeFilterFromSheet(e) {
	const token = e.target.dataset.filterToken;
	const filter = document.querySelector(`.filter-defined[data-id='${token}']`);
	debugger;
	if (filter.dataset.adding || (filter.dataset.added && !Sheet.edit)) {
		// quando il filtro ha attr data-adding oppure quando ha data-added e lo Sheet NON è in edit lo elimino
		filter.remove();
		// ripristino (#ul-filters) il filtro eliminato dal report
		const li__addedFilter = document.querySelector(`ul.filters>li.added[data-id='${token}']`);
		li__addedFilter.classList.remove('added');
		const btnAddFilter = document.getElementById(token);
		btnAddFilter.removeAttribute('disabled');
	} else {
		// Sheet.removeObject(filter, token);
		debugger;
		filter.dataset.removed = 'true';
		Sheet.objectRemoved.set(token, token);
	}
	Sheet.filters.delete(token);
}

function undoRemovedFilter(e) {
	const token = e.target.dataset.filterToken;
	// Recupero, da Sheet.removedFilters, gli elementi rimossi per poterli ripristinare
	if (Sheet.objectRemoved.has(token)) {
		delete document.querySelector(`.filter-defined[data-id='${token}']`).dataset.removed;
		const li__selected = document.querySelector(`ul.filters>li[data-id='${token}']`);
		li__selected.classList.add('added');
		Sheet.objectRemoved.delete(token);
		Sheet.filters = token;
	}
}

// selezione di un filtro da aggiungere allo Sheet
function filterSelected(e) {
	// console.log(e.target);
	// aggiungo, sulla <li> del filtro selezionato, la class 'added' per evidenziare che il filtro
	// è stato aggiunto al report, non può essere aggiunto di nuovo.
	const li__selected = document.querySelector(`ul.filters>li[data-id='${e.target.id}']`);
	li__selected.classList.add('added');
	Sheet.filters = e.target.id;
	addTemplateFilter(e.target.id);
	// se nella #ul-filters-sheet è presente 1 elemento apro il table__content, in questo modo si evidenzia il fatto
	// che ho aggiunto un filtro al report
	const table__content = document.getElementById('table__content');
	if (document.querySelector('#ul-filters-sheet>li').childElementCount >= 1) table__content.setAttribute('open', 'true');
	btnToggle_table__content.innerText = (table__content.hasAttribute('open')) ? 'arrow_menu_close' : 'arrow_menu_open';
}

// INFO: implementazione del dragdrop per gli elementi .defined
function handleDragStart(e) {
	// console.log('handleDragStart : ', this);
	// console.log('handleDragStart : ', e.target);
	// console.log('handleDragStart : ', e.currentTarget);
	// TEST: creazione elemento da mostrare durante il drag
	/* const clone = this.cloneNode(true);
	clone.innerText = 'test';
	clone.style.position = 'absolute';
	clone.style.top = '10px';
	document.body.appendChild(clone);
	e.dataTransfer.setDragImage(clone, 0, 0); */
	// const span = document.createElement('span');
	/* const span = this.cloneNode(true);
	span.innerText = 'TEST';
	span.style.position = 'absolute';
	span.style.top = '10px';
	span.style.padding = '4px';
	span.style.backgroundColor = 'blue';
	span.style.color = 'white';
	this.parentElement.appendChild(span);
	e.dataTransfer.setDragImage(span, 0, 0); */
	// END TEST: creazione elemento da mostrare durante il drag

	this.style.opacity = '0.2';
	dragSrcEl = this;
	e.dataTransfer.effectAllowed = 'move';
	(this.id) ? e.dataTransfer.setData('text/plain', this.id) : e.dataTransfer.setData('text/plain', this.dataset.id);
	// e.dataTransfer.setData('text/plain', this.id);
	// aggiungo la cssClass pointer__none per impostare pointer-events: none sugli elementi child di .column-defined.box
	// in questo modo, in handleDragOver, quando il mouse passa su questi elementi non vengono presi in considerazione da elementFromPoint
	document.querySelectorAll('.defined_contents').forEach(item => item.classList.add('pointer__none'));
}

// over all'interno di #dropzone-rows
function handleDragOver(e) {
	if (e.preventDefault) e.preventDefault();
	// console.log(this);
	elementAt = document.elementFromPoint(e.clientX, e.clientY);
	subsequentElements = document.elementFromPoint(e.clientX, e.clientY);
	// console.log(elementAt);
	if (elementAt.classList.contains('box')) {
		// .column-defined.box
		// fino a quando elementAt ha un elemento successivo, sposto tutti di 20px left con la cssClass .diff
		if (dragSrcEl !== elementAt) {
			while (subsequentElements.nextElementSibling) {
				subsequentElements.nextElementSibling.classList.add('diff');
				subsequentElements = subsequentElements.nextElementSibling;
			}
		}
		// se il mouse si trova sullo stesso elemento (elementAt === dragSrcEl) non visualizzo lo span
		if (dragSrcEl !== elementAt) elementAt.before(i);
	} else {
		// .dropzone
		(elementAt.classList.contains('dropzone')) ? elementAt.classList.add('dropping') : elementAt.classList.remove('dropping');
		// aggiungo l'elemento draggato come ultimo elemento della dropzone
		if (elementAt.classList.contains('dropzone')) elementAt.appendChild(i);
	}
	e.dataTransfer.dropEffect = 'move';

	return false;
}

function handleDragEnter(e) {
	e.preventDefault();
	// console.log('drageneter');
	// console.log(this, dragSrcEl);
	// this.classList.add('over');
	// console.info('dragEnter', this);
	if (this !== dragSrcEl) this.classList.add('over');
}

// applicato all'elemento .box (riga / colonna già definita nella dropzone)
function handleDragLeave(e) {
	e.preventDefault();
	// console.info('dragLeave', this);
	this.classList.remove('over');
	this.parentElement.querySelectorAll('.diff').forEach(el => el.classList.remove('diff'));
}

// valida sia per #dropzone-rows che per #dropzone-columns
function handleDropzoneDragLeave(e) {
	e.preventDefault();
	i?.remove();
	this.classList.remove('dropping');
}

// aggiungo l'elemento droppato #dropzone-rows
function createColumnDefined(token) {
	const template = template__columnDefined.content.cloneNode(true);
	const field = template.querySelector('.defined');
	const code = field.querySelector('code');
	const btnRemove = field.querySelector('button[data-remove]');
	const btnUndo = field.querySelector('button[data-undo]');
	field.dataset.label = Sheet.fields.get(token).name;
	field.addEventListener('dragstart', handleDragStart, false);
	field.addEventListener('dragenter', handleDragEnter, false);
	field.addEventListener('dragleave', handleDragLeave, false);
	field.addEventListener('dragend', handleDragEnd, false);
	field.dataset.id = token;
	// if (!Sheet.edit) field.dataset.added = 'true';
	// In edit:true imposto il dataset.adding altrimenti dataset.added
	(!Sheet.edit) ? field.dataset.added = 'true' : field.dataset.adding = 'true';
	btnRemove.dataset.columnToken = token;
	btnRemove.dataset.label = Sheet.fields.get(token).name;
	btnUndo.dataset.columnToken = token;
	// field.dataset.token = elementRef.id;
	code.dataset.token = token;
	code.innerText = Sheet.fields.get(token).name;
	// aggiungo a Sheet.fields solo le proprietà utili alla creazione della query
	Sheet.tables = WorkBook.elements.get(token).tableAlias;
	return field;
}

// aggiungo l'elemento alla #dropzone-columns
function createMetricDefined(token) {
	const template = template__metricDefined.content.cloneNode(true);
	const field = template.querySelector('.defined');
	const aggregateFn = field.querySelector('code[data-aggregate]');
	const code = field.querySelector('code[data-field]');
	const btnRemove = field.querySelector('button[data-remove]');
	const btnUndo = field.querySelector('button[data-undo]');
	const metric = Sheet.metrics.get(token);
	field.dataset.id = token;
	field.dataset.type = metric.type;
	field.dataset.label = metric.alias;
	// TODO: 25.11.2024 Al momento disabilito il dragstar per le metriche perchè è da implementare
	field.addEventListener('dragstart', handleDragStart, false);
	field.addEventListener('dragenter', handleDragEnter, false);
	field.addEventListener('dragleave', handleDragLeave, false);
	field.addEventListener('dragend', handleDragEnd, false);
	aggregateFn.dataset.metricId = metric.token;
	aggregateFn.dataset.aggregate = metric.aggregateFn;
	// Se lo Sheet è in modifica imposto il dataset 'added'
	(!Sheet.edit) ? field.dataset.added = 'true' : field.dataset.adding = 'true';
	code.innerText = metric.alias;
	code.dataset.token = token;
	code.dataset.field = metric.alias;
	btnRemove.dataset.metricToken = token;
	btnUndo.dataset.metricToken = token;
	// TODO: code.addEventListener("input", app.editMetricAlias);
	if (metric.metric_type !== 'composite') aggregateFn.innerText = metric.aggregateFn;
	// imposto le fact da utilizzare nel report in base alle metriche da calcolare
	// le metriche composte non hanno il factId
	if (metric.factId) Sheet.fact.add(metric.factId);
	return field;
}

// drop nella #dropzone-rows
function handleRowDrop(e) {
	// WARN: impostare un debugger in questa Fn non "accende" l'evento handleDragEnd. Quando si vuole analizzare
	// in debug, meglio aggiungerlo in handleDragEnd
	if (e.stopPropagation) e.stopPropagation();
	e.preventDefault();
	// console.log('DROP : ',elementAt);
	// debugger;
	// TODO: commentare il codice (testato su example_collection)
	// recupero le informazioni (dataset) riguardo l'elemento droppato per poter creare il .column-defined che andrà posizionato nella #dropzone-rows
	const token = e.dataTransfer.getData('text/plain');
	// se il dataset.id è già presente sull'elemento che sto droppando significa che sto spostando un div .column-defined.box che era già stato
	// droppato (colonna già droppata)
	const element = WorkBook.elements.get(token);
	console.log(element);
	Sheet.fields = {
		token,
		SQL: element.SQL,
		name: (Sheet.fields.has(token)) ? Sheet.fields.get(token).name : element.name,
		datatype: element.datatype,
		time: (element.time) ? { table: element.table } : false
	};
	if (!dragSrcEl.dataset.id) dragSrcEl = createColumnDefined(token);
	dragSrcEl.classList.add('box');
	elementAt.classList.remove('over');
	i.after(dragSrcEl);
	i?.remove();
	this.querySelectorAll('.diff').forEach(el => el.classList.remove('diff'));
	this.classList.remove('dropping');
	// TODO: 20.11.2024 controllo se il nome colonna aggiunta è già presente nello Sheet
}

// drop nella #dropzone-columns
function handleColumnDrop(e) {
	if (e.stopPropagation) e.stopPropagation();
	e.preventDefault();
	const token = e.dataTransfer.getData('text/plain');
	console.log('drop : ', token);
	const element = WorkBook.elements.get(token);
	if (element.type === 'metric') {
		// template per le metriche
		switch (element.metric_type) {
			case 'composite':
				Sheet.metrics = {
					token: element.token,
					alias: element.alias,
					SQL: element.SQL,
					type: element.metric_type,
					metrics: element.metrics,
					dependencies: false
				};
				if (!dragSrcEl.dataset.id) dragSrcEl = createMetricDefined(token);
				// dopo aver aggiunto una metrica composta allo Sheet, bisogna aggiungere anche le metriche
				// ...al suo interno per consentirne l'elaborazione
				// for (const metricToken of Object.keys(Sheet.metrics.get(element.token).metrics)) {
				Sheet.metrics.get(element.token).metrics.forEach(metricToken => {
					// nell'oggetto Sheet.metrics aggiungo una prop 'dependencies' per specificare
					// ... che questa metrica è stata aggiunta perchè è all'interno di una metrica composta
					// verifico se la metrica all'interno di quella composta è stata già aggiunta allo Sheet
					if (!Sheet.metrics.has(metricToken)) {
						// la metrica in ciclo non è stata aggiunta allo Sheet, la aggiungo con la prop 'dependencies'
						//... per specificare che è stata aggiunta indirettamente, essa si trova in una metrica composta
						// NOTE: clonazione di un object con syntax ES6.
						const nestedMetric = { ...WorkBook.elements.get(metricToken) };
						// debugger;
						Sheet.metrics = {
							token: nestedMetric.token,
							factId: nestedMetric.factId,
							alias: nestedMetric.alias,
							SQL: nestedMetric.SQL,
							type: nestedMetric.metric_type,
							aggregateFn: nestedMetric.aggregateFn,
							distinct: nestedMetric.distinct,
							dependencies: true
						};
					}
				});
				// }
				break;
			default:
				// basic, advanced
				Sheet.metrics = {
					token: element.token,
					factId: element.factId,
					alias: element.alias,
					SQL: element.SQL,
					distinct: element.distinct,
					type: element.metric_type,
					aggregateFn: element.aggregateFn,
					dependencies: false
				};
				if (!dragSrcEl.dataset.id) dragSrcEl = createMetricDefined(token);
				// app.addMetric(e.currentTarget, elementRef.id);
				// 26.07.2024 verifico, se nello Sheet, è presente una metrica con lo stesso nome
				// In caso positivo devo mostrare una dialog per poter modificare il nome della metrica, il nome
				// verrà modificato SOLO per questo Sheet e non nel WorkBook
				// Questo controllo è aggiunto dopo addMetric in modo da poter impostare il focus sull'elemento
				// già presente nel DOM.
				// FIX: 21.11.2024 commentato temporaneamente dopo lo spostamento di app.columnDrop a questa Fn, da riattivare
				/* if (Sheet.checkMetricNames(metric.token, metric.alias)) {
				  App.showConsole("Sono presenti Metriche con nomi uguali, rinominare la metrica", "error", 2500);
				  // imposto il cursore nel <code> da modificare
				  document.querySelector(`.metric-defined>code[data-token='${token}']`).focus({ focusVisible: true });
				  e.currentTarget.dataset.error = true;
				} */
				break;
		}
	} else {
		// WARN: column, attualmente non gestita
		App.showConsole('Funzionalità non ancora gestita', 'warning', 2000);
		return;
	}
	// se il dataset.id è già presente sull'elemento che sto droppando significa che sto spostando un div .column-defined.box che era già stato
	// droppato (colonna già droppata)
	dragSrcEl.classList.add('box');
	elementAt.classList.remove('over');
	i.after(dragSrcEl);
	i?.remove();
	this.querySelectorAll('.diff').forEach(el => el.classList.remove('diff'));
	this.classList.remove('dropping');
}

function handleDragEnd(e) {
	console.log('handleDragEnd : ', e.target)
	this.style.opacity = '1';
	// console.info('dragEnd', this);
	document.querySelectorAll('.defined_contents').forEach(item => item.classList.remove('pointer__none'));
	document.querySelectorAll('.dropzone>div').forEach(item => item.classList.remove('over'));
	// Imposto un data-modified su e.target per contrassegnare lo Sheet come "modificato", quindi verranno salvate le modifiche
	e.target.dataset.modified = true;
	// ogni elemento droppato viene posizionato alla fine dell'oggetto Map Sheet.fields perchè il Map() conserva l'ordine
	// di inserimento. L'ordine di inserimento contenuto in Sheet.fields non corrisponde agli elementi aggiunti col drag&drop perchè questi
	// possono essere spostati.
	// Quindi pulisco Sheet.fields e lo ricreo in base all'ordine rappresentato nel DOM #dropzone-rows

	// NOTE: clonazione Map()
	const fieldsClone = new Map(Sheet.fields);
	Sheet.fields.clear();
	document.querySelectorAll('.column-defined.defined:not([data-removed])').forEach(field => {
		if (!fieldsClone.has(field.dataset.id)) return;
		Sheet.fields = {
			token: field.dataset.id,
			name: fieldsClone.get(field.dataset.id).name,
			SQL: fieldsClone.get(field.dataset.id).SQL,
			time: fieldsClone.get(field.dataset.id).time,
			datatype: fieldsClone.get(field.dataset.id).datatype
		}
	});
	console.info('Sheet.fields in handleDragEnd : ', Sheet.fields);
	// 27.11.2024 Riordino Sheet.metrics
	// NOTE: clonazione Map()
	const metricsClone = new Map(Sheet.metrics);
	Sheet.metrics.clear();
	// console.log(metricsClone);
	document.querySelectorAll('.metric-defined.defined:not([data-removed])').forEach(metric => {
		if (!metricsClone.has(metric.dataset.id)) return;
		if (metricsClone.get(metric.dataset.id).type === 'composite') {
			// recupero le metriche che la compongono
			metricsClone.get(metric.dataset.id).metrics.forEach(token => {
				// se la metrica ha dependencies = false significa che è inclusa in questo ciclo, quindi verrà
				// aggiunta comunque, adesso la aggiungo solo se ha dependencies = true altrimenti l'ordine
				// degli elementi nel DOM non corrisponde
				if (metricsClone.get(token).dependencies) Sheet.metrics = metricsClone.get(token);
			});
		}
		Sheet.metrics = metricsClone.get(metric.dataset.id);
	});
	console.info('metrics dopo il drop : ', Sheet.metrics);
}

// INFO: implementazione del dragdrop per gli elementi .defined

// aggiunta del filtro alla sezione #ul-filters-sheet
function addTemplateFilter(token) {
	const parent = document.getElementById('ul-filters-sheet');
	const elementRef = document.getElementById(token);
	elementRef.setAttribute('disabled', 'true');
	const tmpl = template_li.content.cloneNode(true);
	const li = tmpl.querySelector('li.added-list');
	const span = li.querySelector('span');
	const btnRemove = li.querySelector('button[data-remove]');
	const btnUndo = li.querySelector('button[data-undo]');
	li.dataset.type = 'filter';
	li.dataset.id = elementRef.id;
	(!Sheet.edit) ? li.dataset.added = 'true' : li.dataset.adding = 'true';
	btnRemove.dataset.filterToken = elementRef.id;
	btnRemove.addEventListener('click', removeFilterFromSheet);
	btnUndo.dataset.filterToken = elementRef.id;
	btnUndo.addEventListener('click', undoRemovedFilter);
	span.dataset.token = elementRef.id;
	span.innerHTML = elementRef.dataset.label;
	parent.appendChild(li);
}

/*
 * Creazione elenco colonne nella ##workbook-objects
 * Viene invocata quando si Salva una nuova colonna custom
 * e quando si costruisce l'elenco in #workbook-objects
 * TODO: 31.01.2025 al momento non viene utilizzata nella costruzione del #workbook-objects
 * ma solo in fase di creazione nuova metrica
*/
function appendColumn(token) {
	// creo la <li> per la nuova colonna dopo l'ultima colonna "originale" della tabella
	console.log(WorkBook.activeTable);
	// riferimento all'ultima colonna (:last-child), il nuovo elemento verrà aggiunto dopo l'ultima colonna
	// NOTE: :has https://developer.mozilla.org/en-US/docs/Web/CSS/:has#syntax
	const lastElement = document.querySelector(`#nav-fields>details[data-fact-id='${WorkBook.activeTable.id}']>li.columns:has(+ li:not(.columns))`);
	console.log(lastElement);
	const tmpl = template_li.content.cloneNode(true);
	const li = tmpl.querySelector('li.drag-list.columns');
	const span__content = li.querySelector('.span__content');
	const span = span__content.querySelector('span');
	const i = span__content.querySelector('i[draggable]');
	const value = WorkBook.elements.get(token);
	// const filter = WorkBook.filters.get(token);
	li.dataset.id = token;
	i.id = token;
	li.classList.add("columns");
	li.dataset.elementSearch = "elements";
	// TODO: rivedere la descrizione da far comparire per le colonne e colonne custom
	li.dataset.label = value.name;
	li.dataset.schema = value.schema;
	li.dataset.table = value.table;
	li.dataset.alias = value.tableAlias;
	li.dataset.field = value.name;
	// proprietà dei custom column
	li.classList.add(value.cssClass);
	li.dataset.contextmenu = 'ul__contextmenu_custom_column';
	li.addEventListener('contextmenu', openContextMenu);
	i.addEventListener('dragstart', handleDragStart);
	i.addEventListener('dragend', handleDragEnd);
	i.addEventListener('dragenter', handleDragEnter);
	i.addEventListener('dragleave', handleDragLeave);
	span.innerText = value.name;
	lastElement.after(li);
}

/*
 * Creazione elenco filtri nella #ul-filters
 * Viene invocata quando si Salva un nuovo filtro e
 * quando si costruisce l'elenco #ul-filters
*/
function appendFilter(token) {
	const parent = document.getElementById('ul-filters');
	const tmpl = template_li.content.cloneNode(true);
	// const li = tmpl.querySelector('li.drag-list.filters');
	const li = tmpl.querySelector('li.toggle-list');
	const span = li.querySelector('span');
	const btnAdd = li.querySelector("button[data-id='filter__add']");
	const filter = WorkBook.filters.get(token);
	li.dataset.id = token;
	btnAdd.id = token;
	btnAdd.dataset.type = "filter";
	btnAdd.dataset.label = filter.name;
	// li.classList.add("filters");
	li.dataset.elementSearch = "filters";
	li.dataset.label = filter.name;
	// definisco quale context-menu-template apre questo elemento
	li.dataset.contextmenu = 'ul-context-menu-filter';
	btnAdd.addEventListener('click', filterSelected);
	li.addEventListener('contextmenu', openContextMenu);
	span.innerHTML = filter.name;
	parent.appendChild(li);
}

function appendFilterToDialogAdvMetrics() {
	const parent = document.getElementById('id__ul_filters');
	// reset della #id__ul_filters
	parent.querySelectorAll('li').forEach(element => element.remove());
	for (const [token, filter] of WorkBook.filters) {
		const tmpl = template_li.content.cloneNode(true);
		// const li = tmpl.querySelector('li.drag-list.filters');
		const li = tmpl.querySelector('li.toggle-list');
		const span = li.querySelector('span');
		const btnAdd = li.querySelector("button[data-id='filter__add']");
		// const filter = WorkBook.filters.get(key);
		li.dataset.id = token;
		btnAdd.dataset.id = token;
		btnAdd.dataset.type = "filter";
		btnAdd.dataset.label = filter.name;
		// li.classList.add("filters");
		li.dataset.elementSearch = 'search__filters_dlg_advanced_metric';
		li.dataset.label = filter.name;
		btnAdd.addEventListener('click', addToMetric); // TODO: creare la Fn addToMetric()
		span.innerText = filter.name;
		parent.appendChild(li);
	}
}

function removeFilterByAdvancedMetric(e) {
	// riabilito il filtro da #id__ul_filters
	e.currentTarget.parentElement.remove();
	const li = document.querySelector(`#id__ul_filters>li[data-id='${e.currentTarget.dataset.token}']`);
	const btnAdd = document.querySelector(`#id__ul_filters>li>button[data-id='${e.currentTarget.dataset.token}']`);
	li.classList.toggle('added');
	btnAdd.removeAttribute('disabled');
}

// invocata anche da app.editAdvancedMetric() oltre che da addToMetric()
function addFilterToMetric(token) {
	const parent = document.getElementById('filter-drop'); // TODO: rinominare in ul__filter_drop
	const template = template__filterDropped.content.cloneNode(true);
	const li = template.querySelector('li');
	const span = li.querySelector('span');
	const btnRemove = li.querySelector('button');
	li.dataset.token = token;
	span.innerText = WorkBook.filters.get(token).name;
	btnRemove.dataset.token = token;
	btnRemove.addEventListener('click', removeFilterByAdvancedMetric);
	parent.appendChild(li);
}

// aggiunta filtro alla metrica avanzata
function addToMetric(e) {
	addFilterToMetric(e.currentTarget.dataset.id);
	// 2024.11.13 - L'elemento aggiunto a #filter-drop deve essere disabilitato da questa
	// ul (#id__ul_filters) in modo da evitare di aggiungerla per più di una volta alla metrica
	e.currentTarget.setAttribute('disabled', 'true');
	// imposto una cssClass .added per evidenziare che il filtro è stato già aggiunto alla metrica
	e.currentTarget.parentElement.classList.add('added');
}

// aggiungo la metrica advanced/composite alla strutturaa #workbook-objects
// OPTIMIZE: 22.11.2024 questa Fn è simile a appendCustomMetric(), alcune parti possono essere scritte in una Fn separata, oppure in un modulo che esporta
// alcuni elementi ripetuti, in questo caso la creazione del template
function appendMetric(parent, token) {
	// const metric = WorkBook.metris.get(token);
	const metric = WorkBook.elements.get(token);
	const referenceElement = document.querySelector(`#${metric.factId}_new_metric`);
	const tmpl = template_li.content.cloneNode(true);
	const li = tmpl.querySelector(`li.drag-list.metrics.${metric.metric_type}`);
	const span__content = li.querySelector('.span__content');
	const span = span__content.querySelector('span');
	const i = span__content.querySelector('i[draggable]');
	li.dataset.id = token;
	i.id = token;
	li.dataset.type = metric.metric_type;
	li.dataset.elementSearch = 'elements';
	if (metric.metric_type !== 'composite') li.dataset.factId = parent.dataset.factId;
	li.dataset.label = metric.alias;
	// definisco quale context-menu-template apre questo elemento
	li.dataset.contextmenu = `ul-context-menu-${metric.metric_type}`;
	// i.addEventListener('dragstart', elementDragStart);
	// i.addEventListener('dragend', elementDragEnd);
	i.addEventListener('dragstart', handleDragStart);
	i.addEventListener('dragend', handleDragEnd);
	li.addEventListener('contextmenu', openContextMenu);
	span.innerText = metric.alias;
	referenceElement.before(li);
}

// OPTIMIZE: 22.11.2024 questo metodo è uguale a appendMetric() da ottimizzare
function appendCompositeMetric(token) {
	const parent = document.getElementById('ul-metrics');
	const metric = WorkBook.elements.get(token);
	// const metric = WorkBook.metrics.get(token);
	const tmpl = template_li.content.cloneNode(true);
	const li = tmpl.querySelector(`li.drag-list.metrics.${metric.metric_type}`);
	const span__content = li.querySelector('.span__content');
	const span = span__content.querySelector('span');
	const i = span__content.querySelector('i[draggable]');
	li.dataset.id = token;
	i.id = token;
	li.dataset.type = metric.metric_type;
	li.dataset.elementSearch = 'elements';
	if (metric.metric_type !== 'composite') li.dataset.factId = parent.dataset.factId;
	li.dataset.label = metric.alias;
	// definisco quale context-menu-template apre questo elemento
	li.dataset.contextmenu = `ul-context-menu-${metric.metric_type}`;
	i.addEventListener('dragstart', handleDragStart);
	i.addEventListener('dragend', handleDragEnd);
	li.addEventListener('contextmenu', openContextMenu);
	span.innerText = metric.alias;
	parent.appendChild(li);
}

// NOTE: funzioni Drag&Drop

function elementDragStart(e) {
	// console.log('column drag start');
	console.log(e.currentTarget);
	// console.log('e.target : ', e.target.id);
	e.target.classList.add('dragging');
	e.dataTransfer.setData('text/plain', e.target.id);
	// console.log(e.dataTransfer);
	e.dataTransfer.effectAllowed = "copy";
}

function elementDragEnd(e) {
	e.preventDefault();
	// if (e.dataTransfer.dropEffect === 'copy') {}
	e.currentTarget.classList.remove('dropping');
}

// NOTE: end funzioni Drag&Drop

function openContextMenu(e) {
	e.preventDefault();
	// console.log(e.target.id);
	console.log(e.currentTarget.id);
	console.log(e.currentTarget.dataset.id);
	// reset #context-menu
	if (contextMenuRef.hasChildNodes()) contextMenuRef.querySelector('*').remove();
	const tmpl = tmplContextMenu.content.cloneNode(true);
	const content = tmpl.querySelector(`#${e.currentTarget.dataset.contextmenu}`);
	// aggiungo, a tutti gli elementi del context-menu, il token dell'elemento selezionato
	content.querySelectorAll('button').forEach(button => {
		// button.dataset.token = e.currentTarget.id;
		button.dataset.token = e.currentTarget.dataset.id;
		// if (button.dataset.button === 'delete' && Sheet.edit) button.disabled = 'true';
	});
	contextMenuRef.appendChild(content);

	const { clientX: mouseX, clientY: mouseY } = e;
	contextMenuRef.style.top = `${mouseY}px`;
	contextMenuRef.style.left = `${mouseX}px`;
	contextMenuRef.toggleAttribute('open');
}

function openDialogFilter() {
	createTableStruct(wbFilters);
	dlg__filters.showModal();
}

dlg__filters.addEventListener('close', () => {
	// console.log('close');
	// reset della textarea, input, note
	// effettuo un controllo sul firstChild perchè la textarea viene ripulita anche quando si
	// salva un filtro, in quel caso, qui, non viene trovato il firstChild
	input__filter_name.value = '';
	textareaFilter.firstChild?.remove();
	wbColumns.querySelectorAll('details').forEach(element => element.remove());
});

function closeDialogCustomColumn() {
	input__column_name.value = '';
	textarea__custom_column.firstChild?.remove();
	// ripulisco la struttura se presente
	wbColumns.querySelectorAll('details').forEach(element => element.remove());
}

dlg__composite_metric.addEventListener('close', () => textarea__composite_metric.firstChild?.remove());

dlgCustomMetric.addEventListener('close', () => textareaCustomMetric.firstChild?.remove());

// elementi della dialog filters
// WARN: codice molto simile a app.addTableStruct, da ottimizzare
function createTableStruct(parent) {
	for (const [alias, objects] of WorkBook.workbookMap) {
		const tmpl = tmplDetails.content.cloneNode(true);
		const details = tmpl.querySelector("details");
		const summary = details.querySelector('summary');
		WorkBook.activeTable = objects.props.key;
		// recupero le tabelle dal sessionStorage
		const columns = WorkBookStorage.getTable(objects.props.table);
		details.setAttribute("name", "wbFilters");
		details.dataset.schema = WorkBook.activeTable.dataset.schema;
		details.dataset.table = objects.props.name;
		details.dataset.label = objects.props.name;
		details.dataset.alias = alias;
		details.dataset.id = objects.props.key;
		details.dataset.searchId = 'column-search';
		summary.innerHTML = objects.props.name;
		summary.dataset.tableId = objects.props.key;
		parent.appendChild(details);
		columns.forEach(column => {
			const content = template_li.content.cloneNode(true);
			const li = content.querySelector('li.drag-list.default');
			const span = li.querySelector('span');
			const i = li.querySelector('i');
			i.dataset.tableId = objects.props.key;
			i.dataset.field = column.column_name;
			i.id = `${alias}_${column.column_name}`;
			// i.dataset.datatype = column.type_name.toLowerCase();
			i.ondragstart = elementDragStart;
			i.ondragend = elementDragEnd;

			li.dataset.label = column.column_name;
			li.dataset.fn = 'handlerSelectField';
			li.dataset.elementSearch = 'columns';
			li.dataset.tableId = objects.props.key;
			li.dataset.table = objects.props.name;
			li.dataset.alias = alias;
			li.dataset.datatype = column.type_name.toLowerCase();
			// li.dataset.type = objects.props.type;
			li.dataset.field = column.column_name;
			// li.dataset.key = column.CONSTRAINT_NAME;
			span.innerText = column.column_name;
			span.dataset.datatype = column.type_name.toLowerCase();
			// span.dataset.key = value.CONSTRAINT_NAME; // pk : chiave primaria
			// li.dataset.fn = 'addFieldToJoin';
			details.appendChild(li);
		});
	}
}

// salva metrica composta di base
function customBaseMetricSave(e) {
	// se presente il dataset.token sul btn-custom-metric-save sto modificando la metrica, altrimenti
	// è una nuova metrica
	const token_string = WorkBook.activeTable.id.substring(WorkBook.activeTable.id.length - 5);
	const generated_token = rand().substring(0, 7);
	const token = (e.target.dataset.token) ? e.target.dataset.token : `__${token_string}_${generated_token}`;
	const alias = document.getElementById('input-base-custom-metric-name').value;
	let fields = [];
	const factId = WorkBook.activeTable.dataset.factId;
	const suggestionsTables = JSON.parse(window.sessionStorage.getItem(WorkBook.activeTable.dataset.table));
	let SQL = [];
	const formula = textareaCustomMetric.firstChild.textContent.split(/\b/);
	// ogni elemento inserito nella formula deve essere verificato, la verifica consiste nel trovare
	// quello che è stato inserito, se è presente (come colonna) nella tabella
	formula.forEach(el => {
		const match = [...suggestionsTables].find(value => el === value.column_name);
		if (match) {
			SQL.push(`${WorkBook.activeTable.dataset.alias}.${el}`);
			fields.push(el);
		} else {
			SQL.push(el.trim());
		}
	});
	// TODO: 21.11.2024 verificare per quale motivo la creazione dell'object qui è diversa da quella in convertToMetric()
	const metric = {
		token,
		factId,
		alias,
		SQL: SQL.join(' '),
		distinct: false, // default
		type: 'metric',
		metric_type: 'basic',
		properties: {
			table: WorkBook.activeTable.dataset.table,
			fields
		},
		formula,
		aggregateFn: 'SUM', // default
		cssClass: 'custom'
	}
	WorkBook.checkChanges(token);
	WorkBook.elements = metric;
	WorkBook.workSheet[token] = metric;
	WorkBook.update();
	if (!e.target.dataset.token) {
		appendCustomMetric(metric);
	} else {
		const li = document.querySelector(`li[data-id='${token}']`);
		const dragIcon = li.querySelector('i');
		const span = li.querySelector('.span__content>span');
		li.dataset.label = alias;
		dragIcon.dataset.label = alias;
		span.textContent = alias;
	}
	dlgCustomMetric.close();
}

// salvataggio metrica avanzata
function advancedMetricSave(e) {
	const alias = document.getElementById("input-advanced-metric-name").value;
	const token = (e.target.dataset.token) ? e.target.dataset.token : rand().substring(0, 7);
	const date = new Date().toLocaleDateString('it-IT', options);
	let filters = new Set();
	// const metric = WorkBook.metrics.get(e.target.dataset.originToken);
	const metric = WorkBook.elements.get(e.target.dataset.originToken);
	// WARN: per il momento recupero innerText anziché dataset.aggregate perchè l'evento onBlur non viene attivato
	const aggregateFn = dlg__advancedMetric.querySelector('.formula > code[data-aggregate]').innerText;
	const distinct = document.getElementById('check-distinct').checked;
	let object = {
		token,
		alias,
		type: 'metric',
		metric_type: 'advanced',
		factId: metric.factId,
		aggregateFn,
		SQL: metric.SQL,
		distinct,
		workbook_ref: WorkBook.workBook.token,
		updated_at: date
	};
	// recupero tutti i filtri droppati in #filter-drop
	// salvo solo il riferimento al filtro e non tutta la definizione del filtro
	dlg__advancedMetric.querySelectorAll('#filter-drop li').forEach(filter => filters.add(filter.dataset.token));
	// se ci sono funzioni temporali selezionate le aggiungo all'object 'filters' con token = alla funzione scelta (es.: last-year)
	if (document.querySelector('#dl-timing-functions > dt[selected]')) {
		const timingFn = document.querySelector('#dl-timing-functions > dt[selected]');
		// TODO: aggiungere le altre funzioni temporali
		if (['last-year', 'last-month', 'year-to-month'].includes(timingFn.dataset.value)) {
			const timeField = timingFn.dataset.timeField;
			// Per questa metrica è stata aggiunta una timingFn.
			// oltre ad aggiungere il token (es.: 'last-year') nel Set 'filters' devo aggiungere anche la definizione di
			// ... questa timingFn, questo perchè la timingFn non è un filtro 'separato' che viene salvato in storage
			filters.add(timingFn.dataset.value);
			object.timingFn = { [timingFn.dataset.value]: { field: timeField } };
		}
	}

	if (filters.size !== 0) object.filters = [...filters];
	// aggiornamento/creazione della metrica imposta created_at
	object.created_at = (e.target.dataset.token) ? metric.created_at : date;
	// WorkBook.metrics = object;
	WorkBook.elements = object;
	// salvo la nuova metrica nello storage
	// window.localStorage.setItem(token, JSON.stringify(WorkBook.metrics.get(token)));
	window.localStorage.setItem(token, JSON.stringify(WorkBook.elements.get(token)));
	if (!e.target.dataset.token) {
		// aggiungo la nuova metrica nello stesso <details> della metrica originaria (originToken)
		const parent = document.querySelector(`li[data-id='${e.target.dataset.originToken}']`).parentElement;
		appendMetric(parent, token);
	} else {
		// la metrica già esiste, aggiorno il nome
		// NOTE: il querySelector() non gestisce gli id che iniziano con un numero, per questo motivo utilizzo getElementById()
		const li = document.querySelector(`li[data-id='${token}']`);
		const dragIcon = li.querySelector('i');
		const span = li.querySelector('.span__content>span');
		li.dataset.label = alias;
		dragIcon.dataset.label = alias;
		span.textContent = alias;
	}
	dlg__advancedMetric.close();
}

// salvataggio metrica composta
function compositeMetricSave(e) {
	const token = (e.target.dataset.token) ? e.target.dataset.token : rand().substring(0, 7);
	const alias = document.getElementById('composite-metric-name').value;
	const date = new Date().toLocaleDateString('it-IT', options);
	let object = { token, type: 'metric', alias, SQL: [], formula: [], metrics: new Set(), metric_type: 'composite', workbook_ref: WorkBook.workBook.token, updated_at: date };
	// regex : ottengo i bounduary delle word (\b) e anche quelli dei caratteri non-word (\W)
	object.formula = textarea__composite_metric.firstChild.textContent.split(/\b|(?=[\W])/g);
	console.log(object.formula);
	// ottengo i token delle metriche che compongono la metrica composta
	object.formula.forEach(el => {
		if (document.querySelector(`li.metrics[data-label='${el}']`)) {
			const metric_id = document.querySelector(`li.metrics[data-label='${el}']`).dataset.id;
			console.log(`metrica ${el} trovata con id ${metric_id}`);
			const metricFormula = WorkBook.elements.get(metric_id);
			switch (metricFormula.metric_type) {
				case 'composite':
					// metrica composte nidificata
					// La proprietà SQL della metrica annidata è già formattata con i token delle metriche
					object.SQL.push(metricFormula.SQL);
					WorkBook.elements.get(metricFormula.token).metrics.forEach(metric => {
						object.metrics.add(metric);
					});
					break;
				default:
					// base / advanced
					// object.metrics[metricFormula.token] = el;
					object.metrics.add(metric_id);
					object.SQL.push(metric_id);
					break;
			}
		} else {
			// object.SQL.push(el.trim());
			object.SQL.push(el);
		}
	});
	// aggiornamento/creazione della metrica imposta created_at
	// object.created_at = (e.target.dataset.token) ? WorkBook.metrics.get(e.target.dataset.token).created_at : date;
	object.created_at = (e.target.dataset.token) ? WorkBook.elements.get(e.target.dataset.token).created_at : date;
	// converto l'oggetto Set in array altrimenti, in localStorage, non viene salvato come array
	object.metrics = [...object.metrics];
	console.log('Metrica composta : ', object);
	debugger;
	// WorkBook.metrics = object;
	WorkBook.elements = object;
	window.localStorage.setItem(token, JSON.stringify(WorkBook.elements.get(token)));
	if (!e.target.dataset.token) {
		appendCompositeMetric(token);
		App.showConsole(`Metrica <b>${alias}</b> aggiunta al WorkBook`, 'done', 1500);
	} else {
		// la metrica già esiste, aggiorno il nome
		// NOTE: il querySelector() non gestisce gli id che iniziano con un numero, per questo motivo utilizzo getElementById()
		const li = document.querySelector(`li[data-id='${token}']`);
		const dragIcon = li.querySelector('i');
		const span = li.querySelector('.span__content>span');
		li.dataset.label = alias;
		dragIcon.dataset.label = alias;
		span.textContent = alias;
		App.showConsole(`Metrica '${alias}' modificata`, 'done', 2000);
	}
	dlg__composite_metric.close();
}

function inputFilter(e) {
	// console.log(sel);
	// console.log(sel.baseNode.textContent);
	// console.log(e.target.firstChild.nodeType, e.target.firstChild.nodeName);
	// console.log(e.target.firstChild);
	if (e.target.firstChild.nodeType === 1) return;
	const suggestionsTables = [...document.querySelectorAll('#wbFilters>details')];
	const caretPosition = sel.anchorOffset;
	const startIndex = findIndexOfCurrentWord(e.target, caretPosition);
	const currentWord = e.target.firstChild.textContent.substring(startIndex + 1, caretPosition);
	// NOTE: non utilizzo la popupSuggestions perchè qui sono presenti elementi univoci
	// Il nome Tabella è univoco e, allo stesso modo, il nome colonna della tabella è univoco
	// const currentWord = (endIndex > 0) ? e.target.firstChild.textContent.substring(startIndex + 1, caretPosition) : e.target.firstChild.textContent.substring(startIndex + 1);
	// console.info(`current word: ${currentWord}`);
	if (currentWord.length > 0) {
		// se il carattere che interrompe la parola (trovato dal regex) è un punto allora devo cercare
		// nell'array delle Colonne, altrimenti in quello delle Tabelle
		const chartAt = e.target.firstChild.textContent.at(startIndex);
		// console.log(`chartAt: ${chartAt}`);
		let table = null;
		if (chartAt === '.') {
			// recupero la tabella (prima del punto) in modo da cercare le colonne SOLO di quella tabella
			const startIndexTable = findIndexOfCurrentWord(e.target, startIndex);
			table = e.target.firstChild.textContent.substring(startIndexTable + 1, startIndex);
		}
		// console.info(`current word: ${currentWord}`);
		// let regex = new RegExp(`^${currentWord}.*`, 'i');
		// const regex = new RegExp(`^${currentWord}.*`);
		const regex = new RegExp(`^${currentWord}`);
		console.log(regex);
		// se è presente il punto cerco tra le colonne altrimenti cerco tra le tabelle
		const match = (chartAt === '.') ?
			[...document.querySelectorAll(`#wbFilters>details[data-table='${table}']>li`)].find(value => value.dataset.label.match(regex)) :
			suggestionsTables.find(value => value.dataset.table.match(regex));
		// console.log(`match ${match}`);
		if (match) {
			// console.log(sel);
			const span = document.createElement('span');
			span.textContent = match.dataset.label.slice(currentWord.length, match.dataset.label.length);
			span.dataset.text = match.dataset.label.slice(currentWord.length, match.dataset.label.length);
			autocomplete(span);
			// normalizzo i nodi
			e.target.normalize();
		} else {
			e.target.querySelector('span')?.remove();
			// if (e.target.querySelector('span')) e.target.querySelector('span').remove();
		}
	} else {
		e.target.querySelector('span')?.remove();
	}
}

// evento input nella textarea per la creazione metrica di base custom
function inputCustomMetric(e) {
	// console.log(sel);
	// console.log(sel.baseNode.textContent);
	// console.log(e.target.firstChild.nodeType, e.target.firstChild.nodeName);
	// console.log(e.target.firstChild);
	if (e.target.firstChild.nodeType === 1) return;
	// recupero l'elenco delle colonne dal sessionStorage
	const suggestionsTables = JSON.parse(window.sessionStorage.getItem(WorkBook.activeTable.dataset.table));
	const caretPosition = sel.anchorOffset;
	const startIndex = findIndexOfCurrentWord(e.target, caretPosition);
	const currentWord = e.target.firstChild.textContent.substring(startIndex + 1, caretPosition);
	popupSuggestions = e.target.parentElement.querySelector('.popup__suggestions');
	// const currentWord = (endIndex > 0) ? e.target.firstChild.textContent.substring(startIndex + 1, caretPosition) : e.target.firstChild.textContent.substring(startIndex + 1);
	// console.info(`current word: ${currentWord}`);
	if (currentWord.length > 0) {
		popupSuggestions.querySelectorAll('ul>li').forEach(el => el.remove());
		// console.info(`current word: ${currentWord}`);
		// let regex = new RegExp(`^ ${currentWord}.*`, 'i');
		const regex = new RegExp(`^${currentWord}.*`);
		// const matches = suggestionsTables.filter(value => value.column_name.match(regex));
		// oltre al nome colonna controllo anche il datatype, in modo da suggerire solo le colonne con dato numerico
		const matches = suggestionsTables.filter(value => (value.column_name.match(regex) && numericDataType.includes(value.type_name)));
		// gestione popupSuggestions
		if (matches.length !== 0) {
			// console.log(matches);
			matches.forEach((el, index) => {
				// visualizzo solo i primi 6 elementi
				// TODO: utilizzare l'overflow al posto di index < 6 altrimenti non riesco a visualizzare tutti gli elementi trovati
				if (index < 6) {
					const li = document.createElement('li');
					const column = document.createElement('span');
					// const table = document.createElement('small');
					li.classList.add('container__suggestion');
					// li.dataset.index = index;
					column.innerText = el.column_name;
					// table.innerText = el;
					li.addEventListener('click', function() {
						const indexMatch = this.textContent.search(regex);
						const autocomplete = this.textContent.substring(indexMatch + currentWord.length);
						e.target.firstChild.textContent += autocomplete + ' ';
						popupSuggestions.classList.remove('open');
						sel.setPosition(e.target.firstChild, e.target.firstChild.length);
					});
					// li.append(column, table);
					li.append(column);
					popupSuggestions.querySelector('ul').appendChild(li);
				}
			});
			// gestione inline autocomplete
			// const match = [...suggestionsTables].find(value => value.column_name.match(regex));
			// const match = [...suggestionsTables].find(value => (value.column_name.match(regex) && numericDataType.includes(value.type_name)));
			const match = suggestionsTables.find(value => (value.column_name.match(regex) && numericDataType.includes(value.type_name)));
			// console.log(`match ${match}`);
			if (match) {
				const span = document.createElement('span');
				span.textContent = match.column_name.slice(currentWord.length, match.column_name.length);
				span.dataset.text = match.column_name.slice(currentWord.length, match.column_name.length);
				autocomplete(span);
				// normalizzo i nodi
				e.target.normalize();
				popupSuggestions.classList.add('open');
				popupSuggestions.style.left = `${e.target.querySelector('span').offsetLeft}px`;
				popupSuggestions.style.top = `${e.target.querySelector('span').offsetTop + 30}px`;
			}
		} else {
			popupSuggestions.classList.remove('open');
			e.target.querySelector('span')?.remove();
			// if (e.target.querySelector('span')) e.target.querySelector('span').remove();
		}
	} else {
		popupSuggestions.classList.remove('open');
		// if (e.target.querySelector('span')) e.target.querySelector('span').remove();
		e.target.querySelector('span')?.remove();
	}
}

// evento input nella textarea per la creazione di colonne custom
function inputCustomColumn(e) {
	// console.log(sel);
	// console.log(sel.baseNode.textContent);
	// console.log(e.target.firstChild.nodeType, e.target.firstChild.nodeName);
	// console.log(e.target.firstChild);
	if (e.target.firstChild.nodeType === 1) return;
	const suggestionsTables = [...document.querySelectorAll('#wbColumns>details')];
	const caretPosition = sel.anchorOffset;
	const startIndex = findIndexOfCurrentWord(e.target, caretPosition);
	const currentWord = e.target.firstChild.textContent.substring(startIndex + 1, caretPosition);
	// NOTE: non utilizzo la popupSuggestions perchè qui sono presenti elementi univoci
	// Il nome Tabella è univoco e, allo stesso modo, il nome colonna della tabella è univoco
	// const currentWord = (endIndex > 0) ? e.target.firstChild.textContent.substring(startIndex + 1, caretPosition) : e.target.firstChild.textContent.substring(startIndex + 1);
	// console.info(`current word: ${currentWord}`);
	if (currentWord.length > 0) {
		// se il carattere che interrompe la parola (trovato dal regex) è un punto allora devo cercare
		// nell'array delle Colonne, altrimenti in quello delle Tabelle
		const chartAt = e.target.firstChild.textContent.at(startIndex);
		// console.log(`chartAt: ${ chartAt } `);
		let table = null;
		if (chartAt === '.') {
			// recupero la tabella (prima del punto) in modo da cercare le colonne SOLO di quella tabella
			const startIndexTable = findIndexOfCurrentWord(e.target, startIndex);
			table = e.target.firstChild.textContent.substring(startIndexTable + 1, startIndex);
		}
		// console.info(`current word: ${currentWord}`);
		// let regex = new RegExp(`^${currentWord}.*`, 'i');
		// const regex = new RegExp(`^${currentWord}.*`);
		const regex = new RegExp(`^${currentWord}`);
		// console.log(regex);
		// se è presente il punto cerco tra le colonne altrimenti cerco tra le tabelle
		const match = (chartAt === '.') ?
			[...document.querySelectorAll(`#wbColumns > details[data-table='${table}']> li`)].find(value => value.dataset.label.match(regex)) :
			suggestionsTables.find(value => value.dataset.table.match(regex));
		// console.log(`match ${ match } `);
		if (match) {
			// console.log(sel);
			const span = document.createElement('span');
			span.textContent = match.dataset.label.slice(currentWord.length, match.dataset.label.length);
			span.dataset.text = match.dataset.label.slice(currentWord.length, match.dataset.label.length);
			autocomplete(span);
			// normalizzo i nodi
			e.target.normalize();
		} else {
			e.target.querySelector('span')?.remove();
		}
	} else {
		e.target.querySelector('span')?.remove();
	}
}

// visualizzo lo span dell'autocompletamento
function autocomplete(span) {
	const node = sel.anchorNode;
	// console.log(node.parentNode.querySelector('span'));
	// se è presente già un "suggerimento" (span) lo elimino
	if (node.parentNode.querySelector('span')) node.parentNode.querySelector('span').remove();
	// offset indica la posizione del cursore
	const offset = sel.anchorOffset;
	// splitText separa il nodo in due dove, 'node' è la parte prima del cursore e replacement e la parte successiva al cursore
	const replacement = node.splitText(offset);
	// creo un elemento p per poter effettuare il insertBefore dello span contenente il "suggestion"
	const p = document.createElement('p');
	// inserisco, in p, la prima parte (prima del cursore in posizione corrente)
	p.innerHTML = node.textContent;
	// inserisco lo span del suggerimento prima della parte DOPO il cursore (replacement)
	node.parentNode.insertBefore(span, replacement);
	// il nodo ora contiene tutto l'elemento <p> che è composto in questo modo :
	// <p>parte PRIMA del testo <span>suggerimento</span> parte DOPO il cursore
	node.textContent = p.textContent;
	// siccome ho riscritto il nodo, la posizione del cursore viene impostata all'inizio del nodo, quindi la reimposto dov'era (offset)
	sel.setPosition(node, offset);
}

function inputCompositeMetric(e) {
	// console.log(sel);
	// console.log(sel.baseNode.textContent);
	// console.log(e.target.firstChild.nodeType, e.target.firstChild.nodeName);
	// console.log(e.target.firstChild);
	if (e.target.firstChild.nodeType === 1) return;
	// recupero l'elenco delle metriche da WorkBook.metrics
	let suggestions = [];
	// for (const value of WorkBook.metrics.values()) {
	for (const value of WorkBook.elements.values()) {
		if (value.type === 'metric') suggestions.push(value.alias);
	}
	const caretPosition = sel.anchorOffset;
	const startIndex = findIndexOfCurrentWord(e.target, caretPosition);
	const currentWord = e.target.firstChild.textContent.substring(startIndex + 1, caretPosition);
	popupSuggestions = e.target.parentElement.querySelector('.popup__suggestions');
	// console.log(popupSuggestions);
	// console.info(`current word: ${currentWord}`);
	if (currentWord.length > 0) {
		popupSuggestions.querySelectorAll('ul>li').forEach(el => el.remove());
		// console.info(`current word: ${currentWord}`);
		// let regex = new RegExp(`^ ${currentWord}.*`, 'i');
		const regex = new RegExp(`^${currentWord}.*`);
		const matches = suggestions.filter(value => value.match(regex));
		// gestione del popupSuggestions
		if (matches.length !== 0) {
			matches.forEach((el, index) => {
				// visualizzo solo i primi 6 elementi
				// TODO: utilizzare l'overflow al posto di index < 6 altrimenti non riesco a visualizzare tutti gli elementi trovati
				if (index < 6) {
					const li = document.createElement('li');
					const column = document.createElement('span');
					// const table = document.createElement('small');
					li.classList.add('container__suggestion');
					// li.dataset.index = index;
					column.innerText = el;
					// table.innerText = el;
					li.addEventListener('click', function() {
						const indexMatch = this.textContent.search(regex);
						const autocomplete = this.textContent.substring(indexMatch + currentWord.length);
						e.target.firstChild.textContent += autocomplete + ' ';
						popupSuggestions.classList.remove('open');
						sel.setPosition(e.target.firstChild, e.target.firstChild.length);
					});
					// li.append(column, table);
					li.append(column);
					popupSuggestions.querySelector('ul').appendChild(li);
				}
			});
			const match = suggestions.find(value => value.match(regex));
			// console.log(`match ${ match } `);
			// gestione dell'autocomplete "inline"
			if (match) {
				const span = document.createElement('span');
				span.textContent = match.slice(currentWord.length, match.length);
				span.dataset.text = match.slice(currentWord.length, match.length);
				autocomplete(span);
				// normalizzo i nodi
				e.target.normalize();
				popupSuggestions.classList.add('open');
				popupSuggestions.style.left = `${e.target.querySelector('span').offsetLeft}px`;
				popupSuggestions.style.top = `${e.target.querySelector('span').offsetTop + 30}px`;
			}
		} else {
			popupSuggestions.classList.remove('open');
			e.target.querySelector('span')?.remove();
			// if (e.target.querySelector('span')) e.target.querySelector('span').remove();
		}
	} else {
		popupSuggestions.classList.remove('open');
		e.target.querySelector('span')?.remove();
		// if (e.target.querySelector('span')) e.target.querySelector('span').remove();
	}
}

function dlgCompositeMetricCheck() {
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

// elementi droppati nella textarea
function appendDropped(caretPosition, text) {
	const textNode = caretPosition.offsetNode;
	if (caretPosition.offset !== 0) {
		let replacement = textNode.splitText(caretPosition.offset);
		let p = document.createElement('p');
		p.innerHTML = textNode.textContent;
		// NOTE: utilizzo di un elemento parent (<p> in questo caso) per poter usare il metodo insertBefore()
		// ...che non è possibile utilizzare su nodi Text
		textNode.parentNode.insertBefore(text, replacement);
		textNode.textContent = p.textContent;
	} else {
		textNode.textContent = text.textContent;
	}
}

function showSQLInfo(data) {
	console.log(data);
	const sqlRaw = document.getElementById('sql-info-raw');
	const sqlFormat = document.getElementById('sql-info-format');
	const tmplRaw = tmplSQLRaw.content.cloneNode(true);
	const div = tmplRaw.querySelector('div.sql-raw');
	const divIcon = div.querySelector('.absolute-icons');
	const btnCopy = divIcon.querySelector('button');
	const code__content_base = div.querySelector('code');
	// base

	div.id = 'BASE';
	data.base.forEach(sql => {
		const tmpl = document.getElementById('template__code_tag');
		const content = tmpl.content.cloneNode(true);
		const code = content.querySelector('code');
		// code.className = 'code';
		if (sql) {
			code.innerHTML = sql.raw_sql;
			code__content_base.appendChild(code);
			// code__content.innerHTML += sql.raw_sql;
		}
	});

	divIcon.dataset.id = 'BASE';
	btnCopy.dataset.id = 'BASE';
	sqlRaw.appendChild(div);

	// advanced
	if (data.advanced) {
		data.advanced.forEach((sql, i) => {
			const tmplRaw = tmplSQLRaw.content.cloneNode(true);
			const div = tmplRaw.querySelector('div.sql-raw');
			const divIcon = div.querySelector('.absolute-icons');
			const btnCopy = div.querySelector('button');
			const code__content_adv = div.querySelector('code');
			div.id = `advanced-${i}`;
			divIcon.dataset.id = `advanced-${i}`;
			btnCopy.dataset.id = `advanced-${i}`;
			code__content_adv.innerHTML = sql.raw_sql;
			sqlRaw.appendChild(div);
		});
	}
	// union
	const tmplRawUnion = tmplSQLRaw.content.cloneNode(true);
	const divUnion = tmplRawUnion.querySelector('div.sql-raw');
	const divIconUnion = divUnion.querySelector('.absolute-icons');
	const btnCopyUnion = divUnion.querySelector('button');
	const code__content_union = divUnion.querySelector('code');
	divUnion.id = 'UNION';
	divIconUnion.dataset.id = 'UNION';
	btnCopyUnion.dataset.id = 'UNION';
	code__content_union.innerHTML = data.datamart.union.raw_sql;
	sqlRaw.appendChild(divUnion);

	// datamart
	const tmplRawDatamart = tmplSQLRaw.content.cloneNode(true);
	const divDatamart = tmplRawDatamart.querySelector('div.sql-raw');
	const divIconDatamart = divDatamart.querySelector('.absolute-icons');
	const btnCopyDatamart = divDatamart.querySelector('button');
	const code__content_datamart = divDatamart.querySelector('code');
	divDatamart.id = 'DATAMART';
	divIconDatamart.dataset.id = 'DATAMART';
	btnCopyDatamart.dataset.id = 'DATAMART';
	code__content_datamart.innerHTML = data.datamart.datamart.raw_sql;
	sqlRaw.appendChild(divDatamart);

	const tmpl = tmplSQLInfo.content.cloneNode(true);
	const divMain = tmpl.querySelector('.sql-raw');
	sqlFormat.appendChild(divMain);
	// popolo il div sql-info-format
	data.base.forEach(sql => {
		if (!sql) return;
		for (const [clause, value] of Object.entries(sql.format_sql)) {
			// console.log(clause, value);
			const tmpl = tmplSQLInfo.content.cloneNode(true);
			const details = tmpl.querySelector('details');
			const summary = tmpl.querySelector('summary');
			summary.innerHTML = clause;
			for (const [key, sql] of Object.entries(value)) {
				const tmpl = tmplSQLInfo.content.cloneNode(true);
				const div = tmpl.querySelector('div.sql-row');
				const dataKey = div.querySelector('span[data-key]');
				const dataSQL = div.querySelector('span[data-sql]');
				dataKey.dataset.clause = clause;
				dataKey.innerHTML = key;
				dataSQL.innerHTML = sql;
				details.appendChild(div);
			}
			divMain.appendChild(details);
		}
	});

	if (data.advanced) {
		data.advanced.forEach(query => {
			const tmpl = tmplSQLInfo.content.cloneNode(true);
			const divMain = tmpl.querySelector('.sql-raw');
			sqlFormat.appendChild(divMain);
			for (const clauses of Object.values(query.format_sql)) {
				for (const [clause, value] of Object.entries(clauses)) {
					// console.log(clause, value);
					const tmpl = tmplSQLInfo.content.cloneNode(true);
					const details = tmpl.querySelector('details');
					const summary = tmpl.querySelector('summary');
					summary.innerHTML = clause;
					for (const [key, sql] of Object.entries(value)) {
						const tmpl = tmplSQLInfo.content.cloneNode(true);
						const div = tmpl.querySelector('div.sql-row');
						const dataKey = div.querySelector('span[data-key]');
						const dataSQL = div.querySelector('span[data-sql]');
						dataKey.dataset.clause = clause;
						dataKey.innerHTML = key;
						dataSQL.innerHTML = sql;
						details.appendChild(div);
					}
					divMain.appendChild(details);
				}
			}
		});
	}
	dialogSQL.showModal();
}

function export_datatable_XLS_new(e) {
	e.preventDefault();
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
		filename: `${Sheet.name}`,
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

function addFields(parent, fields) {
	for (const [token, value] of Object.entries(fields)) {
		const tmpl = template_li.content.cloneNode(true);
		const li = tmpl.querySelector('li.drag-list.columns');
		const span__content = li.querySelector('.span__content');
		const span = span__content.querySelector('span');
		const i = span__content.querySelector('i[draggable]');
		const btnConvertToMetric = li.lastElementChild;
		const icon = span__content.querySelector('i:not([draggable])');
		// console.log(`${value.table}.${value.name}`);
		if (value.constraint) {
			li.dataset.constraint = value.constraint;
			icon.innerText = 'key';
		}
		li.dataset.id = token;
		i.id = token;
		li.classList.add("columns");
		li.dataset.elementSearch = "elements";
		// li.dataset.label = value.field.ds.field;
		// TODO: rivedere la descrizione da far comparire per le colonne e colonne custom
		// li.dataset.label = value.field.ds.sql.join('');
		li.dataset.datatype = value.datatype;
		li.dataset.label = value.name;
		li.dataset.schema = value.schema;
		li.dataset.table = value.table;
		li.dataset.alias = value.tableAlias;
		li.dataset.field = value.name;
		i.addEventListener('dragstart', handleDragStart);
		i.addEventListener('dragend', handleDragEnd);
		i.addEventListener('dragenter', handleDragEnter);
		i.addEventListener('dragleave', handleDragLeave);
		// sulle colonne custom questa icona viene nascosta da CSS
		// WARN: il btnConvertToMetric viene inserito solo qui (in fase di creazione di #workbook-objects)
		// e non in appendColumn() (in fase di creazione di una nuova colonna custom)
		btnConvertToMetric.dataset.tableId = value.tableId;
		btnConvertToMetric.dataset.token = token;
		btnConvertToMetric.addEventListener('click', convertToMetric);
		// btnConvertToMetric.addEventListener('click', createCustomMetric);
		span.innerText = value.name;
		if (value.cssClass === 'custom') {
			li.classList.add(value.cssClass);
			li.dataset.contextmenu = 'ul__contextmenu_custom_column';
			li.addEventListener('contextmenu', openContextMenu);
			// la colonna custom deve essere aggiunta sempre alla fine dell'elenco delle colonne
			// parent.insertAdjacentElement('beforeend', li)
			// NOTE: https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement
			parent.insertAdjacentElement('beforeend', li);
		} else {
			// se è presente una colonna custom, la colonna default va inserita prima della custom
			// recupero il firstChild tra le colonne custom
			(parent.querySelector('.columns.custom')) ? parent.querySelector('.columns.custom').before(li) : parent.appendChild(li);
			// parent.appendChild(li);
		}
	}
}

function createCustomMetric(e) {
	// const tableId = e.currentTarget.dataset.tableId;
	WorkBook.activeTable = e.currentTarget.dataset.tableId;
	dlgCustomMetric.showModal();
}

function createCustomColumn(e) {
	createTableStruct(wbColumns);
	WorkBook.activeTable = e.currentTarget.dataset.tableId;
	dlg__custom_columns.showModal();
	input__column_name.focus();
}

function convertToMetric(e) {
	// elemento (colonna) da cui convertire in metrica
	WorkBook.activeTable = e.currentTarget.dataset.tableId;
	// const referenceElement = document.querySelector(`.drag-list.columns[data-id='${e.currentTarget.dataset.token}']`);
	// console.log(token);
	// recupero l'elemento da convertire
	const element = WorkBook.elements.get(e.currentTarget.dataset.token);
	// console.log(element);
	// creo la metrica che salverò in customMetrics, queste verranno salvate in storage, insiemen al WorkBook e alle metriche
	// custom di base (es. : przmedio*quantita)
	let aggregateFn;
	switch (element.datatype) {
		case 'integer':
			aggregateFn = 'COUNT';
			break;
		default:
			aggregateFn = 'SUM';
			break;
	}
	// const token = `_cm_${ e.currentTarget.dataset.token } `;
	const token = rand().substring(0, 7);
	const metric = {
		token,
		factId: element.tableId,
		alias: element.name,
		SQL: element.SQL,
		distinct: false,
		type: 'metric',
		metric_type: 'basic',
		aggregateFn,
		formula: [element.name],
		dependencies: false,
		cssClass: 'custom'
	};
	WorkBook.checkChanges(token);
	WorkBook.elements = metric;
	WorkBook.workSheet[token] = metric;
	// TODO: il metodo update() è da ottimizzare perchè è presente, in save(), un controllo su checkChanges
	WorkBook.update();
	// creo l'elemento da aggiungere
	appendCustomMetric(metric);
	e.currentTarget.style.visibility = 'hidden';
}

// aggiungo la metrica appena creata (metrica custom di base)
function appendCustomMetric(metric) {
	// TODO: 22.11.2024 utilizzare la stessa logica di appendColumn()
	const referenceElement = document.querySelector(`#${WorkBook.activeTable.id}_new_metric`);
	const tmpl = template_li.content.cloneNode(true);
	const li = tmpl.querySelector('li.drag-list.metrics.basic.custom');
	const span__content = li.querySelector('.span__content');
	const span = span__content.querySelector('span');
	const i = span__content.querySelector('i[draggable]');
	li.classList.add('custom');
	li.dataset.id = metric.token;
	i.id = metric.token;
	li.dataset.type = 'basic';
	li.dataset.elementSearch = 'elements';
	li.dataset.label = metric.alias;
	// definisco quale context-menu-template apre questo elemento
	// li.dataset.contextmenu = 'ul-context-menu-basic';
	i.addEventListener('dragstart', handleDragStart);
	i.addEventListener('dragend', handleDragEnd);
	li.addEventListener('contextmenu', openContextMenu);
	span.innerText = metric.alias;
	referenceElement.before(li);
	App.showConsole(`Metrica <b>${metric.alias}</b> aggiunta al WorkBook`, 'done', 1500);
}

/* token : è il token della metrica che si sta per eliminare dallo Sheet
 * key : è il token della metrica contenuta all'interno di una metrica composta
  * */
function checkCompositeMetrics(token, key) {
	// controllo se, la metrica che si sta eliminando è contenuta in qualche
	// altra metrica composta
	// In questo caso non posso eliminarla.
	// return true : non elimino la metrica
	// return false : elimino la metrica da Sheet.metrics
	for (const [sheetToken, sheetMetric] of Sheet.metrics) {
		if (sheetToken !== token && sheetMetric.type === 'composite') {
			// FIX: 02.04.2025 la prop metrics non è più un'object ma un array issue#282
			if (sheetMetric.metrics.hasOwnProperty(key)) {
				// la metrica inclusa nella composite è presente anche in un altra metrica, non
				// posso eliminarla
				return true;
			}
		}
	}
	// la metrica può essere eliminata da Sheet.metrics
	return false;
}

function checkMetricsDeps(token, depsToken) {
	for (const [sheetToken, sheetMetric] of Sheet.metrics) {
		if (sheetMetric.type === 'composite') {
			if (depsToken && sheetToken !== token) {
				// controllo metriche basic/advanced contenute nelle composite
				// se la metrica in ciclo è una composite,
				// ed è inclusa nella metrica composite in ciclo
				// non la elimino
				// FIX: 02.04.2025 la prop metrics non è più un'object ma un array issue#282
				if (sheetMetric.metrics.hasOwnProperty(depsToken)) {
					// la metrica che si sta eliminando è contenuta in una metrica composta.
					return true;
				}
			} else {
				// controllo metriche basic/advanced
				// FIX: 02.04.2025 la prop metrics non è più un'object ma un array issue#282
				if (sheetMetric.metrics.hasOwnProperty(token)) {
					// la metrica che si sta eliminando è contenuta in una metrica composta.
					return true;
				}
			}
		}
	}
	// la metrica può essere eliminata da Sheet.metrics
	return false;
}

function checkRemoveMetrics(token) {
	// controllo se, la metrica che si sta eliminando è contenuta in qualche
	// altra metrica composta oppure è stata aggiunta al report con dependencies:false.
	// In questi due casi non posso eliminarla.
	// return : true non elimino la metrica
	// return false : elimino la metrica da Sheet.metrics
	for (const sheetMetric of Sheet.metrics.values()) {
		if (sheetMetric.type === 'composite') {
			// se la metrica in ciclo è una composite,
			// ed è inclusa nella metrica composite in ciclo
			// non la elimino
			// FIX: 02.04.2025 la prop metrics non è più un'object ma un array issue#282
			if (sheetMetric.metrics.hasOwnProperty(token)) {
				// la metrica che si sta eliminando è contenuta in una metrica composta.
				return true;
			}
		}
	}
	// la metrica può essere eliminata da Sheet.metrics
	return false;
}

// WARN: codice ripetuto in popoverShow
function popoverChartWrappers(e) {
	const popover = document.getElementById(e.target.dataset.popoverId);
	const { top, right } = e.currentTarget.getBoundingClientRect();
	// Aggiungo i chartWrapper presenti (proprietà wrapper dele specs) alla popover
	const wrappers = Resource.specs.wrapper;
	if (Object.keys(Resource.specs.wrapper).length >= 2) {
		popover.querySelectorAll('nav>button').forEach(button => button.remove());
		Object.keys(wrappers).forEach(chartType => {
			const btn = document.createElement('button');
			btn.value = chartType;
			btn.innerText = chartType;
			btn.addEventListener('click', selectWrapper);
			popover.querySelector('nav').appendChild(btn);
		});
	}
	popover.showPopover();
	popover.style.top = `${top - popover.offsetHeight}px`;
	popover.style.left = `${right}px`;
}

// WARN: codice ripetuto popoverChartWrappers
function popoverShow(e) {
	const popover = document.getElementById(e.target.dataset.popoverId);
	popover.showPopover();
	const { top, right } = e.currentTarget.getBoundingClientRect();
	popover.style.top = `${top - popover.offsetHeight}px`;
	popover.style.left = `${right}px`;
}

function loadEditor() {
	// Create the chart to edit.
	/* var wrapper = new google.visualization.ChartWrapper({
	  'chartType': 'LineChart',
	  'dataSourceUrl': 'http://spreadsheets.google.com/tq?key=pCQbetd-CptGXxxQIG7VFIQ&pub=1',
	  'query': 'SELECT A,D WHERE D > 100 ORDER BY D',
	  'options': { 'title': 'Population Density (people/km^2)', 'legend': 'none' }
	}); */
	// recupero il wrapper attuale
	let wrapper = new google.visualization.ChartWrapper();
	wrapper.setChartType(Resource.specs.wrapper[Resource.wrapper].chartType);
	wrapper.setContainerId(Resource.ref.id);
	wrapper.setDataTable(Resource.dataViewGrouped);
	wrapper.setOptions(Resource.specs.wrapper[Resource.wrapper].options);

	// Recupero il chartWrapper dello Sheet visualizzato

	chartEditor = new google.visualization.ChartEditor();
	google.visualization.events.addListener(chartEditor, 'ok', redrawChart);
	chartEditor.openDialog(wrapper, {});
}

function openChartEditor(e) {
	const popover = document.getElementById(e.target.parentElement.dataset.popoverId);
	google.charts.setOnLoadCallback(loadEditor);
	popover.hidePopover();
}

// On "OK" save the chart to a <div> on the page.
function redrawChart() {
	// creo una nuova "visualization" in Resource.specs.wrapper
	// console.log(chartEditor.getChartWrapper());
	const chartWrapper = chartEditor.getChartWrapper();
	const chartType = chartWrapper.getChartType();
	const containerId = chartWrapper.getContainerId();
	const options = chartWrapper.getOptions();
	// alcune opzioni non sono contenute nel metodo getOptions() quindi, se si tratta
	// di un chartType : Table le imposto qui manualmente
	Resource.wrapper = chartType;
	// creo le prop group.key e group.columns per questo chartWrapper
	if (Resource.specs.wrapper.hasOwnProperty(chartType)) {
		// aggiorno le options del grafico
		if (chartType === 'Table') {
			options.allowHTML = true;
			options.page = 'enable';
			options.width = '100%';
			options.height = '100%';
			options.cssClassNames = {
				headerRow: "g-table-header",
				tableRow: "g-table-row",
				oddTableRow: "g-oddRow",
				// selectedTableRow: "g-selectedRow",
				// hoverTableRow: "g-hoverRow",
				selectedTableRow: null,
				hoverTableRow: null,
				headerCell: "g-header-cell",
				tableCell: "g-table-cell",
				// rowNumberCell: "g-rowNumberCell"
				rowNumberCell: null
			}
		}
		Resource.specs.wrapper[chartType].options = options;
	} else {
		// creo la struttura della proprietà 'group'
		Resource.specs.wrapper[chartType] = { group: { key: [], columns: [] } }
		Resource.createWrapperSpecs();
		Resource.specs.wrapper[chartType] = { chartType, group: Resource.specs.wrapper[chartType].group, options };
	}
	// ridisegno il grafico
	chartEditor.getChartWrapper().draw(document.getElementById(containerId));
	debugger;
	if (Object.keys(Resource.specs.wrapper).length >= 2) btn__chartWrapper.removeAttribute('disabled');
	// aggiorno lo Sheet e tutte le proprie specifiche
	const sheet = JSON.parse(window.localStorage.getItem(Sheet.sheet.token));
	sheet.specs = Resource.specs;
	window.localStorage.setItem(Sheet.sheet.token, JSON.stringify(sheet));
}

console.info('END workspace_functions');
