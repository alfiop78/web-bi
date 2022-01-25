var App = new Application();
var cube = new Cube();
var StorageCube = new CubeStorage();
var dimension = new Dimension();
(() => {
	var app = {
		// btn
		btnReport : document.getElementById('mdc-report'),
		btnMapping : document.getElementById('mdc-mapping'),
		tmplVersioningDB : document.getElementById('versioning-db')
	};

	App.init();

	app.getDimensions = () => {
		// recupero la lista delle dimensioni in localStorage
		const dimension = new DimensionStorage();
		// dimensions : è un Object che contiene un array con le tabelle incluse nella dimensione
		const dimensions = dimension.list();
		const tmplDimension = document.getElementById('dimension');
		for (const [key, value] of Object.entries(dimensions)) {
			let tmplContent = tmplDimension.content.cloneNode(true);
			let div = tmplContent.querySelector('.dimensions');
			div.querySelector('h5').innerHTML = key;

			div.querySelector('h5').setAttribute('label', key);
			document.querySelector('#dimensions').appendChild(div);
			div.querySelector('h5').onclick = app.handlerDimensionSelected;

			// aggiungo anche le tabelle all'interno ella dimensione
			// console.log(obj[dimName]); // valore/i
			const tmplMiniCard = document.getElementById('miniCard');

			value.forEach( (table) => {
				let contentMiniCard = tmplMiniCard.content.cloneNode(true);
				let miniCard = contentMiniCard.querySelector('.miniCard');
				miniCard.querySelector('h6').innerHTML = table;
				// console.log(table);
				div.appendChild(miniCard);
			});
		}
	};

	// recupero la lista dei Cubi in localStorage
	app.getCubes = () => {
		const ul = document.getElementById('cubes');
		StorageCube.list(ul);
		// associo la Fn che gestisce il click sulle <li>
		ul.querySelectorAll('li').forEach( (li) => li.addEventListener('click', app.handlerCubeSelected) );
	};

	app.handlerCubeSelected = (e) => {
		// apro la tabella definita come Cubo
		console.log('e.currentTarget : ', e.currentTarget);
		debugger;
		StorageCube.selected = e.currentTarget.getAttribute('label');
		console.log('cube selected : ', StorageCube.selected);
		// ridefinisco le proprietà del cubo, leggendo da quello selezionato, nello storage, per consentirne la modifica o l'aggiunto di dimensioni al cubo
		cube._metrics = StorageCube.selected.metrics;
		debugger;
		StorageCube.selected.associatedDimensions.forEach( (dim) => {
			cube.associatedDimensions = dim;
		});
		app.addCard(StorageCube.selected.FACT, true);
		// visualizzo il tasto saveOpenedCube al posto di SaveCube
		app.btnSaveOpenedCube.parentElement.toggleAttribute('hide');
		// nascondo btnSaveCube
		app.btnSaveCube.parentElement.toggleAttribute('hide');
	};

	// recupero lo stato delle dimensioni per il versionamento
	app.getSyncVersioning = async () => {
		await fetch('/fetch_api/versioning/dimensions')
			.then( (response) => {
				if (!response.ok) {throw Error(response.statusText);}
				return response;
			})
			.then( (response) => response.json())
			.then( (data) => {
                console.log(data);
		        if (data) {
		        	// ciclo le dimensioni per inserirle nella dialog #versioning ed anche nello storage in locale
		        	for (element in data) {
		        		console.log('element : ', element);
		        		// console.log(data[element]);
		        		data[element].forEach( (el) => {
		        			// template
		        			const tmplContent = app.tmplVersioningDB.content.cloneNode(true);
		        			let versioningStatus = tmplContent.querySelector('.versioning-status');
		        			let iconStatus = versioningStatus.querySelector('i');
		        			let descrStatus = versioningStatus.querySelector('.vers-status-descr');
		        			let action = versioningStatus.querySelector('.vers-actions');
		        			const parent = document.querySelector("section[data-"+element+"] div[data-id='versioning-content']"); // element in ciclo vale "dimensions" e "cubes"

		        			const jsonParsed = JSON.parse(el.json_value);
		        			// se l'elemento recuperato dal DB è già presente in localStorage, ed è diverso, non lo aggiorno, si potrà scegliere di aggiornarlo/sovrascriverlo da un altro tasto
		        			// console.log(jsonParsed.name);
		        			// console.log(JSON.parse(window.localStorage.getItem(jsonParsed.name)).name);
		        			
		        			// verifico prima se è presente l'elemento nello storage altrimenti nella if ho un errore a causa della prop 'name'
		        			if (JSON.parse(window.localStorage.getItem(jsonParsed.name))) {
		        				if ( jsonParsed.name === JSON.parse(window.localStorage.getItem(jsonParsed.name)).name ) {
			        				// se l'elemento è già presente in locale verifico anche se il suo contenuto è uguale a quello del DB
			        				console.log('elemento già presente in locale', jsonParsed.name);
			        				if (el.json_value === window.localStorage.getItem(jsonParsed.name)) {
			        					console.info('UGUALE CONTENTUO JSON, ELEMENTO NON AGGIORNATO');
			        					iconStatus.innerText = 'remove';
			        					iconStatus.classList.add('md-darkgray');
			        					descrStatus.innerText = 'Sincronizzato con DB';
			        				} else {
			        					// elemento presente ma contenuto diverso dal DB, da aggiornare manualmente
			        					iconStatus.innerText = 'clear';
			        					iconStatus.classList.add('md-indianred');
			        					descrStatus.innerText = 'Non sincronizzato';
			        					action.innerHTML = "Sovrascrivi copia locale";
			        				}
			        			}
		        			} else {
		        				// elemento non presente in locale, lo salvo
								window.localStorage.setItem(jsonParsed.name, el.json_value);
								iconStatus.innerText = 'done';
								iconStatus.classList.add('md-mediumseagreen');
								descrStatus.innerText = 'Aggiornato';
							}
							versioningStatus.querySelector('.vers-title').innerText = jsonParsed.name;
		        			parent.appendChild(versioningStatus);
		        		});
		        	}
		    
		        } else {
		          // TODO: no data, handlerConsoleMessage
		          
		        }
		    })
	    .catch( (err) => console.error(err));
	};

	app.getSyncLocal = () => {

	};

	// app.getDimensions();

    // app.getCubes();

    // recupero dimensioni dal DB e le aggiungo al localStorage
    app.getSyncVersioning();

    app.getSyncLocal();

    //event
    app.btnReport.onclick = () => window.location.href = '/report';

    app.btnMapping.onclick = () => window.location.href = '/mapping';
    
})();
