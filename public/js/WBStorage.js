/*
La classe recupera il local storage ad ogni accesso alla pagina e contiene Metodi per recuperare ad esempio solo i CUBE o solo le DIMENSION, ecc...
*/
class Storages {
	#selected; // l'elemento selezionato in un determinato momento
	#workbook;
	#workBooks = {};

	constructor() {
		this.storage = window.localStorage;
		// this.storageKeys = Object.keys(window.localStorage);
		this.JSONData = null;
		// tutti gli workbook
	}

	static getWorkbookByDatabaseId(databaseId) {
		let workbooks = [];
		for (const [token, object] of Object.entries(window.localStorage)) {
			if (JSON.parse(object).type === 'workbook' && JSON.parse(object).databaseId === +databaseId) {
				// workbooks[token] = JSON.parse(object);
				workbooks.push(JSON.parse(object));
			}
		}
		return workbooks;
	}

	static getSheetsByWorkbookId(workbookId) {
		let sheets = [];
		for (const object of Object.values(window.localStorage)) {
			if (JSON.parse(object).type === 'sheet' && JSON.parse(object).workbook_ref === workbookId) {
				sheets.push(JSON.parse(object));
			}
		}
		return sheets;
	}

	static getSheetsUsage(token) {
		// TODO: 18.07.2025 Controllare se i filtri sono presenti in WorkBook.elements
		const element = WorkBook.elements.get(token);
		const workbook_ref = WorkBook.workBook.token;
		let sheets = {};
		for (const [sheetToken, sheet] of Object.entries(window.localStorage)) {
			const jsonSheet = JSON.parse(sheet);
			if (jsonSheet.type === 'sheet' && jsonSheet.workbook_ref === workbook_ref) {
				switch (element.type) {
					case 'metric':
						// verifico se la metrica è presente nello Sheet
						if (jsonSheet.sheet.metrics.hasOwnProperty(token)) sheets[sheetToken] = { name: jsonSheet.name, type: jsonSheet.type };
						break;
					case 'filter':
						// TODO: 18.07.2025 da implementare
						break;
					default:
						// colonne custom
						// TODO: 18.07.2025 da implementare
				}
			}
		}
		return sheets;
	}

	static getCompositeMetricsByWorkbookId(workbookId) {
		let metrics = [];
		for (const object of Object.values(window.localStorage)) {
			if (JSON.parse(object).metric_type === 'composite' && JSON.parse(object).workbook_ref === workbookId) {
				metrics.push(JSON.parse(object));
			}
		}
		return metrics;
	}

	static getFilterByWorkbookId(workbookId) {
		let filters = [];
		for (const object of Object.values(window.localStorage)) {
			if (JSON.parse(object).type === 'filter' && JSON.parse(object).workbook_ref === workbookId) {
				filters.push(JSON.parse(object));
			}
		}
		return filters;
	}

	// utilizzare questo Metodo statico al posto dei 4 qui sopra
	static getObjectsByWorkbookId(workbookId, type, metric_type) {
		// type: sheet, filter, metric, ecc...
		// metric_type : utilizzato solo in caso di recupero delle metriche
		let objects = [];
		for (const json of Object.values(window.localStorage)) {
			const object = JSON.parse(json);
			if (object.workbook_ref === workbookId) {
				if (metric_type) {
					// è una metrica, quindi è richiesto anche la proprietà metric_type
					if (object.type === type && object.metric_type === metric_type) objects.push(object);
				} else {
					if (object.type === type) objects.push(object);
				}
			}
		}
		return objects;
	}

	set workBook(value) {
		// value : il token del workbook
		this.#workbook = value;
	}

	get workBook() {
		// return window.localStorage.getItem(this.#workbook);
		return JSON.parse(window.localStorage.getItem(this.#workbook));
	}

	save(object) {
		window.localStorage.setItem(object.token, JSON.stringify(object));
	}

	set selected(token) {
		this.#selected = token;
	}

	get selected() {
		return JSON.parse(this.storage.getItem(this.#selected));
	}

	// tutti gli workBooks
	workBooks(databaseId) {
		for (const [token, object] of Object.entries(this.storage)) {
			if (JSON.parse(object).type === 'workbook' && JSON.parse(object).databaseId === databaseId) {
				this.#workBooks[token] = JSON.parse(object);
			}
		}
		return this.#workBooks;
	}


	// salvataggio delle tabelle nel sessionStorage
	saveTables(data) {
		// salvataggio in sessionStorage da una chiamata promise.all
		data.forEach(tables => {
			for (const [table, columns] of Object.entries(tables)) {
				window.sessionStorage.setItem(table, JSON.stringify(columns));
			}
		});
	}

	// salvataggio delle colonne delle tabelle
	saveSession(data) {
		// salvo in sessionStorage la tabella appena droppata nel canvas
		for (const [table, columns] of Object.entries(data)) {
			window.sessionStorage.setItem(table, JSON.stringify(columns));
		}
	}

	getTable(table) {
		return JSON.parse(window.sessionStorage.getItem(table));
	}

	/* getFilters(workBookToken) {
	  let filters = {};
	  for (const [token, object] of Object.entries(this.storage)) {
		if (JSON.parse(object).type === 'filter' && JSON.parse(object).workbook_ref === workBookToken) {
		  filters[token] = JSON.parse(object);
		}
	  }
	  return filters;
	} */

	getFilters() {
		let filters = {};
		for (const [token, object] of Object.entries(this.storage)) {
			if (JSON.parse(object).type === 'filter') {
				filters[token] = JSON.parse(object);
			}
		}
		return filters;
	}

	/* getMetrics(workBookToken) {
	  let metrics = {};
	  for (const [token, object] of Object.entries(this.storage)) {
		if (JSON.parse(object).type === 'metric' && JSON.parse(object).workbook_ref === workBookToken) {
		  metrics[token] = JSON.parse(object);
		}
	  }
	  return metrics;
	} */

	getMetrics() {
		let metrics = {};
		for (const [token, object] of Object.entries(this.storage)) {
			if (JSON.parse(object).type === 'metric') {
				metrics[token] = JSON.parse(object);
			}
		}
		return metrics;
	}

	getAll(databaseId) {
		// Recupero tutti gli oggetti appartenenti al db connesso e, a cascata, appartenenti al workbook in ciclo
		let all = {};
		for (const [workbookToken, workbook] of Object.entries(this.workBooks(databaseId))) {
			all[workbookToken] = workbook;
			for (const [token, object] of Object.entries(this.storage)) {
				// verifico se l'object appartiene al workbook
				const json = JSON.parse(object);
				if (json.workbook_ref === workbookToken) all[token] = json;
			}
		}
		return all;
	}
}

class SheetStorages extends Storages {
	#sheets = {};
	#sheet;
	constructor() { super(); }

	set sheet(value) {
		// value : il token dello sheet
		this.#sheet = value;
	}

	get sheet() {
		// return window.localStorage.getItem(this.#workbook);
		return JSON.parse(window.localStorage.getItem(this.#sheet));
	}

	static getSheetSpecifications(token) {
		return JSON.parse(window.localStorage.getItem(token)).specs;
	}

	// restituisce gli sheet con il workbook_ref passato come parametro
	sheets(workBookToken) {
		this.#sheets = {};
		for (const [token, object] of Object.entries(this.storage)) {
			if (JSON.parse(object).type === 'sheet' && JSON.parse(object).workbook_ref === workBookToken) {
				this.#sheets[token] = JSON.parse(object);
			}
		}
		return this.#sheets;
	}

	/* getSheets(workBookToken) {
	  let sheets = {};
	  for (const [token, object] of Object.entries(this.storage)) {
		if (JSON.parse(object).type === 'Sheet' && JSON.parse(object).workBook_ref === workBookToken) {
		  sheets[token] = JSON.parse(object);
		}
	  }
	  return sheets;
	} */

	// recupero tutti gli sheets
	getSheets() {
		let sheets = {};
		for (const [token, object] of Object.entries(this.storage)) {
			if (JSON.parse(object).type === 'sheet') {
				sheets[token] = JSON.parse(object);
			}
		}
		return sheets;
	}

}
