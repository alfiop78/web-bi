/*
La classe recupera il local storage ad ogni accesso alla pagina e contiene Metodi per recuperare ad esempio solo i CUBE o solo le DIMENSION, ecc...
*/
class Storages {

	constructor() {
		this.storage = window.localStorage;
		this.storageKeys = Object.keys(window.localStorage);
		// this.cubeId = this._cubeId;
		this.JSONData = null;
	}

	set save(value) {
		// salvo nello storage
		window.localStorage.setItem(value.name, JSON.stringify(value));
	}

	set reportConfig(value) {
		window.localStorage.setItem(Object.keys(value), JSON.stringify(value[Object.keys(value)]));
	}

	// set dimension(value) {
	//   // console.log(Object.keys(value));
	//   // console.log(value.title);
	//   //
	//   window.localStorage.setItem(value.title, JSON.stringify(value));
	//   this.dimensionName = value.title;
	// }

	// // restituisco il nome della dimensione
	// get dimension() {return this.dimensionName;}

	JSONFormat(name) {
		// restituisco un object convertito in json, questo mi servirà per ricostruire la struttura
		return JSON.parse(window.localStorage.getItem(name));
	}
}

class CubeStorage extends Storages {
	#cubeSelected = new Set();
	#name;
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
	}

	get cubes() {return this._cubes;}

	set cubeId(value) {this.id = value;}

	get cubeId() {return this.id;}

	set selected(value) {
		// imposto il cubo selezionato
		this.#name = value;
	}

	get selected() {
		return JSON.parse(this.storage.getItem(this.#name));
	}

	addCube() {
		this.#cubeSelected.add(this.selected.FACT);
		console.log('#cubeSelected : ', this.#cubeSelected);
	}

	deleteCube() {
		this.#cubeSelected.delete(this.selected.FACT);
		console.log('#cubeSelected : ', this.#cubeSelected);
	}

	get cubeSelected() {return this.#cubeSelected;}

	getIdAvailable() {
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
			// TODO: cosa sono a e b ?
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
	}

	// da rivedere quando viene utilizzata
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
	constructor() {
		super();
		this.processes = {}; // lista dei process presenti nello storage
		this.id = 0; // default
		// imposto la lista dei cubi in this.cubes
		this.storageKeys.forEach((key) => {
			let jsonStorage = JSON.parse(this.storage.getItem(key));
			// console.log(key);
			if (jsonStorage.type === 'PROCESS') {
				let reportProperties = {'name' : key, 'processId' : jsonStorage.processId};
				// reports.push(reportProperties);
				this.processes[key] = reportProperties;
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
		// TODO: cerco il primo id "libero"
		// ordino l'array
		this.elements.sort(function (a, b) {
			// console.log(a);
			// console.log(b);
			// TODO: cosa sono a e b ?
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

	list(template, ul) {
		for (let process in this.processes) {
			// console.log(proc);
			// console.log(toBeProcessed[proc]);
			console.log('template : ', template);
			const content = template.content.cloneNode(true);
			let section = content.querySelector('section[data-no-icon]');
			section.hidden = false;
			let li = section.querySelector('li');
			li.innerText = process;
			li.setAttribute('label', process);
			li.setAttribute('data-id', this.processes[process]['processId']);
			ul.appendChild(section);
		}
	}

	getJSONProcess(value) {
		let processReports = {};
		let report = JSON.parse(this.storage.getItem(value));
		return report.process;
	}
}

class DimensionStorage extends Storages {
	#dimensions = new Map();
	#name;
	// Metodi per leggere/scrivere Dimensioni nello Storage
	// TODO: da completare in base alla logica di PageStorage
	constructor() {
		super();
		// this.#dimensions = new Set();
		this._dimensions = {}; // lista dimensioni presenti nello storage
		this.id = 0; // default
		// this.#name;
		this.storageKeys.forEach((key) => {
			let jsonStorage = JSON.parse(this.storage.getItem(key));
			// console.log(key);
			if (jsonStorage.type === 'DIMENSION') {
				this._dimensions[key] = jsonStorage;
				// console.log('this._dimensions : ', this._dimensions);
			}
		});
	}

	set dimensionId(value) {
		this.id = value;
	}

	get dimensionId() { return this.id; }

	set selected(value) {
		// imposto la dimensione selezionata
		this.#name = value;
		console.log('#name : ', this.#name);
	}

	get selected() {
		return JSON.parse(this.storage.getItem(this.#name));
	}

	add() {
		// creo un object con le dimensioni che sono state selezionate
		this.#dimensions.set(this.#name, this.selected.from);
		console.log('#dimensions : ', this.#dimensions);
	}

	delete() {
		this.#dimensions.delete(this.#name);
		console.log('#dimensions : ', this.#dimensions);
	}

	get selectedDimensions() {return this.#dimensions;}

	list() {
		// let dimensions = [];
		let dimObj = {};
		this.storageKeys.forEach((key) => {
			// console.log(key);
			let jsonStorage = JSON.parse(this.storage.getItem(key));
			// console.log(jsonStorage);
			// console.log(jsonStorage.type);
			if (jsonStorage.type === 'DIMENSION') {
				// console.log(key);
				dimObj[key] = jsonStorage.from;
			}
		});
		// return dimensions;
		return dimObj;
	}

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
			// TODO: cosa sono a e b ?
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

	get dimensions() {return this._dimensions;}


}

class FilterStorage extends Storages {
	constructor() {
		super();
		this._filters = {};
		this.storageKeys.forEach((key) => {
			let jsonStorage = JSON.parse(this.storage.getItem(key));
			// console.log(key);
			if (jsonStorage.type === 'FILTER') {
				this._filters[key] = jsonStorage;
			}
		});
		this.id = 0; // default
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

	//  list(table) {
		// // ottengo la lista dei filtri create
		// this.filters = {};
		// this.storageKeys.forEach((key) => {
		//   let jsonStorage = JSON.parse(this.storage.getItem(key));
		//   // console.log(key);
		//   if (jsonStorage.type === "FILTER" && jsonStorage.table === table) {
		// 	this.filters[key] = jsonStorage.formula;
		//   }
		// });
		// return this.filters;
	//  }

	getIdAvailable() {
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
			// TODO: cosa sono a e b ?
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
	}

	get filters() {return this._filters;} // tutti i filtri

	tableFilters(table) {
		// console.clear();
		// recupero tutti i filtri appartenenti alla table e restituisco un array
		// console.log(table);
		this._tableFilters = [];
		for ( const [key, value] of Object.entries(this._filters)) {
			if (value.table === table) {
				this._tableFilters.push(value);
			}
		}
		return this._tableFilters;
	}
}

class MetricStorage extends Storages {
	constructor() {
		super();
		this._metrics = {};
		this.storageKeys.forEach((key) => {
			let jsonStorage = JSON.parse(this.storage.getItem(key));
			// console.log(key);
			if (jsonStorage.type === 'METRIC') {
				this._metrics[key] = jsonStorage;
			}
		});
		// console.log('_metrics : ', this._metrics);
		// debugger;
		this.id = 0; // default
	}

	set metricId(value) {this.id = value;}

	get metricId() { return this.id; }

	set metric(value) {this._metric = value;}

	get metric() {return JSON.parse(this.storage.getItem(this._metric));}

	get metrics() {return this._metrics;}

	tableMetrics(table) {
		this._tableMetrics = {};
		for ( const [key, value] of Object.entries(this._metrics)) {
			if (value.table === table) {
				this._tableMetrics.push(value);
			}
		}
		return this._tableMetrics;
	}

	/*list(table) {
		// ottengo la lista delle pagine create
		this.metrics = {};
		this.storageKeys.forEach((key) => {
			let jsonStorage = JSON.parse(this.storage.getItem(key));
			// console.log(key);

			// if (jsonStorage.type === "METRIC" && jsonStorage.formula.table === table) {

			//   this.metrics[key] = jsonStorage.formula;
			// }

			if (jsonStorage.type === "METRIC") {
				console.log(jsonStorage.formula[key].table);
				if (jsonStorage.formula[key].table === table) {
					this.metrics[key] = jsonStorage.formula[key];
				}
			}
		});
		debugger;
		return this.metrics;
	}*/

}
