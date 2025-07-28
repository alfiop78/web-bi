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

	/*
	* Verifico lo stato degli oggetti:
	* sincronizzato
	* conflitto di sincronizzazione
	* presente solo su sb
	* presente solo in locale
	* */
	app.checkStatus = () => {
		// lista di tutti gli elementi dello storage
		const databaseId = +document.querySelector('main').dataset.databaseId;
		for (const [token, object] of Storage.getAll(databaseId)) {
			// WARN: 28.07.2025 al momento verifico solo gli workbook
			if (object.type === 'workbook') {
				console.log(object.type);
				const parent = document.querySelector(`#ul-${object.type}`);
				// Verifico se l'elemento in ciclo è presente su db
				const li_db = document.getElementById(token);
				if (li_db) {
					li_db.dataset.storage = 'db';
					li_db.dataset.sync = 'true';
					// l'elemento del localStorage è presente anche sul db, verifico lo
					// stato della sincronizzazione
					let updated_db = new Date(li_db.dataset.updated);
					updated_db.setUTCHours(updated_db.getHours());
					updated_db = updated_db.toISOString();
					if (updated_db === object.updated_at) {
						// oggetti identici
						li_db.dataset.identical = 'true';
						li_db.querySelector('i[data-sync-status]').classList.add('done');
						li_db.querySelector('i[data-sync-status]').innerText = 'done';
					} else {
						// oggetti con updated_at diverse
						// TODO: qui devo scegliere se fare un aggiornamento locale->DB oppure DB->locale
						li_db.dataset.identical = 'false';
						li_db.querySelector('i[data-sync-status]').innerText = 'sync_problem';
					}
				} else {
					// l'elemento non è presente sul db
					const content_li = app.tmpl_li.content.cloneNode(true);
					const li = content_li.querySelector('li');
					const liContent = li.querySelector('.li-content');
					const inputCheck = li.querySelector('input');
					const statusIcon = li.querySelector('i[data-sync-status]');
					const span = li.querySelector('span[data-value]');
					inputCheck.dataset.id = token;
					inputCheck.dataset.type = object.type;
					inputCheck.addEventListener('click', app.checked);
					li.dataset.elementSearch = object.type;
					li.id = token;
					liContent.dataset.token = token;
					liContent.dataset.type = object.type;
					// la proprietà workbook_ref viene impostata come dataset
					if (object.hasOwnProperty('workbook_ref')) {
						li.dataset.workbookRef = object.workbook_ref;
					}
					li.dataset.label = object.name;
					span.dataset.value = object.name;
					span.innerText = object.name;
					statusIcon.innerText = 'sync';
					li.dataset.storage = 'local';
					liContent.dataset.storage = 'local';
					console.log(li);
					console.log(object.name);
					debugger;
					parent.appendChild(li);
				}
			}
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
		// scarico elenco oggetti dal DB (WorkBooks e Sheets)
		// visualizzo oggetti locali (da qui possono essere salvati su DB)
		// imposto data-fn sugli elementi di ul-objects
		document.querySelectorAll('menu').forEach(menu => menu.dataset.init = 'true');
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
		// Mappatura dei campi da visualizzare
		const refs = {
			token: document.querySelector('#token > span[data-value]'),
			created_at: document.querySelector('#created_at > span[data-value]'),
			updated_at: document.querySelector('#updated_at > span[data-value]'),
			note: document.querySelector('#note > span[data-value]')
		};
		const options = {
			weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", fractionalSecondDigits: 3
		};
		// verifico se è stato selezionato un WorkBook, in questo caso devo visualizzare/nascondere gli Sheets
		(e.currentTarget.dataset.type === 'workbook') ?
			document.querySelectorAll(`#ul-workbook li:not([id='${e.currentTarget.dataset.token}']) > div[data-selected]`).forEach(element => delete element.dataset.selected) :
			document.querySelectorAll(`li[data-workbook-ref]:not([id='${e.currentTarget.dataset.token}']) > div[data-selected]`).forEach(element => delete element.dataset.selected);

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
					if (key === 'created_at' || key === 'updated_at') {
						const date = new Date(json[key]);
						date.setHours(date.getUTCHours());
						value.innerHTML = new Intl.DateTimeFormat("it-IT", options).format(date);
					} else {
						value.innerText = (json[key]) ? json[key] : null;
					}
				}
			} else {
				// DB
				debugger;
			}
		} else {
			// ripulisco i riferimenti del refs
			Object.values(refs).forEach(span => span.innerText = '');
		}
		if (e.currentTarget.dataset.type === 'workbook') {
			[...document.querySelectorAll('li[data-workbook-ref]')].filter(element => {
				element.hidden = (element.dataset.workbookRef === e.currentTarget.dataset.token || e.currentTarget.dataset.selected === undefined) ? false : true;
				element.dataset.searchable = (element.dataset.workbookRef === e.currentTarget.dataset.token || e.currentTarget.dataset.selected === undefined) ? true : false;
			});
		}
	}

	// app.init();

	app.checkStatus();

})();
