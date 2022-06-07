var App = new Application();
var storage = new Storages();
(() => {
	var app = {
		// btn
		btnCubes : document.getElementById('navBtnCubes'),
		btnDimensions : document.getElementById('navBtnDimensions'),
		btnMetrics : document.getElementById('navBtnMetrics'),
		btnFilters : document.getElementById('navBtnFilters'),
		btnProcesses : document.getElementById('navBtnProcesses'),
		// checkbox switch Locale / DB
		btnSwitchLocalDB : document.getElementById('chk-local-db-switch'),
		// dialog
		dialogVersioning : document.getElementById('versioning'),

		// template per lo status degli oggetti da versionare
		tmplVersioningDB : document.getElementById('versioning-db'),
		btnVersioningStatus : document.getElementById('btn-versioning-status'),
		btnVersioningProcess : document.getElementById('btn-versioning')
	}

	app.checkVersioning = () => {
		// elementi in locale diversi dalla copia su DB, occorre azione manuale
		const warningElements = app.dialogVersioning.querySelectorAll('.versioning-status > .vers-status > i.md-warning');
		// elementi presenti solo in locale, in fase di sviluppo
		const attentionElements = app.dialogVersioning.querySelectorAll('.versioning-status > .vers-status > i.md-attention');
		// elementi scaricati dal DB
		const doneElements = app.dialogVersioning.querySelectorAll('.versioning-status > .vers-status > i.md-done'); // elementi non presenti in locale e scaricati da DB
		// elementi già precedentemente scaricati e invariati, già aggiornati in locale
		const unmodifiedElements = app.dialogVersioning.querySelectorAll('.versioning-status > .vers-status > i.md-status'); // elementi non modificati perchè sincronizzati con il DB
		// console.log('warningElements : ', warningElements.length);
		// console.log('attentionElements : ', attentionElements.length);
		// console.log('doneElements : ', doneElements.length);
		// console.log('unmodifiedElements : ', unmodifiedElements.length);
		// se sono presenti elementi coloro l'icona per notificare questi elementi
		if (warningElements.length !== 0 || attentionElements.length !== 0 || doneElements.length !== 0) app.btnVersioningStatus.classList.add('md-warning');
		if (warningElements.length !== 0) {
			document.querySelector('#warning-elements').hidden = false;
			const p = (warningElements.length === 1) ? document.querySelector('#warning-elements > p[data-text-singular]') : document.querySelector('#warning-elements > p[data-text-plural]');
			p.hidden = false;
			if (p.hasAttribute('data-text-plural') ) p.querySelector('strong').innerHTML = warningElements.length;
		}
		if (attentionElements.length !== 0) {
			document.querySelector('#attention-elements').hidden = false;
			const p = (attentionElements.length === 1) ? document.querySelector('#attention-elements > p[data-text-singular]') : document.querySelector('#attention-elements > p[data-text-plural]');
			p.hidden = false;
			if (p.hasAttribute('data-text-plural') ) p.querySelector('strong').innerHTML = attentionElements.length;
		}
		if (doneElements.length !== 0) {
			document.querySelector('#done-elements').hidden = false;
			const p = (doneElements.length === 1) ? document.querySelector('#done-elements > p[data-text-singular]') : document.querySelector('#done-elements > p[data-text-plural]');
			p.hidden = false;
			if (p.hasAttribute('data-text-plural') ) p.querySelector('strong').innerHTML = doneElements.length;
		} 
		if (unmodifiedElements.length !== 0) {
			document.querySelector('#sync-elements').hidden = false;
			const p = (unmodifiedElements.length === 1) ? document.querySelector('#sync-elements > p[data-text-singular]') : document.querySelector('#sync-elements > p[data-text-plural]');
			p.hidden = false;
			if (p.hasAttribute('data-text-plural') ) p.querySelector('strong').innerHTML = unmodifiedElements.length;
		}
		app.btnVersioningStatus.classList.remove('md-inactive');
	}

	app.getLocalElements = (data) => {
		// recupero elementi locali
		for (element in data) {
			// console.log('element : ', element); // dimensions, cubes, ecc...
			// let objectsSet = new Map();
			console.log('element : ', element);
			let objectsMap;
			// let objectsMap = new Map();
			switch (element) {
				case 'dimensions':
					objectsMap = storage.dimensions;
					break;
				case 'cubes':
					objectsMap = storage.cubes;
					break;
				case 'filters':
					objectsMap = storage.filters;
					break;
				case 'metrics':
					objectsMap = storage.metrics;
					break;
				default:
					objectsMap = storage.processes;
					break;
			}
			// console.log('objectsSet : ', objectsSet);
			data[element].forEach( (el) => {
				// se l'elemento in local è già presente sul DB lo elimino dal Map dimensions, gli elementi rimanenti da questa operazione andranno ad aggiungersi alla Dialog Versioning
				// ... questi sono elementi che si trovano SOLO in local, es.: in fase di sviluppo in locale
				if (objectsMap.has(el.token)) objectsMap.delete(el.token);
			});
			for ( const [token, value] of objectsMap) {
				console.log('token : ', token);
				const tmplContent = app.tmplVersioningDB.content.cloneNode(true);
				let sectionSearchable = tmplContent.querySelector('section[data-searchable]')
				let versioningStatus = tmplContent.querySelector('.versioning-status');
				let iconStatus = versioningStatus.querySelector('i');
				let descrStatus = versioningStatus.querySelector('.vers-status-descr');
				let actions = versioningStatus.querySelector('.vers-actions');
				const parent = document.querySelector("section[data-versioning-elements] div[data-id='versioning-content'][data-object='" + element + "']");
				iconStatus.innerText = 'warning';
				iconStatus.classList.add('md-attention');
				descrStatus.innerText = 'In locale';
				versioningStatus.querySelector('.vers-title > div[data-name]').innerText = value.name;
				sectionSearchable.dataset.elementSearch = 'versioning-db-search';
				sectionSearchable.dataset.objectStorage = 'local';
				sectionSearchable.dataset.objectType = element;
				sectionSearchable.dataset.objectName = value.name;
				sectionSearchable.dataset.token = token;
				// sectionSearchable.dataset.token = token;
				// icona per recuperare manualmente l'elemento
				actions.querySelector('i[data-id="btn-upload-local-object"]').removeAttribute('hidden');
				actions.querySelector('i[data-id="btn-upload-local-object"]').dataset.objectName = value.name;
				actions.querySelector('i[data-id="btn-upload-local-object"]').dataset.token = token;
				actions.querySelector('i[data-id="btn-upload-local-object"]').dataset.objectType = element;
				// imposto, sull'icona delete, gli attributi per eseguire la cancellazione. Aggiungo un ulteriore attributo per differenziare gli elementi in localStorage da quelli su DB.
				actions.querySelector('i[data-id="btn-delete"]').dataset.objectName = value.name;
				actions.querySelector('i[data-id="btn-delete"]').dataset.token = token;
				actions.querySelector('i[data-id="btn-delete"]').dataset.objectType = element;
				// NOTE: se è presente l'attributo data-object-storage, l'elemento deve essere eliminato SOLO dal LocalStorage, altrimenti sia dal LocalStorage che dal DB.
				actions.querySelector('i[data-id="btn-delete"]').dataset.objectStorage = true;
				parent.appendChild(sectionSearchable);
			}
		}
	}

	// versioning
	// popolo gli elementi restituiti dalle chiamate fetch API nei tasti nel drawer (Dimensioni, Cubi, ecc...)
	app.createVersioningElements = (data) => {
		// ciclo le dimensioni per inserirle nella dialog #versioning ed anche nello storage in locale
		// icona 'versioning-status' nella actions, questa icona viene colorata in base agli Oggetti trovati qui, in base a questo schema:
		// rossa : ci sono elementi non sincronizzati DB/Local
		// normal : Tutti gli elementi sono aggiornati DB/Local
		for (element in data) {
			// console.log('element : ', element);
			data[element].forEach( (el) => {
				// template
				const tmplContent = app.tmplVersioningDB.content.cloneNode(true);
				let sectionSearchable = tmplContent.querySelector('section[data-searchable]')
				let versioningStatus = tmplContent.querySelector('.versioning-status');
				let iconStatus = versioningStatus.querySelector('i');
				let descrStatus = versioningStatus.querySelector('.vers-status-descr');
				let actions = versioningStatus.querySelector('.vers-actions');
				const parent = document.querySelector("section[data-versioning-elements] div[data-id='versioning-content'][data-object='" + element + "']");

				const jsonParsedDB = JSON.parse(el.json_value);
				const jsonParsedLocal = JSON.parse(window.localStorage.getItem(jsonParsedDB.token));
				// se l'elemento recuperato dal DB è già presente in localStorage, ed è diverso, non lo aggiorno, si potrà scegliere di aggiornarlo/sovrascriverlo successivamente
				// console.log(jsonParsed.name);
				// console.log(JSON.parse(window.localStorage.getItem(jsonParsed.name)).name);
			
				// verifico prima se è presente l'elemento nello storage altrimenti nella if ho un errore a causa della prop 'token', se non esiste un determinato Elemento
				if ( jsonParsedLocal ) {
					// se l'elemento è già presente in locale verifico anche se il suo contenuto è uguale a quello del DB
					console.log(jsonParsedDB, jsonParsedLocal);
					// debugger;
					if ( jsonParsedDB.token === jsonParsedLocal.token ) {
						console.log('elemento presente in locale : ', jsonParsedLocal);
						// debugger;
						// console.log('elemento già presente in locale', jsonParsed.name);
						if ( jsonParsedDB.updated_at === jsonParsedLocal.updated_at ) {
							console.info('elementi sono identici');
							// console.info('UGUALE CONTENTUO JSON, ELEMENTO RESTA INVARIATO IN LOCALE');
							iconStatus.innerText = 'sync';
							iconStatus.classList.add('md-status'); // darkgrey
							descrStatus.innerText = 'Sincronizzato';
							// icona delete
							actions.querySelector('i[data-id="btn-delete"]').dataset.objectType = element;
							actions.querySelector('i[data-id="btn-delete"]').dataset.token = jsonParsedDB.token;
						} else {
							// elemento presente ma contenuto diverso dal DB, da aggiornare manualmente
							iconStatus.innerText = 'sync_problem';
							iconStatus.classList.add('md-warning'); // brown
							descrStatus.innerText = 'Non sincronizzato';
							// icona per recuperare manualmente l'elemento
							actions.querySelector('i[data-id="btn-download"]').removeAttribute('hidden');
							actions.querySelector('i[data-id="btn-download"]').dataset.objectType = element;
							actions.querySelector('i[data-id="btn-download"]').dataset.token = jsonParsedDB.token;
							// icona per versionare da Sviluppo->Produzione
							actions.querySelector('i[data-id="btn-upgrade-production"]').removeAttribute('hidden');
							actions.querySelector('i[data-id="btn-upgrade-production"]').dataset.objectType = element;
							actions.querySelector('i[data-id="btn-upgrade-production"]').dataset.token = jsonParsedDB.token;
						}
					}
				} else {
					// elemento non presente in locale, lo salvo direttamente
					console.info('elemento non presente in locale');
					window.localStorage.setItem(jsonParsedDB.token, el.json_value);
					iconStatus.innerText = 'done';
					iconStatus.classList.add('md-done');
					descrStatus.innerText = 'Aggiornato';
				}
				versioningStatus.querySelector('.vers-title > div[data-name]').innerText = jsonParsedDB.name;
				const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false, timeZone: 'Europe/Rome' };
				versioningStatus.querySelector('.vers-title  span[data-created-at]').innerText = new Intl.DateTimeFormat('it-IT', options).format(new Date(el.created_at));
				versioningStatus.querySelector('.vers-title span[data-updated-at]').innerText = new Intl.DateTimeFormat('it-IT', options).format(new Date(el.updated_at));
				sectionSearchable.dataset.objectType = element;
				sectionSearchable.dataset.token = jsonParsedDB.token;
				// icona delete
				actions.querySelector('i[data-id="btn-delete"]').dataset.token = jsonParsedDB.token;
				actions.querySelector('i[data-id="btn-delete"]').dataset.objectType = element;
				sectionSearchable.dataset.elementSearch = 'versioning-db-search';
				sectionSearchable.dataset.label = jsonParsedDB.name;
				parent.appendChild(sectionSearchable);
			});
		}
	}

	app.saveObjectOnDB = async (token, type) => {
		let url;
		const json = JSON.parse(window.localStorage.getItem(token));
		const params = JSON.stringify(json);
		const init = {headers: {'Content-Type': 'application/json'}, method: 'POST', body: params};
		switch (type) {
			case 'dimensions':
				url = '/fetch_api/json/dimension_store';
				break;
			case 'cubes':
				url = '/fetch_api/json/cube_store';
				break;
			case 'filters':
				url = '/fetch_api/json/filter_store';
				break;
			case 'metrics':
				url = '/fetch_api/json/metric_store';
				break;
			default:
				url = '/fetch_api/json/process_store';
				break;
		}
		// recupero l'elemento da salvare su db, presente nello storage
		// console.log(JSON.stringify(json));
		const req = new Request(url, init);
		await fetch(req)
			.then((response) => {
				if (!response.ok) { throw Error(response.statusText); }
				return response;
			})
			.then((response) => response.json())
			.then((data) => {
				// console.log(data);
				if (data) {
					console.log('data : ', data);
					console.log(token,' SALVATO CORRETTAMENTE');
					// reimposto l'icona in .vers-status
					const sectionElement = app.dialogVersioning.querySelector("section[data-token='" + token + "'][data-object-type='" + type + "']");
					sectionElement.querySelector('.vers-status > i').innerText = 'sync';
					sectionElement.querySelector('.vers-status > i').classList.replace('md-attention', 'md-status');
					// reimposto la descr.status su 'Sincronizzato'
					sectionElement.querySelector('.vers-status-descr').innerText = 'Sincronizzato';
					// reimposto l'icona con data-id="btn-delete" eliminando l'attributo data-object-storage (in questo modo, quando si elimina un elemento si elimina da DB/local)
					sectionElement.querySelector('.vers-actions i[data-id="btn-delete"]').removeAttribute('data-object-storage');
					// nascondo l'icona 
					sectionElement.querySelector('.vers-actions span[data-upload]').hidden = true;
				} else {
					console.error('Elemento non salvato su DB');
				}
			})
		.catch((err) => console.error(err));
	}

	app.deleteObjectOnDB = async (token, type) => {
		let url;
		// const json = JSON.stringify(window.localStorage.getItem(name));
		// const json = window.localStorage.getItem(name);
		// console.log('json', json);
		// console.log('json', window.localStorage.getItem(name));
		// console.log('json', JSON.stringify(window.localStorage.getItem(name)));
		switch (type) {
			case 'dimensions':
				url = '/fetch_api/name/'+token+'/dimension_destroy';
				break;
			case 'cubes':
				url = '/fetch_api/name/'+token+'/cube_destroy';
				break;
			case 'filters':
				url = '/fetch_api/name/'+token+'/filter_destroy';
				break;
			case 'metrics':
				url = '/fetch_api/name/'+token+'/metric_destroy';
				break;
			default:
				url = '/fetch_api/name/'+token+'/process_destroy';
				break;
		}
		// recupero l'elemento da salvare su db, presente nello storage
		// console.log(JSON.stringify(json));
		await fetch(url)
			.then((response) => {
				if (!response.ok) { throw Error(response.statusText); }
				return response;
			})
			.then((response) => response.json())
			.then((data) => {
				// console.log(data);
				if (data) {
					console.log('data : ', data);
					console.log('ELEMENTO ELIMINATO CON SUCCESSO!');
					// lo elimino anche dal localStorage
					window.localStorage.removeItem(name);
					// elimino anche dal DOM l'elemento
					app.dialogVersioning.querySelector("section[data-object-type='" + type + "'][data-object-token='" + token + "']").remove();
				} else {
					console.error("Problema con l'eliminazione dell'elemento");
				}
			})
		.catch((err) => console.error(err));
	}

	app.downloadObjectFromDB = async (name, type) => {
		let url;
		switch (type) {
			case 'dimensions':
				url = '/fetch_api/name/'+name+'/dimension_show';
				break;
			case 'cubes':
				url = '/fetch_api/name/'+name+'/cube_show';
				break;
			case 'filters':
				url = '/fetch_api/name/'+name+'/filter_show';
				break;
			case 'metrics':
				url = '/fetch_api/name/'+name+'/metric_show';
				break;
			default:
				url = '/fetch_api/name/'+name+'/process_show';
				break;
		}
		await fetch(url)
			.then((response) => {
				if (!response.ok) { throw Error(response.statusText); }
				return response;
			})
			.then((response) => response.json())
			.then((data) => {
				// console.log(data);
				if (data) {
					console.log('data : ', data);
					console.log('ELEMENTO SCARICATO CON SUCCESSO!');
					storage.save = JSON.parse(data.json_value);
					const sectionElement = app.dialogVersioning.querySelector("section[data-object-name='" + name + "'][data-object-type='" + type + "']");
					console.log('sectionElement : ', sectionElement);
					// modifico l'icona in .vers-status impostando sync con la classe md-status al posto di md-warning
					sectionElement.querySelector('.vers-status > i').innerText = 'sync';
					sectionElement.querySelector('.vers-status > i').classList.replace('md-warning', 'md-status');
					// modifico la descrizione in .vers-status-descr impostando "Sincronizzato"
					sectionElement.querySelector('.vers-status-descr').innerText = 'Sincronizzato';
					// nascondo l'icona btn-download e btn-upgrade-production
					sectionElement.querySelector('.vers-actions span[data-download]').hidden = true;
					sectionElement.querySelector('.vers-actions span[data-upgrade]').hidden = true;
				} else {
					// TODO: 
				}
			})
		.catch((err) => console.error(err));
	}

	app.upgradeObjectOnDB = async (token, type) => {
		const json = JSON.parse(window.localStorage.getItem(token));
		const params = JSON.stringify(json);
		const init = {headers: {'Content-Type': 'application/json'}, method: 'POST', body: params};
		let url;
		switch (type) {
			case 'dimensions':
				url = '/fetch_api/json/dimension_update';
				break;
			case 'cubes':
				url = '/fetch_api/json/cube_update';
				break;
			case 'filters':
				url = '/fetch_api/json/filter_update';
				break;
			case 'metrics':
				url = '/fetch_api/json/metric_update';
				break;
			default:
				url = '/fetch_api/json/process_update';
				break;
		}
		const req = new Request(url, init);
		await fetch(req)
			.then((response) => {
				if (!response.ok) { throw Error(response.statusText); }
				return response;
			})
			.then((response) => response.json())
			.then((data) => {
				// console.log(data);
				if (data) {
					console.log('data : ', data);
					console.log('AGGIORNAMENTO AVVENUTO CON SUCCESSO!');
					const sectionElement = app.dialogVersioning.querySelector("section[data-token='" + token + "'][data-object-type='" + type + "']");
					console.log('sectionElement : ', sectionElement);
					// debugger;
					// modifico l'icona in .vers-status impostando sync con la classe md-status al posto di md-warning
					sectionElement.querySelector('.vers-status > i').innerText = 'sync';
					sectionElement.querySelector('.vers-status > i').classList.replace('md-warning', 'md-status');
					// modifico la descrizione in .vers-status-descr impostando "Sincronizzato"
					sectionElement.querySelector('.vers-status-descr').innerText = 'Sincronizzato';
					// nascondo l'icona btn-download e btn-upgrade-production
					// sectionElement.querySelector('.vers-actions span[data-upload]').hidden = true;
					sectionElement.querySelector('.vers-actions span[data-download]').hidden = true;
					sectionElement.querySelector('.vers-actions span[data-upgrade]').hidden = true;
				} else {
					// TODO: 
				}
			})
		.catch((err) => console.error(err));
	}

	// events

	// process sync
	app.btnVersioningProcess.onclick = async () => {
		// promise.all, recupero tutti gli elementi presenti sul DB (dimensioni, cubi, filtri, ecc...)
		const urls = [
			'/fetch_api/versioning/dimensions',
			'/fetch_api/versioning/cubes',
			'/fetch_api/versioning/metrics',
			'/fetch_api/versioning/filters',
			'/fetch_api/versioning/processes'
		];
		// ottengo tutte le risposte in un array
		await Promise.all(urls.map( url => fetch(url) ))
			.then(responses => {
				return Promise.all(responses.map(response => {
					if (!response.ok) {throw Error(response.statusText);}
					return response.json();
				}))
			})
		.then( (data) => {
			/*
			 data : [
				0 : ['dimensions' : [risultato della query]],
				1 : ['cubes' : [risultato della query]],
				2 : ['metrics' : [risultato della query]],
				...
			 ]
			*/
			console.log(data);
			data.forEach( (elementData) => {
				/*
				elementData = [
					'dimensions' : [risultato della query]
					'cubes' : [risultato della query],
					...
					]
				*/
				console.log('elementData : ', elementData);
				app.createVersioningElements(elementData);
				// controllo inverso, recupero gli elementi in locale che non sono presenti sul DB (es.: Dimensioni e cubi in fase di sviluppo)
				app.getLocalElements(elementData);
			});
			// dopo aver caricato tutti gli elementi nella dialog versioning, imposto il colore del tasto btnVersioningStatus in base allo status degli elementi
			app.checkVersioning();
			// imposto la data di ultima sincronizzazione nello span[data-dialog-info]
			const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false, timeZone: 'Europe/Rome' };
			app.dialogVersioning.querySelector('span[data-dialog-info]').innerText = new Intl.DateTimeFormat('it-IT', options).format(new Date());
		} )
		.catch( err => console.error(err));
	}

	app.dialogVersioning.addEventListener('click', (e) => {
		console.log('e.target : ', e.target);
		switch (e.target.dataset.id) {
			case 'btn-upload-local-object':
				// tasto upload
				console.log('btn upload');
				console.log('e.target : ', e.target);
				app.saveObjectOnDB(e.target.dataset.token, e.target.dataset.objectType);
				break;
			case 'btn-delete':
				console.log('btn delete');
				console.log('e.target : ', e.target);
				// elimino l'elemento sia dal localStorage che dal DB. Se è presente l'attributo data-object-storage elimino questo elemento SOLO dallo storage locale (non da DB)
				if (e.target.hasAttribute('data-object-storage')) {
					window.localStorage.removeItem(e.target.dataset.token);
					const type = e.target.dataset.objectType;
					const name = e.target.dataset.objectName;
					// elimino anche dal DOM l'elemento
					app.dialogVersioning.querySelector("section[data-object-type='" + type + "'][data-object-name='" + name + "']").remove();
				} else {
					app.deleteObjectOnDB(e.target.dataset.token, e.target.dataset.objectType);
				}
				break;
			case 'btn-download':
				// download, scarico l'elemento in locale, sovrascrivendo l'elemento già presente
				app.downloadObjectFromDB(e.target.dataset.token, e.target.dataset.objectType);
				break;
			case 'btn-upgrade-production':
				// aggiornamento dell'elemento, sovrascrivo l'elemento presente su DB tramite quello in localStorage
				app.upgradeObjectOnDB(e.target.dataset.token, e.target.dataset.objectType);
				break;
			default:
				break;
		}
	});

	// switch DB / localStorage
	app.btnSwitchLocalDB.onclick = (e) => {
		// console.log('e.target : ', e.target);
		// const span = e.target.parentElement.querySelector('span');
		if (e.target.checked) {
			// abilitato : Visualizzo solo gli elementi in locale
			// span.innerText = 'Locale';
			app.dialogVersioning.querySelectorAll('.versioning-content > section:not([data-object-storage])').forEach( (el) => el.setAttribute('hidden', true));
			app.dialogVersioning.querySelectorAll('.versioning-content > section[data-object-storage]').forEach( (el) => el.removeAttribute('hidden'));
		} else {
			// disabilitato : visualizzo elementi TUTTI gli elementi, DB e LocalStorage (default)
			// span.innerText = 'Database';
			app.dialogVersioning.querySelectorAll('.versioning-content > section').forEach( (el) => el.removeAttribute('hidden', true));
		}
	}

	app.btnVersioningStatus.onclick = () => app.dialogVersioning.showModal();

	app.btnCubes.onclick = (e) => {
		if (document.querySelector('#nav-objects a[selected]')) {
			document.querySelector('#nav-objects a[selected]').removeAttribute('selected');
			// nascondo il div che contiene gli elementi dell'oggetto precedentemente selezionato
			// app.dialogVersioning.querySelector('div[data-id="versioning-content"]:not([data-object="cubes"])').setAttribute('hidden', true);
			app.dialogVersioning.querySelector('div[data-id="versioning-content"]:not([hidden])').setAttribute('hidden', true);
		}

		e.target.setAttribute('selected', true);
		// app.fetchAPIRequestVersioning('/fetch_api/versioning/cubes');
		document.querySelector('div[data-object="cubes"]').removeAttribute('hidden');
	}

	app.btnDimensions.onclick = (e) => {
		// rimuovo il selected da eventuali selezioni precedenti
		if (document.querySelector('#nav-objects a[selected]')) {
			document.querySelector('#nav-objects a[selected]').removeAttribute('selected');
			// nascondo il div che contiene gli elementi dell'oggetto precedentemente selezionato
			// app.dialogVersioning.querySelector('div[data-id="versioning-content"]:not([data-object="dimensions"])').setAttribute('hidden', true);
			app.dialogVersioning.querySelector('div[data-id="versioning-content"]:not([hidden])').setAttribute('hidden', true);
		}

		e.target.setAttribute('selected', true);
		// visualizzo il div[hidden] contenente le dimensioni
		document.querySelector('div[data-object="dimensions"]').removeAttribute('hidden');
	}
	
	app.btnMetrics.onclick = (e) => {
		if (document.querySelector('#nav-objects a[selected]')) {
			document.querySelector('#nav-objects a[selected]').removeAttribute('selected');
			// nascondo il div che contiene gli elementi dell'oggetto precedentemente selezionato
			// app.dialogVersioning.querySelector('div[data-id="versioning-content"]:not([data-object="metrics"])').setAttribute('hidden', true);
			app.dialogVersioning.querySelector('div[data-id="versioning-content"]:not([hidden])').setAttribute('hidden', true);
		}
		e.target.setAttribute('selected', true);
		// app.fetchAPIRequestVersioning('/fetch_api/versioning/metrics');
		document.querySelector('div[data-object="metrics"]').removeAttribute('hidden');
	}
		
	app.btnFilters.onclick = (e) => {
		if (document.querySelector('#nav-objects a[selected]')) {
			document.querySelector('#nav-objects a[selected]').removeAttribute('selected');
			// nascondo il div che contiene gli elementi dell'oggetto precedentemente selezionato
			app.dialogVersioning.querySelector('div[data-id="versioning-content"]:not([hidden])').setAttribute('hidden', true);
		}
		e.target.setAttribute('selected', true);
		document.querySelector('div[data-object="filters"]').removeAttribute('hidden');
		// app.fetchAPIRequestVersioning('/fetch_api/versioning/filters');
	}
	
	app.btnProcesses.onclick = (e) => {
		if (document.querySelector('#nav-objects a[selected]')) {
			document.querySelector('#nav-objects a[selected]').removeAttribute('selected');
			// nascondo il div che contiene gli elementi dell'oggetto precedentemente selezionato
			app.dialogVersioning.querySelector('div[data-id="versioning-content"]:not([hidden])').setAttribute('hidden', true);
		}
		e.target.setAttribute('selected', true);
		document.querySelector('div[data-object="processes"]').removeAttribute('hidden');
		// app.fetchAPIRequestVersioning('/fetch_api/versioning/processes');
	}
	
})();