var App = new Application();
var Storage = new SheetStorages();
(() => {
	var app = {
		tmpl_li: document.getElementById('tmpl-li'),
	}

	App.init();

	const config = { attributes: true, childList: true, subtree: true };

	const callback = (mutationList, observer) => {
		// console.log(mutationList, observer);
		for (const mutation of mutationList) {
			if (mutation.type === 'childList') {
				console.info('A child node has been added or removed.');
				Array.from(mutation.addedNodes).forEach(node => {
					// console.log(node);
					// console.log(node.nodeName);
					if (node.nodeName !== '#text') {
						if (node.hasAttribute('data-fn')) node.addEventListener('click', app[node.dataset.fn]);
						if (node.hasChildNodes()) {
							node.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
						}
					}
				});
			} else if (mutation.type === 'attributes') {
				// console.log(`The ${mutation.attributeName} attribute was modified.`);
				// console.log(mutation.target);
				if (mutation.target.hasChildNodes()) {
					mutation.target.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
				}
			}
		}
	};
	// Create an observer instance linked to the callback function
	const observerList = new MutationObserver(callback);
	// Start observing the target node for configured mutations
	// observerList.observe(targetNode, config);
	// console.log(document.getElementById('body'));
	observerList.observe(document.getElementById('body'), config);

	app.checkObjects = (data) => {
		for (const [type, elements] of Object.entries(data)) {
			// console.log(elements);
			elements.forEach(element => {
				// TODO: 09.04.2025 invece di recuperare tutto il json_value, implementare, come fatto in BisheetController->index()
				// un result che restituisce solo i dati che servono qui (updated_at, type, workbook_ref, ecc...)
				const dbElement = (type === "sheet" || type === 'workbook') ? element : JSON.parse(element.json_value);
				// debugger;
				// const dbElement = JSON.parse(element.json_value);
				const localElement = JSON.parse(localStorage.getItem(dbElement.token));
				// console.log(element, element.token);
				// verifico lo stato dell'elemento in ciclo rispetto al localStorage
				// (sincronizzato, non sincronizzato, ecc...)
				const div = document.querySelector(`div[data-type='${type}']`);
				// let li;
				if (div.querySelector(`li[id='${dbElement.token}']`)) {
					// l'elemento in ciclo (dal db) è presente anche in locale
					const li = div.querySelector(`li[id='${dbElement.token}']`);
					const statusIcon = li.querySelector('i[data-sync-status]');
					li.dataset.sync = 'true';
					// verifico se l'elemento in ciclo è "identico" all'elemento in storage
					// FIX: Codice utilizzato temporaneamente. Modificherò questo codice quando
					// tutti i Controller relativi al metadato avranno la colonna updated_at come fatto in bi_sheets
					// Inoltre tutti gli oggetti memorizzati dovranno avere, sia in locale che su db, le date formattate con ISO 8601, come
					// fatto con bi_sheets
					let db_updated_at;
					// if (dbElement.token === 'xxiwl72') {
					if (type === 'sheet' || type === 'workbook') {
						db_updated_at = new Date(dbElement.updated_at);
						db_updated_at.setUTCHours(db_updated_at.getHours());
						db_updated_at = db_updated_at.toISOString();
					} else {
						db_updated_at = dbElement.updated_at;
					}
					// if (dbElement.updated_at && (localElement.updated_at === dbElement.updated_at)) {
					if (dbElement.updated_at && (localElement.updated_at === db_updated_at)) {
						// oggetti identici
						li.dataset.identical = 'true';
						statusIcon.classList.add('done');
						statusIcon.innerText = "done";
					} else {
						// oggetti con updated_at diverse
						// TODO: qui devo scegliere se fare un aggiornamento locale->DB oppure DB->locale
						li.dataset.identical = 'false';
						statusIcon.innerText = "sync_problem";
					}
				} else {
					// l'elemento non è presente in locale
					// aggiungo l'elemento alla <ul> con attributo data-storage="db"
					app.addElement(dbElement.token, dbElement, 'db');
				}
			});
		}
	}

	app.getDB = async () => {
		// promise.all, recupero tutti gli elementi presenti sul DB (dimensioni, cubi, filtri, ecc...)
		const urls = [
			'/fetch_api/versioning/workbooks',
			'/fetch_api/versioning/sheets'
		];
		// ottengo tutte le risposte in un array
		await Promise.all(urls.map(url => fetch(url)))
			.then(responses => {
				return Promise.all(responses.map(response => {
					if (!response.ok) { throw Error(response.statusText); }
					return response.json();
				}))
			})
			.then((data) => {
				data.forEach((elementData) => app.checkObjects(elementData));
			})
			.catch(err => console.error(err));
	}

	app.addElement = (token, object, storage) => {
		const content_li = app.tmpl_li.content.cloneNode(true);
		const li = content_li.querySelector('li');
		const liContent = li.querySelector('.li-content');
		const inputCheck = li.querySelector('input');
		const statusIcon = li.querySelector('i[data-sync-status]');
		const span = li.querySelector('span[data-value]');
		// const updated_at = li.querySelector('span[data-updated_at]');
		if (storage === 'db') statusIcon.innerText = 'sync';
		inputCheck.dataset.id = token;
		inputCheck.dataset.type = object.type;
		inputCheck.addEventListener('click', app.checked);
		li.dataset.elementSearch = object.type;
		li.dataset.storage = storage;
		li.id = token;
		liContent.dataset.token = token;
		liContent.dataset.storage = storage;
		liContent.dataset.type = object.type;
		// la proprietà workbook_ref viene impostata come dataset
		if (object.hasOwnProperty('workbook_ref')) {
			li.dataset.workbookRef = object.workbook_ref;
			// TODO recupero il nome del WorkBook a cui è associato questa risorsa
			// Questo deve essere fatto DOPO il caricamento degli oggetti dal DB
			// const workbookName = document.querySelector(`#ul-workbook > li[id='${object.workbook_ref}']`);
			// workBookRef.innerText = workbookName.dataset.label;
		}
		switch (object.type) {
			case 'sheet':
			case 'workbook':
				// case 'filter':
				li.dataset.label = object.name;
				span.dataset.value = object.name;
				span.innerText = object.name;
				break;
			default:
				li.dataset.label = object.alias;
				span.dataset.value = object.alias;
				span.innerText = object.alias;
				break;
		}
		document.querySelector(`#ul-${object.type}`).appendChild(li);
	}

	app.getLocal = () => {
		// lista di tutti gli sheet del workbook in ciclo
		const databaseId = +document.querySelector('main').dataset.databaseId;
		for (const [token, object] of Object.entries(Storage.getAll(databaseId))) {
			app.addElement(token, object, 'local');
		}
	}

	// Verifico gli elementi selezionati in modo da abilitare/disabilitare alcuni tasti in
	// .allButtons
	app.checkVersioning = (type) => {
		// Ciclo gli elementi selezionati
		console.clear();
		// se è stato selezionato più di un elemento visualizzo .allButtons
		const countChecked = document.querySelectorAll(`#ul-${type} li input:checked`).length;
		// visualizzo/nascondo .allButtons
		document.querySelector(`menu.allButtons[data-id='${type}']`).hidden = (countChecked) ? false : true;
		if (countChecked) {
			const allButtons = {
				upload: document.querySelector(`button[data-type='${type}'][data-upload]`),
				download: document.querySelector(`button[data-type='${type}'][data-download]`),
				upgrade: document.querySelector(`button[data-type='${type}'][data-upgrade]`),
				delete: document.querySelector(`button[data-type='${type}'][data-delete]`),
			}
			// Not Sync abilita i tasti download, upgrade, delete
			const NotSync = [...document.querySelectorAll(`#ul-${type} input:checked`)].every(el => el.parentElement.dataset.sync === 'false' && el.parentElement.dataset.storage === 'local');
			(NotSync) ? allButtons.upload.disabled = false : allButtons.upload.disabled = true;
			// data-synx=false data-storage=db : Visualizzazione download
			// elementi presenti SOLO su DB
			const NotSyncDB = [...document.querySelectorAll(`#ul-${type} input:checked`)].every(el => el.parentElement.dataset.sync === 'false' && el.parentElement.dataset.storage === 'db');
			(NotSyncDB) ? allButtons.download.disabled = false : allButtons.download.disabled = true;
			if (!NotSyncDB && !NotSync) {
				// data-sync=true e data-identical=false
				const notIdentical = [...document.querySelectorAll(`#ul-${type} input:checked`)].every(el => el.parentElement.dataset.sync === 'true' && el.parentElement.dataset.identical === 'false');
				if (notIdentical) {
					allButtons.download.disabled = false;
					allButtons.upgrade.disabled = false;
				} else {
					allButtons.download.disabled = true;
					allButtons.upgrade.disabled = true;
				}
			}
		}
	}

	app.downloadAll = async (e) => {
		const type = e.target.dataset.type;
		let urls = [];
		document.querySelectorAll(`#ul-${type} li input:checked`).forEach(el => {
			urls.push(`/fetch_api/name/${el.dataset.id}/${type}_show`);
		});
		// ottengo tutte le risposte in un array
		await Promise.all(urls.map(url => fetch(url)))
			.then(responses => {
				return Promise.all(responses.map(response => {
					if (!response.ok) { throw Error(response.statusText); }
					return response.json();
				}))
			})
			.then((data) => {
				if (data) {
					data.forEach(json => {
						let created_at, updated_at;
						switch (type) {
							case 'sheet':
								// aggiungo le specs alla proprietà 'specs' all'interno del json
								console.log(json);
								// NOTE: utilizzo di un metodo static
								created_at = Sheets.getISOStringDate(json.sheet_created_at);
								updated_at = Sheets.getISOStringDate(json.sheet_updated_at);
								const sheet = {
									datamartId: +json.datamartId,
									facts: JSON.parse(json.json_facts),
									name: json.name,
									token: json.token,
									sheet: JSON.parse(json.json_value),
									specs: JSON.parse(json.json_specs),
									type: 'sheet',
									userId: json.userId,
									workbook_ref: json.workbookId,
									created_at,
									updated_at
								};
								Storage.save(sheet);
								break;
							case 'workbook':
								console.log(json);
								created_at = Sheets.getISOStringDate(json.workbook_created_at);
								updated_at = Sheets.getISOStringDate(json.workbook_updated_at);
								const workbook = {
									token: json.token,
									name: json.name,
									databaseId: +json.connectionId,
									svg: JSON.parse(json.svg),
									type: 'workbook',
									dataModel: JSON.parse(json.json_value).dataModel,
									dateTime: JSON.parse(json.json_value).dateTime,
									joins: JSON.parse(json.json_value).joins,
									worksheet: JSON.parse(json.worksheet),
									created_at,
									updated_at
								};
								Storage.save(workbook);
								break;
							default:
								Storage.save(JSON.parse(json.json_value));
								break;
						}
						// aggiorno lo status dell'elemento dopo il download
						const li = document.getElementById(`${json.token}`);
						const statusIcon = li.querySelector('i[data-sync-status]');
						li.dataset.sync = 'true';
						li.dataset.identical = 'true';
						statusIcon.classList.add('done');
						statusIcon.innerText = "done";
					});
					// de-seleziono gli elementi selezionati
					app.unselect(type);
					App.showConsole('Sincronizzazione completata!', 'done', 3000);
				} else {
					App.showConsole('Errori nella sincronizzazione degli elementi', 'error', 3000);
				}
			})
			.catch(err => console.error(err));
	}

	app.uploadAll = async (e) => {
		const type = e.target.dataset.type;
		let requests = [], tokens = [];
		document.querySelectorAll(`#ul-${type} li input:checked`).forEach(el => {
			const json = JSON.parse(window.localStorage.getItem(el.dataset.id));
			tokens.push(el.dataset.id);
			console.log(json);
			const params = JSON.stringify(json);
			const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
			requests.push(new Request(`/fetch_api/json/${type}_store`, init));
		});
		// ottengo tutte le risposte in un array
		await Promise.all(requests.map(req => fetch(req)))
			.then(responses => {
				return Promise.all(responses.map(response => {
					if (!response.ok) { throw Error(response.statusText); }
					return response.json();
				}))
			})
			.then((data) => {
				// console.log(data);
				if (data) {
					tokens.forEach(token => {
						// aggiorno lo status dell'elemento dopo l'upload
						const li = document.getElementById(token);
						const statusIcon = li.querySelector('i[data-sync-status]');
						li.dataset.sync = 'true';
						li.dataset.identical = 'true';
						statusIcon.classList.add('done');
						statusIcon.innerText = "done";
					});
					// de-seleziono gli elementi selezionati
					app.unselect(type);
					App.showConsole('Sincronizzazione completata!', 'done', 3000);
				} else {
					// console.error("Errore nell'aggiornamento della risorsa");
					App.showConsole('Errori nella sincronizzazione degli elementi', 'error', 3000);
				}
			})
			.catch(err => console.error(err));
	}

	app.upgradeAll = async (e) => {
		const type = e.target.dataset.type;
		let requests = [], tokens = [];
		document.querySelectorAll(`#ul-${type} li input:checked`).forEach(el => {
			const json = JSON.parse(window.localStorage.getItem(el.dataset.id));
			tokens.push(el.dataset.id);
			const params = JSON.stringify(json);
			const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
			requests.push(new Request(`/fetch_api/json/${type}_update`, init));
		});
		// ottengo tutte le risposte in un array
		await Promise.all(requests.map(req => fetch(req)))
			.then(responses => {
				return Promise.all(responses.map(response => {
					if (!response.ok) { throw Error(response.statusText); }
					return response.json();
				}))
			})
			.then((data) => {
				if (data) {
					tokens.forEach(token => {
						// aggiorno lo status dell'elemento dopo l'upload
						const li = document.getElementById(token);
						const statusIcon = li.querySelector('i[data-sync-status]');
						li.dataset.sync = 'true';
						li.dataset.identical = 'true';
						statusIcon.classList.add('done');
						statusIcon.innerText = "done";
					});
					// de-seleziono gli elementi selezionati
					app.unselect(type);
					App.showConsole('Sincronizzazione completata!', 'done', 3000);
				} else {
					App.showConsole('Errori nella sincronizzazione degli elementi', 'error', 3000);
				}
			})
			.catch(err => console.error(err));
	}

	app.deleteAll = async (e) => {
		const type = e.target.dataset.type;
		let urls = [], tokens = [];
		document.querySelectorAll(`#ul-${type} li input:checked`).forEach(el => {
			urls.push(`/fetch_api/name/${el.dataset.id}/${type}_destroy`);
			tokens.push(el.dataset.id);
		});
		// ottengo tutte le risposte in un array
		await Promise.all(urls.map(url => fetch(url)))
			.then(responses => {
				return Promise.all(responses.map(response => {
					if (!response.ok) { throw Error(response.statusText); }
					return response.json();
				}))
			})
			.then((data) => {
				if (data) {
					// console.log(data);
					tokens.forEach(token => {
						// aggiorno lo status dell'elemento dopo l'upload
						const li = document.getElementById(token);
						window.localStorage.removeItem(token);
						// elimino anche dal DOM l'elemento
						li.remove();
					});
					App.showConsole('Sincronizzazione completata!', 'done', 3000);
				} else {
					// console.error("Errore nell'aggiornamento della risorsa");
					App.showConsole('Errori nella sincronizzazione degli elementi', 'error', 3000);
				}
				// reimposto l'oggetto dopo la promise, impostando i vari dataset, sync, identical, ecc...
			})
			.catch(err => console.error(err));
	}

	document.querySelectorAll('button[data-select-all]').forEach(button => {
		button.addEventListener('click', (e) => {
			let type = e.currentTarget.dataset.type;
			document.querySelectorAll(`.relative-ul[data-id='${type}'] li:not([hidden]) input`).forEach(input => input.checked = true);
			// visualizzo il menu.allButtons corrispondente
			document.querySelector(`menu.allButtons[data-id='${type}']`).hidden = false;
			app.checkVersioning(type);
		});
	});

	// de-seleziono tutti gli elementi selezionati
	app.unselect = (type) => {
		// type : workbook, sheet, metric, filter
		document.querySelectorAll(`.relative-ul[data-id='${type}'] input:checked`).forEach(input => input.checked = false);
		// nascondo il menu.allButtons corrispondente
		document.querySelector(`menu.allButtons[data-id='${type}']`).hidden = true;
	}

	document.querySelectorAll('button[data-unselect-all]').forEach(button => button.addEventListener('click', (e) => app.unselect(e.currentTarget.dataset.type)));

	app.checked = (e) => app.checkVersioning(e.target.dataset.type);

	app.init = () => {
		// scarico elenco oggetti dal DB (WorkBooks, WorkSheets e Sheets)
		// visualizzo oggetti locali (da qui possono essere salvati su DB)
		// imposto data-fn sugli elementi di ul-objects
		document.querySelectorAll('menu').forEach(menu => menu.dataset.init = 'true');
		// recupero tutti gli elementi in localStorage per inserirli nelle rispettive <ul> impostate in hidden
		app.getLocal();
		app.getDB();
	}

	app.selectObject = (e) => {
		document.querySelectorAll('menu button[data-selected]').forEach(button => delete button.dataset.selected);
		e.target.dataset.selected = 'true';
		// nascondo la <ul> attualmente visibile
		// visualizzo la <ul> corrispondente all'object selezionato
		document.querySelectorAll('.details.menu section[data-id]').forEach(section => {
			section.hidden = (section.dataset.id === e.currentTarget.id) ? false : true;
		});
	}

	app.showResource = (e) => {
		const refs = {
			"created_at": document.querySelector('#created_at > span[data-value]'),
			"updated_at": document.querySelector('#updated_at > span[data-value]'),
			"note": document.querySelector('#note > span[data-value]')
		};
		if (e.currentTarget.dataset.type === 'workbook') {
			// è stato selezionato un workbook, rivisualizzo eventuali elementi nascosti da precedenti
			// selezioni (un altro workbook) per nascondere
			// reset elementi precedendemente selezionati
			document.querySelectorAll(`#ul-workbook li:not([id='${e.currentTarget.dataset.token}']) > div[data-selected]`).forEach(element => delete element.dataset.selected);
		} else {
			// reset elementi precedendemente selezionati
			document.querySelectorAll(`li[data-workbook-ref]:not([id='${e.currentTarget.dataset.token}']) > div[data-selected]`).forEach(element => delete element.dataset.selected);
		}
		e.currentTarget.toggleAttribute('data-selected');
		if (e.currentTarget.hasAttribute('data-selected')) {
			// visualizzo alcune informazione sull'elemento selezionato
			// e le inserisco nel template corrispondente
			if (e.currentTarget.dataset.storage === 'local') {
				const resource = window.localStorage.getItem(e.currentTarget.dataset.token);
				const json = JSON.parse(resource);
				console.log(json);
				// se l'elemento ha dataset.storage='DB' vuol dire che NON è presente in locale, quindi per
				// visualizzare le sue proprietà dovrò fare una FETCH verso il DB, altrimenti lo recupero dallo storage
				for (const [key, value] of Object.entries(refs)) {
					value.innerText = (json[key]) ? json[key] : null;
				}
			} else {
				// DB
			}
		} else {
			// ripulisco i riferimenti del refs
			refs.created_at.innerText = '';
		}
		if (e.currentTarget.dataset.type === 'workbook') {
			[...document.querySelectorAll('li[data-workbook-ref]')].filter(element => {
				element.hidden = (element.dataset.workbookRef === e.currentTarget.dataset.token || e.currentTarget.dataset.selected === undefined) ? false : true;
				element.dataset.searchable = (element.dataset.workbookRef === e.currentTarget.dataset.token || e.currentTarget.dataset.selected === undefined) ? true : false;
			});
		}
	}

	app.init();

})();
