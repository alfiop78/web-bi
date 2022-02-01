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
    	// debugger;
    	const warningElements = app.dialogVersioning.querySelectorAll('.versioning-status > .vers-status > i.md-warning');
    	const doneElements = app.dialogVersioning.querySelectorAll('.versioning-status > .vers-status > i.md-done'); // elementi non presenti in locale e scaricati da DB
    	const unmodifiedElements = app.dialogVersioning.querySelectorAll('.versioning-status > .vers-status > i.md-status'); // elementi non modificati perchè sincronizzati con il DB
    	// console.log('warningElements : ', warningElements.length);
    	let popupsMessage = '';
    	// debugger;
    	if (warningElements.length !== 0) {
    		app.btnVersioningStatus.classList.add('md-warning');
    		popupsMessage = `<p>${warningElements.length} elementi non sincronizzati</p>`;
    	}
    	if (doneElements.length !== 0) {
    		popupsMessage = `<p>${doneElements.length} elementi nuovi scaricati</p>`;
    	}
		app.btnVersioningStatus.nextElementSibling.innerHTML = popupsMessage+`<p>${unmodifiedElements.length} elementi gi&agrave; sincronizzati</p>`;
    };

    app.getLocalElements = (data) => {
    	// recupero elementi locali
    	for (element in data) {
    		// console.log('element : ', element); // dimensions, cubes, ecc...
    		let objectsSet;
    		// TODO: potrei recuperare anche TUTTI gli oggetti invece di separarli in questo modo
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
				iconStatus.innerText = 'info';
				iconStatus.classList.add('md-attention');
				descrStatus.innerText = 'In locale';
				versioningStatus.querySelector('.vers-title').innerText = el;
				sectionSearchable.setAttribute('data-search', 'versioning-db-search');
				sectionSearchable.setAttribute('data-object-type', 'local');
				sectionSearchable.setAttribute('label', el);
				// icona per recuperare manualmente l'elemento
				actions.querySelector('.popupContent[data-upload]').removeAttribute('hidden');
				actions.querySelector('.popupContent[data-upload] i[data-id="btn-upload-local-object"]').setAttribute('data-object-name', el);
				actions.querySelector('.popupContent[data-upload] i[data-id="btn-upload-local-object"]').setAttribute('data-object-type', element);
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
	    					iconStatus.innerText = 'remove';
	    					iconStatus.classList.add('md-status'); // darkgrey
	    					descrStatus.innerText = 'Sincronizzato con DB';
	    				} else {
	    					// elemento presente ma contenuto diverso dal DB, da aggiornare manualmente
	    					iconStatus.innerText = 'clear';
	    					iconStatus.classList.add('md-warning'); // brown
	    					descrStatus.innerText = 'Non sincronizzato';
	    					// icona per recuperare manualmente l'elemento
	    					actions.querySelector('.popupContent[data-download]').removeAttribute('hidden');
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
				sectionSearchable.setAttribute('data-object-type', 'db');
				sectionSearchable.setAttribute('data-search', 'versioning-db-search');
				sectionSearchable.setAttribute('label', jsonParsed.name);
				parent.appendChild(sectionSearchable);
	    	});
    	}

    	// dopo aver caricato tutti gli elementi nella dialog versioning, imposto il colore del tasto btnVersioningStatus in base allo status degli elementi
    	app.checkVersioning();
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
        // await fetch(url)
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
              console.log('ELEMENTO SALVATO CORRETTAMENTE');
            } else {
              console.error('Elemento non salvato su DB');
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
    			app.saveObjectOnDB(e.target.getAttribute('data-object-name'), e.target.getAttribute('data-object-type'))
    			break;
			default:
				break;
    	}
    });

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
    	// TODO: nascondo i div che hanno data-objects diverso da 'dimensions'
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
    
    app.btnSwitchLocalDB.onclick = (e) => {
    	console.log('e.target : ', e.target);
    	// const span = e.target.parentElement.querySelector('span');
    	if (e.target.checked) {
    		// abilitato : Visualizzo solo gli elementi in locale
    		// span.innerText = 'Locale';
    		app.dialogVersioning.querySelectorAll('.versioning-content > section[data-object-type="db"]').forEach( (el) => el.setAttribute('hidden', true));
    		app.dialogVersioning.querySelectorAll('.versioning-content > section[data-object-type="local"]').forEach( (el) => el.removeAttribute('hidden'));
    	} else {
    		// disabilitato : visualizzo elementi su DB (default)
    		// span.innerText = 'Database';
    		app.dialogVersioning.querySelectorAll('.versioning-content > section[data-object-type]').forEach( (el) => el.removeAttribute('hidden', true));
    	}
    };

    
})();
