/*
La classe recupera il local storage ad ogni accesso alla pagina e contiene Metodi per recuperare ad esempio solo i CUBE o solo le DIMENSION, ecc...
*/
class Storages {
	// #dimensions = new Set();
	#dimensionsMap = new Map();
	#cubesMap = new Map();
	#filtersMap = new Map();
	#metricsMap = new Map();
	#processesMap = new Map();
	#cubes = new Set();
	// #storage = {};
	#metrics = new Set();
	#filters = new Set();
	#processes = new Set();
	#all = new Set();
	constructor() {
		this.storage = window.localStorage;
		this.storageKeys = Object.keys(window.localStorage);
		// console.log('storageKeys : ', this.storageKeys);
		// this.cubeId = this._cubeId;
		this.JSONData = null;
	}

	set storageK(value) {
		// value : METRIC, FILTER, DIMENSION, ecc...
		this.st = {}; // TODO: da rinominare in this.storage
		Object.keys(window.localStorage).forEach( key => {
			if (JSON.parse(window.localStorage.getItem(key)).type === value) {
				this.st[key] = JSON.parse(window.localStorage.getItem(key));
			}
		});
	}

	get storageK() {return this.st;}

	get allLocalElements() {
		this.storageKeys.forEach((key) => {
			let jsonStorage = JSON.parse(this.storage.getItem(key));
			// console.log(key);
			this.#all.add(jsonStorage.name);
		});
		return this.#all;
	}

	get dimensions() {
		// recupero gli oggetti DIMENSION dallo storage
		this.storageK = 'DIMENSION';
		for ( const [key, value] of Object.entries(this.st)) {
			this.#dimensionsMap.set(key, value);
		}
		return this.#dimensionsMap;
	}

	get cubes() {
		this.storageK = 'CUBE';
		for ( const [key, value] of Object.entries(this.st)) {
			this.#cubesMap.set(key, value);
		}
		return this.#cubesMap;
	}

	get filters() {
		this.storageK = 'FILTER';
		for ( const [key, value] of Object.entries(this.st)) {
			this.#filtersMap.set(key, value);
		}
		return this.#filtersMap;
	}

	get processes() {
		this.storageK = 'PROCESS';
		for ( const [key, value] of Object.entries(this.st)) {
			this.#processesMap.set(key, value);
		}
		return this.#processesMap;
	}

	// viene invocata da init_versioning.js
	get metrics() {
		this.storageK = 'METRIC';
		for ( const [key, value] of Object.entries(this.st)) {
			this.#metricsMap.set(key, value);
		}
		return this.#metricsMap;
	}

	set save(value) {
		// salvo nello storage
		window.localStorage.setItem(value.name, JSON.stringify(value));
	}

	// TODO: sostituirà save()
	saveTemp(value) {
		console.info('SAVE : ', value);
		window.localStorage.setItem(value.token, JSON.stringify(value));	
	}

	JSONFormat(name) {
		// restituisco un object convertito in json, questo mi servirà per ricostruire la struttura
		return JSON.parse(window.localStorage.getItem(name));
	}
}

class CubeStorage extends Storages {
	#cubeSelected = new Set();
	#cube;
	#lists = {};
	constructor() {
		super();
		this._cubes = {}; // lista dei cubi presenti nello storage
		this.id = 0; // default
		// imposto la lista dei cubi in this.cubes
		this.storageKeys.forEach((key) => {
			let jsonStorage = JSON.parse(this.storage.getItem(key));
			if (jsonStorage.type === 'CUBE') {
				this._cubes[key] = jsonStorage;
				// this._cubes[key] = {'id' : jsonStorage['id'], 'FACT' : jsonStorage['FACT'], 'key' : key};
			}
		});
		// console.log('cubes : ', this._cubes);
	}

	setLists() {
		this.storageKeys.forEach((key) => {
			let jsonStorage = JSON.parse(this.storage.getItem(key));
			if (jsonStorage.type === 'CUBE') {
				this.#lists[key] = jsonStorage;
			}
		});
	}

	getLists() {
		this.setLists();
		return this.#lists;
	}

	set cube(value) {
		// imposto il cubo selezionato
		this.#cube = value;
	}

	get cube() {
		return JSON.parse(this.storage.getItem(this.#cube));
	}

	// TODO: quando viene utilizzata ?
	addCube() {
		this.#cubeSelected.add(this.selected.FACT);
		console.log('#cubeSelected : ', this.#cubeSelected);
	}

	deleteCube() {
		this.#cubeSelected.delete(this.selected.FACT);
		console.log('#cubeSelected : ', this.#cubeSelected);
	}

	get cubeSelected() {return this.#cubeSelected;}

	/*getIdAvailable() {
		// ottengo il primo Id disponibile
		console.log(this.storageKeys);
		this.cubesElement = [];
		this.storageKeys.forEach((key) => {
			let jsonStorage = JSON.parse(this.storage.getItem(key));
			// console.log(jsonStorage);

			if (jsonStorage.type === 'CUBE') {
				// ottengo il numero di elementi CUBE nello storage
				this.cubesElement.push(jsonStorage.id);
			}
		});

		// ordino l'array
		this.cubesElement.sort(function (a, b) {
			// console.log(a);
			// console.log(b);
			return a - b;
		});
		// this.pagesElement.sort((a, b) => a - b);

		for (let i = 0; i < this.cubesElement.length; i++) {
			// indice 0
			// se 0 è presente in pagesElement aggiungo una unità
			// console.log(this.pagesElement.includes(i));

			if (this.cubesElement.includes(i)) {
				this.id++;
				// console.log(this.id);
			} else {
				this.id = i;
			}
		}
		return this.id;
	}*/

	list(ul) {
		for (const [key, value] of Object.entries(this._cubes)) {
			let element = document.createElement('div');
			element.className = 'element';
			element.setAttribute('label', key);
			let li = document.createElement('li');
			li.innerText = key;
			li.setAttribute('label', key);
			// li.setAttribute('data-list-type', 'dimensions'); // questo influenza la <ul> delle dimensioni
			li.id = 'cube-id-' + value['id'];
			li.setAttribute('data-cube-id', value['id']);
			ul.appendChild(element);
			element.appendChild(li);
		}
	}

	set stringify(value) {this._stringify = value;}

	get stringify() {return this._stringify;}

	set stringifyObject(value) {this._stringify = JSON.stringify(value);}

	get stringifyObject() {return this._stringify;}

	/*json(cubeName) {
		// un object del cube convertito in json, questo mi servirà per ricostruire la struttura
		return JSON.parse(window.localStorage.getItem(cubeName));
	}*/
	getMetrics(cubeName) {
		this._cube = JSON.parse(window.localStorage.getItem(cubeName));
		return this._cube.metrics;
	}

	associatedDimensions(name) {
		let jsonStorage = JSON.parse(this.storage.getItem(name));
		// console.log(jsonStorage);
		if (jsonStorage.type === 'CUBE') {
		  return jsonStorage.associatedDimensions;
		}
	}
}

class ProcessStorage extends Storages {
	#processes = {}; // lista dei process presenti nello storage
	#process;
	constructor() {
		super();
		// this.processes = {}; // lista dei process presenti nello storage
		this.id = 0; // default
		// imposto la lista dei cubi in this.cubes
		this.storageKeys.forEach((key) => {
			let jsonStorage = JSON.parse(this.storage.getItem(key));
			// console.log(key);
			if (jsonStorage.type === 'PROCESS') {
				// let reportProperties = {'name' : key, 'processId' : jsonStorage.processId};
				// this.#processes[key] = reportProperties;
				this.#processes[key] = jsonStorage;
			}
		});
	}

	set processId(value) {this.id = value;}

	get processId() {return this.id;}

	getIdAvailable() {
		// ottengo il primo Id disponibile
		// console.log(this.storageKeys);
		this.elements = [];
		this.storageKeys.forEach((key) => {
			let jsonStorage = JSON.parse(this.storage.getItem(key));
			// console.log(jsonStorage);

			if (jsonStorage.type === 'PROCESS') {
				// ottengo il numero di elementi PROCESS nello storage
				this.elements.push(jsonStorage.processId);
			}
		});
		// ordino l'array
		this.elements.sort(function (a, b) {
			// console.log(a);
			// console.log(b);
			return a - b;
		});

		// this.pagesElement.sort((a, b) => a - b);
		for (let i = 0; i < this.elements.length; i++) {
			// indice 0
			// se 0 è presente in elements aggiungo una unità
			// console.log(this.pagesElement.includes(i));

			if (this.elements.includes(i)) {
				this.id++;
				// console.log(this.id);
			} else {
				this.id = i;
			}
		}
		return this.id;
	}

	set process(value) {this.#process = value;}

	get process() {return JSON.parse(window.localStorage.getItem(this.#process));}

	getJSONProcess(value) {
		let processReports = {};
		let report = JSON.parse(this.storage.getItem(value));
		return report.process;
	}

	get processes() {
		this.storageKeys.forEach((key) => {
			let jsonStorage = JSON.parse(this.storage.getItem(key));
			if (jsonStorage.type === 'PROCESS') {
				this.#processes[key] = jsonStorage;
			}
		});
		return this.#processes;
	}
}

class DimensionStorage extends Storages {
	#dimensions = new Map();
	// #dimsMap = new Map();
	#dimension;
	#name;
	// Metodi per leggere/scrivere Dimensioni nello Storage
	constructor() {
		super();
	}

	// set dimensionId(value) {this.id = value;}

	// get dimensionId() { return this.id; }

	set dimension(value) {
		// imposto la dimensione selezionata
		this.#dimension = value;
		// console.log('#name : ', this.#name);
	}

	get dimension() {
		return JSON.parse(this.storage.getItem(this.#dimension));
	}

	add() {
		// TODO: 2022-05-20 molto probabilmente non utilizzato
		// creo un object con le dimensioni che sono state selezionate
		this.#dimensions.set(this.#name, this.selected.from);
		console.log('#dimensions : ', this.#dimensions);
	}

	delete() {
		this.#dimensions.delete(this.#name);
		console.log('#dimensions : ', this.#dimensions);
	}

	get selectedDimensions() {return this.#dimensions;}

	getIdAvailable() {
		// ottengo il primo Id disponibile
		console.log(this.storageKeys);
		this.dimensionsElement = [];
		this.storageKeys.forEach((key, index) => {
			let jsonStorage = JSON.parse(this.storage.getItem(key));
			// console.log(jsonStorage);

			if (jsonStorage.type === 'DIMENSION') {
				// ottengo il numero di elementi PAGE nello storage
				this.dimensionsElement.push(jsonStorage.id);
			}
		});

		// ordino l'array
		this.dimensionsElement.sort(function (a, b) {
			console.log(a);
			console.log(b);
			return a - b;
		})
		// this.dimensionsElement.sort((a, b) => a - b); versione compatta

		for (let i = 0; i < this.dimensionsElement.length; i++) {
			if (this.dimensionsElement.includes(i)) {
				this.id++;
			} else {
				this.id = i;
			}
		}
		return this.id;
	}

	getFields(table) {
		// resituisco un array con il nome delle tabelle incluse in .columns
		this.item = JSON.parse(this.storage.getItem(this._name));
		this.tables = [];
		for (let table in this.item.from) {
			this.tables.push(table);
		}
		return this.tables;
	}

}

class FilterStorage extends Storages {
	#filters = {};
	constructor() {
		super();
		// this._filters = {};
		this.storageKeys.forEach((key) => {
			let jsonStorage = JSON.parse(this.storage.getItem(key));
			// console.log(key);
			if (jsonStorage.type === 'FILTER') {
				// this._filters[key] = jsonStorage;
				this.#filters[key] = jsonStorage;
			}
		});
		this.id = 0; // default
		// console.log('#filters', this.#filters);
	}

	set filterId(value) {
		this.id = value;
	}

	get filterId() { return this.id; }

	set filter(value) {
		this._name = value;
	}

	get filter() {
		return JSON.parse(this.storage.getItem(this._name));
	}

	/*getIdAvailable() {
		// ottengo il primo Id disponibile
		console.log(this.storageKeys);
		this.filtersElement = [];
		this.storageKeys.forEach((key, index) => {
			let jsonStorage = JSON.parse(this.storage.getItem(key));
			if (jsonStorage.type === "FILTERS") {this.filtersElement.push(jsonStorage.id);}
		});

		// ordino l'array
		this.filtersElement.sort(function (a, b) {
			console.log(a);
			console.log(b);
			return a - b;
		});

		// this.pagesElement.sort((a, b) => a - b);
		for (let i = 0; i < this.filtersElement.length; i++) {
			// indice 0
			// se 0 è presente in pagesElement aggiungo una unità
			// console.log(this.pagesElement.includes(i));

			if (this.filtersElement.includes(i)) {
				this.id++;
				// console.log(this.id);
			} else {
				this.id = i;
			}
		}
		return this.id;
	}*/

	// TODO: utilizzare la stessa logica utilizzata cubeMetrics
	get filters() {return this.#filters;} // tutti i filtri

	// filtri appartenenti a un determinato cubo
	getFiltersByCube(cubeToken) {
		this._tableFilters = new Set();
		for ( const [key, value] of Object.entries(this.#filters)) {
			if (value.cubeToken === cubeToken) {
				this._tableFilters.add(value);
			}
		}
		return this._tableFilters;
	}

	// filtri appartenenti a una determinata dimensione-gerarchia-tabella
	getFiltersByDimension(dimensionToken, hier, table) {
		this._tableFilters = new Set();
		for ( const [key, filter] of Object.entries(this.#filters)) {
			if (filter.dimensionToken === dimensionToken && filter.hier === hier && filter.table === table) {
				this._tableFilters.add(filter);
			}
		}
		return this._tableFilters;
	}

	// filtri appartenenti a una determinata dimensione-gerarchia
	getFiltersByHierarchy(dim, hier) {
		this._tableFilters = [];
		for ( const [key, value] of Object.entries(this.#filters)) {
			if (value.dimension === dim && value.hier === hier) {
				this._tableFilters.push(value);
			}
		}
		return this._tableFilters;
	}

	// filtri appartenenti a una determinata tabella
	getFiltersByTable(table) {
		// console.clear();
		// recupero tutti i filtri appartenenti alla table e restituisco un array
		// console.log(table);
		this._tableFilters = [];
		for ( const [key, value] of Object.entries(this.#filters)) {
			if (value.table === table) {
				this._tableFilters.push(value);
			}
		}
		return this._tableFilters;
	}
}

class MetricStorage extends Storages {
	#metricsObject = {};
	#metric;
	constructor() {
		super();
	}

	// restituisco la lista delle metriche prendendole direttamente dallo stato attuale dello storage
	set cubeMetrics(cubeToken) {
		// recupero gli oggetti METRIC dallo storage
		this.#metricsObject = {};
		super.storageK = 'METRIC';
		for ( const [key, value] of Object.entries(this.st)) {
			if (value.cubeToken === cubeToken) this.#metricsObject[key] = value;
		}
	}

	get cubeMetrics() {return this.#metricsObject;}

	get baseAdvancedMetrics() {
		this.localMetrics = new Set();
		for (const [key, value] of Object.entries(this.#metricsObject) ) {
			if (value.metric_type !== 2) this.localMetrics.add(value);
		}
		return this.localMetrics;
	}

	get compositeMetrics() {
		this.localMetrics = {};
		for (const [key, value] of Object.entries(this.#metricsObject) ) {
			if (value.metric_type === 2) this.localMetrics[key] = value;
		}
		return this.localMetrics;
	}

	set metric(value) {this.#metric = value;}

	get metric() {return JSON.parse(this.storage.getItem(this.#metric));}

}
