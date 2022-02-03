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
		btnVersioningStatus : document.getElementById('versioning-status')
	};

	App.init();

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
		const parent = app.btnVersioningStatus.nextElementSibling;
		if (warningElements.length !== 0) {
			let p = document.createElement('p');
			p.innerHTML = (warningElements.length === 1) ? `&Eacute; presente ${warningElements.length} elemento in conflitto` : `Sono presenti ${warningElements.length} elementi in conflitto`;
			parent.appendChild(p);
			let small = document.createElement('small');
			small.innerHTML = 'Elementi presenti in ambiente di Produzione / Sviluppo.<br>La copia in Sviluppo è diversa da quella in Produzione.'
			p.appendChild(small);
		}
		if (attentionElements.length !== 0) {
			let p = document.createElement('p');
			p.innerHTML = (attentionElements.length === 1) ? `&Eacute; presente ${attentionElements.length} nuovo elemento in locale, (non sincronizzato)` :
				`Sono presenti ${attentionElements.length} nuovi elementi in locale (non sincronizzato)`;
			parent.appendChild(p);
			let small = document.createElement('small');
			small.innerHTML = 'Elementi presenti in ambiente di Sviluppo.<br>Questi elementi, una volta terminata la fase di Sviluppo, potranno essere "versionati" in Produzione.'
			p.appendChild(small);
		}
		if (doneElements.length !== 0) {
			let p = document.createElement('p');
			p.innerHTML = (doneElements.length === 1) ? `&Eacute; stato scaricato ${doneElements.length} nuovo elemento in locale` :
				`Sono stati scaricati ${doneElements.length} nuovi elementi in locale`;
			parent.appendChild(p);
			let small = document.createElement('small');
			small.innerHTML = 'Elementi non presenti in ambiente di Sviluppo.<br>Questi elementi vengono sincronizzati automaticamente.'
			p.appendChild(small);
		} else {
			let p = document.createElement('p');
			p.innerHTML = 'Nessun nuovo elemento scaricato';
			parent.appendChild(p);
			let small = document.createElement('small');
			small.innerHTML = 'Elementi non presenti in ambiente di Sviluppo.<br>Questi elementi vengono sincronizzati automaticamente.'
			p.appendChild(small);
		}
		if (unmodifiedElements.length !== 0) {
			let p = document.createElement('p');
			p.innerHTML = (unmodifiedElements.length === 1) ? `&Eacute; presente ${unmodifiedElements.length} elemento già sincronizzato` :
				`Sono presenti ${unmodifiedElements.length} elementi già sincronizzati`;
			parent.appendChild(p);
			let small = document.createElement('small');
			small.innerHTML = 'Elementi già sincronizzati'
			p.appendChild(small);
		}
	};

	app.getLocalElements = (data) => {
		// recupero elementi locali
		for (element in data) {
			// console.log('element : ', element); // dimensions, cubes, ecc...
			let objectsSet;
			switch (element) {
				case 'dimensions':
					objectsSet = storage.dimensions;
					break;
				case 'cubes':
					objectsSet = storage.cubes;
					break;
				case 'filters':
					objectsSet = storage.filters;
					break;
				case 'metrics':
					objectsSet = storage.metrics;
					break;
				default:
					objectsSet = storage.processes;
					break;
			}
			console.log('objectsSet : ', objectsSet);
			// debugger;
			data[element].forEach( (el) => {
				// se l'elemento in local è già presente sul DB lo elimino dal Set dimensions, gli elementi rimanenti da questa operazione andranno ad aggiungersi alla Dialog Versioning
				// ... questi sono elemeneti che si trovano SOLO in local, es.: in fase di sviluppo in locale
				 if (objectsSet.has(el.name)) objectsSet.delete(el.name);
			});
			// console.log('objectsSet', objectsSet);
			objectsSet.forEach( (el) => {
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
				versioningStatus.querySelector('.vers-title').innerText = el;
				sectionSearchable.setAttribute('data-search', 'versioning-db-search');
				sectionSearchable.setAttribute('data-object-storage', 'local');
				sectionSearchable.setAttribute('data-object-type', element);
				sectionSearchable.setAttribute('data-object-name', el);
				sectionSearchable.setAttribute('label', el);
				// icona per recuperare manualmente l'elemento
				actions.querySelector('.popupContent[data-upload]').removeAttribute('hidden');
				actions.querySelector('.popupContent[data-upload] i[data-id="btn-upload-local-object"]').setAttribute('data-object-name', el);
				actions.querySelector('.popupContent[data-upload] i[data-id="btn-upload-local-object"]').setAttribute('data-object-type', element);
				// imposto, sull'icona delete, gli attributi per eseguire la cancellazione. Aggiungo un ulteriore attributo per differenziare gli elementi in localStorage da quelli su DB.
				actions.querySelector('.popupContent[data-delete] i[data-id="btn-delete"]').setAttribute('data-object-name', el);
				actions.querySelector('.popupContent[data-delete] i[data-id="btn-delete"]').setAttribute('data-object-type', element);
				// NOTE: se è presente l'attributo data-object-storage, l'elemento deve essere eliminato SOLO dal LocalStorage, altrimenti sia dal LocalStorage che dal DB.
				actions.querySelector('.popupContent[data-delete] i[data-id="btn-delete"]').setAttribute('data-object-storage', true);
				parent.appendChild(sectionSearchable);
			});
		}
	};

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

				const jsonParsed = JSON.parse(el.json_value);
				// se l'elemento recuperato dal DB è già presente in localStorage, ed è diverso, non lo aggiorno, si potrà scegliere di aggiornarlo/sovrascriverlo successivamente
				// console.log(jsonParsed.name);
				// console.log(JSON.parse(window.localStorage.getItem(jsonParsed.name)).name);
			
				// verifico prima se è presente l'elemento nello storage altrimenti nella if ho un errore a causa della prop 'name', se non esiste un determinato Elemento
				if (JSON.parse(window.localStorage.getItem(jsonParsed.name))) {
					if ( jsonParsed.name === JSON.parse(window.localStorage.getItem(jsonParsed.name)).name ) {
						// se l'elemento è già presente in locale verifico anche se il suo contenuto è uguale a quello del DB
						// console.log('elemento già presente in locale', jsonParsed.name);
						if (el.json_value === window.localStorage.getItem(jsonParsed.name)) {
							// console.info('UGUALE CONTENTUO JSON, ELEMENTO RESTA INVARIATO IN LOCALE');
							iconStatus.innerText = 'sync';
							iconStatus.classList.add('md-status'); // darkgrey
							descrStatus.innerText = 'Sincronizzato';
							// icona delete
							actions.querySelector('.popupContent[data-delete] i[data-id="btn-delete"]').setAttribute('data-object-name', jsonParsed.name);
							actions.querySelector('.popupContent[data-delete] i[data-id="btn-delete"]').setAttribute('data-object-type', element);
						} else {
							// elemento presente ma contenuto diverso dal DB, da aggiornare manualmente
							iconStatus.innerText = 'sync_problem';
							iconStatus.classList.add('md-warning'); // brown
							descrStatus.innerText = 'Non sincronizzato';
							// icona per recuperare manualmente l'elemento
							actions.querySelector('.popupContent[data-download]').removeAttribute('hidden');
							actions.querySelector('.popupContent[data-download] i[data-id="btn-download"]').setAttribute('data-object-name', jsonParsed.name);
							actions.querySelector('.popupContent[data-download] i[data-id="btn-download"]').setAttribute('data-object-type', element);
							// icona per versionare da Sviluppo->Produzione
							actions.querySelector('.popupContent[data-upgrade]').removeAttribute('hidden');
							actions.querySelector('.popupContent[data-upgrade] i[data-id="btn-upgrade-production"]').setAttribute('data-object-name', jsonParsed.name);
							actions.querySelector('.popupContent[data-upgrade] i[data-id="btn-upgrade-production"]').setAttribute('data-object-type', element);
						}
					}
				} else {
					// elemento non presente in locale, lo salvo direttamente
					window.localStorage.setItem(jsonParsed.name, el.json_value);
					iconStatus.innerText = 'done';
					iconStatus.classList.add('md-done');
					descrStatus.innerText = 'Aggiornato';
				}
				versioningStatus.querySelector('.vers-title').innerText = jsonParsed.name;
				sectionSearchable.setAttribute('data-object-type', element);
				sectionSearchable.setAttribute('data-object-name', jsonParsed.name);
				// icona delete
				actions.querySelector('.popupContent[data-delete] i[data-id="btn-delete"]').setAttribute('data-object-name', jsonParsed.name);
				actions.querySelector('.popupContent[data-delete] i[data-id="btn-delete"]').setAttribute('data-object-type', element);
				sectionSearchable.setAttribute('data-search', 'versioning-db-search');
				sectionSearchable.setAttribute('label', jsonParsed.name);
				parent.appendChild(sectionSearchable);
			});
		}
	};

	// promise.all, recupero tutti gli elementi presenti sul DB (dimensioni, cubi, filtri, ecc...)
	app.fetchAPIRequestVersioningAll = async () => {
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
				// console.log('elementData : ', elementData);
				app.createVersioningElements(elementData);
				// controllo inverso, recupero gli elementi in locale che non sono presenti sul DB (es.: Dimensioni e cubi in fase di sviluppo)
				app.getLocalElements(elementData);
			});
			// dopo aver caricato tutti gli elementi nella dialog versioning, imposto il colore del tasto btnVersioningStatus in base allo status degli elementi
			app.checkVersioning();
		} )
		.catch( err => console.error(err));
	};

	app.fetchAPIRequestVersioningAll();

	app.saveObjectOnDB = async (name, type) => {
		// console.log(window.localStorage.getItem(name));
		let url;
		// const json = JSON.stringify(window.localStorage.getItem(name));
		const json = window.localStorage.getItem(name);
		// console.log('json', json);
		// console.log('json', window.localStorage.getItem(name));
		// console.log('json', JSON.stringify(window.localStorage.getItem(name)));
		switch (type) {
			case 'dimensions':
				url = '/fetch_api/json/'+json+'/dimension_store';
				break;
			case 'cubes':
				url = '/fetch_api/json/'+json+'/cube_store';
				break;
			case 'filters':
				url = '/fetch_api/json/'+json+'/filter_store';
				break;
			case 'metrics':
				url = '/fetch_api/json/'+json+'/metric_store';
				break;
			default:
				url = '/fetch_api/json/'+json+'/process_store';
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
					console.log(name,' SALVATO CORRETTAMENTE');
					// reimposto l'icona in .vers-status
					const sectionElement = app.dialogVersioning.querySelector("section[data-object-name='" + name + "'][data-object-type='" + type + "']");
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
	};

	app.deleteObjectOnDB = async (name, type) => {
		let url;
		// const json = JSON.stringify(window.localStorage.getItem(name));
		// const json = window.localStorage.getItem(name);
		// console.log('json', json);
		// console.log('json', window.localStorage.getItem(name));
		// console.log('json', JSON.stringify(window.localStorage.getItem(name)));
		switch (type) {
			case 'dimensions':
				url = '/fetch_api/name/'+name+'/dimension_destroy';
				break;
			case 'cubes':
				url = '/fetch_api/name/'+name+'/cube_destroy';
				break;
			case 'filters':
				url = '/fetch_api/name/'+name+'/filter_destroy';
				break;
			case 'metrics':
				url = '/fetch_api/name/'+name+'/metric_destroy';
				break;
			default:
				url = '/fetch_api/name/'+name+'/process_destroy';
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
					app.dialogVersioning.querySelector("section[data-object-type='" + type + "'][data-object-name='" + name + "']").remove();
				} else {
					console.error("Problema con l'eliminazione dell'elemento");
				}
			})
		.catch((err) => console.error(err));
	};

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
	};

	app.upgradeObjectOnDB = async (name, type) => {
		let url;
		const json = window.localStorage.getItem(name);
		switch (type) {
			case 'dimensions':
				url = '/fetch_api/json/'+json+'/dimension_update';
				break;
			case 'cubes':
				url = '/fetch_api/json/'+json+'/cube_update';
				break;
			case 'filters':
				url = '/fetch_api/json/'+json+'/filter_update';
				break;
			case 'metrics':
				url = '/fetch_api/json/'+json+'/metric_update';
				break;
			default:
				url = '/fetch_api/json/'+json+'/process_update';
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
					console.log('AGGIORNAMENTO AVVENUTO CON SUCCESSO!');
					debugger;
					const sectionElement = app.dialogVersioning.querySelector("section[data-object-name='" + name + "'][data-object-type='" + type + "']");
					console.log('sectionElement : ', sectionElement);
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
	};

	// events

	app.dialogVersioning.addEventListener('click', (e) => {
		// console.log('e.target : ', e.target);
		switch (e.target.getAttribute('data-id')) {
			case 'btn-upload-local-object':
				// tasto upload
				console.log('btn upload');
				console.log('e.target : ', e.target);
				app.saveObjectOnDB(e.target.getAttribute('data-object-name'), e.target.getAttribute('data-object-type'));
				break;
			case 'btn-delete':
				console.log('btn delete');
				console.log('e.target : ', e.target);
				// elimino l'elemento sia dal localStorage che dal DB. Se è presente l'attributo data-object-storage elimino questo elemento SOLO dallo storage locale (non da DB)
				if (e.target.hasAttribute('data-object-storage')) {
					window.localStorage.removeItem(e.target.getAttribute('data-object-name'));
					const type = e.target.getAttribute('data-object-type');
					const name = e.target.getAttribute('data-object-name');
					// elimino anche dal DOM l'elemento
					app.dialogVersioning.querySelector("section[data-object-type='" + type + "'][data-object-name='" + name + "']").remove();
				} else {
					app.deleteObjectOnDB(e.target.getAttribute('data-object-name'), e.target.getAttribute('data-object-type'));
				}
				break;
			case 'btn-download':
				// download, scarico l'elemento in locale, sovrascrivendo l'elemento già presente
				app.downloadObjectFromDB(e.target.getAttribute('data-object-name'), e.target.getAttribute('data-object-type'));
				break;
			case 'btn-upgrade-production':
				// aggiornamento dell'elemento, sovrascrivo l'elemento presente su DB tramite quello in localStorage
				app.upgradeObjectOnDB(e.target.getAttribute('data-object-name'), e.target.getAttribute('data-object-type'));
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
	};

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